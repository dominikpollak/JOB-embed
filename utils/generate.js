document
  .getElementById("generateButton")
  .addEventListener("click", function () {
    const newButton = document.createElement("button");
    newButton.className = "jamonbread job_asset_buy_button";
    newButton.dataset.config = JSON.stringify({
      fingerprint: "1cqxn80u7a743rfuqglmklrvnpxht3esudkqmj6",
      buttonType: "buy",
      buttonLabel: "Buy now",
      fallbackButtonLabel: "",
    });
    document.body.appendChild(newButton);

    const newPriceSpan = document.createElement("span");
    newPriceSpan.className = "iframe_price_span";
    newPriceSpan.dataset.config = JSON.stringify({
      fingerprint: "1cqxn80u7a743rfuqglmklrvnpxht3esudkqmj6",
      priceFallback: "",
    });
    document.body.appendChild(newPriceSpan);

    const newThumbnailSpan = document.createElement("span");
    newThumbnailSpan.className = "iframe_thumbnail_span";
    newThumbnailSpan.dataset.config = JSON.stringify({
      fingerprint: "1cqxn80u7a743rfuqglmklrvnpxht3esudkqmj6",
      size: "md",
    });
    document.body.appendChild(newThumbnailSpan);
  });
