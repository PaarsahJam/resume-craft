import React, { useEffect, useState } from 'react';
import { useResumeStore } from '../../store/useResumeStore';
import { parseResumeText } from '../../lib/parser';
import { Upload, FileText, Check, X } from 'lucide-react';
import { sampleResumeMarkdown, armenianSampleResumeMarkdown } from '../../data/sampleResume';

interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ImportModal: React.FC<ImportModalProps> = ({ isOpen, onClose }) => {
  const { createResume } = useResumeStore();
  const [inputText, setInputText] = useState('');
  const [parsedPreview, setParsedPreview] = useState<any | null>(null);

  // Parsing rebuilds the whole resume and mints fresh ids, so doing it on every
  // keystroke made typing in a long paste crawl. Debounce it instead.
  useEffect(() => {
    if (inputText.trim().length <= 30) {
      setParsedPreview(null);
      return;
    }
    const timer = setTimeout(() => {
      setParsedPreview(parseResumeText(inputText));
    }, 250);
    return () => clearTimeout(timer);
  }, [inputText]);

  if (!isOpen) return null;

  const handleTextChange = (text: string) => {
    setInputText(text);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    // Clear the value so re-picking the same file still fires a change event.
    e.target.value = '';
    if (file) {
      const reader = new FileReader();
      reader.onload = (evt) => {
        if (evt.target?.result) {
          handleTextChange(evt.target.result as string);
        }
      };
      reader.readAsText(file);
    }
  };

  const handleLoadSample = (lang: 'en' | 'hy') => {
    handleTextChange(lang === 'hy' ? armenianSampleResumeMarkdown : sampleResumeMarkdown);
  };

  const handleConfirmImport = () => {
    if (!parsedPreview) return;
    createResume(parsedPreview);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-100 max-h-[90vh] flex flex-col justify-between animate-in fade-in zoom-in-95">
        <div>
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Upload className="w-5 h-5 text-blue-600" />
              Import Resume (Markdown / Text)
            </h3>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1 rounded-lg">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
            <p className="text-xs text-slate-500">
              Paste your resume or upload a <code>.md</code> / <code>.txt</code> file. Our parser will instantly structure it.
            </p>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleLoadSample('en')}
                className="text-xs font-semibold text-blue-600 hover:bg-blue-50 px-2 py-1 rounded transition flex items-center gap-1 border border-blue-200"
              >
                <FileText className="w-3.5 h-3.5" /> Sample (EN)
              </button>
              <button
                type="button"
                onClick={() => handleLoadSample('hy')}
                className="text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-2.5 py-1 rounded transition flex items-center gap-1 border border-emerald-300"
                title="Load Armenian Sample CV"
              >
                🇦🇲 Sample (Հայերեն)
              </button>
            </div>
          </div>

          <div className="mt-3 space-y-3">
            <textarea
              rows={8}
              value={inputText}
              onChange={(e) => handleTextChange(e.target.value)}
              placeholder="Paste plain text or Markdown here..."
              className="w-full p-3 border border-slate-200 rounded-xl text-xs text-slate-800 font-mono focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none resize-y"
            />

            <div className="flex items-center gap-3">
              <label className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl cursor-pointer transition flex items-center gap-1.5">
                <Upload className="w-3.5 h-3.5" /> Upload .md / .txt File
                <input type="file" accept=".md,.txt" onChange={handleFileUpload} className="hidden" />
              </label>
            </div>
          </div>

          {/* Parsed Struct Preview */}
          {parsedPreview && (
            <div className="mt-4 p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs animate-in fade-in">
              <div className="font-bold text-slate-900 flex items-center gap-1.5">
                <Check className="w-4 h-4 text-emerald-600" /> Parsed Structure Preview:
              </div>
              <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-700">
                <div><strong>Name:</strong> {parsedPreview.personal?.fullName || <span className="text-amber-600">not detected — fill in manually</span>}</div>
                <div><strong>Headline:</strong> {parsedPreview.personal?.headline || <span className="text-amber-600">not detected — fill in manually</span>}</div>
                <div><strong>Experience:</strong> {parsedPreview.experience?.length ?? 0} roles found</div>
                <div><strong>Skills:</strong> {parsedPreview.skills?.length ?? 0} categories found</div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Actions */}
        <div className="mt-6 pt-4 border-t border-slate-100 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={!parsedPreview}
            onClick={handleConfirmImport}
            className="px-5 py-2 text-xs font-semibold bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition flex items-center gap-1.5 shadow-sm shadow-blue-500/20 disabled:opacity-50"
          >
            <Check className="w-3.5 h-3.5" />
            Import & Edit
          </button>
        </div>
      </div>
    </div>
  );
};
