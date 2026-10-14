/**
 * POST /api/ai/tailor-jd — Vercel function.
 *
 * Thin shell around the shared Express AI router. Validation, upstream error
 * normalisation, X-Request-Id correlation, and structured logging are all
 * preserved from src/server/aiRoutes.ts.
 *
 * Limitation: the in-process rate limiter is not distributed on Vercel.
 */
import { createAiHandler } from '../../src/server/vercelAdapter';

export default createAiHandler();
