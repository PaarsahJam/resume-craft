import React, { useState } from 'react';
import { SkillCategory } from '../../types';
import { Wrench, Plus, Trash2, X } from 'lucide-react';

interface SkillsEditorProps {
  skills: SkillCategory[];
  onChange: (updatedSkills: SkillCategory[]) => void;
}

export const SkillsEditor: React.FC<SkillsEditorProps> = ({ skills, onChange }) => {
  const [newCatName, setNewCatName] = useState('');

  const handleAddCategory = () => {
    if (!newCatName.trim()) return;
    onChange([...skills, { category: newCatName.trim(), items: [] }]);
    setNewCatName('');
  };

  const handleDeleteCategory = (index: number) => {
    onChange(skills.filter((_, idx) => idx !== index));
  };

  const handleAddItem = (catIndex: number, itemText: string) => {
    if (!itemText.trim()) return;
    // Copy the touched category too: mutating the shared nested array would
    // also rewrite every history snapshot, breaking Undo.
    onChange(
      skills.map((cat, idx) =>
        idx === catIndex ? { ...cat, items: [...cat.items, itemText.trim()] } : cat
      )
    );
  };

  const handleRemoveItem = (catIndex: number, itemIndex: number) => {
    onChange(
      skills.map((cat, idx) =>
        idx === catIndex ? { ...cat, items: cat.items.filter((_, i) => i !== itemIndex) } : cat
      )
    );
  };

  const handleRenameCategory = (catIndex: number, name: string) => {
    onChange(skills.map((cat, idx) => (idx === catIndex ? { ...cat, category: name } : cat)));
  };

  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm space-y-4">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <Wrench className="w-4 h-4 text-blue-600" />
          Skills & Technical Expertise
        </h3>
      </div>

      {/* Existing Categories */}
      <div className="space-y-4">
        {skills.map((cat, catIdx) => {
          return (
            <div key={catIdx} className="p-3.5 bg-slate-50/80 border border-slate-200/80 rounded-xl space-y-2.5">
              <div className="flex items-center justify-between">
                <input
                  type="text"
                  value={cat.category}
                  onChange={(e) => handleRenameCategory(catIdx, e.target.value)}
                  className="font-bold text-xs text-slate-900 bg-transparent border-b border-slate-300 focus:border-blue-600 outline-none px-1 py-0.5"
                />
                <button
                  type="button"
                  onClick={() => handleDeleteCategory(catIdx)}
                  className="text-slate-400 hover:text-red-600 p-1 rounded-lg transition"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Chips list */}
              <div className="flex flex-wrap gap-1.5">
                {cat.items.map((item, itemIdx) => (
                  <span
                    key={itemIdx}
                    className="inline-flex items-center gap-1 px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-800 shadow-2xs"
                  >
                    {item}
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(catIdx, itemIdx)}
                      className="text-slate-400 hover:text-slate-600"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>

              {/* Add item input */}
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="text"
                  placeholder="Type skill & press Enter (e.g. React, Docker)"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddItem(catIdx, (e.target as HTMLInputElement).value);
                      (e.target as HTMLInputElement).value = '';
                    }
                  }}
                  className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Add New Category */}
      <div className="pt-2 flex items-center gap-2">
        <input
          type="text"
          value={newCatName}
          onChange={(e) => setNewCatName(e.target.value)}
          placeholder="New Skill Category Name (e.g. Databases, Cloud)"
          className="flex-1 px-3 py-2 border border-slate-200 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              handleAddCategory();
            }
          }}
        />
        <button
          type="button"
          onClick={handleAddCategory}
          className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-semibold hover:bg-slate-800 transition flex items-center gap-1 shrink-0"
        >
          <Plus className="w-3.5 h-3.5" /> Add Category
        </button>
      </div>
    </div>
  );
};
