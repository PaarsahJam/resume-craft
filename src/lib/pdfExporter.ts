import { toPng } from 'html-to-image';
import { jsPDF } from 'jspdf';

const pad = (n: number) => String(n).padStart(2, '0');

/** Local-time stamp safe for filenames, e.g. `2026-09-30_14-32`. */
export function fileNameTimestamp(date: Date = new Date()): string {
  return (
    `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}` +
    `_${pad(date.getHours())}-${pad(date.getMinutes())}`
  );
}

export function formatFileName(fullName: string, extension: 'pdf' | 'docx' | 'json'): string {
  const safeName = (fullName || 'Resume')
    .trim()
    .replace(/[^a-zA-Z0-9\u0530-\u058F]/g, '-')
    .replace(/-+/g, '-');
  return `${safeName}-Resume-${fileNameTimestamp()}.${extension}`;
}

/** Printable gutter kept between the page edge and the resume content, in mm. */
const PAGE_MARGIN_MM = 10;

/**
 * Break candidates as y offsets in px relative to `root`.
 *
 * `block` holds the gaps between sibling block boxes. Breaking there is
 * structurally safe: only an ancestor container spans the offset, so no line of
 * text, paragraph or decorated element can be cut in half. `line` holds the
 * per-line boxes of the text itself and is used only when a single block is
 * taller than a page and no gap fits.
 *
 * Element edges in general are not usable as candidates — an inline or nested
 * element can have an edge in the middle of a line box, and the largest edge
 * that still fits would then slice that line. Hence siblings only, and inline
 * children are skipped entirely.
 */
function collectBreakOffsets(root: HTMLElement): { block: number[]; line: number[] } {
  const rootTop = root.getBoundingClientRect().top;
  const block = new Set<number>();
  const line = new Set<number>();
  const add = (set: Set<number>, value: number) => {
    const rounded = Math.round(value);
    if (rounded > 1) set.add(rounded);
  };

  const visit = (el: HTMLElement) => {
    const blocks = Array.from(el.children).filter((child) => {
      // Inline and out-of-flow boxes are skipped: an inline edge can sit inside a
      // line, and an absolutely positioned sibling spans the same rows as a
      // normal-flow one, so its edge is not a real gap between lines of content.
      const style = getComputedStyle(child);
      if (style.display.startsWith('inline')) return false;
      if (style.position === 'absolute' || style.position === 'fixed') return false;
      return child.getBoundingClientRect().height > 0;
    });
    blocks.forEach((child, i) => {
      const rect = child.getBoundingClientRect();
      add(block, rect.bottom - rootTop);
      const next = blocks[i + 1];
      if (next) add(block, next.getBoundingClientRect().top - rootTop);
      visit(child as HTMLElement);
    });
  };
  visit(root);

  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  let node = walker.nextNode();
  while (node) {
    const text = node;
    node = walker.nextNode();

    if (!text.nodeValue || !text.nodeValue.trim()) continue;
    const parent = text.parentElement;
    if (!parent) continue;
    const style = getComputedStyle(parent);
    if (style.display === 'none' || style.visibility === 'hidden') continue;

    const range = document.createRange();
    range.selectNodeContents(text);
    for (const rect of Array.from(range.getClientRects())) {
      if (rect.height <= 0) continue;
      add(line, rect.top - rootTop);
      add(line, rect.bottom - rootTop);
    }
  }

  const sorted = (set: Set<number>) => Array.from(set).sort((a, b) => a - b);
  return { block: sorted(block), line: sorted(line) };
}

/** Largest candidate that is `<= limit` and still past `after`, or null. */
function lastAtOrBelow(candidates: number[], limit: number, after: number): number | null {
  for (let i = candidates.length - 1; i >= 0; i--) {
    if (candidates[i] <= limit) return candidates[i] > after ? candidates[i] : null;
  }
  return null;
}

/**
 * Splits `totalPx` of content into page-sized chunks. Falls back to a hard cut
 * when nothing fits, so an oversized element can't loop forever.
 */
function paginate(
  totalPx: number,
  pageContentPx: number,
  offsets: { block: number[]; line: number[] }
): number[] {
  const starts = [0];
  let cursor = 0;

  while (totalPx - cursor > pageContentPx) {
    const limit = cursor + pageContentPx;
    let next = lastAtOrBelow(offsets.block, limit, cursor);
    if (next === null) next = lastAtOrBelow(offsets.line, limit, cursor);
    if (next === null) next = Math.round(limit);
    cursor = next;
    starts.push(cursor);
  }

  return starts;
}

