/**
 * Safe translation workflow for the resume.
 *
 * Design rules:
 * - This module NEVER mutates application state. It produces a *proposal*
 *   that the caller must explicitly accept before anything is applied.
 * - Any failure (network, timeout, provider error, malformed body, structurally
 *   invalid output) returns `{ ok: false }` and leaves the caller's resume
 *   untouched by construction.
 * - The original resume is passed in only so that added-claim detection can
 *   compare the translation against it. It is never overwritten here.
 *
 * Honest limitation, stated plainly: `detectAddedClaims` is a deterministic
 * *heuristic* over numeric claims (metrics, percentages, years) and nothing
 * else. It cannot prove a model will not fabricate, and by deliberate decision
 * (Phase 2.7) it does NOT attempt to match employers, job titles or
 * qualifications: keyword matching against a translation is too brittle and
 * produces false positives that train users to ignore warnings.
 *
 * What it flags is a *prompt to check*, not a verdict. Invented employers and
 * invented titles are therefore invisible to it, which is exactly why the UI
 * tells users to verify factual claims themselves rather than relying on the
 * warning list. The review step is the safeguard; the warnings are a helper.
 */

/** Structural keys every translated resume must contain as arrays. */
export const REQUIRED_ARRAY_KEYS = [
  'skills',
  'experience',
  'projects',
  'education',
  'certifications',
  'languages',
  'additionalSections',
  'sectionOrder',
  'hiddenSections',
] as const;

export type TranslationWarningKind = 'metric' | 'percentage' | 'year';

export interface TranslationWarning {
  kind: TranslationWarningKind;
  /** The token as it appears in the translation. */
  token: string;
  message: string;
}

export interface TranslationProposal {
  /** Validated translated resume, ready to be applied on explicit accept. */
  resume: Record<string, unknown>;
  targetLanguage: string;
  warnings: TranslationWarning[];
}

/**
 * Discriminants are strings, not booleans.
 *
 * This project does not enable `strictNullChecks`, and TypeScript widens
 * boolean literal types to `boolean` in that mode, which silently disables
 * discriminated-union narrowing. String literal discriminants survive, so the
 * caller can narrow on `result.status` reliably.
 */
export interface TranslationFailure {
  status: 'rejected';
  message: string;
}

export interface TranslationSuccess {
  status: 'proposed';
  proposal: TranslationProposal;
}

export type TranslationResult = TranslationSuccess | TranslationFailure;

/** Shape guard mirroring the arrays every template maps over. */
export type TranslationShapeResult =
  | { status: 'valid'; resume: Record<string, unknown> }
  | { status: 'invalid'; reason: string };

/**
 * Validate and normalise a translated resume.
 *
 * Phase 2.6 gap, fixed here. The server's `validateResume` treats absent
 * fields as acceptable, so a legitimately sparse resume round-trips fine.
 * This function originally *rejected* any missing array, so the server could
 * return 200 with output the client then refused — the user saw a failure
 * after an apparently successful request.
 *
 * Resolution: be lenient about absence, strict about wrong type. A missing
 * section is filled with `[]`, which is exactly what the Resume schema and
 * every template already expect, so sparse resumes survive translation
 * instead of being rejected. A section that is present but the wrong type
 * (`skills: "TypeScript"`) is still refused, because that cannot be rendered.
 *
 * `personal` remains required: without it there is no resume to apply.
 */
export function validateTranslationShape(payload: unknown): TranslationShapeResult {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    return { status: 'invalid', reason: 'The AI returned something that is not a resume. Please try again.' };
  }
  // Shallow copy: normalising must not mutate the object handed in.
  const resume: Record<string, unknown> = { ...(payload as Record<string, unknown>) };

  if (!resume.personal || typeof resume.personal !== 'object' || Array.isArray(resume.personal)) {
    return {
      status: 'invalid',
      reason: 'The AI returned an incomplete resume (missing contact details). Please try again.',
    };
  }

  for (const key of REQUIRED_ARRAY_KEYS) {
    const value = resume[key];
    if (value === undefined || value === null) {
      // Absent section: fill the empty default rather than failing the request.
      resume[key] = [];
      continue;
    }
    if (!Array.isArray(value)) {
      return {
        status: 'invalid',
        reason: `The AI returned an unreadable "${key}" section. Please try again.`,
      };
    }
  }

  return { status: 'valid', resume };
}

/** Collect every human-readable string from a resume-shaped value. */
export function collectText(value: unknown, out: string[] = [], depth = 0): string[] {
  if (depth > 12 || value === null || value === undefined) return out;
  if (typeof value === 'string') {
    out.push(value);
    return out;
  }
  if (typeof value === 'number' || typeof value === 'boolean') {
    out.push(String(value));
    return out;
  }
  if (Array.isArray(value)) {
    for (const item of value) collectText(item, out, depth + 1);
    return out;
  }
  if (typeof value === 'object') {
    for (const item of Object.values(value as Record<string, unknown>)) {
      collectText(item, out, depth + 1);
    }
  }
  return out;
}

