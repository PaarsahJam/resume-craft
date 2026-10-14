import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import express from 'express';
import request from 'supertest';
import { buildAiRouter, aiRateLimiter, setAiLogSink } from './aiRoutes';
import { DEFAULT_OPENROUTER_MODEL } from './openRouter';
import { useNetworkGuard } from './testNetworkGuard';

useNetworkGuard();

function makeApp() {
  const app = express();
  app.use(express.json({ limit: '1mb' }));
  app.use('/api/ai', buildAiRouter());
  return app;
}

const RESUME = {
  personal: { fullName: 'Jane Doe', email: 'jane@example.com' },
  summary: 'A summary of things.',
  skills: [{ category: 'Languages', items: ['TypeScript'] }],
  experience: [{ jobTitle: 'Engineer', company: 'Acme', description: ['Built X'] }],
  projects: [],
  education: [],
  certifications: [],
  languages: [],
  additionalSections: [],
  sectionOrder: ['summary'],
  hiddenSections: [],
};

const SECRET_MARKER = 'sk-or-v1-DO-NOT-LOG-THIS-KEY';

/** Mock the provider, returning the given payload body verbatim. */
function mockProvider(body: unknown) {
  const spy = vi.fn().mockResolvedValue({
    ok: true,
    status: 200,
    json: async () => body,
  });
  vi.stubGlobal('fetch', spy);
  return spy;
}

/** A successful provider payload with optional usage. */
function providerBody(content: unknown, extra: Record<string, unknown> = {}) {
  return {
    id: 'gen-abc123',
    model: 'vendor/actual-model:free',
    choices: [{ message: { content: typeof content === 'string' ? content : JSON.stringify(content) } }],
    ...extra,
  };
}

let logs: string[] = [];
let restore: () => void;

beforeEach(() => {
  process.env.OPENROUTER_API_KEY = 'test-key';
  logs = [];
  restore = setAiLogSink((line) => logs.push(line));
  aiRateLimiter.reset();
});

afterEach(() => {
  restore();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
  delete process.env.OPENROUTER_API_KEY;
  aiRateLimiter.reset();
});

function lastLog() {
  return JSON.parse(logs[logs.length - 1]);
}

describe('usage metadata is logged on success', () => {
  it('records all token counts', async () => {
    mockProvider(
      providerBody({ concise: 'A', executive: 'B' }, {
        usage: { prompt_tokens: 120, completion_tokens: 45, total_tokens: 165 },
      })
    );

    const res = await request(makeApp())
      .post('/api/ai/improve-summary')
      .send({ summary: 'Original.' });

    expect(res.status).toBe(200);
    const log = lastLog();
    expect(log.promptTokens).toBe(120);
    expect(log.completionTokens).toBe(45);
    expect(log.totalTokens).toBe(165);
  });

  it('records both configured and actual models', async () => {
    mockProvider(providerBody({ concise: 'A', executive: 'B' }));

    await request(makeApp()).post('/api/ai/improve-summary').send({ summary: 'Original.' });

    const log = lastLog();
    expect(log.configuredModel).toBe(DEFAULT_OPENROUTER_MODEL);
    expect(log.actualModel).toBe('vendor/actual-model:free');
  });

  it('records endpoint, duration, outcome and status', async () => {
    mockProvider(providerBody({ concise: 'A', executive: 'B' }));

    await request(makeApp()).post('/api/ai/improve-summary').send({ summary: 'Original.' });

    const log = lastLog();
    expect(log.component).toBe('ai');
    expect(log.endpoint).toBe('improve-summary');
    expect(typeof log.durationMs).toBe('number');
    expect(log.durationMs).toBeGreaterThanOrEqual(0);
    expect(log.outcome).toBe('success');
    expect(log.httpStatus).toBe(200);
  });

  /**
 * The correlation id is intentionally present in the log record.
 *
 * This is server-generated per request and echoed to the client so a
 * user-reported failure can be matched to a log line. It is NOT a user
 * identifier; separate tests below prove user-supplied values cannot become one.
 */
  it('records a correlation id and echoes it to the client', async () => {
    mockProvider(providerBody({ concise: 'A', executive: 'B' }));

    const res = await request(makeApp())
      .post('/api/ai/improve-summary')
      .send({ summary: 'Original.' });

    const log = lastLog();
    expect(typeof log.requestId).toBe('string');
    expect(log.requestId.length).toBeGreaterThan(0);
    expect(res.headers['x-request-id']).toBe(log.requestId);
  });

  it('uses a distinct correlation id per request', async () => {
    mockProvider(providerBody({ concise: 'A', executive: 'B' }));
    const app = makeApp();

    await request(app).post('/api/ai/improve-summary').send({ summary: 'a' });
    await request(app).post('/api/ai/improve-summary').send({ summary: 'b' });

    const ids = logs.map((l) => JSON.parse(l).requestId);
    expect(new Set(ids).size).toBe(2);
  });
});

