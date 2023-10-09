import { Address } from "cluster";
import { createContext, ReactNode, useState } from "react";
import {
  BTC_PURPOSE_LEGACY,
  BTC_PURPOSE_SEGWIT,
  BTC_PURPOSE_WRAPPED_SEGWIT,
} from "@/util/constants";

enum Purpose {
  SEGWIT = BTC_PURPOSE_SEGWIT,
  WRAPPED_SEGWIT = BTC_PURPOSE_WRAPPED_SEGWIT,
  LEGACY = BTC_PURPOSE_LEGACY,
}

type BtcAddress = {
  address: string;
  type: "BTC" | "BTC_CHANGE";
  purpose: Purpose;
  wallet_uid: string;
  device_id: string;
  isChange: boolean;
};

// type BitcoinWallet = {
//   [key: DeviceId]: {
//     [key: WalletUID]: {
//       btc_wallet: {
//         [key: Purpose]: {
//           addresses: {
//             BTC: {
//               [key: Purpose]: Address[];
//             };
//             BTC_CHANGE: {
//               [key: Purpose]: Address[];
//             };
//           };
//         };
//       };
//     };
//   };
// };

export const BitcoinContext = createContext(undefined);

export const BitcoinContextProvider = ({
  children,
  overrides,
}: {
  children: ReactNode;
  overrides?: { [key: string]: any };
}) => {
  const [isLoadingBtcData, setIsLoadingBtcData] = useState(false);

  const [btcTxs, setBtcTxs] = useState([]);
  const [btcPrice, setBtcPrice] = useState(0);
  const [lastFetchedBtcData, setLastFetchedBtcData] = useState(0);
  const [btcUtxos, setBtcUtxos] = useState([]);
  const [btcAddresses, setBtcAddresses] = useState({});
  const [page, setPage] = useState(1);

  const defaultContext = {
    isLoadingBtcData,
    setIsLoadingBtcData,
    page,
    setPage,
    btcTxs,
    setBtcTxs,
    btcPrice,
    setBtcPrice,
    lastFetchedBtcData,
    setLastFetchedBtcData,
    btcUtxos,
    setBtcUtxos,
    btcAddresses,
    setBtcAddresses,
  };

  return (
    <BitcoinContext.Provider value={{ ...defaultContext, ...overrides }}>
      {children}
    </BitcoinContext.Provider>
  );
};
