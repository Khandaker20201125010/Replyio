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
exports.getEffectiveUserIds = getEffectiveUserIds;
const prisma_1 = __importDefault(require("../config/prisma"));
const LINKED_ADMIN_EMAILS = [
    "prantokih42@gmail.com",
    "kihpranto42@gmail.com",
];
function getEffectiveUserIds(userId) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const user = yield prisma_1.default.user.findUnique({
                where: { id: userId },
                select: { email: true },
            });
            if ((user === null || user === void 0 ? void 0 : user.email) && LINKED_ADMIN_EMAILS.includes(user.email.toLowerCase())) {
                const linkedUsers = yield prisma_1.default.user.findMany({
                    where: {
                        email: { in: LINKED_ADMIN_EMAILS, mode: "insensitive" },
                    },
                    select: { id: true },
                });
                return linkedUsers.map((u) => u.id);
            }
        }
        catch (_a) {
            // Fall back to original userId on any error
        }
        return [userId];
    });
}
//# sourceMappingURL=user.js.map