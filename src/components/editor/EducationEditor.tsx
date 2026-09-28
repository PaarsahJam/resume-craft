import React from 'react';
import { EducationItem } from '../../types';
import { GraduationCap, Plus, Trash2 } from 'lucide-react';

interface EducationEditorProps {
  education: EducationItem[];
  onChange: (updated: EducationItem[]) => void;
}

export const EducationEditor: React.FC<EducationEditorProps> = ({ education, onChange }) => {
  const handleAdd = () => {
    const newEdu: EducationItem = {
      id: 'edu-' + Date.now(),
      institution: 'University Name',
      degree: 'B.S. in Computer Science',
      dates: '2019 – 2023',
    };
    onChange([...education, newEdu]);
  };

  const handleDelete = (id: string) => {
    onChange(education.filter((e) => e.id !== id));
  };

  const handleUpdate = (id: string, updates: Partial<EducationItem>) => {
    onChange(
      education.map((e) => (e.id === id ? { ...e, ...updates } : e))
    );
  };

  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm space-y-4">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <GraduationCap className="w-4 h-4 text-blue-600" />
          Education & Credentials
        </h3>

        <button
          type="button"
          onClick={handleAdd}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl transition shadow-sm"
        >
          <Plus className="w-3.5 h-3.5" />
          Add Education
        </button>
      </div>

      <div className="space-y-3">
        {education.map((edu) => (
          <div key={edu.id} className="p-4 bg-slate-50/70 border border-slate-200 rounded-xl space-y-2.5 text-xs">
            <div className="flex justify-between items-center">
              <input
                type="text"
                value={edu.institution}
                onChange={(e) => handleUpdate(edu.id, { institution: e.target.value })}
                placeholder="University / Institution Name"
                className="font-bold text-slate-900 bg-transparent border-b border-slate-300 focus:border-blue-600 outline-none px-1 py-0.5 flex-1 mr-2"
              />
              <button
                type="button"
                onClick={() => handleDelete(edu.id)}
                className="p-1 text-slate-400 hover:text-red-600 rounded"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div>
                <label className="block text-slate-600 font-semibold mb-1">Degree / Coursework</label>
                <input
                  type="text"
                  value={edu.degree}
                  onChange={(e) => handleUpdate(edu.id, { degree: e.target.value })}
                  placeholder="e.g. Electronic Engineering Studies"
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-900 outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1">Dates / Status</label>
                <input
                  type="text"
                  value={edu.dates || ''}
                  onChange={(e) => handleUpdate(edu.id, { dates: e.target.value })}
                  placeholder="e.g. Coursework Completed / 2021"
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-900 outline-none"
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
