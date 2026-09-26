"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateCommentStatusSchema = exports.getCommentsSchema = void 0;
const zod_1 = require("zod");
exports.getCommentsSchema = zod_1.z
    .object({
    pageId: zod_1.z.string().optional(),
    status: zod_1.z
        .enum(["PENDING", "PROCESSING", "REPLIED", "FAILED", "IGNORED", "ERROR"])
        .optional(),
    limit: zod_1.z
        .string()
        .optional()
        .transform((val) => (val ? parseInt(val, 10) : 20)),
    offset: zod_1.z
        .string()
        .optional()
        .transform((val) => (val ? parseInt(val, 10) : 0)),
    // Support page-based pagination from frontend (converted to offset)
    page: zod_1.z
        .string()
        .optional()
        .transform((val) => (val ? parseInt(val, 10) : undefined)),
})
    .transform((data) => {
    var _a, _b;
    // If 'page' is provided and 'offset' is not explicitly set, compute offset from page
    const limit = (_a = data.limit) !== null && _a !== void 0 ? _a : 20;
    const page = data.page;
    const offset = page && page > 1 ? (page - 1) * limit : (_b = data.offset) !== null && _b !== void 0 ? _b : 0;
    return Object.assign(Object.assign({}, data), { offset });
});
exports.updateCommentStatusSchema = zod_1.z.object({
    status: zod_1.z.enum(["PENDING", "PROCESSING", "REPLIED", "FAILED", "IGNORED", "ERROR"]),
});
//# sourceMappingURL=comment.validation.js.map