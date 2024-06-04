export const renderGraphs = () => {
  const iframeGraphDivs = document.getElementsByClassName("iframe_graph_div");
  // localhost:3000/iframe/CollectionGraph?pi=omen&theme=dimmed

  if (iframeGraphDivs.length > 0) {
    for (let i = 0; i < iframeGraphDivs.length; i++) {
      const iframeConfig = JSON.parse(iframeGraphDivs[i].dataset.config);
      const graphIframe = document.createElement("iframe");
      graphIframe.src = `http://localhost:3000/iframe/collectionGraph?pi=${iframeConfig.policyId}&theme=${jamConfig.theme}&tf=${jamConfig.defaultTimeFrame}&sv=${iframeConfig.showVolume}&sap=${iframeConfig.showAvgPrice}&spr=${iframeConfig.showPriceRange}&sl=${iframeConfig.showListings}&a=${jamConfig.affilCode}`;
      graphIframe.className = "job_graph_iframe";
      graphIframe.scrolling = "no";
      iframeGraphDivs[i].appendChild(graphIframe);
    }
  }
};
