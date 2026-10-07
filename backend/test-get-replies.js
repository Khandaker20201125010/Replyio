const { getReplies } = require('./dist/modules/replies/reply.service');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function test() {
  const users = [
    { id: "cmu5ps55a0001l204xocjpl5e", email: "kihpranto42@gmail.com" },
    { id: "cmu5uu3y80000l004ulqht5i5", email: "prantokih42@gmail.com" }
  ];

  for (const u of users) {
    const res = await getReplies(u.id, {});
    console.log(`getReplies for ${u.email}: total=${res.total}, repliesCount=${res.replies.length}`);
  }
}

test().finally(() => prisma.$disconnect());
