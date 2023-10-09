import { fetchAddresses } from "gridplus-sdk";
import { getStartPath } from "gridplus-sdk/dist/api/utilities";
import { MAX_ADDR, HARDENED_OFFSET } from "gridplus-sdk/dist/constants";

type FetchAddressesParams = {
  n?: number;
  startPathIndex?: number;
};

/** @internal */
export const DEFAULT_ETH_DERIVATION = [
  HARDENED_OFFSET + 44,
  HARDENED_OFFSET + 60,
  HARDENED_OFFSET,
  0,
  0,
];

/** @internal */
export const BTC_LEGACY_DERIVATION = [
  HARDENED_OFFSET + 44,
  HARDENED_OFFSET + 0,
  HARDENED_OFFSET,
  0,
  0,
];

/** @internal */
export const BTC_LEGACY_CHANGE_DERIVATION = [
  HARDENED_OFFSET + 44,
  HARDENED_OFFSET + 0,
  HARDENED_OFFSET,
  1,
  0,
];

/** @internal */
export const BTC_SEGWIT_DERIVATION = [
  HARDENED_OFFSET + 84,
  HARDENED_OFFSET,
  HARDENED_OFFSET,
  0,
  0,
];

/** @internal */
export const BTC_SEGWIT_CHANGE_DERIVATION = [
  HARDENED_OFFSET + 84,
  HARDENED_OFFSET,
  HARDENED_OFFSET,
  1,
  0,
];

/** @internal */
export const BTC_WRAPPED_SEGWIT_DERIVATION = [
  HARDENED_OFFSET + 49,
  HARDENED_OFFSET,
  HARDENED_OFFSET,
  0,
  0,
];

/** @internal */
export const BTC_WRAPPED_SEGWIT_CHANGE_DERIVATION = [
  HARDENED_OFFSET + 49,
  HARDENED_OFFSET,
  HARDENED_OFFSET,
  1,
  0,
];

export const fetchBtcLegacyAddresses = async (
  { n, startPathIndex }: FetchAddressesParams = {
    n: MAX_ADDR,
    startPathIndex: 0,
  }
) => {
  return fetchAddresses({
    startPath: getStartPath(BTC_LEGACY_DERIVATION, startPathIndex),
    n,
  });
};

export const fetchBtcLegacyChangeAddresses = async (
  { n, startPathIndex }: FetchAddressesParams = {
    n: MAX_ADDR,
    startPathIndex: 0,
  }
) => {
  return fetchAddresses({
    startPath: getStartPath(BTC_LEGACY_CHANGE_DERIVATION, startPathIndex),
    n,
  });
};

export const fetchBtcSegwitAddresses = async (
  { n, startPathIndex }: FetchAddressesParams = {
    n: MAX_ADDR,
    startPathIndex: 0,
  }
) => {
  return fetchAddresses({
    startPath: getStartPath(BTC_SEGWIT_DERIVATION, startPathIndex),
    n,
  });
};

export const fetchBtcSegwitChangeAddresses = async (
  { n, startPathIndex }: FetchAddressesParams = {
    n: MAX_ADDR,
    startPathIndex: 0,
  }
) => {
  return fetchAddresses({
    startPath: getStartPath(BTC_SEGWIT_CHANGE_DERIVATION, startPathIndex),
    n,
  });
};

export const fetchBtcWrappedSegwitAddresses = async (
  { n, startPathIndex }: FetchAddressesParams = {
    n: MAX_ADDR,
    startPathIndex: 0,
  }
) => {
  return fetchAddresses({
    startPath: getStartPath(BTC_WRAPPED_SEGWIT_DERIVATION, startPathIndex),
    n,
  });
};

export const fetchBtcWrappedSegwitChangeAddresses = async (
  { n, startPathIndex }: FetchAddressesParams = {
    n: MAX_ADDR,
    startPathIndex: 0,
  }
) => {
  return fetchAddresses({
    startPath: getStartPath(
      BTC_WRAPPED_SEGWIT_CHANGE_DERIVATION,
      startPathIndex
    ),
    n,
  });
};
