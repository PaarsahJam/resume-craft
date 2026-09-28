import { create } from 'zustand';
import { sampleResume, fakeTemplateResume, laraMullerSampleResume } from '../data/sampleResume';
import {
  Resume,
  TemplateId,
  TemplateOptions,
  ActiveTab,
  AppView,
  JobDescriptionMatch,
  CoverLetter,
} from '../types';

const STORAGE_KEY_RESUMES = 'resumes_craft_v1_resumes';
const STORAGE_KEY_ACTIVE = 'resumes_craft_v1_active_id';
const STORAGE_KEY_OPTIONS = 'resumes_craft_v1_options';
const STORAGE_KEY_COVER_LETTERS = 'resumes_craft_v1_cover_letters';

const defaultOptions: TemplateOptions = {
  paperSize: 'a4',
  margins: 'normal',
  spacing: 'normal',
  font: 'inter',
  fontSize: 'md',
  accentColor: '#2563eb',
  fitToOnePage: false,
  atsMode: false,
  language: 'en',
};

// Every template maps over these arrays unguarded, and the payload can come
// from localStorage or from an AI response, so normalise on the way in.
function normalizeResume(r: any, fallbackId: string): Resume {
  const arr = (v: unknown) => (Array.isArray(v) ? v : []);
  const meta = (r?.meta ?? {}) as Partial<Resume['meta']>;

  return {
    ...r,
    id: r?.id || fallbackId,
    meta: {
      title: meta.title || 'Untitled Resume',
      createdAt: meta.createdAt || new Date().toISOString(),
      updatedAt: meta.updatedAt || new Date().toISOString(),
      tags: arr(meta.tags),
    },
    personal: {
      fullName: r?.personal?.fullName || '',
      headline: r?.personal?.headline || '',
      ...r?.personal,
    },
    summary: r?.summary || '',
    skills: arr(r?.skills),
    experience: arr(r?.experience),
    projects: arr(r?.projects),
    education: arr(r?.education),
    certifications: arr(r?.certifications),
    languages: arr(r?.languages),
    additionalSections: arr(r?.additionalSections),
    sectionOrder: arr(r?.sectionOrder).length > 0 ? arr(r?.sectionOrder) : [...sampleResume.sectionOrder],
    hiddenSections: arr(r?.hiddenSections),
  };
}

function loadInitialResumes(): Resume[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_RESUMES);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        // If the demo sample resume was previously stored, replace it with the updated authoritative version
        const list = parsed.map((r: Resume, i: number) =>
          r?.id === sampleResume.id ? sampleResume : normalizeResume(r, r?.id || `resume-restored-${i}`)
        );
        // Ensure both sample resumes are available
        if (!list.some((r: Resume) => r.id === sampleResume.id)) {
          list.unshift(sampleResume);
        }
        if (!list.some((r: Resume) => r.id === laraMullerSampleResume.id)) {
          list.push(laraMullerSampleResume);
        }
        return list;
      }
    }
  } catch (e) {
    console.warn('Failed to load saved resumes from localStorage', e);
  }
  return [sampleResume, laraMullerSampleResume];
}

function loadInitialOptions(): TemplateOptions {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_OPTIONS);
    if (raw) return { ...defaultOptions, ...JSON.parse(raw) };
  } catch (e) {
    console.warn('Failed to load saved options', e);
  }
  return defaultOptions;
}

function loadInitialCoverLetters(): CoverLetter[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_COVER_LETTERS);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.warn('Failed to load cover letters', e);
  }
  return [];
}

// Persisting to localStorage on every keystroke is expensive, so writes are
// debounced. The in-memory state is still updated synchronously on every call,
// otherwise a second edit within the debounce window would be computed from a
// stale snapshot and silently discard the first edit.
let persistTimer: ReturnType<typeof setTimeout> | null = null;
let pendingPersist: Resume[] | null = null;

