import React from 'react';
import { LanguageItem } from '../../types';
import { Languages as LangIcon, Plus, Trash2 } from 'lucide-react';

interface LanguagesEditorProps {
  languages: LanguageItem[];
  onChange: (updated: LanguageItem[]) => void;
}

export const LanguagesEditor: React.FC<LanguagesEditorProps> = ({ languages, onChange }) => {
  const handleAdd = () => {
    onChange([...languages, { language: 'English', level: 'Native / Advanced' }]);
  };

  const handleDelete = (index: number) => {
    onChange(languages.filter((_, idx) => idx !== index));
  };

  const handleUpdate = (index: number, field: 'language' | 'level', value: string) => {
    const updated = [...languages];
    updated[index][field] = value;
    onChange(updated);
  };

  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm space-y-4">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <LangIcon className="w-4 h-4 text-blue-600" />
          Languages & Proficiency
        </h3>

        <button
          type="button"
          onClick={handleAdd}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl transition shadow-sm"
        >
          <Plus className="w-3.5 h-3.5" />
          Add Language
        </button>
      </div>

      <div className="space-y-2">
        {languages.map((l, idx) => (
          <div key={idx} className="flex items-center gap-2 text-xs">
            <input
              type="text"
              value={l.language}
              onChange={(e) => handleUpdate(idx, 'language', e.target.value)}
              placeholder="Language (e.g. English)"
              className="flex-1 px-2.5 py-1.5 border border-slate-200 rounded-lg outline-none font-medium"
            />
            <input
              type="text"
              value={l.level || ''}
              onChange={(e) => handleUpdate(idx, 'level', e.target.value)}
              placeholder="Level (e.g. Native / C2)"
              className="flex-1 px-2.5 py-1.5 border border-slate-200 rounded-lg outline-none"
            />
            <button
              type="button"
              onClick={() => handleDelete(idx)}
              className="p-1.5 text-slate-400 hover:text-red-600 rounded"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