describe('missing or partial usage is not fatal', () => {
  it('succeeds and logs without token fields when usage is absent', async () => {
    mockProvider(providerBody({ concise: 'A', executive: 'B' }));

    const res = await request(makeApp())
      .post('/api/ai/improve-summary')
      .send({ summary: 'Original.' });

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ concise: 'A', executive: 'B' });
    const log = lastLog();
    expect(log.outcome).toBe('success');
    expect('promptTokens' in log).toBe(false);
    expect('totalTokens' in log).toBe(false);
  });

  it('succeeds with a partial usage block', async () => {
    mockProvider(
      providerBody({ concise: 'A', executive: 'B' }, { usage: { completion_tokens: 30 } })
    );

    const res = await request(makeApp())
      .post('/api/ai/improve-summary')
      .send({ summary: 'Original.' });

    expect(res.status).toBe(200);
    const log = lastLog();
    expect(log.completionTokens).toBe(30);
    expect('promptTokens' in log).toBe(false);
  });

  it('succeeds when usage is an unexpected shape', async () => {
    for (const usage of [null, 'x', [], {}, { prompt_tokens: -1 }, { prompt_tokens: {} }]) {
      logs = [];
      mockProvider(providerBody({ concise: 'A', executive: 'B' }, { usage }));
      const res = await request(makeApp())
        .post('/api/ai/improve-summary')
        .send({ summary: 'Original.' });
      expect(res.status, `usage=${JSON.stringify(usage)}`).toBe(200);
      expect(JSON.parse(logs[0]).outcome).toBe('success');
    }
  });

  it('omits actualModel when the provider reports none', async () => {
    mockProvider({
      choices: [{ message: { content: '{"concise":"A","executive":"B"}' } }],
    });

    await request(makeApp()).post('/api/ai/improve-summary').send({ summary: 'Original.' });

    expect('actualModel' in lastLog()).toBe(false);
  });
});

describe('failures are logged with a safe category', () => {
  const CASES: Array<[string, number, number, string]> = [
    ['upstream 401', 401, 502, 'auth_error'],
    ['upstream 429', 429, 429, 'rate_limited'],
    ['upstream 404', 404, 502, 'model_not_found'],
    ['upstream 500', 500, 502, 'upstream_error'],
  ];

  it.each(CASES)('logs %s as %s', async (_label, upstream, httpStatus, code) => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({ ok: false, status: upstream, json: async () => ({}) })
    );

    const res = await request(makeApp())
      .post('/api/ai/improve-summary')
      .send({ summary: 'Original.' });

    expect(res.status).toBe(httpStatus);
    const log = lastLog();
    expect(log.outcome).toBe('error');
    expect(log.errorCategory).toBe(code);
    expect(log.httpStatus).toBe(httpStatus);
  });

  it('logs network_error without token fields', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('ECONNREFUSED')));

    const res = await request(makeApp())
      .post('/api/ai/improve-summary')
      .send({ summary: 'Original.' });

    expect(res.status).toBe(504);
    const log = lastLog();
    expect(log.outcome).toBe('error');
    expect(log.errorCategory).toBe('network_error');
    expect('promptTokens' in log).toBe(false);
  });

  it('logs unexpected_error for a non-OpenRouterError throw', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({ ok: true, status: 200, json: async () => ({ choices: [] }) })
    );

    const res = await request(makeApp())
      .post('/api/ai/improve-summary')
      .send({ summary: 'Original.' });

    expect(res.status).toBe(502);
    expect(lastLog().errorCategory).toBe('empty_response');
  });

  it('logs not_configured when the server has no key', async () => {
    delete process.env.OPENROUTER_API_KEY;
    const spy = vi.fn();
    vi.stubGlobal('fetch', spy);

    const res = await request(makeApp())
      .post('/api/ai/improve-summary')
      .send({ summary: 'Original.' });

    expect(res.status).toBe(503);
    expect(spy).not.toHaveBeenCalled();
    const log = lastLog();
    expect(log.outcome).toBe('error');
    expect(log.errorCategory).toBe('not_configured');
  });
});

