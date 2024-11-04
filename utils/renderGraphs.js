export const renderGraphs = (url) => {
  const iframeGraphDivs = document.getElementsByClassName("iframe_graph_div");

  if (iframeGraphDivs.length > 0) {
    for (let i = 0; i < iframeGraphDivs.length; i++) {
      if (iframeGraphDivs[i].dataset.processed) continue;
      iframeGraphDivs[i].dataset.processed = "true";
      const iframeConfig = JSON.parse(iframeGraphDivs[i].dataset.config);
      const graphIframe = document.createElement("iframe");
      graphIframe.src = `${url}/iframe/collectionGraph?pi=${iframeConfig.policyId}&theme=${jamConfig.theme}&tf=${jamConfig.defaultTimeFrame}&sv=${iframeConfig.showVolume}&sap=${iframeConfig.showAvgPrice}&spr=${iframeConfig.showPriceRange}&sl=${iframeConfig.showListings}&a=${jamConfig.affilCode}`;
      graphIframe.className = "job_graph_iframe";
      graphIframe.scrolling = "no";
      iframeGraphDivs[i].appendChild(graphIframe);
    }
  }
};
