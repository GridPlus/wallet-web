import { useMemo } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/util/btc/db"; // Ensure this points to your Dexie DB instance
import { useLattice } from "./useLattice";
import { useSettings } from "./useSettings";
import { abbreviateHash } from "@/util/addresses";
import { BtcTransaction } from "@/util/btc/txs";

interface BtcTxsTableData {
  status: string;
  amount: number;
  recipient: string;
  timestamp: string;
  txid: string;
  incoming: boolean;
}

export const useBtcTransactions = () => {
  const { activeWalletUid, deviceId } = useLattice();
  const { btcPurpose } = useSettings();

  const transactionsForTable = useLiveQuery(async (): Promise<
    BtcTxsTableData[]
  > => {
    if (!activeWalletUid || !deviceId || !btcPurpose) return [];

    const utxos = await db.utxos
      .where({ walletUid: activeWalletUid, deviceId, btcPurpose })
      .toArray();

    const transactionsPromises = utxos.map(async (utxo) => {
      const tx: BtcTransaction | undefined = await db.transactions.get(
        utxo.txid
      );
      if (!tx) return null;

      const isOutgoing = tx.vin.some((vin) =>
        utxos.some((u) => u.txid === vin.txid && u.vout === vin.prevout.n)
      );

      const amount = utxo.value;
      const recipient = isOutgoing
        ? tx.vout
            .filter(
              (vout) =>
                !utxos.find((u) => u.txid === tx.txid && u.vout === vout.n)
            )
            .map((vout) => abbreviateHash(vout.scriptpubkey_address))
            .join(", ")
        : "Wallet";

      return {
        status: tx.status.confirmed ? "Confirmed" : "Unconfirmed",
        amount,
        recipient,
        timestamp: new Date(tx.status.block_time * 1000).toLocaleString(),
        txid: tx.txid,
        incoming: !isOutgoing,
      };
    });

    const transactions = await Promise.all(transactionsPromises);
    return transactions.filter((t): t is BtcTxsTableData => t !== null);
  }, [activeWalletUid, deviceId, btcPurpose]);

  return { transactionsForTable };
};
