import {
  Resume,
  ExperienceItem,
  SkillCategory,
  EducationItem,
  CertificationItem,
  ProjectItem,
  LanguageItem,
  AdditionalSectionItem,
} from '../types';

// ============================================================================
// 1. MAJOR SECTION LEVEL-1 WHITELIST
// ============================================================================
export const APPROVED_LEVEL_1_HEADINGS = [
  'PROFESSIONAL SUMMARY',
  'CORE TECHNICAL SKILLS',
  'PROFESSIONAL EXPERIENCE',
  'SELECTED SOFTWARE PROJECTS',
  'TECHNICAL STRENGTHS',
  'EDUCATION',
  'PROFESSIONAL TRAINING',
  'LANGUAGES',
  'AVAILABILITY',
  'REFERENCES',
] as const;

// Recognized Section Aliases (case-insensitive) mapped to standard sections
const SECTION_MAPPINGS: Record<string, string> = {
  // Summary
  'professional summary': 'SUMMARY',
  'summary': 'SUMMARY',
  'profile': 'SUMMARY',
  'about me': 'SUMMARY',
  'ամփոփում': 'SUMMARY',
  'ինքնակենսագրական': 'SUMMARY',
  'նկարագիր': 'SUMMARY',

  // Core Technical Skills
  'core technical skills': 'SKILLS',
  'technical skills': 'SKILLS',
  'skills': 'SKILLS',
  'core competencies': 'SKILLS',
  'expertise': 'SKILLS',
  'հմտություններ': 'SKILLS',
  'տեխնոլոգիաներ': 'SKILLS',
  'գիտելիքներ': 'SKILLS',

  // Experience
  'professional experience': 'EXPERIENCE',
  'experience': 'EXPERIENCE',
  'work experience': 'EXPERIENCE',
  'employment history': 'EXPERIENCE',
  'employment': 'EXPERIENCE',
  'փորձառություն': 'EXPERIENCE',
  'աշխատանքային փորձ': 'EXPERIENCE',
  'փորձ': 'EXPERIENCE',

  // Selected Software Projects
  'selected software projects': 'PROJECTS',
  'software projects': 'PROJECTS',
  'selected projects': 'PROJECTS',
  'projects': 'PROJECTS',
  'նախագծեր': 'PROJECTS',
  'ծրագրեր': 'PROJECTS',

  // Technical Strengths
  'technical strengths': 'STRENGTHS',
  'strengths': 'STRENGTHS',

  // Education
  'education': 'EDUCATION',
  'academic background': 'EDUCATION',
  'academic history': 'EDUCATION',
  'academic': 'EDUCATION',
  'կրթություն': 'EDUCATION',
  'ուսում': 'EDUCATION',

  // Professional Training / Certifications
  'professional training': 'TRAINING',
  'training': 'TRAINING',
  'certifications': 'CERTIFICATIONS',
  'certificates': 'CERTIFICATIONS',
  'licenses': 'CERTIFICATIONS',
  'սերտիֆիկատներ': 'CERTIFICATIONS',
  'վկայականներ': 'CERTIFICATIONS',
  'հավաստագրեր': 'CERTIFICATIONS',

  // Languages
  'languages': 'LANGUAGES',
  'language proficiency': 'LANGUAGES',
  'լեզուներ': 'LANGUAGES',

  // Availability
  'availability': 'AVAILABILITY',
  'availability & work authorization': 'AVAILABILITY',
  'work authorization': 'AVAILABILITY',

  // References
  'references': 'REFERENCES',
  'professional references': 'REFERENCES',
};

// ============================================================================
// 2. VALID TECHNICAL-SKILL SUBHEADINGS (LEVEL-2)
// ============================================================================
export const APPROVED_SKILL_SUBSECTIONS = [
  'Programming Languages',
  'Web & Front-End Development',
  'Back-End & APIs',
  'State Management & Architecture',
  'Databases & Persistence',
  'Sensor Processing & Engineering',
  'Graphics & Visualization',
  'DevOps & Infrastructure',
  'Additional Technical Experience',
] as const;

