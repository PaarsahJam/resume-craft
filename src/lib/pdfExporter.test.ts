import { describe, it, expect } from 'vitest';
import { fileNameTimestamp, formatFileName } from './pdfExporter';

/**
 * These are the only genuinely pure helpers in pdfExporter.ts. The PDF
 * generation itself (exportPdfFile, triggerPrintToPdf) depends on the DOM,
 * html-to-image and jsPDF rasterisation, so it is not unit-tested here.
 * The paginate() function is module-private and not exported, so it is
 * covered indirectly at most; testing it would require an artificial export,
 * which we avoid to keep the production surface unchanged.
 */

describe('fileNameTimestamp', () => {
  it('formats a date as YYYY-MM-DD_HH-MM in local time', () => {
    const d = new Date(2026, 8, 30, 14, 5); // Sep 30 2026, 14:05 local
    const ts = fileNameTimestamp(d);
    expect(ts).toMatch(/^\d{4}-\d{2}-\d{2}_\d{2}-\d{2}$/);
    expect(ts.startsWith('2026-09-30_14-05')).toBe(true);
  });

  it('zero-pads single-digit months, days, hours and minutes', () => {
    const d = new Date(2026, 0, 5, 9, 3);
    expect(fileNameTimestamp(d)).toBe('2026-01-05_09-03');
  });
});

describe('formatFileName', () => {
  it('slugifies a simple name and appends the extension', () => {
    const name = formatFileName('Alex Morgan', 'pdf');
    expect(name).toMatch(/^Alex-Morgan-Resume-\d{4}-\d{2}-\d{2}_\d{2}-\d{2}\.pdf$/);
  });

  it('replaces spaces and disallowed characters with hyphens', () => {
    const name = formatFileName('Jane Doe-Smith', 'docx');
    expect(name).toMatch(/^Jane-Doe-Smith-Resume-.+\.docx$/);
    expect(name).not.toContain(' ');
  });

  it('collapses consecutive hyphens', () => {
    const name = formatFileName('A  B   C', 'json');
    expect(name).not.toMatch(/--/);
  });

  it('handles an empty name by falling back to "Resume"', () => {
    const name = formatFileName('', 'pdf');
    expect(name).toMatch(/^Resume-Resume-.+\.pdf$/);
  });

  it('preserves Armenian characters (Unicode range)', () => {
    const name = formatFileName('Արմեն Գրիգորյան', 'pdf');
    expect(name).toContain('Արմեն');
    expect(name).toContain('Գրիգորյան');
    expect(name).toMatch(/\.pdf$/);
  });
});
