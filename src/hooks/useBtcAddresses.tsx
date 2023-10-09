import { db } from "@/util/btc/db";
import { useLiveQuery } from "dexie-react-hooks";
import { useLattice } from "./useLattice";
import { useSettings } from "./useSettings";

/**
 * A hook that provides access to the BTC addresses
 */
export const useBtcAddresses = () => {
  const { activeWalletUid, deviceId } = useLattice();
  const { btcPurpose } = useSettings();

  const activeBtcAddresses = useLiveQuery(() => {
    if (!activeWalletUid || !deviceId || !btcPurpose) return [];
    return db.addresses
      .where({ walletUid: activeWalletUid, deviceId, btcPurpose })
      .toArray();
  }, [activeWalletUid, deviceId, btcPurpose]);

  const activeBtcChangeAddresses = useLiveQuery(() => {
    if (!activeWalletUid || !deviceId || !btcPurpose) return [];
    return db.addresses
      .where({ walletUid: activeWalletUid, deviceId, btcPurpose })
      .and((address) => address.change === true)
      .toArray();
  }, [activeWalletUid, deviceId, btcPurpose]);

  const latestBtcChangeAddress = useLiveQuery(() => {
    if (!activeWalletUid || !deviceId || !btcPurpose) return null;
    return db.addresses
      .where({ walletUid: activeWalletUid, deviceId, btcPurpose })
      .and((address) => address.change === true && address.used === false)
      .sortBy("index")
      .then((addresses) => (addresses.length > 0 ? addresses[0] : {}));
  }, [activeWalletUid, deviceId, btcPurpose]);

  return {
    activeBtcAddresses,
    activeBtcChangeAddresses,
    latestBtcChangeAddress,
  };
};
