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
Object.defineProperty(exports, "__esModule", { value: true });
exports.MockAIProvider = void 0;
class MockAIProvider {
    analyzeComment(comment, context) {
        return __awaiter(this, void 0, void 0, function* () {
            const lower = (comment || "").toLowerCase().trim();
            let intent = "other";
            let sentiment = "neutral";
            let isSpam = false;
            let confidence = 0.9;
            let requiresHumanReview = false;
            // Detect spam
            const spamKeywords = ["viagra", "cialis", "free money", "winner", "lottery", "crypto profit"];
            if (spamKeywords.some((keyword) => lower.includes(keyword))) {
                isSpam = true;
                confidence = 0.95;
            }
            // Detect Bengali script
            const hasBengali = /[\u0980-\u09FF]/.test(comment);
            let language = hasBengali ? "bn" : "en";
            // Intent detection
            if (lower.includes("hi") ||
                lower.includes("hello") ||
                lower.includes("hey") ||
                lower.startsWith("hi") ||
                lower.startsWith("hey") ||
                lower.includes("how are you") ||
                lower.includes("কেমন আছেন") ||
                lower.includes("সালাম")) {
                intent = "greeting";
                sentiment = "positive";
            }
            else if (lower.includes("thank") ||
                lower.includes("great") ||
                lower.includes("awesome") ||
                lower.includes("nice") ||
                lower.includes("good") ||
                lower.includes("love") ||
                lower.includes("সুন্দর") ||
                lower.includes("ভালো") ||
                lower.includes("অসাধারণ")) {
                intent = "compliment";
                sentiment = "positive";
            }
            else if (lower.includes("bad") ||
                lower.includes("terrible") ||
                lower.includes("fake") ||
                lower.includes("scam") ||
                lower.includes("খারাপ")) {
                intent = "complaint";
                sentiment = "negative";
                requiresHumanReview = false;
            }
            else if (lower.includes("?") ||
                lower.includes("where") ||
                lower.includes("price") ||
                lower.includes("cost") ||
                lower.includes("how") ||
                lower.includes("koto") ||
                lower.includes("দাম") ||
                lower.includes("কোথায়")) {
                intent = "question";
                sentiment = "neutral";
            }
            return {
                intent,
                sentiment,
                language,
                isSpam,
                confidence,
                requiresHumanReview,
            };
        });
    }
    generateReply(comment, analysis, settings) {
        return __awaiter(this, void 0, void 0, function* () {
            const lower = (comment || "").toLowerCase().trim();
            const isBengali = analysis.language === "bn" || /[\u0980-\u09FF]/.test(comment);
            const { emojiUsage = true } = settings || {};
            let reply = "";
            if (isBengali) {
                if (analysis.intent === "greeting") {
                    reply = emojiUsage
                        ? "হ্যালো! অনেক ধন্যবাদ কমেন্ট করার জন্য, কেমন আছেন? 😊"
                        : "হ্যালো! অনেক ধন্যবাদ কমেন্ট করার জন্য, কেমন আছেন?";
                }
                else if (analysis.intent === "compliment") {
                    reply = emojiUsage
                        ? "অনেক অনেক ধন্যবাদ আপনার সুন্দর মন্তব্যের জন্য! পাশে থাকবেন ❤️"
                        : "অনেক অনেক ধন্যবাদ আপনার সুন্দর মন্তব্যের জন্য! পাশে থাকবেন।";
                }
                else if (analysis.intent === "question") {
                    reply = emojiUsage
                        ? "ইনবক্সে বিস্তারিত জানিয়ে দিচ্ছি, অনুগ্রহ করে মেসেজ চেক করুন! 😊"
                        : "ইনবক্সে বিস্তারিত জানিয়ে দিচ্ছি, অনুগ্রহ করে মেসেজ চেক করুন।";
                }
                else {
                    reply = emojiUsage
                        ? "অনেক ধন্যবাদ! আপনার মতামত আমাদের জন্য অনেক মূল্যবান ❤️"
                        : "অনেক ধন্যবাদ! আপনার মতামত আমাদের জন্য অনেক মূল্যবান।";
                }
            }
            else {
                // Natural English human replies
                if (analysis.intent === "greeting") {
                    if (lower.includes("how are you")) {
                        reply = emojiUsage
                            ? "Doing great, thank you! How are you doing today? 😊"
                            : "Doing great, thank you! How are you doing today?";
                    }
                    else {
                        reply = emojiUsage
                            ? "Hey there! Thanks for stopping by, hope you're having a great day! 🙌"
                            : "Hey there! Thanks for stopping by, hope you're having a great day!";
                    }
                }
                else if (analysis.intent === "compliment") {
                    reply = emojiUsage
                        ? "Thanks so much! Really appreciate the love and support! 🙌❤️"
                        : "Thanks so much! Really appreciate the love and support!";
                }
                else if (analysis.intent === "question") {
                    if (lower.includes("where")) {
                        reply = emojiUsage
                            ? "Feel free to check out our page links or drop us a quick DM for full details! 💬"
                            : "Feel free to check out our page links or drop us a quick DM for full details!";
                    }
                    else if (lower.includes("price") || lower.includes("cost") || lower.includes("koto")) {
                        reply = emojiUsage
                            ? "Just sent you the pricing details in your inbox! Please check your messages 😊"
                            : "Just sent you the pricing details in your inbox! Please check your messages.";
                    }
                    else {
                        reply = emojiUsage
                            ? "Great question! Sent you a message with all the details, check your inbox! 📩"
                            : "Great question! Sent you a message with all the details, check your inbox!";
                    }
                }
                else if (analysis.intent === "complaint") {
                    reply = emojiUsage
                        ? "So sorry to hear about that! Please drop us a DM right away so I can personally sort this out for you. 🙏"
                        : "So sorry to hear about that! Please drop us a DM right away so I can personally sort this out for you.";
                }
                else {
                    reply = emojiUsage
                        ? "Thanks so much for reaching out! Really appreciate you being here! 🙌"
                        : "Thanks so much for reaching out! Really appreciate you being here!";
                }
            }
            return {
                reply,
                confidence: 0.9,
            };
        });
    }
    validateReply(reply, settings) {
        return __awaiter(this, void 0, void 0, function* () {
            const maxLength = (settings === null || settings === void 0 ? void 0 : settings.maxLength) || 500;
            if (!reply || reply.trim().length === 0) {
                return false;
            }
            if (reply.length > maxLength) {
                return false;
            }
            return true;
        });
    }
}
exports.MockAIProvider = MockAIProvider;
//# sourceMappingURL=mock.provider.js.map