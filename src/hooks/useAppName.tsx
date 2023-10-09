import { DEFAULT_APP_NAME } from "@/util/constants";
import { useState } from "react";
import store from "../store/persistanceStore";
import { useUrlParams } from "./useUrlParams";

export const useIntegrationName = () => {
  const { keyring } = useUrlParams();

  const getIntegrationName = () => {
    if (keyring) {
      return keyring;
    }
    if (store.getIntegrationName()) {
      return store.getIntegrationName();
    }
    return DEFAULT_APP_NAME;
  };

  const [integrationName, setIntegrationName] = useState<string>(
    getIntegrationName()
  );

  return { integrationName, setIntegrationName };
};
