//imports

import document from "document"
import { peerSocket } from "messaging";
import clock from "clock";
import { preferences } from "user-settings";
import * as util from "../common/utils";
import { HeartRateSensor } from "heart-rate";
import userActivity from "user-activity";
import { goals, today } from "user-activity";
import { display } from "display";
import dtlib from "../common/datetimelib";
import userActivity from "user-activity";
import * as messaging from 'messaging';
import { vibration } from "haptics";
import { battery } from "power";
import { units } from "user-settings";
import { me } from "appbit";
import * as prefs from "../common/shared_preferences";

// import the api module

import KpayMerchantApi from '../common/kpay_merchant_api/device';
import { SUMMARY, TODAY, YESTERDAY, HISTORY } from '../common/kpay_merchant_api/common';

// stop app from shutting down after a few minutes (stays open indefinitely)

me.appTimeoutEnabled = false;

// create the api object

let kpayMerchantApi = new KpayMerchantApi();

// define consts

const clicky = document.getElementById("clicky");
const timeLabel = document.getElementById("timeLabel");
const dateLabel = document.getElementById("dateLabel");
const hrLabel = document.getElementById("hrLabel");
const batteryLabel = document.getElementById("batteryLabel");
const productsSold = document.getElementById("product");
const lastSaleLastRefresh = document.getElementById("lastSaleLastRefresh");
const grandtotal = document.getElementById("grandtotal");
const todaySales = document.getElementById("todaySales");
const todayRankSalesAverage = document.getElementById("todayRankSalesAverage");
const yesterdaySales = document.getElementById("yesterdaySales");
const yesterdayRankSalesAverage = document.getElementById("yesterdayRankSalesAverage");
const thisMonthSales = document.getElementById("thisMonthSales");
const lastMonthSales = document.getElementById("lastMonthSales");
const salesChange = document.getElementById("salesChange");
const smallClock = document.getElementById("smallClock");
const todaySalesIcon = document.getElementById("todaySalesIcon");
const todayRankSalesAverageIcon = document.getElementById("todayRankSalesAverageIcon");
const thisMonthSalesIcon = document.getElementById("thisMonthSalesIcon");
const todaySalesSpinner = document.getElementById("todaySalesSpinner");
const todayRankSalesAverageSpinner = document.getElementById("todayRankSalesAverageSpinner");
const thisMonthSalesSpinner = document.getElementById("thisMonthSalesSpinner");
const smallClockSpinner = document.getElementById("smallClockSpinner");
const productSpinner = document.getElementById("productSpinner");
const tog = document.getElementById("tog");

// define letiables and set initial empty states

let hrm = new HeartRateSensor();
let oldValue = 999999; // set to a value that can't be a real value (maybe one day someone will make $999,999 in 5 minutes, but none of us are Jeff Bezos yet)
let hasChecked = 0;
let currentDate = 0;
let errorTimer = 0;
let errorCountdown = setInterval(errorCountdownStart, 1000); // define and start countdown to show error message if no data

// check saved values and set initial empty states

if (prefs.getItem("dateSave") === undefined) {
  prefs.setItem("dateSave", 0);
}

if (prefs.getItem("vibToggle") === undefined) {
  prefs.setItem("vibToggle", 0);
} else if (prefs.getItem("vibToggle") === 1) {
  tog.style.fill = "lime";
} else {
  tog.style.fill = "red";
}

if (prefs.getItem("salesSave") === undefined) {
  prefs.setItem("salesSave", 0);
}

// function to format long numbers numbers and with 2nd zero decimal if applicable

function formatNumber(inputNumber){
  let num = inputNumber.toFixed(2).replace(/\d{1,3}(?=(\d{3})+(?!\d))/g , "$&,");
  return num;
}

// start getting API data for each service

