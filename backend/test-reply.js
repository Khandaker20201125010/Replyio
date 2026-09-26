const { PrismaClient } = require('@prisma/client');
const axios = require('axios');
const prisma = new PrismaClient();

async function testReply() {
  const page = await prisma.facebookPage.findFirst({
    where: { pageId: "1381486308373824" }
  });

  const commentId = "122104028397483241_1749374382958348";

  console.log("Testing reply to comment:", commentId);
  try {
    const params = new URLSearchParams();
    params.append("message", "Thank you for supporting us! We appreciate you! 😊");
    params.append("access_token", page.pageAccessToken);

    const res = await axios.post(
      `https://graph.facebook.com/v18.0/${commentId}/comments`,
      params.toString(),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    console.log("SUCCESS! Facebook reply sent:", res.data);
  } catch (err) {
    console.error("Facebook reply error:", err.response?.data || err.message);
  }
}

testReply().catch(console.error).finally(() => prisma.$disconnect());
