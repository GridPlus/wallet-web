import Dexie from "dexie";
import { BtcAddress, BtcPurpose } from "./addresses";
import { BtcTransaction, BtcTransactions, UTXOResponse } from "./txs";
import { BtcUTXO, NormalizedUTXOs } from "./utxos";

class BtcWalletDatabase extends Dexie {
  addresses: Dexie.Table<BtcAddress, string>;
  transactions: Dexie.Table<BtcTransaction, string>;
  utxos: Dexie.Table<UTXOResponse, [string, number]>;

  constructor() {
    super("BtcWalletDatabase");
    this.version(1).stores({
      addresses:
        "&address, change, used, balance, index, deviceId, walletUid, btcPurpose",
      transactions:
        "&txid, vin, vout, size, weight, fee, status, address, deviceId, walletUid, btcPurpose, value, recipient, timestamp, incoming",
      utxos:
        "[txid+vout], txid, vout, value, address, deviceId, walletUid, btcPurpose",
    });

    this.addresses = this.table("addresses");
    this.transactions = this.table("transactions");
    this.utxos = this.table("utxos");
  }

  async getUsedAddressesFor(
    deviceId: string,
    walletUid: string,
    btcPurpose: BtcPurpose,
    change = false
  ): Promise<BtcAddress[]> {
    let usedAddresses = await this.addresses
      .where({ deviceId, walletUid, btcPurpose })
      .and((address) => address.change === change && address.used === true)
      .toArray();
    return usedAddresses;
  }

  async saveAddresses(addresses: BtcAddress[]): Promise<void> {
    await this.addresses.bulkPut(addresses);
  }

  async getAllTransactions(): Promise<BtcTransactions> {
    const transactions = await this.transactions.toArray();
    const transactionsObj = {};
    transactions.forEach((tx) => {
      transactionsObj[tx.txid] = tx;
    });
    return transactionsObj;
  }

  async saveTransactions(transactions: BtcTransactions): Promise<void> {
    await this.transactions.bulkPut(Object.values(transactions));
  }

  async saveUTXOs(utxos: BtcUTXO[]): Promise<void> {
    await this.utxos.bulkPut(utxos);
  }
  async deleteUTXOs(
    deviceId: string,
    walletUid: string,
    btcPurpose: BtcPurpose
  ): Promise<void> {
    await this.utxos.where({ deviceId, walletUid, btcPurpose }).delete();
  }
}

export const db = new BtcWalletDatabase();
