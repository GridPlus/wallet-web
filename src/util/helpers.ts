import { bech32 } from "bech32";
import bs58check from "bs58check";
import localStorage from "./localStorage";
import {
  THROTTLE_RATE_LIMIT,
  BTC_PROD_DATA_API,
  RATE_LIMIT,
  BTC_BROADCAST_ENDPOINT,
  HARDENED_OFFSET,
  BTC_PURPOSE_SEGWIT,
  BTC_SEGWIT_NATIVE_V0_PREFIX,
  BTC_PURPOSE_WRAPPED_SEGWIT,
  BTC_WRAPPED_SEGWIT_VERSION,
  BTC_PURPOSE_LEGACY,
  BTC_LEGACY_VERSION,
  BTC_PURPOSE_NONE,
  BTC_DEFAULT_FEE_RATE,
  SATS_TO_BTC,
  BTC_DEV_DATA_API,
  BTC_COIN,
} from "./constants";
import { Buffer } from "buffer";
import { sendErrorNotification } from "./sendErrorNotification";
import { db } from "./btc/db";

// CHAIN DATA SYNCING HELPERS
function fetchJSON(url, opts?) {
  return fetch(url, opts).then((response) => response.json());
}

const resolveAfter = (delay) => new Promise((ok) => setTimeout(ok, delay));

function throttle(fn, delay) {
  let wait: any = Promise.resolve();
  return (...args) => {
    const res = wait.then(() => fn(...args));
    wait = wait.then(() => resolveAfter(delay));
    return res;
  };
}

const throttledFetchJSON = throttle(fetchJSON, THROTTLE_RATE_LIMIT);

// For mainnet (production env) we can bulk request data from the blockchain.com API
async function _fetchBtcUtxos(addresses, utxos = [], offset = 0) {
  if (addresses.length === 0) {
    // No more addresses left to check. We are done.
    return utxos;
  }
  const ADDRS_PER_CALL = 20;
  const MAX_UTOXS_RET = 50;
  const addrsToCheck = addresses.slice(0, ADDRS_PER_CALL);
  let url = `${BTC_PROD_DATA_API}/unspent?active=`;
  for (let i = 0; i < addrsToCheck.length; i++) {
    if (i === 0) {
      url = `${url}${addrsToCheck[i]}`;
    } else {
      url = `${url}|${addrsToCheck[i]}`;
    }
  }
  url = `${url}&limit=${MAX_UTOXS_RET}&confirmations=1`;
  if (offset > 0) {
    // If this is a follow up, fetch txs after an offset
    url = `${url}&offset=${offset}`;
  }
  const data = await fetchJSON(url);
  // Add confirmed UTXOs
  data.unspent_outputs.forEach((u) => {
    if (u.confirmations > 0) {
      utxos.push({
        id: u.tx_hash_big_endian,
        vout: u.tx_output_n,
        value: u.value,
        address: _blockchainDotComScriptToAddr(u.script),
      });
    }
  });
  // Determine if we need to recurse on this set of addresses
  if (data.unspent_outputs.length >= MAX_UTOXS_RET) {
    return setTimeout(() => {
      _fetchBtcUtxos(addresses, utxos, offset + MAX_UTOXS_RET);
    }, RATE_LIMIT);
  }
  // Otherwise we are done with these addresses. Clip them and recurse.
  addresses = addresses.slice(ADDRS_PER_CALL);
  setTimeout(() => {
    _fetchBtcUtxos(addresses, utxos, 0);
  }, RATE_LIMIT);
  return utxos;
}

// For testnet we cannot use blockchain.com - we have to request stuff from each
// address individually.
async function _fetchBtcUtxosTestnet(addresses, utxos = []) {
  const address = addresses.pop();
  const url = `${BTC_DEV_DATA_API}/address/${address}/utxo`;
  const data = await fetchJSON(url);
  data.forEach((u) => {
    // Add confirmed UTXOs
    if (u.status.confirmed) {
      utxos.push({
        id: u.txid,
        vout: u.vout,
        value: u.value,
        address,
      });
    }
  });
  if (addresses.length === 0) {
    return utxos;
  }
  setTimeout(() => {
    _fetchBtcUtxosTestnet(addresses, utxos);
  }, RATE_LIMIT);
}

export async function fetchBtcUtxos(addresses) {
  try {
    if (!addresses) throw new Error("Cannot fetch UTXOs - bad input");
    else if (addresses.length < 1) return [];
    const addrsCopy = JSON.parse(JSON.stringify(addresses));
    const f = BTC_DEV_DATA_API ? _fetchBtcUtxosTestnet : _fetchBtcUtxos;
    const utxos = await f(addrsCopy);
    return utxos;
  } catch (err) {
    console.log("Failed to fetch UTXOs", err);
    sendErrorNotification(err);
  }
}

