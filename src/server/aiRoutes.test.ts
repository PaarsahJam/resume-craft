import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import express from 'express';
import request from 'supertest';
import { buildAiRouter, aiRateLimiter } from './aiRoutes';
import { useNetworkGuard } from './testNetworkGuard';

/**
 * Network guard: a forgotten stub must fail loudly rather than reach the
 * provider. Individual tests override it with their own mock.
 */
useNetworkGuard();

/**
 * End-to-end tests for the five AI routes. The upstream OpenRouter service is
 * mocked (no real key, no credits). These pin down:
 *  - request validation -> 400
 *  - response contracts preserved for the frontend
 *  - malformed model output -> 502
 *  - safe upstream error handling (401/429/timeout/network)
 *  - rate limiting -> 429
 */

function makeApp() {
  const app = express();
  app.use(express.json({ limit: '1mb' }));
  app.use('/api/ai', buildAiRouter());
  return app;
}

const validResume = {
  personal: { fullName: 'Jane Doe', headline: 'Engineer' },
  summary: 'A summary of things.',
  skills: [{ category: 'Languages', items: ['TypeScript', 'Go'] }],
  experience: [{ jobTitle: 'Engineer', description: ['Built X'] }],
};

/** Mock a successful OpenRouter JSON response. */
function mockJsonContent(content: unknown) {
  const body = typeof content === 'string' ? content : JSON.stringify(content);
  vi.stubGlobal(
    'fetch',
    vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ choices: [{ message: { content: body } }] }),
    })
  );
}

beforeEach(() => {
  process.env.OPENROUTER_API_KEY = 'test-key';
  // The limiter is module-scoped and keyed by client IP, so buckets persist
  // across tests in this file. Clear them to keep each test independent.
  aiRateLimiter.reset();
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
  delete process.env.OPENROUTER_API_KEY;
  aiRateLimiter.reset();
});

describe('improve-summary contract', () => {
  it('returns { concise, executive } on success', async () => {
    mockJsonContent({ concise: 'A', executive: 'B' });
    const res = await request(makeApp()).post('/api/ai/improve-summary').send({ summary: 'Original.' });
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ concise: 'A', executive: 'B' });
  });

  it('tolerates a fenced JSON block from the model', async () => {
    mockJsonContent('```json\n{"concise":"A","executive":"B"}\n```');
    const res = await request(makeApp()).post('/api/ai/improve-summary').send({ summary: 'Original.' });
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ concise: 'A', executive: 'B' });
  });

  it('rejects an invalid body with 400', async () => {
    const res = await request(makeApp()).post('/api/ai/improve-summary').send({});
    expect(res.status).toBe(400);
    expect(res.body.error).toBeDefined();
  });

  it('returns 502 when the model omits required fields', async () => {
    mockJsonContent({ concise: 'only-one' });
    const res = await request(makeApp()).post('/api/ai/improve-summary').send({ summary: 'Original.' });
    expect(res.status).toBe(502);
  });

  it('returns 502 when the model output is not JSON', async () => {
    mockJsonContent('This is not JSON.');
    const res = await request(makeApp()).post('/api/ai/improve-summary').send({ summary: 'Original.' });
    expect(res.status).toBe(502);
  });
});

describe('improve-bullet contract', () => {
  it('returns { impact, concise, technical } on success', async () => {
    mockJsonContent({ impact: 'I', concise: 'C', technical: 'T' });
    const res = await request(makeApp())
      .post('/api/ai/improve-bullet')
      .send({ bullet: 'Did X.', jobTitle: 'Dev', company: 'Acme' });
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ impact: 'I', concise: 'C', technical: 'T' });
  });

  it('rejects an invalid body with 400', async () => {
    const res = await request(makeApp()).post('/api/ai/improve-bullet').send({});
    expect(res.status).toBe(400);
  });

  it('returns 502 on malformed model output', async () => {
    mockJsonContent({ impact: 'I' });
    const res = await request(makeApp()).post('/api/ai/improve-bullet').send({ bullet: 'Did X.' });
    expect(res.status).toBe(502);
  });
});

