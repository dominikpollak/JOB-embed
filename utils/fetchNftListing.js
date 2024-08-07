import { getUrl } from "./getUrl.js";

export const fetchNftListing = async (policyId, assetNameHex) => {
  if (!policyId || !assetNameHex) return null;

  try {
    const res = await fetch(
      getUrl("nfts/listing", {
        policyId,
        assetNameHex,
      })
    );

    const data = await res.json();

    return data;
  } catch (error) {
    console.error(error);
    return null;
  }
};
