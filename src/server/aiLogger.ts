/**
 * Structured, privacy-conscious logging for AI requests.
 *
 * What is recorded: endpoint, configured model, actual model, token counts,
 * duration, outcome, safe error category, and a correlation id.
 *
 * What is NEVER recorded, by design:
 * - API keys or any part of an authorization header
 * - Prompts, completions, resume content, cover-letter text, job descriptions
 * - Raw upstream error bodies
 * - Request or response payloads of any kind
 *
 * The log record is assembled from a fixed field list. There is no code path
 * that copies arbitrary upstream or user data into it, so adding a new caller
 * cannot accidentally leak content. `buildAiLogRecord` returns a plain object
 * that `emitAiLog` serialises; tests assert on the record, not on console text.
 */

import type { ProviderUsage } from './usage';

/** Stable outcome values for a logged AI request. */
export type AiOutcome = 'success' | 'error';

export interface AiLogRecord {
  /** Correlation id, also returned to the client as `X-Request-Id`. */
  requestId: string;
  /** Logical operation, e.g. 'improve-summary'. Never user content. */
  endpoint: string;
  /** Model resolved from configuration. */
  configuredModel: string;
  /** Model the provider reported serving the request, when supplied. */
  actualModel?: string;
  promptTokens?: number;
  completionTokens?: number;
  totalTokens?: number;
  /** Wall-clock duration of the AI call in milliseconds. */
  durationMs: number;
  outcome: AiOutcome;
  /** Safe machine-readable category; matches OpenRouterError.code on failure. */
  errorCategory?: string;
  /** Safe HTTP status returned to the client. */
  httpStatus: number;
}

export interface BuildAiLogRecordInput {
  requestId: string;
  endpoint: string;
  configuredModel: string;
  startedAt: number;
  outcome: AiOutcome;
  httpStatus: number;
  usage?: ProviderUsage;
  actualModel?: string;
  errorCategory?: string;
}

/** Build the log record. Only whitelisted fields are ever copied through. */
export function buildAiLogRecord(input: BuildAiLogRecordInput): AiLogRecord {
  const record: AiLogRecord = {
    requestId: input.requestId,
    endpoint: input.endpoint,
    configuredModel: input.configuredModel,
    durationMs: Math.max(0, Math.round(Date.now() - input.startedAt)),
    outcome: input.outcome,
    httpStatus: input.httpStatus,
  };

  if (typeof input.actualModel === 'string' && input.actualModel.trim().length > 0) {
    record.actualModel = input.actualModel.trim();
  }
  if (input.usage) {
    if (typeof input.usage.promptTokens === 'number') record.promptTokens = input.usage.promptTokens;
    if (typeof input.usage.completionTokens === 'number') record.completionTokens = input.usage.completionTokens;
    if (typeof input.usage.totalTokens === 'number') record.totalTokens = input.usage.totalTokens;
  }
  if (typeof input.errorCategory === 'string' && input.errorCategory.length > 0) {
    record.errorCategory = input.errorCategory;
  }

  return record;
}

/**
 * Emit one JSON line per AI request.
 *
 * `sink` is injectable so tests capture output without touching the console.
 * The default writes to stdout via console.log, matching the rest of the
 * server's logging.
 */
export function emitAiLog(record: AiLogRecord, sink: (line: string) => void = console.log): void {
  try {
    sink(JSON.stringify({ component: 'ai', ...record }));
  } catch {
    // Logging must never break a request. A serialisation failure is swallowed.
  }
}

/** Generate a short, non-guessable correlation id. */
export function createRequestId(): string {
  try {
    const cryptoObj: any = (globalThis as any).crypto;
    if (cryptoObj?.randomUUID) return cryptoObj.randomUUID();
    if (cryptoObj?.getRandomValues) {
      const bytes = cryptoObj.getRandomValues(new Uint8Array(8));
      return Array.from(bytes, (b: number) => b.toString(16).padStart(2, '0')).join('');
    }
  } catch {
    // fall through
  }
  // Non-cryptographic fallback; still adequate for correlating log lines.
  return `req-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}