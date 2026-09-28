import React, { useState } from 'react';
import { useResumeStore } from './store/useResumeStore';
import { ResumeBuilderView } from './components/builder/ResumeBuilderView';
import { ResumeDashboard } from './components/dashboard/ResumeDashboard';
import { VersionDiffModal } from './components/dashboard/VersionDiffModal';
import { ResumeScorePanel } from './components/score/ResumeScorePanel';
import { CoverLetterModule } from './components/coverletter/CoverLetterModule';
import { ImportModal } from './components/import/ImportModal';
import {
  FileText,
  LayoutDashboard,
  Target,
  FileCode,
  Upload,
  Plus,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';

export default function App() {
  const {
    activeView,
    setActiveView,
    createResume,
    diffResumeIds,
    autosaveStatus,
  } = useResumeStore();

  const [isImportOpen, setIsImportOpen] = useState(false);

  return (
    <div className="h-screen w-screen flex flex-col bg-[#F1F3F5] font-sans text-[#212529] overflow-hidden">
      {/* Clean Utility Header */}
      <header className="flex items-center justify-between px-6 py-3 bg-white border-b border-[#E9ECEF] h-[64px] shrink-0 z-30">
        {/* Brand & Version Badge */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center text-white font-bold text-lg shadow-sm">
            R
          </div>
          <div className="flex items-center gap-2">
            <h1 className="text-base sm:text-lg font-semibold tracking-tight text-[#212529]">
              CV-Architect Pro
            </h1>
            <span className="px-2 py-0.5 bg-[#E7F5FF] text-blue-700 text-xs font-medium rounded hidden sm:inline-block">
              v2.1.0
            </span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex items-center gap-1 bg-[#F8F9FA] p-1 rounded-md border border-[#E9ECEF]">
          <button
            type="button"
            onClick={() => setActiveView('builder')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors flex items-center gap-1.5 ${
              activeView === 'builder'
                ? 'bg-white text-blue-600 font-semibold shadow-xs border border-gray-200'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Editor</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveView('dashboard')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors flex items-center gap-1.5 ${
              activeView === 'dashboard'
                ? 'bg-white text-blue-600 font-semibold shadow-xs border border-gray-200'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Dashboard</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveView('score')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors flex items-center gap-1.5 ${
              activeView === 'score'
                ? 'bg-white text-blue-600 font-semibold shadow-xs border border-gray-200'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            <Target className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Score & Match</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveView('cover-letter')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors flex items-center gap-1.5 ${
              activeView === 'cover-letter'
                ? 'bg-white text-blue-600 font-semibold shadow-xs border border-gray-200'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            <FileCode className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Cover Letter</span>
          </button>
        </nav>

        {/* Status Indicator & Utility Actions */}
        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center text-xs text-gray-500 gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span>{autosaveStatus === 'saving' ? 'Saving...' : 'Autosaved'}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsImportOpen(true)}
              className="px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-100 rounded-md border border-gray-300 transition-colors flex items-center gap-1.5"
              title="Import Resume"
            >
              <Upload className="w-3.5 h-3.5 text-blue-600" />
              <span className="hidden sm:inline">Import</span>
            </button>

            <button
              type="button"
              onClick={() => {
                createResume();
                setActiveView('builder');
              }}
              className="px-3.5 py-1.5 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md shadow-xs transition-colors flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">New Resume</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main View Workspace */}
      <main className="flex-1 overflow-hidden relative">
        {activeView === 'diff' ? (
          diffResumeIds ? (
            <VersionDiffModal />
          ) : (
            <div className="p-12 text-center text-slate-500 font-medium">
              Select two resumes from the dashboard to compare them.
            </div>
          )
        ) : activeView === 'builder' ? (
          <ResumeBuilderView />
        ) : activeView === 'dashboard' ? (
          <ResumeDashboard onOpenImportModal={() => setIsImportOpen(true)} />
        ) : activeView === 'score' ? (
          <div className="h-full overflow-y-auto p-6 bg-[#F1F3F5]">
            <div className="max-w-4xl mx-auto">
              <ResumeScorePanel />
            </div>
          </div>
        ) : activeView === 'cover-letter' ? (
          <div className="h-full overflow-y-auto p-6 bg-[#F1F3F5]">
            <div className="max-w-4xl mx-auto">
              <CoverLetterModule />
            </div>
          </div>
        ) : null}
      </main>

      {/* Clean Utility Bottom Bar */}
      <footer className="h-8 bg-[#212529] text-white flex items-center justify-between px-4 text-[10px] tracking-wide shrink-0 z-20">
        <div className="flex items-center gap-3">
          <span className="font-semibold text-blue-400">PRO MODE ACTIVE</span>
          <span className="opacity-30">|</span>
          <span className="text-gray-300">ATS COMPLIANT: YES</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-gray-400 hidden sm:inline">
            Privacy: Data remains locally on your device
          </span>
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
        </div>
      </footer>

      {/* Global Import Modal */}
      <ImportModal isOpen={isImportOpen} onClose={() => setIsImportOpen(false)} />
    </div>
  );
}
