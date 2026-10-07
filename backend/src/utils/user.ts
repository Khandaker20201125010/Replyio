import prisma from "../config/prisma";

const LINKED_ADMIN_EMAILS = [
  "prantokih42@gmail.com",
  "kihpranto42@gmail.com",
];

export async function getEffectiveUserIds(userId: string): Promise<string[]> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { email: true },
    });

    if (user?.email && LINKED_ADMIN_EMAILS.includes(user.email.toLowerCase())) {
      const linkedUsers = await prisma.user.findMany({
        where: {
          email: { in: LINKED_ADMIN_EMAILS, mode: "insensitive" },
        },
        select: { id: true },
      });
      return linkedUsers.map((u) => u.id);
    }
  } catch {
    // Fall back to original userId on any error
  }

  return [userId];
}
