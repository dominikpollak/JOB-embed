import { fetchNftListing } from "../utils/fetchNftListing";

console.log("Hello, world!");

const btn = document.getElementById("jamonbread");

btn.addEventListener("click", async (e) => {
  const listing = await fetchNftListing(
    e.currentTarget.dataset.policyId,
    e.currentTarget.dataset.assetName
  );
  console.log(listing);
});
