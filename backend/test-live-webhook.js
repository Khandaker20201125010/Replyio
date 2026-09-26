const axios = require('axios');

async function testBackend() {
  try {
    const health = await axios.get('https://replio-backend.vercel.app/api/health');
    console.log('Health:', health.data);
  } catch (e) {
    console.error('Health error:', e.response?.status, e.response?.data || e.message);
  }

  try {
    const token = '13a9cb40e68705c89c359e32ecca35b60ec309b8e481bbcaf3371adbdde1900ae8b1517d0c7f4aa13ba4c1665830fd8ae2eab20819432426c9ca6eca3bc03123c';
    const webhookVerify = await axios.get('https://replio-backend.vercel.app/api/webhook', {
      params: {
        'hub.mode': 'subscribe',
        'hub.verify_token': token,
        'hub.challenge': 'CHALLENGE_ACCEPTED_12345'
      }
    });
    console.log('Webhook verification:', webhookVerify.data);
  } catch (e) {
    console.error('Webhook verify error:', e.response?.status, e.response?.data || e.message);
  }
}

testBackend();