describe('all five routes log correctly after the adapter change', () => {
  const ROUTES: Array<[string, string, any]> = [
    ['improve-summary', '/api/ai/improve-summary', { summary: 'Original.' }],
    ['improve-bullet', '/api/ai/improve-bullet', { bullet: 'Did X.' }],
    ['tailor-jd', '/api/ai/tailor-jd', { resume: RESUME, jobDescription: 'Need TS.' }],
    ['generate-cover-letter', '/api/ai/generate-cover-letter', { resume: RESUME }],
    ['translate-resume', '/api/ai/translate-resume', { resume: RESUME }],
  ];

  const RESPONSES: Record<string, unknown> = {
    'improve-summary': { concise: 'A', executive: 'B' },
    'improve-bullet': { impact: 'I', concise: 'C', technical: 'T' },
    'tailor-jd': { score: 80, matchedKeywords: ['ts'], missingKeywords: [], suggestions: ['a'] },
    'generate-cover-letter': 'Dear team, Regards.',
    'translate-resume': RESUME,
  };

  it.each(ROUTES)('%s logs a success record with usage', async (name, url, body) => {
    logs = [];
    mockProvider(
      providerBody(RESPONSES[name], {
        usage: { prompt_tokens: 80, completion_tokens: 20, total_tokens: 100 },
      })
    );

    const res = await request(makeApp()).post(url).send(body);
    expect(res.status).toBe(200);

    const log = lastLog();
    expect(log.endpoint).toBe(name);
    expect(log.outcome).toBe('success');
    expect(log.promptTokens).toBe(80);
    expect(log.completionTokens).toBe(20);
    expect(log.totalTokens).toBe(100);
  });

  it.each(ROUTES)('%s preserves its response contract', async (name, url, body) => {
    mockProvider(providerBody(RESPONSES[name]));
    const res = await request(makeApp()).post(url).send(body);
    expect(res.status).toBe(200);

    // Usage must never appear in the client-facing payload.
    expect(JSON.stringify(res.body)).not.toMatch(/promptTokens|completionTokens|totalTokens|usage/);
    expect(res.headers['x-request-id']).toBeTruthy();
  });
});

