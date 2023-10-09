import { fetchCurrentBtcPrice } from "@/util/btc/btc";
import { useEffect, useMemo, useState } from "react";
import { useBtcUTXOs } from "./useBtcUtxos";

/**
 * A hook that provides access to the BTC state
 *
 */
export const useBtc = () => {
  const [btcPrice, setBtcPrice] = useState<number>(0);
  const { activeBtcUTXOs } = useBtcUTXOs();

  useEffect(() => {
    fetchCurrentBtcPrice().then((price) => setBtcPrice(price));
  }, []);

  const balance = useMemo(() => {
    if (activeBtcUTXOs) {
      const utxoTotal = activeBtcUTXOs.reduce((acc, tx) => acc + tx.value, 0);
      return utxoTotal;
    }
    return 0;
  }, [activeBtcUTXOs]);

  return {
    btcPrice,
    balance,
  };
};
