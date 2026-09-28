export type LanguageCode = 'en' | 'hy';

export interface SectionTitles {
  summary: string;
  skills: string;
  experience: string;
  projects: string;
  education: string;
  certifications: string;
  languages: string;
  additional: string;
}

export const SECTION_TITLES: Record<LanguageCode, SectionTitles> = {
  en: {
    summary: 'Professional Summary',
    skills: 'Technical Skills',
    experience: 'Work Experience',
    projects: 'Featured Projects',
    education: 'Education',
    certifications: 'Certifications & Training',
    languages: 'Languages',
    additional: 'Additional Information',
  },
  hy: {
    summary: 'Ամփոփում',
    skills: 'Հմտություններ',
    experience: 'Փորձառություն',
    projects: 'Նախագծեր',
    education: 'Կրթություն',
    certifications: 'Վկայականներ',
    languages: 'Լեզուներ',
    additional: 'Լրացուցիչ Տեղեկություն',
  },
};

export function isArmenianText(text: string): boolean {
  return /[\u0530-\u058F]/.test(text);
}

export function detectResumeLanguage(resume: { personal?: { fullName?: string; headline?: string }; summary?: string; skills?: any[]; experience?: any[] }): LanguageCode {
  const skillsText = JSON.stringify(resume.skills || []);
  const expText = JSON.stringify(resume.experience || []);
  const fullContent = `${resume.personal?.fullName || ''} ${resume.personal?.headline || ''} ${resume.summary || ''} ${skillsText} ${expText}`;
  return isArmenianText(fullContent) ? 'hy' : 'en';
}

export function getSectionTitle(
  sectionKey: keyof SectionTitles,
  optionsLanguage?: LanguageCode,
  resume?: any
): string {
  const lang = optionsLanguage === 'hy' ? 'hy' : optionsLanguage === 'en' ? 'en' : (resume ? detectResumeLanguage(resume) : 'en');
  return SECTION_TITLES[lang][sectionKey];
}

