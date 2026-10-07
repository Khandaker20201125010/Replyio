const axios = require('axios');
const apiKey = process.env.OPENROUTER_API_KEY || '';


const candidates = [
  'google/gemma-4-26b-a4b-it:free',
  'qwen/qwen3.8-27b:free',
  'inclusionai/ling-3.0-flash-sante:free',
  'liquid/lfm-2.5-2.6b:free',
  'meta-llama/llama-3.2-3b-instruct:free',
  'meta-llama/llama-3.1-8b-instruct:free',
  'mistralai/mistral-7b-instruct:free',
  'google/gemini-2.0-flash-exp:free',
  'google/gemini-2.0-pro-exp-02-05:free',
  'google/gemini-flash-1.5:free'
];

async function findWorking() {
  for (const m of candidates) {
    try {
      const res = await axios.post('https://openrouter.ai/api/v1/chat/completions', {
        model: m,
        messages: [{ role: 'user', content: 'Reply in 3 words: Hello!' }]
      }, {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        timeout: 8000
      });
      console.log(`WORKING MODEL FOUND: ${m} -> Response: "${res.data?.choices?.[0]?.message?.content?.trim()}"`);
    } catch (e) {
      console.log(`Model ${m} failed: ${e.response?.status} ${e.response?.data?.error?.message || e.message}`);
    }
  }
}

findWorking();
