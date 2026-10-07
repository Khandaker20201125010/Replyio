require('dotenv').config();
const { analyzeComment, generateReply } = require('./dist/modules/ai/ai.service');

async function test() {
  const sampleComments = [
    "hi how are you?",
    "nice post bro",
    "where is your shop located?",
    "দাম কত ভাই?",
    "great work, keep it up!",
    "fake product"
  ];

  const settings = {
    aiProvider: "openrouter",
    model: "inclusionai/ling-3.0-flash-sante:free",
    tone: "friendly",
    language: "en",
    emojiUsage: true,
    maxLength: 300
  };

  console.log("=== TESTING NATURAL AI REPLIES ===");
  for (const c of sampleComments) {
    try {
      const analysis = await analyzeComment(c, settings);
      const res = await generateReply(c, analysis, settings);
      console.log(`\nUser Comment: "${c}"`);
      console.log(`AI Intent: ${analysis.intent} | Language: ${analysis.language}`);
      console.log(`Generated Natural Reply: "${res.reply}"`);
    } catch (e) {
      console.error(`Error on "${c}":`, e.message);
    }
  }
}

test();