/** Normalise a numeric token so `1,000` and `1000` compare equal. */
function normaliseNumber(token: string): string {
  return token.replace(/,/g, '').replace(/\.$/, '');
}

/**
 * Flag numeric claims that appear in the translation but not in the original.
 *
 * These are the highest-risk fabrications in a resume (invented percentages,
 * inflated headcounts, back-dated or invented employment years) and they are
 * detectable without a language model. False positives are possible when a
 * translation legitimately reformats a number; that is acceptable, because the
 * warning only prompts review — it never blocks acceptance.
 */
export function detectAddedClaims(
  original: unknown,
  translated: unknown
): TranslationWarning[] {
  const originalText = collectText(original).join(' \n ');
  const originalNumbers = new Set<string>();
  const originalPercentages = new Set<string>();
  const originalYears = new Set<string>();

  for (const token of originalText.match(/\d[\d.,]*/g) ?? []) {
    originalNumbers.add(normaliseNumber(token));
  }
  for (const token of originalText.match(/\d[\d.,]*\s*%/g) ?? []) {
    originalPercentages.add(normaliseNumber(token).replace(/\s*%$/, ''));
  }
  for (const token of originalText.match(/\b(?:19|20)\d{2}\b/g) ?? []) {
    originalYears.add(token);
  }

  const translatedText = collectText(translated).join(' \n ');
  const seen = new Set<string>();
  const warnings: TranslationWarning[] = [];

  const add = (kind: TranslationWarningKind, token: string, message: string) => {
    const dedupeKey = `${kind}:${token}`;
    if (seen.has(dedupeKey)) return;
    seen.add(dedupeKey);
    warnings.push({ kind, token, message });
  };

  for (const token of translatedText.match(/\b(?:19|20)\d{2}\b/g) ?? []) {
    if (!originalYears.has(token)) {
      add(
        'year',
        token,
        `The translation mentions the year ${token}, which does not appear in your original resume.`
      );
    }
  }

  for (const token of translatedText.match(/\d[\d.,]*\s*%/g) ?? []) {
    const normalised = normaliseNumber(token).replace(/\s*%$/, '');
    if (originalPercentages.has(normalised)) continue;
    add(
      'percentage',
      token.trim(),
      `The translation introduces the figure "${token.trim()}", which does not appear in your original resume.`
    );
  }

  for (const token of translatedText.match(/\d[\d.,]*/g) ?? []) {
    const normalised = normaliseNumber(token);
    if (normalised.length === 0) continue;
    if (originalNumbers.has(normalised)) continue;
    // Already surfaced with more context above.
    if (warnings.some((w) => w.token.replace(/\s*%$/, '') === token.trim())) continue;
    add(
      'metric',
      token.trim(),
      `The translation introduces the number "${token.trim()}", which does not appear in your original resume.`
    );
  }

  return warnings;
}

export interface RequestTranslationOptions {
  resume: unknown;
  targetLanguage: string;
  endpoint?: string;
  /** Injected for tests; defaults to the global fetch. */
  fetchImpl?: typeof fetch;
  /** Injected for tests so error messages stay deterministic. */
  describeFailure?: (res: any) => Promise<{ message: string }>;
}

/**
 * Request a translation and return it as a *proposal*.
 *
 * This performs no state mutation whatsoever: on success it returns the
 * validated translation plus any added-claim warnings, and it is the caller's
 * responsibility to apply it. On any failure it returns a user-safe message
 * and the caller's resume is never touched.
 */
export async function requestTranslation(
  options: RequestTranslationOptions
): Promise<TranslationResult> {
  const {
    resume,
    targetLanguage,
    endpoint = '/api/ai/translate-resume',
    fetchImpl,
    describeFailure,
  } = options;

  const doFetch = fetchImpl ?? (globalThis.fetch as typeof fetch);
  const describe =
    describeFailure ??
    (async (res: any) => {
      // Lazily required so this module stays importable without side effects.
      const mod = await import('./aiErrors');
      return mod.describeAiFailure(res);
    });

  let res: Response;
  try {
    res = await doFetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ resume, targetLanguage }),
    });
  } catch {
    const mod = await import('./aiErrors');
    return { status: 'rejected', message: mod.AI_NETWORK_ERROR_MESSAGE };
  }

  if (!res.ok) {
    const failure = await describe(res);
    return { status: 'rejected', message: failure.message };
  }

  let payload: unknown;
  try {
    payload = await res.json();
  } catch {
    return {
      status: 'rejected',
      message: 'The AI translation response could not be read. Please try again.',
    };
  }

  const shape = validateTranslationShape(payload);
  if (shape.status === 'invalid') {
    return { status: 'rejected', message: shape.reason };
  }

  return {
    status: 'proposed',
    proposal: {
      resume: shape.resume,
      targetLanguage,
      warnings: detectAddedClaims(resume, shape.resume),
    },
  };
}