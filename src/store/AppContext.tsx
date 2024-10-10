import React, {
  createContext,
  ReactNode,
  useEffect,
  useState,
  useRef,
  useCallback,
} from "react";
import { useRecords } from "../hooks/useRecords";
import SDKSession from "../sdk/sdkSession";
import localStorage from "../util/localStorage";
import { setup } from "gridplus-sdk";

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
  const [sessionState, setSessionState] = useState<SDKSession | null>(null);
  const sessionRef = useRef<SDKSession | null>(null);

  const [isLoadingAddressTags, setIsLoadingAddressTags] = useState(false);
  const [
    addressTags,
    addAddressTagsToState,
    removeAddressTagsFromState,
    resetAddressTagsInState,
  ] = useRecords(localStorage.getAddresses() ?? []);

  const updateSession = useCallback((newSession: SDKSession | null) => {
    if (sessionRef.current) {
      sessionRef.current.removeAllListeners();
    }
    sessionRef.current = newSession;
    if (newSession) {
      newSession.on("clientUpdated", (client) => {
        console.log("Client updated:", client);
      });
      newSession.on("clientAction", ({ method, args }) => {
        console.log(`Client action performed: ${method}`, args);
      });
    }
    setSessionState(newSession);
  }, []);

  const defaultContext = {
    isMobile,
    session: sessionState,
    setSession: updateSession,
    isLoadingAddressTags,
    setIsLoadingAddressTags,
    addressTags,
    addAddressTagsToState,
    removeAddressTagsFromState,
    resetAddressTagsInState,
  };

  useEffect(() => {
    if (sessionRef.current) {
      console.log("Session updated:", sessionRef.current);
    }
  }, [sessionState]);

  useEffect(() => {
    localStorage.setAddresses(addressTags);
  }, [addressTags]);

  useEffect(() => {
    const handleResize = () => {
      const windowIsMobileWidth = window.innerWidth < 500;
      setIsMobile(windowIsMobileWidth);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <AppContext.Provider value={{ ...defaultContext, ...overrides }}>
      {children}
    </AppContext.Provider>
  );
};
