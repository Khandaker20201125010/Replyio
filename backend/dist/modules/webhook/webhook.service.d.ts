export declare function verifyWebhook(mode: string, token: string, challenge: string): Promise<string>;
export declare function processWebhookEvent(payload: any): Promise<void>;
export declare function setupMetaAppWebhooks(): Promise<{
    success: boolean;
    message: string;
    appSubscription: any;
    pages: {
        success: boolean;
        data?: any;
        error?: string;
        pageId: string;
        pageName: string;
    }[];
}>;
//# sourceMappingURL=webhook.service.d.ts.map