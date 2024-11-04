import { generateImgUrl } from "./generateImgUrl";

export const renderAssetElements = (url, price, fingerprint, affilCode) => {
  const priceSpans = document.getElementsByClassName("iframe_price_span");
  const thumbnailSpans = document.getElementsByClassName(
    "iframe_thumbnail_span"
  );

  if (priceSpans.length > 0) {
    for (let i = 0; i < priceSpans.length; i++) {
      if (priceSpans[i].dataset.processed) continue;
      priceSpans[i].dataset.processed = "true";
      const priceConfig = JSON.parse(priceSpans[i].dataset.config);

      if (fingerprint !== priceConfig.fingerprint) continue;

      const priceAnchor = document.createElement("a");
      priceAnchor.href = `${url}/asset/${priceConfig.fingerprint}${
        affilCode ? `?a=${affilCode}` : ""
      }`;
      priceAnchor.target = "_blank";
      priceAnchor.rel = "noopener noreferrer";
      priceAnchor.className = "job_element_price";
      priceSpans[i].appendChild(priceAnchor);

      if (price) {
        priceAnchor.innerHTML = `${"\u20B3 " + price / 1000000}`;
      } else if (priceConfig.priceFallback) {
        priceAnchor.innerHTML = `${priceConfig.priceFallback}`;
      }
    }
  }

  if (thumbnailSpans.length > 0) {
    for (let i = 0; i < thumbnailSpans.length; i++) {
      if (thumbnailSpans[i].dataset.processed) continue;
      thumbnailSpans[i].dataset.processed = "true";
      const thumbnailConfig = JSON.parse(thumbnailSpans[i].dataset.config);

      if (fingerprint !== thumbnailConfig.fingerprint) continue;

      const thumbnailAnchor = document.createElement("a");
      thumbnailAnchor.href = `${url}/asset/${thumbnailConfig.fingerprint}${
        affilCode ? `?a=${affilCode}` : ""
      }`;
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
