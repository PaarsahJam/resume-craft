import { describe, it, expect } from 'vitest';
import { extractUsage, extractCompletionMeta } from './usage';

describe('extractUsage — valid metadata', () => {
  it('reads OpenAI-style usage', () => {
    const usage = extractUsage({
      usage: { prompt_tokens: 120, completion_tokens: 45, total_tokens: 165 },
    });
    expect(usage).toEqual({ promptTokens: 120, completionTokens: 45, totalTokens: 165 });
  });

  it('derives totalTokens when the provider omits it', () => {
    const usage = extractUsage({ usage: { prompt_tokens: 10, completion_tokens: 5 } });
    expect(usage).toEqual({ promptTokens: 10, completionTokens: 5, totalTokens: 15 });
  });

  it('trusts a provider-reported total over the derived one', () => {
    const usage = extractUsage({
      usage: { prompt_tokens: 10, completion_tokens: 5, total_tokens: 999 },
    });
    expect(usage?.totalTokens).toBe(999);
  });

  it('accepts the input/output token aliases', () => {
    const usage = extractUsage({ usage: { input_tokens: 7, output_tokens: 3 } });
    expect(usage).toEqual({ promptTokens: 7, completionTokens: 3, totalTokens: 10 });
  });

  it('accepts numeric strings', () => {
    const usage = extractUsage({ usage: { prompt_tokens: '12', completion_tokens: '8' } });
    expect(usage).toEqual({ promptTokens: 12, completionTokens: 8, totalTokens: 20 });
  });

  it('truncates fractional counts', () => {
    const usage = extractUsage({ usage: { prompt_tokens: 10.9 } });
    expect(usage?.promptTokens).toBe(10);
  });

  it('accepts zero', () => {
    expect(extractUsage({ usage: { prompt_tokens: 0 } })).toEqual({ promptTokens: 0 });
  });
});

describe('extractUsage — missing or partial metadata', () => {
  it('returns undefined when usage is absent', () => {
    expect(extractUsage({})).toBeUndefined();
    expect(extractUsage({ model: 'x' })).toBeUndefined();
  });

  it('returns undefined for a usage block with nothing usable', () => {
    expect(extractUsage({ usage: {} })).toBeUndefined();
  });

  it('keeps only the fields that are present', () => {
    expect(extractUsage({ usage: { completion_tokens: 30 } })).toEqual({
      completionTokens: 30,
    });
    expect(extractUsage({ usage: { prompt_tokens: 30 } })).toEqual({
      promptTokens: 30,
    });
  });

  it('never invents a total from only one half', () => {
    const usage = extractUsage({ usage: { prompt_tokens: 30 } });
    expect(usage?.totalTokens).toBeUndefined();
  });
});

describe('extractUsage — unexpected shapes are tolerated', () => {
  const SHAPES: unknown[] = [
    undefined,
    null,
    'usage',
    42,
    ['a'],
    true,
    { usage: 'not-an-object' },
    { usage: [] },
    { usage: null },
    { usage: { prompt_tokens: null } },
    { usage: { prompt_tokens: {} } },
    { usage: { prompt_tokens: NaN } },
    { usage: { prompt_tokens: Infinity } },
    { usage: { prompt_tokens: -5 } },
    { usage: { prompt_tokens: 'abc' } },
    { usage: { prompt_tokens: '' } },
    { usage: { prompt_tokens: [] } },
  ];

  it.each(SHAPES.map((s, i) => [i, s] as [number, unknown]))(
    'does not throw for shape #%i',
    (_i, shape) => {
      expect(() => extractUsage(shape)).not.toThrow();
    }
  );

  it('drops invalid counts rather than propagating them', () => {
    expect(extractUsage({ usage: { prompt_tokens: -5, completion_tokens: 'x' } })).toBeUndefined();
    expect(extractUsage({ usage: { prompt_tokens: NaN, completion_tokens: 4 } })).toEqual({
      completionTokens: 4,
    });
  });

  it('handles a deeply nested or prototype-laden payload', () => {
    const payload = Object.create({ usage: { prompt_tokens: 99 } });
    // Inherited properties are still readable and usable.
    expect(() => extractUsage(payload)).not.toThrow();
  });
});

describe('extractCompletionMeta', () => {
  it('reads model and id', () => {
    expect(extractCompletionMeta({ model: 'vendor/actual:free', id: 'gen-123' })).toEqual({
      model: 'vendor/actual:free',
      id: 'gen-123',
    });
  });

  it('returns undefined when neither is supplied', () => {
    expect(extractCompletionMeta({})).toBeUndefined();
    expect(extractCompletionMeta({ model: '  ' })).toBeUndefined();
    expect(extractCompletionMeta({ id: 123 })).toBeUndefined();
  });

  it('keeps only the fields present', () => {
    expect(extractCompletionMeta({ model: 'vendor/x' })).toEqual({ model: 'vendor/x' });
    expect(extractCompletionMeta({ id: 'gen-1' })).toEqual({ id: 'gen-1' });
  });

  it('trims whitespace', () => {
    expect(extractCompletionMeta({ model: '  vendor/x  ' })).toEqual({ model: 'vendor/x' });
  });
});