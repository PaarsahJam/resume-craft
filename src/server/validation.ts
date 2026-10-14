/**
 * Request-body and response validation for the AI endpoints.
 *
 * Validators throw a typed error on invalid input and return the parsed value
 * on success. This keeps the control flow independent of discriminated-union
 * narrowing (the project does not enable `strict`), and lets a single route
 * error handler map error kinds to HTTP statuses:
 *
 *   ValidationError         -> 400 (client sent bad input)
 *   ResponseValidationError -> 502 (model returned bad output)
 *
 * Limits are generous enough for real resume content but bounded so a hostile
 * or buggy client cannot smuggle huge payloads into a prompt.
 */

/** Invalid request from the client -> HTTP 400. */
export class ValidationError extends Error {
  readonly status = 400;
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

/** Model returned output that does not match the expected shape -> HTTP 502. */
export class ResponseValidationError extends Error {
  readonly status = 502;
  constructor(message: string) {
    super(message);
    this.name = 'ResponseValidationError';
  }
}

/* ------------------------------------------------------------------ */
/* Shared field helpers                                                */
/* ------------------------------------------------------------------ */

const MAX_TEXT = 20_000; // a single free-text field
const MAX_ARRAY_ITEMS = 200;
const MAX_NESTED = 50;

function isObject(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v);
}

function isString(v: unknown): v is string {
  return typeof v === 'string';
}

function isNumber(v: unknown): v is number {
  return typeof v === 'number' && Number.isFinite(v);
}

function isStringArray(v: unknown, maxItems = MAX_ARRAY_ITEMS): v is string[] {
  return Array.isArray(v) && v.length <= maxItems && v.every(isString);
}

/** A required, non-empty, length-bounded string. */
function requiredString(v: unknown, field: string, max = MAX_TEXT): string {
  if (!isString(v)) throw new ValidationError(`${field} must be a string.`);
  if (v.trim().length === 0) throw new ValidationError(`${field} must not be empty.`);
  if (v.length > max) throw new ValidationError(`${field} is too long (max ${max} characters).`);
  return v;
}

/** An optional, length-bounded string. */
function optionalString(v: unknown, field: string, max = MAX_TEXT): string | undefined {
  if (v === undefined || v === null) return undefined;
  if (!isString(v)) throw new ValidationError(`${field} must be a string.`);
  if (v.length > max) throw new ValidationError(`${field} is too long (max ${max} characters).`);
  return v;
}

function requireObject(v: unknown, field: string): Record<string, unknown> {
  if (!isObject(v)) throw new ValidationError(`${field} must be an object.`);
  return v;
}

/* ------------------------------------------------------------------ */
/* Resume structural validation                                        */
/* ------------------------------------------------------------------ */

/**
 * Validate the subset of the Resume shape that the AI endpoints actually read.
 * This is intentionally structural, not a full Resume type check: the model
 * only consumes specific fields, so we validate those and ignore the rest.
 */
function validateResume(v: unknown): Record<string, unknown> {
  const resume = requireObject(v, 'resume');

  // personal (optional object)
  if (resume.personal !== undefined && resume.personal !== null) {
    if (!isObject(resume.personal)) {
      throw new ValidationError('resume.personal must be an object.');
    }
  }

  // summary (optional string)
  if (resume.summary !== undefined && resume.summary !== null && !isString(resume.summary)) {
    throw new ValidationError('resume.summary must be a string.');
  }

  // skills (optional array of { category: string, items: string[] })
  if (resume.skills !== undefined && resume.skills !== null) {
    if (!Array.isArray(resume.skills) || resume.skills.length > MAX_ARRAY_ITEMS) {
      throw new ValidationError('resume.skills must be an array.');
    }
    for (const cat of resume.skills) {
      if (!isObject(cat) || !isString(cat.category) || !isStringArray(cat.items)) {
        throw new ValidationError('resume.skills entries must have category and items[].');
      }
    }
  }

  // experience (optional array of { jobTitle, description[] })
  if (resume.experience !== undefined && resume.experience !== null) {
    if (!Array.isArray(resume.experience) || resume.experience.length > MAX_NESTED) {
      throw new ValidationError('resume.experience must be an array.');
    }
    for (const exp of resume.experience) {
      if (!isObject(exp)) {
        throw new ValidationError('resume.experience entries must be objects.');
      }
      if (exp.description !== undefined && exp.description !== null && !isStringArray(exp.description)) {
        throw new ValidationError('resume.experience description must be a string array.');
      }
    }
  }

  return resume;
}

/* ------------------------------------------------------------------ */
/* Per-endpoint request schemas                                        */
/* ------------------------------------------------------------------ */

export interface ImproveSummaryInput {
  summary: string;
  headline?: string;
  jobTitle?: string;
}

