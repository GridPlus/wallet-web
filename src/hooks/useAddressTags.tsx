import { ADDRESSES_PER_PAGE } from "@/util/constants";
import {
  addAddressTags as addAddressTagsToLattice,
  fetchAddressTags as fetchAddressTagsFromLattice,
  removeAddressTags as removeAddressTagsFromLattice,
} from "gridplus-sdk";
import _ from "lodash";
import isEmpty from "lodash/isEmpty";
import { useCallback, useContext } from "react";
import { AppContext } from "../store/AppContext";
import { Address, AddressTag } from "../types/records";
import { sendErrorNotification } from "../util/sendErrorNotification";

/**
 * The `useAddressTags` hook is used to manage the external calls for fetching, adding, and removing
 * key-value address data on the user's Lattice and caching that data in `store`.
 */
export const useAddressTags = () => {
  const {
    isLoadingAddressTags,
    setIsLoadingAddressTags,
    addressTags,
    addAddressTagsToState,
    removeAddressTagsFromState,
    resetAddressTagsInState,
  } = useContext(AppContext);

  /**
   * Fetches the installed addressTags from the user's Lattice.
   */
  const fetchAddressTags = useCallback(
    async (fetched = 0) => {
      console.log("fetching address tags");
      setIsLoadingAddressTags(true);

      return fetchAddressTagsFromLattice({
        start: fetched,
        n: ADDRESSES_PER_PAGE,
      })
        .then(async (res) => {
          addAddressTagsToState(res);
        })
        .catch((err) => {
          sendErrorNotification({
            ...err,
            onClick: fetchAddressTags,
          });
        })
        .finally(() => {
          setIsLoadingAddressTags(false);
        });
    },
    [addAddressTagsToState, setIsLoadingAddressTags]
  );

  /**
   * Removes installed addressTags from the user's Lattice.
   */
  const removeAddressTags = (selectedAddressTags: AddressTag[]) => {
    console.log("removing address tags");
    if (isEmpty(selectedAddressTags)) return;
    setIsLoadingAddressTags(true);

    return removeAddressTagsFromLattice(selectedAddressTags)
      .then(() => {
        removeAddressTagsFromState(selectedAddressTags);
      })
      .catch((err) => {
        sendErrorNotification({
          ...err,
          onClick: () => removeAddressTags(selectedAddressTags),
        });
      })
      .finally(() => {
        setIsLoadingAddressTags(false);
      });
  };

  /**
   * Adds new addressTags to the user's Lattice.
   */
  const addAddressTags = async (addressTagsToAdd: Address[]) => {
    console.log("adding address tags");
    setIsLoadingAddressTags(true);

    /**
     * Transform `addressTagsToAdd` data into chunks of size `ADDRESSES_PER_PAGE` with shape `{ key:
     * val }` for sending to Lattice because the Lattice can only handle a particular amount of
     * addressTags at a time.
     */
    const recordsList = _.chain(addressTagsToAdd)
      .chunk(ADDRESSES_PER_PAGE)
      .map((addrChunk) =>
        _.chain(addrChunk).keyBy("key").mapValues("val").value()
      )
      .value();

    return new Promise<Buffer[]>(async (resolve, reject) => {
      let results = [];
      for await (const records of recordsList) {
        const result = await addAddressTagsToLattice(recordsList).catch(
          (err) => {
            sendErrorNotification(err);
            reject(err);
          }
        );
        if (result) {
          results.push(result);
        }
      }
      if (results.length) {
        resolve(results);
      } else {
        reject();
      }
    })
      .then(async (newAddrs) => {
        // TODO: Remove fetch and call addAddressTagsToState() with the address data when FW is
        //  updated to return address data. See GitHub issue:
        //  https://github.com/GridPlus/k8x_firmware_production/issues/2323
        await fetchAddressTags();
        return newAddrs;
      })
      .finally(() => {
        setIsLoadingAddressTags(false);
      });
  };

  return {
    addressTags,
    fetchAddressTags,
    addAddressTags,
    removeAddressTags,
    isLoadingAddressTags,
    resetAddressTagsInState,
  };
};