export async function exportPdfFile(
  elementId: string = 'resume-render-target',
  fileName: string = 'Resume.pdf',
  paperSize: 'a4' | 'letter' = 'a4'
): Promise<void> {
  const element = document.getElementById(elementId);
  if (!element) {
    throw new Error('Resume preview element not found.');
  }

  // Exact standard paper pixel width at 96 DPI: A4 = 794px, Letter = 816px
  const targetWidth = paperSize === 'letter' ? 816 : 794;

  // Create an unconstrained offscreen container to render the exact paper dimensions
  // regardless of screen size, preview zoom scale, or viewport width
  const container = document.createElement('div');
  container.style.position = 'fixed';
  container.style.top = '0';
  container.style.left = '-99999px';
  container.style.width = `${targetWidth}px`;
  container.style.zIndex = '-9999';
  container.style.background = '#ffffff';
  container.style.overflow = 'visible';

  const clone = element.cloneNode(true) as HTMLElement;
  clone.style.width = `${targetWidth}px`;
  clone.style.minWidth = `${targetWidth}px`;
  clone.style.maxWidth = `${targetWidth}px`;
  clone.style.transform = 'none';
  clone.style.margin = '0';
  // The preview pads the card to a full paper height; carrying that over would
  // push a short resume onto a second, near-empty page once margins are applied.
  clone.style.minHeight = '0';
  clone.style.boxShadow = 'none';
  clone.style.border = 'none';
  clone.style.boxSizing = 'border-box';
  clone.style.overflowWrap = 'break-word';
  clone.style.wordBreak = 'break-word';

  container.appendChild(clone);
  document.body.appendChild(container);

  try {
    // Webfonts can swap in after first paint and shift every line, which would
    // invalidate the measured break offsets.
    if (document.fonts?.ready) {
      await document.fonts.ready;
    }
    await new Promise((resolve) => setTimeout(resolve, 50));

    const totalPx = clone.scrollHeight;

    // Page dimensions in mm
    // A4: 210 x 297 mm
    // Letter: 215.9 x 279.4 mm
    const pdfWidth = paperSize === 'letter' ? 215.9 : 210;
    const pdfHeight = paperSize === 'letter' ? 279.4 : 297;

    const imgWidth = pdfWidth - PAGE_MARGIN_MM * 2;

    // Scale factor from rendered source px to PDF mm, and therefore how much of
    // the source fits between the top and bottom margins of one page.
    const mmPerPx = imgWidth / targetWidth;
    const pageContentPx = Math.floor((pdfHeight - PAGE_MARGIN_MM * 2) / mmPerPx);
    const pageStarts = paginate(totalPx, pageContentPx, collectBreakOffsets(clone));

    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: paperSize === 'letter' ? 'letter' : 'a4',
    });

    for (const [index, startPx] of pageStarts.entries()) {
      // A page must cover exactly the range up to the next page's start, not the
      // full page capacity — otherwise it runs past the break and overlaps the
      // next page, reprinting and clipping the line that was broken there.
      const sliceEnd = index + 1 < pageStarts.length ? pageStarts[index + 1] : totalPx;
      const slicePx = sliceEnd - startPx;

      // Each page is rasterised as its own crop of the clone. Drawing one tall
      // strip on every page and shifting it instead would let the strip bleed
      // into the top and bottom margins, because a PDF clips to the page rather
      // than to the margin box — that reprints the neighbouring lines and slices
      // them in half at the break.
      const sliceData = await toPng(clone, {
        quality: 0.98,
        pixelRatio: 2,
        backgroundColor: '#ffffff',
        cacheBust: true,
        width: targetWidth,
        height: slicePx,
        // `height` above defines the viewport that crops the slice. Re-asserting
        // the full height here stops the element's own `overflow: hidden` (used by
        // some templates) from clipping the content this slice is taken from.
        style: { height: `${totalPx}px`, transform: `translateY(-${startPx}px)` },
      });

      if (index > 0) pdf.addPage();
      pdf.addImage(
        sliceData,
        'PNG',
        PAGE_MARGIN_MM,
        PAGE_MARGIN_MM,
        imgWidth,
        slicePx * mmPerPx,
        undefined,
        'FAST'
      );
    }

    pdf.save(fileName);
  } finally {
    if (document.body.contains(container)) {
      document.body.removeChild(container);
    }
  }
}

export function triggerPrintToPdf(title: string = 'Resume') {
  const element = document.getElementById('resume-render-target');
  if (!element) {
    window.print();
    return;
  }

  // Try opening a print popup window for iframe safety
  try {
    const printWindow = window.open('', '_blank', 'width=900,height=1100');
    if (printWindow) {
      const stylesheets = Array.from(document.querySelectorAll('link[rel="stylesheet"], style'))
        .map((node) => node.outerHTML)
        .join('\n');

      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>${title.replace(/\s+/g, '_')}_${fileNameTimestamp()}</title>
            ${stylesheets}
            <style>
              * { box-sizing: border-box !important; }
              html, body {
                margin: 0 !important;
                padding: 0 !important;
                background: #ffffff !important;
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
              }
              #resume-render-target {
                box-shadow: none !important;
                border: none !important;
                margin: 0 auto !important;
                width: 100% !important;
                max-width: 100% !important;
                box-sizing: border-box !important;
                overflow: visible !important;
              }
              @page {
                margin: 8mm 10mm;
                size: auto;
              }
            </style>
          </head>
          <body>
            ${element.outerHTML}
            <script>
              setTimeout(() => {
                window.print();
                window.close();
              }, 400);
            </script>
          </body>
        </html>
      `);
      printWindow.document.close();
      return;
    }
  } catch (err) {
    console.warn('Popup blocked, falling back to direct window.print()', err);
  }

  const originalTitle = document.title;
  document.title = `${title.replace(/\s+/g, '_')}_${fileNameTimestamp()}`;
  window.print();
  document.title = originalTitle;
}
