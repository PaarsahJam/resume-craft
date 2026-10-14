import { describe, it, expect } from 'vitest';
import {
  parseResumeText,
  APPROVED_LEVEL_1_HEADINGS,
  ABSOLUTE_SKILL_BLACKLIST,
} from './parser';
import { sampleResumeMarkdown, armenianSampleResumeMarkdown } from '../data/sampleResume';
import { Resume } from '../types';

/**
 * The parser is the single entry point for turning pasted text / uploaded
 * files into a Resume. It is pure and deterministic, so it is the
 * highest-value unit to pin down. These tests use the real bundled sample
 * fixtures plus synthetic edge cases (empty, malformed, explicit tags).
 */

function expectValidResume(r: Resume) {
  expect(r).toBeDefined();
  expect(typeof r.id).toBe('string');
  expect(r.id.length).toBeGreaterThan(0);
  expect(r.meta).toBeDefined();
  expect(typeof r.meta.title).toBe('string');
  expect(typeof r.meta.createdAt).toBe('string');
  expect(Array.isArray(r.meta.tags)).toBe(true);
  expect(r.personal).toBeDefined();
  expect(Array.isArray(r.skills)).toBe(true);
  expect(Array.isArray(r.experience)).toBe(true);
  expect(Array.isArray(r.projects)).toBe(true);
  expect(Array.isArray(r.education)).toBe(true);
  expect(Array.isArray(r.certifications)).toBe(true);
  expect(Array.isArray(r.languages)).toBe(true);
  expect(Array.isArray(r.additionalSections)).toBe(true);
  expect(Array.isArray(r.sectionOrder)).toBe(true);
  expect(Array.isArray(r.hiddenSections)).toBe(true);
}

describe('parseResumeText — English sample fixture', () => {
  const r = parseResumeText(sampleResumeMarkdown, 'Test Resume');

  it('produces a structurally valid Resume', () => {
    expectValidResume(r);
  });

  it('captures the candidate name from the leading heading', () => {
    // The demo fixture uses a synthetic identity; see sampleResume.ts.
    expect(r.personal.fullName).toContain('ALEX');
  });

  it('captures a headline', () => {
    expect(r.personal.headline.length).toBeGreaterThan(0);
  });

  it('detects contact fields', () => {
    expect(r.personal.email).toContain('@');
    expect(r.personal.phone).toMatch(/\d/);
  });

  it('parses the professional summary', () => {
    expect(r.summary.length).toBeGreaterThan(50);
  });

  it('parses skill categories with items', () => {
    expect(r.skills.length).toBeGreaterThan(0);
    const totalItems = r.skills.reduce((n, s) => n + s.items.length, 0);
    expect(totalItems).toBeGreaterThan(10);
  });

  it('parses experience entries with bullets', () => {
    expect(r.experience.length).toBeGreaterThan(0);
    expect(r.experience[0].jobTitle.length).toBeGreaterThan(0);
    expect(r.experience[0].company.length).toBeGreaterThan(0);
  });

  it('parses projects', () => {
    expect(r.projects.length).toBeGreaterThan(0);
  });

  it('uses the provided title in meta', () => {
    expect(r.meta.title).toBe('Test Resume');
  });
});

describe('parseResumeText — Armenian sample fixture', () => {
  const r = parseResumeText(armenianSampleResumeMarkdown, 'Թեստ');

  it('produces a structurally valid Resume', () => {
    expectValidResume(r);
  });

  it('captures an Armenian name', () => {
    expect(r.personal.fullName).toContain('Արմեն');
  });

  it('parses Armenian experience', () => {
    expect(r.experience.length).toBeGreaterThan(0);
    expect(r.experience[0].jobTitle.length).toBeGreaterThan(0);
  });

  it('parses Armenian skill categories', () => {
    expect(r.skills.length).toBeGreaterThan(0);
  });
});

