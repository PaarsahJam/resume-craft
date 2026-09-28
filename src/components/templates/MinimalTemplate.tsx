import React from 'react';
import { Resume, TemplateOptions } from '../../types';
import { getSectionTitle } from '../../lib/i18n';

interface TemplateProps {
  resume: Resume;
  options: TemplateOptions;
}

export const MinimalTemplate: React.FC<TemplateProps> = ({ resume, options }) => {
  const { personal, summary, skills, experience, projects, education, certifications, languages, additionalSections, sectionOrder, hiddenSections } = resume;
  const isHidden = (sec: string) => hiddenSections?.includes(sec);

  return (
    <div className="w-full text-zinc-900 leading-normal break-words">
      {/* Minimal Header */}
      <header className="mb-6 pb-4 border-b border-zinc-200">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <h1 className="text-3xl font-light tracking-wide uppercase text-zinc-900 break-words">
              {personal.fullName || 'Your Name'}
            </h1>
            {personal.headline && (
              <p className="text-xs uppercase tracking-widest text-zinc-500 font-medium mt-1 break-words">
                {personal.headline}
              </p>
            )}

            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-zinc-600 mt-3 font-mono break-words">
              {personal.email && <span className="break-all">{personal.email}</span>}
              {personal.phone && <span className="whitespace-nowrap">• {personal.phone}</span>}
              {personal.location && <span>• {personal.location}</span>}
              {personal.github && <span className="break-all">• {personal.github}</span>}
              {personal.linkedin && <span className="break-all">• {personal.linkedin}</span>}
              {personal.website && <span className="break-all">• {personal.website.replace(/^https?:\/\//, '')}</span>}
            </div>
          </div>

          {personal.photo?.dataUrl && personal.photo.shape !== 'none' && !options.atsMode && (
            <div className="shrink-0">
              <img
                src={personal.photo.dataUrl}
                alt={personal.fullName}
                className={`w-20 h-20 object-cover border border-zinc-300 ${
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
              <section key="summary" className="mb-6 break-inside-avoid">
                <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-2">
                  {getSectionTitle('summary', options.language, resume)}
                </h2>
                <p className="text-sm font-normal text-zinc-800 leading-relaxed">{summary}</p>
              </section>
            );

          case 'skills':
            if (!skills || skills.length === 0) return null;
            return (
              <section key="skills" className="mb-6 break-inside-avoid">
                <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-2">
                  {getSectionTitle('skills', options.language, resume)}
                </h2>
                <div className="space-y-1 text-xs">
                  {skills.map((sk, idx) => (
                    <div key={idx} className="flex gap-2">
                      <span className="font-semibold text-zinc-900 min-w-[120px]">{sk.category}</span>
                      <span className="text-zinc-700">{sk.items.join(', ')}</span>
                    </div>
                  ))}
                </div>
              </section>
            );

          case 'experience':
            if (!experience || experience.length === 0) return null;
            return (
              <section key="experience" className="mb-6">
                <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-3">
                  {getSectionTitle('experience', options.language, resume)}
                </h2>
                <div className="space-y-4">
                  {experience.map((exp) => (
                    <div key={exp.id} className="break-inside-avoid">
                      <div className="flex justify-between items-baseline">
                        <h3 className="text-sm font-semibold text-zinc-900">
                          {exp.jobTitle} <span className="font-normal text-zinc-500">— {exp.company}</span>
                        </h3>
                        <span className="text-xs font-mono text-zinc-500">
                          {exp.startDate} {exp.endDate ? `– ${exp.endDate}` : ''}
                        </span>
                      </div>
                      {exp.description && exp.description.length > 0 && (
                        <ul className="mt-1.5 list-disc list-outside ml-4 space-y-1 text-xs text-zinc-700">
                          {exp.description.map((bullet, bIdx) => (
                            <li key={bIdx}>{bullet}</li>
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
              <section key="projects" className="mb-6">
                <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-3">
                  {getSectionTitle('projects', options.language, resume)}
                </h2>
                <div className="space-y-3">
                  {projects.map((proj) => (
                    <div key={proj.id} className="break-inside-avoid">
                      <div className="flex justify-between items-baseline text-xs">
                        <span className="font-semibold text-zinc-900">{proj.name}</span>
                        {proj.technologies && proj.technologies.length > 0 && (
                          <span className="font-mono text-zinc-400 text-[10px]">{proj.technologies.join(' / ')}</span>
                        )}
                      </div>
                      <p className="text-xs text-zinc-700 mt-0.5">{proj.description}</p>
                    </div>
                  ))}
                </div>
              </section>
            );

          case 'education':
            if (!education || education.length === 0) return null;
            return (
              <section key="education" className="mb-6 break-inside-avoid">
                <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-2">
                  {getSectionTitle('education', options.language, resume)}
                </h2>
                <div className="space-y-2 text-xs">
                  {education.map((edu) => (
                    <div key={edu.id} className="flex justify-between items-baseline">
                      <div>
                        <span className="font-semibold text-zinc-900">{edu.institution}</span>, {edu.degree}
                      </div>
                      <span className="font-mono text-zinc-500">{edu.dates}</span>
                    </div>
                  ))}
                </div>
              </section>
            );

          case 'certifications':
            if (!certifications || certifications.length === 0) return null;
            return (
              <section key="certifications" className="mb-6 break-inside-avoid">
                <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-2">
                  {getSectionTitle('certifications', options.language, resume)}
                </h2>
                <div className="space-y-1 text-xs">
                  {certifications.map((cert) => (
                    <div key={cert.id} className="flex justify-between">
                      <span className="font-medium text-zinc-900">{cert.name} {cert.issuer ? `(${cert.issuer})` : ''}</span>
                      <span className="font-mono text-zinc-500">{cert.date}</span>
                    </div>
                  ))}
                </div>
              </section>
            );

          case 'languages':
            if (!languages || languages.length === 0) return null;
            return (
              <section key="languages" className="mb-6 break-inside-avoid">
                <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-2">
                  {getSectionTitle('languages', options.language, resume)}
                </h2>
                <p className="text-xs text-zinc-800">
                  {languages.map((l) => `${l.language} (${l.level || 'Fluent'})`).join(', ')}
                </p>
              </section>
            );

          case 'additional':
            if (!additionalSections || additionalSections.length === 0) return null;
            return (
              <div key="additional" className="space-y-4">
                {additionalSections.map((sec) => (
                  <section key={sec.id} className="mb-6 break-inside-avoid">
                    <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-2">
                      {sec.title}
                    </h2>
                    <p className="text-xs text-zinc-700 whitespace-pre-wrap">{sec.content}</p>
                  </section>
                ))}
              </div>
            );

          default:
            return null;
        }
      })}

    </div>
  );
};
