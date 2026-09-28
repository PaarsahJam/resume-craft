import React from 'react';
import { Resume, TemplateOptions } from '../../types';
import { getSectionTitle } from '../../lib/i18n';

interface TemplateProps {
  resume: Resume;
  options: TemplateOptions;
}

export const ExecutiveTemplate: React.FC<TemplateProps> = ({ resume, options }) => {
  const { personal, summary, skills, experience, projects, education, certifications, languages, additionalSections, sectionOrder, hiddenSections } = resume;
  const isHidden = (sec: string) => hiddenSections?.includes(sec);

  const darkAccent = options.accentColor || '#1e293b';

  return (
    <div className="w-full text-stone-900 leading-normal font-serif break-words">
      {/* Executive Header */}
      <header className="pb-5 mb-5 border-b-2 border-stone-800" style={{ borderColor: darkAccent }}>
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {personal.photo?.dataUrl && personal.photo.shape !== 'none' && !options.atsMode && (
            <div className="shrink-0 mb-2 md:mb-0">
              <img
                src={personal.photo.dataUrl}
                alt={personal.fullName}
                className={`w-20 h-20 object-cover border-2 border-stone-800 ${
                  personal.photo.shape === 'circle'
                    ? 'rounded-full'
                    : personal.photo.shape === 'rounded'
                    ? 'rounded-xl'
                    : 'rounded-none'
                }`}
              />
            </div>
          )}

          <div className="flex-1 min-w-0 text-center">
            <h1 className="text-3xl font-serif font-bold tracking-wider uppercase text-stone-900 break-words" style={{ color: options.atsMode ? '#000' : darkAccent }}>
              {personal.fullName || 'Your Name'}
            </h1>
            {personal.headline && (
              <p className="text-sm font-sans uppercase tracking-widest text-stone-600 mt-1 font-semibold break-words">
                {personal.headline}
              </p>
            )}

            <div className="flex flex-wrap justify-center items-center gap-x-3 gap-y-1 text-xs font-sans text-stone-600 mt-3 break-words">
              {personal.location && <span>{personal.location}</span>}
              {personal.phone && <span className="whitespace-nowrap">| {personal.phone}</span>}
              {personal.email && <span className="break-all">| {personal.email}</span>}
              {personal.linkedin && <span className="break-all">| {personal.linkedin}</span>}
              {personal.github && <span className="break-all">| {personal.github}</span>}
              {personal.website && <span className="break-all">| {personal.website.replace(/^https?:\/\//, '')}</span>}
            </div>
          </div>
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
                <h2 className="text-xs font-sans font-bold uppercase tracking-widest border-b border-stone-300 pb-1 mb-2 text-stone-800" style={{ color: options.atsMode ? '#000' : darkAccent }}>
                  {getSectionTitle('summary', options.language, resume)}
                </h2>
                <p className="text-xs font-serif text-stone-800 leading-relaxed text-justify">{summary}</p>
              </section>
            );

          case 'skills':
            if (!skills || skills.length === 0) return null;
            return (
              <section key="skills" className="mb-5 break-inside-avoid">
                <h2 className="text-xs font-sans font-bold uppercase tracking-widest border-b border-stone-300 pb-1 mb-2 text-stone-800" style={{ color: options.atsMode ? '#000' : darkAccent }}>
                  {getSectionTitle('skills', options.language, resume)}
                </h2>
                <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-xs font-sans">
                  {skills.map((sk, idx) => (
                    <div key={idx}>
                      <strong className="font-bold text-stone-900">{sk.category}: </strong>
                      <span className="text-stone-700">{sk.items.join(', ')}</span>
                    </div>
                  ))}
                </div>
              </section>
            );

          case 'experience':
            if (!experience || experience.length === 0) return null;
            return (
              <section key="experience" className="mb-5">
                <h2 className="text-xs font-sans font-bold uppercase tracking-widest border-b border-stone-300 pb-1 mb-3 text-stone-800" style={{ color: options.atsMode ? '#000' : darkAccent }}>
                  {getSectionTitle('experience', options.language, resume)}
                </h2>
                <div className="space-y-4">
                  {experience.map((exp) => (
                    <div key={exp.id} className="break-inside-avoid">
                      <div className="flex justify-between items-baseline font-serif">
                        <h3 className="text-sm font-bold text-stone-900">
                          {exp.jobTitle}
                        </h3>
                        <span className="text-xs font-sans text-stone-600 font-semibold">
                          {exp.startDate} {exp.endDate ? `– ${exp.endDate}` : ''}
                        </span>
                      </div>
                      <div className="text-xs font-sans text-stone-700 font-medium italic mb-1">
                        {exp.company} {exp.location ? `, ${exp.location}` : ''}
                      </div>
                      {exp.description && exp.description.length > 0 && (
                        <ul className="list-disc list-outside ml-4 space-y-1 text-xs text-stone-800 leading-relaxed">
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
              <section key="projects" className="mb-5">
                <h2 className="text-xs font-sans font-bold uppercase tracking-widest border-b border-stone-300 pb-1 mb-3 text-stone-800" style={{ color: options.atsMode ? '#000' : darkAccent }}>
                  {getSectionTitle('projects', options.language, resume)}
                </h2>
                <div className="space-y-3">
                  {projects.map((proj) => (
                    <div key={proj.id} className="break-inside-avoid text-xs">
                      <div className="flex justify-between font-serif font-bold text-stone-900">
                        <span>{proj.name}</span>
                        {proj.technologies && proj.technologies.length > 0 && (
                          <span className="font-sans font-normal text-stone-500 text-[10px]">{proj.technologies.join(', ')}</span>
                        )}
                      </div>
                      <p className="text-stone-700 mt-0.5">{proj.description}</p>
                    </div>
                  ))}
                </div>
              </section>
            );

          case 'education':
            if (!education || education.length === 0) return null;
            return (
              <section key="education" className="mb-5 break-inside-avoid">
                <h2 className="text-xs font-sans font-bold uppercase tracking-widest border-b border-stone-300 pb-1 mb-2 text-stone-800" style={{ color: options.atsMode ? '#000' : darkAccent }}>
                  {getSectionTitle('education', options.language, resume)}
                </h2>
                <div className="space-y-2 text-xs">
                  {education.map((edu) => (
                    <div key={edu.id} className="flex justify-between items-baseline">
                      <div>
                        <span className="font-bold text-stone-900">{edu.institution}</span> — <span className="italic">{edu.degree}</span>
                      </div>
                      <span className="font-sans text-stone-600">{edu.dates}</span>
                    </div>
                  ))}
                </div>
              </section>
            );

          case 'certifications':
            if (!certifications || certifications.length === 0) return null;
            return (
              <section key="certifications" className="mb-5 break-inside-avoid">
                <h2 className="text-xs font-sans font-bold uppercase tracking-widest border-b border-stone-300 pb-1 mb-2 text-stone-800" style={{ color: options.atsMode ? '#000' : darkAccent }}>
                  {getSectionTitle('certifications', options.language, resume)}
                </h2>
                <div className="space-y-1 text-xs">
                  {certifications.map((cert) => (
                    <div key={cert.id} className="flex justify-between">
                      <span><strong className="font-bold">{cert.name}</strong> {cert.issuer ? `— ${cert.issuer}` : ''}</span>
                      <span className="font-sans text-stone-600">{cert.date}</span>
                    </div>
                  ))}
                </div>
              </section>
            );

          case 'languages':
            if (!languages || languages.length === 0) return null;
            return (
              <section key="languages" className="mb-5 break-inside-avoid">
                <h2 className="text-xs font-sans font-bold uppercase tracking-widest border-b border-stone-300 pb-1 mb-2 text-stone-800" style={{ color: options.atsMode ? '#000' : darkAccent }}>
                  {getSectionTitle('languages', options.language, resume)}
                </h2>
                <p className="text-xs text-stone-800">
                  {languages.map((l) => `${l.language} (${l.level || 'Fluent'})`).join(' • ')}
                </p>
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
            <section key={sec.id} className="mb-5 break-inside-avoid">
              <h2 className="text-xs font-sans font-bold uppercase tracking-widest border-b border-stone-300 pb-1 mb-2 text-stone-800" style={{ color: options.atsMode ? '#000' : darkAccent }}>
                {sec.title}
              </h2>
              <p className="text-xs text-stone-800 whitespace-pre-wrap">{sec.content}</p>
            </section>
          ))}
        </div>
      )}
    </div>
  );
};
