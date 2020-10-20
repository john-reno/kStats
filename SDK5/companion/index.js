// Import the api module
import KpayMerchantApi from '../common/kpay_merchant_api/phone';
import { SUMMARY, TODAY, YESTERDAY } from '../common/kpay_merchant_api/common';
import * as fs from "fs";
import * as messaging from "messaging";
import { settingsStorage } from "settings";
import companion from "companion";

let kPayAPIkey;

messaging.peerSocket.onopen = () => {
  console.log("Companion Socket Open");
  restoreSettings();
};

function restoreSettings() {
  for (let index = 0; index < settingsStorage.length; index++) {
    let key = settingsStorage.key(index);
    if (key) {
      let data = {
        key: key,
        newValue: settingsStorage.getItem(key)
      };
      if (data.key == 'APIkey'){
        let kPayAPIkey = JSON.parse(settingsStorage.getItem(key)).name;
        kpayMerchantApi.setApiKey(kPayAPIkey);
      }
    }
  }
}

messaging.peerSocket.addEventListener("message", (evt) => {
  let msg = evt.data;
  console.log(msg);
});

settingsStorage.onchange = evt => {
    let data = {
    key: evt.key,
    newValue: evt.newValue
  };
  if (evt.key == 'APIkey'){

    console.log(JSON.parse(data.newValue).name);
    let kPayAPIkey = JSON.parse(data.newValue).name;
    settingsStorage.setItem(kPayAPIkey);
    kpayMerchantApi.setApiKey(kPayAPIkey);

    if (messaging.peerSocket.readyState === messaging.peerSocket.OPEN) {
      messaging.peerSocket.send(data);
    }
  }
};

// Create the api object
let kpayMerchantApi = new KpayMerchantApi();
kpayMerchantApi.setApiKey(kPayAPIkey);
