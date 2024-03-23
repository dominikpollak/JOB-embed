export const getUrl = (path, params) =>
  queryString.stringifyUrl({
    url: `https://api-mainnet-stage.jamonbread.tech/api/${path}`,
    query: params,
  });
