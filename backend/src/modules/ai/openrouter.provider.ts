import { env } from '../../config/env';
import { logger } from '../../utils/logger';
import type { AIProvider, AIAnalysisResult, AIReplyResult } from './ai.provider';
import { MockAIProvider } from './mock.provider';

const WORKING_MODELS = [
  'inclusionai/ling-3.0-flash-sante:free',
  'liquid/lfm-2.5-2.6b:free',
  'google/gemma-4-26b-a4b-it:free',
  'google/gemma-4-31b-it:free',
  'qwen/qwen3.8-27b:free',
];

export class OpenRouterProvider implements AIProvider {
  private apiKey: string | null = null;
  private llmModel: string;
  private fallback: MockAIProvider;

  constructor() {
    this.apiKey = env.OPENROUTER_API_KEY || null;
    this.llmModel = env.OPENROUTER_LLM_MODEL || 'inclusionai/ling-3.0-flash-sante:free';
    this.fallback = new MockAIProvider();

    if (!this.apiKey) {
      logger.warn('OpenRouter API key not configured, using fallback behavior');
    }
  }

  private getModelList(): string[] {
    const list = [this.llmModel];
    for (const m of WORKING_MODELS) {
      if (!list.includes(m)) {
        list.push(m);
      }
    }
    return list;
  }

  async analyzeComment(comment: string, context?: any): Promise<AIAnalysisResult> {
    if (!this.apiKey) {
      logger.warn('OpenRouter API key not configured, falling back to mock provider');
      return this.fallback.analyzeComment(comment, context);
    }

    const modelsToTry = this.getModelList();

    for (const model of modelsToTry) {
      try {
        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': env.FRONTEND_URL || 'https://replio-frontend-livid.vercel.app',
            'X-Title': 'Replio',
          },
          signal: AbortSignal.timeout(8000),
          body: JSON.stringify({
            model,
            messages: [
              {
                role: 'system',
                content: `You are an AI assistant analyzing a Facebook comment. Return a strict JSON object with:
- intent: (greeting, question, compliment, complaint, inquiry, other)
- sentiment: (positive, negative, neutral)
- language: ISO language code (e.g. "en", "bn" for Bengali)
- isSpam: boolean
- confidence: number between 0.0 and 1.0
- requiresHumanReview: boolean (set to true ONLY for illegal threats, severe hate speech, or complex billing disputes. For all regular questions, compliments, or greetings, set to false).

Respond with valid JSON only.`,
              },
              {
                role: 'user',
                content: `Comment: ${comment}`,
              },
            ],
            temperature: 0.2,
          }),
        });

        if (!response.ok) {
          logger.warn({ status: response.status, model }, 'OpenRouter analysis attempt failed, trying next');
          continue;
        }

        const data = await response.json();
        const content = data.choices?.[0]?.message?.content;
        if (!content) continue;

        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (!jsonMatch) continue;

        const result = JSON.parse(jsonMatch[0]) as AIAnalysisResult;
        if (
          result.intent &&
          result.sentiment &&
          typeof result.isSpam === 'boolean' &&
          typeof result.confidence === 'number'
        ) {
          return {
            intent: result.intent,
            sentiment: result.sentiment,
            language: result.language || 'en',
            isSpam: result.isSpam,
            confidence: Math.max(0.7, result.confidence),
            requiresHumanReview: result.requiresHumanReview || false,
          };
        }
      } catch (err: any) {
        logger.warn({ error: err.message, model }, 'OpenRouter analyzeComment model error');
      }
    }

    logger.warn('All OpenRouter analysis models failed, using intelligent fallback');
    return this.fallback.analyzeComment(comment, context);
  }

  async generateReply(
    comment: string,
    analysis: AIAnalysisResult,
    settings: any,
  ): Promise<AIReplyResult> {
    if (!this.apiKey) {
      logger.warn('OpenRouter API key not configured, falling back to mock provider');
      return this.fallback.generateReply(comment, analysis, settings);
    }

    const {
      tone = 'friendly',
      emojiUsage = true,
      maxLength = 300,
    } = settings || {};

    const systemPrompt = `You are the authentic human creator and owner of this Facebook page replying directly to a user's comment as yourself ("me").

GOAL:
Make the user feel heard, appreciated, and valued. Speak in an authentic, natural, warm human voice. NOBODY should ever suspect that an AI is replying!

RULES:
1. Speak in first-person ("I", "my", or friendly collective "we" for our team/page).
2. DO NOT use generic robotic corporate lines like:
   - "Thank you for your comment"
   - "We will review it and respond as needed"
   - "As an AI..."
   - "Our team will contact you shortly"
   - "Thank you for reaching out to us"
3. Match the language and vibe of the commenter:
   - If in Bengali (বাংলা) or Banglish, reply warmly and naturally in Bengali/Banglish (e.g. "অনেক অনেক ধন্যবাদ ভাইয়া/আপু! পাশে থাকবেন ❤️" or "ইনবক্সে বিস্তারিত জানিয়ে দিচ্ছি! 😊").
   - If English, reply naturally like a real friendly person (e.g. "Hey there! Thanks so much, really appreciate you dropping by! 🙌" or "Doing great, thank you! How are you doing today? 😊").
   - If they ask a question or for details ("where?", "how much?", "price?"), answer helpfully and suggest checking inbox/DM if appropriate.
4. Keep it concise (1 to 2 short sentences). Maximum ${maxLength} characters.
5. ${emojiUsage ? 'Use 1 or 2 natural, warm emojis.' : 'Do not use emojis.'}
6. Output ONLY the reply text itself. Never output quotation marks, explanations, or labels.`;

    const modelsToTry = this.getModelList();

    for (const model of modelsToTry) {
      try {
        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': env.FRONTEND_URL || 'https://replio-frontend-livid.vercel.app',
            'X-Title': 'Replio',
          },
          signal: AbortSignal.timeout(9000),
          body: JSON.stringify({
            model,
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: `Comment: "${comment}"` },
            ],
            temperature: 0.7,
            max_tokens: Math.min(120, Math.ceil(maxLength / 3)),
          }),
        });

        if (!response.ok) {
          logger.warn({ status: response.status, model }, 'OpenRouter reply attempt failed, trying next');
          continue;
        }

        const data = await response.json();
        let reply = data.choices?.[0]?.message?.content?.trim() || '';

        // Clean any accidental markdown quotes
        reply = reply.replace(/^["'`]|["'`]$/g, '').trim();

        if (reply.length > 0) {
          if (reply.length > maxLength) {
            reply = reply.substring(0, maxLength).trim();
          }
          logger.info({ model, reply }, 'OpenRouter generated human-like reply');
          return {
            reply,
            confidence: 0.95,
          };
        }
      } catch (err: any) {
        logger.warn({ error: err.message, model }, 'OpenRouter generateReply model error');
      }
    }

    logger.warn('All OpenRouter reply models failed, using intelligent human fallback');
    return this.fallback.generateReply(comment, analysis, settings);
  }

  async validateReply(reply: string, settings?: any): Promise<boolean> {
    const maxLength = settings?.maxLength || 500;

    if (!reply || reply.trim().length === 0) {
      return false;
    }

    if (reply.length > maxLength) {
      return false;
    }

    const unsafePatterns = [
      'password',
      'credit card',
      'ssn',
      'social security',
      'as an ai language model',
      'as an ai',
    ];

    if (unsafePatterns.some((pattern) => reply.toLowerCase().includes(pattern))) {
      return false;
    }

    return true;
  }
}