function persistResumes(resumes: Resume[]) {
  pendingPersist = resumes;
  if (persistTimer) clearTimeout(persistTimer);
  persistTimer = setTimeout(() => {
    persistTimer = null;
    if (pendingPersist) {
      try {
        localStorage.setItem(STORAGE_KEY_RESUMES, JSON.stringify(pendingPersist));
      } catch (e) {
        console.warn('Failed to persist resumes', e);
      }
      pendingPersist = null;
    }
  }, 300);
}

let autosaveTimer: ReturnType<typeof setTimeout> | null = null;

function markAutosaved() {
  if (autosaveTimer) clearTimeout(autosaveTimer);
  autosaveTimer = setTimeout(() => {
    autosaveTimer = null;
    useResumeStore.setState({ autosaveStatus: 'saved' });
  }, 300);
}

interface ResumeState {
  resumes: Resume[];
  activeResumeId: string;
  activeView: AppView;
  activeTab: ActiveTab;
  selectedTemplate: TemplateId;
  templateOptions: TemplateOptions;
  autosaveStatus: 'saved' | 'saving' | 'idle';
  
  // History stack for undo/redo
  history: Resume[];
  historyIndex: number;

  // Job Description analysis
  jobDescriptionInput: string;
  jdMatch: JobDescriptionMatch | null;

  // Cover letter module
  coverLetter: string;
  coverLetters: CoverLetter[];
  activeCoverLetterId: string | null;

  // Diff view
  diffResumeIds: [string, string] | null;

  // Privacy consent gate
  aiConsentGiven: boolean;

  // Actions
  setActiveResumeId: (id: string) => void;
  setActiveView: (view: AppView) => void;
  setActiveTab: (tab: ActiveTab) => void;
  setSelectedTemplate: (t: TemplateId) => void;
  setTemplateOptions: (opts: Partial<TemplateOptions>) => void;
  
  updateActiveResume: (updaterOrPartial: Partial<Resume> | ((prev: Resume) => Resume)) => void;
  createResume: (newResume?: Partial<Resume>) => string;
  duplicateResume: (id: string) => string;
  deleteResume: (id: string) => void;
  renameResume: (id: string, newTitle: string) => void;
  importResume: (resume: Resume) => void;

  undo: () => void;
  redo: () => void;

  setJobDescriptionInput: (jd: string) => void;
  setJdMatch: (match: JobDescriptionMatch | null) => void;

  setCoverLetter: (letter: string) => void;
  saveCoverLetter: (letter: Partial<CoverLetter>) => string;
  updateCoverLetter: (id: string, body: string) => void;
  deleteCoverLetter: (id: string) => void;
  setActiveCoverLetterId: (id: string | null) => void;

  setDiffResumeIds: (ids: [string, string] | null) => void;
  setAiConsentGiven: (given: boolean) => void;
}

