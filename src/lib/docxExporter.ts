import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
  BorderStyle,
  ImageRun,
} from 'docx';
import { PhotoConfig, Resume, TemplateOptions } from '../types';
import { getSectionTitle } from './i18n';

/** Edge length of the embedded photo, ~28mm at 96 DPI. */
const PHOTO_SIZE_PX = 106;

type DocxImageType = 'png' | 'jpg' | 'gif' | 'bmp';

const MIME_TO_TYPE: Record<string, DocxImageType> = {
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'image/jpg': 'jpg',
  'image/gif': 'gif',
  'image/bmp': 'bmp',
  'image/x-ms-bmp': 'bmp',
};

/**
 * Word can't read every format the editor accepts (webp, svg) and won't fetch
 * remote URLs, so anything other than a base64 data URL Word understands is
 * decoded and re-encoded as a square PNG. Returns null instead of throwing — a
 * missing photo shouldn't sink the whole export.
 */
async function resolvePhoto(photo: PhotoConfig): Promise<{ data: string; type: DocxImageType } | null> {
  const dataUrlType = /^data:([^;,]+);base64,/.exec(photo.dataUrl);
  if (dataUrlType) {
    const type = MIME_TO_TYPE[dataUrlType[1].toLowerCase()];
    if (type) return { data: photo.dataUrl, type };
  }

  try {
    const blob = await (await fetch(photo.dataUrl)).blob();
    const bitmap = await createImageBitmap(blob);
    // Centre-crop to a square so the photo isn't stretched by the fixed frame.
    const side = Math.min(bitmap.width, bitmap.height);
    const canvas = document.createElement('canvas');
    canvas.width = PHOTO_SIZE_PX * 2;
    canvas.height = PHOTO_SIZE_PX * 2;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;
    ctx.drawImage(
      bitmap,
      (bitmap.width - side) / 2,
      (bitmap.height - side) / 2,
      side,
      side,
      0,
      0,
      canvas.width,
      canvas.height
    );
    return { data: canvas.toDataURL('image/png'), type: 'png' };
  } catch {
    return null;
  }
}