export function validateImproveSummary(body: unknown): ImproveSummaryInput {
  const b = requireObject(body, 'Request body');
  return {
    summary: requiredString(b.summary, 'summary'),
    headline: optionalString(b.headline, 'headline'),
    jobTitle: optionalString(b.jobTitle, 'jobTitle'),
  };
}

export interface ImproveBulletInput {
  bullet: string;
  jobTitle?: string;
  company?: string;
}

export function validateImproveBullet(body: unknown): ImproveBulletInput {
  const b = requireObject(body, 'Request body');
  return {
    bullet: requiredString(b.bullet, 'bullet'),
    jobTitle: optionalString(b.jobTitle, 'jobTitle'),
    company: optionalString(b.company, 'company'),
  };
}

export interface TailorJdInput {
  resume: Record<string, unknown>;
  jobDescription: string;
}

export function validateTailorJd(body: unknown): TailorJdInput {
  const b = requireObject(body, 'Request body');
  return {
    resume: validateResume(b.resume),
    jobDescription: requiredString(b.jobDescription, 'jobDescription'),
  };
}

export interface CoverLetterInput {
  resume: Record<string, unknown>;
  companyName?: string;
  jobTitle?: string;
  jobDescription?: string;
  recipientName?: string;
}

export function validateCoverLetter(body: unknown): CoverLetterInput {
  const b = requireObject(body, 'Request body');
  return {
    resume: validateResume(b.resume),
    companyName: optionalString(b.companyName, 'companyName'),
    jobTitle: optionalString(b.jobTitle, 'jobTitle'),
    jobDescription: optionalString(b.jobDescription, 'jobDescription'),
    recipientName: optionalString(b.recipientName, 'recipientName'),
  };
}

export interface TranslateResumeInput {
  resume: Record<string, unknown>;
  targetLanguage?: string;
}

export function validateTranslateResume(body: unknown): TranslateResumeInput {
  const b = requireObject(body, 'Request body');
  return {
    resume: validateResume(b.resume),
    targetLanguage: optionalString(b.targetLanguage, 'targetLanguage', 200),
  };
}

/* ------------------------------------------------------------------ */
/* Response validators (model output) — throw ResponseValidationError   */
/* ------------------------------------------------------------------ */

export interface SummarySuggestions {
  concise: string;
  executive: string;
}

export function validateSummarySuggestions(v: unknown): SummarySuggestions {
  const o = requireObjectModel(v);
  if (!isString(o.concise) || !isString(o.executive)) {
    throw new ResponseValidationError('Model response must include concise and executive strings.');
  }
  return { concise: o.concise, executive: o.executive };
}

export interface BulletSuggestions {
  impact: string;
  concise: string;
  technical: string;
}

export function validateBulletSuggestions(v: unknown): BulletSuggestions {
  const o = requireObjectModel(v);
  if (!isString(o.impact) || !isString(o.concise) || !isString(o.technical)) {
    throw new ResponseValidationError('Model response must include impact, concise, and technical strings.');
  }
  return { impact: o.impact, concise: o.concise, technical: o.technical };
}

export interface JdMatch {
  score: number;
  matchedKeywords: string[];
  missingKeywords: string[];
  suggestions: string[];
}

export function validateJdMatch(v: unknown): JdMatch {
  const o = requireObjectModel(v);
  if (!isNumber(o.score)) throw new ResponseValidationError('Model response score must be a number.');
  if (!isStringArray(o.matchedKeywords)) {
    throw new ResponseValidationError('Model response matchedKeywords must be a string array.');
  }
  if (!isStringArray(o.missingKeywords)) {
    throw new ResponseValidationError('Model response missingKeywords must be a string array.');
  }
  if (!isStringArray(o.suggestions)) {
    throw new ResponseValidationError('Model response suggestions must be a string array.');
  }
  return {
    score: o.score,
    matchedKeywords: o.matchedKeywords,
    missingKeywords: o.missingKeywords,
    suggestions: o.suggestions,
  };
}

/** The cover-letter contract is a plain-text body. */
export function validateCoverLetterBody(v: unknown): { body: string } {
  const o = requireObjectModel(v);
  if (!isString(o.body)) throw new ResponseValidationError('Model response must include a body string.');
  return { body: o.body };
}

/** The translation contract is a full Resume-shaped object. */
export function validateTranslatedResume(v: unknown): Record<string, unknown> {
  if (!isObject(v)) throw new ResponseValidationError('Model response must be an object.');
  // Reuse the structural resume validator so a malformed translation is caught
  // before it reaches the client and crashes a template. Wrap as a model error.
  try {
    return validateResume(v);
  } catch (e: any) {
    throw new ResponseValidationError(e?.message || 'Model response is not a valid resume.');
  }
}

/** requireObject variant that raises a ResponseValidationError (not 400). */
function requireObjectModel(v: unknown): Record<string, unknown> {
  if (!isObject(v)) throw new ResponseValidationError('Model response must be an object.');
  return v;
}