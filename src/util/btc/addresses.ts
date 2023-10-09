import { fetchBtcAddressStatus } from "./btc";
import {
  BTC_PURPOSE_LEGACY,
  BTC_PURPOSE_SEGWIT,
  BTC_PURPOSE_WRAPPED_SEGWIT,
} from "../constants";
import { ADDRS_URL } from "./constants";
import {
  fetchBtcSegwitAddresses,
  fetchBtcLegacyChangeAddresses,
  fetchBtcSegwitChangeAddresses,
  fetchBtcWrappedSegwitChangeAddresses,
  fetchBtcLegacyAddresses,
  fetchBtcWrappedSegwitAddresses,
} from "./sdkwrapper";
import { db } from "./db";

export type BtcPurpose =
  | typeof BTC_PURPOSE_LEGACY
  | typeof BTC_PURPOSE_SEGWIT
  | typeof BTC_PURPOSE_WRAPPED_SEGWIT;

export interface BtcAddress {
  address: string;
  change: boolean;
  used: boolean;
  balance: number;
  index: number;
  deviceId: string;
  walletUid: string;
  btcPurpose: BtcPurpose;
}

async function fetchAddressesWithGapLimit(
  fetchFunction: ({
    n,
    startPathIndex,
  }: {
    n: number;
    startPathIndex: number;
  }) => Promise<string[]>,
  btcPurpose: BtcPurpose,
  isChange: boolean,
  deviceId: string,
  walletUid: string,
  offset: number = 0
): Promise<BtcAddress[]> {
  let index = offset;
  let gapCount = 0;
  const gapLimit = 20;
  const btcAddresses = [];

  while (gapCount < gapLimit) {
    const addresses = await fetchFunction({ n: 10, startPathIndex: index });
    for (const address of addresses) {
      if (!address) {
        gapCount++;
        continue;
      }

      const { balance, isUsed } = await fetchBtcAddressStatus(address);
      const used = isUsed;
      btcAddresses.push({
        address,
        change: isChange,
        used,
        balance,
        index: index++,
        btcPurpose,
        walletUid,
        deviceId,
      });
      if (used) {
        gapCount = 0;
      } else {
        gapCount++;
      }
    }

    if (addresses.length < 10 || gapCount >= gapLimit) break;
  }

  return btcAddresses;
}
export async function fetchAddresses({
  walletUid,
  deviceId,
  btcPurpose,
  change,
}) {
  const fetchFunc = getFetchFunctionForBtcPurpose(btcPurpose, change);
  const currentAddressCount = await db.addresses
    .where({
      walletUid,
      deviceId,
      btcPurpose,
    })
    .and((address) => address.change === change)
    .count();
  const addrs = fetchFunc(deviceId, walletUid, currentAddressCount);
  return addrs;
}

async function fetchUsedLegacyAddresses(
  deviceId: string,
  walletUid: string,
  offset: number
) {
  return fetchAddressesWithGapLimit(
    fetchBtcLegacyAddresses,
    BTC_PURPOSE_LEGACY,
    false,
    deviceId,
    walletUid,
    offset
  );
}

async function fetchUsedSegwitAddresses(
  deviceId: string,
  walletUid: string,
  offset: number
) {
  return fetchAddressesWithGapLimit(
    fetchBtcSegwitAddresses,
    BTC_PURPOSE_SEGWIT,
    false,
    deviceId,
    walletUid,
    offset
  );
}

async function fetchUsedWrappedSegwitAddresses(
  deviceId: string,
  walletUid: string,
  offset: number
) {
  return fetchAddressesWithGapLimit(
    fetchBtcWrappedSegwitAddresses,
    BTC_PURPOSE_WRAPPED_SEGWIT,
    false,
    deviceId,
    walletUid,
    offset
  );
}

async function fetchUsedLegacyChangeAddresses(
  deviceId: string,
  walletUid: string,
  offset: number
) {
  return fetchAddressesWithGapLimit(
    fetchBtcLegacyChangeAddresses,
    BTC_PURPOSE_LEGACY,
    true,
    deviceId,
    walletUid,
    offset
  );
}

async function fetchUsedSegwitChangeAddresses(
  deviceId: string,
  walletUid: string,
  offset: number
) {
  return fetchAddressesWithGapLimit(
    fetchBtcSegwitChangeAddresses,
    BTC_PURPOSE_SEGWIT,
    true,
    deviceId,
    walletUid,
    offset
  );
}

async function fetchUsedWrappedSegwitChangeAddresses(
  deviceId: string,
  walletUid: string,
  offset: number
) {
  return fetchAddressesWithGapLimit(
    fetchBtcWrappedSegwitChangeAddresses,
    BTC_PURPOSE_WRAPPED_SEGWIT,
    true,
    deviceId,
    walletUid,
    offset
  );
}

const getFetchFunctionForBtcPurpose = (btcPurpose: number, change: boolean) => {
  if (btcPurpose === BTC_PURPOSE_SEGWIT) {
    return change ? fetchUsedSegwitChangeAddresses : fetchUsedSegwitAddresses;
  }
  if (btcPurpose === BTC_PURPOSE_WRAPPED_SEGWIT) {
    return change
      ? fetchUsedWrappedSegwitChangeAddresses
      : fetchUsedWrappedSegwitAddresses;
  }
  if (btcPurpose === BTC_PURPOSE_LEGACY) {
    return change ? fetchUsedLegacyChangeAddresses : fetchUsedLegacyAddresses;
  }
  throw new Error("Unsupported BTC purpose");
};

export {
  fetchUsedLegacyAddresses,
  fetchUsedSegwitAddresses,
  fetchUsedWrappedSegwitAddresses,
  fetchUsedLegacyChangeAddresses,
  fetchUsedSegwitChangeAddresses,
  fetchUsedWrappedSegwitChangeAddresses,
};
