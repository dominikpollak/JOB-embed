export const translateFingerprint = async (fingerprint) => {
  const res = await fetch(
    "https://explorer-mainnet-prod.jamonbread.tech/api/v2/nft/assetByFingerprint",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ assetFingerprint: fingerprint }),
    }
  );

  const data = await res.json();

  return data;
};
