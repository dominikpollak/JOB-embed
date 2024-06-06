export const renderGraphs = (url) => {
  const iframeGraphDivs = document.getElementsByClassName("iframe_graph_div");

  if (iframeGraphDivs.length > 0) {
    for (let i = 0; i < iframeGraphDivs.length; i++) {
      iframeGraphDivs[i].style.position = "relative";
      const iframeConfig = JSON.parse(iframeGraphDivs[i].dataset.config);
      const graphAnchor = document.createElement("a");
      graphAnchor.href = `${url}/collections/${iframeConfig.policyId}`;
      graphAnchor.target = "_blank";
      graphAnchor.rel = "noopener noreferrer";
      iframeGraphDivs[i].appendChild(graphAnchor);
      const graphIframe = document.createElement("iframe");
      graphIframe.src = `${url}/iframe/collectionGraph?pi=${iframeConfig.policyId}&theme=${jamConfig.theme}&tf=${jamConfig.defaultTimeFrame}&sv=${iframeConfig.showVolume}&sap=${iframeConfig.showAvgPrice}&spr=${iframeConfig.showPriceRange}&sl=${iframeConfig.showListings}&a=${jamConfig.affilCode}`;
      graphIframe.className = "job_graph_iframe";
      graphIframe.scrolling = "no";
      graphAnchor.appendChild(graphIframe);

      const overlayDiv = document.createElement("div");
      overlayDiv.style.position = "absolute";
      overlayDiv.style.top = "0";
      overlayDiv.style.left = "0";
      overlayDiv.style.width = "100%";
      overlayDiv.style.height = "100%";
      overlayDiv.style.zIndex = "10";
      overlayDiv.style.cursor = "pointer";
      graphAnchor.appendChild(overlayDiv);
    }
  }
};
