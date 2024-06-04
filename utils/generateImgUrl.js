export const generateImgUrl = (assetFingerprint, size) => {
  return (
    assetFingerprint[!assetFingerprint.startsWith("asset1") ? 1 : 6] +
    "/" +
    assetFingerprint[!assetFingerprint.startsWith("asset1") ? 7 : 12] +
    "/" +
    assetFingerprint[!assetFingerprint.startsWith("asset1") ? 12 : 17] +
    "/" +
    assetFingerprint[!assetFingerprint.startsWith("asset1") ? 20 : 25] +
    "/" +
    assetFingerprint[!assetFingerprint.startsWith("asset1") ? 22 : 27] +
    "/" +
    assetFingerprint[!assetFingerprint.startsWith("asset1") ? 26 : 31] +
    "/" +
    `${assetFingerprint.startsWith("asset1") ? "" : "asset"}` +
    assetFingerprint +
    "/" +
    size
  );
};
