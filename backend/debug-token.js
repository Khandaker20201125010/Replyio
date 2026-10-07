const { PrismaClient } = require('@prisma/client');
const axios = require('axios');
const prisma = new PrismaClient();

async function checkToken() {
  const page = await prisma.facebookPage.findFirst({
    where: { pageId: "1381486308373824" }
  });

  console.log("Page Name:", page.pageName);
  console.log("Page ID:", page.pageId);
  console.log("Token starts with:", page.pageAccessToken.substring(0, 15));

  const metaAppId = process.env.META_APP_ID || "1579868390830964";
  const metaAppSecret = process.env.META_APP_SECRET || "2514d9271f29a03d0bab4c069d547c32";
  const appToken = `${metaAppId}|${metaAppSecret}`;

  try {
    const res = await axios.get("https://graph.facebook.com/debug_token", {
      params: {
        input_token: page.pageAccessToken,
        access_token: appToken
      }
    });
    console.log("Token debug result:", JSON.stringify(res.data, null, 2));
  } catch (err) {
    console.error("Token debug error:", err.response?.data || err.message);
  }
}

checkToken().catch(console.error).finally(() => prisma.$disconnect());
