// https://jamonbread.io/asset
import { fetchNftListing } from "../utils/fetchNftListing.js";
import { translateFingerprint } from "../utils/translateFingerprint.js";

const btn = document.getElementsByClassName("jamonbread");

for (let i = 0; i < btn.length; i++) {
  const config = JSON.parse(btn[i].dataset.config);
  (async () => {
    const fingerprintRes = await translateFingerprint(config.fingerprint);

    const res = await fetchNftListing(
      fingerprintRes.policyId,
      fingerprintRes.assetName
    );

    Object.entries(buttonStyles).forEach(([key, value]) => {
      btn[i].style[key] = value;
    });

    if (!res.sellOrder && jamConfig.buttonType === "buy") {
      if (jamConfig.fallbackButtonLabel) {
        btn[i].innerHTML = jamConfig.fallbackButtonLabel;
        Object.entries(fallbackButtonStyles).forEach(([key, value]) => {
          btn[i].style[key] = value;
        });
      }
    } else {
      btn[i].innerHTML = jamConfig.buttonLabel;
    }

    console.log("res", res);
  })();

  btn[i].addEventListener("click", async (e) => {
    // const iframeSrc = `https://mainnet-stage.jamonbread.tech/iframe/asset/${config.fingerprint}?theme=dark`;
    const iframeSrc = `https://mainnet-stage.jamonbread.tech/iframe/asset/${config.fingerprint}?theme=${jamConfig.theme}&type=${jamConfig.buttonType}&showPopup=${jamConfig.showPopup}`;
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