let showSalesData = function(type, data) {
  let receivedData = undefined;

  if (type == TODAY) {
    receivedData = data[TODAY];
      if (receivedData.rank !== undefined){ // only fetch data if API key is valid
        todayRankSalesAverage.text = receivedData.rank + " · " + receivedData.purchases + " · " + ((receivedData.amount / receivedData.purchases || 0).toFixed(1));
        todaySalesIcon.style.display = "inline";
        todaySalesSpinner.style.display = "none";
        todayRankSalesAverageIcon.style.display = "inline";
        todayRankSalesAverageSpinner.style.display = "none";
        todaySalesSpinner.animate("disable");
        todayRankSalesAverageSpinner.animate("disable");

        // find any sales increases and round them to two decimals

        let roundedValue = Math.round(receivedData.amount - oldValue);
        let roundedValueAccurate = formatNumber((Math.round((receivedData.amount - oldValue) * 100) / 100));

        salesChange.text = ""; // remove previous increase if no further increase
        oldValue = receivedData.amount || 0;
        todaySales.text = formatNumber(receivedData.amount) || 0;

        // display sales increases with appropriate vibration level if vibrations are enabled

        if (roundedValue != Math.round(receivedData.amount) && roundedValue >= 1) {
          salesChange.text = "+" + roundedValueAccurate;
          if (prefs.getItem("vibToggle") === 1) {
            const vibrationMap = {
              1: 'confirmation',
              2: 'confirmation-max',
              3: 'nudge-max',
              4: 'celebration-short',
              5: 'celebration-long',
            }
            if (roundedValue > 5) {roundedValue = 5};
            vibration.start(vibrationMap[roundedValue]);
          }
        }

        // check to see if sales have changed since last app restart

        if (prefs.getItem("salesSave") < receivedData.amount && prefs.getItem("salesSave") != 0 && hasChecked === 0 && prefs.getItem("dateSave") === currentDate) {
          salesChange.text = "+" + formatNumber(Math.round((receivedData.amount - prefs.getItem("salesSave")) * 100) / 100);
          hasChecked = 1;
        }

        salesChange.x = todaySales.x + todaySales.getBBox().width + 7; // calculate x position based on todaySales position and length and add some padding
        salesChange.animate("disable"); // hide salesChange before animation
        salesChange.animate("enable"); // animate salesChange into position

        // continue fetching next API data

        kpayMerchantApi.fetchSummary();
    } else { // display error if invalid API key
      errorTimer = 99;
      productsSold.text = "❌ Invalid API key. Please check your API key in settings and remove any extra characters or spaces.";

      productSpinner.style.display = "none";
      todaySalesSpinner.style.display = "none";
      todayRankSalesAverageSpinner.style.display = "none";
      thisMonthSalesSpinner.style.display = "none";
      smallClockSpinner.style.display = "none";

      productSpinner.animate("disable");
      todaySalesSpinner.animate("disable");
      todayRankSalesAverageSpinner.animate("disable");
      thisMonthSalesSpinner.animate("disable");
      smallClockSpinner.animate("disable");

      clearInterval(errorCountdown); // stop countdown
    }
  }

  if (type == SUMMARY) {
    receivedData = data[SUMMARY];
    grandtotal.text = formatNumber(receivedData.totalIncome);

    // detect and replace null/undefined values from new API users
    if (receivedData.totalIncome === undefined) {
      grandtotal.text = "";
    }

    if (receivedData.previousPayout.amount === undefined) {
      lastMonthSales.text = formatNumber(0);
    } else {
      lastMonthSales.text = formatNumber(receivedData.previousPayout.amount);
    }

    // detect if it's before or after the cut off or payout dates and calcute the correct amount

    if (receivedData.nextPayout.amount === receivedData.currentBalance && receivedData.previousPayout.amount != undefined) {
      thisMonthSales.text = formatNumber(receivedData.nextPayout.amount);
      lastMonthSales.text = formatNumber(receivedData.previousPayout.amount);
    } else {
      thisMonthSales.text = formatNumber((Math.round((receivedData.currentBalance - receivedData.nextPayout.amount) * 100) / 100));
      lastMonthSales.text = formatNumber(receivedData.nextPayout.amount);
    }

    // set icons/spinners and continue fetching next API data

    thisMonthSalesIcon.style.display = "inline";
    thisMonthSalesSpinner.style.display = "none";
    thisMonthSalesSpinner.animate("disable");
    kpayMerchantApi.fetchYesterday();
  }

  if (type == YESTERDAY) {
    receivedData = data[YESTERDAY];
    yesterdaySales.text = formatNumber(receivedData.amount) || 0;
    yesterdayRankSalesAverage.text = receivedData.rank + " · " + receivedData.purchases + " · " + (receivedData.amount / receivedData.purchases || 0).toFixed(1);

    // continue fetching next API data

    kpayMerchantApi.fetchHistory();
  }

  if (type == HISTORY) {
    receivedData = data[HISTORY];

    // all of this code below calculates the correct time value from the kPay API + converts your timezone and formats it in a way that can be read by new Date(); - sorry it's a bit disgusting, but it works!

    // last sale time

    let s = receivedData.purchases[0].paidDate;
    let v = s.replace(/\s/g, '') + "Z";
    let e = v.substring(0, 10) + "T" + v.substring(10);
    let d = new Date(e);
    let f = d.toString().substring(21, 16);
    let lastSaleTime = f;
    let H = +lastSaleTime.substr(0, 2);

    if (preferences.clockDisplay === "12h") {
      let h = H % 12 || 12;
    } else {
      if (H < 10){
        let h = "0" + H || 12;
      } else{
        let h = H || 12;
      }
    }

    lastSaleTime = h + lastSaleTime.substr(2, 3);

    // last refresh time

    let d2 = new Date();
    let f2 = d2.toString().substring(21, 16);
    let lastRefreshTime = f2;
    let H2 = +lastRefreshTime.substr(0, 2);

    if (preferences.clockDisplay === "12h") {
      let h2 = H2 % 12 || 12;
    } else {
      if (H2 < 10){
        let h2 = "0" + H2 || 12;
      } else{
        let h2 = H2 || 12;
      }
    }

    lastRefreshTime = h2 + lastRefreshTime.substr(2, 3);

    // show data for last sale time and last refresh time

    lastSaleLastRefresh.text = lastSaleTime + " · " + lastRefreshTime;

    // only show product/bundle sales if they exist in the API - if there's < 7 sales write a value so the API fetch doesn't crash here
    // after checking we have at least 7 products sold, we populate the product list and assign a star if they were sold as part of a bundle

    let product = [];

    for (let i = 0; i < 7; i++) {
      product[i] = "";

      if (!receivedData.purchases[i]) {
        receivedData.purchases[i] = "";
      }

      if (!receivedData.purchases[i].bundleTriggeredBy) {
        receivedData.purchases[i].bundleTriggeredBy = "";
      }

      if (receivedData.purchases[i].bundleTriggeredBy !== null && receivedData.purchases[i].bundleTriggeredBy !== undefined && receivedData.purchases[i].bundleTriggeredBy !== "") {
        product[i] = "⭐ " + receivedData.purchases[i].bundleTriggeredBy;
      } else if (receivedData.purchases[i] !== "") {
        product[i] = receivedData.purchases[i].product;
      }
    }

    // combine products and add a small dot between them (if product not empty)

    productsSold.text = product.filter(Boolean).join(" · ");

    // set icons/spinners and continue fetching next API data

    productSpinner.style.display = "none";
    productSpinner.animate("disable");
    smallClock.style.display = "inline";
    smallClockSpinner.style.display = "none";
    smallClockSpinner.animate("disable");
  }

  if (receivedData) {
    //log part of received data (cannot log it all because of a bug in studio which prevents logging too long messages; summary data cannot be logged completely)
    console.log(type + ' data: ' + JSON.stringify(receivedData).substring(0, 225));
  }
}

