"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getOverviewAnalytics = getOverviewAnalytics;
exports.getCommentsAnalytics = getCommentsAnalytics;
exports.getRepliesAnalytics = getRepliesAnalytics;
exports.getEvents = getEvents;
const prisma_1 = __importDefault(require("../../config/prisma"));
const logger_1 = require("../../utils/logger");
function getOverviewAnalytics(userId, filters) {
    return __awaiter(this, void 0, void 0, function* () {
        const { pageId, startDate, endDate, days } = filters;
        const dateFilter = {};
        if (startDate) {
            dateFilter.gte = new Date(startDate);
        }
        else if (days) {
            const d = new Date();
            d.setDate(d.getDate() - parseInt(days, 10));
            dateFilter.gte = d;
        }
        if (endDate) {
            dateFilter.lte = new Date(endDate);
        }
        const pageWhere = { facebookPage: { userId } };
        if (pageId)
            pageWhere.facebookPageId = pageId;
        if (Object.keys(dateFilter).length > 0)
            pageWhere.createdTime = dateFilter;
        const [totalComments, repliedComments, pendingComments, autoRepliedReplies, connectedPages,] = yield Promise.all([
            prisma_1.default.comment.count({ where: pageWhere }),
            prisma_1.default.comment.count({ where: Object.assign(Object.assign({}, pageWhere), { status: "REPLIED" }) }),
            prisma_1.default.comment.count({ where: Object.assign(Object.assign({}, pageWhere), { status: "PENDING" }) }),
            prisma_1.default.reply.count({
                where: Object.assign({ comment: { facebookPage: { userId } }, status: "SENT" }, (pageId && { facebookPageId: pageId })),
            }),
            prisma_1.default.facebookPage.count({ where: { userId, isConnected: true } }),
        ]);
        const successRate = totalComments > 0
            ? Math.round((repliedComments / totalComments) * 100)
            : 0;
        logger_1.logger.info({ userId, totalComments, repliedComments, autoRepliedReplies, connectedPages }, "Overview analytics computed");
        return {
            totalComments,
            totalReplies: repliedComments,
            autoReplied: autoRepliedReplies,
            pendingReview: pendingComments,
            successRate,
            connectedPages,
        };
    });
}
function getCommentsAnalytics(userId, filters) {
    return __awaiter(this, void 0, void 0, function* () {
        const { pageId, startDate, endDate, days } = filters;
        const dateFilter = {};
        if (startDate) {
            dateFilter.gte = new Date(startDate);
        }
        else if (days) {
            const d = new Date();
            d.setDate(d.getDate() - parseInt(days, 10));
            dateFilter.gte = d;
        }
        if (endDate) {
            dateFilter.lte = new Date(endDate);
        }
        const where = { facebookPage: { userId } };
        if (pageId)
            where.facebookPageId = pageId;
        if (Object.keys(dateFilter).length > 0)
            where.createdTime = dateFilter;
        const comments = yield prisma_1.default.comment.findMany({
            where,
            select: {
                createdTime: true,
                status: true,
            },
            orderBy: { createdTime: "asc" },
        });
        // Build daily count map
        const dailyMap = {};
        const statusMap = {};
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
    });
}
function getRepliesAnalytics(userId, filters) {
    return __awaiter(this, void 0, void 0, function* () {
        const { pageId, startDate, endDate, days } = filters;
        const dateFilter = {};
        if (startDate) {
            dateFilter.gte = new Date(startDate);
        }
        else if (days) {
            const d = new Date();
            d.setDate(d.getDate() - parseInt(days, 10));
            dateFilter.gte = d;
        }
        if (endDate) {
            dateFilter.lte = new Date(endDate);
        }
        const where = {
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
        const replies = yield prisma_1.default.reply.findMany({
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
        const byStatusMap = {};
        // Group by provider
        const byProvider = {};
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
        const daily = Object.entries(replies.reduce((acc, r) => {
            const dateKey = r.createdAt.toISOString().split("T")[0];
            acc[dateKey] = (acc[dateKey] || 0) + 1;
            return acc;
        }, {}))
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
            avgConfidence: confidenceCount > 0
                ? Math.round((totalConfidence / confidenceCount) * 100) / 100
                : 0,
        };
    });
}
function getEvents(userId, filters) {
    return __awaiter(this, void 0, void 0, function* () {
        const { eventType, pageId, commentId, replyId, limit = 50, offset = 0, } = filters;
        const where = {
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
        const [events, total] = yield Promise.all([
            prisma_1.default.analyticsEvent.findMany({
                where,
                orderBy: {
                    createdAt: "desc",
                },
                take: parseInt(limit, 10),
                skip: parseInt(offset, 10),
            }),
            prisma_1.default.analyticsEvent.count({ where }),
        ]);
        return {
            events,
            total,
            limit,
            offset,
        };
    });
}
//# sourceMappingURL=analytics.service.js.map