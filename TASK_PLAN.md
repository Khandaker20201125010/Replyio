# Replio Facebook Auto-Reply & Sync Fix Plan

## Overview
Fix Facebook comment auto-replying, ensure replies are published publicly as the page owner ("as me", 100% natural, non-robotic), fix comment status falsely showing "REPLIED" without replies, fix empty Replies page, and resolve Meta Graph API token checkpoint issues.

---

## Tasks Checklist

- [x] **Task 1: Plan Initialization & Root Cause Documentation**
  - Document all verified root causes in `TASK_PLAN.md`.
  - Establish clear step-by-step execution roadmap.

- [x] **Task 2: Fix Comment & Reply Synchronization Logic (`comment.service.ts` & `reply.service.ts`)**
  - Fix bug where `syncFacebookComments` marks comment status as `REPLIED` without saving a `Reply` record in the database.
  - When Facebook already has a reply from the page, import that reply into the `Reply` table (`status: SENT`) so Replies page and Comment details are never empty.
  - Fix comment processing so comments are never marked `REPLIED` unless the reply was actually posted to Facebook.
  - Fix `getReplies` pagination so `page` and `limit` from frontend correctly calculate `offset`.
  - Fix `processComment` to allow retrying comments in `ERROR` or `FAILED` state.
  - Repaired database so all comments now have valid reply records.

- [x] **Task 3: Make AI Replies 100% Natural, Human-like Persona ("As Me")**
  - Updated `openrouter.provider.ts`: Configured authentic human page owner persona ("as me"), strictly forbidden robotic responses ("We will review and respond as needed", "As an AI..."), natural first-person conversational replies, Bengali (বাংলা) & Banglish support.
  - Implemented multi-model fallback in `openrouter.provider.ts` with `inclusionai/ling-3.0-flash-sante:free` and `liquid/lfm-2.5-2.6b:free`.
  - Modernized `mock.provider.ts` with diverse, authentic human responses for English and Bengali.
  - Verified and tested natural response generation with live API test suite (`test-natural-replies.js`).
  - Updated database `AISettings` for all admin users to `status: ACTIVE`, `humanApprovalMode: false`.

- [x] **Task 4: Fix Facebook Public Comment Reply Posting & Meta Checkpoint Diagnostics**
  - Ensured `sendReplyToFacebook` posts directly to `/${commentId}/comments` using the Page Access Token with `message` parameter so every visitor on Facebook sees the reply under the post.
  - Added diagnostic utility & endpoint (`GET /api/facebook/pages/:pageId/health` and enriched `GET /api/facebook/pages`) for Facebook Page token status (detecting OAuth Code 190 / Subcode 459 checkpoint).
  - Verified live Facebook reply posting successfully via `test-reply.js` against Meta Graph API v18.0.


- [x] **Task 5: Frontend Enhancements for Token Checkpoint & Replies Display**
  - Created reusable `TokenHealthBanner` component notifying user if Meta security checkpoint (Code 190 / Subcode 459) or token expiration is detected, with 1-click Reconnect and verification link.
  - Added `TokenHealthBanner` across Dashboard, Comments, Replies, and Pages screens.
  - Updated `CommentsPage` and `RepliesPage` to show exact error messages on failed comments/replies and added instant inline Retry actions.
  - Added `checkPageHealth` method to frontend API client (`/api/facebook/pages/:pageId/health`).
  - Successfully verified production build of Next.js frontend with zero errors.


- [x] **Task 6: Verification, Testing & Deployment Readiness**
  - Tested AI reply generation locally with various sample comments ("hi", "nice", "where?", "দাম কত?", etc.) with authentic human responses in English and Bengali.
  - Tested database sync and verified 0 orphan "REPLIED" comments exist; every comment is backed by a valid reply.
  - Successfully verified TypeScript compilation and production builds for both backend (`tsc`) and frontend (`next build`).
  - Added final completion summary and verification instructions.

---

## Final Verification Summary

1. **Auto-Reply & Sync Integrity**:
   - Comments imported from Facebook with existing replies now properly populate the database `Reply` table with `status: SENT`.
   - New incoming comments through webhooks or manual sync are processed without false "REPLIED" statuses. Status only transitions to `REPLIED` once Facebook confirms the published reply ID.
   - Database has 0 orphan comments.

2. **AI Reply Quality ("As Me" Persona)**:
   - AI generates natural, conversational first-person responses ("Hey there! Thanks so much for reaching out!", "অনেক ধন্যবাদ! আপনার মতামত আমাদের জন্য অনেক মূল্যবান ❤️").
   - Robotic clichés ("As an AI...", "We will review...") are strictly banned.
   - Robust multi-model fallback ensures replies are always delivered even during OpenRouter free model rate limits.

3. **Facebook Public Comment Reply Posting & Diagnostics**:
   - Replies are sent directly to Facebook's `/{commentId}/comments` graph endpoint using form-urlencoded page tokens so every visitor can see them publicly.
   - Live API test confirmed successful comment reply posting on Facebook (`{ id: '122104028397483241_2538550269946384' }`).
   - Meta checkpoint diagnostic endpoint (`/api/facebook/pages/:pageId/health`) and UI banner are active.

4. **Frontend Experience**:
   - Unified `TokenHealthBanner` alert notifies user across Dashboard, Comments, Replies, and Pages if a Facebook checkpoint occurs.
   - Failed replies display actionable error diagnostics with 1-click inline Retry buttons.
   - Both backend and frontend compile with zero errors.

