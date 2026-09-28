import React from 'react';
import { CertificationItem } from '../../types';
import { Award, Plus, Trash2 } from 'lucide-react';

interface CertificationsEditorProps {
  certifications: CertificationItem[];
  onChange: (updated: CertificationItem[]) => void;
}

export const CertificationsEditor: React.FC<CertificationsEditorProps> = ({ certifications, onChange }) => {
  const handleAdd = () => {
    const newCert: CertificationItem = {
      id: 'cert-' + Date.now(),
      name: 'Certification Name',
      issuer: 'Issuing Organization',
      date: '2023',
    };
    onChange([...certifications, newCert]);
  };

  const handleDelete = (id: string) => {
    onChange(certifications.filter((c) => c.id !== id));
  };

  const handleUpdate = (id: string, updates: Partial<CertificationItem>) => {
    onChange(
      certifications.map((c) => (c.id === id ? { ...c, ...updates } : c))
    );
  };

  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm space-y-4">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <Award className="w-4 h-4 text-blue-600" />
          Certifications & Licenses
        </h3>

        <button
          type="button"
          onClick={handleAdd}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl transition shadow-sm"
        >
          <Plus className="w-3.5 h-3.5" />
          Add Certification
        </button>
      </div>

      <div className="space-y-3">
        {certifications.map((cert) => (
          <div key={cert.id} className="p-3 bg-slate-50/70 border border-slate-200 rounded-xl space-y-2 text-xs">
            <div className="flex justify-between items-center">
              <input
                type="text"
                value={cert.name}
                onChange={(e) => handleUpdate(cert.id, { name: e.target.value })}
                placeholder="Certification Title"
                className="font-bold text-slate-900 bg-transparent border-b border-slate-300 focus:border-blue-600 outline-none px-1 py-0.5 flex-1 mr-2"
              />
              <button
                type="button"
                onClick={() => handleDelete(cert.id)}
                className="p-1 text-slate-400 hover:text-red-600 rounded"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                value={cert.issuer || ''}
                onChange={(e) => handleUpdate(cert.id, { issuer: e.target.value })}
                placeholder="Issuer (e.g. AWS, ACECR)"
                className="px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg outline-none"
              />
              <input
                type="text"
                value={cert.date || ''}
                onChange={(e) => handleUpdate(cert.id, { date: e.target.value })}
                placeholder="Date Received"
                className="px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg outline-none"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
