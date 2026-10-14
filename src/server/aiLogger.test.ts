import { describe, it, expect, vi, afterEach } from 'vitest';
import { buildAiLogRecord, emitAiLog, createRequestId } from './aiLogger';

afterEach(() => {
  vi.restoreAllMocks();
});

describe('buildAiLogRecord — fields', () => {
  const base = {
    requestId: 'req-1',
    endpoint: 'improve-summary',
    configuredModel: 'vendor/configured:free',
    startedAt: Date.now() - 25,
  };

  it('records the required fields on success', () => {
    const record = buildAiLogRecord({ ...base, outcome: 'success', httpStatus: 200 });
    expect(record).toEqual({
      requestId: 'req-1',
      endpoint: 'improve-summary',
      configuredModel: 'vendor/configured:free',
      durationMs: expect.any(Number),
      outcome: 'success',
      httpStatus: 200,
    });
  });

  it('records token usage when supplied', () => {
    const record = buildAiLogRecord({
      ...base,
      outcome: 'success',
      httpStatus: 200,
      usage: { promptTokens: 100, completionTokens: 50, totalTokens: 150 },
    });
    expect(record.promptTokens).toBe(100);
    expect(record.completionTokens).toBe(50);
    expect(record.totalTokens).toBe(150);
  });

  it('omits token fields entirely when usage is absent', () => {
    const record = buildAiLogRecord({ ...base, outcome: 'success', httpStatus: 200 });
    expect('promptTokens' in record).toBe(false);
    expect('completionTokens' in record).toBe(false);
    expect('totalTokens' in record).toBe(false);
  });

  it('records partial usage without inventing the rest', () => {
    const record = buildAiLogRecord({
      ...base,
      outcome: 'success',
      httpStatus: 200,
      usage: { completionTokens: 42 },
    });
    expect(record.completionTokens).toBe(42);
    expect('promptTokens' in record).toBe(false);
    expect('totalTokens' in record).toBe(false);
  });

  it('records the actual model alongside the configured one', () => {
    const record = buildAiLogRecord({
      ...base,
      outcome: 'success',
      httpStatus: 200,
      actualModel: 'vendor/actual:free',
    });
    expect(record.configuredModel).toBe('vendor/configured:free');
    expect(record.actualModel).toBe('vendor/actual:free');
  });

  it('omits actualModel when the provider reports none', () => {
    const record = buildAiLogRecord({ ...base, outcome: 'success', httpStatus: 200 });
    expect('actualModel' in record).toBe(false);
  });

  it('records the error category on failure', () => {
    const record = buildAiLogRecord({
      ...base,
      outcome: 'error',
      httpStatus: 504,
      errorCategory: 'timeout',
    });
    expect(record.outcome).toBe('error');
    expect(record.httpStatus).toBe(504);
    expect(record.errorCategory).toBe('timeout');
  });

  it('omits errorCategory on success', () => {
    const record = buildAiLogRecord({ ...base, outcome: 'success', httpStatus: 200 });
    expect('errorCategory' in record).toBe(false);
  });

  it('never reports a negative duration', () => {
    const record = buildAiLogRecord({
      ...base,
      startedAt: Date.now() + 5000,
      outcome: 'success',
      httpStatus: 200,
    });
    expect(record.durationMs).toBeGreaterThanOrEqual(0);
  });
});

describe('emitAiLog — serialisation and safety', () => {
  const record = buildAiLogRecord({
    requestId: 'req-1',
    endpoint: 'improve-summary',
    configuredModel: 'vendor/model:free',
    startedAt: Date.now(),
    outcome: 'success',
    httpStatus: 200,
  });

  it('emits a single JSON line tagged with the component', () => {
    const lines: string[] = [];
    emitAiLog(record, (l) => lines.push(l));
    expect(lines).toHaveLength(1);
    expect(lines[0].includes('\n')).toBe(false);
    const parsed = JSON.parse(lines[0]);
    expect(parsed.component).toBe('ai');
    expect(parsed.endpoint).toBe('improve-summary');
  });

  it('never throws if the sink throws', () => {
    expect(() =>
      emitAiLog(record, () => {
        throw new Error('sink exploded');
      })
    ).not.toThrow();
  });

  it('defaults to console.log', () => {
    const spy = vi.spyOn(console, 'log').mockImplementation(() => {});
    emitAiLog(record);
    expect(spy).toHaveBeenCalledTimes(1);
  });
});

describe('createRequestId', () => {
  it('returns a non-empty string', () => {
    const id = createRequestId();
    expect(typeof id).toBe('string');
    expect(id.length).toBeGreaterThan(0);
  });

  it('returns a different id each call', () => {
    const ids = new Set(Array.from({ length: 50 }, () => createRequestId()));
    expect(ids.size).toBe(50);
  });

  it('contains no user content or key material', () => {
    const id = createRequestId();
    expect(id).not.toMatch(/sk-or-v1|Bearer|@/);
  });

  it('is an opaque token, not a user- or content-derived string', () => {
    // The correlation id is designed to be logged, so it must be generated
    // rather than derived from anything the caller supplied.
    const id = createRequestId();
    expect(id).toMatch(/^[A-Za-z0-9-]+$/);
    expect(id).not.toContain(' ');
  });
});