// onTick stuff

clock.granularity = "seconds";

clock.ontick = (evt) => {
  let today = evt.date;
  let hours = today.getHours();
  let dow = today.getDay();
  let month = dtlib.getMonthNameShort(dtlib.LANGUAGES.ENGLISH, today.getMonth());
  let mins = util.zeroPad(today.getMinutes());

  currentDate = today.getDate();

  if (preferences.clockDisplay === "12h") {
    // 12h format
    hours = hours % 12 || 12;
  } else {
    // 24h format
    hours = util.zeroPad(hours);
  }

  timeLabel.text = `${hours}:${mins}`;
  batteryLabel.text = Math.floor(battery.chargeLevel) + "%";
  dateLabel.text = month + " " + currentDate;

  if (hrm.heartRate === null) {
    hrLabel.text = "--" + "  ❤️";
  } else {
    hrLabel.text = hrm.heartRate + "  ❤️";
  }
}

// display the sales data received from the companion and show refresh icons

kpayMerchantApi.onsuccess = showSalesData;

let fetchSalesData = function() {
  if (oldValue === 999999) {
    productsSold.text = "      " + "Getting sales data..."; // only show initial text on first load
  } if (errorTimer === 99 && oldValue === 999999 && thisMonthSalesSpinner.style.display === "none") {
    productsSold.text = "      " + "Getting sales data..."; // show text after initial incorrect API on launch
  } if (errorTimer === 99 && oldValue != 999999) {
    productsSold.text = "      " + "Getting sales data..."; // only show text on retry
  } if (errorTimer != 99 && oldValue != 999999) {
    productsSold.text = "      " + productsSold.text; // only indent text if it has loaded products before
  }
  // start error countdowns
  errorTimer = 20; // start 20 second countdown
  clearInterval(errorCountdown);
  errorCountdown = setInterval(errorCountdownStart, 1000); // start countdown to show error message if no data

  // hide and show appropriate spinners and icons

  todaySalesIcon.style.display = "none";
  todayRankSalesAverageIcon.style.display = "none";
  thisMonthSalesIcon.style.display = "none";
  smallClock.style.display = "none";

  todaySalesSpinner.style.display = "inline";
  todayRankSalesAverageSpinner.style.display = "inline";
  thisMonthSalesSpinner.style.display = "inline";
  productSpinner.style.display = "inline";
  smallClockSpinner.style.display = "inline";

  todaySalesSpinner.animate("enable");
  todayRankSalesAverageSpinner.animate("enable");
  thisMonthSalesSpinner.animate("enable");
  productSpinner.animate("enable");
  smallClockSpinner.animate("enable");

  kpayMerchantApi.fetchToday();

  kpayMerchantApi.onsuccess = showSalesData;
}

