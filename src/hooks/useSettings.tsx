import { BTC_PURPOSE_NONE, BTC_PURPOSE_SEGWIT } from "@/util/constants";
import { useContext, useMemo } from "react";
import { AppContext } from "../store/AppContext";

export const useSettings = () => {
  const { settings, setSettings } = useContext(AppContext);

  const btcPurpose = useMemo(
    () => settings.btcPurpose ?? BTC_PURPOSE_SEGWIT,
    [settings.btcPurpose]
  );

  return {
    settings,
    setSettings,
    btcPurpose,
  };
};
