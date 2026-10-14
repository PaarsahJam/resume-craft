/**
 * AI endpoint routes.
 *
 * Each route: validate the request (400) -> call OpenRouter -> validate the
 * model response (502) -> return the established contract. Upstream and
 * configuration failures are normalised to safe JSON errors that never leak
 * the API key or resume content.
 *
 * Every AI call goes through `callAi`, which logs structured, privacy-conscious
 * metadata (endpoint, models, token usage, duration, outcome, error category,
 * correlation id). Usage metadata is logged for operators and never returned
 * to the client: the HTTP response contract is unchanged from before usage
 * tracking existed.
 */

import { Router, type Request, type Response } from 'express';
import {
  createChatCompletion,
  getOpenRouterModel,
  OpenRouterError,
  type ChatCompletionOptions,
} from './openRouter';
import {
  ValidationError,
  ResponseValidationError,
  validateImproveSummary,
  validateImproveBullet,
  validateTailorJd,
  validateCoverLetter,
  validateTranslateResume,
  validateSummarySuggestions,
  validateBulletSuggestions,
  validateJdMatch,
  validateCoverLetterBody,
  validateTranslatedResume,
} from './validation';
import { createRateLimiter } from './rateLimiter';
import {
  buildAiLogRecord,
  createRequestId,
  emitAiLog,
} from './aiLogger';
import type { ChatCompletionResult } from './usage';

/** Conservative default: 20 AI requests per minute per client. */
export const aiRateLimiter = createRateLimiter({ windowMs: 60_000, max: 20 });

/** Injectable sink so tests can capture log records without the console. */
let aiLogSink: ((line: string) => void) | undefined;

/** Test-only: replace the log sink. Returns a restore function. */
export function setAiLogSink(sink: (line: string) => void): () => void {
  const previous = aiLogSink;
  aiLogSink = sink;
  return () => {
    aiLogSink = previous;
  };
}

/** Per-request logging context, populated by handleAi. */
interface AiCallContext {
  requestId: string;
  endpoint: string;
  startedAt: number;
}

/**
 * Perform one AI call and log its metadata.
 *
 * This is the only place provider usage becomes visible to the server. The
 * caller receives the full result and decides what to expose; routes expose
 * only the model content, preserving the pre-existing response contracts.
 */
async function callAi(
  options: ChatCompletionOptions,
  context: AiCallContext
): Promise<ChatCompletionResult> {
  const configuredModel = options.model;
  try {
    const result = await createChatCompletion(options);
    emitAiLog(
      buildAiLogRecord({
        requestId: context.requestId,
        endpoint: context.endpoint,
        configuredModel,
        startedAt: context.startedAt,
        outcome: 'success',
        httpStatus: 200,
        usage: result.usage,
        actualModel: result.meta?.model,
      }),
      aiLogSink
    );
    return result;
  } catch (err) {
    const status = err instanceof OpenRouterError ? err.status : 500;
    const category = err instanceof OpenRouterError ? err.code : 'unexpected_error';
    emitAiLog(
      buildAiLogRecord({
        requestId: context.requestId,
        endpoint: context.endpoint,
        configuredModel,
        startedAt: context.startedAt,
        outcome: 'error',
        httpStatus: status,
        errorCategory: category,
      }),
      aiLogSink
    );
    throw err;
  }
}

/** Parse a JSON string from the model, tolerating a leading markdown fence. */
function parseModelJson(text: string): unknown {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  const candidate = fenced ? fenced[1] : text;
  try {
    return JSON.parse(candidate);
  } catch {
    return null;
  }
}

/**
 * Wrap an async route so thrown typed errors map to safe HTTP responses.
 *
 * Also assigns a correlation id per request, echoes it back as `X-Request-Id`,
 * and records it on the response locals so `callAi` can attach it to the log
 * line. The id is generated here and never derived from user content.
 */
function handleAi(endpoint: string, fn: (req: Request, res: Response) => Promise<void>) {
  return async (req: Request, res: Response) => {
    const requestId = createRequestId();
    res.setHeader('X-Request-Id', requestId);
    (res as any).locals.aiContext = {
      requestId,
      endpoint,
      startedAt: Date.now(),
    } satisfies AiCallContext;

    try {
      await fn(req, res);
    } catch (err) {
      if (err instanceof ValidationError) {
        res.status(err.status).json({ error: err.message });
        return;
      }
      if (err instanceof ResponseValidationError) {
        res.status(err.status).json({ error: err.message });
        return;
      }
      if (err instanceof OpenRouterError) {
        res.status(err.status).json({ error: err.message, code: err.code });
        return;
      }
      // Unexpected error: do not leak internals, stack traces, or content.
      console.error('AI endpoint failed with an unexpected error.');
      res.status(500).json({ error: 'An unexpected error occurred. Please try again later.' });
    }
  };
}

/** Narrow a validated resume field to an array (already shape-checked). */
function asArray(v: unknown): any[] {
  return Array.isArray(v) ? v : [];
}

/** Read the logging context that handleAi attached to this response. */
function contextOf(res: Response): AiCallContext {
  return (
    (res as any).locals.aiContext ?? {
      requestId: createRequestId(),
      endpoint: 'unknown',
      startedAt: Date.now(),
    }
  );
}

