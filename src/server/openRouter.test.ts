import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import {
  createChatCompletion,
  getOpenRouterModel,
  getOpenRouterModelDetails,
  getOpenRouterKey,
  OpenRouterError,
  DEFAULT_OPENROUTER_MODEL,
} from './openRouter';
import { useNetworkGuard } from './testNetworkGuard';

useNetworkGuard();

/**
 * The upstream AI service is mocked, so these tests never require a real key
 * or spend credits. They pin down the adapter's error normalisation, the
 * guarantee that the API key never leaks into an error message, and (Phase
 * 2.8) the structured return shape with optional usage metadata.
 */

describe('createChatCompletion — structured result', () => {
  function mockBody(body: unknown) {
    const spy = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => body,
    });
    vi.stubGlobal('fetch', spy);
  }

  it('returns content plus usage when the provider reports it', async () => {
    mockBody({
      id: 'gen-1',
      model: 'vendor/served:free',
      choices: [{ message: { content: 'hello' } }],
      usage: { prompt_tokens: 30, completion_tokens: 10, total_tokens: 40 },
    });

    const out = await createChatCompletion(BASE_OPTIONS);
    expect(out.content).toBe('hello');
    expect(out.usage).toEqual({ promptTokens: 30, completionTokens: 10, totalTokens: 40 });
    expect(out.meta).toEqual({ model: 'vendor/served:free', id: 'gen-1' });
  });

  it('succeeds without a usage field', async () => {
    mockBody({ choices: [{ message: { content: 'hello' } }] });

    const out = await createChatCompletion(BASE_OPTIONS);
    expect(out.content).toBe('hello');
    expect(out.usage).toBeUndefined();
    expect(out.meta).toBeUndefined();
  });

  it('succeeds with an unexpected usage shape', async () => {
    for (const usage of [null, 'x', [], {}, { prompt_tokens: -3 }, { prompt_tokens: {} }]) {
      mockBody({
        choices: [{ message: { content: 'hello' } }],
        usage,
      });
      const out = await createChatCompletion(BASE_OPTIONS);
      expect(out.content).toBe('hello');
    }
  });

  it('never puts the key or headers into the result', async () => {
    mockBody({
      choices: [{ message: { content: 'hello' } }],
      usage: { prompt_tokens: 1, completion_tokens: 1 },
    });

    const out = await createChatCompletion(BASE_OPTIONS);
    expect(JSON.stringify(out)).not.toContain('test-secret-key');
    expect(JSON.stringify(out)).not.toMatch(/Bearer|Authorization/i);
  });

  it('throws on error responses without returning metadata', async () => {
    mockFetchOnce({ ok: false, status: 401, json: async () => ({}) } as any);
    await expect(createChatCompletion(BASE_OPTIONS)).rejects.toMatchObject({
      code: 'auth_error',
    });
  });
});

const BASE_OPTIONS = {
  model: 'test/model',
  messages: [{ role: 'user' as const, content: 'hi' }],
};

function mockFetchOnce(response: Partial<Response> & { json?: () => Promise<any> }) {
  const spy = vi.fn().mockResolvedValue(response);
  vi.stubGlobal('fetch', spy);
  return spy;
}

beforeEach(() => {
  process.env.OPENROUTER_API_KEY = 'test-secret-key';
  delete process.env.OPENROUTER_MODEL;
  delete process.env.APP_URL;
  delete process.env.APP_NAME;
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
  delete process.env.OPENROUTER_API_KEY;
});

