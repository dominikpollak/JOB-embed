(function () {
  const renderGraphs = () => {
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

  const jamConfig$1 = window.jamConfig;
  console.log("jamConfig", jamConfig$1);

  if (!jamConfig$1) {
    throw new Error("jamConfig is not defined");
  }

  const url = jamConfig$1.testnet
    ? "https://testnet-stage.jamonbread.tech/iframe"
    : "https://jamonbread.io/iframe";

  document.getElementsByClassName("jamonbread");
  const iframeListDivs = document.getElementsByClassName("iframe_list_div");
  console.log(iframeListDivs);

  renderGraphs();

  if (iframeListDivs.length > 0) {
    for (let i = 0; i < iframeListDivs.length; i++) {
      const iframeConfig = JSON.parse(iframeListDivs[i].dataset.config);
      const listIframe = document.createElement("iframe");
      listIframe.src = `${url}/collectionList/${iframeConfig.policyId}?theme=${jamConfig$1.theme}&lu=${jamConfig$1.logoUrl}&ls=${jamConfig$1.logoSize}&pn=${jamConfig$1.projectName}&nfs=${jamConfig$1.nameFontSize}&dv=${jamConfig$1.defaultView}&a=${jamConfig$1.affilCode}`;
      listIframe.className = "job_list_iframe";
      iframeListDivs[i].appendChild(listIframe);
    }
  }

  // for (let i = 0; i < btn.length; i++) {
  //   const config = JSON.parse(btn[i].dataset.config);

  //   if (config.policyid && config.buttonType === "collectionOffer") {
  //     btn[i].innerHTML = config.buttonLabel;
  //     btn[i].style.display = "inline-block";
  //   } else if (
  //     config.fingerprint &&
  //     (config.buttonType === "buy" ||
  //       config.buttonType === "offer" ||
  //       config.buttonType === "list")
  //   ) {
  //     (async () => {
  //       const fp = config.fingerprint.includes("asset")
  //         ? config.fingerprint
  //         : `asset${config.fingerprint}`;
  //       const fingerprintRes = await translateFingerprint(fp);

  //       const res = await fetchNftListing(
  //         fingerprintRes.policyId,
  //         fingerprintRes.assetName
  //       );

  //       renderAssetElements(
  //         res.sellOrder ? res.sellOrder.price : 0,
  //         config.fingerprint
  //       );

  //       // If user doesn't own the asset, don't show the list button
  //       if (
  //         res.owner.address &&
  //         res.owner.address !== jamConfig.wallet &&
  //         config.buttonType === "list"
  //       ) {
  //         return;
  //       }

  //       // If user is listed by the user, don't show the buy button
  //       if (
  //         res.sellOrder &&
  //         res.sellOrder.listedByAddress === jamConfig.wallet &&
  //         config.buttonType === "buy"
  //       ) {
  //         return;
  //       }

  //       if (!res.sellOrder && config.buttonType === "buy") {
  //         if (config.fallbackButtonLabel) {
  //           btn[i].innerHTML = config.fallbackButtonLabel;
  //           btn[i].classList.remove("job_asset_buy_button");
  //           btn[i].classList.add("job_asset_fallback_button");
  //         } else if (jamConfig.alwaysDisplayButton) {
  //           btn[i].innerHTML = config.buttonLabel;
  //           btn[i].style.display = "inline-block";
  //         }
  //       } else {
  //         btn[i].innerHTML = config.buttonLabel;
  //         btn[i].style.display = "inline-block";
  //       }
  //     })();
  //   }

  //   let newWindow;
  //   btn[i].addEventListener("click", async (e) => {
  //     let iframeSrc = "";
  //     if (btn[i].classList.contains("job_collectionInfo_button")) {
  //       iframeSrc = `${url}/collectionOffer/${config.policyid}?theme=${jamConfig.theme}&showPopup=${jamConfig.showPopup}&a=${jamConfig.affilCode}`;
  //       newWindow = window.open(
  //         iframeSrc,
  //         "_blank",
  //         "toolbar=no,location=no, menubar=no, titlebar=no, scrollbars=no,resizable=yes,top=0,left=200,width=1100,height=800"
  //       );
  //     } else if (
  //       btn[i].classList.contains(`job_asset_${config.buttonType}_button`) ||
  //       btn[i].classList.contains("job_asset_fallback_button")
  //     ) {
  //       iframeSrc = `${url}/asset/${config.fingerprint}?theme=${jamConfig.theme}&type=${config.buttonType}&showPopup=${jamConfig.showPopup}&a=${jamConfig.affilCode}`;
  //       newWindow = window.open(
  //         iframeSrc,
  //         "_blank",
  //         "toolbar=no,location=no, menubar=no, titlebar=no, scrollbars=no,resizable=yes,top=0,left=500,width=420,height=800"
  //       );
  //     }

  //     setTimeout(function () {
  //       newWindow.postMessage(
  //         {
  //           id: "job_frame",
  //           data: {
  //             logoUrl: jamConfig.logoUrl,
  //             logoSize: jamConfig.logoSize,
  //             projectName: jamConfig.projectName,
  //             nameFontSize: jamConfig.nameFontSize,
  //           },
  //         },
  //         "*"
  //       );
  //     }, 1000);
  //   });
  // }
})();