describe('tailor-jd contract', () => {
  it('returns { score, matchedKeywords, missingKeywords, suggestions }', async () => {
    mockJsonContent({ score: 82, matchedKeywords: ['ts'], missingKeywords: ['go'], suggestions: ['a'] });
    const res = await request(makeApp())
      .post('/api/ai/tailor-jd')
      .send({ resume: validResume, jobDescription: 'Need TS.' });
    expect(res.status).toBe(200);
    expect(res.body.score).toBe(82);
    expect(res.body.matchedKeywords).toEqual(['ts']);
    expect(res.body.missingKeywords).toEqual(['go']);
    expect(res.body.suggestions).toEqual(['a']);
  });

  it('rejects a malformed resume with 400', async () => {
    const res = await request(makeApp())
      .post('/api/ai/tailor-jd')
      .send({ resume: { skills: 'not-an-array' }, jobDescription: 'x' });
    expect(res.status).toBe(400);
  });

  it('returns 502 when score is not a number', async () => {
    mockJsonContent({ score: 'high', matchedKeywords: [], missingKeywords: [], suggestions: [] });
    const res = await request(makeApp())
      .post('/api/ai/tailor-jd')
      .send({ resume: validResume, jobDescription: 'x' });
    expect(res.status).toBe(502);
  });
});

describe('generate-cover-letter contract', () => {
  it('returns { body } as plain text', async () => {
    mockJsonContent('Dear team, ... Regards, Jane');
    const res = await request(makeApp())
      .post('/api/ai/generate-cover-letter')
      .send({ resume: validResume, companyName: 'Acme', jobTitle: 'Dev' });
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ body: 'Dear team, ... Regards, Jane' });
  });

  it('rejects a missing resume with 400', async () => {
    const res = await request(makeApp()).post('/api/ai/generate-cover-letter').send({ companyName: 'Acme' });
    expect(res.status).toBe(400);
  });
});

describe('translate-resume contract', () => {
  it('returns the translated resume object', async () => {
    const translated = { ...validResume, personal: { fullName: 'Ջեյն Դոյ', headline: 'Ինժեներ' } };
    mockJsonContent(translated);
    const res = await request(makeApp())
      .post('/api/ai/translate-resume')
      .send({ resume: validResume, targetLanguage: 'Armenian' });
    expect(res.status).toBe(200);
    expect(res.body.personal.fullName).toBe('Ջեյն Դոյ');
  });

  it('returns 502 when the model returns a malformed resume', async () => {
    mockJsonContent({ personal: 'not-an-object' });
    const res = await request(makeApp())
      .post('/api/ai/translate-resume')
      .send({ resume: validResume });
    expect(res.status).toBe(502);
  });
});

describe('upstream error handling (no secret leakage)', () => {
  it('returns a safe 502 on upstream 401 without leaking the key', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 401, json: async () => ({}) }));
    const res = await request(makeApp()).post('/api/ai/improve-summary').send({ summary: 'x' });
    expect(res.status).toBe(502);
    expect(res.body.code).toBe('auth_error');
    expect(JSON.stringify(res.body)).not.toContain('test-key');
  });

  it('returns 429 when upstream is rate-limited', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 429, json: async () => ({}) }));
    const res = await request(makeApp()).post('/api/ai/improve-summary').send({ summary: 'x' });
    expect(res.status).toBe(429);
    expect(res.body.code).toBe('rate_limited');
  });

  it('returns 504 on a network failure', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('ECONNREFUSED')));
    const res = await request(makeApp()).post('/api/ai/improve-summary').send({ summary: 'x' });
    expect(res.status).toBe(504);
    expect(res.body.code).toBe('network_error');
  });

  it('returns 503 when the server has no API key configured', async () => {
    delete process.env.OPENROUTER_API_KEY;
    const res = await request(makeApp()).post('/api/ai/improve-summary').send({ summary: 'x' });
    expect(res.status).toBe(503);
    expect(res.body.code).toBe('not_configured');
  });
});

describe('rate limiting at the route level', () => {
  it('returns 429 after exceeding the per-minute limit', async () => {
    mockJsonContent({ concise: 'A', executive: 'B' });
    const app = makeApp();
    let limited = 0;
    for (let i = 0; i < 25; i++) {
      const res = await request(app).post('/api/ai/improve-summary').send({ summary: 'x' });
      if (res.status === 429) limited++;
    }
    expect(limited).toBeGreaterThan(0);
  });
});

