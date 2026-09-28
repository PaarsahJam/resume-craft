import React from 'react';
import { Resume, TemplateOptions } from '../../types';
import { getSectionTitle } from '../../lib/i18n';
import { Mail, Phone, MapPin, Globe, Github, Linkedin, ExternalLink } from 'lucide-react';

interface PlumDuotoneTemplateProps {
  resume: Resume;
  options: TemplateOptions;
}

export const PlumDuotoneTemplate: React.FC<PlumDuotoneTemplateProps> = ({ resume, options }) => {
  const {
    personal,
    summary,
    skills,
    experience,
    projects,
    education,
    certifications,
    languages,
    additionalSections,
    hiddenSections,
  } = resume;

  const isHidden = (sec: string) => hiddenSections?.includes(sec);

  // Default deep plum / wine burgundy tone as shown in the template image
  const primaryPlumColor = options.accentColor && options.accentColor !== '#2563eb' 
    ? options.accentColor 
    : '#582949';

  // Helper to convert language proficiency or skill level to a 1-5 dot score
  const getProficiencyScore = (levelStr?: string): number => {
    if (!levelStr) return 5;
    const lower = levelStr.toLowerCase();
    if (lower.includes('native') || lower.includes('bilingual') || lower.includes('c2') || lower.includes('fluent')) return 5;
    if (lower.includes('proficient') || lower.includes('advanced') || lower.includes('c1') || lower.includes('expert')) return 5;
    if (lower.includes('professional') || lower.includes('working') || lower.includes('b2') || lower.includes('upper')) return 4;
    if (lower.includes('intermediate') || lower.includes('b1') || lower.includes('moderate')) return 3;
    if (lower.includes('basic') || lower.includes('elementary') || lower.includes('a2') || lower.includes('a1') || lower.includes('beginner')) return 2;
    const num = parseInt(levelStr, 10);
    if (!isNaN(num) && num >= 1 && num <= 5) return num;
    return 4;
  };

  // Helper to render 5-dot rating indicator
  const renderRatingDots = (score: number, theme: 'white' | 'dark') => {
    const dots = [1, 2, 3, 4, 5];
    return (
      <div className="flex items-center gap-1.5 shrink-0" aria-label={`Rating: ${score} of 5`}>
        {dots.map((dot) => {
          const isFilled = dot <= score;
          if (theme === 'white') {
            return (
              <span
                key={dot}
                className={`w-2 h-2 rounded-full inline-block ${
                  isFilled ? 'bg-white' : 'bg-white/25'
                }`}
              />
            );
          }
          return (
            <span
              key={dot}
              className={`w-2 h-2 rounded-full inline-block ${
                isFilled ? 'bg-slate-900' : 'bg-slate-200'
              }`}
            />
          );
        })}
      </div>
    );
  };

  // Candidate initials for avatar fallback if photo isn't provided
  const getInitials = (name: string) => {
    if (!name) return 'LM';
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <div className="w-full text-slate-800 leading-normal flex flex-col md:flex-row min-h-full break-words bg-white">
      {/* ==================================================================== */}
      {/* LEFT COLUMN: Deep Plum Full-Bleed Sidebar                            */}
      {/* ==================================================================== */}
      <aside
        className="w-full md:w-[38%] text-white p-6 sm:p-7 shrink-0 flex flex-col justify-between break-words"
        style={{ backgroundColor: options.atsMode ? '#271221' : primaryPlumColor }}
      >
        <div className="space-y-6">
          {/* Header Identity Block: Name & Headline */}
          <div>
            <h1 className="text-2xl sm:text-[28px] font-bold text-white tracking-tight leading-tight break-words">
              {personal.fullName || 'Lara Müller'}
            </h1>
            {personal.headline && (
              <p className="text-sm sm:text-base font-normal text-white/90 mt-1 tracking-wide leading-snug break-words">
                {personal.headline}
              </p>
            )}

            {/* Profile Photo or Styled Aesthetic Portrait Frame */}
            {personal.photo?.dataUrl && personal.photo.shape !== 'none' && !options.atsMode ? (
              <div className="mt-4">
                <img
                  src={personal.photo.dataUrl}
                  alt={personal.fullName}
                  className={`w-full max-w-[210px] aspect-[4/5] object-cover shadow-sm border border-white/20 ${
                    personal.photo.shape === 'circle'
                      ? 'rounded-full max-w-[150px] aspect-square mx-auto'
                      : personal.photo.shape === 'rounded'
                      ? 'rounded-lg'
                      : 'rounded-none'
                  }`}
                />
              </div>
            ) : (
              <div className="mt-4 w-full max-w-[210px] aspect-[4/5] bg-white/10 border border-white/20 flex flex-col items-center justify-center text-center p-4">
                <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center text-xl font-bold tracking-wider text-white mb-2">
                  {getInitials(personal.fullName)}
                </div>
                <span className="text-[11px] text-white/70 font-medium tracking-wide">
                  {personal.headline ? personal.headline.split('|')[0].trim() : 'Professional Profile'}
                </span>
              </div>
            )}
          </div>

          {/* Contact Details List */}
          <div className="space-y-2 text-xs text-white/90 pt-1">
            {personal.email && (
              <a
                href={`mailto:${personal.email}`}
                className="flex items-center gap-2.5 hover:text-white transition break-all"
              >
                <Mail className="w-3.5 h-3.5 opacity-80 shrink-0" />
                <span>{personal.email}</span>
              </a>
            )}

            {personal.phone && (
              <div className="flex items-center gap-2.5">
                <Phone className="w-3.5 h-3.5 opacity-80 shrink-0" />
                <span className="whitespace-nowrap">{personal.phone}</span>
              </div>
            )}

            {personal.location && (
              <div className="flex items-center gap-2.5">
                <MapPin className="w-3.5 h-3.5 opacity-80 shrink-0" />
                <span>{personal.location}</span>
              </div>
            )}

            {personal.linkedin && (
              <a
                href={`https://${personal.linkedin.replace(/^https?:\/\//, '')}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2.5 hover:text-white transition break-all"
              >
                <Linkedin className="w-3.5 h-3.5 opacity-80 shrink-0" />
                <span>{personal.linkedin.replace(/^https?:\/\//, '')}</span>
              </a>
            )}

            {personal.website && (
              <a
                href={personal.website}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2.5 hover:text-white transition break-all"
              >
                <Globe className="w-3.5 h-3.5 opacity-80 shrink-0" />
                <span>{personal.website.replace(/^https?:\/\//, '')}</span>
              </a>
            )}

            {personal.github && !personal.website?.includes('github') && (
              <a
                href={`https://${personal.github.replace(/^https?:\/\//, '')}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2.5 hover:text-white transition break-all"
              >
                <Github className="w-3.5 h-3.5 opacity-80 shrink-0" />
                <span>{personal.github.replace(/^https?:\/\//, '')}</span>
              </a>
            )}
          </div>

          {/* Left Sidebar Section: SUMMARY */}
          {!isHidden('summary') && summary && (
            <div className="pt-2">
              <h2 className="text-xs font-bold uppercase tracking-wider text-white border-b-2 border-white/40 pb-1 mb-2.5">
                {getSectionTitle('summary', options.language, resume)}
              </h2>
              <p className="text-[11.5px] leading-relaxed text-white/90 whitespace-pre-line text-justify">
                {summary}
              </p>
            </div>
          )}

          {/* Left Sidebar Section: LANGUAGES */}
          {!isHidden('languages') && languages && languages.length > 0 && (
            <div className="pt-2">
              <h2 className="text-xs font-bold uppercase tracking-wider text-white border-b-2 border-white/40 pb-1 mb-2.5">
                {getSectionTitle('languages', options.language, resume)}
              </h2>
              <div className="space-y-2">
                {languages.map((l, idx) => {
                  const score = getProficiencyScore(l.level);
                  return (
                    <div key={idx} className="flex items-center justify-between gap-2 text-xs">
                      <span className="font-medium text-white/95">{l.language}</span>
                      {renderRatingDots(score, 'white')}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Availability / Footer Note in Sidebar (if present) */}
        {additionalSections?.find((s) => s.title.toLowerCase().includes('availability')) && (
          <div className="mt-6 pt-3 border-t border-white/20 text-[10.5px] text-white/80">
            <span className="font-semibold text-white">
              {additionalSections.find((s) => s.title.toLowerCase().includes('availability'))?.title}:{' '}
            </span>
            <span>
              {additionalSections.find((s) => s.title.toLowerCase().includes('availability'))?.content}
            </span>
          </div>
        )}
      </aside>

      {/* ==================================================================== */}
      {/* RIGHT COLUMN: Clean White Canvas with Dark Typography                */}
      {/* ==================================================================== */}
      <main className="w-full md:w-[62%] p-6 sm:p-8 space-y-6">
        {/* Section: PROFESSIONAL EXPERIENCE */}
        {!isHidden('experience') && experience && experience.length > 0 && (
          <section>
            <h2 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-900 border-b-2 border-slate-900 pb-1 mb-3.5">
              {getSectionTitle('experience', options.language, resume)}
            </h2>
            <div className="space-y-4">
              {experience.map((exp) => (
                <div key={exp.id} className="space-y-1">
                  <div className="font-bold text-slate-900 text-xs sm:text-[13px] leading-tight">
                    {exp.company}
                  </div>
                  <div className="font-medium text-slate-700 text-xs leading-snug">
                    {exp.jobTitle}
                  </div>
                  <div className="text-[11px] text-slate-500 font-medium">
                    {exp.startDate} {exp.endDate ? `– ${exp.endDate}` : ''}
                    {exp.location ? ` | ${exp.location}` : ''}
                  </div>

                  {exp.description && exp.description.length > 0 && (
                    <ul className="space-y-1 text-xs text-slate-700 leading-relaxed mt-1.5 list-none">
                      {exp.description.map((bullet, bIdx) => (
                        <li key={bIdx} className="flex items-start gap-2">
                          <span className="text-slate-900 font-bold shrink-0 leading-tight">•</span>
                          <span className="flex-1">{bullet.replace(/^[•\-\*]\s*/, '')}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Section: EDUCATION */}
        {!isHidden('education') && education && education.length > 0 && (
          <section>
            <h2 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-900 border-b-2 border-slate-900 pb-1 mb-3.5">
              {getSectionTitle('education', options.language, resume)}
            </h2>
            <div className="space-y-3.5">
              {education.map((edu) => (
                <div key={edu.id} className="space-y-0.5">
                  <div className="font-bold text-slate-900 text-xs sm:text-[13px] leading-tight">
                    {edu.degree}
                  </div>
                  <div className="font-medium text-slate-700 text-xs leading-snug">
                    {edu.institution}
                  </div>
                  {edu.dates && (
                    <div className="text-[11px] text-slate-500 font-medium">
                      {edu.dates}
                      {edu.location ? ` | ${edu.location}` : ''}
                    </div>
                  )}
                  {edu.description && (
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">{edu.description}</p>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Section: SKILLS */}
        {!isHidden('skills') && skills && skills.length > 0 && (
          <section>
            <h2 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-900 border-b-2 border-slate-900 pb-1 mb-3.5">
              {getSectionTitle('skills', options.language, resume)}
            </h2>

            {/* Check if skills are flat or categorized */}
            {skills.length === 1 && skills[0].items.length <= 8 ? (
              // Clean dot rating list matching the Lara Müller image
              <div className="space-y-2">
                {skills[0].items.map((item, sIdx) => {
                  const rating = 5 - (sIdx % 2); // subtle aesthetic variation like in template photo
                  return (
                    <div key={sIdx} className="flex items-center justify-between gap-4 text-xs">
                      <span className="font-medium text-slate-800">{item}</span>
                      {renderRatingDots(rating, 'dark')}
                    </div>
                  );
                })}
              </div>
            ) : (
              // Multi-category layout with categorized skill headers and items
              <div className="space-y-3">
                {skills.map((categoryGroup, cIdx) => (
                  <div key={cIdx} className="space-y-1">
                    <div className="text-xs font-semibold text-slate-900">
                      {categoryGroup.category}
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {categoryGroup.items.map((item, iIdx) => (
                        <span
                          key={iIdx}
                          className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-800 border border-slate-200/80"
                        >
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {/* Section: CERTIFICATES / PROFESSIONAL TRAINING */}
        {!isHidden('certifications') && certifications && certifications.length > 0 && (
          <section>
            <h2 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-900 border-b-2 border-slate-900 pb-1 mb-3.5">
              {getSectionTitle('certifications', options.language, resume)}
            </h2>
            <div className="space-y-2">
              {certifications.map((cert) => (
                <div key={cert.id} className="text-xs space-y-0.5">
                  <div className="font-semibold text-slate-900">{cert.name}</div>
                  <div className="text-[11px] text-slate-600">
                    {cert.issuer} {cert.date ? `• ${cert.date}` : ''}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Section: SELECTED SOFTWARE PROJECTS (if present) */}
        {!isHidden('projects') && projects && projects.length > 0 && (
          <section>
            <h2 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-900 border-b-2 border-slate-900 pb-1 mb-3.5">
              {getSectionTitle('projects', options.language, resume)}
            </h2>
            <div className="space-y-3">
              {projects.map((proj) => (
                <div key={proj.id} className="space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-bold text-slate-900 text-xs sm:text-[13px]">
                      {proj.name}
                    </span>
                    {proj.url && (
                      <a
                        href={proj.url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[11px] text-blue-600 hover:underline inline-flex items-center gap-1"
                      >
                        <ExternalLink className="w-3 h-3" /> Link
                      </a>
                    )}
                  </div>
                  {proj.technologies && proj.technologies.length > 0 && (
                    <div className="text-[11px] text-slate-500 font-medium">
                      {proj.technologies.join(' • ')}
                    </div>
                  )}
                  {proj.description && (
                    <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-line">
                      {proj.description}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Additional Sections (e.g. Technical Strengths, References) */}
        {additionalSections
          ?.filter((s) => !s.title.toLowerCase().includes('availability'))
          .map((sec) => (
            <section key={sec.id}>
              <h2 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-900 border-b-2 border-slate-900 pb-1 mb-3.5">
                {sec.title}
              </h2>
              <div className="text-xs text-slate-700 leading-relaxed whitespace-pre-line">
                {sec.content}
              </div>
            </section>
          ))}
      </main>
    </div>
  );
};