describe('configuration helpers', () => {
  it('falls back to the documented default when OPENROUTER_MODEL is unset', () => {
    expect(getOpenRouterModel()).toBe(DEFAULT_OPENROUTER_MODEL);
    expect(getOpenRouterModelDetails()).toEqual({
      model: DEFAULT_OPENROUTER_MODEL,
      source: 'default',
    });
  });

  it('honours OPENROUTER_MODEL override', () => {
    process.env.OPENROUTER_MODEL = 'vendor/other';
    expect(getOpenRouterModel()).toBe('vendor/other');
    expect(getOpenRouterModelDetails()).toEqual({
      model: 'vendor/other',
      source: 'env',
    });
  });

  it('falls back to the default when OPENROUTER_MODEL is empty', () => {
    process.env.OPENROUTER_MODEL = '';
    expect(getOpenRouterModel()).toBe(DEFAULT_OPENROUTER_MODEL);
    expect(getOpenRouterModelDetails().source).toBe('default');
  });

  it('falls back to the default when OPENROUTER_MODEL is whitespace-only', () => {
    process.env.OPENROUTER_MODEL = '   \t  ';
    expect(getOpenRouterModel()).toBe(DEFAULT_OPENROUTER_MODEL);
    expect(getOpenRouterModelDetails().source).toBe('default');
  });

  it('never resolves to a blank or whitespace model id', () => {
    for (const blank of ['', ' ', '\t\n', '   ']) {
      process.env.OPENROUTER_MODEL = blank;
      const { model } = getOpenRouterModelDetails();
      expect(model).toBe(DEFAULT_OPENROUTER_MODEL);
      expect(model.trim().length).toBeGreaterThan(0);
    }
  });

  it('trims surrounding whitespace from a configured model', () => {
    process.env.OPENROUTER_MODEL = '  vendor/trimmed  ';
    expect(getOpenRouterModel()).toBe('vendor/trimmed');
    expect(getOpenRouterModelDetails().source).toBe('env');
  });

  it('preserves the internal form of a valid model id', () => {
    process.env.OPENROUTER_MODEL = 'nvidia/nemotron-3-ultra-550b-a55b:free';
    expect(getOpenRouterModel()).toBe('nvidia/nemotron-3-ultra-550b-a55b:free');
  });

  it('returns null key when unconfigured and a string when set', () => {
    delete process.env.OPENROUTER_API_KEY;
    expect(getOpenRouterKey()).toBeNull();
    process.env.OPENROUTER_API_KEY = 'abc';
    expect(getOpenRouterKey()).toBe('abc');
  });
});

/**
 * The default model is a documented public contract: it is asserted against a
 * literal here (not against the constant itself) so that changing the constant
 * is a deliberate, reviewed act, and so `.env.example` and the README cannot
 * silently drift away from the code.
 */
describe('documented default model', () => {
  const EXPECTED_DEFAULT = 'nvidia/nemotron-3-ultra-550b-a55b:free';

  it('matches the agreed literal', () => {
    expect(DEFAULT_OPENROUTER_MODEL).toBe(EXPECTED_DEFAULT);
  });

  it('is the documented default in .env.example', () => {
    const envExample = readFileSync(join(process.cwd(), '.env.example'), 'utf8');
    expect(envExample).toContain(EXPECTED_DEFAULT);
  });

  it('is the documented default in the README', () => {
    const readme = readFileSync(join(process.cwd(), 'README.md'), 'utf8');
    expect(readme).toContain(EXPECTED_DEFAULT);
  });

  it('does not leave a stale model id in committed configuration or docs', () => {
    const stale = 'thinkingmachines/inkling:free';
    for (const file of ['.env.example', 'README.md']) {
      expect(readFileSync(join(process.cwd(), file), 'utf8')).not.toContain(stale);
    }
  });
});

describe('createChatCompletion — happy path', () => {
  it('sends Authorization, JSON, and returns message content', async () => {
    const spy = mockFetchOnce({
      ok: true,
      status: 200,
      json: async () => ({
        choices: [{ message: { content: '{"concise":"c","executive":"e"}' } }],
      }),
    } as any);

    const out = await createChatCompletion({ ...BASE_OPTIONS, json: true });
    expect(out.content).toContain('concise');

    const [url, init] = spy.mock.calls[0] as any[];
    expect(url).toBe('https://openrouter.ai/api/v1/chat/completions');
    expect(init.headers.Authorization).toBe('Bearer test-secret-key');
    expect(init.headers['Content-Type']).toBe('application/json');
    expect(JSON.parse(init.body).response_format).toEqual({ type: 'json_object' });
  });

  it('adds provider attribution headers only when configured', async () => {
    process.env.APP_URL = 'https://example.com';
    process.env.APP_NAME = 'ResumeCraft';
    const spy = mockFetchOnce({
      ok: true,
      status: 200,
      json: async () => ({ choices: [{ message: { content: 'ok' } }] }),
    } as any);
    await createChatCompletion(BASE_OPTIONS);
    const [, init] = spy.mock.calls[0] as any[];
    expect(init.headers['HTTP-Referer']).toBe('https://example.com');
    expect(init.headers['X-Title']).toBe('ResumeCraft');
  });
});

/**
 * Closes the loop between configuration and the wire: the model resolved from
 * the environment (or the fallback) must be the model actually requested.
 */