export async function generateDocxBlob(resume: Resume, options: TemplateOptions): Promise<Blob> {
  const { personal, summary, skills, experience, projects, education, certifications, languages, additionalSections, sectionOrder } = resume;

  const children: Paragraph[] = [];

  // Name Header
  children.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({
          text: personal.fullName || 'Your Name',
          bold: true,
          size: 32, // 16pt
          color: options.accentColor ? options.accentColor.replace('#', '') : '1E293B',
        }),
      ],
    })
  );

  // Headline
  if (personal.headline) {
    children.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [
          new TextRun({
            text: personal.headline,
            italics: true,
            size: 22,
            color: '475569',
          }),
        ],
      })
    );
  }

  // Contact Info Line
  const contactParts: string[] = [
    personal.email,
    personal.phone,
    personal.location,
    personal.github,
    personal.linkedin,
    personal.website,
  ].filter((p): p is string => Boolean(p));

  if (contactParts.length > 0) {
    children.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [
          new TextRun({
            text: contactParts.join(' | '),
            size: 18,
            color: '64748B',
          }),
        ],
      })
    );
  }

  // Photo — hidden in ATS mode and when the shape is set to "none", matching the
  // templates, so the DOCX and the preview stay in sync.
  if (personal.photo?.dataUrl && personal.photo.shape !== 'none' && !options.atsMode) {
    const photo = await resolvePhoto(personal.photo);
    if (photo) {
      children.push(
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { before: 160, after: 160 },
          children: [
            new ImageRun({
              type: photo.type,
              data: photo.data,
              transformation: { width: PHOTO_SIZE_PX, height: PHOTO_SIZE_PX },
              altText: {
                name: 'Profile photo',
                description: `${personal.fullName || 'Candidate'} profile photo`,
              },
            }),
          ],
        })
      );
    }
  }

  // Divider
  children.push(
    new Paragraph({
      border: {
        bottom: { color: 'CBD5E1', space: 1, style: BorderStyle.SINGLE, size: 6 },
      },
      children: [],
    })
  );

  // Section Header Generator Helper
  const createSectionHeader = (title: string) => {
    return new Paragraph({
      heading: HeadingLevel.HEADING_2,
      border: {
        bottom: { color: options.accentColor ? options.accentColor.replace('#', '') : '334155', space: 2, style: BorderStyle.SINGLE, size: 8 },
      },
      children: [
        new TextRun({
          text: title.toUpperCase(),
          bold: true,
          size: 22,
          color: options.accentColor ? options.accentColor.replace('#', '') : '1E293B',
        }),
      ],
    });
  };

  // Build ordered sections
  for (const sec of sectionOrder) {
    if (resume.hiddenSections?.includes(sec)) continue;

    if (sec === 'summary' && summary) {
      children.push(createSectionHeader(getSectionTitle('summary', options.language, resume)));
      children.push(
        new Paragraph({
          children: [new TextRun({ text: summary, size: 20, color: '334155' })],
        })
      );
    } else if (sec === 'skills' && skills && skills.length > 0) {
      children.push(createSectionHeader(getSectionTitle('skills', options.language, resume)));
      for (const sk of skills) {
        children.push(
          new Paragraph({
            children: [
              new TextRun({ text: `${sk.category}: `, bold: true, size: 20 }),
              new TextRun({ text: sk.items.join(', '), size: 20 }),
            ],
          })
        );
      }
    } else if (sec === 'experience' && experience && experience.length > 0) {
      children.push(createSectionHeader(getSectionTitle('experience', options.language, resume)));
      for (const exp of experience) {
        children.push(
          new Paragraph({
            children: [
              new TextRun({ text: exp.jobTitle, bold: true, size: 22 }),
              new TextRun({ text: ` — ${exp.company}`, italics: true, size: 20 }),
              new TextRun({
                text: ` (${exp.startDate || ''} – ${exp.endDate || ''})`,
                size: 18,
                color: '64748B',
              }),
            ],
          })
        );

        if (exp.description && exp.description.length > 0) {
          for (const bullet of exp.description) {
            children.push(
              new Paragraph({
                bullet: { level: 0 },
                children: [new TextRun({ text: bullet, size: 20 })],
              })
            );
          }
        }
      }
    } else if (sec === 'projects' && projects && projects.length > 0) {
      children.push(createSectionHeader(getSectionTitle('projects', options.language, resume)));
      for (const proj of projects) {
        children.push(
          new Paragraph({
            children: [
              new TextRun({ text: proj.name, bold: true, size: 22 }),
              new TextRun({
                text: proj.technologies ? ` [${proj.technologies.join(', ')}]` : '',
                italics: true,
                size: 18,
                color: '64748B',
              }),
            ],
          })
        );
        children.push(
          new Paragraph({
            children: [new TextRun({ text: proj.description, size: 20 })],
          })
        );
      }
    } else if (sec === 'education' && education && education.length > 0) {
      children.push(createSectionHeader(getSectionTitle('education', options.language, resume)));
      for (const edu of education) {
        children.push(
          new Paragraph({
            children: [
              new TextRun({ text: edu.institution, bold: true, size: 20 }),
              new TextRun({ text: ` — ${edu.degree}`, size: 20 }),
              new TextRun({ text: ` (${edu.dates || ''})`, size: 18, color: '64748B' }),
            ],
          })
        );
      }
    } else if (sec === 'certifications' && certifications && certifications.length > 0) {
      children.push(createSectionHeader(getSectionTitle('certifications', options.language, resume)));
      for (const cert of certifications) {
        children.push(
          new Paragraph({
            children: [
              new TextRun({ text: cert.name, bold: true, size: 20 }),
              new TextRun({ text: cert.issuer ? ` (${cert.issuer})` : '', size: 20 }),
              new TextRun({ text: cert.date ? ` - ${cert.date}` : '', size: 18, color: '64748B' }),
            ],
          })
        );
      }
    } else if (sec === 'languages' && languages && languages.length > 0) {
      children.push(createSectionHeader(getSectionTitle('languages', options.language, resume)));
      const langStr = languages.map((l) => `${l.language} (${l.level || 'Fluent'})`).join(', ');
      children.push(
        new Paragraph({
          children: [new TextRun({ text: langStr, size: 20 })],
        })
      );
    } else if (sec === 'additional' && additionalSections && additionalSections.length > 0) {
      for (const add of additionalSections) {
        children.push(createSectionHeader(add.title));
        children.push(
          new Paragraph({
            children: [new TextRun({ text: add.content, size: 20 })],
          })
        );
      }
    }
  }

  const doc = new Document({
    sections: [
      {
        properties: {},
        children,
      },
    ],
  });

  return await Packer.toBlob(doc);
}

export function downloadDocx(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  // Revoking in the same task can abort the download in Firefox/Safari.
  setTimeout(() => URL.revokeObjectURL(url), 0);
}
