const { PrismaClient } = require('@prisma/client');
const axios = require('axios');
const prisma = new PrismaClient();

async function checkMeta() {
  const page = await prisma.facebookPage.findFirst({
    where: { pageId: "1381486308373824" }
  });

  if (!page) {
    console.log("No page found!");
    return;
  }

  console.log("Page Name:", page.pageName);
  console.log("Page ID:", page.pageId);

  // 1. Check page token validity
  try {
    const meRes = await axios.get(`https://graph.facebook.com/v18.0/me`, {
      params: { access_token: page.pageAccessToken }
    });
    console.log("Page Token /me:", meRes.data);
  } catch (err) {
    console.error("Token error:", err.response?.data || err.message);
  }

  // 2. Check subscribed apps for this page
  try {
    const subRes = await axios.get(`https://graph.facebook.com/v18.0/${page.pageId}/subscribed_apps`, {
      params: { access_token: page.pageAccessToken }
    });
    console.log("Subscribed Apps:", JSON.stringify(subRes.data, null, 2));
  } catch (err) {
    console.error("Subscribed apps error:", err.response?.data || err.message);
  }

  // 3. Check recent posts and comments on Facebook directly
  try {
    const feedRes = await axios.get(`https://graph.facebook.com/v18.0/${page.pageId}/feed`, {
      params: { 
        access_token: page.pageAccessToken,
        fields: "id,message,created_time,comments{id,message,from,created_time}"
      }
    });
    console.log("Recent Feed & Comments:", JSON.stringify(feedRes.data, null, 2));
  } catch (err) {
    console.error("Feed error:", err.response?.data || err.message);
  }
}

checkMeta().catch(console.error).finally(() => prisma.$disconnect());
