import prisma from "../../config/prisma";
import { logger } from "../../utils/logger";

export async function getOverviewAnalytics(userId: string, filters: any) {
  const { pageId, startDate, endDate, days } = filters;

  const dateFilter: any = {};
  if (startDate) {
    dateFilter.gte = new Date(startDate);
  } else if (days) {
    const d = new Date();
    d.setDate(d.getDate() - parseInt(days, 10));
    dateFilter.gte = d;
  }
  if (endDate) {
    dateFilter.lte = new Date(endDate);
  }

  const pageWhere: any = { facebookPage: { userId } };
  if (pageId) pageWhere.facebookPageId = pageId;
  if (Object.keys(dateFilter).length > 0) pageWhere.createdTime = dateFilter;

  const [
    totalComments,
    repliedComments,
    pendingComments,
    autoRepliedReplies,
    connectedPages,
  ] = await Promise.all([
    prisma.comment.count({ where: pageWhere }),
    prisma.comment.count({ where: { ...pageWhere, status: "REPLIED" } }),
    prisma.comment.count({ where: { ...pageWhere, status: "PENDING" } }),
    prisma.reply.count({
      where: {
        comment: { facebookPage: { userId } },
        status: "SENT",
        ...(pageId && { facebookPageId: pageId }),
      },
    }),
    prisma.facebookPage.count({ where: { userId, isConnected: true } }),
  ]);

  const successRate =
    totalComments > 0
      ? Math.round((repliedComments / totalComments) * 100)
      : 0;

  logger.info(
    { userId, totalComments, repliedComments, autoRepliedReplies, connectedPages },
    "Overview analytics computed",
  );

  return {
    totalComments,
    totalReplies: repliedComments,
    autoReplied: autoRepliedReplies,
    pendingReview: pendingComments,
    successRate,
    connectedPages,
  };
}

export async function getCommentsAnalytics(userId: string, filters: any) {
  const { pageId, startDate, endDate, days } = filters;

  const dateFilter: any = {};
  if (startDate) {
    dateFilter.gte = new Date(startDate);
  } else if (days) {
    const d = new Date();
    d.setDate(d.getDate() - parseInt(days, 10));
    dateFilter.gte = d;
  }
  if (endDate) {
    dateFilter.lte = new Date(endDate);
  }

  const where: any = { facebookPage: { userId } };
  if (pageId) where.facebookPageId = pageId;
  if (Object.keys(dateFilter).length > 0) where.createdTime = dateFilter;

  const comments = await prisma.comment.findMany({
    where,
    select: {
      createdTime: true,
      status: true,
    },
    orderBy: { createdTime: "asc" },
  });

  // Build daily count map
  const dailyMap: Record<string, number> = {};
  const statusMap: Record<string, number> = {};

  comments.forEach((comment) => {
    const dateKey = comment.createdTime.toISOString().split("T")[0];
    dailyMap[dateKey] = (dailyMap[dateKey] || 0) + 1;
    statusMap[comment.status] = (statusMap[comment.status] || 0) + 1;
  });

  const daily = Object.entries(dailyMap)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, count]) => ({ date, count }));

  const byStatus = Object.entries(statusMap).map(([status, count]) => ({
    status,
    count,
  }));

  return { daily, byStatus };
}

export async function getRepliesAnalytics(userId: string, filters: any) {
  const { pageId, startDate, endDate, days } = filters;

  const dateFilter: any = {};
  if (startDate) {
    dateFilter.gte = new Date(startDate);
  } else if (days) {
    const d = new Date();
    d.setDate(d.getDate() - parseInt(days, 10));
    dateFilter.gte = d;
  }
  if (endDate) {
    dateFilter.lte = new Date(endDate);
  }

  const where: any = {
    comment: {
      facebookPage: {
        userId,
      },
    },
  };

  if (pageId) {
    where.facebookPageId = pageId;
  }

  if (Object.keys(dateFilter).length > 0) {
    where.createdAt = dateFilter;
  }

  const replies = await prisma.reply.findMany({
    where,
    select: {
      createdAt: true,
      status: true,
      aiProvider: true,
      confidence: true,
    },
    orderBy: {
      createdAt: "asc",
    },
  });

  // Group by status
  const byStatusMap: Record<string, number> = {};

  // Group by provider
  const byProvider: Record<string, number> = {};

  let totalConfidence = 0;
  let confidenceCount = 0;

  replies.forEach((reply) => {
    byStatusMap[reply.status] = (byStatusMap[reply.status] || 0) + 1;
    if (reply.aiProvider) {
      byProvider[reply.aiProvider] = (byProvider[reply.aiProvider] || 0) + 1;
    }
    if (reply.confidence !== null && reply.confidence !== undefined) {
      totalConfidence += reply.confidence;
      confidenceCount++;
    }
  });

  const daily = Object.entries(
    replies.reduce<Record<string, number>>((acc, r) => {
      const dateKey = r.createdAt.toISOString().split("T")[0];
      acc[dateKey] = (acc[dateKey] || 0) + 1;
      return acc;
    }, {}),
  )
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, count]) => ({ date, count }));

  const byStatus = Object.entries(byStatusMap).map(([status, count]) => ({
    status,
    count,
  }));

  return {
    daily,
    byStatus,
    byProvider,
    avgConfidence:
      confidenceCount > 0
        ? Math.round((totalConfidence / confidenceCount) * 100) / 100
        : 0,
  };
}

export async function getEvents(userId: string, filters: any) {
  const {
    eventType,
    pageId,
    commentId,
    replyId,
    limit = 50,
    offset = 0,
  } = filters;

  const where: any = {
    userId,
  };

  if (eventType) {
    where.eventType = eventType;
  }

  if (pageId) {
    where.facebookPageId = pageId;
  }

  if (commentId) {
    where.commentId = commentId;
  }

  if (replyId) {
    where.replyId = replyId;
  }

  const [events, total] = await Promise.all([
    prisma.analyticsEvent.findMany({
      where,
      orderBy: {
        createdAt: "desc",
      },
      take: parseInt(limit, 10),
      skip: parseInt(offset, 10),
    }),
    prisma.analyticsEvent.count({ where }),
  ]);

  return {
    events,
    total,
    limit,
    offset,
  };
}
