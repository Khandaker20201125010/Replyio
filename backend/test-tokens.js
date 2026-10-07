const axios = require('axios');

async function test() {
  const tokens = [
    '13a9cb40e68705c89c359e32ecca35b60ec309b8e481bbcaf3371adbdde1900a',
    'replio_meta_webhook_verify_token_2026'
  ];

  for (const t of tokens) {
    try {
      const r = await axios.get('https://replio-backend.vercel.app/api/webhook', {
        params: {
          'hub.mode': 'subscribe',
          'hub.verify_token': t,
          'hub.challenge': 'test_chal_123'
        },
        timeout: 10000
      });
      console.log('Token', t, 'OK -> status:', r.status, 'data:', r.data);
    } catch(e) {
      console.log('Token', t, 'FAIL -> status:', e.response?.status, 'data:', e.response?.data);
    }
  }
}

test();
