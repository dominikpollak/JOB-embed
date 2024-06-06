(function () {
  var decodeComponent = (function () {})();

  function splitOnFirst(string, separator) {
    if (!(typeof string === "string" && typeof separator === "string")) {
      throw new TypeError("Expected the arguments to be of type `string`");
    }

    if (string === "" || separator === "") {
      return [];
    }

    const separatorIndex = string.indexOf(separator);

    if (separatorIndex === -1) {
      return [];
    }

    return [
      string.slice(0, separatorIndex),
      string.slice(separatorIndex + separator.length),
    ];
  }

  function includeKeys(object, predicate) {
    const result = {};

    if (Array.isArray(predicate)) {
      for (const key of predicate) {
        const descriptor = Object.getOwnPropertyDescriptor(object, key);
        if (descriptor?.enumerable) {
          Object.defineProperty(result, key, descriptor);
        }
      }
    } else {
      // `Reflect.ownKeys()` is required to retrieve symbol properties
      for (const key of Reflect.ownKeys(object)) {
        const descriptor = Object.getOwnPropertyDescriptor(object, key);
        if (descriptor.enumerable) {
          const value = object[key];
          if (predicate(key, value, object)) {
            Object.defineProperty(result, key, descriptor);
          }
        }
      }
    }

    return result;
  }

  const isNullOrUndefined = (value) => value === null || value === undefined;

  // eslint-disable-next-line unicorn/prefer-code-point
  const strictUriEncode = (string) =>
    encodeURIComponent(string).replaceAll(
      /[!'()*]/g,
      (x) => `%${x.charCodeAt(0).toString(16).toUpperCase()}`
    );

  const encodeFragmentIdentifier = Symbol("encodeFragmentIdentifier");

  function encoderForArrayFormat(options) {
    switch (options.arrayFormat) {
      case "index": {
        return (key) => (result, value) => {
          const index = result.length;

          if (
            value === undefined ||
            (options.skipNull && value === null) ||
            (options.skipEmptyString && value === "")
          ) {
            return result;
          }

          if (value === null) {
            return [
              ...result,
              [encode(key, options), "[", index, "]"].join(""),
            ];
          }

          return [
            ...result,
            [
              encode(key, options),
              "[",
              encode(index, options),
              "]=",
              encode(value, options),
            ].join(""),
          ];
        };
      }

      case "bracket": {
        return (key) => (result, value) => {
          if (
            value === undefined ||
            (options.skipNull && value === null) ||
            (options.skipEmptyString && value === "")
          ) {
            return result;
          }

          if (value === null) {
            return [...result, [encode(key, options), "[]"].join("")];
          }

          return [
            ...result,
            [encode(key, options), "[]=", encode(value, options)].join(""),
          ];
        };
      }

      case "colon-list-separator": {
        return (key) => (result, value) => {
          if (
            value === undefined ||
            (options.skipNull && value === null) ||
            (options.skipEmptyString && value === "")
          ) {
            return result;
          }

          if (value === null) {
            return [...result, [encode(key, options), ":list="].join("")];
          }

          return [
            ...result,
            [encode(key, options), ":list=", encode(value, options)].join(""),
          ];
        };
      }

      case "comma":
      case "separator":
      case "bracket-separator": {
        const keyValueSeparator =
          options.arrayFormat === "bracket-separator" ? "[]=" : "=";

        return (key) => (result, value) => {
          if (
            value === undefined ||
            (options.skipNull && value === null) ||
            (options.skipEmptyString && value === "")
          ) {
            return result;
          }

          // Translate null to an empty string so that it doesn't serialize as 'null'
          value = value === null ? "" : value;

          if (result.length === 0) {
            return [
              [
                encode(key, options),
                keyValueSeparator,
                encode(value, options),
              ].join(""),
            ];
          }

          return [
            [result, encode(value, options)].join(options.arrayFormatSeparator),
          ];
        };
      }

      default: {
        return (key) => (result, value) => {
          if (
            value === undefined ||
            (options.skipNull && value === null) ||
            (options.skipEmptyString && value === "")
          ) {
            return result;
          }

          if (value === null) {
            return [...result, encode(key, options)];
          }

          return [
            ...result,
            [encode(key, options), "=", encode(value, options)].join(""),
          ];
        };
      }
    }
  }

  function parserForArrayFormat(options) {
    let result;

    switch (options.arrayFormat) {
      case "index": {
        return (key, value, accumulator) => {
          result = /\[(\d*)]$/.exec(key);

          key = key.replace(/\[\d*]$/, "");

          if (!result) {
            accumulator[key] = value;
            return;
          }

          if (accumulator[key] === undefined) {
            accumulator[key] = {};
          }

          accumulator[key][result[1]] = value;
        };
      }

      case "bracket": {
        return (key, value, accumulator) => {
          result = /(\[])$/.exec(key);
          key = key.replace(/\[]$/, "");

          if (!result) {
            accumulator[key] = value;
            return;
          }

          if (accumulator[key] === undefined) {
            accumulator[key] = [value];
            return;
          }

          accumulator[key] = [...accumulator[key], value];
        };
      }

      case "colon-list-separator": {
        return (key, value, accumulator) => {
          result = /(:list)$/.exec(key);
          key = key.replace(/:list$/, "");

          if (!result) {
            accumulator[key] = value;
            return;
          }

          if (accumulator[key] === undefined) {
            accumulator[key] = [value];
            return;
          }

          accumulator[key] = [...accumulator[key], value];
        };
      }

      case "comma":
      case "separator": {
        return (key, value, accumulator) => {
          const isArray =
            typeof value === "string" &&
            value.includes(options.arrayFormatSeparator);
          const isEncodedArray =
            typeof value === "string" &&
            !isArray &&
            decode(value, options).includes(options.arrayFormatSeparator);
          value = isEncodedArray ? decode(value, options) : value;
          const newValue =
            isArray || isEncodedArray
              ? value
                  .split(options.arrayFormatSeparator)
                  .map((item) => decode(item, options))
              : value === null
              ? value
              : decode(value, options);
          accumulator[key] = newValue;
        };
      }

      case "bracket-separator": {
        return (key, value, accumulator) => {
          const isArray = /(\[])$/.test(key);
          key = key.replace(/\[]$/, "");

          if (!isArray) {
            accumulator[key] = value ? decode(value, options) : value;
            return;
          }

          const arrayValue =
            value === null
              ? []
              : value
                  .split(options.arrayFormatSeparator)
                  .map((item) => decode(item, options));

          if (accumulator[key] === undefined) {
            accumulator[key] = arrayValue;
            return;
          }

          accumulator[key] = [...accumulator[key], ...arrayValue];
        };
      }

      default: {
        return (key, value, accumulator) => {
          if (accumulator[key] === undefined) {
            accumulator[key] = value;
            return;
          }

          accumulator[key] = [...[accumulator[key]].flat(), value];
        };
      }
    }
  }

  function validateArrayFormatSeparator(value) {
    if (typeof value !== "string" || value.length !== 1) {
      throw new TypeError(
        "arrayFormatSeparator must be single character string"
      );
    }
  }

  function encode(value, options) {
    if (options.encode) {
      return options.strict
        ? strictUriEncode(value)
        : encodeURIComponent(value);
    }

    return value;
  }

  function decode(value, options) {
    if (options.decode) {
      return decodeComponent(value);
    }

    return value;
  }

  function keysSorter(input) {
    if (Array.isArray(input)) {
      return input.sort();
    }

    if (typeof input === "object") {
      return keysSorter(Object.keys(input))
        .sort((a, b) => Number(a) - Number(b))
        .map((key) => input[key]);
    }

    return input;
  }

  function removeHash(input) {
    const hashStart = input.indexOf("#");
    if (hashStart !== -1) {
      input = input.slice(0, hashStart);
    }

    return input;
  }

  function getHash(url) {
    let hash = "";
    const hashStart = url.indexOf("#");
    if (hashStart !== -1) {
      hash = url.slice(hashStart);
    }

    return hash;
  }

  function parseValue(value, options) {
    if (
      options.parseNumbers &&
      !Number.isNaN(Number(value)) &&
      typeof value === "string" &&
      value.trim() !== ""
    ) {
      value = Number(value);
    } else if (
      options.parseBooleans &&
      value !== null &&
      (value.toLowerCase() === "true" || value.toLowerCase() === "false")
    ) {
      value = value.toLowerCase() === "true";
    }

    return value;
  }

  function extract(input) {
    input = removeHash(input);
    const queryStart = input.indexOf("?");
    if (queryStart === -1) {
      return "";
    }

    return input.slice(queryStart + 1);
  }

  function parse(query, options) {
    options = {
      decode: true,
      sort: true,
      arrayFormat: "none",
      arrayFormatSeparator: ",",
      parseNumbers: false,
      parseBooleans: false,
      ...options,
    };

    validateArrayFormatSeparator(options.arrayFormatSeparator);

    const formatter = parserForArrayFormat(options);

    // Create an object with no prototype
    const returnValue = Object.create(null);

    if (typeof query !== "string") {
      return returnValue;
    }

    query = query.trim().replace(/^[?#&]/, "");

    if (!query) {
      return returnValue;
    }

    for (const parameter of query.split("&")) {
      if (parameter === "") {
        continue;
      }

      const parameter_ = options.decode
        ? parameter.replaceAll("+", " ")
        : parameter;

      let [key, value] = splitOnFirst(parameter_, "=");

      if (key === undefined) {
        key = parameter_;
      }

      // Missing `=` should be `null`:
      // http://w3.org/TR/2012/WD-url-20120524/#collect-url-parameters
      value =
        value === undefined
          ? null
          : ["comma", "separator", "bracket-separator"].includes(
              options.arrayFormat
            )
          ? value
          : decode(value, options);
      formatter(decode(key, options), value, returnValue);
    }

    for (const [key, value] of Object.entries(returnValue)) {
      if (typeof value === "object" && value !== null) {
        for (const [key2, value2] of Object.entries(value)) {
          value[key2] = parseValue(value2, options);
        }
      } else {
        returnValue[key] = parseValue(value, options);
      }
    }

    if (options.sort === false) {
      return returnValue;
    }

    // TODO: Remove the use of `reduce`.
    // eslint-disable-next-line unicorn/no-array-reduce
    return (
      options.sort === true
        ? Object.keys(returnValue).sort()
        : Object.keys(returnValue).sort(options.sort)
    ).reduce((result, key) => {
      const value = returnValue[key];
      result[key] =
        Boolean(value) && typeof value === "object" && !Array.isArray(value)
          ? keysSorter(value)
          : value;
      return result;
    }, Object.create(null));
  }

  function stringify(object, options) {
    if (!object) {
      return "";
    }

    options = {
      encode: true,
      strict: true,
      arrayFormat: "none",
      arrayFormatSeparator: ",",
      ...options,
    };

    validateArrayFormatSeparator(options.arrayFormatSeparator);

    const shouldFilter = (key) =>
      (options.skipNull && isNullOrUndefined(object[key])) ||
      (options.skipEmptyString && object[key] === "");

    const formatter = encoderForArrayFormat(options);

    const objectCopy = {};

    for (const [key, value] of Object.entries(object)) {
      if (!shouldFilter(key)) {
        objectCopy[key] = value;
      }
    }

    const keys = Object.keys(objectCopy);

    if (options.sort !== false) {
      keys.sort(options.sort);
    }

    return keys
      .map((key) => {
        const value = object[key];

        if (value === undefined) {
          return "";
        }

        if (value === null) {
          return encode(key, options);
        }

        if (Array.isArray(value)) {
          if (
            value.length === 0 &&
            options.arrayFormat === "bracket-separator"
          ) {
            return encode(key, options) + "[]";
          }

          return value.reduce(formatter(key), []).join("&");
        }

        return encode(key, options) + "=" + encode(value, options);
      })
      .filter((x) => x.length > 0)
      .join("&");
  }

  function parseUrl(url, options) {
    options = {
      decode: true,
      ...options,
    };

    let [url_, hash] = splitOnFirst(url, "#");

    if (url_ === undefined) {
      url_ = url;
    }

    return {
      url: url_?.split("?")?.[0] ?? "",
      query: parse(extract(url), options),
      ...(options && options.parseFragmentIdentifier && hash
        ? { fragmentIdentifier: decode(hash, options) }
        : {}),
    };
  }

  function stringifyUrl(object, options) {
    options = {
      encode: true,
      strict: true,
      [encodeFragmentIdentifier]: true,
      ...options,
    };

    const url = removeHash(object.url).split("?")[0] || "";
    const queryFromUrl = extract(object.url);

    const query = {
      ...parse(queryFromUrl, { sort: false }),
      ...object.query,
    };

    let queryString = stringify(query, options);
    queryString &&= `?${queryString}`;

    let hash = getHash(object.url);
    if (typeof object.fragmentIdentifier === "string") {
      const urlObjectForFragmentEncode = new URL(url);
      urlObjectForFragmentEncode.hash = object.fragmentIdentifier;
      hash = options[encodeFragmentIdentifier]
        ? urlObjectForFragmentEncode.hash
        : `#${object.fragmentIdentifier}`;
    }

    return `${url}${queryString}${hash}`;
  }

  function pick(input, filter, options) {
    options = {
      parseFragmentIdentifier: true,
      [encodeFragmentIdentifier]: false,
      ...options,
    };

    const { url, query, fragmentIdentifier } = parseUrl(input, options);

    return stringifyUrl(
      {
        url,
        query: includeKeys(query, filter),
        fragmentIdentifier,
      },
      options
    );
  }

  function exclude(input, filter, options) {
    const exclusionFilter = Array.isArray(filter)
      ? (key) => !filter.includes(key)
      : (key, value) => !filter(key, value);

    return pick(input, exclusionFilter, options);
  }

  var queryString = /*#__PURE__*/ Object.freeze({
    __proto__: null,
    exclude: exclude,
    extract: extract,
    parse: parse,
    parseUrl: parseUrl,
    pick: pick,
    stringify: stringify,
    stringifyUrl: stringifyUrl,
  });

  const getUrl = (path, params) =>
    queryString.stringifyUrl({
      url: `https://api-mainnet-prod.jamonbread.tech/api/${path}`,
      query: params,
    });

  const fetchNftListing = async (policyId, assetNameHex) => {
    if (!policyId || !assetNameHex) return null;

    const res = await fetch(
      getUrl("nfts/listing", {
        policyId,
        assetNameHex,
      })
    );

    const data = await res.json();

    return data;
  };

  const generateImgUrl = (assetFingerprint, size) => {
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

  const renderAssetElements = (url, price, fingerprint) => {
    const priceSpans = document.getElementsByClassName("iframe_price_span");
    const thumbnailSpans = document.getElementsByClassName(
      "iframe_thumbnail_span"
    );

    if (priceSpans.length > 0) {
      for (let i = 0; i < priceSpans.length; i++) {
        const priceConfig = JSON.parse(priceSpans[i].dataset.config);

        if (fingerprint !== priceConfig.fingerprint) continue;

        const priceAnchor = document.createElement("a");
        priceAnchor.href = `${url}/asset/${priceConfig.fingerprint}`;
        priceAnchor.target = "_blank";
        priceAnchor.rel = "noopener noreferrer";
        priceAnchor.className = "job_element_price";
        priceSpans[i].appendChild(priceAnchor);

        if (price) {
          priceAnchor.innerHTML = `${"₳ " + price / 1000000}`;
        } else if (priceConfig.priceFallback) {
          priceAnchor.innerHTML = `${priceConfig.priceFallback}`;
        }
      }
    }

    if (thumbnailSpans.length > 0) {
      for (let i = 0; i < thumbnailSpans.length; i++) {
        const thumbnailConfig = JSON.parse(thumbnailSpans[i].dataset.config);

        if (fingerprint !== thumbnailConfig.fingerprint) continue;

        const thumbnailAnchor = document.createElement("a");
        thumbnailAnchor.href = `${url}/asset/${thumbnailConfig.fingerprint}`;
        thumbnailAnchor.target = "_blank";
        thumbnailAnchor.rel = "noopener noreferrer";
        thumbnailAnchor.className = "job_element_thumbnail";
        thumbnailSpans[i].appendChild(thumbnailAnchor);

        const thumbnailImage = document.createElement("img");
        thumbnailImage.src = `https://p-i.jamonbread.io/${generateImgUrl(
          thumbnailConfig.fingerprint,
          thumbnailConfig.size || "md"
        )}`;
        thumbnailImage.className = "job_element_thumbnail";
        thumbnailAnchor.appendChild(thumbnailImage);
      }
    }
  };

  const renderGraphs = (url) => {
    const iframeGraphDivs = document.getElementsByClassName("iframe_graph_div");

    if (iframeGraphDivs.length > 0) {
      for (let i = 0; i < iframeGraphDivs.length; i++) {
        const iframeConfig = JSON.parse(iframeGraphDivs[i].dataset.config);
        const graphIframe = document.createElement("iframe");
        graphIframe.src = `${url}/iframe/collectionGraph?pi=${iframeConfig.policyId}&theme=${jamConfig.theme}&tf=${jamConfig.defaultTimeFrame}&sv=${iframeConfig.showVolume}&sap=${iframeConfig.showAvgPrice}&spr=${iframeConfig.showPriceRange}&sl=${iframeConfig.showListings}&a=${jamConfig.affilCode}`;
        graphIframe.className = "job_graph_iframe";
        graphIframe.scrolling = "no";
        iframeGraphDivs[i].appendChild(graphIframe);
      }
    }
  };

  const translateFingerprint = async (fingerprint) => {
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

  // bundle.js must be wrapped in an IIFE after every build to avoid polluting the global scope

  const jobConfig = jamConfig || window.jamConfig;

  if (!jobConfig) {
    throw new Error("jamConfig is not defined");
  }

  const url = jobConfig.testnet
    ? "https://testnet-stage.jamonbread.tech"
    : "https://jamonbread.io";

  const btn = document.getElementsByClassName("jamonbread");
  const iframeListDivs = document.getElementsByClassName("iframe_list_div");

  renderGraphs(url);

  if (iframeListDivs.length > 0) {
    for (let i = 0; i < iframeListDivs.length; i++) {
      const iframeConfig = JSON.parse(iframeListDivs[i].dataset.config);
      const listIframe = document.createElement("iframe");
      listIframe.src = `${url}/iframe/collectionList/${iframeConfig.policyId}?theme=${jobConfig.theme}&lu=${jobConfig.logoUrl}&ls=${jobConfig.logoSize}&pn=${jobConfig.projectName}&nfs=${jobConfig.nameFontSize}&dv=${jobConfig.defaultView}&a=${jobConfig.affilCode}`;
      listIframe.className = "job_list_iframe";
      iframeListDivs[i].appendChild(listIframe);
    }
  }

  const processedFingerprints = new Set();

  for (let i = 0; i < btn.length; i++) {
    const config = JSON.parse(btn[i].dataset.config);

    if (config.policyid && config.buttonType === "collectionOffer") {
      btn[i].innerHTML = config.buttonLabel;
      btn[i].style.display = "inline-block";
    } else if (
      config.fingerprint &&
      (config.buttonType === "buy" ||
        config.buttonType === "offer" ||
        config.buttonType === "list")
    ) {
      (async () => {
        if (!processedFingerprints.has(config.fingerprint)) {
          processedFingerprints.add(config.fingerprint);
          const fp = config.fingerprint.includes("asset")
            ? config.fingerprint
            : `asset${config.fingerprint}`;
          const fingerprintRes = await translateFingerprint(fp);

          const res = await fetchNftListing(
            fingerprintRes.policyId,
            fingerprintRes.assetName
          );

          renderAssetElements(
            url,
            res.sellOrder ? res.sellOrder.price : 0,
            config.fingerprint
          );

          // If user doesn't own the asset, don't show the list button
          if (
            res.owner.address &&
            res.owner.address !== jobConfig.wallet &&
            config.buttonType === "list"
          ) {
            return;
          }

          // If user is listed by the user, don't show the buy button
          if (
            res.sellOrder &&
            res.sellOrder.listedByAddress === jobConfig.wallet &&
            config.buttonType === "buy"
          ) {
            return;
          }

          if (!res.sellOrder && config.buttonType === "buy") {
            if (config.fallbackButtonLabel) {
              btn[i].innerHTML = config.fallbackButtonLabel;
              btn[i].classList.remove("job_asset_buy_button");
              btn[i].classList.add("job_asset_fallback_button");
            } else if (jobConfig.alwaysDisplayButton) {
              btn[i].innerHTML = config.buttonLabel;
              btn[i].style.display = "inline-block";
            }
          } else {
            btn[i].innerHTML = config.buttonLabel;
            btn[i].style.display = "inline-block";
          }
        }
      })();
    }

    let newWindow;
    btn[i].addEventListener("click", async (e) => {
      let iframeSrc = "";
      if (btn[i].classList.contains("job_collectionInfo_button")) {
        iframeSrc = `${url}/iframe/collectionOffer/${config.policyid}?theme=${jobConfig.theme}&showPopup=${jobConfig.showPopup}&a=${jobConfig.affilCode}`;
        newWindow = window.open(
          iframeSrc,
          "_blank",
          "toolbar=no,location=no, menubar=no, titlebar=no, scrollbars=no,resizable=yes,top=0,left=200,width=1100,height=800"
        );
      } else if (
        btn[i].classList.contains(`job_asset_${config.buttonType}_button`) ||
        btn[i].classList.contains("job_asset_fallback_button")
      ) {
        iframeSrc = `${url}/iframe/asset/${config.fingerprint}?theme=${jobConfig.theme}&type=${config.buttonType}&showPopup=${jobConfig.showPopup}&a=${jobConfig.affilCode}`;
        newWindow = window.open(
          iframeSrc,
          "_blank",
          "toolbar=no,location=no, menubar=no, titlebar=no, scrollbars=no,resizable=yes,top=0,left=500,width=420,height=800"
        );
      }

      setTimeout(function () {
        newWindow.postMessage(
          {
            id: "job_frame",
            data: {
              logoUrl: jobConfig.logoUrl,
              logoSize: jobConfig.logoSize,
              projectName: jobConfig.projectName,
              nameFontSize: jobConfig.nameFontSize,
            },
          },
          "*"
        );
      }, 1000);
    });
  }
})();
