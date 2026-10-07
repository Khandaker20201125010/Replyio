const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  const comments = await prisma.comment.findMany({
    include: { replies: true, facebookPage: true },
    orderBy: { createdAt: 'desc' }
  });
  console.log(`Found ${comments.length} comments:`);
  for (const c of comments) {
    console.log(`--- Comment ${c.id} (${c.commentId}) ---`);
    console.log(`Time: ${c.createdAt.toISOString()}`);
    console.log(`User: ${c.userName}, Msg: "${c.userMessage}", Status: ${c.status}`);
    console.log(`Replies count: ${c.replies.length}`);
    for (const r of c.replies) {
      console.log(`  Reply ${r.id}: status=${r.status}, fbReplyId=${r.replyId}, time=${r.createdAt.toISOString()}`);
      console.log(`  Provider: ${r.aiProvider}, Text: "${r.generatedReply}"`);
    }
  }
}

run().catch(console.error).finally(() => prisma.$disconnect());
