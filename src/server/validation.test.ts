import { describe, it, expect } from 'vitest';
import {
  validateImproveSummary,
  validateImproveBullet,
  validateTailorJd,
  validateCoverLetter,
  validateTranslateResume,
  validateSummarySuggestions,
  validateBulletSuggestions,
  validateJdMatch,
  validateCoverLetterBody,
  validateTranslatedResume,
} from './validation';

/** Validators throw on invalid input; assert that a call throws. */
function expectInvalid(fn: () => unknown) {
  expect(fn).toThrow();
}

describe('request validation — improve-summary', () => {
  it('accepts a valid body with optional fields', () => {
    const r = validateImproveSummary({ summary: 'A summary.', headline: 'Engineer', jobTitle: 'Dev' });
    expect(r.summary).toBe('A summary.');
    expect(r.headline).toBe('Engineer');
    expect(r.jobTitle).toBe('Dev');
  });

  it('rejects a non-object body', () => {
    expectInvalid(() => validateImproveSummary('nope'));
  });

  it('rejects a missing/empty summary', () => {
    expectInvalid(() => validateImproveSummary({}));
    expectInvalid(() => validateImproveSummary({ summary: '   ' }));
  });

  it('rejects a non-string summary', () => {
    expectInvalid(() => validateImproveSummary({ summary: 123 }));
  });

  it('rejects an over-long summary', () => {
    expectInvalid(() => validateImproveSummary({ summary: 'x'.repeat(20_001) }));
  });
});

describe('request validation — improve-bullet', () => {
  it('accepts a valid body', () => {
    expect(validateImproveBullet({ bullet: 'Did a thing.' }).bullet).toBe('Did a thing.');
  });

  it('rejects a missing bullet', () => {
    expectInvalid(() => validateImproveBullet({}));
  });

  it('rejects an over-long bullet', () => {
    expectInvalid(() => validateImproveBullet({ bullet: 'x'.repeat(20_001) }));
  });
});

const validResume = {
  personal: { fullName: 'Jane', headline: 'Engineer' },
  summary: 'A summary.',
  skills: [{ category: 'Lang', items: ['TS', 'Go'] }],
  experience: [{ jobTitle: 'Dev', description: ['Did X', 'Did Y'] }],
};

describe('request validation — tailor-jd', () => {
  it('accepts a valid body', () => {
    const r = validateTailorJd({ resume: validResume, jobDescription: 'We need a dev.' });
    expect(r.jobDescription).toBe('We need a dev.');
  });

  it('rejects a missing job description', () => {
    expectInvalid(() => validateTailorJd({ resume: validResume }));
  });

  it('rejects a non-object resume', () => {
    expectInvalid(() => validateTailorJd({ resume: 'x', jobDescription: 'y' }));
  });

  it('rejects malformed skills structure', () => {
    expectInvalid(() => validateTailorJd({ resume: { skills: [{ category: 5 }] }, jobDescription: 'y' }));
  });

  it('rejects experience whose description is not a string array', () => {
    expectInvalid(() =>
      validateTailorJd({ resume: { experience: [{ jobTitle: 'x', description: [1, 2] }] }, jobDescription: 'y' })
    );
  });
});

describe('request validation — cover-letter', () => {
  it('accepts a valid body', () => {
    expect(validateCoverLetter({ resume: validResume, companyName: 'Acme' }).companyName).toBe('Acme');
  });

  it('rejects a missing resume', () => {
    expectInvalid(() => validateCoverLetter({ companyName: 'Acme' }));
  });
});

describe('request validation — translate-resume', () => {
  it('accepts a valid body with optional targetLanguage', () => {
    expect(validateTranslateResume({ resume: validResume }).resume).toBeTruthy();
    expect(validateTranslateResume({ resume: validResume, targetLanguage: 'English' }).targetLanguage).toBe('English');
  });

  it('rejects a missing resume', () => {
    expectInvalid(() => validateTranslateResume({}));
  });
});

describe('response validation — model output contracts', () => {
  it('validates summary suggestions', () => {
    expect(validateSummarySuggestions({ concise: 'a', executive: 'b' })).toEqual({
      concise: 'a',
      executive: 'b',
    });
    expectInvalid(() => validateSummarySuggestions({ concise: 'a' }));
    expectInvalid(() => validateSummarySuggestions('nope'));
  });

  it('validates bullet suggestions', () => {
    expect(validateBulletSuggestions({ impact: 'i', concise: 'c', technical: 't' })).toBeTruthy();
    expectInvalid(() => validateBulletSuggestions({ impact: 'a', concise: 'b' }));
  });

  it('validates JD match', () => {
    expect(
      validateJdMatch({ score: 80, matchedKeywords: ['x'], missingKeywords: [], suggestions: ['s'] }).score
    ).toBe(80);
    expectInvalid(() =>
      validateJdMatch({ score: '80', matchedKeywords: [], missingKeywords: [], suggestions: [] })
    );
    expectInvalid(() => validateJdMatch({ score: 80, matchedKeywords: 'x', missingKeywords: [], suggestions: [] }));
  });

  it('validates cover letter body is a plain string', () => {
    expect(validateCoverLetterBody({ body: 'Dear team...' })).toEqual({ body: 'Dear team...' });
    expectInvalid(() => validateCoverLetterBody({ body: 42 }));
    expectInvalid(() => validateCoverLetterBody({}));
  });

  it('validates translated resume structure', () => {
    expect(validateTranslatedResume(validResume)).toBeTruthy();
    // A malformed translation must be rejected before it reaches the client.
    expectInvalid(() => validateTranslatedResume({ skills: 'not-an-array' }));
    expectInvalid(() => validateTranslatedResume({ experience: [{ description: 'not-an-array' }] }));
  });
});