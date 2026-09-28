export type TemplateId = 
  | 'modern-tech'
  | 'minimal'
  | 'executive'
  | 'two-column'
  | 'creative'
  | 'ivy-league'
  | 'compact-grid'
  | 'nordic-slate'
  | 'metro-split'
  | 'plum-duotone';

export type TypographyFont = 
  | 'sans'
  | 'serif'
  | 'mono'
  | 'inter'
  | 'merriweather'
  | 'playfair'
  | 'outfit';

export type PaperSize = 'a4' | 'letter';
export type MarginSize = 'compact' | 'normal' | 'spacious';
export type SpacingDensity = 'tight' | 'normal' | 'relaxed';
export type FontSize = 'sm' | 'md' | 'lg';
export type PhotoShape = 'none' | 'circle' | 'square' | 'rounded';

export type FontOption = TypographyFont;
export type MarginOption = MarginSize;
export type PaperSizeOption = PaperSize;
export type FontSizeOption = FontSize;

export interface PhotoConfig {
  dataUrl: string;
  shape: PhotoShape;
  cropData?: { x: number; y: number; zoom: number };
}

export interface PersonalInfo {
  fullName: string;
  headline: string;
  location?: string;
  email?: string;
  phone?: string;
  website?: string;
  github?: string;
  linkedin?: string;
  photo?: PhotoConfig;
}

export interface SkillCategory {
  category: string;
  items: string[];
}

export interface ExperienceItem {
  id: string;
  jobTitle: string;
  company: string;
  location?: string;
  startDate?: string;
  endDate?: string;
  description: string[];
  flagged?: boolean;
}

export interface ProjectItem {
  id: string;
  name: string;
  description: string;
  technologies?: string[];
  url?: string;
}

export interface EducationItem {
  id: string;
  institution: string;
  degree: string;
  dates?: string;
  location?: string;
  description?: string;
}

export interface CertificationItem {
  id: string;
  name: string;
  issuer?: string;
  date?: string;
}

export interface LanguageItem {
  language: string;
  level?: string;
}

export interface AdditionalSectionItem {
  id: string;
  title: string;
  content: string;
  order: number;
}

export interface ResumeMeta {
  title: string;
  createdAt: string;
  updatedAt: string;
  tags?: string[];
}

export interface Resume {
  id: string;
  meta: ResumeMeta;
  personal: PersonalInfo;
  summary?: string;
  skills: SkillCategory[];
  experience: ExperienceItem[];
  projects: ProjectItem[];
  education: EducationItem[];
  certifications: CertificationItem[];
  languages: LanguageItem[];
  additionalSections: AdditionalSectionItem[];
  sectionOrder: string[];
  hiddenSections: string[];
}

export interface TemplateOptions {
  paperSize: PaperSize;
  margins: MarginSize;
  spacing: SpacingDensity;
  font: TypographyFont;
  fontSize: FontSize;
  accentColor: string;
  fitToOnePage: boolean;
  atsMode: boolean;
  language?: 'en' | 'hy';
}

export interface JobDescriptionMatch {
  score: number;
  matchedKeywords: string[];
  missingKeywords: string[];
  suggestions: string[];
  lastAnalyzedAt?: string;
}

export interface CoverLetter {
  id: string;
  resumeId: string;
  recipientName: string;
  recipientTitle?: string;
  companyName: string;
  jobTitle: string;
  jobDescription?: string;
  body: string;
  createdAt: string;
  updatedAt: string;
}

export type ActiveTab = 'editor' | 'templates' | 'style' | 'score' | 'coverletter';
export type AppView = 'dashboard' | 'builder' | 'diff' | 'score' | 'cover-letter';
