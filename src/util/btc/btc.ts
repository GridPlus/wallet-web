import { signBtcSegwitTx } from "gridplus-sdk";
import { UTXOResponse, fetchAndNormalizeTransactionsForAddresses } from "./txs";
import {
  BtcAddress,
  fetchAddresses,
  fetchUsedLegacyAddresses,
  fetchUsedSegwitAddresses,
  fetchUsedSegwitChangeAddresses,
  fetchUsedWrappedSegwitAddresses,
} from "./addresses";
import {
  getAllAddressesFromStorage,
  saveAddresses,
  saveTransactions,
  saveUTXOs,
} from "./store";
import { fetchUTXOs, fetchAndNormalizeUTXOs, fetchAllUtxos } from "./utxos";
import { db } from "./db";
import {
  BTC_PURPOSE_LEGACY,
  BTC_PURPOSE_SEGWIT,
  BTC_PURPOSE_WRAPPED_SEGWIT,
} from "../constants";
import { ADDRS_URL } from "./constants";
import { fetchBtcSegwitChangeAddresses } from "./sdkwrapper";
export interface BalanceResponse {
  final_balance: number;
}

interface BroadcastTxResponse {
  result: string;
  error?: string;
}

interface TransactionInput {
  txid: string;
  vout: number;
  value?: number; // Value might be needed for signing in some cases
}

interface TransactionOutput {
  address: string;
  value: number;
}

interface FeeRateResponse {
  fastestFee: number;
}

interface TransactionBody {
  currency: string;
  data: {
    prevOuts: any[];
    recipient: any;
    value: number;
    fee: number;
    changePath: any[];
  };
}
interface PriceResponse {
  bitcoin: {
    usd: number;
  };
}

export const fetchCurrentBtcPrice = async (): Promise<number> => {
  const url =
    "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd";
  const response = await fetch(url);
  if (!response.ok) throw new Error("Failed to fetch the current BTC price");
  const data: PriceResponse = await response.json();
  return data.bitcoin.usd;
};

export const fetchBtcAddressStatus = async (
  address: string
): Promise<{ balance: number; isUsed: boolean }> => {
  const response = await fetch(ADDRS_URL(address));
  const data = await response.json();
  const balance = calculateBalance(data);
  const isUsed = calculateIsUsed(data);
  return { balance, isUsed };
};

export const calculateIsUsed = (response: any): boolean => {
  const { chain_stats, mempool_stats } = response;
  return chain_stats.tx_count > 0 || mempool_stats.tx_count > 0;
};

export const calculateBalance = (response: any): number => {
  const { chain_stats, mempool_stats } = response;
  const confirmedBalance =
    chain_stats.funded_txo_sum - chain_stats.spent_txo_sum;
  const unconfirmedBalance =
    mempool_stats.funded_txo_sum - mempool_stats.spent_txo_sum;
  const totalBalance = confirmedBalance + unconfirmedBalance;
  return totalBalance;
};

export const fetchFeeRate = async (): Promise<number> => {
  const response = await fetch("https://mempool.space/api/v1/fees/recommended");
  if (!response.ok) throw new Error("Network response was not ok");
  const data = await response.json();
  return data.fastestFee;
};

export const calculateTransactionSize = (
  inputsCount: number,
  outputsCount: number
): number => {
  return inputsCount * 180 + outputsCount * 34 + 10 + inputsCount;
};

export const selectUTXOs = (
  utxos: UTXOResponse[],
  amountNeeded: number
): UTXOResponse[] => {
  let totalSelected = 0;
  const selectedUTXOs: UTXOResponse[] = [];

  utxos.sort((a, b) => b.value - a.value); // Sort by value descending to optimize UTXO selection

  for (const utxo of utxos) {
    if (totalSelected >= amountNeeded) break;
    selectedUTXOs.push(utxo);
    totalSelected += utxo.value;
  }

  if (totalSelected < amountNeeded) {
    throw new Error("Insufficient funds");
  }

  return selectedUTXOs;
};

export async function broadcastTransaction(
  signedTxHex: string
): Promise<BroadcastTxResponse> {
  const response = await fetch("https://blockstream.info/api/tx", {
    method: "POST",
    body: signedTxHex,
  });
  if (!response.ok) throw new Error("Network response was not ok");
  return response.json();
}

