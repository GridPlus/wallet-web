import _ from "lodash";
import isEmpty from "lodash/isEmpty";
import { useCallback, useContext } from "react";
import { AppContext } from "../store/AppContext";
import { LatticeRecord } from "../types/records";
import { constants } from "../util/helpers";
import { sendErrorNotification } from "../util/sendErrorNotification";
const { ADDRESSES_PER_PAGE, ADDRESS_RECORD_TYPE } = constants;

/**
 * The `useAddresses` hook is used to manage the external calls for fetching, adding, and removing
 * key-value address data on the user's Lattice and caching that data in `store`.
 */
export const useAddresses = () => {
  const {
    session,
    isLoadingAddressTags,
    setIsLoadingAddresses,
    addresses,
    addAddressesToState,
    removeAddressesFromState,
    resetAddressesInState,
  } = useContext(AppContext);

  /**
   * Fetches the installed addresses from the user's Lattice.
   */
  const fetchAddresses = useCallback(
    async (path = [0x80000000 + 44, 0x80000000 + 60, 0x80000000, 0, 0]) => {
      setIsLoadingAddresses(true);

      return session.client
        .getAddresses({
          startPath: path,
          n: ADDRESSES_PER_PAGE,
        })
        .then(async (res) => {
          addAddressesToState(res.records);
        })
        .catch((err) => {
          sendErrorNotification({
            ...err,
            onClick: ()=>fetchAddresses(path),
          });
        })
        .finally(() => {
          setIsLoadingAddresses(false);
        });
    },
    [addAddressesToState, session, setIsLoadingAddresses]
  );

  /**
   * Removes installed addresses from the user's Lattice.
   */
  const removeAddresses = (selectedAddresses: LatticeRecord[]) => {
    const ids = selectedAddresses.map((r) => parseInt(r.id));
    if (isEmpty(ids)) return;
    setIsLoadingAddresses(true);

    return session.client
      .removeKvRecords({ ids })
      .then(() => {
        removeAddressesFromState(selectedAddresses);
      })
      .catch((err) => {
        sendErrorNotification({
          ...err,
          onClick: () => removeAddresses(selectedAddresses),
        });
      })
      .finally(() => {
        setIsLoadingAddresses(false);
      });
  };

  /**
   * Adds new addresses to the user's Lattice.
   */
  const addAddresses = async (addressesToAdd: LatticeRecord[]) => {
    setIsLoadingAddresses(true);

    /**
     * Transform `addressesToAdd` data into chunks of size `ADDRESSES_PER_PAGE` with shape `{ key:
     * val }` for sending to Lattice because the Lattice can only handle a particular amount of
     * addresses at a time.
     */
    const recordsList = _.chain(addressesToAdd)
      .chunk(ADDRESSES_PER_PAGE)
      .map((addrChunk) =>
        _.chain(addrChunk).keyBy("key").mapValues("val").value()
      )
      .value();

    return new Promise<void>(async (resolve, reject) => {
      for await (const records of recordsList) {
        await session.client
          .addKvRecords({
            caseSensitive: false,
            type: ADDRESS_RECORD_TYPE,
            records,
          })
          .catch((err) => {
            sendErrorNotification(err);
            reject(err);
          });
      }
      resolve();
    })
      .then(async () => {
        // TODO: Remove fetch and call addAddressesToState() with the address data when FW is
        //  updated to return address data. See GitHub issue:
        //  https://github.com/GridPlus/k8x_firmware_production/issues/2323
        await fetchAddresses();
      })
      .catch(sendErrorNotification)
      .finally(() => {
        setIsLoadingAddresses(false);
      });
  };

  return {
    fetchAddresses,
    addresses,
    addAddresses,
    addAddressesToState,
    removeAddresses,
    removeAddressesFromState,
    resetAddressesInState,
    isLoadingAddressTags,
  };
};
