import { useLattice } from "./useLattice";
import { useSettings } from "./useSettings";
import { db } from "@/util/btc/db";
import { useLiveQuery } from "dexie-react-hooks";

export const useBtcUTXOs = () => {
  const { activeWalletUid, deviceId } = useLattice();
  const { btcPurpose } = useSettings();

  const activeBtcUTXOs = useLiveQuery(async () => {
    if (!activeWalletUid || !deviceId || !btcPurpose) return [];
    const utxos = await db.utxos
      .where({ walletUid: activeWalletUid, deviceId, btcPurpose })
      .toArray();
    utxos.sort((a, b) => b.value - a.value);

    return utxos;
  }, [activeWalletUid, deviceId, btcPurpose]);

  return { activeBtcUTXOs };
};