// For mainnet (production env) we can bulk request data from the blockchain.com API
async function _fetchBtcTxs(addresses, txs, offset = 0, isFirstCall = true) {
  if (addresses.length === 0) {
    // No more addresses left to check. We are done.
    return txs;
  }

  let url = `${BTC_PROD_DATA_API}/multiaddr?active=`;
  let fetchFn = fetchJSON;
  const isSingleAddr = isFirstCall && addresses.length === 1;
  if (isSingleAddr) {
    // Edge case when getting transactions from the blockchain.com API with
    // only one address -- it appears when you call multiaddr with only one
    // address you get only the output(s) associated with that one address,
    // but if you call with multiple addresses that is no longer a problem.
    // See: https://www.blockchain.com/btc/tx/ffc83686c911bcf7aa31a3d3ca014bae3b1044b2ec280c877758aa6b384cde0b
    // 1. https://blockchain.info/rawaddr/3BrvBeRy8qMijfZHzo8VJ77gdL1W9EvgHj
    // 2. https://blockchain.info/multiaddr?active=3C8BhX4CGeyH3nXrYqRL89jvpakTPW1z8k|3BrvBeRy8qMijfZHzo8VJ77gdL1W9EvgHj
    url = `${BTC_PROD_DATA_API}/rawaddr/`;
  }
  const ADDRS_PER_CALL = 20;
  const MAX_TXS_RET = 50;
  const addrsToCheck = addresses.slice(0, ADDRS_PER_CALL);
  for (let i = 0; i < addrsToCheck.length; i++) {
    if (i === 0) {
      url = `${url}${addrsToCheck[i]}`;
    } else {
      url = `${url}|${addrsToCheck[i]}`;
    }
  }
  if (isSingleAddr) {
    url = `${url}?limit=${MAX_TXS_RET}`;
    fetchFn = throttledFetchJSON;
  } else {
    url = `${url}&n=${MAX_TXS_RET}`;
  }
  if (offset > 0) {
    // If this is a follow up, fetch txs after an offset
    url = `${url}&offset=${offset}`;
  }
  const data = await fetchFn(url);
  console.log({ dataTxs: data });
  // Add the new txs
  let txsAdded = 0;
  data.txs.forEach((t) => {
    const ftx = {
      timestamp: t.time * 1000,
      confirmed: !!t.block_index,
      id: t.hash,
      fee: t.fee,
      inputs: [],
      outputs: [],
    };
    t.inputs.forEach((input) => {
      ftx.inputs.push({
        addr: input.prev_out.addr,
        value: input.prev_out.value,
      });
    });
    t.out.forEach((output) => {
      ftx.outputs.push({
        addr: output.addr,
        value: output.value,
      });
    });
    if (!ftx.confirmed) {
      ftx.timestamp = -1;
    }

    // Only add the transaction if its hash is not already in the array.
    // NOTE: There may be an edge case. I noticed in one case we got
    // a result saying `vout_sz=2` but which only had one output in its array...
    let shouldInclude = txs.every((_tx) => _tx.id !== ftx.id);
    if (shouldInclude) {
      txs.push(ftx);
      txsAdded += 1;
    }
  });
  // Determine if we need to recurse on this set of addresses
  if (txsAdded >= MAX_TXS_RET) {
    return setTimeout(() => {
      _fetchBtcTxs(addresses, txs, offset + MAX_TXS_RET, false);
    }, RATE_LIMIT);
  }
  // Otherwise we are done with these addresses. Clip them and recurse.
  addresses = addresses.slice(ADDRS_PER_CALL);
  setTimeout(() => {
    _fetchBtcTxs(addresses, txs, 0, false);
  }, RATE_LIMIT);
  return txs;
}

// For testnet we cannot use blockchain.com - we have to request stuff from each
// address individually.
async function _fetchBtcTxsTestnet(addresses, txs, lastSeenId = null) {
  const address = addresses.pop();
  let url = `${BTC_DEV_DATA_API}/address/${address}/txs`;
  if (lastSeenId) {
    url = `${url}/chain/${lastSeenId}`;
  }
  const data = await fetchJSON(url);
  const formattedTxs: any[] = [];
  let confirmedCount = 0;
  data.forEach((t) => {
    const ftx = {
      timestamp: t.status.block_time * 1000,
      confirmed: t.status.confirmed,
      id: t.txid,
      fee: t.fee,
      inputs: [],
      outputs: [],
    };
    t.vin.forEach((input) => {
      ftx.inputs.push({
        addr: input.prevout.scriptpubkey_address,
        value: input.prevout.value,
      });
    });
    t.vout.forEach((output) => {
      ftx.outputs.push({
        addr: output.scriptpubkey_address,
        value: output.value,
      });
    });
    if (!ftx.confirmed) {
      ftx.timestamp = -1;
    }
    formattedTxs.push(ftx);
    if (ftx.confirmed) {
      confirmedCount += 1;
    }
  });
  txs = txs.concat(formattedTxs);
  if (confirmedCount >= 25) {
    // Blockstream only returns up to 25 confirmed transactions per request
    // https://github.com/Blockstream/esplora/blob/master/API.md#get-addressaddresstxs
    // We need to re-request with the last tx
    addresses.push(address);
    return _fetchBtcTxsTestnet(addresses, txs, txs[confirmedCount - 1].id);
  }
  if (addresses.length === 0) {
    return txs;
  }
  setTimeout(() => {
    _fetchBtcTxsTestnet(addresses, txs);
  }, RATE_LIMIT);
}

