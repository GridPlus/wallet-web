import { BtcAddress } from "./addresses";
import { BtcTransactions } from "./txs";
import { BtcUTXO } from "./utxos";

export const getAllAddressesFromStorage = (): BtcAddress[] => {
  const addresses = localStorage.getItem("addresses");
  return addresses ? JSON.parse(addresses) : {};
};

export const saveAddresses = (addresses: BtcAddress[]) => {
  const storedAddresses = getAllAddressesFromStorage();
  const allAddresses = { ...storedAddresses, ...addresses };
  localStorage.setItem("addresses", JSON.stringify(allAddresses));
};

export const getAllChangeAddressesFromStorage = (): BtcAddress[] => {
  const changeAddresses = localStorage.getItem("changeAddresses");
  return changeAddresses ? JSON.parse(changeAddresses) : [];
};

export const saveChangeAddresses = (changeAddresses: BtcAddress[]) => {
  const existingChangeAddresses = getAllChangeAddressesFromStorage();
  const allChangeAddresses = { ...existingChangeAddresses, ...changeAddresses };
  localStorage.setItem("changeAddresses", JSON.stringify(allChangeAddresses));
};

export const getAllTransactionsFromStorage = (): BtcTransactions => {
  const transactions = localStorage.getItem("transactions");
  return transactions ? JSON.parse(transactions) : {};
};

export const saveTransactions = (transactions: BtcTransactions) => {
  const storedTransactions = getAllTransactionsFromStorage();
  const allTransactions = { ...storedTransactions, ...transactions };
  localStorage.setItem("transactions", JSON.stringify(allTransactions));
};

export const getAllUTXOsFromStorage = (): BtcUTXO[] => {
  const utxos = localStorage.getItem("utxos");
  return utxos ? JSON.parse(utxos) : {};
};

export const saveUTXOs = (newUTXOs: BtcUTXO[]) => {
  const storedUTXOs = getAllUTXOsFromStorage();
  const allUTXOs = { ...storedUTXOs, ...newUTXOs };
  localStorage.setItem("utxos", JSON.stringify(allUTXOs));
};
