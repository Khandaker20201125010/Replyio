export declare function getOverviewAnalytics(userId: string, filters: any): Promise<{
    totalComments: number;
    totalReplies: number;
    autoReplied: number;
    pendingReview: number;
    successRate: number;
    connectedPages: number;
}>;
export declare function getCommentsAnalytics(userId: string, filters: any): Promise<{
    daily: {
        date: string;
        count: number;
    }[];
    byStatus: {
        status: string;
        count: number;
    }[];
}>;
export declare function getRepliesAnalytics(userId: string, filters: any): Promise<{
    daily: {
        date: string;
        count: number;
    }[];
    byStatus: {
        status: string;
        count: number;
    }[];
    byProvider: Record<string, number>;
    avgConfidence: number;
}>;
export declare function getEvents(userId: string, filters: any): Promise<{
    events: {
        id: string;
        userId: string;
        eventType: string;
        eventTypeDetail: string | null;
        facebookPageId: string | null;
        commentId: string | null;
        replyId: string | null;
        metadata: import("@prisma/client/runtime/library").JsonValue | null;
        createdAt: Date;
    }[];
    total: number;
    limit: any;
    offset: any;
}>;
//# sourceMappingURL=analytics.service.d.ts.map