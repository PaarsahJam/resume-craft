import React from 'react';
import { Resume, TemplateOptions } from '../../types';
import { getSectionTitle } from '../../lib/i18n';

interface TemplateProps {
  resume: Resume;
  options: TemplateOptions;
}

export const CreativeTemplate: React.FC<TemplateProps> = ({ resume, options }) => {
  const { personal, summary, skills, experience, projects, education, certifications, languages, additionalSections, sectionOrder, hiddenSections } = resume;
  const isHidden = (sec: string) => hiddenSections?.includes(sec);

  const creativeColor = options.accentColor || '#7c3aed';

  return (
    <div className="w-full text-slate-800 leading-normal break-words">
      {/* Creative Header Banner */}
      <header className="p-6 rounded-2xl text-white mb-6 relative overflow-hidden" style={{ backgroundColor: options.atsMode ? '#0f172a' : creativeColor }}>
        <div className="flex items-center justify-between gap-4 relative z-10">
          <div className="flex-1 min-w-0">
            <h1 className="text-3xl font-extrabold tracking-tight break-words">{personal.fullName || 'Your Name'}</h1>
            {personal.headline && (
              <p className="text-sm font-medium text-white/90 mt-1 break-words">{personal.headline}</p>
            )}

            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-white/80 mt-3 font-medium break-words">
              {personal.email && <span className="break-all">📧 {personal.email}</span>}
              {personal.phone && <span className="whitespace-nowrap">📱 {personal.phone}</span>}
              {personal.location && <span>📍 {personal.location}</span>}
              {personal.github && <span className="break-all">💻 {personal.github}</span>}
              {personal.linkedin && <span className="break-all">💼 {personal.linkedin}</span>}
            </div>
          </div>

          {personal.photo?.dataUrl && personal.photo.shape !== 'none' && !options.atsMode && (
            <img
              src={personal.photo.dataUrl}
              alt={personal.fullName}
              className={`w-20 h-20 object-cover border-2 border-white/40 ${
                personal.photo.shape === 'circle'
                  ? 'rounded-full'
                  : personal.photo.shape === 'rounded'
                  ? 'rounded-xl'
                  : 'rounded-none'
              }`}
            />
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
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-2 flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: creativeColor }} />
                  {getSectionTitle('summary', options.language, resume)}
                </h2>
                <p className="text-xs text-slate-700 leading-relaxed pl-4 border-l-2 border-slate-200">{summary}</p>
              </section>
            );

          case 'skills':
            if (!skills || skills.length === 0) return null;
            return (
              <section key="skills" className="mb-6 break-inside-avoid">
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-2.5 flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: creativeColor }} />
                  {getSectionTitle('skills', options.language, resume)}
                </h2>
                <div className="space-y-2.5 pl-4">
                  {skills.map((sk, idx) => (
                    <div key={idx}>
                      <span className="text-xs font-bold text-slate-900 block mb-1">{sk.category}</span>
                      <div className="flex flex-wrap gap-1.5">
                        {sk.items.map((item, iIdx) => (
                          <span
                            key={iIdx}
                            className="px-2.5 py-1 rounded-full text-[11px] font-medium bg-slate-100 text-slate-800 border border-slate-200"
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

          case 'experience':
            if (!experience || experience.length === 0) return null;
            return (
              <section key="experience" className="mb-6">
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-3 flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: creativeColor }} />
                  {getSectionTitle('experience', options.language, resume)}
                </h2>
                <div className="space-y-4 pl-4 border-l-2 border-slate-200 ml-1">
                  {experience.map((exp) => (
                    <div key={exp.id} className="break-inside-avoid relative">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-sm font-bold text-slate-900">{exp.jobTitle}</h3>
                          <p className="text-xs font-medium text-slate-600">{exp.company} {exp.location ? `• ${exp.location}` : ''}</p>
                        </div>
                        <span className="text-xs font-semibold text-slate-400">
                          {exp.startDate} {exp.endDate ? `– ${exp.endDate}` : ''}
                        </span>
                      </div>
                      {exp.description && exp.description.length > 0 && (
                        <ul className="mt-2 list-disc list-outside ml-4 space-y-1 text-xs text-slate-700">
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
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-3 flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: creativeColor }} />
                  {getSectionTitle('projects', options.language, resume)}
                </h2>
                <div className="grid grid-cols-1 gap-3 pl-4">
                  {projects.map((proj) => (
                    <div key={proj.id} className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 break-inside-avoid">
                      <div className="flex justify-between items-baseline">
                        <span className="font-bold text-slate-900 text-xs">{proj.name}</span>
                        {proj.technologies && (
                          <span className="text-[10px] text-slate-500 font-mono">{proj.technologies.join(' • ')}</span>
                        )}
                      </div>
                      <p className="text-xs text-slate-600 mt-1">{proj.description}</p>
                    </div>
                  ))}
                </div>
              </section>
            );

          case 'education':
            if (!education || education.length === 0) return null;
            return (
              <section key="education" className="mb-6 break-inside-avoid">
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-2 flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: creativeColor }} />
                  {getSectionTitle('education', options.language, resume)}
                </h2>
                <div className="space-y-2 text-xs pl-4">
                  {education.map((edu) => (
                    <div key={edu.id} className="flex justify-between items-baseline">
                      <div>
                        <span className="font-bold text-slate-900">{edu.institution}</span> — {edu.degree}
                      </div>
                      <span className="text-slate-500">{edu.dates}</span>
                    </div>
                  ))}
                </div>
              </section>
            );

          case 'certifications':
            if (!certifications || certifications.length === 0) return null;
            return (
              <section key="certifications" className="mb-6 break-inside-avoid">
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-2 flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: creativeColor }} />
                  {getSectionTitle('certifications', options.language, resume)}
                </h2>
                <div className="space-y-1 text-xs pl-4">
                  {certifications.map((cert) => (
                    <div key={cert.id} className="flex justify-between">
                      <span className="font-medium text-slate-900">{cert.name} {cert.issuer ? `(${cert.issuer})` : ''}</span>
                      <span className="text-slate-500">{cert.date}</span>
                    </div>
                  ))}
                </div>
              </section>
            );

          case 'languages':
            if (!languages || languages.length === 0) return null;
            return (
              <section key="languages" className="mb-6 break-inside-avoid">
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-2 flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: creativeColor }} />
                  {getSectionTitle('languages', options.language, resume)}
                </h2>
                <div className="flex flex-wrap gap-2 text-xs pl-4">
                  {languages.map((l, idx) => (
                    <span key={idx} className="px-2.5 py-0.5 rounded bg-slate-100 text-slate-800 text-[11px] font-medium border border-slate-200">
                      {l.language} ({l.level || 'Fluent'})
                    </span>
                  ))}
                </div>
              </section>
            );

          default:
            return null;
        }
      })}

      {/* Additional Sections */}
      {additionalSections && additionalSections.length > 0 && (
        <div className="space-y-4">
          {additionalSections.map((sec) => (
            <section key={sec.id} className="mb-6 break-inside-avoid">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-2 flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: creativeColor }} />
                {sec.title}
              </h2>
              <p className="text-xs text-slate-700 whitespace-pre-wrap pl-4">{sec.content}</p>
            </section>
          ))}
        </div>
      )}
    </div>
  );
};
