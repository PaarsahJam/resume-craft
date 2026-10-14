/**
 * Extraction of provider-reported usage metadata from an OpenRouter response.
 *
 * Design rules:
 * - Usage is OPTIONAL. A provider that omits it, reports only some fields, or
 *   returns an unexpected shape must never turn a successful completion into a
 *   failure. Extraction returns `undefined` rather than throwing.
 * - Only finite, non-negative integers are accepted. Anything else is dropped.
 * - Nothing here touches prompts, completions, keys, or headers.
 *
 * OpenRouter reports token counts under `usage` (OpenAI-compatible names) and
 * the model that actually served the request as `model`. Both are read
 * defensively because provider shapes vary between models and fallbacks.
 */

/** Token counts as reported by the provider. All fields are optional. */
export interface ProviderUsage {
  promptTokens?: number;
  completionTokens?: number;
  totalTokens?: number;
}

/** Metadata about the completion itself, when the provider supplies it. */
export interface CompletionMeta {
  /** The model the provider says actually served the request. */
  model?: string;
  /** Completion id, safe to correlate with provider-side logs. */
  id?: string;
}

export interface ChatCompletionResult {
  /** The assistant message text. Always present; callers rely on this. */
  content: string;
  /** Provider-reported usage. Absent when the provider reports none. */
  usage?: ProviderUsage;
  /** Provider-reported model/id. Absent when not supplied. */
  meta?: CompletionMeta;
}

/** Coerce a value to a usable token count, or undefined. */
function toTokenCount(value: unknown): number | undefined {
  if (typeof value === 'number') {
    return Number.isFinite(value) && value >= 0 ? Math.trunc(value) : undefined;
  }
  // Some providers serialise counts as numeric strings.
  if (typeof value === 'string' && value.trim() !== '') {
    const parsed = Number(value);
    return Number.isFinite(parsed) && parsed >= 0 ? Math.trunc(parsed) : undefined;
  }
  return undefined;
}

/**
 * Read token usage from a provider payload.
 *
 * Returns undefined when nothing usable is present, so callers can write
 * `usage: extractUsage(data)` without special-casing. Accepts the OpenAI-style
 * names OpenRouter uses, plus the `input_tokens`/`output_tokens` aliases some
 * models return.
 */
export function extractUsage(payload: any): ProviderUsage | undefined {
  const raw = payload?.usage;
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return undefined;

  const promptTokens =
    toTokenCount(raw.prompt_tokens) ?? toTokenCount(raw.input_tokens);
  const completionTokens =
    toTokenCount(raw.completion_tokens) ?? toTokenCount(raw.output_tokens);
  let totalTokens = toTokenCount(raw.total_tokens);

  // Derive a total when the provider omitted it but gave both halves.
  if (totalTokens === undefined && promptTokens !== undefined && completionTokens !== undefined) {
    totalTokens = promptTokens + completionTokens;
  }

  const usage: ProviderUsage = {};
  if (promptTokens !== undefined) usage.promptTokens = promptTokens;
  if (completionTokens !== undefined) usage.completionTokens = completionTokens;
  if (totalTokens !== undefined) usage.totalTokens = totalTokens;

  // Never report an empty object: absent usage is more honest than {}.
  return Object.keys(usage).length > 0 ? usage : undefined;
}

/**
 * Read provider-reported model/id metadata.
 *
 * Only values that are non-empty strings are kept. A provider that does not
 * report them yields undefined rather than a guess.
 */
export function extractCompletionMeta(payload: any): CompletionMeta | undefined {
  const meta: CompletionMeta = {};
  if (typeof payload?.model === 'string' && payload.model.trim().length > 0) {
    meta.model = payload.model.trim();
  }
  if (typeof payload?.id === 'string' && payload.id.trim().length > 0) {
    meta.id = payload.id.trim();
  }
  return Object.keys(meta).length > 0 ? meta : undefined;
}