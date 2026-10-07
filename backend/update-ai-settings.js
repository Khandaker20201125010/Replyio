const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function updateAISettings() {
  const users = await prisma.user.findMany();
  for (const u of users) {
    const updated = await prisma.aISettings.upsert({
      where: { userId: u.id },
      update: {
        aiProvider: "openrouter",
        model: "inclusionai/ling-3.0-flash-sante:free",
        status: "ACTIVE",
        humanApprovalMode: false
      },
      create: {
        userId: u.id,
        aiProvider: "openrouter",
        model: "inclusionai/ling-3.0-flash-sante:free",
        status: "ACTIVE",
        humanApprovalMode: false,
        confidenceThreshold: 0.7,
        tone: "professional",
        language: "en",
        emojiUsage: true,
        maxLength: 500,
        spamHandling: "ignore",
        fallbackBehavior: "skip"
      }
    });
    console.log(`Updated AI settings for user ${u.email} (${u.id}):`, updated.aiProvider, updated.model, updated.humanApprovalMode);
  }
}

updateAISettings().catch(console.error).finally(() => prisma.$disconnect());
