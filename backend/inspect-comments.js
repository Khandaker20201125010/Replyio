const { PrismaClient } = require('@prisma/client');
const axios = require('axios');
const prisma = new PrismaClient();

async function inspectComments() {
  const page = await prisma.facebookPage.findFirst({
    where: { pageId: "1381486308373824" }
  });

  const commentIds = [
    "122104028397483241_1749374382958348",
    "122104028397483241_2071513507065256",
    "122104028397483241_3191974021012468",
    "122102042427483241_1636070091286876"
  ];

  for (const cid of commentIds) {
    try {
      const res = await axios.get(`https://graph.facebook.com/v18.0/${cid}`, {
        params: {
          access_token: page.pageAccessToken,
          fields: "id,message,from,created_time,can_reply_privately,can_comment"
        }
      });
      console.log(`Comment ${cid}:`, JSON.stringify(res.data, null, 2));
    } catch (e) {
      console.error(`Comment ${cid} error:`, e.response?.data || e.message);
    }
  }
}

inspectComments().catch(console.error).finally(() => prisma.$disconnect());
