/**
 * Shared mapping from AI endpoint failures to user-facing messages.
 *
 * The server returns a stable machine-readable `code` alongside a human
 * message for every failure (`handleAi` in src/server/aiRoutes.ts). The
 * frontend previously threw away that code and alerted a generic string, so
 * every failure mode looked identical to the user. This module turns the code
 * into an actionable, non-blocking message instead.
 *
 * Safety rules:
 * - Raw upstream text is never shown. Only this file's own strings and the
 *   server's own request-validation messages (status 400, which never carries
 *   upstream content) are ever displayed.
 * - Retry times are only promised when Retry-After is present and parseable.
 * - Never surfaced to users: API keys, authorization headers, resume content.
 *
 * No React import: this module is plain data + functions so it can be unit
 * tested in the Node test environment.
 */

/** Minimal structural view of a fetch Response, so tests can pass literals. */
export interface AiErrorResponseLike {
  status: number;
  headers: { get(name: string): string | null };
  json(): Promise<any>;
}

/** A failed AI request, reduced to what the UI needs. */
export interface AiFailure {
  /** Message safe to render directly to the user. */
  message: string;
  /** Seconds from Retry-After, or null when no usable value was supplied. */
  retryAfterSeconds: number | null;
}

/** Message used when the request never reached the server. */
export const AI_NETWORK_ERROR_MESSAGE =
  'Could not reach the AI server. Check that the server is running and try again.';

/** Generic fallback when the status is unknown. */
export const AI_UNKNOWN_ERROR_MESSAGE =
  'The AI request could not be completed. Please try again.';

/** Message used for a 400 carrying no recognisable validation detail. */
export const AI_BAD_REQUEST_MESSAGE =
  'The request was rejected as invalid. Please check your input and try again.';

/**
 * Human-readable text for each server error code. Codes are the stable
 * contract from `OpenRouterError` and `handleAi`.
 */
const CODE_MESSAGES: Record<string, string> = {
  not_configured:
    'AI features are not configured on this server yet. Add OPENROUTER_API_KEY to the server environment and restart it.',
  auth_error:
    'The AI provider rejected the server credentials. Check the server API key configuration.',
  rate_limited: 'Too many AI requests. Please wait a moment before trying again.',
  model_not_found:
    'The configured AI model is unavailable on this server. Check the OPENROUTER_MODEL setting.',
  timeout: 'The AI service took too long to respond. Please try again.',
  network_error: 'The AI service is unreachable right now. Please try again shortly.',
  malformed_response: 'The AI service returned an unreadable response. Please try again.',
  empty_response: 'The AI service returned no usable content. Please try again.',
  bad_request: AI_BAD_REQUEST_MESSAGE,
  upstream_error: 'The AI service returned an error. Please try again shortly.',
};

/**
 * Parse a `Retry-After` header into whole seconds.
 *
 * Accepts both supported forms: delta-seconds ("42") and an HTTP-date. Returns
 * null for anything absent or unparseable so callers never promise a retry
 * time that cannot be determined.
 */
export function parseRetryAfterSeconds(headers: { get(name: string): string | null }): number | null {
  const raw = headers?.get?.('Retry-After');
  if (typeof raw !== 'string') return null;

  const trimmed = raw.trim();
  if (trimmed.length === 0) return null;

  // Delta-seconds form.
  if (/^\d+$/.test(trimmed)) {
    const seconds = Number(trimmed);
    return Number.isFinite(seconds) ? seconds : null;
  }

  // Reject negative/otherwise numeric junk explicitly: Date.parse is lenient
  // and would read "-5" as a year rather than reporting it as malformed.
  if (/^[+-]?\d*\.?\d+$/.test(trimmed)) {
    return null;
  }

  // HTTP-date form: seconds remaining until that moment. A date already in the
  // past yields 0 rather than a negative value.
  const at = Date.parse(trimmed);
  if (Number.isNaN(at)) return null;
  return Math.max(0, Math.round((at - Date.now()) / 1000));
}

/** Format a rate-limit message, using Retry-After only when it is known. */
function rateLimitMessage(retryAfterSeconds: number | null): string {
  if (retryAfterSeconds === null) {
    return CODE_MESSAGES.rate_limited;
  }
  if (retryAfterSeconds <= 1) {
    return 'Too many AI requests. Please try again in a moment.';
  }
  return `Too many AI requests. Please try again in about ${retryAfterSeconds} seconds.`;
}

/**
 * Map an error code (plus HTTP status) to a user-facing message.
 * Unknown codes fall back to a status-appropriate generic message.
 */
export function messageForAiCode(
  code: unknown,
  status: number,
  retryAfterSeconds: number | null = null
): string {
  // A rate-limited response is authoritative regardless of which code arrives.
  if (code === 'rate_limited' || status === 429) {
    return rateLimitMessage(retryAfterSeconds);
  }

  if (typeof code === 'string') {
    const mapped = CODE_MESSAGES[code];
    if (mapped) return mapped;
  }

  if (status === 400) return AI_BAD_REQUEST_MESSAGE;
  if (status === 401 || status === 403) return CODE_MESSAGES.auth_error;
  if (status === 404) return CODE_MESSAGES.model_not_found;
  if (status === 504) return CODE_MESSAGES.timeout;
  return AI_UNKNOWN_ERROR_MESSAGE;
}

/**
 * Reduce a failed AI response to a safe, renderable message.
 *
 * Falls back safely at every step: a body that is not JSON, a body that is
 * JSON but not an object, a missing/blank error string, or a server message
 * that is implausibly long all degrade to the generic mapped message.
 */
export async function describeAiFailure(res: AiErrorResponseLike): Promise<AiFailure> {
  const retryAfterSeconds = parseRetryAfterSeconds(res.headers);

  let body: any = null;
  try {
    body = await res.json();
  } catch {
    body = null;
  }

  const code = body && typeof body === 'object' ? body.code : undefined;

  // A 400 originates from our own request validators and never contains
  // upstream text, so its specific message is safe and more useful.
  if (res.status === 400 && body && typeof body.error === 'string') {
    const serverMessage = body.error.trim();
    if (serverMessage.length > 0 && serverMessage.length <= 200) {
      return { message: serverMessage, retryAfterSeconds };
    }
  }

  return { message: messageForAiCode(code, res.status, retryAfterSeconds), retryAfterSeconds };
}