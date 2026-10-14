import React, { useState } from 'react';
import { useResumeStore } from '../../store/useResumeStore';
import { Download, Printer, FileText, FileDown, Loader2, Globe, Sparkles, ShieldCheck, AlertTriangle, Check, X } from 'lucide-react';
import { exportPdfFile, triggerPrintToPdf, formatFileName } from '../../lib/pdfExporter';
import { generateDocxBlob, downloadDocx } from '../../lib/docxExporter';
import { describeAiFailure, AI_NETWORK_ERROR_MESSAGE } from '../../lib/aiErrors';
import { requestTranslation, type TranslationProposal } from '../../lib/aiTranslation';

export const ExportControls: React.FC = () => {
  const {
    resumes,
    activeResumeId,
    templateOptions,
    setTemplateOptions,
    updateActiveResume,
    aiConsentGiven,
    setAiConsentGiven,
  } = useResumeStore();

  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  const [showConsentModal, setShowConsentModal] = useState(false);
  const [pendingTranslate, setPendingTranslate] = useState<'English' | 'Armenian' | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);
  // A completed translation is held here for review. Nothing is written to the
  // active resume until the user explicitly accepts it.
  const [pendingTranslation, setPendingTranslation] = useState<TranslationProposal | null>(null);

  const activeResume = resumes.find((r) => r.id === activeResumeId);

  if (!activeResume) return null;

  const handleDownloadPdf = async () => {
    setIsExportingPdf(true);
    try {
      const filename = formatFileName(activeResume.personal.fullName, 'pdf');
      const paperSize = templateOptions.paperSize === 'letter' ? 'letter' : 'a4';
      await exportPdfFile('resume-render-target', filename, paperSize);
    } catch (e: any) {
      console.error('PDF export error:', e);
      triggerPrintToPdf(activeResume.meta.title || 'Resume');
    } finally {
      setIsExportingPdf(false);
    }
  };

  const handlePrint = () => {
    triggerPrintToPdf(activeResume.meta.title || 'Resume');
  };

  const handleDocxExport = async () => {
    try {
      const blob = await generateDocxBlob(activeResume, templateOptions);
      const filename = formatFileName(activeResume.personal.fullName, 'docx');
      downloadDocx(blob, filename);
    } catch (e: any) {
      alert('Failed to generate DOCX document: ' + e.message);
    }
  };

  const handleJsonExport = () => {
    const blob = new Blob([JSON.stringify(activeResume, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = formatFileName(activeResume.personal.fullName, 'json');
    document.body.appendChild(a);
    a.click();
    a.remove();
    // Revoking in the same task can abort the download in Firefox/Safari.
    setTimeout(() => URL.revokeObjectURL(url), 0);
  };

  const handleTranslateResume = async (targetLang: 'English' | 'Armenian', force = false) => {
    if (!aiConsentGiven && !force) {
      setPendingTranslate(targetLang);
      setShowConsentModal(true);
      return;
    }

    setIsTranslating(true);
    setAiError(null);
    setPendingTranslation(null);

    // Capture the resume being translated so the reviewer can see what would
    // be replaced. The result is a proposal; it is never auto-applied.
    const sourceResume = activeResume;
    try {
      const result = await requestTranslation({
        resume: sourceResume,
        targetLanguage: targetLang === 'Armenian' ? 'Armenian (Հայերեն)' : 'English',
      });

      if (result.status === 'rejected') {
        // Failure, timeout, provider error or malformed output: the active
        // resume is untouched and no proposal is created.
        setAiError(result.message);
        return;
      }

      // Surface for review. The user must explicitly accept before applying.
      setPendingTranslation(result.proposal);
    } finally {
      setIsTranslating(false);
    }
  };

  /** Explicit user acceptance: the only path that writes to the active resume. */
  const acceptTranslation = () => {
    if (!pendingTranslation) return;
    updateActiveResume(pendingTranslation.resume);
    setTemplateOptions({ language: pendingTranslation.targetLanguage.startsWith('Armenian') ? 'hy' : 'en' });
    setPendingTranslation(null);
    setAiError(null);
  };

  /** Explicit rejection: discard the proposal, keeping the original resume. */
  const rejectTranslation = () => {
    setPendingTranslation(null);
  };

  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm space-y-5 text-xs">
      {/* Inline, non-blocking AI failure notice */}
      {aiError && (
        <div
          role="alert"
          className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900"
        >
          <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0 text-amber-600" />
          <span className="flex-1">{aiError}</span>
          <button
            type="button"
            onClick={() => setAiError(null)}
            aria-label="Dismiss AI error"
            className="shrink-0 text-amber-700 hover:text-amber-900 font-bold px-1"
          >
            ×
          </button>
        </div>
      )}
      <div className="pb-4 border-b border-slate-100">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <Download className="w-4 h-4 text-blue-600" />
          Export Resume
        </h3>
        <p className="text-[11px] text-slate-500">
          Download your resume in the format you need.
        </p>
      </div>

      {/* Format Actions */}
      <div className="space-y-2">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleDownloadPdf}
            disabled={isExportingPdf}
            className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition flex items-center gap-1.5 shadow-sm shadow-blue-500/20 disabled:opacity-50 cursor-pointer"
            title="Download PDF File"
          >
            {isExportingPdf ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Download className="w-3.5 h-3.5" />
            )}
            {isExportingPdf ? 'Generating...' : 'Download PDF'}
          </button>

          <button
            type="button"
            onClick={handleDocxExport}
            className="px-3 py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-xl transition flex items-center gap-1.5 shadow-sm cursor-pointer"
            title="Download an editable Word document"
          >
            <FileText className="w-3.5 h-3.5" /> Word (DOCX)
          </button>

          <button
            type="button"
            onClick={handlePrint}
            className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl transition flex items-center gap-1.5 cursor-pointer"
            title="Print Resume"
          >
            <Printer className="w-3.5 h-3.5" /> Print
          </button>

          <button
            type="button"
            onClick={handleJsonExport}
            className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl transition cursor-pointer"
            title="Export Raw JSON Backup"
          >
            <FileDown className="w-4 h-4" />
          </button>
        </div>

        <p className="text-[10px] text-slate-500 leading-relaxed">
          PDF and Print use your selected template. Word (DOCX) exports a clean,
          editable single-column document.
        </p>
      </div>

      {/* Translation review gate: nothing is applied until explicitly accepted. */}
      {pendingTranslation && (
        <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-xl space-y-3">
          <div className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            Review AI Translation — not applied yet
          </div>
          <p className="text-[11px] text-slate-600 leading-relaxed">
            Your current resume is unchanged. Review the translated version below, then choose
            <strong> Apply Translation</strong> to replace it or <strong> Keep Original</strong> to discard
            this translation.
          </p>
          <p className="text-[11px] text-slate-600 leading-relaxed">
            <strong>Check the facts yourself.</strong> AI translation can add employers, job titles,
            dates or achievements you never wrote. The list below only catches some numbers — it cannot
            detect invented employers or qualifications, so read the whole letter against your original
            before applying.
          </p>

          {pendingTranslation.warnings.length > 0 && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg space-y-1.5">
              <div className="text-[11px] font-bold text-amber-900 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                These numbers were not in your original — check each one
              </div>
              <ul className="list-disc pl-4 space-y-0.5">
                {pendingTranslation.warnings.map((warning, index) => (
                  <li key={`${warning.kind}-${warning.token}-${index}`} className="text-[11px] text-amber-900">
                    {warning.message}
                  </li>
                ))}
              </ul>
              <p className="text-[10px] text-amber-800 italic leading-relaxed">
                Partial hints only — numbers are checked, employers and job titles are not. An empty
                list does not mean the translation is accurate.
              </p>
            </div>
          )}

          <div className="p-3 bg-white border border-slate-200 rounded-lg max-h-56 overflow-y-auto">
            <div className="text-[11px] font-bold text-slate-700 mb-1">
              Translated preview: {pendingTranslation.targetLanguage}
            </div>
            <div className="text-[11px] text-slate-600 whitespace-pre-wrap break-words">
              {String((pendingTranslation.resume?.personal as any)?.fullName ?? '') || '(no name)'}
              {'\n'}
              {String(pendingTranslation.resume?.summary ?? '').slice(0, 400)}
              {'\n\n'}
              {((pendingTranslation.resume?.experience as any[]) ?? [])
                .slice(0, 3)
                .map((exp: any) => `• ${exp?.jobTitle ?? ''} — ${exp?.company ?? ''}`)
                .join('\n')}
            </div>
          </div>

          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={rejectTranslation}
              className="px-3 py-1.5 bg-white border border-slate-300 text-slate-700 font-semibold rounded-xl transition flex items-center gap-1.5 hover:bg-slate-50"
            >
              <X className="w-3.5 h-3.5" /> Keep Original
            </button>
            <button
              type="button"
              onClick={acceptTranslation}
              className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition flex items-center gap-1.5"
            >
              <Check className="w-3.5 h-3.5" /> Apply Translation
            </button>
          </div>
        </div>
      )}

      {/* Language & AI Auto-Translate Control */}
      <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <div className="font-bold text-slate-800 text-xs flex items-center gap-1.5 mb-0.5">
            <Globe className="w-3.5 h-3.5 text-blue-600" />
            Export Language Settings
          </div>
          <p className="text-[11px] text-slate-500">
            Select section header language or AI translate full content to English or Armenian before exporting.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Header Language Mode Buttons */}
          <div className="flex items-center bg-white border border-slate-200 rounded-xl p-1 gap-1">
            <button
              type="button"
              onClick={() => setTemplateOptions({ language: 'en' })}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                templateOptions.language === 'en' || !templateOptions.language
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              🇬🇧 English Headers
            </button>
            <button
              type="button"
              onClick={() => setTemplateOptions({ language: 'hy' })}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                templateOptions.language === 'hy'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              🇦🇲 Armenian Headers (Հայերեն)
            </button>
          </div>

          {/* AI Translate Content Button */}
          <button
            type="button"
            onClick={() => handleTranslateResume(templateOptions.language === 'hy' ? 'English' : 'Armenian')}
            disabled={isTranslating}
            className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-xl transition flex items-center gap-1.5 shadow-xs disabled:opacity-50 cursor-pointer"
            title="Translate entire resume using AI"
          >
            {isTranslating ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Sparkles className="w-3.5 h-3.5" />
            )}
            {isTranslating
              ? 'Translating...'
              : templateOptions.language === 'hy'
              ? 'AI Translate Content to English'
              : 'AI Translate Content to Armenian'}
          </button>
        </div>
      </div>

      {/* Privacy Consent Gate Modal */}
      {showConsentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100">
            <div className="flex items-center gap-2 text-amber-600 font-bold text-base mb-2">
              <ShieldCheck className="w-5 h-5" />
              Privacy Consent Gate
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Translating sends your <strong>entire resume</strong> to the AI service so the text can be translated. Nothing is stored on external servers.
            </p>

            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setShowConsentModal(false);
                  setPendingTranslate(null);
                }}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  setAiConsentGiven(true);
                  setShowConsentModal(false);
                  const lang = pendingTranslate;
                  setPendingTranslate(null);
                  if (lang) handleTranslateResume(lang, true);
                }}
                className="px-5 py-2 text-xs font-semibold bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition"
              >
                Allow &amp; Translate
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
