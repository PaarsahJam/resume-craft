import React from 'react';
import { Resume, TemplateOptions } from '../../types';
import { Mail, Phone, MapPin, Globe, Github, Linkedin, ExternalLink, AlertTriangle } from 'lucide-react';
import { getSectionTitle } from '../../lib/i18n';

interface TemplateProps {
  resume: Resume;
  options: TemplateOptions;
}

export const ModernTechTemplate: React.FC<TemplateProps> = ({ resume, options }) => {
  const { personal, summary, skills, experience, projects, education, certifications, languages, additionalSections, sectionOrder, hiddenSections } = resume;
  const isHidden = (sec: string) => hiddenSections?.includes(sec);

  const primaryColor = options.accentColor || '#2563eb';

  return (
    <div className="w-full text-slate-800 leading-normal break-words">
      {/* Header */}
      <header className="border-b-2 border-slate-200 pb-5 mb-5" style={{ borderColor: primaryColor }}>
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 break-words" style={{ color: options.atsMode ? '#000' : primaryColor }}>
              {personal.fullName || 'Your Name'}
            </h1>
            {personal.headline && (
              <p className="text-lg font-medium text-slate-600 mt-1 break-words">{personal.headline}</p>
            )}

            {/* Contact details row */}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-slate-600 mt-3 font-medium break-words">
              {personal.email && (
                <span className="flex items-center gap-1 min-w-0">
                  <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <a href={`mailto:${personal.email}`} className="hover:underline break-all">{personal.email}</a>
                </span>
              )}
              {personal.phone && (
                <span className="flex items-center gap-1 min-w-0">
                  <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="whitespace-nowrap">{personal.phone}</span>
                </span>
              )}
              {personal.location && (
                <span className="flex items-center gap-1 min-w-0">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="break-words">{personal.location}</span>
                </span>
              )}
              {personal.website && (
                <span className="flex items-center gap-1 min-w-0">
                  <Globe className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <a href={personal.website} target="_blank" rel="noreferrer" className="hover:underline break-all">{personal.website.replace(/^https?:\/\//, '')}</a>
                </span>
              )}
              {personal.github && (
                <span className="flex items-center gap-1 min-w-0">
                  <Github className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <a href={`https://${personal.github.replace(/^https?:\/\//, '')}`} target="_blank" rel="noreferrer" className="hover:underline break-all">{personal.github}</a>
                </span>
              )}
              {personal.linkedin && (
                <span className="flex items-center gap-1 min-w-0">
                  <Linkedin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <a href={`https://${personal.linkedin.replace(/^https?:\/\//, '')}`} target="_blank" rel="noreferrer" className="hover:underline break-all">{personal.linkedin}</a>
                </span>
              )}
            </div>
          </div>

          {/* Optional Photo */}
          {personal.photo?.dataUrl && personal.photo.shape !== 'none' && !options.atsMode && (
            <div className="shrink-0">
              <img
                src={personal.photo.dataUrl}
                alt={personal.fullName}
                className={`w-20 h-20 object-cover border-2 border-slate-200 ${
                  personal.photo.shape === 'circle'
                    ? 'rounded-full'
                    : personal.photo.shape === 'rounded'
                    ? 'rounded-xl'
                    : 'rounded-none'
                }`}
              />
            </div>
          )}
        </div>
      </header>

      {/* Ordered Sections */}
      {sectionOrder.map((sec) => {
        if (isHidden(sec)) return null;

        switch (sec) {
          case 'summary':
            if (!summary) return null;
            return (
              <section key="summary" className="mb-5 break-inside-avoid">
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 border-b border-slate-200 pb-1" style={{ color: options.atsMode ? '#000' : primaryColor }}>
                  {getSectionTitle('summary', options.language, resume)}
                </h2>
                <p className="text-sm text-slate-700 leading-relaxed">{summary}</p>
              </section>
            );

          case 'skills':
            if (!skills || skills.length === 0) return null;
            return (
              <section key="skills" className="mb-5 break-inside-avoid">
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2.5 border-b border-slate-200 pb-1" style={{ color: options.atsMode ? '#000' : primaryColor }}>
                  {getSectionTitle('skills', options.language, resume)}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2">
                  {skills.map((sk, idx) => (
                    <div key={idx} className="text-xs">
                      <span className="font-bold text-slate-900">{sk.category}: </span>
                      <span className="text-slate-700">{sk.items.join(', ')}</span>
                    </div>
                  ))}
                </div>
              </section>
            );

          case 'experience':
            if (!experience || experience.length === 0) return null;
            return (
              <section key="experience" className="mb-5">
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 border-b border-slate-200 pb-1" style={{ color: options.atsMode ? '#000' : primaryColor }}>
                  {getSectionTitle('experience', options.language, resume)}
                </h2>
                <div className="space-y-4">
                  {experience.map((exp) => (
                    <div key={exp.id} className="break-inside-avoid">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm font-bold text-slate-900 flex flex-wrap items-center gap-1.5 break-words">
                            {exp.jobTitle}
                            {exp.flagged && (
                              <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-medium bg-amber-100 text-amber-800 border border-amber-200">
                                <AlertTriangle className="w-3 h-3 text-amber-600" />
                                Needs Review
                              </span>
                            )}
                          </h3>
                          <p className="text-xs font-medium text-slate-700 break-words">
                            {exp.company} {exp.location ? `• ${exp.location}` : ''}
                          </p>
                        </div>
                        {(exp.startDate || exp.endDate) && (
                          <span className="text-xs font-semibold text-slate-500 whitespace-nowrap shrink-0">
                            {exp.startDate} {exp.endDate ? `– ${exp.endDate}` : ''}
                          </span>
                        )}
                      </div>
                      {exp.description && exp.description.length > 0 && (
                        <ul className="mt-1.5 list-disc list-outside ml-4 space-y-1 text-xs text-slate-700 break-words">
                          {exp.description.map((bullet, bIdx) => (
                            <li key={bIdx} className="leading-relaxed break-words">{bullet}</li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            );

          case 'projects':
            if (!projects || projects.length === 0) return null;
            return (
              <section key="projects" className="mb-5">
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 border-b border-slate-200 pb-1" style={{ color: options.atsMode ? '#000' : primaryColor }}>
                  {getSectionTitle('projects', options.language, resume)}
                </h2>
                <div className="space-y-3">
                  {projects.map((proj) => (
                    <div key={proj.id} className="break-inside-avoid">
                      <div className="flex flex-wrap items-baseline justify-between gap-2">
                        <span className="text-sm font-bold text-slate-900 flex items-center gap-1 min-w-0 break-words">
                          {proj.name}
                          {proj.url && (
                            <a href={proj.url} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline inline-flex items-center">
                              <ExternalLink className="w-3 h-3 ml-0.5" />
                            </a>
                          )}
                        </span>
                        {proj.technologies && proj.technologies.length > 0 && (
                          <span className="text-[11px] font-mono text-slate-500 break-words">
                            [{proj.technologies.join(', ')}]
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-700 mt-1 leading-relaxed break-words">{proj.description}</p>
                    </div>
                  ))}
                </div>
              </section>
            );

          case 'education':
            if (!education || education.length === 0) return null;
            return (
              <section key="education" className="mb-5">
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2.5 border-b border-slate-200 pb-1" style={{ color: options.atsMode ? '#000' : primaryColor }}>
                  {getSectionTitle('education', options.language, resume)}
                </h2>
                <div className="space-y-2">
                  {education.map((edu) => (
                    <div key={edu.id} className="break-inside-avoid flex items-start justify-between text-xs">
                      <div>
                        <span className="font-bold text-slate-900">{edu.institution}</span>
                        <span className="text-slate-600 font-medium"> — {edu.degree}</span>
                        {edu.description && <p className="text-slate-500 mt-0.5">{edu.description}</p>}
                      </div>
                      {edu.dates && <span className="font-semibold text-slate-500 whitespace-nowrap">{edu.dates}</span>}
                    </div>
                  ))}
                </div>
              </section>
            );

          case 'certifications':
            if (!certifications || certifications.length === 0) return null;
            return (
              <section key="certifications" className="mb-5 break-inside-avoid">
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 border-b border-slate-200 pb-1" style={{ color: options.atsMode ? '#000' : primaryColor }}>
                  {getSectionTitle('certifications', options.language, resume)}
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {certifications.map((cert) => (
                    <div key={cert.id} className="flex justify-between items-center bg-slate-50 p-2 rounded border border-slate-100">
                      <div>
                        <div className="font-bold text-slate-900">{cert.name}</div>
                        {cert.issuer && <div className="text-slate-500">{cert.issuer}</div>}
                      </div>
                      {cert.date && <div className="text-slate-400 font-mono text-[10px]">{cert.date}</div>}
                    </div>
                  ))}
                </div>
              </section>
            );

          case 'languages':
            if (!languages || languages.length === 0) return null;
            return (
              <section key="languages" className="mb-5 break-inside-avoid">
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 border-b border-slate-200 pb-1" style={{ color: options.atsMode ? '#000' : primaryColor }}>
                  {getSectionTitle('languages', options.language, resume)}
                </h2>
                <div className="flex flex-wrap gap-4 text-xs">
                  {languages.map((lang, idx) => (
                    <span key={idx} className="text-slate-800">
                      <strong className="font-semibold text-slate-900">{lang.language}</strong>
                      {lang.level ? ` (${lang.level})` : ''}
                    </span>
                  ))}
                </div>
              </section>
            );

          default:
            return null;
        }
      })}

      {/* Additional Custom Sections */}
      {additionalSections && additionalSections.length > 0 && (
        <div className="space-y-4">
          {additionalSections.map((sec) => (
            <section key={sec.id} className="mb-5 break-inside-avoid">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 border-b border-slate-200 pb-1" style={{ color: options.atsMode ? '#000' : primaryColor }}>
                {sec.title}
              </h2>
              <p className="text-xs text-slate-700 whitespace-pre-wrap leading-relaxed">{sec.content}</p>
            </section>
          ))}
        </div>
      )}
    </div>
  );
};
