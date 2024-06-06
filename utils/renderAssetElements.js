import { generateImgUrl } from "./generateImgUrl";

export const renderAssetElements = (url, price, fingerprint) => {
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
        priceAnchor.innerHTML = `${"\u20B3 " + price / 1000000}`;
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
