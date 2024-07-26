import { getUrl } from "./getUrl";

export const fetchCollectionDetail = async (collection) => {
  try {
    const res = await fetch(getUrl(`nfts/collections/${collection}`));
    return res;
  } catch (error) {
    console.error(error);
    return null;
  }
};
