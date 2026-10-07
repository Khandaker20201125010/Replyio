const express = require('express');
const app = express();

app.get('/test', (req, res) => {
  res.json({
    query: req.query,
    hubMode: req.query['hub.mode'],
    hub: req.query.hub
  });
});

const server = app.listen(9876, async () => {
  const axios = require('axios');
  const r = await axios.get('http://localhost:9876/test?hub.mode=subscribe&hub.verify_token=abc&hub.challenge=123');
  console.log('Result:', JSON.stringify(r.data, null, 2));
  server.close();
});
