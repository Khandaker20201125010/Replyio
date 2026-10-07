const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany();
  for (const u of users) {
    console.log('User:', u.id, u.email);
    const count = await prisma.reply.count({
      where: {
        facebookPage: {
          userId: u.id
        }
      }
    });
    console.log('Replies via reply.facebookPage for user:', count);

    const count2 = await prisma.reply.count({
      where: {
        comment: {
          facebookPage: {
            userId: u.id
          }
        }
      }
    });
    console.log('Replies via reply.comment.facebookPage for user:', count2);
  }

  const allReplies = await prisma.reply.findMany({
    include: {
      comment: {
        include: {
          facebookPage: true
        }
      },
      facebookPage: true
    }
  });
  console.log('Total replies in DB:', allReplies.length);
  for (const r of allReplies) {
    console.log('Reply:', r.id, 'status:', r.status, 'commentId:', r.commentId, 'replyFbPageUserId:', r.facebookPage?.userId, 'commentFbPageUserId:', r.comment?.facebookPage?.userId);
  }
}

main().finally(() => prisma.$disconnect());
