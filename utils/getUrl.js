import queryString from "query-string";

export const getUrl = (path, params) =>
  queryString.stringifyUrl({
    url: `https://api-mainnet-prod.jamonbread.tech/api/${path}`,
    query: params,
  });
