import { fetchNftListing } from "../utils/fetchNftListing.js";
import { translateFingerprint } from "../utils/translateFingerprint.js";

const url = jamConfig.testnet
  ? "https://testnet-stage.jamonbread.tech/iframe"
  : "https://mainnet-stage.jamonbread.tech/iframe";

const btn = document.getElementsByClassName("jamonbread");
const iframeDiv = document.getElementById("iframe_list_div");

if (iframeDiv) {
  const iframeConfig = JSON.parse(iframeDiv.dataset.config);
  const listIframe = document.createElement("iframe");
  listIframe.src = `${url}/collectionList/${iframeConfig.policyId}?theme=${jamConfig.theme}&lu=${jamConfig.logoUrl}&ls=${jamConfig.logoSize}&pn=${jamConfig.projectName}&nfs=${jamConfig.nameFontSize}&dv=${jamConfig.defaultView}&a=${jamConfig.affilCode}`;
  listIframe.className = "job_list_iframe";
  iframeDiv.appendChild(listIframe);
}

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
      const fp = config.fingerprint.includes("asset")
        ? config.fingerprint
        : `asset${config.fingerprint}`;
      const fingerprintRes = await translateFingerprint(fp);

      const res = await fetchNftListing(
        fingerprintRes.policyId,
        fingerprintRes.assetName
      );

      // If user doesn't own the asset, don't show the list button
      if (
        res.owner.address &&
        res.owner.address !== jamConfig.wallet &&
        config.buttonType === "list"
      ) {
        return;
      }

      // If user is listed by the user, don't show the buy button
      if (
        res.sellOrder &&
        res.sellOrder.listedByAddress === jamConfig.wallet &&
        config.buttonType === "buy"
      ) {
        return;
      }

      if (!res.sellOrder && config.buttonType === "buy") {
        if (config.fallbackButtonLabel) {
          btn[i].innerHTML = config.fallbackButtonLabel;
          btn[i].classList.remove("job_asset_button");
          btn[i].classList.add("job_asset_fallback_button");
        } else if (jamConfig.alwaysDisplayButton) {
          btn[i].innerHTML = config.buttonLabel;
          btn[i].style.display = "inline-block";
        }
      } else {
        btn[i].innerHTML = config.buttonLabel;
        btn[i].style.display = "inline-block";
      }
    })();
  }

  btn[i].addEventListener("click", async (e) => {
    let iframeSrc = "";
    if (btn[i].classList.contains("job_collectionInfo_button")) {
      iframeSrc = `${url}/collectionOffer/${config.policyid}?theme=${jamConfig.theme}&showPopup=${jamConfig.showPopup}`;
    } else if (btn[i].classList.contains("job_asset_button")) {
      iframeSrc = `${url}/asset/${config.fingerprint}?theme=${jamConfig.theme}&type=${config.buttonType}&showPopup=${jamConfig.showPopup}`;
    }

    const newWindow = window.open(iframeSrc, "_blank");
    setTimeout(function () {
      newWindow.postMessage(
        {
          id: "job_frame",
          data: {
            logoUrl: jamConfig.logoUrl,
            logoSize: jamConfig.logoSize,
            projectName: jamConfig.projectName,
            nameFontSize: jamConfig.nameFontSize,
          },
        },
        "*"
      );
    }, 1000);
  });
}