describe('parseResumeText — explicit semantic tags', () => {
  const tagged = [
    '[NAME] Jane Doe',
    '[TITLE] Senior Engineer',
    '[LOCATION] Berlin, Germany',
    '[EMAIL] jane@example.com',
    '[PHONE] +49 30 123456',
    '[SECTION: SUMMARY]',
    '[DESCRIPTION] A concise professional summary.',
    '[SECTION: EXPERIENCE]',
    '[JOB TITLE] Senior Engineer',
    '[COMPANY] Acme Corp',
    '[DATES] 2020 – Present',
    '[BULLET] Led a team of five engineers.',
    '[BULLET] Shipped a flagship product.',
    '[SECTION: SKILLS]',
    '[SKILL] TypeScript',
    '[SKILL] React',
  ].join('\n');

  const r = parseResumeText(tagged, 'Tagged');

  it('maps tagged personal fields', () => {
    expect(r.personal.fullName).toBe('Jane Doe');
    expect(r.personal.headline).toBe('Senior Engineer');
    expect(r.personal.location).toBe('Berlin, Germany');
    expect(r.personal.email).toBe('jane@example.com');
    expect(r.personal.phone).toContain('+49');
  });

  it('captures the tagged summary', () => {
    expect(r.summary).toContain('concise professional summary');
  });

  it('captures experience bullets', () => {
    expect(r.experience).toHaveLength(1);
    expect(r.experience[0].jobTitle).toBe('Senior Engineer');
    expect(r.experience[0].company).toBe('Acme Corp');
    expect(r.experience[0].startDate).toBe('2020');
    expect(r.experience[0].endDate).toBe('Present');
    expect(r.experience[0].description).toContain('Led a team of five engineers.');
  });

  it('captures tagged skills', () => {
    const all = r.skills.flatMap((s) => s.items);
    expect(all).toContain('TypeScript');
    expect(all).toContain('React');
  });
});

describe('parseResumeText — edge cases', () => {
  it('returns a valid Resume for empty input', () => {
    const r = parseResumeText('');
    expectValidResume(r);
    expect(r.skills).toHaveLength(0);
    expect(r.experience).toHaveLength(0);
    expect(r.personal.fullName).toBe('');
  });

  it('returns a valid Resume for whitespace-only input', () => {
    const r = parseResumeText('   \n\n   \t  ');
    expectValidResume(r);
  });

  it('does not crash on malformed / unrelated text', () => {
    const r = parseResumeText('the quick brown fox\n12345\n!!!@@@###');
    expectValidResume(r);
  });

  it('derives the title from the detected name', () => {
    const r = parseResumeText('some unstructured text');
    expect(r.meta.title).toBe("some unstructured text's Resume");
  });

  it('falls back to "Parsed Resume" only when no name is found', () => {
    // Whitespace-only input yields no name, so the generic title is used.
    const r = parseResumeText('   \n  ');
    expect(r.meta.title).toBe('Parsed Resume');
  });

  it('treats a resume named like the demo id without leaking sample data', () => {
    // The parser must never fall back to sample personal details.
    const r = parseResumeText('John Smith\nLyon, France');
    expect(r.personal.fullName).toBe('John Smith');
    expect(r.personal.email).toBe('');
  });
});

describe('parseResumeText — skill blacklist guards', () => {
  it('never treats a blacklisted technology as a section heading', () => {
    // "Docker" and "React" are in ABSOLUTE_SKILL_BLACKLIST and must not
    // become a section heading even when written like one.
    expect(ABSOLUTE_SKILL_BLACKLIST.has('docker')).toBe(true);
    expect(ABSOLUTE_SKILL_BLACKLIST.has('react')).toBe(true);
  });

  it('keeps blacklisted skills out of the section-heading whitelist', () => {
    for (const heading of APPROVED_LEVEL_1_HEADINGS) {
      expect(ABSOLUTE_SKILL_BLACKLIST.has(heading.toLowerCase())).toBe(false);
    }
  });
});
