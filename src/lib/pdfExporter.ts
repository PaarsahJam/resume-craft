import { toPng } from 'html-to-image';
import { jsPDF } from 'jspdf';

export function formatFileName(fullName: string, extension: 'pdf' | 'docx' | 'json'): string {
  const safeName = (fullName || 'Resume')
    .trim()
    .replace(/[^a-zA-Z0-9\u0530-\u058F]/g, '-')
    .replace(/-+/g, '-');
  return `${safeName}-Resume.${extension}`;
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
  clone.style.boxShadow = 'none';
  clone.style.border = 'none';
  clone.style.boxSizing = 'border-box';
  clone.style.overflowWrap = 'break-word';
  clone.style.wordBreak = 'break-word';

  container.appendChild(clone);
  document.body.appendChild(container);

  try {
    // Brief layout settle
    await new Promise((resolve) => setTimeout(resolve, 50));

    // Render high-res PNG using html-to-image on the full-width offscreen clone
    const imgData = await toPng(clone, {
      quality: 0.98,
      pixelRatio: 2,
      backgroundColor: '#ffffff',
      cacheBust: true,
      width: targetWidth,
      height: clone.scrollHeight,
    });

    // Calculate actual pixel dimensions from generated image
    const img = new Image();
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = reject;
      img.src = imgData;
    });

    // Page dimensions in mm
    // A4: 210 x 297 mm
    // Letter: 215.9 x 279.4 mm
    const pdfWidth = paperSize === 'letter' ? 215.9 : 210;
    const pdfHeight = paperSize === 'letter' ? 279.4 : 297;

    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: paperSize === 'letter' ? 'letter' : 'a4',
    });

    const imgWidth = pdfWidth;
    const imgHeight = (img.naturalHeight * imgWidth) / img.naturalWidth;

    let heightLeft = imgHeight;
    let position = 0;

    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight, undefined, 'FAST');
    heightLeft -= pdfHeight;

    while (heightLeft > 5) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight, undefined, 'FAST');
      heightLeft -= pdfHeight;
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
            <title>${title.replace(/\s+/g, '_')}</title>
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
  document.title = title.replace(/\s+/g, '_');
  window.print();
  document.title = originalTitle;
}