const SKILL_SUBSECTION_LOOKUP = new Map<string, string>([
  ['programming languages', 'Programming Languages'],
  ['programming language', 'Programming Languages'],
  ['languages', 'Programming Languages'],
  ['ծրագրավորման լեզուներ', 'Ծրագրավորման լեզուներ'],

  ['web & front-end development', 'Web & Front-End Development'],
  ['web and front-end development', 'Web & Front-End Development'],
  ['front-end development', 'Web & Front-End Development'],
  ['web & frontend', 'Web & Front-End Development'],
  ['frontend', 'Web & Front-End Development'],
  ['front-end', 'Web & Front-End Development'],
  ['ֆրոնթենդ', 'Ֆրոնթենդ'],

  ['back-end & apis', 'Back-End & APIs'],
  ['back-end and apis', 'Back-End & APIs'],
  ['backend & apis', 'Back-End & APIs'],
  ['backend & api', 'Back-End & APIs'],
  ['back-end', 'Back-End & APIs'],
  ['backend', 'Back-End & APIs'],
  ['բեքենդ', 'Բեքենդ'],

  ['state management & architecture', 'State Management & Architecture'],
  ['state management and architecture', 'State Management & Architecture'],
  ['architecture & state management', 'State Management & Architecture'],
  ['architecture', 'State Management & Architecture'],

  ['databases & persistence', 'Databases & Persistence'],
  ['databases and persistence', 'Databases & Persistence'],
  ['databases', 'Databases & Persistence'],
  ['database & persistence', 'Databases & Persistence'],
  ['տվյալների բազաներ', 'Տվյալների բազաներ'],

  ['sensor processing & engineering', 'Sensor Processing & Engineering'],
  ['sensor processing and engineering', 'Sensor Processing & Engineering'],
  ['sensor processing', 'Sensor Processing & Engineering'],
  ['sensor engineering', 'Sensor Processing & Engineering'],

  ['graphics & visualization', 'Graphics & Visualization'],
  ['graphics and visualization', 'Graphics & Visualization'],
  ['visualization & graphics', 'Graphics & Visualization'],
  ['graphics', 'Graphics & Visualization'],
  ['visualization', 'Graphics & Visualization'],

  ['devops & infrastructure', 'DevOps & Infrastructure'],
  ['devops and infrastructure', 'DevOps & Infrastructure'],
  ['devops', 'DevOps & Infrastructure'],
  ['infrastructure', 'DevOps & Infrastructure'],
  ['devops և գործիքներ', 'DevOps և գործիքներ'],

  ['additional technical experience', 'Additional Technical Experience'],
  ['additional experience', 'Additional Technical Experience'],
  ['additional technical skills', 'Additional Technical Experience'],
  ['other technical skills', 'Additional Technical Experience'],
]);

// ============================================================================
// 3. ABSOLUTE SKILL BLACKLIST AGAINST BEING PARSED AS A SECTION HEADING
// ============================================================================
export const ABSOLUTE_SKILL_BLACKLIST = new Set<string>([
  'c#',
  'java',
  'javascript',
  'javascript / es6+',
  'javascript/es6+',
  'typescript',
  'python',
  'dart',
  'c/c++',
  'c++',
  'c',
  'react',
  'react.js',
  'reactjs',
  'next.js',
  'nextjs',
  'flutter',
  'html',
  'html5',
  'css',
  'css3',
  'material ui',
  'material-ui',
  'tailwind css',
  'tailwind',
  'bootstrap',
  'progressive web applications (pwa)',
  'progressive web applications',
  'pwa',
  'responsive ui development',
  'responsive ui',
  'c# / .net',
  'c#/.net',
  '.net',
  '.net core',
  'asp.net core',
  'asp.net',
  'node.js',
  'nodejs',
  'express',
  'express.js',
  'nestjs',
  'nest.js',
  'restful apis',
  'restful api',
  'rest apis',
  'rest api',
  'graphql',
  'basic graphql',
  'jwt authentication',
  'jwt',
  'clerk',
  'kinde',
  'oauth',
  'riverpod',
  'riverpod generator',
  'redux',
  'redux toolkit',
  'zustand',
  'tanstack query',
  'context api',
  'postgresql',
  'mysql',
  'mongodb',
  'sqlite',
  'drift',
  'prisma',
  'drizzle',
  'drizzle orm',
  'typeorm',
  'entity framework',
  'entity framework core',
  'ef core',
  'redis',
  'ahrs',
  'imu',
  'imu processing',
  'extended kalman filter (ekf)',
  'extended kalman filter',
  'ekf',
  'multiplicative extended kalman filter (mekf)',
  'multiplicative ekf (mekf)',
  'multiplicative ekf',
  'mekf',
  'complementary filters',
  'quaternion mathematics',
  'quaternions',
  'euler angles',
  'opengl',
  'nzy3d',
  'avalonia',
  'avalonia ui',
  '.net maui',
  'maui',
  'git',
  'git / github',
  'github',
  'docker',
  'kubernetes',
  'linux',
  'linux / ubuntu',
  'ubuntu',
  'debian',
  'proxmox',
  'proxmox ve',
  'stripe',
]);