export const useResumeStore = create<ResumeState>((set, get) => {
  const initialResumes = loadInitialResumes();
  const initialActiveId =
    localStorage.getItem(STORAGE_KEY_ACTIVE) || initialResumes[0]?.id || sampleResume.id;

  const currentActiveResume = initialResumes.find((r) => r.id === initialActiveId) || initialResumes[0];

  return {
    resumes: initialResumes,
    activeResumeId: currentActiveResume.id,
    activeView: 'builder',
    activeTab: 'editor',
    selectedTemplate: 'modern-tech',
    templateOptions: loadInitialOptions(),
    autosaveStatus: 'saved',

    history: [currentActiveResume],
    historyIndex: 0,

    jobDescriptionInput: '',
    jdMatch: null,

    coverLetter: '',
    coverLetters: loadInitialCoverLetters(),
    activeCoverLetterId: null,

    diffResumeIds: null,
    aiConsentGiven: false,

    setActiveResumeId: (id) => {
      const { resumes } = get();
      const target = resumes.find((r) => r.id === id);
      if (target) {
        localStorage.setItem(STORAGE_KEY_ACTIVE, id);
        set({
          activeResumeId: id,
          history: [target],
          historyIndex: 0,
        });
      }
    },

    // Leaving the diff view through the header must also clear the selection,
    // otherwise the comparison keeps covering the workspace.
    setActiveView: (view) => set({ activeView: view, ...(view === 'diff' ? {} : { diffResumeIds: null }) }),
    setActiveTab: (tab) => set({ activeTab: tab }),
    setSelectedTemplate: (selectedTemplate) => set({ selectedTemplate }),

    setTemplateOptions: (opts) => {
      const next = { ...get().templateOptions, ...opts };
      localStorage.setItem(STORAGE_KEY_OPTIONS, JSON.stringify(next));
      set({ templateOptions: next });
    },

    updateActiveResume: (updaterOrPartial) => {
      set({ autosaveStatus: 'saving' });
      const { resumes, activeResumeId, history, historyIndex } = get();
      const targetIndex = resumes.findIndex((r) => r.id === activeResumeId);
      if (targetIndex === -1) {
        set({ autosaveStatus: 'saved' });
        return;
      }

      const currentResume = resumes[targetIndex];
      const nextData =
        typeof updaterOrPartial === 'function'
          ? updaterOrPartial(currentResume)
          : { ...currentResume, ...updaterOrPartial };

      const updatedResume: Resume = {
        ...nextData,
        meta: {
          ...currentResume.meta,
          ...nextData.meta,
          updatedAt: new Date().toISOString(),
        },
      };

      const updatedResumes = [...resumes];
      updatedResumes[targetIndex] = updatedResume;

      // History stack truncation and append
      const truncatedHistory = history.slice(0, historyIndex + 1);
      const newHistory = [...truncatedHistory, updatedResume].slice(-50); // limit 50

      persistResumes(updatedResumes);
      markAutosaved();

      set({
        resumes: updatedResumes,
        history: newHistory,
        historyIndex: newHistory.length - 1,
      });
    },

    createResume: (newResumeData) => {
      const { resumes } = get();
      const newId = 'resume-' + Date.now();
      // The incoming payload's `id`/`meta` must not win: `ImportModal` hands us a
      // fully parsed resume, and letting its `id` through would leave
      // `activeResumeId` pointing at a resume that does not exist in the list.
      const created: Resume = {
        ...fakeTemplateResume,
        ...newResumeData,
        id: newId,
        meta: {
          ...newResumeData?.meta,
          title: newResumeData?.meta?.title || `Untitled Resume ${resumes.length + 1}`,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          tags: newResumeData?.meta?.tags || ['Draft'],
        },
      };

      const updatedResumes = [created, ...resumes];
      persistResumes(updatedResumes);
      localStorage.setItem(STORAGE_KEY_ACTIVE, newId);

      set({
        resumes: updatedResumes,
        activeResumeId: newId,
        history: [created],
        historyIndex: 0,
        activeView: 'builder',
        activeTab: 'editor',
      });

      return newId;
    },

    duplicateResume: (id) => {
      const { resumes } = get();
      const target = resumes.find((r) => r.id === id);
      if (!target) return id;

      const newId = 'resume-' + Date.now();
      const duplicated: Resume = {
        ...JSON.parse(JSON.stringify(target)),
        id: newId,
        meta: {
          ...target.meta,
          title: `${target.meta.title} (Copy)`,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      };

      const updatedResumes = [duplicated, ...resumes];
      persistResumes(updatedResumes);

      set({ resumes: updatedResumes });
      return newId;
    },

    deleteResume: (id) => {
      const { resumes, activeResumeId } = get();

      const filtered = resumes.filter((r) => r.id !== id);
      let nextActiveId = activeResumeId;
      let finalResumes = filtered;

      if (filtered.length === 0) {
        const newId = 'resume-' + Date.now();
        const defaultResume: Resume = {
          ...fakeTemplateResume,
          id: newId,
          meta: {
            title: 'Untitled Resume',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            tags: ['Draft'],
          },
        };
        finalResumes = [defaultResume];
        nextActiveId = newId;
      } else if (activeResumeId === id) {
        nextActiveId = filtered[0].id;
      }

      persistResumes(finalResumes);
      localStorage.setItem(STORAGE_KEY_ACTIVE, nextActiveId);

      const activeObj = finalResumes.find((r) => r.id === nextActiveId) || finalResumes[0];

      set({
        resumes: finalResumes,
        activeResumeId: nextActiveId,
        history: [activeObj],
        historyIndex: 0,
      });
    },

    renameResume: (id, newTitle) => {
      const { resumes } = get();
      const updated = resumes.map((r) =>
        r.id === id ? { ...r, meta: { ...r.meta, title: newTitle, updatedAt: new Date().toISOString() } } : r
      );
      persistResumes(updated);
      set({ resumes: updated });
    },

    importResume: (resume) => {
      const { resumes } = get();
      const updatedResumes = [resume, ...resumes];
      persistResumes(updatedResumes);
      localStorage.setItem(STORAGE_KEY_ACTIVE, resume.id);

      set({
        resumes: updatedResumes,
        activeResumeId: resume.id,
        history: [resume],
        historyIndex: 0,
        activeView: 'builder',
        activeTab: 'editor',
      });
    },

    undo: () => {
      const { history, historyIndex, resumes, activeResumeId } = get();
      if (historyIndex > 0) {
        const prevIndex = historyIndex - 1;
        const prevResume = history[prevIndex];

        const updatedResumes = resumes.map((r) => (r.id === activeResumeId ? prevResume : r));
        persistResumes(updatedResumes);

        set({
          resumes: updatedResumes,
          historyIndex: prevIndex,
        });
      }
    },

    redo: () => {
      const { history, historyIndex, resumes, activeResumeId } = get();
      if (historyIndex < history.length - 1) {
        const nextIndex = historyIndex + 1;
        const nextResume = history[nextIndex];

        const updatedResumes = resumes.map((r) => (r.id === activeResumeId ? nextResume : r));
        persistResumes(updatedResumes);

        set({
          resumes: updatedResumes,
          historyIndex: nextIndex,
        });
      }
    },

    setJobDescriptionInput: (jd) => set({ jobDescriptionInput: jd }),
    setJdMatch: (match) => set({ jdMatch: match }),

    setCoverLetter: (coverLetter) => set({ coverLetter }),

    saveCoverLetter: (letterData) => {
      const { coverLetters, activeResumeId } = get();
      const newId = 'cl-' + Date.now();
      const created: CoverLetter = {
        id: newId,
        resumeId: activeResumeId,
        recipientName: letterData.recipientName || 'Hiring Manager',
        companyName: letterData.companyName || 'Target Company',
        jobTitle: letterData.jobTitle || 'Role Title',
        jobDescription: letterData.jobDescription || '',
        body: letterData.body || '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const updated = [created, ...coverLetters];
      localStorage.setItem(STORAGE_KEY_COVER_LETTERS, JSON.stringify(updated));
      set({ coverLetters: updated, activeCoverLetterId: newId });
      return newId;
    },

    updateCoverLetter: (id, body) => {
      const { coverLetters } = get();
      const updated = coverLetters.map((cl) =>
        cl.id === id ? { ...cl, body, updatedAt: new Date().toISOString() } : cl
      );
      localStorage.setItem(STORAGE_KEY_COVER_LETTERS, JSON.stringify(updated));
      set({ coverLetters: updated });
    },

    deleteCoverLetter: (id) => {
      const { coverLetters, activeCoverLetterId } = get();
      const filtered = coverLetters.filter((cl) => cl.id !== id);
      localStorage.setItem(STORAGE_KEY_COVER_LETTERS, JSON.stringify(filtered));
      set({
        coverLetters: filtered,
        activeCoverLetterId: activeCoverLetterId === id ? null : activeCoverLetterId,
      });
    },

    setActiveCoverLetterId: (id) => set({ activeCoverLetterId: id }),

    setDiffResumeIds: (ids) => set({ diffResumeIds: ids, activeView: ids ? 'diff' : 'builder' }),
    setAiConsentGiven: (given) => set({ aiConsentGiven: given }),
  };
});
