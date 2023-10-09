export const DEFAULT_APP_NAME = "Lattice Manager";
export const BASE_SIGNING_URL = "https://signing.gridpl.us";
export const BTC_PROD_DATA_API = "https://blockchain.info";
export const BTC_BROADCAST_ENDPOINT = "https://blockstream.info/api/tx";
export const HARDENED_OFFSET = 0x80000000;
export const ASYNC_SDK_TIMEOUT = 60000;
export const ADDRESSES_PER_PAGE = 10;
export const ADDRESS_RECORD_TYPE = 0;
export const CONTRACTS_PER_PAGE = 10;
export const LOGIN_PARAM = "loginCache";
export const SHORT_TIMEOUT = 30000;
export const BTC_COIN = HARDENED_OFFSET;
export const SATS_TO_BTC = Math.pow(10, 8);
export const BTC_MAIN_GAP_LIMIT = 20;
export const BTC_CHANGE_GAP_LIMIT = 1;
export const BTC_ADDR_BLOCK_LEN = 10;
export const BTC_CHANGE_ADDR_BLOCK_LEN = 1;
export const BTC_DEFAULT_FEE_RATE = 10; // 10 sat/byte
export const BTC_TX_BASE_URL = "https://www.blockchain.com/btc/tx";
export const PAGE_SIZE = 20; // 20 transactions per requested page per `gridplus-cloud-services`
export const CONTRACT_PAGE_SIZE = 6;
export const LOST_PAIRING_ERR = "NOT_PAIRED";
export const LOST_PAIRING_MSG =
  "Cannot find Lattice connection. Please re-connect.";
export const BTC_TESTNET = null;
export const KEYRING_LOGOUT_MS = 2592000000; // default 30 days
export const KEYRING_DATA_PATH = "gridplus_web_wallet_keyring_logins"; // item in localStorage
export const ABI_PACK_URL = "https://gridplus.github.io/abi-pack-framework";
export const LATTICE_CERT_SIGNER =
  "0477816e8e83bb17c4309cc2e5aa134c573a5943154940095a423149f7cc0384ad52d33f1b4cd89c967bf211c039202df3a7899cb7543de4738c96a81cfde4b117";
export const CONTRACTS_HELP_LINK =
  "https://docs.gridplus.io/gridplus-web-wallet/use-ethereum-smart-contract-abi-function-definitions";
export const TAGS_HELP_LINK =
  "https://docs.gridplus.io/gridplus-web-wallet/address-tags";
export const PERMISSIONS_HELP_LINK =
  "https://docs.gridplus.io/gridplus-web-wallet/how-to-set-and-use-spending-limits";
export const POAP_CLAIM_REMOTE_URL =
  "https://us-central1-lattice-poap.cloudfunctions.net/validate";
export const BTC_WALLET_STORAGE_KEY = "btc_wallet";
export const BTC_PURPOSE_NONE = -1;
export const BTC_PURPOSE_NONE_STR = "Hide BTC Wallet";
export const BTC_PURPOSE_LEGACY = HARDENED_OFFSET + 44;
export const BTC_PURPOSE_WRAPPED_SEGWIT = HARDENED_OFFSET + 49;
export const BTC_PURPOSE_SEGWIT = HARDENED_OFFSET + 84;
export const BTC_PURPOSE_LEGACY_STR = "Legacy (1)";
export const BTC_PURPOSE_WRAPPED_SEGWIT_STR = "Wrapped Segwit (3)";
export const BTC_PURPOSE_SEGWIT_STR = "Segwit (bc1)";
export const BTC_SEGWIT_NATIVE_V0_PREFIX = "bc";
export const BTC_LEGACY_VERSION = 0x00;
export const BTC_WRAPPED_SEGWIT_VERSION = 0x05;
export const BTC_DEV_DATA_API = null;
export const RATE_LIMIT = 2000; // 2s between requests
export const THROTTLE_RATE_LIMIT = 5000; // 5s between requests
export const GET_ABI_URL =
  "https://api.etherscan.io/api?module=contract&action=getabi&address=";
export const DEFAULT_CONTRACT_NETWORK = "ethereum";

export const CONTRACT_NETWORKS = {
  ethereum: {
    label: "Ethereum",
    url: "https://etherscan.io",
    baseUrl: "https://api.etherscan.io",
    apiRoute: "api?module=contract&action=getabi&address=",
  },
  arbitrum: {
    label: "Arbitrum",
    url: "https://arbiscan.io",
    baseUrl: "https://api.arbiscan.io",
    apiRoute: "api?module=contract&action=getabi&address=",
  },
  polygon: {
    label: "Polygon",
    url: "https://polygonscan.com",
    baseUrl: "https://api.polygonscan.com",
    apiRoute: "api?module=contract&action=getabi&address=",
  },
  optimism: {
    label: "Optimism",
    url: "https://optimistic.etherscan.io",
    baseUrl: "https://api-optimistic.etherscan.io",
    apiRoute: "api?module=contract&action=getabi&address=",
  },
  binance: {
    label: "Binance",
    url: "https://bscscan.com/",
    baseUrl: "https://api.bscscan.com",
    apiRoute: "api?module=contract&action=getabi&address=",
  },
  avalanche: {
    label: "Avalanche",
    url: "https://snowtrace.io",
    baseUrl: "https://api.snowtrace.io",
    apiRoute: "api?module=contract&action=getabi&address=",
  },
};

export const PAGE_KEYS = {
  ROOT: "/",
  MANAGER: "/manage",
  ADDRESS_TAGS: "address_tags",
  EXPLORER: "explorer",
  WALLET: "wallet",
  PAIR: "pair",
  VALIDATE: "validate",
};
