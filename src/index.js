import { fetchCollectionDetail } from "../utils/fetchCollectionDetail.js";
import { fetchNftListing } from "../utils/fetchNftListing.js";
import { renderAssetElements } from "../utils/renderAssetElements.js";
import { renderGraphs } from "../utils/renderGraphs.js";
import { translateFingerprint } from "../utils/translateFingerprint.js";

// bundle.js must be wrapped in an IIFE after every build to avoid polluting the global scope

const jobConfig = jamConfig || window.jamConfig;

if (!jobConfig) {
  throw new Error("jamConfig is not defined");
}

const url = jobConfig.testnet
  ? "https://testnet-stage.jamonbread.tech"
  : "https://jamonbread.io";

const processElements = () => {
  const btn = document.getElementsByClassName("jamonbread");
  const iframeListDivs = document.getElementsByClassName("iframe_list_div");
  const iframeListDiv = document.getElementById("iframe_list_div");

  renderGraphs(url);

  if (iframeListDiv && !iframeListDiv.dataset.processed) {
    const iframeConfig = JSON.parse(iframeListDiv.dataset.config);

    (async () => {
      const res = await fetchCollectionDetail(iframeConfig.policyId);
      if (res.status === 200) {
        const listIframe = document.createElement("iframe");
        listIframe.src = `${url}/iframe/collectionList/${iframeConfig.policyId}?theme=${jobConfig.theme}&lu=${jobConfig.logoUrl}&ls=${jobConfig.logoSize}&pn=${jobConfig.projectName}&nfs=${jobConfig.nameFontSize}&dv=${jobConfig.defaultView}&a=${jobConfig.affilCode}`;
        listIframe.className = "job_list_iframe";
        iframeListDiv.appendChild(listIframe);
        iframeListDiv.dataset.processed = "true";
      } else {
        iframeListDiv.classList.add("job-not-found-collection");
      }
    })();
  }

  for (let i = 0; i < iframeListDivs.length; i++) {
    if (!iframeListDivs[i].dataset.processed) {
      const iframeConfig = JSON.parse(iframeListDivs[i].dataset.config);

      (async () => {
        const res = await fetchCollectionDetail(iframeConfig.policyId);
        if (res.status === 200) {
          const listIframe = document.createElement("iframe");
          listIframe.src = `${url}/iframe/collectionList/${iframeConfig.policyId}?theme=${jobConfig.theme}&lu=${jobConfig.logoUrl}&ls=${jobConfig.logoSize}&pn=${jobConfig.projectName}&nfs=${jobConfig.nameFontSize}&dv=${jobConfig.defaultView}&a=${jobConfig.affilCode}`;
          listIframe.className = "job_list_iframe";
          iframeListDivs[i].appendChild(listIframe);
          iframeListDivs[i].dataset.processed = "true";
        } else {
          iframeListDivs[i].classList.add("job-not-found-collection");
        }
      })();
    }
  }

  const processedFingerprints = new Set();

  for (let i = 0; i < btn.length; i++) {
    const config = JSON.parse(btn[i].dataset.config);

    if (btn[i].dataset.processed) continue;

    if (config.policyid && config.buttonType === "collectionOffer") {
      btn[i].innerHTML = config.buttonLabel;
      btn[i].style.display = "inline-block";
      btn[i].dataset.processed = "true";
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
          btn[i].dataset.processed = "true";
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
};

processElements();

const observer = new MutationObserver((mutations) => {
  mutations.forEach((mutation) => {
    mutation.addedNodes.forEach((node) => {
      if (node.nodeType === 1) {
        const classList = node.classList;
        if (
          classList.contains("jamonbread") ||
          Array.from(classList).some(
            (cls) => cls.includes("iframe") && !cls.includes("job")
          )
        ) {
          processElements();
        }
      }
    });
  });
});

observer.observe(document.body, {
  childList: true,
  subtree: true,
});
