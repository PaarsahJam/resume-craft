import React from 'react';
import { Resume, TemplateOptions } from '../../types';
import { getSectionTitle } from '../../lib/i18n';
import { Mail, Phone, MapPin, Globe, Github, Linkedin } from 'lucide-react';

interface MetroSplitTemplateProps {
  resume: Resume;
  options: TemplateOptions;
}

export const MetroSplitTemplate: React.FC<MetroSplitTemplateProps> = ({ resume, options }) => {
  const { personal, summary, skills, experience, projects, education, certifications, languages, additionalSections, hiddenSections, sectionOrder } = resume;

  const isHidden = (sec: string) => hiddenSections?.includes(sec);
  const primaryColor = options.accentColor || '#0f172a';

  // Candidate initials for monogram badge if no photo
  const getInitials = (name: string) => {
    if (!name) return 'CV';
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <div className="w-full text-slate-800 leading-normal break-words font-sans text-xs">
      {/* Metro Corporate Banner Header */}
      <header className="p-4 sm:p-5 rounded-xl bg-slate-900 text-white mb-5 shadow-xs" style={{ backgroundColor: options.atsMode ? '#09090b' : primaryColor }}>
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4 text-center sm:text-left">
            {personal.photo?.dataUrl && personal.photo.shape !== 'none' && !options.atsMode ? (
              <img
                src={personal.photo.dataUrl}
                alt={personal.fullName}
                className={`w-16 h-16 object-cover border-2 border-white/40 shadow-sm shrink-0 ${
                  personal.photo.shape === 'circle'
                    ? 'rounded-full'
                    : personal.photo.shape === 'rounded'
                    ? 'rounded-xl'
                    : 'rounded-none'
                }`}
              />
            ) : (
              <div className="w-14 h-14 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center text-lg font-bold tracking-wider text-white shrink-0">
                {getInitials(personal.fullName)}
              </div>
            )}

            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white break-words">
                {personal.fullName || 'Your Name'}
              </h1>
              {personal.headline && (
                <p className="text-xs sm:text-sm font-medium text-white/80 mt-0.5 break-words">
                  {personal.headline}
                </p>
              )}
            </div>
          </div>

          {/* Quick contact list inside header */}
          <div className="flex flex-wrap sm:flex-col items-center sm:items-end justify-center gap-x-3 gap-y-1 text-[11px] text-white/85">
            {personal.email && (
              <a href={`mailto:${personal.email}`} className="flex items-center gap-1.5 hover:text-white break-all">
                <Mail className="w-3 h-3 opacity-70 shrink-0" />
                {personal.email}
              </a>
            )}
            {personal.phone && (
              <span className="flex items-center gap-1.5 whitespace-nowrap">
                <Phone className="w-3 h-3 opacity-70 shrink-0" />
                {personal.phone}
              </span>
            )}
            {personal.location && (
              <span className="flex items-center gap-1.5">
                <MapPin className="w-3 h-3 opacity-70 shrink-0" />
                {personal.location}
              </span>
            )}
            {personal.linkedin && (
              <a href={`https://${personal.linkedin.replace(/^https?:\/\//, '')}`} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 hover:text-white break-all">
                <Linkedin className="w-3 h-3 opacity-70 shrink-0" />
                {personal.linkedin.replace(/^https?:\/\//, '')}
              </a>
            )}
            {personal.github && (
              <a href={`https://${personal.github.replace(/^https?:\/\//, '')}`} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 hover:text-white break-all">
                <Github className="w-3 h-3 opacity-70 shrink-0" />
                {personal.github.replace(/^https?:\/\//, '')}
              </a>
            )}
            {personal.website && (
              <a href={personal.website} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 hover:text-white break-all">
                <Globe className="w-3 h-3 opacity-70 shrink-0" />
                {personal.website.replace(/^https?:\/\//, '')}
              </a>
            )}
          </div>
        </div>
      </header>

      {/* Structured Metro Sections */}
      <div className="space-y-4">
        {sectionOrder.map((sectionKey) => {
          if (isHidden(sectionKey)) return null;

          if (sectionKey === 'summary' && summary) {
            return (
              <section key="summary" className="break-inside-avoid">
                <div className="flex items-center gap-2 mb-1.5">
                  <div className="px-2 py-0.5 rounded-md bg-slate-100 border border-slate-200 text-slate-900 font-bold uppercase tracking-wider text-[11px]">
                    {getSectionTitle('summary', options.language, resume)}
                  </div>
                  <div className="flex-1 h-px bg-slate-200" />
                </div>
                <p className="text-slate-700 leading-relaxed px-1 break-words">{summary}</p>
              </section>
            );
          }

          if (sectionKey === 'skills' && skills && skills.length > 0) {
            return (
              <section key="skills" className="break-inside-avoid">
                <div className="flex items-center gap-2 mb-2">
                  <div className="px-2 py-0.5 rounded-md bg-slate-100 border border-slate-200 text-slate-900 font-bold uppercase tracking-wider text-[11px]">
                    {getSectionTitle('skills', options.language, resume)}
                  </div>
                  <div className="flex-1 h-px bg-slate-200" />
                </div>
                <div className="px-1 grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {skills.map((cat, idx) => (
                    <div key={idx} className="flex flex-col gap-0.5">
                      <span className="font-bold text-slate-900 text-[11px]">
                        {cat.category}
                      </span>
                      <span className="text-slate-600 text-[11px] break-words">
                        {cat.items.join(', ')}
                      </span>
                    </div>
                  ))}
                </div>
              </section>
            );
          }

          if (sectionKey === 'experience' && experience && experience.length > 0) {
            return (
              <section key="experience" className="space-y-3">
                <div className="flex items-center gap-2 mb-1.5">
                  <div className="px-2 py-0.5 rounded-md bg-slate-100 border border-slate-200 text-slate-900 font-bold uppercase tracking-wider text-[11px]">
                    {getSectionTitle('experience', options.language, resume)}
                  </div>
                  <div className="flex-1 h-px bg-slate-200" />
                </div>
                <div className="px-1 space-y-3">
                  {experience.map((exp) => (
                    <div key={exp.id} className="break-inside-avoid">
                      <div className="flex flex-wrap justify-between items-baseline gap-1">
                        <div>
                          <span className="font-bold text-slate-950 text-xs">{exp.jobTitle}</span>
                          <span className="text-slate-600 text-xs font-semibold"> • {exp.company}</span>
                          {exp.location && <span className="text-slate-500 text-[11px]"> ({exp.location})</span>}
                        </div>
                        {(exp.startDate || exp.endDate) && (
                          <span className="text-[11px] font-medium text-slate-500 whitespace-nowrap shrink-0">
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
              <section key="projects" className="space-y-2">
                <div className="flex items-center gap-2 mb-1.5">
                  <div className="px-2 py-0.5 rounded-md bg-slate-100 border border-slate-200 text-slate-900 font-bold uppercase tracking-wider text-[11px]">
                    {getSectionTitle('projects', options.language, resume)}
                  </div>
                  <div className="flex-1 h-px bg-slate-200" />
                </div>
                <div className="px-1 space-y-2">
                  {projects.map((proj) => (
                    <div key={proj.id} className="break-inside-avoid">
                      <div className="flex flex-wrap justify-between items-baseline gap-1">
                        <span className="font-bold text-slate-900">
                          {proj.name}
                          {proj.technologies && proj.technologies.length > 0 && (
                            <span className="font-normal text-slate-500 text-[10px] ml-1.5">
                              ({proj.technologies.join(', ')})
                            </span>
                          )}
                        </span>
                        {proj.url && (
                          <a href={proj.url} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline text-[11px]">
                            {proj.url.replace(/^https?:\/\//, '')}
                          </a>
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
                <div className="flex items-center gap-2 mb-1.5">
                  <div className="px-2 py-0.5 rounded-md bg-slate-100 border border-slate-200 text-slate-900 font-bold uppercase tracking-wider text-[11px]">
                    {getSectionTitle('education', options.language, resume)}
                  </div>
                  <div className="flex-1 h-px bg-slate-200" />
                </div>
                <div className="px-1 space-y-1.5">
                  {education.map((edu) => (
                    <div key={edu.id} className="flex flex-wrap justify-between items-baseline gap-1">
                      <div>
                        <span className="font-bold text-slate-900">{edu.degree} {edu.fieldOfStudy ? `in ${edu.fieldOfStudy}` : ''}</span>
                        <span className="text-slate-600 text-[11px]"> • {edu.institution}</span>
                        {edu.gpa && <span className="text-slate-500 text-[10px] ml-1">[GPA: {edu.gpa}]</span>}
                      </div>
                      {(edu.startDate || edu.endDate) && (
                        <span className="text-[11px] font-medium text-slate-500 whitespace-nowrap shrink-0">
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
                  <div className="px-2 py-0.5 rounded-md bg-slate-100 border border-slate-200 text-slate-900 font-bold uppercase tracking-wider text-[11px]">
                    {getSectionTitle('certifications', options.language, resume)}
                  </div>
                  <div className="flex-1 h-px bg-slate-200" />
                </div>
                <div className="px-1 space-y-1">
                  {certifications.map((cert) => (
                    <div key={cert.id} className="flex flex-wrap justify-between items-baseline gap-1">
                      <span className="text-slate-800 font-medium">
                        {cert.name} {cert.issuer ? `— ${cert.issuer}` : ''}
                      </span>
                      {cert.date && <span className="text-[11px] text-slate-500">{cert.date}</span>}
                    </div>
                  ))}
                </div>
              </section>
            );
          }

          if (sectionKey === 'languages' && languages && languages.length > 0) {
            return (
              <section key="languages" className="break-inside-avoid">
                <div className="flex items-center gap-2 mb-1.5">
                  <div className="px-2 py-0.5 rounded-md bg-slate-100 border border-slate-200 text-slate-900 font-bold uppercase tracking-wider text-[11px]">
                    {getSectionTitle('languages', options.language, resume)}
                  </div>
                  <div className="flex-1 h-px bg-slate-200" />
                </div>
                <div className="px-1">
                  <p className="text-slate-700">
                    {languages.map((l) => `${l.language}${l.level ? ` (${l.level})` : ''}`).join(' • ')}
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
                    <div className="flex items-center gap-2 mb-1.5">
                      <div className="px-2 py-0.5 rounded-md bg-slate-100 border border-slate-200 text-slate-900 font-bold uppercase tracking-wider text-[11px]">
                        {sec.title}
                      </div>
                      <div className="flex-1 h-px bg-slate-200" />
                    </div>
                    <div className="px-1 text-slate-700 leading-relaxed break-words whitespace-pre-line">
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
