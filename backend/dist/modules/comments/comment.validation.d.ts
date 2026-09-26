import { z } from "zod";
export declare const getCommentsSchema: z.ZodPipe<z.ZodObject<{
    pageId: z.ZodOptional<z.ZodString>;
    status: z.ZodOptional<z.ZodEnum<{
        ERROR: "ERROR";
        FAILED: "FAILED";
        IGNORED: "IGNORED";
        PENDING: "PENDING";
        PROCESSING: "PROCESSING";
        REPLIED: "REPLIED";
    }>>;
    limit: z.ZodPipe<z.ZodOptional<z.ZodString>, z.ZodTransform<number, string | undefined>>;
    offset: z.ZodPipe<z.ZodOptional<z.ZodString>, z.ZodTransform<number, string | undefined>>;
    page: z.ZodPipe<z.ZodOptional<z.ZodString>, z.ZodTransform<number | undefined, string | undefined>>;
}, z.core.$strip>, z.ZodTransform<{
    pageId?: string | undefined;
    status?: "ERROR" | "FAILED" | "IGNORED" | "PENDING" | "PROCESSING" | "REPLIED" | undefined;
    limit: number;
    page: number | undefined;
    offset: number;
}, {
    pageId?: string | undefined;
    status?: "ERROR" | "FAILED" | "IGNORED" | "PENDING" | "PROCESSING" | "REPLIED" | undefined;
    limit: number;
    offset: number;
    page: number | undefined;
}>>;
export declare const updateCommentStatusSchema: z.ZodObject<{
    status: z.ZodEnum<{
        ERROR: "ERROR";
        FAILED: "FAILED";
        IGNORED: "IGNORED";
        PENDING: "PENDING";
        PROCESSING: "PROCESSING";
        REPLIED: "REPLIED";
    }>;
}, z.core.$strip>;
export type GetCommentsInput = z.infer<typeof getCommentsSchema>;
export type UpdateCommentStatusInput = z.infer<typeof updateCommentStatusSchema>;
//# sourceMappingURL=comment.validation.d.ts.map