import React from 'react';
import { Resume, TemplateOptions } from '../../types';
import { getSectionTitle } from '../../lib/i18n';

interface IvyLeagueTemplateProps {
  resume: Resume;
  options: TemplateOptions;
}

export const IvyLeagueTemplate: React.FC<IvyLeagueTemplateProps> = ({ resume, options }) => {
  const { personal, summary, skills, experience, projects, education, certifications, languages, additionalSections, hiddenSections, sectionOrder } = resume;

  const isHidden = (sec: string) => hiddenSections?.includes(sec);
  const accentColor = options.accentColor || '#1e293b';

  return (
    <div className="w-full text-stone-900 leading-normal font-serif break-words">
      {/* Header - Classic Ivy League Centered */}
      <header className="text-center pb-4 mb-4 border-b border-stone-800" style={{ borderColor: options.atsMode ? '#000' : accentColor }}>
        {personal.photo?.dataUrl && personal.photo.shape !== 'none' && !options.atsMode && (
          <div className="flex justify-center mb-3">
            <img
              src={personal.photo.dataUrl}
              alt={personal.fullName}
              className={`w-20 h-20 object-cover border border-stone-300 ${
                personal.photo.shape === 'circle'
                  ? 'rounded-full'
                  : personal.photo.shape === 'rounded'
                  ? 'rounded-lg'
                  : 'rounded-none'
              }`}
            />
          </div>
        )}

        <h1
          className="text-2xl sm:text-3xl font-serif font-bold uppercase tracking-widest text-stone-900 break-words"
          style={{ color: options.atsMode ? '#000' : accentColor }}
        >
          {personal.fullName || 'Your Name'}
        </h1>

        {personal.headline && (
          <p className="text-xs font-sans uppercase tracking-widest text-stone-600 font-semibold mt-1 break-words">
            {personal.headline}
          </p>
        )}

        {/* Contact info bar with bullet separators */}
        <div className="flex flex-wrap justify-center items-center gap-x-2 gap-y-1 text-xs font-sans text-stone-600 mt-2.5 break-words">
          {personal.location && <span>{personal.location}</span>}
          {personal.phone && (
            <>
              <span className="text-stone-300">•</span>
              <span className="whitespace-nowrap">{personal.phone}</span>
            </>
          )}
          {personal.email && (
            <>
              <span className="text-stone-300">•</span>
              <a href={`mailto:${personal.email}`} className="hover:underline break-all">{personal.email}</a>
            </>
          )}
          {personal.linkedin && (
            <>
              <span className="text-stone-300">•</span>
              <a href={`https://${personal.linkedin.replace(/^https?:\/\//, '')}`} target="_blank" rel="noreferrer" className="hover:underline break-all">
                {personal.linkedin.replace(/^https?:\/\//, '')}
              </a>
            </>
          )}
          {personal.github && (
            <>
              <span className="text-stone-300">•</span>
              <a href={`https://${personal.github.replace(/^https?:\/\//, '')}`} target="_blank" rel="noreferrer" className="hover:underline break-all">
                {personal.github.replace(/^https?:\/\//, '')}
              </a>
            </>
          )}
          {personal.website && (
            <>
              <span className="text-stone-300">•</span>
              <a href={personal.website} target="_blank" rel="noreferrer" className="hover:underline break-all">
                {personal.website.replace(/^https?:\/\//, '')}
              </a>
            </>
          )}
        </div>
      </header>

      {/* Main Sections */}
      <div className="space-y-4">
        {sectionOrder.map((sectionKey) => {
          if (isHidden(sectionKey)) return null;

          if (sectionKey === 'summary' && summary) {
            return (
              <section key="summary" className="break-inside-avoid">
                <h2
                  className="text-xs font-sans font-bold uppercase tracking-wider text-stone-900 border-b border-stone-400 pb-0.5 mb-2"
                  style={{ color: options.atsMode ? '#000' : accentColor, borderColor: options.atsMode ? '#333' : accentColor }}
                >
                  {getSectionTitle('summary', options.language, resume)}
                </h2>
                <p className="text-xs text-stone-800 leading-relaxed text-justify break-words font-serif">{summary}</p>
              </section>
            );
          }

          if (sectionKey === 'skills' && skills && skills.length > 0) {
            return (
              <section key="skills" className="break-inside-avoid">
                <h2
                  className="text-xs font-sans font-bold uppercase tracking-wider text-stone-900 border-b border-stone-400 pb-0.5 mb-2"
                  style={{ color: options.atsMode ? '#000' : accentColor, borderColor: options.atsMode ? '#333' : accentColor }}
                >
                  {getSectionTitle('skills', options.language, resume)}
                </h2>
                <div className="space-y-1 text-xs">
                  {skills.map((cat, idx) => (
                    <div key={idx} className="flex flex-wrap items-baseline gap-1 font-serif">
                      <span className="font-sans font-bold text-stone-900 uppercase text-[11px] min-w-[120px]">
                        {cat.category}:
                      </span>
                      <span className="text-stone-800 break-words flex-1">{cat.items.join(', ')}</span>
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
                  className="text-xs font-sans font-bold uppercase tracking-wider text-stone-900 border-b border-stone-400 pb-0.5 mb-2"
                  style={{ color: options.atsMode ? '#000' : accentColor, borderColor: options.atsMode ? '#333' : accentColor }}
                >
                  {getSectionTitle('experience', options.language, resume)}
                </h2>
                {experience.map((exp) => (
                  <div key={exp.id} className="break-inside-avoid text-xs">
                    <div className="flex flex-wrap justify-between items-baseline gap-1">
                      <span className="font-bold text-stone-900 text-[13px] break-words">
                        {exp.jobTitle}
                      </span>
                      {(exp.startDate || exp.endDate) && (
                        <span className="font-sans font-medium text-stone-600 text-[11px] whitespace-nowrap shrink-0">
                          {exp.startDate} {exp.endDate ? `– ${exp.endDate}` : ''}
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap justify-between items-baseline gap-1 italic text-stone-700 font-serif mb-1">
                      <span className="break-words">{exp.company}</span>
                      {exp.location && <span className="font-sans not-italic text-[11px] text-stone-500">{exp.location}</span>}
                    </div>

                    {exp.description && exp.description.length > 0 && (
                      <ul className="list-disc list-outside ml-4 space-y-1 text-stone-800">
                        {exp.description.map((b, i) => (
                          <li key={i} className="leading-relaxed break-words">{b}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </section>
            );
          }

          if (sectionKey === 'projects' && projects && projects.length > 0) {
            return (
              <section key="projects" className="space-y-2.5">
                <h2
                  className="text-xs font-sans font-bold uppercase tracking-wider text-stone-900 border-b border-stone-400 pb-0.5 mb-2"
                  style={{ color: options.atsMode ? '#000' : accentColor, borderColor: options.atsMode ? '#333' : accentColor }}
                >
                  {getSectionTitle('projects', options.language, resume)}
                </h2>
                {projects.map((proj) => (
                  <div key={proj.id} className="break-inside-avoid text-xs">
                    <div className="flex flex-wrap justify-between items-baseline gap-1 font-serif">
                      <span className="font-bold text-stone-900 break-words">
                        {proj.name}
                        {proj.technologies && proj.technologies.length > 0 && (
                          <span className="font-sans font-normal text-stone-600 text-[11px] ml-2">
                            ({proj.technologies.join(', ')})
                          </span>
                        )}
                      </span>
                      {proj.url && (
                        <a href={proj.url} target="_blank" rel="noreferrer" className="font-sans text-[11px] text-blue-800 hover:underline">
                          View Project
                        </a>
                      )}
                    </div>
                    <p className="text-stone-800 mt-0.5 leading-relaxed break-words font-serif whitespace-pre-line">{proj.description}</p>
                  </div>
                ))}
              </section>
            );
          }

          if (sectionKey === 'education' && education && education.length > 0) {
            return (
              <section key="education" className="space-y-2">
                <h2
                  className="text-xs font-sans font-bold uppercase tracking-wider text-stone-900 border-b border-stone-400 pb-0.5 mb-2"
                  style={{ color: options.atsMode ? '#000' : accentColor, borderColor: options.atsMode ? '#333' : accentColor }}
                >
                  {getSectionTitle('education', options.language, resume)}
                </h2>
                {education.map((edu) => (
                  <div key={edu.id} className="break-inside-avoid text-xs">
                    <div className="flex flex-wrap justify-between items-baseline gap-1 font-serif">
                      <span className="font-bold text-stone-900 break-words">
                        {edu.degree} {edu.fieldOfStudy ? `in ${edu.fieldOfStudy}` : ''}
                      </span>
                      {(edu.startDate || edu.endDate) && (
                        <span className="font-sans font-medium text-stone-600 text-[11px] whitespace-nowrap shrink-0">
                          {edu.startDate} {edu.endDate ? `– ${edu.endDate}` : ''}
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap justify-between items-baseline gap-1 italic text-stone-700 font-serif">
                      <span className="break-words">{edu.institution}</span>
                      {edu.location && <span className="font-sans not-italic text-[11px] text-stone-500">{edu.location}</span>}
                    </div>
                    {edu.gpa && <p className="font-sans text-[11px] text-stone-600 mt-0.5">GPA: {edu.gpa}</p>}
                  </div>
                ))}
              </section>
            );
          }

          if (sectionKey === 'certifications' && certifications && certifications.length > 0) {
            return (
              <section key="certifications" className="break-inside-avoid">
                <h2
                  className="text-xs font-sans font-bold uppercase tracking-wider text-stone-900 border-b border-stone-400 pb-0.5 mb-2"
                  style={{ color: options.atsMode ? '#000' : accentColor, borderColor: options.atsMode ? '#333' : accentColor }}
                >
                  {getSectionTitle('certifications', options.language, resume)}
                </h2>
                <div className="space-y-1.5 text-xs font-serif">
                  {certifications.map((cert) => (
                    <div key={cert.id} className="flex flex-wrap justify-between items-baseline gap-1">
                      <div>
                        <span className="font-bold text-stone-900">{cert.name}</span>
                        {cert.issuer && <span className="italic text-stone-700"> — {cert.issuer}</span>}
                      </div>
                      {cert.date && <span className="font-sans text-[11px] text-stone-600 whitespace-nowrap">{cert.date}</span>}
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
                  className="text-xs font-sans font-bold uppercase tracking-wider text-stone-900 border-b border-stone-400 pb-0.5 mb-2"
                  style={{ color: options.atsMode ? '#000' : accentColor, borderColor: options.atsMode ? '#333' : accentColor }}
                >
                  {getSectionTitle('languages', options.language, resume)}
                </h2>
                <p className="text-xs text-stone-800 font-serif">
                  {languages.map((l) => `${l.language}${l.level ? ` (${l.level})` : ''}`).join(', ')}
                </p>
              </section>
            );
          }

          if (sectionKey === 'additional' && additionalSections && additionalSections.length > 0) {
            return (
              <React.Fragment key="additional">
                {additionalSections.map((sec) => (
                  <section key={sec.id} className="break-inside-avoid">
                    <h2
                      className="text-xs font-sans font-bold uppercase tracking-wider text-stone-900 border-b border-stone-400 pb-0.5 mb-2"
                      style={{ color: options.atsMode ? '#000' : accentColor, borderColor: options.atsMode ? '#333' : accentColor }}
                    >
                      {sec.title}
                    </h2>
                    <div className="text-xs text-stone-800 leading-relaxed break-words font-serif whitespace-pre-line">
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
