# kStats

An app for Fitbit smartwatches which allows you to view your Kiezelpay sales data via your API key. It's a heavily modified version of the [K·pay merchant API module](https://github.com/KiezelPay/fitbit_kpay_merchant_api).

![kStats hero](https://reno.watch/kStats.jpg)

## What does each stat mean?

![kStats Explainer](https://reno.watch/kStats-explainer.png)

## How does it work?

👉 Add your kPay API key in the settings page. Find your API key here: https://kiezelpay.com/account/api

👉 If it doesn't update after adding the API key, you may need to restart the app.

ℹ️ kStats will refresh every 5 minutes. If vibrations are turned on, you will feel specific vibrations depending on how much you've made since the last refresh.

ℹ️ kStats will show how much you've made since you last opened the app. This will only work after a previous value is saved, and if you reopen the app on the same day.  

## Demo

You can install the build here: https://gallery.fitbit.com/details/82710bb5-7d3a-41fe-bd27-7a294564f508

If you want to try it without a real API key, you can use the Kiezelpay test API key ```0123456789abcdef0123456789abcdef``` - but please note that it will not display any product information (as the history API doesn't exist for the test API key).

## Installation

Run in Fitbit Studio or via CLI. The documentation for the Kiezelpay API can be found here: https://kiezelpay.com/api/merchant/documentation

## Note

Please ensure you take adequate care with your API key. Do not enter your API into anything you do not trust, as your sales data may be viewed by others. kStats will not expose your API key, however please take precaution with any other apps or clock faces that ask for your Kiezelpay API key, and ensure you are able to see that your API is not being exposed.

## Finally...

Thank you so much for reading, and let me know if you have any questions or issues. 😊
