import React, { useState } from 'react';
import { useResumeStore } from '../../store/useResumeStore';
import { PersonalInfoEditor } from '../editor/PersonalInfoEditor';
import { SummaryEditor } from '../editor/SummaryEditor';
import { SkillsEditor } from '../editor/SkillsEditor';
import { ExperienceEditor } from '../editor/ExperienceEditor';
import { ProjectsEditor } from '../editor/ProjectsEditor';
import { EducationEditor } from '../editor/EducationEditor';
import { CertificationsEditor } from '../editor/CertificationsEditor';
import { LanguagesEditor } from '../editor/LanguagesEditor';
import { CustomSectionsEditor } from '../editor/CustomSectionsEditor';
import { SectionReorderModal } from '../editor/SectionReorderModal';
import { ExportControls } from '../export/ExportControls';
import { DesignControls } from '../design/DesignControls';
import { ResumeRenderer } from '../ResumeRenderer';
import { TemplateId } from '../../types';
import { Undo2, Redo2, Layers, Eye, ZoomIn, ZoomOut, Save, Sparkles, Layout } from 'lucide-react';

export const ResumeBuilderView: React.FC = () => {
  const {
    resumes,
    activeResumeId,
    updateActiveResume,
    undo,
    redo,
    history,
    historyIndex,
    selectedTemplate,
    setSelectedTemplate,
    templateOptions,
  } = useResumeStore();

  const [activeTab, setActiveTab] = useState<'details' | 'design' | 'export'>('details');
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [isReorderOpen, setIsReorderOpen] = useState(false);

  const activeResume = resumes.find((r) => r.id === activeResumeId);

  if (!activeResume) {
    return (
      <div className="p-12 text-center text-slate-500 font-medium">
        No active resume loaded. Please select or create a resume from the dashboard.
      </div>
    );
  }

  const handlePersonalChange = (personal: any) => {
    updateActiveResume({ personal });
  };

  const handleSummaryChange = (summary: string) => {
    updateActiveResume({ summary });
  };

  const handleSkillsChange = (skills: any) => {
    updateActiveResume({ skills });
  };

  const handleExperienceChange = (experience: any) => {
    updateActiveResume({ experience });
  };

  const handleProjectsChange = (projects: any) => {
    updateActiveResume({ projects });
  };

  const handleEducationChange = (education: any) => {
    updateActiveResume({ education });
  };

  const handleCertificationsChange = (certifications: any) => {
    updateActiveResume({ certifications });
  };

  const handleLanguagesChange = (languages: any) => {
    updateActiveResume({ languages });
  };

  const handleAdditionalSectionsChange = (additionalSections: any) => {
    updateActiveResume({ additionalSections });
  };

  return (
    <div className="flex flex-col lg:flex-row h-full w-full overflow-hidden bg-[#F1F3F5]">
      {/* Left Column: Utility Editor Sidebar */}
      <aside className="w-full lg:w-[380px] bg-white border-r border-[#E9ECEF] flex flex-col shrink-0 h-full">
        {/* Navigation Tabs */}
        <nav className="flex border-b border-[#E9ECEF] bg-white shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('details')}
            className={`flex-1 py-3 text-sm font-semibold transition-colors ${
              activeTab === 'details'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-500 hover:text-gray-700 border-b-2 border-transparent'
            }`}
          >
            Content
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('design')}
            className={`flex-1 py-3 text-sm font-semibold transition-colors ${
              activeTab === 'design'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-500 hover:text-gray-700 border-b-2 border-transparent'
            }`}
          >
            Design
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('export')}
            className={`flex-1 py-3 text-sm font-semibold transition-colors ${
              activeTab === 'export'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-500 hover:text-gray-700 border-b-2 border-transparent'
            }`}
          >
            Export
          </button>
          <button
            type="button"
            onClick={() => setIsReorderOpen(true)}
            className="px-3 py-3 text-sm font-medium text-gray-500 hover:text-gray-700 flex items-center justify-center gap-1.5 border-b-2 border-transparent"
            title="Reorder sections"
          >
            <Layers className="w-4 h-4 text-gray-400" />
            <span className="text-xs">Sections</span>
          </button>
        </nav>

        {/* Toolbar: Undo/Redo & Quick Actions */}
        <div className="px-4 py-2.5 bg-gray-50 border-b border-[#E9ECEF] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-1 text-xs text-gray-500">
            <span className="font-medium text-gray-700">CV Mode</span>
            <span className="text-gray-300">|</span>
            <span className="text-emerald-600 font-semibold flex items-center gap-1">
              <Save className="w-3 h-3" /> Auto
            </span>
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={undo}
              disabled={historyIndex <= 0}
              className="p-1.5 text-gray-600 hover:bg-gray-200/70 rounded transition disabled:opacity-30"
              title="Undo"
            >
              <Undo2 className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={redo}
              disabled={historyIndex >= history.length - 1}
              className="p-1.5 text-gray-600 hover:bg-gray-200/70 rounded transition disabled:opacity-30"
              title="Redo"
            >
              <Redo2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Scrollable Form Sections */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          {activeTab === 'details' ? (
            <>
              {/* AI Assistant Callout Box */}
              <section>
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-bold text-blue-800 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                      AI Assistant
                    </span>
                    <span className="text-[10px] bg-blue-200 text-blue-800 px-1.5 py-0.5 rounded font-mono font-medium">
                      OPT-IN
                    </span>
                  </div>
                  <p className="text-[11px] text-blue-700 leading-relaxed mb-3">
                    Your summary is strong. Highlight leadership in full-stack engineering to increase interview callbacks.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      if (!activeResume.summary?.includes('engineering')) {
                        handleSummaryChange(
                          (activeResume.summary || '') + ' Demonstrated technical leadership and end-to-end delivery in complex full-stack environments.'
                        );
                      }
                    }}
                    className="w-full py-1.5 bg-white text-blue-600 text-xs font-bold rounded border border-blue-200 hover:bg-blue-100 transition"
                  >
                    Apply Suggestion
                  </button>
                </div>
              </section>

              <PersonalInfoEditor personal={activeResume.personal} onChange={handlePersonalChange} />
              <SummaryEditor summary={activeResume.summary} headline={activeResume.personal.headline} onChange={handleSummaryChange} />
              <SkillsEditor skills={activeResume.skills} onChange={handleSkillsChange} />
              <ExperienceEditor experience={activeResume.experience} onChange={handleExperienceChange} />
              <ProjectsEditor projects={activeResume.projects} onChange={handleProjectsChange} />
              <EducationEditor education={activeResume.education} onChange={handleEducationChange} />
              <CertificationsEditor certifications={activeResume.certifications} onChange={handleCertificationsChange} />
              <LanguagesEditor languages={activeResume.languages} onChange={handleLanguagesChange} />
              <CustomSectionsEditor additionalSections={activeResume.additionalSections} onChange={handleAdditionalSectionsChange} />
            </>
          ) : activeTab === 'design' ? (
            <DesignControls />
          ) : (
            <ExportControls />
          )}
        </div>
      </aside>

      {/* Right Column: Canvas Workspace */}
      <section className="flex-1 bg-[#CED4DA] p-6 sm:p-8 flex flex-col justify-between items-center overflow-auto relative">
        {/* Workspace Controls Header */}
        <div className="w-full max-w-[800px] mb-4 flex items-center justify-between bg-white/90 backdrop-blur-xs px-4 py-2 rounded-md border border-gray-300 shadow-xs shrink-0 z-10">
          <div className="flex items-center gap-2">
            <Eye className="w-4 h-4 text-blue-600 shrink-0" />
            <span className="text-xs font-bold text-gray-800 uppercase tracking-wider hidden sm:inline">
              Live Preview
            </span>
            <div className="flex items-center gap-1 bg-gray-100 rounded-md border border-gray-200 px-1.5 py-0.5">
              <Layout className="w-3 h-3 text-gray-500 shrink-0" />
              <select
                value={selectedTemplate}
                onChange={(e) => setSelectedTemplate(e.target.value as TemplateId)}
                className="bg-transparent text-xs font-semibold text-gray-700 outline-hidden cursor-pointer"
                title="Change Template Style"
              >
                <option value="modern-tech">Modern Tech</option>
                <option value="ivy-league">Ivy League (Academic & Legal)</option>
                <option value="compact-grid">Tech Grid (Silicon Valley)</option>
                <option value="nordic-slate">Nordic Slate (Minimalist Rail)</option>
                <option value="metro-split">Metro Split (Executive Director)</option>
                <option value="executive">Executive Serif</option>
                <option value="two-column">Sidebar Split</option>
                <option value="minimal">Clean Minimal</option>
                <option value="creative">Creative Banner</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 bg-gray-100 p-0.5 rounded border border-gray-200">
              <button
                type="button"
                onClick={() => setZoomLevel((z) => Math.max(60, z - 10))}
                className="p-1 text-gray-600 hover:text-gray-900 rounded"
                title="Zoom Out"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <span className="text-[11px] font-mono text-gray-700 w-10 text-center">{zoomLevel}%</span>
              <button
                type="button"
                onClick={() => setZoomLevel((z) => Math.min(130, z + 10))}
                className="p-1 text-gray-600 hover:text-gray-900 rounded"
                title="Zoom In"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Scalable Resume Target Sheet */}
        <div className="flex-1 w-full flex justify-center items-start overflow-auto">
          <div
            style={{
              transform: `scale(${zoomLevel / 100})`,
              transformOrigin: 'top center',
              transition: 'transform 0.15s ease-out',
            }}
            className="w-full flex justify-center pb-12"
          >
            <ResumeRenderer
              resume={activeResume}
              template={selectedTemplate}
              options={templateOptions}
            />
          </div>
        </div>
      </section>

      {/* Reorder Sections Modal */}
      <SectionReorderModal
        isOpen={isReorderOpen}
        sectionOrder={activeResume.sectionOrder}
        hiddenSections={activeResume.hiddenSections}
        onOrderChange={(newOrder) => updateActiveResume({ sectionOrder: newOrder })}
        onHiddenChange={(newHidden) => updateActiveResume({ hiddenSections: newHidden })}
        onClose={() => setIsReorderOpen(false)}
      />
    </div>
  );
};
