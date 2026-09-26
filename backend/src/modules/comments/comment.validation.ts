import { z } from "zod";

export const getCommentsSchema = z
  .object({
    pageId: z.string().optional(),
    status: z
      .enum(["PENDING", "PROCESSING", "REPLIED", "FAILED", "IGNORED", "ERROR"])
      .optional(),
    limit: z
      .string()
      .optional()
      .transform((val) => (val ? parseInt(val, 10) : 20)),
    offset: z
      .string()
      .optional()
      .transform((val) => (val ? parseInt(val, 10) : 0)),
    // Support page-based pagination from frontend (converted to offset)
    page: z
      .string()
      .optional()
      .transform((val) => (val ? parseInt(val, 10) : undefined)),
  })
  .transform((data) => {
    // If 'page' is provided and 'offset' is not explicitly set, compute offset from page
    const limit = data.limit ?? 20;
    const page = data.page;
    const offset = page && page > 1 ? (page - 1) * limit : data.offset ?? 0;
    return { ...data, offset };
  });

export const updateCommentStatusSchema = z.object({
  status: z.enum(["PENDING", "PROCESSING", "REPLIED", "FAILED", "IGNORED", "ERROR"]),
});

export type GetCommentsInput = z.infer<typeof getCommentsSchema>;
export type UpdateCommentStatusInput = z.infer<
  typeof updateCommentStatusSchema
>;