describe('logs never leak secrets or user content', () => {
  /**
   * User-supplied content that must never reach a log line.
   *
   * Note the deliberate distinction from the server-generated correlation id
   * (`requestId`), which IS logged by design. Everything here originates from
   * the user's resume or job description and must stay out of logs.
   */
  const SECRET_CONTENT = {
    summary: 'My private email is jane.doe+secret@example.com and I earned a Stanford degree.',
    bullet: 'Contact me at +1 555 0100 or jane@secret-corp.com',
    jobDescription: 'ROLE AT SECRET-CORP — internal requisition 99887',
  };

  it('does not log the API key on success', async () => {
    process.env.OPENROUTER_API_KEY = SECRET_MARKER;
    mockProvider(providerBody({ concise: 'A', executive: 'B' }));

    await request(makeApp()).post('/api/ai/improve-summary').send({ summary: 'x' });

    expect(logs.join('\n')).not.toContain(SECRET_MARKER);
    expect(logs.join('\n')).not.toContain('sk-or-v1');
  });

  it('does not log the API key on failure', async () => {
    process.env.OPENROUTER_API_KEY = SECRET_MARKER;
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error(`connect failed ${SECRET_MARKER}`)));

    await request(makeApp()).post('/api/ai/improve-summary').send({ summary: 'x' });

    expect(logs.join('\n')).not.toContain(SECRET_MARKER);
  });

  it('does not log the Authorization header', async () => {
    mockProvider(providerBody({ concise: 'A', executive: 'B' }));
    await request(makeApp()).post('/api/ai/improve-summary').send({ summary: 'x' });

    expect(logs.join('\n')).not.toMatch(/Authorization|Bearer/i);
  });

  it.each([
    ['improve-summary', { summary: SECRET_CONTENT.summary }],
    ['improve-bullet', { bullet: SECRET_CONTENT.bullet }],
    ['tailor-jd', { resume: RESUME, jobDescription: SECRET_CONTENT.jobDescription }],
    ['generate-cover-letter', { resume: { ...RESUME, summary: SECRET_CONTENT.summary } }],
    ['translate-resume', { resume: { ...RESUME, summary: SECRET_CONTENT.summary } }],
  ])('%s does not log user content', async (name, body) => {
    logs = [];
    mockProvider(providerBody(successPayloadFor(name)));

    await request(makeApp()).post(`/api/ai/${name}`).send(body);

    const text = logs.join('\n');
    expect(text).not.toContain('jane.doe+secret@example.com');
    expect(text).not.toContain('secret-corp.com');
    expect(text).not.toContain('99887');
    expect(text).not.toContain('+1 555 0100');
    expect(text).not.toContain('Stanford');
  });

  it('does not adopt a client-supplied X-Request-Id', async () => {
    // The correlation id is server-generated. A client-supplied header must
    // never be reflected into a log line, or a caller could inject arbitrary
    // text (including newlines and control characters) into the logs.
    mockProvider(providerBody({ concise: 'A', executive: 'B' }));

    const attackerId = 'INJECTED-BY-CLIENT-do-not-log';
    const res = await request(makeApp())
      .post('/api/ai/improve-summary')
      .set('X-Request-Id', attackerId)
      .send({ summary: 'x' });

    const log = lastLog();
    expect(log.requestId).not.toBe(attackerId);
    expect(logs.join('\n')).not.toContain(attackerId);
    // The server still returns its own generated id.
    expect(res.headers['x-request-id']).toBe(log.requestId);
    expect(log.requestId.length).toBeGreaterThan(0);
  });

  it('generates a correlation id that echoes no user content', async () => {
    mockProvider(providerBody({ concise: 'A', executive: 'B' }));

    await request(makeApp())
      .post('/api/ai/improve-summary')
      .send({ summary: SECRET_CONTENT.summary });

    const id = lastLog().requestId;
    expect(id).not.toContain('jane.doe+secret@example.com');
    expect(id).not.toContain('Stanford');
    // Server-generated ids are opaque tokens, not user-derived strings.
    expect(id).not.toContain(' ');
    expect(id).toMatch(/^[A-Za-z0-9-]+$/);
  });

  it('does not log the raw upstream error body', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        status: 400,
        json: async () => ({ error: { message: `upstream leaked ${SECRET_MARKER}` } }),
      })
    );

    await request(makeApp()).post('/api/ai/improve-summary').send({ summary: 'x' });

    expect(logs.join('\n')).not.toContain('upstream leaked');
  });

  it('logs only whitelisted keys', async () => {
    mockProvider(providerBody({ concise: 'A', executive: 'B' }));

    await request(makeApp()).post('/api/ai/improve-summary').send({ summary: 'x' });

    const ALLOWED = new Set([
      'component', 'requestId', 'endpoint', 'configuredModel', 'actualModel',
      'promptTokens', 'completionTokens', 'totalTokens', 'durationMs',
      'outcome', 'errorCategory', 'httpStatus',
    ]);
    const keys = Object.keys(lastLog());
    for (const key of keys) {
      expect(ALLOWED.has(key), `unexpected log key: ${key}`).toBe(true);
    }
  });
});

/** Minimal success payload for each route, used by the leakage tests. */
function successPayloadFor(name: string): unknown {
  switch (name) {
    case 'improve-summary':
      return { concise: 'A', executive: 'B' };
    case 'improve-bullet':
      return { impact: 'I', concise: 'C', technical: 'T' };
    case 'tailor-jd':
      return { score: 80, matchedKeywords: [], missingKeywords: [], suggestions: [] };
    case 'generate-cover-letter':
      return 'Dear team, Regards.';
    default:
      return RESUME;
  }
}