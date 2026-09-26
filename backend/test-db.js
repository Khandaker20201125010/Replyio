const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({ select: { id: true, email: true, name: true } });
  console.log("USERS:", JSON.stringify(users, null, 2));

  const pages = await prisma.facebookPage.findMany();
  console.log("PAGES:", JSON.stringify(pages.map(p => ({
    id: p.id,
    pageId: p.pageId,
    pageName: p.pageName,
    isConnected: p.isConnected,
    userId: p.userId,
    tokenPrefix: p.pageAccessToken ? p.pageAccessToken.substring(0, 15) + '...' : null
  })), null, 2));

  const comments = await prisma.comment.findMany({ take: 10, orderBy: { createdAt: 'desc' } });
  console.log("COMMENTS COUNT:", await prisma.comment.count());
  console.log("RECENT COMMENTS:", JSON.stringify(comments, null, 2));

  const replies = await prisma.reply.findMany({ take: 10, orderBy: { createdAt: 'desc' } });
  console.log("REPLIES COUNT:", await prisma.reply.count());
  console.log("RECENT REPLIES:", JSON.stringify(replies, null, 2));

  const aiSettings = await prisma.aISettings.findMany();
  console.log("AI SETTINGS:", JSON.stringify(aiSettings, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
