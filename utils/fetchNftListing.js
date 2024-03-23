import { getUrl } from "../utils/getUrl";

export const fetchNftListing = async (policyId, assetNameHex, extended) => {
  if (!policyId || !assetNameHex) return null;

  const res = await fetch(
    getUrl("nfts/listing", {
      policyId,
      assetNameHex,
      extended,
    })
  );

  return res.data;
};
