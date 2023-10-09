import {
  BASE_SIGNING_URL,
  KEYRING_LOGOUT_MS,
  LOGIN_PARAM,
  PAGE_KEYS,
} from "@/util/constants";
import { fetchActiveWallets, getClient, setup } from "gridplus-sdk";
import { useCallback, useContext, useEffect, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { AppContext } from "../store/AppContext";
import store, {
  getStoredClient,
  removeStoredClient,
  setStoredClient,
} from "../store/persistanceStore";
import { useUrlParams } from "./useUrlParams";

export const useLattice = () => {
  const navigate = useNavigate();
  const {
    integrationName,
    setIntegrationName,
    isLoadingClient,
    setIsLoadingClient,
    isClientReady,
    activeWallets,
    activeWalletUid,
    setActiveWallets,
    updateActiveWallets,
    activeWallet,
    setActiveWallet,
    isLoadingActiveWallets,
    setIsLoadingActiveWallets,
  } = useContext(AppContext);
  const location = useLocation();
  const { keyring, forceLogin, isLoggedIn, hwCheck } = useUrlParams();

  const wasOpenedByKeyring = !!keyring; // Was the app opened with a keyring in the url parameters

  function isEmptyUInt8Array(arr: Uint8Array): boolean {
    return arr.every((el) => el === 0);
  }

  // @ts-ignore
  const deviceId = getClient()?.deviceId;

  const fetchActiveWallet = async () => {
    console.log("fetching active wallet");
    const activeWallets = await fetchActiveWallets();
    const isExternalActive = !isEmptyUInt8Array(activeWallets.external.uid);
    const activeWallet = isExternalActive
      ? { wallet: activeWallets.external, external: true }
      : { wallet: activeWallets.internal, external: false };
    setActiveWallet(activeWallet);
    return activeWallet;
  };

  const handleLogout = useCallback(() => {
    removeStoredClient();
    store.removeLogin();
    store.removeAddresses();
    navigate(PAGE_KEYS.ROOT);
  }, [navigate]);

  const isAuthenticated = () => {
    try {
      return getClient().isPaired || false;
    } catch (e) {
      return false;
    }
  };

  const isConnected = () => {
    return !!getClient();
  };

  const isPaired = () => {
    return getClient()?.isPaired || false;
  };

  const connect = async (deviceId: string, password: string) => {
    console.log("connect", deviceId, password);
    const name = "Lattice ManagerZZZ";
    const isPaired = await setup({
      deviceId,
      password,
      name,
      getStoredClient,
      setStoredClient,
    });
    if (isPaired) {
      await updateActiveWallets();
      navigate(PAGE_KEYS.MANAGER);
    } else {
      navigate(PAGE_KEYS.PAIR);
    }
  };

  useEffect(() => {
    if (keyring) {
      // Check if this keyring has already logged in.
      const prevKeyringLogin = store.getKeyringItem(keyring);
      // This login should expire after a period of time.
      const keyringTimeoutBoundary = new Date().getTime() - KEYRING_LOGOUT_MS;
      const isKeyringExpired =
        prevKeyringLogin.lastLogin > keyringTimeoutBoundary;

      if (!forceLogin && prevKeyringLogin && isKeyringExpired) {
        // setDeviceId(prevKeyringLogin.deviceId);
        // setPassword(prevKeyringLogin.password);
      } else {
        // If the login has expired, clear it now.
        store.removeKeyringItem(keyring);
      }
    }
  }, [keyring, forceLogin, isLoggedIn]);

  const returnKeyringData = useCallback(
    (deviceId: string, password: string) => {
      if (!wasOpenedByKeyring) return;
      // Save the login for later
      store.setKeyringItem(integrationName, {
        deviceId: deviceId,
        password: password,
        lastLogin: new Date().getTime(),
      });
      // Send the data back to the opener
      const data = {
        deviceID: deviceId, // Integrations expect `deviceID` with capital `D`
        password: password,
        endpoint: BASE_SIGNING_URL,
      };
      // Check if there is a custom endpoint configured
      const settings = store.getSettings();
      if (settings.customEndpoint && settings.customEndpoint !== "") {
        data.endpoint = settings.customEndpoint;
      }
      const location = window.location.href; // save before `handleLogout` wipes location
      handleLogout();
      if (window.opener) {
        // If there is a `window.opener` we can just post back
        window.opener.postMessage(JSON.stringify(data), "*");
        window.close();
      } else {
        // Otherwise we need a workaround to let the originator
        // know we have logged in. We will put the login data
        // into the URL and the requesting app will fetch that.
        // Note that the requesting extension is now responsible for
        // closing this web page.
        const enc = Buffer.from(JSON.stringify(data)).toString("base64");
        window.location.href = `${location}&${LOGIN_PARAM}=${enc}`;
      }
    },
    [wasOpenedByKeyring, integrationName, handleLogout]
  );

  return {
    client: getClient(),
    deviceId,
    connect,
    activeWallets,
    updateActiveWallets,
    activeWallet,
    activeWalletUid,
    handleLogout,
    isAuthenticated,
    isConnected,
    isLoadingClient,
    isPaired,
    integrationName,
    setIntegrationName,
    returnKeyringData,
    isLoadingActiveWallets,
    setIsLoadingActiveWallets,
    fetchActiveWallet,
  };
};
