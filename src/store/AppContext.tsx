import { BTC_PURPOSE_SEGWIT } from "@/util/constants";
import { isEmptyUInt8Array } from "@/util/wallets";
import { fetchActiveWallets, getClient, setup } from "gridplus-sdk";
import { ReactNode, createContext, useEffect, useMemo, useState } from "react";
import { useRecords } from "../hooks/useRecords";
import store from "../store/persistanceStore";
import localStorage from "../util/localStorage";
import { getStoredClient, setStoredClient } from "./persistanceStore";

/**
 * A React Hook that allows us to pass data down the component tree without having to pass
 * props.
 */
export const AppContext = createContext(undefined);

export const AppContextProvider = ({
  children,
  overrides,
}: {
  children: ReactNode;
  overrides?: { [key: string]: any };
}) => {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 500);
  const [activeWallets, setActiveWallets] = useState();
  const [activeWallet, setActiveWallet] = useState<{
    wallet: any;
    external: boolean;
  }>();
  const [settings, setSettings] = useState(store.getSettings());

  const [isLoadingActiveWallets, setIsLoadingActiveWallets] = useState(false);
  const [isLoadingClient, setIsLoadingClient] = useState(false);
  const [isLoadingAddressTags, setIsLoadingAddressTags] = useState(false);
  const [
    addressTags,
    addAddressTagsToState,
    removeAddressTagsFromState,
    resetAddressTagsInState,
  ] = useRecords(localStorage.getAddresses() ?? []);

  const isClientReady = () => !!getClient();

  const clientDataExists = getStoredClient() !== undefined;

  useEffect(() => {
    // check if settings is an empty object
    if (
      settings &&
      Object.keys(settings).length === 0 &&
      settings.constructor === Object
    ) {
      const defaultSettings = {
        btcPurpose: BTC_PURPOSE_SEGWIT,
      };
      setSettings(defaultSettings);
    } else {
      store.setSettings(settings);
    }
  }, [settings]);

  const activeWalletUid = useMemo(
    () => activeWallet?.wallet?.uid.toString("hex"),
    [activeWallet]
  );

  const updateActiveWallets = () => {
    if (isClientReady() && !isLoadingActiveWallets) {
      setIsLoadingActiveWallets(true);
      console.log("fetching active wallets");
      fetchActiveWallets()
        .then((activeWallets) => {
          console.log("activeWallets", activeWallets);
          setActiveWallets(activeWallets);
          const isExternalActive = !isEmptyUInt8Array(
            activeWallets.external.uid
          );
          const activeWallet = isExternalActive
            ? { wallet: activeWallets.external, external: true }
            : { wallet: activeWallets.internal, external: false };
          setActiveWallet(activeWallet);
        })
        .finally(() => {
          setIsLoadingActiveWallets(false);
        });
    }
  };

  useEffect(() => {
    setIsLoadingClient(true);
    setIsLoadingActiveWallets(true);
    if (clientDataExists && !isClientReady()) {
      console.log("setting up");
      setup({ getStoredClient, setStoredClient })
        .then((isPaired) => {
          if (isPaired) {
            updateActiveWallets();
          }
        })
        .finally(() => {
          setIsLoadingClient(false);
          setIsLoadingActiveWallets(false);
        });
    } else {
      setIsLoadingClient(false);
      setIsLoadingActiveWallets(false);
    }
  }, []);

  /**
   * Whenever `addresses` data changes, it is persisted to `localStorage`
   */
  useEffect(() => {
    localStorage.setAddresses(addressTags);
  }, [addressTags]);

  /**
   * Sets `isMobile` when the window resizes.
   * */
  useEffect(() => {
    window.addEventListener("resize", () => {
      const windowIsMobileWidth = window.innerWidth < 500;
      if (windowIsMobileWidth && !isMobile) setIsMobile(true);
      if (!windowIsMobileWidth && isMobile) setIsMobile(false);
    });
  }, [isMobile]);

  const defaultContext = {
    isMobile,
    isLoadingAddressTags,
    setIsLoadingAddressTags,
    addressTags,
    addAddressTagsToState,
    removeAddressTagsFromState,
    resetAddressTagsInState,
    activeWallets,
    setActiveWallets,
    activeWallet,
    setActiveWallet,
    activeWalletUid,
    isLoadingClient,
    setIsLoadingClient,
    isLoadingActiveWallets,
    setIsLoadingActiveWallets,
    updateActiveWallets,
    settings,
    setSettings,
  };

  return (
    <AppContext.Provider value={{ ...defaultContext, ...overrides }}>
      {children}
    </AppContext.Provider>
  );
};
