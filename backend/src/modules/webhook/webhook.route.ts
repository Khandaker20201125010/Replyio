import { Router } from "express";
import {
  verifyWebhookController,
  handleWebhookEventController,
  setupWebhooksController,
} from "./webhook.controller";

const router = Router();

// Webhook verification (GET)
router.get("/", verifyWebhookController);

// Webhook event handling (POST)
router.post("/", handleWebhookEventController);

// Webhook setup/registration (POST)
router.post("/setup", setupWebhooksController);

export default router;
