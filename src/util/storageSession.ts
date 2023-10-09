import store from "../store/persistanceStore";

export const isObject = (o) => {
  try {
    return o && typeof o === "object" && !Array.isArray(o);
  } catch (e) {
    return false;
  }
};

export const updateBranch = (newData, oldData, key) => {
  if (!isObject(oldData)) return;
  if (isObject(newData[key]) && !oldData[key]) oldData[key] = {};
  if (isObject(newData[key])) {
    Object.keys(newData[key]).forEach((newKey) => {
      if (isObject(newData[key][newKey]))
        updateBranch(newData[key], oldData[key], newKey);
      else oldData[key][newKey] = newData[key][newKey];
    });
  } else {
    oldData[key] = newData[key];
  }
};

export const saveWalletData = (deviceId, wallet_uid, data) => {
  const deviceIdStorage = store.getRootStoreItem(deviceId);
  Object.keys(data).forEach((k) => {
    updateBranch(data, deviceIdStorage[wallet_uid], k);
  });
  store.setRootStoreItem(deviceId, deviceIdStorage);
};

export const getWalletData = (deviceId, wallet_uid) => {
  const deviceIdStorage = store.getRootStoreItem(deviceId);
  if (!deviceIdStorage) store.setRootStoreItem(deviceId, {});
  if (!deviceIdStorage[wallet_uid])
    store.setRootStoreItem(deviceId, {
      ...store.getRootStoreItem(deviceId),
      [wallet_uid]: {},
    });
  return deviceIdStorage[wallet_uid];
};
