import React from 'react';
import { Resume, TemplateOptions } from '../../types';
import { getSectionTitle } from '../../lib/i18n';

interface NordicSlateTemplateProps {
  resume: Resume;
  options: TemplateOptions;
}

export const NordicSlateTemplate: React.FC<NordicSlateTemplateProps> = ({ resume, options }) => {
  const { personal, summary, skills, experience, projects, education, certifications, languages, additionalSections, hiddenSections, sectionOrder } = resume;

  const isHidden = (sec: string) => hiddenSections?.includes(sec);
  const slateColor = options.accentColor || '#334155';

  return (
    <div className="w-full text-slate-800 leading-normal break-words font-sans text-xs">
      {/* Refined Nordic Header */}
      <header className="pb-5 mb-5 border-b border-slate-300/80">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            {personal.photo?.dataUrl && personal.photo.shape !== 'none' && !options.atsMode && (
              <img
                src={personal.photo.dataUrl}
                alt={personal.fullName}
                className={`w-16 h-16 object-cover border border-slate-300/80 grayscale contrast-110 shadow-xs ${
                  personal.photo.shape === 'circle'
                    ? 'rounded-full'
                    : personal.photo.shape === 'rounded'
                    ? 'rounded-xl'
                    : 'rounded-none'
                }`}
              />
            )}
            <div>
              <h1 className="text-3xl font-light tracking-tight text-slate-900 break-words">
                {personal.fullName || 'Your Name'}
              </h1>
              {personal.headline && (
                <p className="text-xs uppercase tracking-wider text-slate-500 font-medium mt-0.5 break-words">
                  {personal.headline}
                </p>
              )}
            </div>
          </div>

          {/* Minimalist contact block */}
          <div className="text-left sm:text-right text-[11px] text-slate-600 space-y-0.5 font-light">
            {personal.location && <div>{personal.location}</div>}
            {personal.email && (
              <div>
                <a href={`mailto:${personal.email}`} className="hover:text-slate-900 break-all">{personal.email}</a>
              </div>
            )}
            {personal.phone && <div className="whitespace-nowrap">{personal.phone}</div>}
            {personal.linkedin && (
              <div>
                <a href={`https://${personal.linkedin.replace(/^https?:\/\//, '')}`} target="_blank" rel="noreferrer" className="hover:text-slate-900 break-all">
                  {personal.linkedin.replace(/^https?:\/\//, '')}
                </a>
              </div>
            )}
            {personal.github && (
              <div>
                <a href={`https://${personal.github.replace(/^https?:\/\//, '')}`} target="_blank" rel="noreferrer" className="hover:text-slate-900 break-all">
                  {personal.github.replace(/^https?:\/\//, '')}
                </a>
              </div>
            )}
            {personal.website && (
              <div>
                <a href={personal.website} target="_blank" rel="noreferrer" className="hover:text-slate-900 break-all">
                  {personal.website.replace(/^https?:\/\//, '')}
                </a>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Sections with subtle Left Border Accent Rail */}
      <div className="space-y-4">
        {sectionOrder.map((sectionKey) => {
          if (isHidden(sectionKey)) return null;

          if (sectionKey === 'summary' && summary) {
            return (
              <section key="summary" className="break-inside-avoid">
                <h2
                  className="text-[11px] font-semibold uppercase tracking-widest text-slate-500 mb-1.5"
                  style={{ color: options.atsMode ? '#000' : slateColor }}
                >
                  {getSectionTitle('summary', options.language, resume)}
                </h2>
                <div className="pl-3 border-l-2 border-slate-300/80">
                  <p className="text-slate-700 leading-relaxed break-words">{summary}</p>
                </div>
              </section>
            );
          }

          if (sectionKey === 'skills' && skills && skills.length > 0) {
            return (
              <section key="skills" className="break-inside-avoid">
                <h2
                  className="text-[11px] font-semibold uppercase tracking-widest text-slate-500 mb-1.5"
                  style={{ color: options.atsMode ? '#000' : slateColor }}
                >
                  {getSectionTitle('skills', options.language, resume)}
                </h2>
                <div className="pl-3 border-l-2 border-slate-300/80 space-y-1.5">
                  {skills.map((cat, idx) => (
                    <div key={idx} className="flex flex-wrap items-baseline gap-1.5">
                      <span className="font-semibold text-slate-900 text-[11px] min-w-[110px]">
                        {cat.category}:
                      </span>
                      <span className="text-slate-700 break-words flex-1">{cat.items.join('  •  ')}</span>
                    </div>
                  ))}
                </div>
              </section>
            );
          }

          if (sectionKey === 'experience' && experience && experience.length > 0) {
            return (
              <section key="experience" className="space-y-3">
                <h2
                  className="text-[11px] font-semibold uppercase tracking-widest text-slate-500 mb-1.5"
                  style={{ color: options.atsMode ? '#000' : slateColor }}
                >
                  {getSectionTitle('experience', options.language, resume)}
                </h2>
                <div className="pl-3 border-l-2 border-slate-300/80 space-y-3">
                  {experience.map((exp) => (
                    <div key={exp.id} className="break-inside-avoid">
                      <div className="flex flex-wrap justify-between items-baseline gap-1">
                        <div>
                          <span className="font-semibold text-slate-900 text-[13px]">{exp.jobTitle}</span>
                          <span className="text-slate-600 text-xs"> — {exp.company} {exp.location ? `(${exp.location})` : ''}</span>
                        </div>
                        {(exp.startDate || exp.endDate) && (
                          <span className="text-[11px] font-mono text-slate-400 whitespace-nowrap shrink-0">
                            {exp.startDate} {exp.endDate ? `– ${exp.endDate}` : ''}
                          </span>
                        )}
                      </div>

                      {exp.description && exp.description.length > 0 && (
                        <ul className="mt-1 list-disc list-outside ml-3.5 space-y-1 text-slate-700">
                          {exp.description.map((b, i) => (
                            <li key={i} className="leading-relaxed break-words">{b}</li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            );
          }

          if (sectionKey === 'projects' && projects && projects.length > 0) {
            return (
              <section key="projects" className="space-y-2.5">
                <h2
                  className="text-[11px] font-semibold uppercase tracking-widest text-slate-500 mb-1.5"
                  style={{ color: options.atsMode ? '#000' : slateColor }}
                >
                  {getSectionTitle('projects', options.language, resume)}
                </h2>
                <div className="pl-3 border-l-2 border-slate-300/80 space-y-2">
                  {projects.map((proj) => (
                    <div key={proj.id} className="break-inside-avoid">
                      <div className="flex flex-wrap justify-between items-baseline gap-1">
                        <span className="font-semibold text-slate-900">{proj.name}</span>
                        {proj.technologies && proj.technologies.length > 0 && (
                          <span className="text-[10px] font-mono text-slate-500">
                            [{proj.technologies.join(', ')}]
                          </span>
                        )}
                      </div>
                      <p className="text-slate-700 leading-relaxed mt-0.5 break-words whitespace-pre-line">{proj.description}</p>
                    </div>
                  ))}
                </div>
              </section>
            );
          }

          if (sectionKey === 'education' && education && education.length > 0) {
            return (
              <section key="education" className="break-inside-avoid">
                <h2
                  className="text-[11px] font-semibold uppercase tracking-widest text-slate-500 mb-1.5"
                  style={{ color: options.atsMode ? '#000' : slateColor }}
                >
                  {getSectionTitle('education', options.language, resume)}
                </h2>
                <div className="pl-3 border-l-2 border-slate-300/80 space-y-1.5">
                  {education.map((edu) => (
                    <div key={edu.id} className="flex flex-wrap justify-between items-baseline gap-1">
                      <div>
                        <span className="font-semibold text-slate-900">{edu.degree} {edu.fieldOfStudy ? `in ${edu.fieldOfStudy}` : ''}</span>
                        <span className="text-slate-600 text-[11px]"> • {edu.institution}</span>
                        {edu.gpa && <span className="text-slate-500 text-[10px] ml-1">[GPA: {edu.gpa}]</span>}
                      </div>
                      {(edu.startDate || edu.endDate) && (
                        <span className="text-[11px] font-mono text-slate-400 whitespace-nowrap shrink-0">
                          {edu.startDate} {edu.endDate ? `– ${edu.endDate}` : ''}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            );
          }

          if (sectionKey === 'certifications' && certifications && certifications.length > 0) {
            return (
              <section key="certifications" className="break-inside-avoid">
                <h2
                  className="text-[11px] font-semibold uppercase tracking-widest text-slate-500 mb-1.5"
                  style={{ color: options.atsMode ? '#000' : slateColor }}
                >
                  {getSectionTitle('certifications', options.language, resume)}
                </h2>
                <div className="pl-3 border-l-2 border-slate-300/80 space-y-1">
                  {certifications.map((cert) => (
                    <div key={cert.id} className="flex flex-wrap justify-between items-baseline gap-1">
                      <span className="text-slate-800 font-medium">
                        {cert.name} {cert.issuer ? `— ${cert.issuer}` : ''}
                      </span>
                      {cert.date && <span className="text-[11px] font-mono text-slate-400">{cert.date}</span>}
                    </div>
                  ))}
                </div>
              </section>
            );
          }

          if (sectionKey === 'languages' && languages && languages.length > 0) {
            return (
              <section key="languages" className="break-inside-avoid">
                <h2
                  className="text-[11px] font-semibold uppercase tracking-widest text-slate-500 mb-1.5"
                  style={{ color: options.atsMode ? '#000' : slateColor }}
                >
                  {getSectionTitle('languages', options.language, resume)}
                </h2>
                <div className="pl-3 border-l-2 border-slate-300/80">
                  <p className="text-slate-700">
                    {languages.map((l) => `${l.language}${l.level ? ` (${l.level})` : ''}`).join('  •  ')}
                  </p>
                </div>
              </section>
            );
          }

          if (sectionKey === 'additional' && additionalSections && additionalSections.length > 0) {
            return (
              <React.Fragment key="additional">
                {additionalSections.map((sec) => (
                  <section key={sec.id} className="break-inside-avoid">
                    <h2
                      className="text-[11px] font-semibold uppercase tracking-widest text-slate-500 mb-1.5"
                      style={{ color: options.atsMode ? '#000' : slateColor }}
                    >
                      {sec.title}
                    </h2>
                    <div className="pl-3 border-l-2 border-slate-300/80 text-slate-700 leading-relaxed break-words whitespace-pre-line">
                      {sec.content}
                    </div>
                  </section>
                ))}
              </React.Fragment>
            );
          }

          return null;
        })}
      </div>
    </div>
  );
};