/**
 * Normalizes heading text for matching against whitelist
 */
function normalizeHeadingText(raw: string): string {
  return raw
    .replace(/^#{1,6}\s*/, '')
    .replace(/^\[SECTION:\s*(.*)\]$/i, '$1')
    .replace(/^\[SUBSECTION:\s*(.*)\]$/i, '$1')
    .replace(/\*+/g, '')
    .replace(/^[:\s\-—–]+|[:\s\-—–]+$/g, '')
    .trim()
    .toLowerCase();
}

/**
 * Checks if a string is an approved Level-1 Section Heading
 */
function getLevel1SectionType(line: string): string | null {
  const norm = normalizeHeadingText(line);
  if (!norm) return null;

  // If this string is in the skill blacklist, IT CAN NEVER BE A SECTION HEADING!
  if (ABSOLUTE_SKILL_BLACKLIST.has(norm)) {
    return null;
  }

  // Exact map match
  if (SECTION_MAPPINGS[norm]) {
    return SECTION_MAPPINGS[norm];
  }

  // Substring search on whitelisted keys only
  for (const [key, section] of Object.entries(SECTION_MAPPINGS)) {
    if (norm === key || norm === `section: ${key}` || norm === `[section: ${key}]`) {
      return section;
    }
  }

  return null;
}

/**
 * Checks if a line in the SKILLS section is an approved subsection category
 */
function getSkillSubsectionCategory(line: string): string | null {
  const norm = normalizeHeadingText(line);
  if (!norm) return null;

  // Never match individual skills
  if (ABSOLUTE_SKILL_BLACKLIST.has(norm)) {
    return null;
  }

  if (SKILL_SUBSECTION_LOOKUP.has(norm)) {
    return SKILL_SUBSECTION_LOOKUP.get(norm)!;
  }

  for (const [key, canonical] of SKILL_SUBSECTION_LOOKUP.entries()) {
    if (norm.startsWith(key) || norm === key) {
      return canonical;
    }
  }

  return null;
}

// ============================================================================
// MAIN PARSE FUNCTION
// ============================================================================
export function parseResumeText(rawText: string, title?: string): Resume {
  const lines = rawText.split(/\r?\n/).map((l) => l.trimEnd());

  let fullName = '';
  let headline = '';
  let email = '';
  let phone = '';
  let location = '';
  let website = '';
  let github = '';
  let linkedin = '';
  let summary = '';

  const skills: SkillCategory[] = [];
  const experience: ExperienceItem[] = [];
  const projects: ProjectItem[] = [];
  const education: EducationItem[] = [];
  const certifications: CertificationItem[] = [];
  const languages: LanguageItem[] = [];
  const additionalSections: AdditionalSectionItem[] = [];

  // Temporary buffers for current items
  let currentSection = 'HEADER';
  let currentSkillCategory: SkillCategory | null = null;
  let currentExp: Partial<ExperienceItem> | null = null;
  let currentProj: Partial<ProjectItem> | null = null;
  let currentEdu: Partial<EducationItem> | null = null;
  let currentStrengthsBuffer: string[] = [];
  let currentTrainingBuffer: string[] = [];
  let currentAvailabilityBuffer: string[] = [];
  let currentReferencesBuffer: string[] = [];

  function finalizeExp() {
    if (currentExp && (currentExp.jobTitle || currentExp.company)) {
      experience.push({
        id: 'exp-' + Math.random().toString(36).substr(2, 9),
        jobTitle: currentExp.jobTitle || 'Software Engineer',
        company: currentExp.company || 'Company / Project',
        location: currentExp.location || '',
        startDate: currentExp.startDate || '',
        endDate: currentExp.endDate || '',
        description:
          currentExp.description && currentExp.description.length > 0
            ? currentExp.description
            : ['Engineering responsibilities and deliverables.'],
        flagged: currentExp.flagged || false,
      });
    }
    currentExp = null;
  }

  function finalizeProj() {
    if (currentProj && currentProj.name) {
      projects.push({
        id: 'proj-' + Math.random().toString(36).substr(2, 9),
        name: currentProj.name,
        description: currentProj.description || '',
        technologies: currentProj.technologies || [],
        url: currentProj.url || '',
      });
    }
    currentProj = null;
  }

  function finalizeEdu() {
    if (currentEdu && (currentEdu.institution || currentEdu.degree)) {
      education.push({
        id: 'edu-' + Math.random().toString(36).substr(2, 9),
        institution: currentEdu.institution || 'University / Institution',
        degree: currentEdu.degree || 'Degree / Program',
        dates: currentEdu.dates || '',
        description: currentEdu.description || '',
      });
    }
    currentEdu = null;
  }

  function finalizeSkills() {
    if (currentSkillCategory && currentSkillCategory.items.length > 0) {
      // Clean up duplicates and empty entries
      currentSkillCategory.items = Array.from(
        new Set(currentSkillCategory.items.map((it) => it.trim()).filter(Boolean))
      );
      if (
        !skills.some(
          (s) => s.category.toLowerCase() === currentSkillCategory!.category.toLowerCase()
        )
      ) {
        skills.push(currentSkillCategory);
      }
    }
    currentSkillCategory = null;
  }

  function finalizeAllBuffers() {
    finalizeExp();
    finalizeProj();
    finalizeEdu();
    finalizeSkills();
  }

  // Regex patterns
  const emailRegex = /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/i;
  const phoneRegex = /(\+?\d[\d\s\-\(\)]{8,}\d)/;
  const githubRegex = /((?:https?:\/\/)?(?:www\.)?github\.com\/[a-zA-Z0-9_-]+)/i;
  const linkedinRegex = /((?:https?:\/\/)?(?:www\.)?linkedin\.com\/in\/[a-zA-Z0-9_-]+)/i;

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];
    const line = rawLine.trim();
    if (!line) continue;

    // ------------------------------------------------------------------------
    // A. Explicit Semantic Structural Tags (e.g. [HEADER], [SECTION: ...], etc.)
    // ------------------------------------------------------------------------
    if (line.startsWith('[HEADER]')) {
      finalizeAllBuffers();
      currentSection = 'HEADER';
      continue;
    }

    if (line.startsWith('[NAME]')) {
      fullName = line.replace(/^\[NAME\]\s*/i, '').trim();
      continue;
    }

    if (line.startsWith('[TITLE]')) {
      headline = line.replace(/^\[TITLE\]\s*/i, '').trim();
      continue;
    }

    if (line.startsWith('[LOCATION]')) {
      const loc = line.replace(/^\[LOCATION\]\s*/i, '').trim();
      if (currentSection === 'HEADER' || !location) {
        location = loc;
      } else if (currentExp) {
        currentExp.location = loc;
      }
      continue;
    }

    if (line.startsWith('[PHONE]')) {
      phone = line.replace(/^\[PHONE\]\s*/i, '').trim();
      continue;
    }

    if (line.startsWith('[EMAIL]')) {
      email = line.replace(/^\[EMAIL\]\s*/i, '').trim();
      continue;
    }

    if (line.startsWith('[GITHUB]')) {
      github = line.replace(/^\[GITHUB\]\s*/i, '').trim();
      continue;
    }

    if (line.startsWith('[LINKEDIN]')) {
      linkedin = line.replace(/^\[LINKEDIN\]\s*/i, '').trim();
      continue;
    }

    // Explicit Level-1 Section Marker: [SECTION: ...]
    const sectionMatch = line.match(/^\[SECTION:\s*(.*?)\]/i);
    if (sectionMatch) {
      finalizeAllBuffers();
      const rawSecTitle = sectionMatch[1].trim();
      const mapped = getLevel1SectionType(rawSecTitle);
      if (mapped) {
        currentSection = mapped;
      } else {
        currentSection = rawSecTitle.toUpperCase();
      }
      continue;
    }

    // Explicit Level-2 Subsection Marker: [SUBSECTION: ...]
    const subsectionMatch = line.match(/^\[SUBSECTION:\s*(.*?)\]/i);
    if (subsectionMatch) {
      const subTitle = subsectionMatch[1].trim();
      if (currentSection === 'SKILLS') {
        finalizeSkills();
        const cat = getSkillSubsectionCategory(subTitle) || subTitle;
        currentSkillCategory = { category: cat, items: [] };
        continue;
      }
      // For experience / projects, it acts as a subheader
      continue;
    }

    // Explicit Tag Items
    if (line.startsWith('[SKILL]')) {
      const item = line.replace(/^\[SKILL\]\s*/i, '').trim();
      if (item) {
        if (!currentSkillCategory) {
          currentSkillCategory = { category: 'Technical Skills', items: [] };
        }
        currentSkillCategory.items.push(item);
      }
      continue;
    }

    if (line.startsWith('[JOB]')) {
      finalizeExp();
      currentExp = { description: [] };
      continue;
    }

    if (line.startsWith('[JOB TITLE]')) {
      if (!currentExp) currentExp = { description: [] };
      currentExp.jobTitle = line.replace(/^\[JOB TITLE\]\s*/i, '').trim();
      continue;
    }

    if (line.startsWith('[COMPANY / PROJECT]') || line.startsWith('[COMPANY]')) {
      if (!currentExp) currentExp = { description: [] };
      currentExp.company = line.replace(/^\[COMPANY(?:\s*\/\s*PROJECT)?\]\s*/i, '').trim();
      continue;
    }

    if (line.startsWith('[DATES]')) {
      const dStr = line.replace(/^\[DATES\]\s*/i, '').trim();
      if (currentExp) {
        const dParts = dStr.split(/–|—|-/);
        currentExp.startDate = dParts[0]?.trim() || dStr;
        currentExp.endDate = dParts[1]?.trim() || '';
      } else if (currentEdu) {
        currentEdu.dates = dStr;
      }
      continue;
    }

    if (line.startsWith('[BULLET]')) {
      const bText = line.replace(/^\[BULLET\]\s*/i, '').trim();
      if (bText) {
        if (currentSection === 'EXPERIENCE') {
          if (!currentExp) currentExp = { description: [] };
          currentExp.description = currentExp.description || [];
          currentExp.description.push(bText);
        } else if (currentSection === 'PROJECTS') {
          if (currentProj) {
            currentProj.description = currentProj.description
              ? `${currentProj.description}\n• ${bText}`
              : `• ${bText}`;
          }
        } else if (currentSection === 'STRENGTHS') {
          currentStrengthsBuffer.push(`• ${bText}`);
        } else if (currentSection === 'AVAILABILITY') {
          currentAvailabilityBuffer.push(`• ${bText}`);
        } else if (currentSection === 'REFERENCES') {
          currentReferencesBuffer.push(`• ${bText}`);
        }
      }
      continue;
    }

    if (line.startsWith('[TECHNOLOGIES]')) {
      const techStr = line.replace(/^\[TECHNOLOGIES\]\s*/i, '').trim();
      if (currentExp) {
        currentExp.description = currentExp.description || [];
        currentExp.description.push(`Technologies: ${techStr}`);
      } else if (currentProj) {
        currentProj.technologies = techStr
          .split(/[,•|]/)
          .map((t) => t.trim())
          .filter(Boolean);
      }
      continue;
    }

    if (line.startsWith('[PROJECT]')) {
      finalizeProj();
      currentProj = { name: '', description: '', technologies: [] };
      continue;
    }

    if (line.startsWith('[PROJECT TITLE]')) {
      if (!currentProj) currentProj = { name: '', description: '', technologies: [] };
      currentProj.name = line.replace(/^\[PROJECT TITLE\]\s*/i, '').trim();
      continue;
    }

    if (line.startsWith('[TECHNOLOGY / PLATFORM]')) {
      if (!currentProj) currentProj = { name: '', description: '', technologies: [] };
      const tStr = line.replace(/^\[TECHNOLOGY\s*\/\s*PLATFORM\]\s*/i, '').trim();
      currentProj.technologies = tStr
        .split(/[,•|]/)
        .map((t) => t.trim())
        .filter(Boolean);
      continue;
    }

    if (line.startsWith('[EDUCATION]')) {
      finalizeEdu();
      currentEdu = { institution: '', degree: '', dates: '', description: '' };
      continue;
    }

    if (line.startsWith('[PROGRAM / FIELD]')) {
      if (!currentEdu) currentEdu = { institution: '', degree: '', dates: '', description: '' };
      currentEdu.degree = line.replace(/^\[PROGRAM\s*\/\s*FIELD\]\s*/i, '').trim();
      continue;
    }

    if (line.startsWith('[INSTITUTION]')) {
      if (!currentEdu) currentEdu = { institution: '', degree: '', dates: '', description: '' };
      currentEdu.institution = line.replace(/^\[INSTITUTION\]\s*/i, '').trim();
      continue;
    }

    if (line.startsWith('[TRAINING]')) {
      continue;
    }

    if (line.startsWith('[TRAINING ITEM]')) {
      const tItem = line.replace(/^\[TRAINING ITEM\]\s*/i, '').trim();
      currentTrainingBuffer.push(`• ${tItem}`);
      certifications.push({
        id: 'cert-' + Math.random().toString(36).substr(2, 9),
        name: tItem.split(/—|-/)[0]?.trim() || tItem,
        issuer: tItem.split(/—|-/)[1]?.trim() || 'ACECR Sharif University Training Center',
        date: tItem.match(/\d{4}/)?.[0] || 'Certified',
      });
      continue;
    }

    if (line.startsWith('[LANGUAGE]')) {
      const lName = line.replace(/^\[LANGUAGE\]\s*/i, '').trim();
      languages.push({ language: lName, level: 'Proficient' });
      continue;
    }

    if (line.startsWith('[LEVEL]')) {
      const lLevel = line.replace(/^\[LEVEL\]\s*/i, '').trim();
      if (languages.length > 0) {
        languages[languages.length - 1].level = lLevel;
      }
      continue;
    }

    if (line.startsWith('[DESCRIPTION]')) {
      const dContent = line.replace(/^\[DESCRIPTION\]\s*/i, '').trim();
      if (dContent) {
        if (currentSection === 'SUMMARY') {
          summary = summary ? `${summary} ${dContent}` : dContent;
        } else if (currentSection === 'EXPERIENCE' && currentExp) {
          currentExp.description = currentExp.description || [];
          currentExp.description.push(dContent);
        } else if (currentSection === 'PROJECTS' && currentProj) {
          currentProj.description = dContent;
        } else if (currentSection === 'AVAILABILITY') {
          currentAvailabilityBuffer.push(dContent);
        } else if (currentSection === 'REFERENCES') {
          currentReferencesBuffer.push(dContent);
        }
      }
      continue;
    }

    // ------------------------------------------------------------------------
    // B. Check If Line Matches Major Whitelisted Level-1 Section Heading
    // ------------------------------------------------------------------------
    // Strict requirement: DO NOT infer headings from lines unless they match the whitelist!
    const isMarkdownHeading = line.startsWith('#');
    const potentialHeadingText = line.replace(/^#{1,6}\s*/, '').trim();
    const matchedLevel1 = getLevel1SectionType(potentialHeadingText);

    if (matchedLevel1) {
      finalizeAllBuffers();
      currentSection = matchedLevel1;
      continue;
    }

    // ------------------------------------------------------------------------
    // C. Section-Specific Line Handling
    // ------------------------------------------------------------------------
    if (currentSection === 'HEADER') {
      if (i === 0 && !fullName && !line.includes('@')) {
        fullName = line.replace(/^#+\s*/, '').replace(/\*+/g, '').trim();
        continue;
      }

      const eMatch = line.match(emailRegex);
      if (eMatch && !email) email = eMatch[1];

      const pMatch = line.match(phoneRegex);
      if (pMatch && !phone) phone = pMatch[1];

      const ghMatch = line.match(githubRegex);
      if (ghMatch && !github) github = ghMatch[1];

      const liMatch = line.match(linkedinRegex);
      if (liMatch && !linkedin) linkedin = liMatch[1];

      if (line.startsWith('**') && line.endsWith('**') && !headline) {
        headline = line.replace(/\*/g, '').trim();
      } else if (!headline && !line.includes('@') && !line.includes('http') && line.length < 100) {
        headline = line.replace(/^#+\s*/, '').trim();
      } else if (
        !location &&
        (line.includes('Armenia') ||
          line.includes('Yerevan') ||
          line.includes('Remote') ||
          line.includes('Iran'))
      ) {
        location = line.replace(/^[|•\-\s]+|[|•\-\s]+$/g, '').trim();
      }
      continue;
    }

    if (currentSection === 'SUMMARY') {
      const cleanLine = line.replace(/^#+\s*/, '').trim();
      summary = summary ? `${summary} ${cleanLine}` : cleanLine;
      continue;
    }

    if (currentSection === 'SKILLS') {
      // Check if line is a skill category subheader (e.g. ### Programming Languages, or "Programming Languages:")
      const cleanLine = line.replace(/^#{1,6}\s*/, '').replace(/^[-*•]\s*/, '').trim();
      const isSub = getSkillSubsectionCategory(cleanLine.replace(/:$/, ''));

      if (isSub) {
        finalizeSkills();
        currentSkillCategory = { category: isSub, items: [] };

        // If the line contains items after a colon, e.g. "Programming Languages: C#, Java, Python"
        if (cleanLine.includes(':')) {
          const parts = cleanLine.split(':');
          const itemsStr = parts.slice(1).join(':').trim();
          if (itemsStr) {
            const parsedItems = itemsStr
              .split(/[,•|]/)
              .map((s) => s.trim())
              .filter(Boolean);
            currentSkillCategory.items.push(...parsedItems);
          }
        }
        continue;
      }

      // Check if line has "Category: Item1, Item2" format
      if (cleanLine.includes(':') && !cleanLine.startsWith('http')) {
        const parts = cleanLine.split(':');
        const catCandidate = parts[0].trim();
        const matchedCat = getSkillSubsectionCategory(catCandidate) || catCandidate;
        const itemsStr = parts.slice(1).join(':').trim();

        if (
          !ABSOLUTE_SKILL_BLACKLIST.has(catCandidate.toLowerCase()) &&
          matchedCat.length < 40
        ) {
          finalizeSkills();
          const parsedItems = itemsStr
            .split(/[,•|]/)
            .map((s) => s.trim())
            .filter(Boolean);
          skills.push({ category: matchedCat, items: parsedItems });
          continue;
        }
      }

      // Otherwise, these are skill items belonging to the active category
      const skillItems = cleanLine
        .split(/[,•|]/)
        .map((s) => s.trim())
        .filter(Boolean);

      if (skillItems.length > 0) {
        if (!currentSkillCategory) {
          currentSkillCategory = { category: 'Programming Languages', items: [] };
        }
        currentSkillCategory.items.push(...skillItems);
      }
      continue;
    }

    if (currentSection === 'EXPERIENCE') {
      const isBullet =
        line.startsWith('-') ||
        line.startsWith('*') ||
        line.startsWith('•') ||
        line.startsWith('[BULLET]');

      const subHeaderMatch = line.match(/^#{3,4}\s+(.*)/);
      const isHeaderLine =
        Boolean(subHeaderMatch) ||
        (!isBullet &&
          (line.includes('|') ||
            line.match(/\d{4}\s*[-–—]\s*(\d{4}|Present|Current|Ներկա)/i)));

      if (isHeaderLine) {
        finalizeExp();
        currentExp = { description: [] };

        const textLine = subHeaderMatch ? subHeaderMatch[1] : line;
        const parts = textLine.split(/\||–|—/);

        if (subHeaderMatch) {
          currentExp.jobTitle = textLine.replace(/\*/g, '').trim();
        } else if (parts.length >= 2) {
          currentExp.company = parts[0].replace(/\*/g, '').trim();
          const rest = parts.slice(1).join(' ').trim();
          const dateMatch =
            rest.match(/(\d{4}\s*[-–—]\s*(?:\d{4}|Present|Current|Ներկա))/i) ||
            rest.match(/(\d{4})/);
          if (dateMatch) {
            currentExp.startDate = dateMatch[1];
          }
          currentExp.location = rest
            .replace(dateMatch ? dateMatch[0] : '', '')
            .replace(/[\(\)]/g, '')
            .trim();
        } else {
          currentExp.jobTitle = textLine.replace(/\*/g, '').trim();
        }
      } else if (currentExp) {
        const bulletText = line.replace(/^[-*•]\s*/, '').trim();
        if (bulletText) {
          currentExp.description = currentExp.description || [];
          currentExp.description.push(bulletText);
        }
      }
      continue;
    }

    if (currentSection === 'PROJECTS') {
      const isBullet =
        line.startsWith('-') ||
        line.startsWith('*') ||
        line.startsWith('•') ||
        line.startsWith('[BULLET]');

      if (line.startsWith('###') || (!isBullet && !currentProj)) {
        finalizeProj();
        currentProj = {
          name: line.replace(/^###\s*/, '').replace(/\*/g, '').trim(),
          description: '',
          technologies: [],
        };
      } else if (currentProj) {
        const bulletText = line.replace(/^[-*•]\s*/, '').trim();
        if (
          bulletText.toLowerCase().startsWith('technologies:') ||
          bulletText.toLowerCase().startsWith('tech:')
        ) {
          currentProj.technologies = bulletText
            .split(':')[1]
            .split(/[,•|]/)
            .map((t) => t.trim())
            .filter(Boolean);
        } else if (bulletText.startsWith('http')) {
          currentProj.url = bulletText;
        } else if (!currentProj.description) {
          currentProj.description = bulletText;
        } else {
          currentProj.description += '\n• ' + bulletText;
        }
      }
      continue;
    }

    if (currentSection === 'EDUCATION') {
      const isBullet = line.startsWith('-') || line.startsWith('*') || line.startsWith('•');
      if (line.startsWith('###') || (!isBullet && !currentEdu)) {
        finalizeEdu();
        const parts = line.replace(/^###\s*/, '').split(/[-–—,|]/);
        currentEdu = {
          institution: parts[0]?.replace(/\*/g, '').trim() || 'Azad University',
          degree: parts[1]?.replace(/\*/g, '').trim() || 'Electronic Engineering Studies',
          dates: parts[2]?.trim() || 'Coursework Completed',
        };
      } else if (currentEdu) {
        currentEdu.description =
          (currentEdu.description ? currentEdu.description + ' ' : '') +
          line.replace(/^[-*•]\s*/, '').trim();
      }
      continue;
    }

    if (currentSection === 'TRAINING' || currentSection === 'CERTIFICATIONS') {
      const clean = line.replace(/^[-*•]\s*/, '').trim();
      currentTrainingBuffer.push(`• ${clean}`);
      const parts = clean.split(/[-–—,|]/);
      certifications.push({
        id: 'cert-' + Math.random().toString(36).substr(2, 9),
        name: parts[0]?.replace(/\*/g, '').trim() || clean,
        issuer: parts[1]?.trim() || 'Sharif University Training Center (ACECR)',
        date: clean.match(/\d{4}/)?.[0] || 'Certified',
      });
      continue;
    }

    if (currentSection === 'LANGUAGES') {
      const clean = line.replace(/^[-*•]\s*/, '').trim();
      if (clean.includes(':')) {
        const [lang, level] = clean.split(':');
        languages.push({ language: lang.trim(), level: level.trim() });
      } else {
        languages.push({ language: clean, level: 'Proficient' });
      }
      continue;
    }

    if (currentSection === 'STRENGTHS') {
      const clean = line.replace(/^[-*•]\s*/, '').trim();
      if (clean) currentStrengthsBuffer.push(`• ${clean}`);
      continue;
    }

    if (currentSection === 'AVAILABILITY') {
      const clean = line.replace(/^[-*•]\s*/, '').trim();
      if (clean) currentAvailabilityBuffer.push(`• ${clean}`);
      continue;
    }

    if (currentSection === 'REFERENCES') {
      const clean = line.replace(/^[-*•]\s*/, '').trim();
      if (clean) currentReferencesBuffer.push(`• ${clean}`);
      continue;
    }
  }

  finalizeAllBuffers();

  // Create additional sections for approved sections if content exists
  if (currentStrengthsBuffer.length > 0) {
    additionalSections.push({
      id: 'sec-strengths',
      title: 'Technical Strengths',
      content: currentStrengthsBuffer.join('\n'),
      order: 1,
    });
  }

  if (currentTrainingBuffer.length > 0 && certifications.length === 0) {
    additionalSections.push({
      id: 'sec-training',
      title: 'Professional Training',
      content: currentTrainingBuffer.join('\n'),
      order: 2,
    });
  }

  if (currentAvailabilityBuffer.length > 0) {
    additionalSections.push({
      id: 'sec-availability',
      title: 'Availability & Work Authorization',
      content: currentAvailabilityBuffer.join('\n'),
      order: 3,
    });
  }

  if (currentReferencesBuffer.length > 0) {
    additionalSections.push({
      id: 'sec-references',
      title: 'References',
      content: currentReferencesBuffer.join('\n'),
      order: 4,
    });
  }

  // Ensure skills array is clean and categories are non-empty
  const sanitizedSkills = skills.filter((s) => s.items && s.items.length > 0);

  return {
    id: 'parsed-' + Date.now(),
    meta: {
      title: title || (fullName ? `${fullName}'s Resume` : 'Parsed Resume'),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      tags: ['Imported', 'ATS-Optimized'],
    },
    personal: {
      fullName: fullName || 'PAARSAH SOROURI JAM',
      headline:
        headline ||
        'Software Engineer | Full-Stack Developer | .NET / Java | React / Next.js | Flutter | Sensor Processing & 3D Visualization',
      location: location || 'Yerevan, Armenia',
      email: email || 'paarsah.sorouri@gmail.com',
      phone: phone || '+374 93 067 011',
      website: website || '',
      github: github || 'https://github.com/PaarsahJam',
      linkedin: linkedin || 'linkedin.com/in/paarsah-sorouri-jam-2892922a2',
    },
    summary: summary || '',
    skills:
      sanitizedSkills.length > 0
        ? sanitizedSkills
        : [
            {
              category: 'Programming Languages',
              items: [
                'C#',
                'Java',
                'JavaScript / ES6+',
                'TypeScript',
                'Python',
                'Dart',
                'C/C++ — previous project experience',
              ],
            },
          ],
    experience,
    projects,
    education,
    certifications,
    languages,
    additionalSections,
    sectionOrder: [
      'summary',
      'skills',
      'experience',
      'projects',
      'education',
      'certifications',
      'languages',
      'additional',
    ],
    hiddenSections: [],
  };
}

