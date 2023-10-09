import { useContext } from "react";
import { AppContext } from "../store/AppContext";
import { getClient } from "gridplus-sdk";
import { useLattice } from "./useLattice";

/**
 * `useFeature` is a React hook for feature flags that makes it easy to know when a particular
 * feature is active for a version of the Lattice firmware (or other external data).
 *
 * To add a feature, add a SNAKE_CASE key to the `features` variable with an array that specifies
 * the required version of firmware as [fix, minor, major].
 */
export const useFeature = (): { [feature: string]: boolean } => {
  // const { client } = useLattice();
  // const { fix, minor, major } = client.getFwVersion();
  const fix = 0;
  const minor = 15;
  const major = 0;

  const features = {
    CAN_VIEW_CONTRACTS: [0, 14, 0],
    USES_AUTO_ABI: [0, 15, 0],
  };

  return Object.fromEntries(
    Object.entries(features).map(([key, [_fix, _minor, _major]]) => [
      key,
      fix >= _fix && minor >= _minor && major >= _major,
    ])
  );
};
