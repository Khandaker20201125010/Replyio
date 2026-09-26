const axios = require('axios');

const appId = '1579868390830964';
const appSecret = '2514d9271f29a03d0bab4c069d547c32';
const appAccessToken = `${appId}|${appSecret}`;

async function checkAppSubscriptions() {
  try {
    const res = await axios.get(`https://graph.facebook.com/v18.0/${appId}/subscriptions`, {
      params: {
        access_token: appAccessToken
      }
    });
    console.log("App Subscriptions:", JSON.stringify(res.data, null, 2));
  } catch (e) {
    console.error("App Subscriptions error:", e.response?.data || e.message);
  }
}

checkAppSubscriptions();
