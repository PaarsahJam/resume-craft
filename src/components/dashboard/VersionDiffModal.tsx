import React from 'react';
import { useResumeStore } from '../../store/useResumeStore';
import { ArrowLeft, GitCompare, Check } from 'lucide-react';

export const VersionDiffModal: React.FC = () => {
  const { diffResumeIds, resumes, setDiffResumeIds } = useResumeStore();

  if (!diffResumeIds) return null;

  const r1 = resumes.find((r) => r.id === diffResumeIds[0]);
  const r2 = resumes.find((r) => r.id === diffResumeIds[1]);

  if (!r1 || !r2) return null;

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6 animate-in fade-in">
      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setDiffResumeIds(null)}
            className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
              <GitCompare className="w-5 h-5 text-indigo-600" />
              Version Diff Comparison
            </h1>
            <p className="text-xs text-slate-500">
              Comparing tailored versions side-by-side.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
        {/* Version 1 */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
          <div className="pb-3 border-b border-slate-100 flex justify-between items-center">
            <h2 className="font-bold text-slate-900 text-sm">{r1.meta.title}</h2>
            <span className="text-[10px] text-slate-400">{new Date(r1.meta.updatedAt).toLocaleDateString()}</span>
          </div>

          <div>
            <h3 className="font-bold text-slate-500 uppercase text-[10px] tracking-wider mb-1">Headline</h3>
            <p className="text-slate-800 font-medium">{r1.personal.headline}</p>
          </div>

          <div>
            <h3 className="font-bold text-slate-500 uppercase text-[10px] tracking-wider mb-1">Summary</h3>
            <p className={`p-3 rounded-xl border text-slate-800 ${r1.summary !== r2.summary ? 'bg-amber-50/70 border-amber-200' : 'bg-slate-50 border-slate-200'}`}>
              {r1.summary}
            </p>
          </div>

          <div>
            <h3 className="font-bold text-slate-500 uppercase text-[10px] tracking-wider mb-1">Experience Count</h3>
            <p className="text-slate-800 font-bold">{r1.experience.length} roles</p>
          </div>
        </div>

        {/* Version 2 */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
          <div className="pb-3 border-b border-slate-100 flex justify-between items-center">
            <h2 className="font-bold text-slate-900 text-sm">{r2.meta.title}</h2>
            <span className="text-[10px] text-slate-400">{new Date(r2.meta.updatedAt).toLocaleDateString()}</span>
          </div>

          <div>
            <h3 className="font-bold text-slate-500 uppercase text-[10px] tracking-wider mb-1">Headline</h3>
            <p className="text-slate-800 font-medium">{r2.personal.headline}</p>
          </div>

          <div>
            <h3 className="font-bold text-slate-500 uppercase text-[10px] tracking-wider mb-1">Summary</h3>
            <p className={`p-3 rounded-xl border text-slate-800 ${r1.summary !== r2.summary ? 'bg-indigo-50/70 border-indigo-200' : 'bg-slate-50 border-slate-200'}`}>
              {r2.summary}
            </p>
          </div>

          <div>
            <h3 className="font-bold text-slate-500 uppercase text-[10px] tracking-wider mb-1">Experience Count</h3>
            <p className="text-slate-800 font-bold">{r2.experience.length} roles</p>
          </div>
        </div>
      </div>
    </div>
  );
};
