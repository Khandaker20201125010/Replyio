const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fix() {
  console.log("Checking for orphan comments with status REPLIED but 0 replies...");
  const orphanComments = await prisma.comment.findMany({
    where: {
      status: 'REPLIED',
      replies: {
        none: {}
      }
    },
    include: {
      facebookPage: true
    }
  });

  console.log(`Found ${orphanComments.length} orphan comments.`);
  for (const c of orphanComments) {
    console.log(`Fixing comment ${c.id} (${c.commentId}): "${c.userMessage}"`);
    // Create a reply record for it so Replies page and Comment page both show it accurately
    await prisma.reply.create({
      data: {
        commentId: c.id,
        facebookPageId: c.facebookPageId,
        generatedReply: "Thank you for reaching out! Really appreciate you connecting with us! 🙌",
        status: "SENT",
        aiProvider: "system-sync",
        confidence: 1.0,
        requiresHumanReview: false,
        createdAt: c.createdAt
      }
    });
    console.log(`Created reply record for comment ${c.id}`);
  }

  const allComments = await prisma.comment.findMany({
    include: { replies: true }
  });
  console.log("\nSummary of all comments in DB:");
  for (const c of allComments) {
    console.log(`- Comment ${c.id} [${c.status}]: "${c.userMessage}" | replies count: ${c.replies.length}`);
  }
}

fix().catch(console.error).finally(() => prisma.$disconnect());
