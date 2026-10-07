const { PrismaClient } = require('@prisma/client');
const axios = require('axios');
const prisma = new PrismaClient();

async function check() {
  console.log("=== CHECKING DATABASE ===");
  const users = await prisma.user.findMany();
  console.log("Users:", JSON.stringify(users, null, 2));
  const pages = await prisma.facebookPage.findMany();
  console.log(`Pages count: ${pages.length}`);
  for (const p of pages) {
    console.log(`Page: id=${p.id}, pageId=${p.pageId}, name=${p.pageName}, isConnected=${p.isConnected}, userId=${p.userId}`);
    console.log(`Has pageAccessToken: ${!!p.pageAccessToken}`);
    if (p.pageAccessToken) {
      try {
        const subRes = await axios.get(`https://graph.facebook.com/v18.0/${p.pageId}/subscribed_apps?access_token=${p.pageAccessToken}`);
        console.log(`Page ${p.pageName} subscribed_apps:`, JSON.stringify(subRes.data));
      } catch (e) {
        console.log(`Error checking subscribed_apps for page ${p.pageId}:`, e.response?.data || e.message);
      }
    }
  }

  const comments = await prisma.comment.findMany({
    orderBy: { createdAt: 'desc' },
    take: 10,
    include: { replies: true }
  });
  console.log(`\nTotal comments (showing last ${comments.length}):`);
  for (const c of comments) {
    console.log(`Comment: id=${c.id}, commentId=${c.commentId}, postId=${c.postId}, status=${c.status}, msg="${c.userMessage}", replies=${c.replies.length}`);
  }

  const ai = await prisma.aISettings.findMany();
  console.log(`\nAI Settings count: ${ai.length}`);
  for (const s of ai) {
    console.log(`AISettings for user ${s.userId}: status=${s.status}, model=${s.model}, provider=${s.aiProvider}, humanApprovalMode=${s.humanApprovalMode}`);
  }

  // Check Meta App subscriptions
  const metaAppId = process.env.META_APP_ID || "1579868390830964";
  const metaAppSecret = process.env.META_APP_SECRET || "2514d9271f29a03d0bab4c069d547c32";
  const appToken = `${metaAppId}|${metaAppSecret}`;
  try {
    const appSub = await axios.get(`https://graph.facebook.com/v18.0/${metaAppId}/subscriptions?access_token=${appToken}`);
    console.log("\nMeta App Subscriptions:", JSON.stringify(appSub.data));
  } catch (e) {
    console.log("Error checking App Subscriptions:", e.response?.data || e.message);
  }

  await prisma.$disconnect();
}

check().catch(e => {
  console.error("Fatal check error:", e);
  process.exit(1);
});