/**
 * Contract the frontend depends on (src/lib/aiErrors.ts): every failure
 * response carries a stable machine-readable `code` in a JSON body, and a
 * rate-limited response carries `Retry-After`. If any of these change, the
 * user's error message silently degrades to the generic fallback.
 */
describe('error contract consumed by the frontend', () => {
  const FAILURES: Array<[string, number, string]> = [
    ['401', 401, 'auth_error'],
    ['429', 429, 'rate_limited'],
    ['404', 404, 'model_not_found'],
    ['500', 500, 'upstream_error'],
  ];

  it.each(FAILURES)('upstream %s yields a %s with code %s', async (_label, upstream, expectedCode) => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: upstream, json: async () => ({}) }));
    const res = await request(makeApp()).post('/api/ai/improve-summary').send({ summary: 'x' });
    expect(res.body.code).toBe(expectedCode);
    expect(typeof res.body.error).toBe('string');
    expect(res.body.error.length).toBeGreaterThan(0);
  });

  it('includes Retry-After on a locally rate-limited response', async () => {
    mockJsonContent({ concise: 'A', executive: 'B' });
    const app = makeApp();
    let limitedRes: any = null;
    for (let i = 0; i < 25 && !limitedRes; i++) {
      const res = await request(app).post('/api/ai/improve-summary').send({ summary: 'x' });
      if (res.status === 429) limitedRes = res;
    }
    expect(limitedRes).not.toBeNull();
    expect(limitedRes.headers['retry-after']).toBeDefined();
    expect(Number(limitedRes.headers['retry-after'])).toBeGreaterThan(0);
  });

  it('never leaks the API key in any failure body', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('ECONNREFUSED sk-or-v1-leaked')));
    const res = await request(makeApp()).post('/api/ai/improve-summary').send({ summary: 'x' });
    expect(JSON.stringify(res.body)).not.toContain('test-key');
    expect(JSON.stringify(res.body)).not.toContain('sk-or-v1-');
  });
});

/**
 * Regression cover: the five success contracts the frontend relies on must
 * keep working after the error-handling changes.
 */
describe('successful workflow regression', () => {
  it('improve-summary still returns { concise, executive }', async () => {
    mockJsonContent({ concise: 'A', executive: 'B' });
    const res = await request(makeApp()).post('/api/ai/improve-summary').send({ summary: 'Original.' });
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ concise: 'A', executive: 'B' });
  });

  it('improve-bullet still returns { impact, concise, technical }', async () => {
    mockJsonContent({ impact: 'I', concise: 'C', technical: 'T' });
    const res = await request(makeApp())
      .post('/api/ai/improve-bullet')
      .send({ bullet: 'Did X.', jobTitle: 'Dev', company: 'Acme' });
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ impact: 'I', concise: 'C', technical: 'T' });
  });

  it('tailor-jd still returns the full match contract', async () => {
    mockJsonContent({ score: 82, matchedKeywords: ['ts'], missingKeywords: ['go'], suggestions: ['a'] });
    const res = await request(makeApp())
      .post('/api/ai/tailor-jd')
      .send({ resume: validResume, jobDescription: 'Need TS.' });
    expect(res.status).toBe(200);
    expect(res.body.score).toBe(82);
  });

  it('generate-cover-letter still returns { body }', async () => {
    mockJsonContent('Dear team, ... Regards, Jane');
    const res = await request(makeApp())
      .post('/api/ai/generate-cover-letter')
      .send({ resume: validResume, companyName: 'Acme', jobTitle: 'Dev' });
    expect(res.status).toBe(200);
    expect(typeof res.body.body).toBe('string');
  });

  it('translate-resume still returns a full resume object', async () => {
    mockJsonContent({ ...validResume, personal: { fullName: 'Ջեյն Դոյ' } });
    const res = await request(makeApp())
      .post('/api/ai/translate-resume')
      .send({ resume: validResume, targetLanguage: 'Armenian' });
    expect(res.status).toBe(200);
    expect(res.body.personal.fullName).toBe('Ջեյն Դոյ');
  });

  it('a 400 keeps its validation message so the UI can show it', async () => {
    const res = await request(makeApp()).post('/api/ai/improve-summary').send({});
    expect(res.status).toBe(400);
    expect(res.body.error).toContain('summary');
  });
});