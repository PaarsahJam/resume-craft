import React, { useState } from 'react';
import { useResumeStore } from '../../store/useResumeStore';
import { Plus, Copy, Trash2, Edit2, Search, FileText, ArrowRightLeft, Upload, Download } from 'lucide-react';
import { formatFileName } from '../../lib/pdfExporter';

interface ResumeDashboardProps {
  onOpenImportModal: () => void;
}

export const ResumeDashboard: React.FC<ResumeDashboardProps> = ({ onOpenImportModal }) => {
  const {
    resumes,
    activeResumeId,
    setActiveResumeId,
    setActiveView,
    createResume,
    duplicateResume,
    deleteResume,
    renameResume,
    setDiffResumeIds,
  } = useResumeStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameTitle, setRenameTitle] = useState('');
  const [selectedForDiff, setSelectedForDiff] = useState<string[]>([]);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Collect all unique tags
  const allTags = Array.from(new Set(resumes.flatMap((r) => r.meta?.tags || [])));

  const filteredResumes = resumes.filter((r) => {
    const matchesQuery =
      r.meta.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.personal.fullName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTag = !selectedTag || r.meta.tags?.includes(selectedTag);
    return matchesQuery && matchesTag;
  });

  const handleStartRename = (id: string, currentTitle: string) => {
    setRenamingId(id);
    setRenameTitle(currentTitle);
  };

  const handleConfirmRename = (id: string) => {
    if (renameTitle.trim()) {
      renameResume(id, renameTitle.trim());
    }
    setRenamingId(null);
  };

  const handleToggleDiffSelection = (id: string) => {
    if (selectedForDiff.includes(id)) {
      setSelectedForDiff(selectedForDiff.filter((i) => i !== id));
    } else {
      if (selectedForDiff.length >= 2) {
        setSelectedForDiff([selectedForDiff[1], id]);
      } else {
        setSelectedForDiff([...selectedForDiff, id]);
      }
    }
  };

  const handleStartDiff = () => {
    if (selectedForDiff.length === 2) {
      setDiffResumeIds([selectedForDiff[0], selectedForDiff[1]]);
    }
  };

  const handleExportJson = (resume: any) => {
    const blob = new Blob([JSON.stringify(resume, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = formatFileName(resume.personal.fullName, 'json');
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8 animate-in fade-in">
      {/* Dashboard Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Resume Dashboard</h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage your tailored resume versions, compare revisions, and import or export data.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onOpenImportModal}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition flex items-center gap-1.5"
          >
            <Upload className="w-3.5 h-3.5" /> Import Resume
          </button>

          <button
            type="button"
            onClick={() => createResume()}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl transition flex items-center gap-1.5 shadow-sm shadow-blue-500/20"
          >
            <Plus className="w-3.5 h-3.5" /> Create Blank
          </button>
        </div>
      </div>

      {/* Filter and Search Toolbar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search resumes..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
          />
        </div>

        {/* Tags filter */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          <button
            type="button"
            onClick={() => setSelectedTag(null)}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition whitespace-nowrap ${
              !selectedTag ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All ({resumes.length})
          </button>
          {allTags.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition whitespace-nowrap ${
                selectedTag === tag
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              #{tag}
            </button>
          ))}
        </div>

        {/* Version Compare Button */}
        {selectedForDiff.length === 2 && (
          <button
            type="button"
            onClick={handleStartDiff}
            className="px-3.5 py-1.5 bg-indigo-600 text-white text-xs font-semibold rounded-xl hover:bg-indigo-700 transition flex items-center gap-1.5 shrink-0"
          >
            <ArrowRightLeft className="w-3.5 h-3.5" /> Compare 2 Versions
          </button>
        )}
      </div>

      {/* Resumes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredResumes.map((resume) => {
          const isActive = resume.id === activeResumeId;
          const isDiffSelected = selectedForDiff.includes(resume.id);

          return (
            <div
              key={resume.id}
              className={`bg-white rounded-2xl p-5 border transition-all duration-200 relative flex flex-col justify-between group ${
                isActive
                  ? 'border-blue-500 shadow-md ring-2 ring-blue-500/10'
                  : 'border-slate-200/80 hover:border-slate-300 shadow-2xs'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="flex-1">
                    {renamingId === resume.id ? (
                      <input
                        type="text"
                        value={renameTitle}
                        onChange={(e) => setRenameTitle(e.target.value)}
                        onBlur={() => handleConfirmRename(resume.id)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleConfirmRename(resume.id);
                        }}
                        autoFocus
                        className="text-sm font-bold text-slate-900 border-b border-blue-600 outline-none w-full"
                      />
                    ) : (
                      <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5 group-hover:text-blue-600 transition">
                        {resume.meta.title}
                        <button
                          type="button"
                          onClick={() => handleStartRename(resume.id, resume.meta.title)}
                          className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-slate-600 p-0.5"
                        >
                          <Edit2 className="w-3 h-3" />
                        </button>
                      </h3>
                    )}
                    <p className="text-xs text-slate-500 font-medium mt-0.5">{resume.personal.fullName}</p>
                  </div>

                  <input
                    type="checkbox"
                    checked={isDiffSelected}
                    onChange={() => handleToggleDiffSelection(resume.id)}
                    title="Select to compare versions"
                    className="mt-1 w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500 cursor-pointer"
                  />
                </div>

                {/* Summary snippet */}
                <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed mb-4">
                  {resume.summary || 'No summary entered yet.'}
                </p>

                {/* Tags */}
                {resume.meta.tags && resume.meta.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-4">
                    {resume.meta.tags.map((t) => (
                      <span key={t} className="px-2 py-0.5 rounded bg-slate-100 text-[10px] font-semibold text-slate-600">
                        #{t}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Footer Actions */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-[10px] text-slate-400 font-medium">
                  Updated {new Date(resume.meta.updatedAt).toLocaleDateString()}
                </span>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => handleExportJson(resume)}
                    className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
                    title="Export JSON"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => duplicateResume(resume.id)}
                    className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
                    title="Duplicate"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeleteConfirmId(resume.id)}
                    className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-slate-100"
                    title="Delete"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveResumeId(resume.id);
                      setActiveView('builder');
                    }}
                    className="ml-1 px-3 py-1 bg-slate-900 hover:bg-blue-600 text-white rounded-lg font-semibold text-xs transition"
                  >
                    Edit
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (() => {
        const targetResume = resumes.find((r) => r.id === deleteConfirmId);
        return (
          <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
            <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-xl border border-slate-200 space-y-4 animate-in zoom-in-95">
              <div className="w-10 h-10 rounded-full bg-red-100 text-red-600 flex items-center justify-center">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Delete Resume?</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Are you sure you want to delete <strong className="text-slate-800">"{targetResume?.meta.title || 'this resume'}"</strong>?
                  {resumes.length === 1 && ' A new default blank resume will be created.'}
                </p>
              </div>
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setDeleteConfirmId(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (deleteConfirmId) {
                      deleteResume(deleteConfirmId);
                      setDeleteConfirmId(null);
                    }
                  }}
                  className="px-4 py-2 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 rounded-xl transition shadow-sm"
                >
                  Yes, Delete
                </button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
};
