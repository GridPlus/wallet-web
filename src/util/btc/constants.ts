const isTestnet = import.meta.env.VITE_BTC_TESTNET === "1";

const BASE_URL = isTestnet
  ? "https://blockstream.info/testnet/api"
  : "https://blockstream.info/api";

export const UTXO_URL = (address: string) =>
  `${BASE_URL}/address/${address}/utxo`;
export const TXS_URL = (address: string) =>
  `${BASE_URL}/address/${address}/txs`;
export const ADDRS_URL = (address: string) => `${BASE_URL}/address/${address}`;
export const BROADCAST_URL = `${BASE_URL}/tx`;
