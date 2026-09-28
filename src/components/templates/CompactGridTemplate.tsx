import React from 'react';
import { Resume, TemplateOptions } from '../../types';
import { getSectionTitle } from '../../lib/i18n';
import { Mail, Phone, MapPin, Globe, Github, Linkedin, ExternalLink, Award } from 'lucide-react';

interface CompactGridTemplateProps {
  resume: Resume;
  options: TemplateOptions;
}

export const CompactGridTemplate: React.FC<CompactGridTemplateProps> = ({ resume, options }) => {
  const { personal, summary, skills, experience, projects, education, certifications, languages, additionalSections, hiddenSections, sectionOrder } = resume;

  const isHidden = (sec: string) => hiddenSections?.includes(sec);
  const accentColor = options.accentColor || '#0284c7';

  return (
    <div className="w-full text-slate-800 leading-normal break-words font-sans text-xs">
      {/* Header with high density metadata grid */}
      <header className="pb-4 mb-4 border-b border-slate-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            {personal.photo?.dataUrl && personal.photo.shape !== 'none' && !options.atsMode && (
              <img
                src={personal.photo.dataUrl}
                alt={personal.fullName}
                className={`w-14 h-14 object-cover border border-slate-200 shadow-xs shrink-0 ${
                  personal.photo.shape === 'circle'
                    ? 'rounded-full'
                    : personal.photo.shape === 'rounded'
                    ? 'rounded-xl'
                    : 'rounded-none'
                }`}
              />
            )}
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-950 break-words">
                {personal.fullName || 'Your Name'}
              </h1>
              {personal.headline && (
                <p className="text-xs font-semibold text-slate-600 mt-0.5 break-words">
                  {personal.headline}
                </p>
              )}
            </div>
          </div>

          {/* Quick contact pills */}
          <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-slate-600">
            {personal.location && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-slate-100 rounded-md border border-slate-200/80">
                <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                {personal.location}
              </span>
            )}
            {personal.email && (
              <a
                href={`mailto:${personal.email}`}
                className="inline-flex items-center gap-1 px-2 py-0.5 bg-slate-100 hover:bg-slate-200 rounded-md border border-slate-200/80 text-slate-700 break-all"
              >
                <Mail className="w-3 h-3 text-slate-400 shrink-0" />
                {personal.email}
              </a>
            )}
            {personal.phone && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-slate-100 rounded-md border border-slate-200/80 whitespace-nowrap">
                <Phone className="w-3 h-3 text-slate-400 shrink-0" />
                {personal.phone}
              </span>
            )}
            {personal.linkedin && (
              <a
                href={`https://${personal.linkedin.replace(/^https?:\/\//, '')}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 px-2 py-0.5 bg-slate-100 hover:bg-slate-200 rounded-md border border-slate-200/80 text-slate-700 break-all"
              >
                <Linkedin className="w-3 h-3 text-slate-400 shrink-0" />
                {personal.linkedin.replace(/^https?:\/\//, '')}
              </a>
            )}
            {personal.github && (
              <a
                href={`https://${personal.github.replace(/^https?:\/\//, '')}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 px-2 py-0.5 bg-slate-100 hover:bg-slate-200 rounded-md border border-slate-200/80 text-slate-700 break-all"
              >
                <Github className="w-3 h-3 text-slate-400 shrink-0" />
                {personal.github.replace(/^https?:\/\//, '')}
              </a>
            )}
            {personal.website && (
              <a
                href={personal.website}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 px-2 py-0.5 bg-slate-100 hover:bg-slate-200 rounded-md border border-slate-200/80 text-slate-700 break-all"
              >
                <Globe className="w-3 h-3 text-slate-400 shrink-0" />
                {personal.website.replace(/^https?:\/\//, '')}
              </a>
            )}
          </div>
        </div>
      </header>

      {/* Structured Sections */}
      <div className="space-y-3.5">
        {sectionOrder.map((sectionKey) => {
          if (isHidden(sectionKey)) return null;

          if (sectionKey === 'summary' && summary) {
            return (
              <section key="summary" className="break-inside-avoid">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="w-1.5 h-3.5 rounded-xs" style={{ backgroundColor: options.atsMode ? '#000' : accentColor }} />
                  <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                    {getSectionTitle('summary', options.language, resume)}
                  </h2>
                </div>
                <p className="text-slate-700 leading-relaxed pl-3.5 break-words">{summary}</p>
              </section>
            );
          }

          if (sectionKey === 'skills' && skills && skills.length > 0) {
            return (
              <section key="skills" className="break-inside-avoid">
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-1.5 h-3.5 rounded-xs" style={{ backgroundColor: options.atsMode ? '#000' : accentColor }} />
                  <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                    {getSectionTitle('skills', options.language, resume)}
                  </h2>
                </div>
                <div className="pl-3.5 grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {skills.map((cat, idx) => (
                    <div key={idx} className="p-2 bg-slate-50 rounded-lg border border-slate-200/70">
                      <div className="font-bold text-[11px] text-slate-900 mb-1 flex items-center gap-1">
                        <span className="w-1 h-1 rounded-full bg-slate-400" />
                        {cat.category}
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {cat.items.map((item, iIdx) => (
                          <span
                            key={iIdx}
                            className="px-1.5 py-0.5 bg-white text-[10px] font-medium text-slate-700 rounded border border-slate-200/60 shadow-2xs"
                          >
                            {item}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            );
          }

          if (sectionKey === 'experience' && experience && experience.length > 0) {
            return (
              <section key="experience" className="space-y-2.5">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="w-1.5 h-3.5 rounded-xs" style={{ backgroundColor: options.atsMode ? '#000' : accentColor }} />
                  <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                    {getSectionTitle('experience', options.language, resume)}
                  </h2>
                </div>
                <div className="pl-3.5 space-y-3">
                  {experience.map((exp) => (
                    <div key={exp.id} className="break-inside-avoid">
                      <div className="flex flex-wrap items-baseline justify-between gap-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-bold text-slate-950 text-xs break-words">
                            {exp.jobTitle}
                          </span>
                          <span className="px-1.5 py-0.2 bg-slate-100 text-slate-700 font-semibold text-[11px] rounded border border-slate-200">
                            {exp.company}
                          </span>
                          {exp.location && (
                            <span className="text-[11px] text-slate-500">
                              • {exp.location}
                            </span>
                          )}
                        </div>
                        {(exp.startDate || exp.endDate) && (
                          <span className="text-[11px] font-mono text-slate-500 whitespace-nowrap shrink-0">
                            {exp.startDate} {exp.endDate ? `– ${exp.endDate}` : ''}
                          </span>
                        )}
                      </div>

                      {exp.description && exp.description.length > 0 && (
                        <ul className="mt-1 list-disc list-outside ml-3.5 space-y-0.5 text-slate-700">
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
              <section key="projects" className="space-y-2">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="w-1.5 h-3.5 rounded-xs" style={{ backgroundColor: options.atsMode ? '#000' : accentColor }} />
                  <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                    {getSectionTitle('projects', options.language, resume)}
                  </h2>
                </div>
                <div className="pl-3.5 grid grid-cols-1 gap-2">
                  {projects.map((proj) => (
                    <div key={proj.id} className="p-2.5 bg-slate-50/60 rounded-lg border border-slate-200/60 break-inside-avoid">
                      <div className="flex flex-wrap items-baseline justify-between gap-1 mb-1">
                        <span className="font-bold text-slate-900 flex items-center gap-1.5">
                          {proj.name}
                          {proj.url && (
                            <a href={proj.url} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline inline-flex items-center gap-0.5 text-[10px]">
                              <ExternalLink className="w-2.5 h-2.5" />
                            </a>
                          )}
                        </span>
                        {proj.technologies && proj.technologies.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {proj.technologies.map((t, tIdx) => (
                              <span key={tIdx} className="text-[10px] font-mono px-1 py-0.2 bg-white text-slate-600 rounded border border-slate-200/80">
                                {t}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      <p className="text-slate-700 leading-relaxed text-[11px] break-words whitespace-pre-line">{proj.description}</p>
                    </div>
                  ))}
                </div>
              </section>
            );
          }

          if (sectionKey === 'education' && education && education.length > 0) {
            return (
              <section key="education" className="break-inside-avoid">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="w-1.5 h-3.5 rounded-xs" style={{ backgroundColor: options.atsMode ? '#000' : accentColor }} />
                  <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                    {getSectionTitle('education', options.language, resume)}
                  </h2>
                </div>
                <div className="pl-3.5 space-y-1.5">
                  {education.map((edu) => (
                    <div key={edu.id} className="flex flex-wrap justify-between items-baseline gap-1">
                      <div>
                        <span className="font-bold text-slate-900">{edu.degree} {edu.fieldOfStudy ? `in ${edu.fieldOfStudy}` : ''}</span>
                        <span className="text-slate-600 text-[11px]"> • {edu.institution} {edu.location ? `(${edu.location})` : ''}</span>
                        {edu.gpa && <span className="text-slate-500 text-[10px] ml-1.5">[GPA: {edu.gpa}]</span>}
                      </div>
                      {(edu.startDate || edu.endDate) && (
                        <span className="text-[11px] font-mono text-slate-500 whitespace-nowrap shrink-0">
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
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="w-1.5 h-3.5 rounded-xs" style={{ backgroundColor: options.atsMode ? '#000' : accentColor }} />
                  <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                    {getSectionTitle('certifications', options.language, resume)}
                  </h2>
                </div>
                <div className="pl-3.5 flex flex-wrap gap-2">
                  {certifications.map((cert) => (
                    <span key={cert.id} className="inline-flex items-center gap-1 px-2 py-1 bg-slate-100 text-slate-800 rounded-md border border-slate-200 text-[11px]">
                      <Award className="w-3 h-3 text-amber-600 shrink-0" />
                      <strong>{cert.name}</strong> {cert.issuer ? `(${cert.issuer})` : ''} {cert.date ? `• ${cert.date}` : ''}
                    </span>
                  ))}
                </div>
              </section>
            );
          }

          if (sectionKey === 'languages' && languages && languages.length > 0) {
            return (
              <section key="languages" className="break-inside-avoid">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="w-1.5 h-3.5 rounded-xs" style={{ backgroundColor: options.atsMode ? '#000' : accentColor }} />
                  <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                    {getSectionTitle('languages', options.language, resume)}
                  </h2>
                </div>
                <div className="pl-3.5 flex flex-wrap gap-1.5">
                  {languages.map((l, i) => (
                    <span key={i} className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded text-[11px] border border-slate-200/70 font-medium">
                      {l.language}{l.level ? ` (${l.level})` : ''}
                    </span>
                  ))}
                </div>
              </section>
            );
          }

          if (sectionKey === 'additional' && additionalSections && additionalSections.length > 0) {
            return (
              <React.Fragment key="additional">
                {additionalSections.map((sec) => (
                  <section key={sec.id} className="break-inside-avoid">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="w-1.5 h-3.5 rounded-xs" style={{ backgroundColor: options.atsMode ? '#000' : accentColor }} />
                      <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                        {sec.title}
                      </h2>
                    </div>
                    <div className="pl-3.5 text-slate-700 leading-relaxed break-words whitespace-pre-line">
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
