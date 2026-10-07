const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  // Import sync function
  const { syncFacebookComments } = require('./dist/modules/comments/comment.service');
  console.log("Running syncFacebookComments for both admin user accounts...");
  const res1 = await syncFacebookComments("cmu5ps55a0001l204xocjpl5e");
  console.log("Result for cmu5ps55a0001l204xocjpl5e:", JSON.stringify(res1, null, 2));

  // Check comments count in DB now
  const comments = await prisma.comment.findMany({
    include: { replies: true, facebookPage: true },
    orderBy: { createdAt: 'desc' }
  });

  console.log(`\nDB Comments total: ${comments.length}`);
  for (const c of comments) {
    console.log(`- [${c.status}] ${c.userName || 'Unknown'}: "${c.userMessage}" (replies: ${c.replies.length})`);
    for (const r of c.replies) {
      console.log(`    ↳ [${r.status}] "${r.generatedReply}"`);
    }
  }

  await prisma.$disconnect();
}

run().catch(e => {
  console.error("Sync error:", e);
  process.exit(1);
});