export async function fetchBtcTxs(addresses, txs) {
  if (!addresses) throw new Error("Cannot fetch transactions - bad input");
  else if (addresses.length < 1) return [];
  const addrsCopy = JSON.parse(JSON.stringify(addresses));
  const f = BTC_DEV_DATA_API ? _fetchBtcTxsTestnet : _fetchBtcTxs;
  await f(addrsCopy, txs);
  return txs;
}

export function fetchBtcPrice() {
  const url = "https://api.blockchain.com/v3/exchange/tickers/BTC-USD";
  return fetchJSON(url)
    .then((data) => data.last_trade_price)
    .catch((err) => {
      throw new Error(
        "Failed to fetch BTC price from blockchain.com API. Error: " + err
      );
    });
}

export function broadcastBtcTx(rawTx, cb) {
  const opts = {
    method: "POST",
    body: rawTx,
  };
  fetch(BTC_BROADCAST_ENDPOINT, opts)
    .then((response) => response.text())
    .then((resp) => cb(null, resp))
    .catch((err) => cb(err));
}
// END CHAIN DATA SYNCING HELPERS

// OTHER HELPERS
export function harden(x) {
  return x + HARDENED_OFFSET;
}

// Determine how many inputs (utxos) need to be included in a transaction
// given the desired value and fee rate
// Returns the number of inputs to include or -1 if there isn't enough
// value in the inputs provided to cover value + fee
function _calcBtcTxNumInputs(
  utxos,
  value,
  feeRate,
  inputIdx = 0,
  currentValue = 0
) {
  if (inputIdx >= utxos.length) {
    return -1; // indicates error
  }
  currentValue += utxos[inputIdx].value;
  const numInputs = inputIdx + 1;
  const numBytes = getBtcNumTxBytes(numInputs);
  const fee = Math.floor(feeRate * numBytes);
  if (currentValue >= value + fee) {
    return numInputs;
  }
  inputIdx = numInputs;
  return _calcBtcTxNumInputs(utxos, value, feeRate, inputIdx, currentValue);
}

// Convert a script from blockchain.com's API into an address
// For some reason, they only return the script in the UTXO object.
// We need to convert the script to a an address.
// Since we know the purpose, we know the format of the address,
// so we can slice out the pubkeyhash from the script and convert.
function _blockchainDotComScriptToAddr(_scriptStr) {
  const purpose = getBtcPurpose();
  if (purpose === BTC_PURPOSE_SEGWIT) {
    const bech32Prefix = BTC_SEGWIT_NATIVE_V0_PREFIX;
    const bech32Version = 0; // Only v0 currently supported
    // Script: |OP_0|0x20|pubkeyhash|
    const pubkeyhash = Buffer.from(_scriptStr, "hex").slice(-20);
    const words = bech32.toWords(pubkeyhash);
    words.unshift(bech32Version);
    return bech32.encode(bech32Prefix, words);
  } else if (purpose === BTC_PURPOSE_WRAPPED_SEGWIT) {
    const version = BTC_WRAPPED_SEGWIT_VERSION;
    // Script: |OP_HASH160|0x20|pubkeyhash|OP_EQUAL|
    const pubkeyhash = Buffer.from(_scriptStr, "hex").slice(2, 22);
    return bs58check.encode(
      Buffer.concat([Buffer.from([version]), pubkeyhash])
    );
  } else if (purpose === BTC_PURPOSE_LEGACY) {
    // Script: |OP_DUP|OP_HASH160|0x20|pubkeyhash|OP_EQUALVERIFY|OP_CHECKSIG|
    const version = BTC_LEGACY_VERSION;
    const pubkeyhash = Buffer.from(_scriptStr, "hex").slice(3, 23);
    return bs58check.encode(
      Buffer.concat([Buffer.from([version]), pubkeyhash])
    );
  }
}

