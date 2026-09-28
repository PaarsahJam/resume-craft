import React from 'react';
import { Layers, Eye, EyeOff, ArrowUp, ArrowDown, X } from 'lucide-react';

interface SectionReorderModalProps {
  isOpen: boolean;
  sectionOrder: string[];
  hiddenSections: string[];
  onOrderChange: (newOrder: string[]) => void;
  onHiddenChange: (hidden: string[]) => void;
  onClose: () => void;
}

const SECTION_LABELS: Record<string, string> = {
  summary: 'Professional Summary',
  skills: 'Skills & Expertise',
  experience: 'Professional Experience',
  projects: 'Key Projects',
  education: 'Education',
  certifications: 'Certifications',
  languages: 'Languages',
  additional: 'Custom Sections',
};

export const SectionReorderModal: React.FC<SectionReorderModalProps> = ({
  isOpen,
  sectionOrder,
  hiddenSections,
  onOrderChange,
  onHiddenChange,
  onClose,
}) => {
  if (!isOpen) return null;

  const moveSection = (index: number, direction: 'up' | 'down') => {
    const newOrder = [...sectionOrder];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newOrder.length) return;

    const temp = newOrder[index];
    newOrder[index] = newOrder[targetIndex];
    newOrder[targetIndex] = temp;
    onOrderChange(newOrder);
  };

  const toggleVisibility = (sec: string) => {
    if (hiddenSections.includes(sec)) {
      onHiddenChange(hiddenSections.filter((s) => s !== sec));
    } else {
      onHiddenChange([...hiddenSections, sec]);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Layers className="w-5 h-5 text-blue-600" />
            Reorder & Visibility
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-xs text-slate-500 mt-3 mb-4">
          Rearrange section order or toggle hidden sections.
        </p>

        <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1">
          {sectionOrder.map((sec, idx) => {
            const isHidden = hiddenSections.includes(sec);
            const label = SECTION_LABELS[sec] || sec;

            return (
              <div
                key={sec}
                className={`flex items-center justify-between p-3 rounded-xl border transition ${
                  isHidden
                    ? 'bg-slate-50 border-slate-200 opacity-60'
                    : 'bg-white border-slate-200 shadow-sm'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="flex flex-col gap-0.5">
                    <button
                      type="button"
                      disabled={idx === 0}
                      onClick={() => moveSection(idx, 'up')}
                      className="p-1 rounded text-slate-400 hover:text-slate-700 disabled:opacity-30"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      disabled={idx === sectionOrder.length - 1}
                      onClick={() => moveSection(idx, 'down')}
                      className="p-1 rounded text-slate-400 hover:text-slate-700 disabled:opacity-30"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <span className="text-xs font-bold text-slate-800">{label}</span>
                </div>

                <button
                  type="button"
                  onClick={() => toggleVisibility(sec)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                    isHidden
                      ? 'bg-slate-200 text-slate-600'
                      : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
                  }`}
                >
                  {isHidden ? (
                    <>
                      <EyeOff className="w-3.5 h-3.5" /> Hidden
                    </>
                  ) : (
                    <>
                      <Eye className="w-3.5 h-3.5" /> Visible
                    </>
                  )}
                </button>
              </div>
            );
          })}
        </div>

        <div className="mt-6 pt-4 border-t border-slate-100 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 text-xs font-semibold bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
