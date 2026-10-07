const { getComments } = require('./dist/modules/comments/comment.service');
const { getUserConnectedPages } = require('./dist/modules/facebook/facebook.service');
const { getOverviewAnalytics } = require('./dist/modules/analytics/analytics.service');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function verify() {
  const users = [
    { id: "cmu5ps55a0001l204xocjpl5e", email: "kihpranto42@gmail.com" },
    { id: "cmu5uu3y80000l004ulqht5i5", email: "prantokih42@gmail.com" }
  ];

  for (const u of users) {
    console.log(`\n========================================`);
    console.log(`Checking user: ${u.email} (${u.id})`);
    
    const pages = await getUserConnectedPages(u.id);
    console.log(`Connected Pages count: ${pages.length} (${pages.map(p => p.pageName).join(', ')})`);

    const commentsRes = await getComments(u.id, { limit: 10 });
    console.log(`Comments count: ${commentsRes.total}`);

    const overview = await getOverviewAnalytics(u.id, {});
    console.log(`Overview stats: Total=${overview.totalComments}, AutoReplied=${overview.autoReplied}, SuccessRate=${overview.successRate}%`);
  }

  await prisma.$disconnect();
}

verify().catch(e => {
  console.error("Verification failed:", e);
  process.exit(1);
});