export function getBtcPurpose() {
  const localSettings = localStorage.getSettings();
  return localSettings.btcPurpose ? localSettings.btcPurpose : BTC_PURPOSE_NONE;
}

// Calculate how many bytes will be in a transaction given purpose and input count
// Calculations come from: https://github.com/jlopp/bitcoin-transaction-size-calculator/blob/master/index.html
// Not a perfect calculation but pretty close
export function getBtcNumTxBytes(numInputs) {
  let inputSize, outputSize, inputWitnessSize;
  const purpose = getBtcPurpose();
  if (purpose === BTC_PURPOSE_LEGACY) {
    inputSize = 148;
    outputSize = 32;
    inputWitnessSize = 0;
  } else if (purpose === BTC_PURPOSE_SEGWIT) {
    inputSize = 91;
    outputSize = 32;
    inputWitnessSize = 107; // size(signature) + signature + size(pubkey) + pubkey
  } else {
    inputSize = 67.75;
    outputSize = 31;
    inputWitnessSize = 107; // size(signature) + signature + size(pubkey) + pubkey
  }
  const vFactor = purpose === BTC_PURPOSE_LEGACY ? 0 : 0.75;
  // Hardcode 2 outputs to avoid complexity in app state
  const txVBytes = 10 + vFactor + inputSize * numInputs + outputSize * 2;
  return 3 * vFactor + txVBytes + inputWitnessSize * numInputs;
}

export async function buildBtcTxReq(
  recipient,
  btcValue,
  utxos,
  latestBtcChangeAddress,
  feeRate = BTC_DEFAULT_FEE_RATE,
  isFullSpend = false
) {
  if (!latestBtcChangeAddress) {
    return {
      error: "No addresses (or change addresses). Please wait to sync.",
    };
  }
  // Convert value to satoshis
  const satValue = Math.round(Number(btcValue) * SATS_TO_BTC);
  const numInputs = isFullSpend
    ? utxos.length
    : _calcBtcTxNumInputs(utxos, satValue, feeRate);
  if (numInputs < 0) {
    return { error: "Balance too low." };
  } else if (numInputs > utxos.length) {
    return { error: "Failed to build transaction." };
  }
  const bytesUsed = getBtcNumTxBytes(numInputs);
  const fee = Math.floor(bytesUsed * feeRate);
  // Build the request inputs
  const BASE_SIGNER_PATH = [getBtcPurpose(), BTC_COIN, HARDENED_OFFSET];
  const prevOuts: any[] = [];
  for (let i = 0; i < numInputs; i++) {
    const utxo = utxos[i];
    let signerPath = null;
    const utxoAddress = await db.addresses
      .where({ address: utxo.address })
      .first();
    if (!utxoAddress) {
      return { error: "Failed to find holder of UTXO. Syncing issue likely." };
    }
    if (!utxoAddress.change) {
      signerPath = BASE_SIGNER_PATH.concat([0, utxoAddress.index]);
    } else if (utxoAddress.change) {
      signerPath = BASE_SIGNER_PATH.concat([1, utxoAddress.index]);
    }
    const prevOut = {
      txHash: utxo.txid,
      value: utxo.value,
      index: utxo.vout,
      signerPath,
    };
    prevOuts.push(prevOut);
  }
  // Return the request (i.e. the whole object)
  const req = {
    prevOuts,
    recipient,
    value: satValue,
    fee,
    // Send change to the latest change address
    changePath: BASE_SIGNER_PATH.concat([1, latestBtcChangeAddress.index]),
  };
  return { currency: "BTC", data: req };
}

export function validateBtcAddr(addr) {
  if (addr === "") return null;
  try {
    bs58check.decode(addr);
    return true;
  } catch (e) {
    try {
      bech32.decode(addr);
      return true;
    } catch (e) {
      return false;
    }
  }
}

export function toHexStr(bn) {
  const s = bn.toString(16);
  const base = s.length % 2 === 0 ? s : `0${s}`;
  return `0x${base}`;
}

// Filter out any duplicate objects based on `keys`
export function filterUniqueObjects(objs, keys) {
  const filtered: any[] = [];
  // Copy the objects in reversed order so that newer instances
  // are applied first
  const objsCopy = JSON.parse(JSON.stringify(objs)).reverse();
  objsCopy.forEach((obj) => {
    let isDup = false;
    filtered.forEach((fobj) => {
      let matchedKeys = 0;
      keys.forEach((key) => {
        if (fobj[key] === obj[key]) {
          matchedKeys += 1;
        }
      });
      if (matchedKeys >= keys.length) {
        isDup = true;
      }
    });
    if (!isDup) {
      filtered.push(obj);
    }
  });
  // Return in the original order
  return filtered.reverse();
}
// END OTHER HELPERS
