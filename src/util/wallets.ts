export function isEmptyUInt8Array(arr: Uint8Array): boolean {
  return arr.every((el) => el === 0);
}
