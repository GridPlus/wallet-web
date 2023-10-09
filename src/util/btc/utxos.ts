import { BtcAddress, BtcPurpose } from "./addresses";
import { UTXO_URL } from "./constants";

export interface BtcUTXO {
  txid: string;
  vout: number;
  value: number;
  deviceId: string;
  walletUid: string;
  btcPurpose: BtcPurpose;
  address: string;
}

// Adjusted to index UTXOs directly by txid
export interface NormalizedUTXOs {
  [txid: string]: BtcUTXO[];
}

export async function fetchUTXOs(btcAddress: BtcAddress): Promise<BtcUTXO[]> {
  const url = UTXO_URL(btcAddress.address);
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(
        `Failed to fetch UTXOs for address ${btcAddress.address}: ${response.statusText}`
      );
    }
    const utxos: BtcUTXO[] = await response.json();
    // Attach deviceId, walletUid, and btcPurpose to each UTXO
    return utxos.map((utxo) => ({
      ...utxo,
      deviceId: btcAddress.deviceId,
      walletUid: btcAddress.walletUid,
      btcPurpose: btcAddress.btcPurpose,
      address: btcAddress.address,
    }));
  } catch (error) {
    console.error(
      `Error fetching UTXOs for address ${btcAddress.address}: ${error}`
    );
    throw error;
  }
}

export async function fetchAllUtxos(
  addresses: BtcAddress[]
): Promise<BtcUTXO[]> {
  const utxoPromises = addresses.map(fetchUTXOs);
  const utxosArrays = await Promise.all(utxoPromises);
  // Flatten the array of UTXO arrays into a single array
  const allUTXOs = utxosArrays.flat();

  // Index UTXOs by txid
  return allUTXOs;
}