function buildTransactionBody(
  currency: string,
  prevOuts: TransactionInput[],
  recipient: TransactionOutput,
  value: number,
  fee: number,
  changePath: any[] // Ideally, you should define a more specific type for changePath
): TransactionBody {
  return {
    currency,
    data: {
      prevOuts,
      recipient,
      value,
      fee,
      changePath,
    },
  };
}
export const createAndSendTransaction = async (
  senderAddress: BtcAddress,
  recipientAddress: string,
  value: number,
  privateKey: string // privateKey is necessary for the signBtcSegwitTx function
) => {
  try {
    const feeRate = await fetchFeeRate();
    const utxos = await fetchUTXOs(senderAddress);
    const selectedUTXOs = selectUTXOs(utxos, value); // Simplification for demonstration
    const size = calculateTransactionSize(selectedUTXOs.length, 2); // Assuming 2 outputs: recipient + change
    const fee = size * feeRate;
    const adjustedValue = value - fee;

    if (adjustedValue <= 0) {
      throw new Error("Value after fee deduction is less than or equal to 0");
    }

    // Prepare recipient output
    const recipientOutput: TransactionOutput = {
      address: recipientAddress,
      value: adjustedValue,
    };

    // Build the transaction body
    const transactionBody = buildTransactionBody(
      "BTC",
      selectedUTXOs.map((utxo) => ({ txid: utxo.txid, vout: utxo.vout })),
      recipientOutput,
      adjustedValue,
      fee,
      [] // Change path could be determined here if necessary
    );

    // Assuming the signBtcSegwitTx can accept the transactionBody directly or you may need to adapt it
    const signedTxHex = await signBtcSegwitTx({
      // The actual signing mechanism will depend on how the GridPlus SDK expects the arguments
      transactionBody,
      privateKey,
    });

    // Broadcast the signed transaction
    const broadcastResponse = await broadcastTransaction(signedTxHex);
    console.log("Transaction successfully broadcasted:", broadcastResponse);
  } catch (error) {
    console.error("Failed to create and send transaction:", error);
    throw error; // Rethrow error to handle it in the calling function or UI
  }
};

export const initializeBtcWallet = async ({
  deviceId,
  activeWalletUid,
  btcPurpose,
}: {
  deviceId: string;
  activeWalletUid: string;
  btcPurpose: number;
}) => {
  if (!deviceId || !activeWalletUid) {
    throw new Error("Device ID and active wallet UID are required");
  }

  const test = await fetchBtcSegwitChangeAddresses({ n: 1, startPathIndex: 0 });
  console.log({ test });
  // TODO: Update to fetch all addresses, then filter to `isUsed=true` addresses and fetch txs/utxos only for used addrs
  // should store all addresses in local storage, then only fetch additional addresses if the gap limit is reached
  // but should always fetch updated balances/txs for all addresses
  console.log("FETCHING ADDRESSES");
  const fetchedAddrs = await fetchAddresses({
    walletUid: activeWalletUid,
    deviceId,
    btcPurpose,
    change: false,
  });
  console.log({ fetchedAddrs });
  await db.saveAddresses(fetchedAddrs);
  const addresses = await db.getUsedAddressesFor(
    deviceId,
    activeWalletUid,
    btcPurpose
  );

  console.log("FETCHING TRANSACTIONS");
  const txs = await fetchAndNormalizeTransactionsForAddresses(addresses);
  await db.saveTransactions(txs);

  console.log("FETCHING UTXOs");
  await db.deleteUTXOs(deviceId, activeWalletUid, btcPurpose);
  const utxos = await fetchAllUtxos(addresses);
  await db.saveUTXOs(utxos);

  console.log("FETCHING CHANGE ADDRESSES");
  const fetchedChangeAddrs = await fetchAddresses({
    walletUid: activeWalletUid,
    deviceId,
    btcPurpose,
    change: true,
  });
  await db.saveAddresses(fetchedChangeAddrs);

  const changeAddresses = await db.getUsedAddressesFor(
    deviceId,
    activeWalletUid,
    BTC_PURPOSE_SEGWIT,
    true
  );

  console.log("FETCHING CHANGE TRANSACTIONS");
  const changeTxs = await fetchAndNormalizeTransactionsForAddresses(
    changeAddresses
  );
  await db.saveTransactions(changeTxs);

  console.log("FETCHING CHANGE UTXOs");
  const changeUtxos = await fetchAllUtxos(changeAddresses);
  await db.saveUTXOs(changeUtxos);
};
