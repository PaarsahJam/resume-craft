import React from 'react';
import { Resume, TemplateOptions } from '../../types';
import { getSectionTitle } from '../../lib/i18n';

interface TemplateProps {
  resume: Resume;
  options: TemplateOptions;
}

export const TwoColumnTemplate: React.FC<TemplateProps> = ({ resume, options }) => {
  const { personal, summary, skills, experience, projects, education, certifications, languages, additionalSections, hiddenSections } = resume;
  const isHidden = (sec: string) => hiddenSections?.includes(sec);

  const accentColor = options.accentColor || '#0f766e';

  return (
    <div className="w-full text-slate-800 leading-normal flex min-h-full break-words">
      {/* Left Sidebar */}
      <aside className="w-1/3 bg-slate-900 text-slate-100 p-5 shrink-0 min-w-0 flex flex-col justify-between break-words" style={{ backgroundColor: options.atsMode ? '#18181b' : accentColor }}>
        <div>
          {/* Photo in Sidebar */}
          {personal.photo?.dataUrl && personal.photo.shape !== 'none' && !options.atsMode && (
            <div className="mb-5 flex justify-center">
              <img
                src={personal.photo.dataUrl}
                alt={personal.fullName}
                className={`w-28 h-28 object-cover border-2 border-white/20 ${
                  personal.photo.shape === 'circle'
                    ? 'rounded-full'
                    : personal.photo.shape === 'rounded'
                    ? 'rounded-xl'
                    : 'rounded-none'
                }`}
              />
            </div>
          )}

          {/* Name in Sidebar */}
          <h1 className="text-xl font-bold text-white tracking-tight leading-tight break-words">
            {personal.fullName || 'Your Name'}
          </h1>
          {personal.headline && (
            <p className="text-xs text-white/80 font-medium mt-1 leading-snug break-words">{personal.headline}</p>
          )}

          {/* Contact Details */}
          <div className="mt-5 pt-4 border-t border-white/20 space-y-2 text-xs text-white/90 break-words">
            {personal.email && <div className="break-all">📧 {personal.email}</div>}
            {personal.phone && <div className="whitespace-nowrap">📱 {personal.phone}</div>}
            {personal.location && <div>📍 {personal.location}</div>}
            {personal.github && <div className="break-all">🔗 {personal.github}</div>}
            {personal.linkedin && <div className="break-all">💼 {personal.linkedin}</div>}
            {personal.website && <div className="break-all">🌐 {personal.website.replace(/^https?:\/\//, '')}</div>}
          </div>

          {/* Skills in Sidebar */}
          {!isHidden('skills') && skills && skills.length > 0 && (
            <div className="mt-6 pt-4 border-t border-white/20">
              <h2 className="text-xs font-bold uppercase tracking-wider text-white mb-3">
                {getSectionTitle('skills', options.language, resume)}
              </h2>
              <div className="space-y-2 text-xs">
                {skills.map((sk, idx) => (
                  <div key={idx}>
                    <div className="font-semibold text-white/90 text-[11px]">{sk.category}</div>
                    <div className="text-white/70 text-[11px] leading-relaxed">{sk.items.join(', ')}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Languages in Sidebar */}
          {!isHidden('languages') && languages && languages.length > 0 && (
            <div className="mt-6 pt-4 border-t border-white/20">
              <h2 className="text-xs font-bold uppercase tracking-wider text-white mb-2">
                {getSectionTitle('languages', options.language, resume)}
              </h2>
              <div className="space-y-1 text-xs text-white/80">
                {languages.map((l, idx) => (
                  <div key={idx}>
                    <span className="font-medium text-white">{l.language}</span>
                    {l.level ? ` (${l.level})` : ''}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Certifications in Sidebar */}
          {!isHidden('certifications') && certifications && certifications.length > 0 && (
            <div className="mt-6 pt-4 border-t border-white/20">
              <h2 className="text-xs font-bold uppercase tracking-wider text-white mb-2">
                {getSectionTitle('certifications', options.language, resume)}
              </h2>
              <div className="space-y-1.5 text-xs text-white/80">
                {certifications.map((cert) => (
                  <div key={cert.id}>
                    <div className="font-medium text-white">{cert.name}</div>
                    <div className="text-[10px] text-white/60">{cert.issuer} {cert.date ? `• ${cert.date}` : ''}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* Main Content Column */}
      <main className="w-2/3 p-6 flex-1 min-w-0 bg-white break-words">
        {/* Summary */}
        {!isHidden('summary') && summary && (
          <section className="mb-6 break-inside-avoid">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 border-b border-slate-200 pb-1">
              {getSectionTitle('summary', options.language, resume)}
            </h2>
            <p className="text-xs text-slate-700 leading-relaxed break-words">{summary}</p>
          </section>
        )}

        {/* Experience */}
        {!isHidden('experience') && experience && experience.length > 0 && (
          <section className="mb-6">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 border-b border-slate-200 pb-1">
              {getSectionTitle('experience', options.language, resume)}
            </h2>
            <div className="space-y-4">
              {experience.map((exp) => (
                <div key={exp.id} className="break-inside-avoid">
                  <div className="flex justify-between items-start gap-2">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-bold text-slate-900 break-words">{exp.jobTitle}</h3>
                      <div className="text-xs font-medium text-slate-600 break-words">{exp.company} {exp.location ? `(${exp.location})` : ''}</div>
                    </div>
                    <span className="text-[11px] font-semibold text-slate-400 whitespace-nowrap shrink-0">
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
        )}

        {/* Projects */}
        {!isHidden('projects') && projects && projects.length > 0 && (
          <section className="mb-6">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 border-b border-slate-200 pb-1">
              {getSectionTitle('projects', options.language, resume)}
            </h2>
            <div className="space-y-3">
              {projects.map((proj) => (
                <div key={proj.id} className="break-inside-avoid text-xs">
                  <div className="flex justify-between font-bold text-slate-900">
                    <span>{proj.name}</span>
                    {proj.technologies && (
                      <span className="font-normal text-slate-400 text-[10px]">{proj.technologies.join(', ')}</span>
                    )}
                  </div>
                  <p className="text-slate-600 mt-1">{proj.description}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Education */}
        {!isHidden('education') && education && education.length > 0 && (
          <section className="mb-6 break-inside-avoid">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 border-b border-slate-200 pb-1">
              {getSectionTitle('education', options.language, resume)}
            </h2>
            <div className="space-y-2 text-xs">
              {education.map((edu) => (
                <div key={edu.id} className="flex justify-between items-baseline">
                  <div>
                    <span className="font-bold text-slate-900">{edu.institution}</span>
                    <div className="text-slate-600">{edu.degree}</div>
                  </div>
                  <span className="text-slate-400 text-[11px]">{edu.dates}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Additional Sections */}
        {additionalSections && additionalSections.length > 0 && (
          <div className="space-y-4">
            {additionalSections.map((sec) => (
              <section key={sec.id} className="mb-6 break-inside-avoid">
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 border-b border-slate-200 pb-1">
                  {sec.title}
                </h2>
                <p className="text-xs text-slate-700 whitespace-pre-wrap">{sec.content}</p>
              </section>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};
