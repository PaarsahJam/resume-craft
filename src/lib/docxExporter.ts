import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
  BorderStyle,
} from 'docx';
import { Resume, TemplateOptions } from '../types';
import { getSectionTitle } from './i18n';

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
