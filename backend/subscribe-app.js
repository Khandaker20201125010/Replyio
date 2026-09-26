const axios = require('axios');

const appId = '1579868390830964';
const appSecret = '2514d9271f29a03d0bab4c069d547c32';
const appAccessToken = `${appId}|${appSecret}`;
const callbackUrl = 'https://replio-backend.vercel.app/api/webhook';
const verifyToken = '13a9cb40e68705c89c359e32ecca35b60ec309b8e481bbcaf3371adbdde1900ae8b1517d0c7f4aa13ba4c1665830fd8ae2eab20819432426c9ca6eca3bc03123c';

async function setupSubscription() {
  try {
    const params = new URLSearchParams();
    params.append('object', 'page');
    params.append('callback_url', callbackUrl);
    params.append('verify_token', verifyToken);
    params.append('fields', 'feed');
    params.append('access_token', appAccessToken);

    console.log('Sending subscription request to Meta...');
    const res = await axios.post(`https://graph.facebook.com/v18.0/${appId}/subscriptions`, params.toString(), {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });
    console.log('Subscribe Result:', res.data);

    // Verify it's now listed
    const verifyRes = await axios.get(`https://graph.facebook.com/v18.0/${appId}/subscriptions`, {
      params: { access_token: appAccessToken }
    });
    console.log('App Subscriptions Now:', JSON.stringify(verifyRes.data, null, 2));
  } catch (e) {
    console.error('Subscription error:', e.response?.data || e.message);
  }
}

setupSubscription();