export function buildAiRouter(): Router {
  const router = Router();
  router.use(aiRateLimiter);

  /* improve-summary -> { concise, executive } */
  router.post(
    '/improve-summary',
    handleAi('improve-summary', async (req, res) => {
      const { summary, headline, jobTitle } = validateImproveSummary(req.body);
      const { content: raw } = await callAi(
        {
          model: getOpenRouterModel(),
          json: true,
          messages: [
            {
              role: 'user',
              content: `You are an expert ATS executive resume writer. Improve the following professional summary for a candidate targeting a role as "${jobTitle || headline || 'Software Engineer'}".

Original Summary:
"${summary}"

Instructions:
- Use strong action-oriented, quantified language where appropriate.
- Keep it concise (3-4 sentences max).
- Return JSON with two suggestions: "concise" and "executive".
- Do NOT fabricate or make up fake companies, degrees, or achievements.`,
            },
          ],
        },
        contextOf(res)
      );
      res.json(validateSummarySuggestions(parseModelJson(raw)));
    })
  );

  /* improve-bullet -> { impact, concise, technical } */
  router.post(
    '/improve-bullet',
    handleAi('improve-bullet', async (req, res) => {
      const { bullet, jobTitle, company } = validateImproveBullet(req.body);
      const { content: raw } = await callAi(
        {
          model: getOpenRouterModel(),
          json: true,
          messages: [
            {
              role: 'user',
              content: `You are a career coach and ATS resume specialist. Improve the following resume bullet point for a ${jobTitle || 'Role'} at ${company || 'Company'}.

Original Bullet Point:
"${bullet}"

Instructions:
- Start with a powerful active verb.
- Highlight metrics, impact, and engineering or business outcomes.
- Provide 3 distinct improved variations: "impact", "concise", "technical".
- Never invent fabricated metrics or companies not mentioned in the original text.`,
            },
          ],
        },
        contextOf(res)
      );
      res.json(validateBulletSuggestions(parseModelJson(raw)));
    })
  );

  /* tailor-jd -> { score, matchedKeywords, missingKeywords, suggestions } */
  router.post(
    '/tailor-jd',
    handleAi('tailor-jd', async (req, res) => {
      const { resume, jobDescription } = validateTailorJd(req.body);
      const prompt = `Analyze this resume against the provided Job Description to calculate an ATS alignment match score (0-100), identify matched keywords, missing keywords, and actionable suggestions to tailor the resume.

Job Description:
${jobDescription}

Candidate Resume Summary & Skills:
Summary: ${resume.summary || 'None'}
Headline: ${(resume.personal as any)?.headline || 'None'}
Skills: ${JSON.stringify(resume.skills || [])}
Experience: ${JSON.stringify(
        asArray(resume.experience).map((e: any) => ({ title: e.jobTitle, desc: e.description }))
      )}

Return JSON with:
- score: number (0-100)
- matchedKeywords: array of string
- missingKeywords: array of string
- suggestions: array of string (3-5 specific bullet tailoring tips)`;
      const { content: raw } = await callAi(
        {
          model: getOpenRouterModel(),
          json: true,
          messages: [{ role: 'user', content: prompt }],
        },
        contextOf(res)
      );
      res.json(validateJdMatch(parseModelJson(raw)));
    })
  );

  /* generate-cover-letter -> { body } (plain text) */
  router.post(
    '/generate-cover-letter',
    handleAi('generate-cover-letter', async (req, res) => {
      const { resume, companyName, jobTitle, jobDescription, recipientName } = validateCoverLetter(req.body);
      const prompt = `Write a compelling, professional cover letter tailored for the position of "${jobTitle || 'the role'}" at "${companyName || 'the company'}".

Candidate Name: ${(resume.personal as any)?.fullName || 'the candidate'}
Headline: ${(resume.personal as any)?.headline || ''}
Summary: ${resume.summary || ''}
Relevant Skills: ${JSON.stringify(asArray(resume.skills).flatMap((s: any) => s.items))}
Job Description Context: ${jobDescription || 'Standard role application'}
Hiring Manager Name: ${recipientName || 'Hiring Team'}

Instructions:
- Write a 3 to 4 paragraph professional cover letter.
- Hook the reader in paragraph 1, highlight 2 key achievements/skills matching the role in paragraph 2, and end with a courteous call-to-action in paragraph 3.
- Do not fabricate work history not in the candidate's background.`;
      const { content: raw } = await callAi(
        {
          model: getOpenRouterModel(),
          json: false,
          messages: [{ role: 'user', content: prompt }],
        },
        contextOf(res)
      );
      res.json(validateCoverLetterBody({ body: raw }));
    })
  );

  /* translate-resume -> full Resume JSON */
  router.post(
    '/translate-resume',
    handleAi('translate-resume', async (req, res) => {
      const { resume, targetLanguage } = validateTranslateResume(req.body);
      const prompt = `Translate the following resume into ${targetLanguage || 'Armenian (Հայերեն)'}.
Keep all structural JSON keys intact and translate only user text fields (fullName, headline, location, summary, skill category names, jobTitles, company descriptions, education institution names, degrees, certification names, and language names/levels).

Input Resume:
${JSON.stringify(resume)}

Return the full translated Resume JSON matching the input structure exactly. Do not alter IDs or field types.`;
      const { content: raw } = await callAi(
        {
          model: getOpenRouterModel(),
          json: true,
          messages: [{ role: 'user', content: prompt }],
        },
        contextOf(res)
      );
      res.json(validateTranslatedResume(parseModelJson(raw)));
    })
  );

  return router;
}