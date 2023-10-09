import { BtcAddress, BtcPurpose } from "./addresses";
import { TXS_URL } from "./constants";

export interface UTXOResponse {
  txid: string;
  vout: number;
  value: number;
  deviceId: string;
  walletUid: string;
  btcPurpose: BtcPurpose;
}

export interface Vin {
  txid: string;
  vout: number;
  scriptsig: string;
  scriptsig_asm: string;
  witness: string[];
  is_coinbase: boolean;
  sequence: number;
  prevout: Vout;
}

export interface Vout {
  scriptpubkey: string;
  scriptpubkey_asm: string;
  scriptpubkey_type: string;
  scriptpubkey_address: string;
  value: number;
}

export interface TransactionStatus {
  confirmed: boolean;
  block_height: number;
  block_hash: string;
  block_time: number;
}

export interface BtcTransaction {
  txid: string;
  version: number;
  locktime: number;
  vin: Vin[];
  vout: Vout[];
  size: number;
  weight: number;
  fee: number;
  status: TransactionStatus;
  address: string;
  deviceId: string;
  walletUid: string;
  btcPurpose: BtcPurpose;
  value: number;
  recipient: string[];
  timestamp: number;
  incoming: boolean;
}

export interface BtcTransactions {
  [txid: string]: BtcTransaction;
}

export async function fetchTransactionsForBtcAddress(
  btcAddress: BtcAddress
): Promise<any[]> {
  const url = TXS_URL(btcAddress.address);
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(
        `Failed to fetch transactions for address ${btcAddress.address}: ${response.statusText}`
      );
    }
    const transactions = await response.json();
    return transactions; // This will be an array of transactions
  } catch (error) {
    console.error(
      `Error fetching transactions for address ${btcAddress.address}:`,
      error
    );
  }
}

function normalizeTransactions(
  transactions: any[],
  btcAddress: BtcAddress
): BtcTransactions {
  const normalizedTxs = {};
  transactions.forEach((tx) => {
    const isOutgoing = tx.vin.some(
      (input: Vin) => input.prevout.scriptpubkey_address === btcAddress.address
    );
    const totalValue = tx.vout.reduce(
      (acc: number, output: Vout) => acc + output.value,
      0
    );
    const recipients = tx.vout
      .map((output: Vout) => output.scriptpubkey_address)
      .filter((address: string) => address !== btcAddress.address);

    normalizedTxs[tx.txid] = {
      ...tx,
      address: btcAddress.address,
      deviceId: btcAddress.deviceId,
      walletUid: btcAddress.walletUid,
      btcPurpose: btcAddress.btcPurpose,
      value: totalValue,
      recipient: recipients,
      timestamp: tx.status.block_time,
      incoming: !isOutgoing,
    };
  });
  return normalizedTxs;
}

export async function fetchAndNormalizeTransactionsForAddresses(
  addresses: BtcAddress[]
): Promise<BtcTransactions> {
  const normalizedTxs = {};
  await Promise.all(
    addresses.map(async (address) => {
      const txs = await fetchTransactionsForBtcAddress(address);
      const normalizedTx = normalizeTransactions(txs, address);
      Object.assign(normalizedTxs, normalizedTx);
    })
  );
  return normalizedTxs;
}
