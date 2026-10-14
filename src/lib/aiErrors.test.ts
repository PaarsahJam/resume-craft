import { describe, it, expect } from 'vitest';
import {
  describeAiFailure,
  messageForAiCode,
  parseRetryAfterSeconds,
  AI_NETWORK_ERROR_MESSAGE,
  AI_UNKNOWN_ERROR_MESSAGE,
  AI_BAD_REQUEST_MESSAGE,
  type AiErrorResponseLike,
} from './aiErrors';

/**
 * Build a minimal failed-response literal. The real `fetch` Response is not
 * required: describeAiFailure only touches status, headers.get and json().
 */
function failureResponse(
  status: number,
  body: unknown,
  headers: Record<string, string> = {}
): AiErrorResponseLike {
  return {
    status,
    headers: { get: (name: string) => headers[name] ?? null },
    json: async () => {
      if (body === undefined) throw new SyntaxError('Unexpected end of JSON input');
      return body;
    },
  };
}

/** Every server-emitted code must resolve to a distinct, non-empty message. */
describe('messageForAiCode — known server codes', () => {
  const CASES: Array<[string, number, RegExp]> = [
    ['not_configured', 503, /not configured/i],
    ['auth_error', 502, /credentials/i],
    ['rate_limited', 429, /too many/i],
    ['model_not_found', 502, /model is unavailable/i],
    ['timeout', 504, /too long/i],
    ['network_error', 504, /unreachable/i],
    ['malformed_response', 502, /unreadable/i],
    ['empty_response', 502, /no usable content/i],
    ['bad_request', 400, /invalid/i],
    ['upstream_error', 502, /returned an error/i],
  ];

  it.each(CASES)('maps %s to a helpful message', (code, status, expected) => {
    expect(messageForAiCode(code, status)).toMatch(expected);
  });

  it('never returns an empty message', () => {
    for (const [code, status] of CASES) {
      expect(messageForAiCode(code, status).trim().length).toBeGreaterThan(0);
    }
  });

  it('never leaks a secret-looking value in a message', () => {
    for (const [code, status] of CASES) {
      expect(messageForAiCode(code, status)).not.toMatch(/sk-or-v1-|Bearer|Authorization/i);
    }
  });
});

describe('messageForAiCode — status fallbacks', () => {
  it('falls back for an unknown code', () => {
    expect(messageForAiCode('something_new', 502)).toBe(AI_UNKNOWN_ERROR_MESSAGE);
  });

  it('falls back for a non-string code', () => {
    expect(messageForAiCode(null, 500)).toBe(AI_UNKNOWN_ERROR_MESSAGE);
    expect(messageForAiCode(42, 500)).toBe(AI_UNKNOWN_ERROR_MESSAGE);
    expect(messageForAiCode(undefined, 500)).toBe(AI_UNKNOWN_ERROR_MESSAGE);
  });

  it('maps bare statuses without a code', () => {
    expect(messageForAiCode(undefined, 400)).toBe(AI_BAD_REQUEST_MESSAGE);
    expect(messageForAiCode(undefined, 401)).toMatch(/credentials/i);
    expect(messageForAiCode(undefined, 403)).toMatch(/credentials/i);
    expect(messageForAiCode(undefined, 404)).toMatch(/model is unavailable/i);
    expect(messageForAiCode(undefined, 504)).toMatch(/too long/i);
    expect(messageForAiCode(undefined, 500)).toBe(AI_UNKNOWN_ERROR_MESSAGE);
  });

  it('treats status 429 as rate limited even without a code', () => {
    expect(messageForAiCode(undefined, 429)).toMatch(/too many/i);
  });
});

describe('parseRetryAfterSeconds', () => {
  const withHeader = (value: string | null) => ({
    get: (name: string) => (name.toLowerCase() === 'retry-after' ? value : null),
  });

  it('parses delta-seconds', () => {
    expect(parseRetryAfterSeconds(withHeader('42'))).toBe(42);
    expect(parseRetryAfterSeconds(withHeader(' 7 '))).toBe(7);
    expect(parseRetryAfterSeconds(withHeader('0'))).toBe(0);
  });

  it('returns null when absent', () => {
    expect(parseRetryAfterSeconds(withHeader(null))).toBeNull();
  });

  it('returns null for blank or unparseable values', () => {
    expect(parseRetryAfterSeconds(withHeader(''))).toBeNull();
    expect(parseRetryAfterSeconds(withHeader('   '))).toBeNull();
    expect(parseRetryAfterSeconds(withHeader('soon'))).toBeNull();
    expect(parseRetryAfterSeconds(withHeader('-5'))).toBeNull();
    expect(parseRetryAfterSeconds(withHeader('3.5'))).toBeNull();
  });

  it('parses an HTTP-date into non-negative seconds', () => {
    const future = new Date(Date.now() + 30_000).toUTCString();
    const seconds = parseRetryAfterSeconds(withHeader(future));
    expect(seconds).not.toBeNull();
    expect(seconds as number).toBeGreaterThan(0);

    const past = new Date(Date.now() - 60_000).toUTCString();
    expect(parseRetryAfterSeconds(withHeader(past))).toBe(0);
  });

  it('tolerates a response object without usable headers', () => {
    expect(parseRetryAfterSeconds({ get: () => undefined } as any)).toBeNull();
  });
});

