// https://jamonbread.io/asset
import { fetchNftListing } from "../utils/fetchNftListing.js";
import { translateFingerprint } from "../utils/translateFingerprint.js";

const btn = document.getElementsByClassName("jamonbread");

for (let i = 0; i < btn.length; i++) {
  const config = JSON.parse(btn[i].dataset.config);

  if (config.policyid && config.buttonType === "collectionOffer") {
    btn[i].innerHTML = config.buttonLabel;
    btn[i].style.display = "block";
  } else {
    (async () => {
      const fingerprintRes = await translateFingerprint(config.fingerprint);

      const res = await fetchNftListing(
        fingerprintRes.policyId,
        fingerprintRes.assetName
      );

      if (!res.sellOrder && jamConfig.buttonType === "buy") {
        if (config.fallbackButtonLabel) {
          btn[i].innerHTML = config.fallbackButtonLabel;
          btn[i].classList.remove("job_asset_button");
          btn[i].classList.add("job_asset_fallback_button");
        } else if (jamConfig.alwaysDisplayButton) {
          btn[i].innerHTML = config.buttonLabel;
          btn[i].style.display = "block";
        }
      } else {
        btn[i].innerHTML = config.buttonLabel;
        btn[i].style.display = "block";
      }
    })();
  }

  btn[i].addEventListener("click", async (e) => {
    let iframeSrc = "";
    // if (jamConfig.buttonType === "collectionOffer") {
    if (btn[i].classList.contains("job_collectionInfo_button")) {
      iframeSrc = `http://localhost:3000/iframe/collectionOffer/${config.policyid}?theme=${jamConfig.theme}&showPopup=${jamConfig.showPopup}`;
    } else {
      iframeSrc = `http://localhost:3000/iframe/asset/${config.fingerprint}?theme=${jamConfig.theme}&type=${jamConfig.buttonType}&showPopup=${jamConfig.showPopup}`;
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
