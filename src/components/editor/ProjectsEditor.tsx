import React from 'react';
import { ProjectItem } from '../../types';
import { FolderGit2, Plus, Trash2, ExternalLink } from 'lucide-react';

interface ProjectsEditorProps {
  projects: ProjectItem[];
  onChange: (updated: ProjectItem[]) => void;
}

export const ProjectsEditor: React.FC<ProjectsEditorProps> = ({ projects, onChange }) => {
  const handleAddProject = () => {
    const newProj: ProjectItem = {
      id: 'proj-' + Date.now(),
      name: 'New Project Title',
      description: 'Key features, architecture, and impact of the project.',
      technologies: ['TypeScript', 'React'],
      url: '',
    };
    onChange([newProj, ...projects]);
  };

  const handleDelete = (id: string) => {
    onChange(projects.filter((p) => p.id !== id));
  };

  const handleUpdate = (id: string, updates: Partial<ProjectItem>) => {
    onChange(
      projects.map((p) => (p.id === id ? { ...p, ...updates } : p))
    );
  };

  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm space-y-4">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <FolderGit2 className="w-4 h-4 text-blue-600" />
          Projects & Portfolio
        </h3>

        <button
          type="button"
          onClick={handleAddProject}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl transition shadow-sm"
        >
          <Plus className="w-3.5 h-3.5" />
          Add Project
        </button>
      </div>

      <div className="space-y-3">
        {projects.map((proj) => (
          <div key={proj.id} className="p-4 bg-slate-50/70 border border-slate-200 rounded-xl space-y-3 text-xs">
            <div className="flex justify-between items-center">
              <input
                type="text"
                value={proj.name}
                onChange={(e) => handleUpdate(proj.id, { name: e.target.value })}
                placeholder="Project Name"
                className="font-bold text-slate-900 bg-transparent border-b border-slate-300 focus:border-blue-600 outline-none px-1 py-0.5 text-xs flex-1 mr-2"
              />
              <button
                type="button"
                onClick={() => handleDelete(proj.id)}
                className="p-1 text-slate-400 hover:text-red-600 rounded"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>

            <div>
              <label className="block text-slate-600 font-semibold mb-1">Description</label>
              <textarea
                rows={2}
                value={proj.description}
                onChange={(e) => handleUpdate(proj.id, { description: e.target.value })}
                className="w-full p-2 bg-white border border-slate-200 rounded-lg text-slate-800 outline-none resize-y"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-600 font-semibold mb-1">Technologies Used (comma separated)</label>
                <input
                  type="text"
                  value={proj.technologies?.join(', ') || ''}
                  onChange={(e) =>
                    handleUpdate(proj.id, {
                      technologies: e.target.value.split(',').map((t) => t.trim()).filter(Boolean),
                    })
                  }
                  placeholder="React, C#, OpenGL"
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-900 outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1 flex items-center gap-1">
                  <ExternalLink className="w-3 h-3 text-slate-400" /> Project URL
                </label>
                <input
                  type="text"
                  value={proj.url || ''}
                  onChange={(e) => handleUpdate(proj.id, { url: e.target.value })}
                  placeholder="https://github.com/..."
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
