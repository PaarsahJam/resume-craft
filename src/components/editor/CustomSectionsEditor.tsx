import React from 'react';
import { AdditionalSectionItem } from '../../types';
import { Layers, Plus, Trash2 } from 'lucide-react';

interface CustomSectionsEditorProps {
  additionalSections: AdditionalSectionItem[];
  onChange: (updated: AdditionalSectionItem[]) => void;
}

export const CustomSectionsEditor: React.FC<CustomSectionsEditorProps> = ({
  additionalSections,
  onChange,
}) => {
  const handleAdd = () => {
    const newSec: AdditionalSectionItem = {
      id: 'add-' + Date.now(),
      title: 'Publications & Speaking',
      content: 'Listed articles, talks, or open source contributions.',
      order: additionalSections.length + 1,
    };
    onChange([...additionalSections, newSec]);
  };

  const handleDelete = (id: string) => {
    onChange(additionalSections.filter((sec) => sec.id !== id));
  };

  const handleUpdate = (id: string, updates: Partial<AdditionalSectionItem>) => {
    onChange(
      additionalSections.map((sec) => (sec.id === id ? { ...sec, ...updates } : sec))
    );
  };

  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm space-y-4">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <Layers className="w-4 h-4 text-blue-600" />
          Custom & Additional Sections
        </h3>

        <button
          type="button"
          onClick={handleAdd}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl transition shadow-sm"
        >
          <Plus className="w-3.5 h-3.5" />
          Add Custom Section
        </button>
      </div>

      <div className="space-y-3">
        {additionalSections.map((sec) => (
          <div key={sec.id} className="p-4 bg-slate-50/70 border border-slate-200 rounded-xl space-y-2.5 text-xs">
            <div className="flex justify-between items-center">
              <input
                type="text"
                value={sec.title}
                onChange={(e) => handleUpdate(sec.id, { title: e.target.value })}
                placeholder="Section Title"
                className="font-bold text-slate-900 bg-transparent border-b border-slate-300 focus:border-blue-600 outline-none px-1 py-0.5 flex-1 mr-2"
              />
              <button
                type="button"
                onClick={() => handleDelete(sec.id)}
                className="p-1 text-slate-400 hover:text-red-600 rounded"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>

            <textarea
              rows={3}
              value={sec.content}
              onChange={(e) => handleUpdate(sec.id, { content: e.target.value })}
              placeholder="Content for this section..."
              className="w-full p-2 bg-white border border-slate-200 rounded-lg text-slate-800 outline-none resize-y"
            />
          </div>
        ))}
      </div>
    </div>
  );
};