function errorCountdownStart(){
  // show helpful tips and hide spinners if data isn't loading (checks if the first spinner is still spinning)
  // console.log(errorTimer);

  if (errorTimer === 0 || errorTimer === 99){
    errorTimer = 20; // start 20 second countdown
  }

  if (errorTimer <= 20 && errorTimer > 0 && errorTimer != 99 && todaySalesIcon.style.display === "none") {
    errorTimer -= 1; // countdown
  }

  if (errorTimer === 1 && todaySalesIcon.style.display === "none") { // show error message if data isn't downloaded
    errorTimer = 99;
    productsSold.text = "❌ Can't get sales data.\nPlease open the Fitbit app, resync your watch and restart kStats.";

    productSpinner.style.display = "none";
    todaySalesSpinner.style.display = "none";
    todayRankSalesAverageSpinner.style.display = "none";
    thisMonthSalesSpinner.style.display = "none";
    smallClockSpinner.style.display = "none";

    productSpinner.animate("disable");
    todaySalesSpinner.animate("disable");
    todayRankSalesAverageSpinner.animate("disable");
    thisMonthSalesSpinner.animate("disable");
    smallClockSpinner.animate("disable");

    clearInterval(errorCountdown); // stop countdown if no data received

    if (oldValue != 999999) { // only re-show icons if there's previous successful fetch
      todaySalesIcon.style.display = "inline";
      todayRankSalesAverageIcon.style.display = "inline";
      thisMonthSalesIcon.style.display = "inline";
      smallClock.style.display = "inline";
    }

  } else if (errorTimer <= 30 && errorTimer > 0 && errorTimer != 99 && todaySalesIcon.style.display === "inline") {
    clearInterval(errorCountdown); // stop countdown if data received
  }
}

// refresh the sales data every 5 minutes - do NOT change this or Kristof will be angry and your API key may also get blocked for a period of time

setInterval(fetchSalesData, 300000);

// start HR and stop on display off

hrm.start();

display.onchange = function() {
  if (display.on) {
    hrm.start();
  } else {
    hrm.stop();
  }
}

// vibrations toggle

clicky.onclick = function(e) {
  if (prefs.getItem("vibToggle") === 0) {
    tog.style.fill = "lime";
    vibration.start('bump');
    prefs.setItem("vibToggle", 1)
  } else {
    tog.style.fill = "red";
    vibration.start('bump');
    prefs.setItem("vibToggle", 0)
  }
}

// listen for open companion / getting an API key from settings

peerSocket.addEventListener("open", (evt) => {
  fetchSalesData();
});

messaging.peerSocket.addEventListener("message", (evt) => {
  fetchSalesData();
});

if (errorTimer === 0 && oldValue === 999999) {
  productsSold.text = "↩️ Waiting for Fitbit app connection..."; // keep showing this if companion never opens until error countdown completes
}

// save values onunload

me.onunload = () => {
  if (oldValue != 999999) {
    prefs.setItem("salesSave", oldValue); // only save sales if valid data
  }
  prefs.setItem("dateSave", currentDate);
  prefs.save(); // doesn't seem to save correctly unless this is added
}
