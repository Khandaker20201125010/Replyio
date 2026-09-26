const { PrismaClient } = require('@prisma/client');
const axios = require('axios');
const prisma = new PrismaClient();

async function testSync() {
  const page = await prisma.facebookPage.findFirst({
    where: { pageId: "1381486308373824", isConnected: true }
  });

  if (!page) {
    console.log("No page found!");
    return;
  }

  console.log(`Syncing page: ${page.pageName} (${page.pageId})`);

  // Fetch feed with comments and nested replies
  const res = await axios.get(`https://graph.facebook.com/v18.0/${page.pageId}/feed`, {
    params: {
      access_token: page.pageAccessToken,
      fields: "id,message,created_time,comments{id,message,from,created_time,comments{id,message,from,created_time}}",
      limit: 25
    }
  });

  const posts = res.data?.data || [];
  console.log(`Found ${posts.length} posts.`);

  let totalComments = 0;
  for (const post of posts) {
    const comments = post.comments?.data || [];
    for (const c of comments) {
      totalComments++;
      console.log(`- Post ${post.id} -> Comment ${c.id}: "${c.message}" from:`, c.from?.name || 'anonymous');
      const nested = c.comments?.data || [];
      for (const n of nested) {
        console.log(`    ↳ Nested reply: "${n.message}" from:`, n.from?.name || 'anonymous', `(${n.from?.id})`);
      }
    }
  }

  console.log(`Total comments found on Facebook: ${totalComments}`);
}

testSync().catch(console.error).finally(() => prisma.$disconnect());