describe('rate-limit messaging honours Retry-After', () => {
  it('uses the supplied delay', () => {
    const failure = failureResponse(429, { error: 'x', code: 'rate_limited' }, { 'Retry-After': '30' });
    return expect(describeAiFailure(failure)).resolves.toEqual({
      message: 'Too many AI requests. Please try again in about 30 seconds.',
      retryAfterSeconds: 30,
    });
  });

  it('does not promise a time when Retry-After is absent', async () => {
    const failure = failureResponse(429, { error: 'x', code: 'rate_limited' });
    const result = await describeAiFailure(failure);
    expect(result.retryAfterSeconds).toBeNull();
    expect(result.message).not.toMatch(/seconds\./);
    expect(result.message).toMatch(/wait a moment/i);
  });

  it('does not promise a time when Retry-After is unparseable', async () => {
    const failure = failureResponse(429, { error: 'x', code: 'rate_limited' }, { 'Retry-After': 'later' });
    const result = await describeAiFailure(failure);
    expect(result.retryAfterSeconds).toBeNull();
    expect(result.message).not.toMatch(/\d+ seconds/);
  });

  it('avoids promising "0 seconds" for an immediate retry', async () => {
    const failure = failureResponse(429, { error: 'x', code: 'rate_limited' }, { 'Retry-After': '0' });
    const result = await describeAiFailure(failure);
    expect(result.message).toBe('Too many AI requests. Please try again in a moment.');
  });
});

describe('describeAiFailure — end-to-end mapping', () => {
  it('surfaces the configuration error', async () => {
    const failure = await describeAiFailure(
      failureResponse(503, { error: 'AI service is not configured on this server.', code: 'not_configured' })
    );
    expect(failure.message).toMatch(/not configured/i);
  });

  it('surfaces an auth failure without exposing the key', async () => {
    const failure = await describeAiFailure(
      failureResponse(502, { error: 'x', code: 'auth_error' })
    );
    expect(failure.message).toMatch(/credentials/i);
    expect(failure.message).not.toMatch(/sk-or-v1-/);
  });

  it('surfaces a timeout', async () => {
    const failure = await describeAiFailure(failureResponse(504, { error: 'x', code: 'timeout' }));
    expect(failure.message).toMatch(/too long/i);
  });

  it('surfaces a generic upstream error', async () => {
    const failure = await describeAiFailure(failureResponse(502, { error: 'x', code: 'upstream_error' }));
    expect(failure.message).toMatch(/returned an error/i);
  });

  it('shows the server validation message for a 400', async () => {
    const failure = await describeAiFailure(
      failureResponse(400, { error: 'summary must not be empty.' })
    );
    expect(failure.message).toBe('summary must not be empty.');
  });

  it('degrades to a generic 400 message when the body is unhelpful', async () => {
    for (const body of [{ error: '' }, { error: '   ' }, {}, null]) {
      const failure = await describeAiFailure(failureResponse(400, body));
      expect(failure.message).toBe(AI_BAD_REQUEST_MESSAGE);
    }
  });

  it('rejects an implausibly long server message', async () => {
    const failure = await describeAiFailure(failureResponse(400, { error: 'x'.repeat(500) }));
    expect(failure.message).toBe(AI_BAD_REQUEST_MESSAGE);
  });

  it('degrades safely when the body is not JSON', async () => {
    const failure = await describeAiFailure(failureResponse(500, undefined));
    expect(failure.message).toBe(AI_UNKNOWN_ERROR_MESSAGE);
  });

  it('degrades safely when the body is a JSON scalar', async () => {
    const failure = await describeAiFailure(failureResponse(502, 'nope'));
    expect(failure.message).toBe(AI_UNKNOWN_ERROR_MESSAGE);
  });

  it('never surfaces raw upstream text on a non-400 status', async () => {
    const failure = await describeAiFailure(
      failureResponse(502, { error: 'upstream said: invalid key sk-or-v1-abc123' })
    );
    expect(failure.message).not.toContain('sk-or-v1-abc123');
    expect(failure.message).toBe(AI_UNKNOWN_ERROR_MESSAGE);
  });

  it('exposes a distinct network message for a request that never landed', () => {
    expect(AI_NETWORK_ERROR_MESSAGE).toMatch(/could not reach/i);
    expect(AI_NETWORK_ERROR_MESSAGE).not.toMatch(/sk-or-v1-/);
  });
});