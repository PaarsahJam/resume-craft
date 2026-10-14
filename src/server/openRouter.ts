/**
 * Server-only OpenRouter adapter.
 *
 * This module is NEVER imported by client code. It reads the API key from the
 * server environment and talks to the OpenRouter chat-completions REST API
 * (verified interface: https://openrouter.ai/docs/api-reference/overview).
 *
 * Design rules:
 * - The API key never leaves the server and is never placed in an error message.
 * - A configurable timeout guards every upstream call.
 * - Upstream/auth/rate-limit failures are normalised to a safe OpenRouterError.
 * - No resume content is logged.
 */

import { extractCompletionMeta, extractUsage, type ChatCompletionResult } from './usage';

export interface OpenRouterMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface ChatCompletionOptions {
  messages: OpenRouterMessage[];
  /** Model identifier, e.g. "nvidia/nemotron-3-ultra-550b-a55b:free". */
  model: string;
  /** Request JSON-object output (widely supported; validated server-side). */
  json?: boolean;
  maxTokens?: number;
  temperature?: number;
  /** Abort the upstream request after this many milliseconds. */
  timeoutMs?: number;
}

/**
 * Normalised error for upstream failures. `status` is a safe HTTP status to
 * return to the client; `code` is a stable machine-readable reason. The
 * `message` never contains the API key or resume content.
 */
export class OpenRouterError extends Error {
  constructor(
    message: string,
    public readonly status: number = 502,
    public readonly code: string = 'upstream_error'
  ) {
    super(message);
    this.name = 'OpenRouterError';
  }
}

/**
 * Default model, used only when OPENROUTER_MODEL is unset.
 *
 * Keep in sync with .env.example and the README; `openRouter.test.ts` asserts
 * all three agree so the documented default cannot silently drift from the
 * code. This value is verified working against the live OpenRouter API.
 */
export const DEFAULT_OPENROUTER_MODEL = 'nvidia/nemotron-3-ultra-550b-a55b:free';

/** Where the resolved model came from. Used for startup observability. */
export type OpenRouterModelSource = 'env' | 'default';

/**
 * Resolve the model and report its origin.
 *
 * OPENROUTER_MODEL always wins when it holds a usable id. The value is
 * trimmed, and an empty or whitespace-only value falls back to the documented
 * default rather than being sent upstream as an invalid model id. Callers that
 * need to make the fallback visible (e.g. server startup) use `source` so a
 * misconfigured deployment is logged rather than silently substituting a
 * different model than the operator expected.
 */
export function getOpenRouterModelDetails(): {
  model: string;
  source: OpenRouterModelSource;
} {
  const configured =
    typeof process.env.OPENROUTER_MODEL === 'string'
      ? process.env.OPENROUTER_MODEL.trim()
      : '';
  if (configured.length > 0) {
    return { model: configured, source: 'env' };
  }
  return { model: DEFAULT_OPENROUTER_MODEL, source: 'default' };
}

/** Resolve the configured model, falling back to the documented default. */
export function getOpenRouterModel(): string {
  return getOpenRouterModelDetails().model;
}

/** Resolve the API key, or null when the server is not configured. */
export function getOpenRouterKey(): string | null {
  const key = process.env.OPENROUTER_API_KEY;
  return key && key.trim().length > 0 ? key.trim() : null;
}

const OPENROUTER_ENDPOINT = 'https://openrouter.ai/api/v1/chat/completions';
const DEFAULT_TIMEOUT_MS = 30_000;

/**
 * Call the OpenRouter chat-completions endpoint.
 *
 * Returns the assistant message content plus optional provider-reported
 * metadata (token usage, actual model, completion id). Usage is best-effort:
 * a provider that reports none yields `usage: undefined` and the call still
 * succeeds. Throws OpenRouterError for any failure.
 */
export async function createChatCompletion(
  options: ChatCompletionOptions
): Promise<ChatCompletionResult> {
  const apiKey = getOpenRouterKey();
  if (!apiKey) {
    throw new OpenRouterError(
      'AI service is not configured on this server.',
      503,
      'not_configured'
    );
  }

  const timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;

  const body: Record<string, unknown> = {
    model: options.model,
    messages: options.messages,
  };
  if (options.json) {
    body.response_format = { type: 'json_object' };
  }
  if (options.maxTokens !== undefined) body.max_tokens = options.maxTokens;
  if (options.temperature !== undefined) body.temperature = options.temperature;

  const headers: Record<string, string> = {
    Authorization: `Bearer ${apiKey}`,
    'Content-Type': 'application/json',
  };
  // Optional provider metadata (app attribution). Never include resume data.
  const appUrl = process.env.APP_URL;
  const appName = process.env.APP_NAME;
  if (appUrl) headers['HTTP-Referer'] = appUrl;
  if (appName) headers['X-Title'] = appName;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  let response: Response;
  try {
    response = await fetch(OPENROUTER_ENDPOINT, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
      signal: controller.signal,
    });
  } catch (err: any) {
    // Network failure, DNS error, or timeout. Never surface upstream details.
    const timedOut = controller.signal.aborted;
    throw new OpenRouterError(
      timedOut
        ? 'The AI service took too long to respond. Please try again.'
        : 'The AI service is unreachable. Please try again later.',
      504,
      timedOut ? 'timeout' : 'network_error'
    );
  } finally {
    clearTimeout(timer);
  }

  if (!response.ok) {
    // Attempt to extract a safe reason without leaking the key or content.
    let code = 'upstream_error';
    let message = 'The AI service returned an error. Please try again later.';
    let status = 502;

    if (response.status === 401 || response.status === 403) {
      code = 'auth_error';
      message = 'AI service authentication failed. Check the server configuration.';
      status = 502;
    } else if (response.status === 429) {
      code = 'rate_limited';
      message = 'The AI service is rate-limited. Please try again shortly.';
      status = 429;
    } else if (response.status === 404) {
      code = 'model_not_found';
      message = 'The configured AI model is unavailable.';
      status = 502;
    } else if (response.status >= 400 && response.status < 500) {
      code = 'bad_request';
      message = 'The AI service rejected the request.';
      status = 502;
    }

    throw new OpenRouterError(message, status, code);
  }

  let data: any;
  try {
    data = await response.json();
  } catch {
    throw new OpenRouterError(
      'The AI service returned an unreadable response.',
      502,
      'malformed_response'
    );
  }

  // OpenRouter can return a 200 with an error payload.
  if (data?.error) {
    const errStatus = typeof data.error.code === 'number' ? data.error.code : undefined;
    if (errStatus === 401 || errStatus === 403) {
      throw new OpenRouterError(
        'AI service authentication failed. Check the server configuration.',
        502,
        'auth_error'
      );
    }
    throw new OpenRouterError(
      'The AI service returned an error. Please try again later.',
      502,
      'upstream_error'
    );
  }

  const content = data?.choices?.[0]?.message?.content;
  if (typeof content !== 'string' || content.length === 0) {
    throw new OpenRouterError(
      'The AI service returned no usable content.',
      502,
      'empty_response'
    );
  }

  // Usage/model metadata is optional and never fatal: a provider that omits it
  // (or returns an odd shape) still yields a successful result with the
  // metadata fields simply absent.
  const result: ChatCompletionResult = { content };
  const usage = extractUsage(data);
  if (usage) result.usage = usage;
  const meta = extractCompletionMeta(data);
  if (meta) result.meta = meta;
  return result;
}