describe('createChatCompletion — resolved model is sent upstream', () => {
  function sentBody(spy: any) {
    const [, init] = spy.mock.calls[0] as any[];
    return JSON.parse(init.body);
  }

  it('sends the default model when OPENROUTER_MODEL is unset', async () => {
    const spy = mockFetchOnce({
      ok: true,
      status: 200,
      json: async () => ({ choices: [{ message: { content: 'ok' } }] }),
    } as any);
    await createChatCompletion({ ...BASE_OPTIONS, model: getOpenRouterModel() });
    expect(sentBody(spy).model).toBe(DEFAULT_OPENROUTER_MODEL);
  });

  it('sends the environment override when one is configured', async () => {
    process.env.OPENROUTER_MODEL = 'vendor/override-model';
    const spy = mockFetchOnce({
      ok: true,
      status: 200,
      json: async () => ({ choices: [{ message: { content: 'ok' } }] }),
    } as any);
    await createChatCompletion({ ...BASE_OPTIONS, model: getOpenRouterModel() });
    expect(sentBody(spy).model).toBe('vendor/override-model');
  });

  it('never sends a blank or whitespace model id', async () => {
    process.env.OPENROUTER_MODEL = '   ';
    const spy = mockFetchOnce({
      ok: true,
      status: 200,
      json: async () => ({ choices: [{ message: { content: 'ok' } }] }),
    } as any);
    await createChatCompletion({ ...BASE_OPTIONS, model: getOpenRouterModel() });
    const sent = sentBody(spy).model;
    expect(typeof sent).toBe('string');
    expect(sent.trim().length).toBeGreaterThan(0);
    expect(sent).toBe(DEFAULT_OPENROUTER_MODEL);
  });

  it('preserves an explicit model argument on the adapter', async () => {
    const spy = mockFetchOnce({
      ok: true,
      status: 200,
      json: async () => ({ choices: [{ message: { content: 'ok' } }] }),
    } as any);
    await createChatCompletion({ ...BASE_OPTIONS, model: 'vendor/explicit' });
    expect(sentBody(spy).model).toBe('vendor/explicit');
  });
});

describe('createChatCompletion — error normalisation', () => {
  it('throws a safe not_configured error when no key is set', async () => {
    delete process.env.OPENROUTER_API_KEY;
    await expect(createChatCompletion(BASE_OPTIONS)).rejects.toMatchObject({
      status: 503,
      code: 'not_configured',
    });
  });

  it('maps 401/403 to auth_error without leaking the key', async () => {
    mockFetchOnce({ ok: false, status: 401, json: async () => ({}) } as any);
    try {
      await createChatCompletion(BASE_OPTIONS);
      throw new Error('expected rejection');
    } catch (e: any) {
      expect(e).toBeInstanceOf(OpenRouterError);
      expect(e.code).toBe('auth_error');
      expect(e.message).not.toContain('test-secret-key');
    }
  });

  it('maps 429 to rate_limited with a 429 status', async () => {
    mockFetchOnce({ ok: false, status: 429, json: async () => ({}) } as any);
    await expect(createChatCompletion(BASE_OPTIONS)).rejects.toMatchObject({
      status: 429,
      code: 'rate_limited',
    });
  });

  it('maps 404 to model_not_found', async () => {
    mockFetchOnce({ ok: false, status: 404, json: async () => ({}) } as any);
    await expect(createChatCompletion(BASE_OPTIONS)).rejects.toMatchObject({
      code: 'model_not_found',
    });
  });

  it('maps a thrown network error to network_error', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('ECONNREFUSED')));
    await expect(createChatCompletion(BASE_OPTIONS)).rejects.toMatchObject({
      status: 504,
      code: 'network_error',
    });
  });

  it('maps an aborted (timeout) signal to timeout', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockImplementation((_url: any, init: any) => {
        // Simulate the abort controller firing.
        return new Promise((_resolve, reject) => {
          init.signal.addEventListener('abort', () => reject(new Error('aborted')));
        });
      })
    );
    await expect(createChatCompletion({ ...BASE_OPTIONS, timeoutMs: 5 })).rejects.toMatchObject({
      status: 504,
      code: 'timeout',
    });
  });

  it('handles a 200 response carrying an error payload', async () => {
    mockFetchOnce({
      ok: true,
      status: 200,
      json: async () => ({ error: { code: 401, message: 'invalid key' } }),
    } as any);
    await expect(createChatCompletion(BASE_OPTIONS)).rejects.toMatchObject({ code: 'auth_error' });
  });

  it('handles unparseable JSON as malformed_response', async () => {
    mockFetchOnce({ ok: true, status: 200, json: async () => { throw new Error('bad json'); } } as any);
    await expect(createChatCompletion(BASE_OPTIONS)).rejects.toMatchObject({
      code: 'malformed_response',
    });
  });

  it('handles empty content as empty_response', async () => {
    mockFetchOnce({ ok: true, status: 200, json: async () => ({ choices: [{ message: { content: '' } }] }) } as any);
    await expect(createChatCompletion(BASE_OPTIONS)).rejects.toMatchObject({
      code: 'empty_response',
    });
  });
});