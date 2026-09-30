import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useResumeStore } from '../../store/useResumeStore';
import { FileCode, Sparkles, Copy, Check, Loader2, Download, ShieldAlert } from 'lucide-react';
import { fileNameTimestamp } from '../../lib/pdfExporter';

export const CoverLetterModule: React.FC = () => {
  const {
    resumes,
    activeResumeId,
    jobDescriptionInput,
    coverLetter,
    setCoverLetter,
    coverLetters,
    saveCoverLetter,
    updateCoverLetter,
    aiConsentGiven,
    setAiConsentGiven,
  } = useResumeStore();

  const [companyName, setCompanyName] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [showConsentModal, setShowConsentModal] = useState(false);

  const activeResume = resumes.find((r) => r.id === activeResumeId);

  // Flush pending cover-letter edits when the component unmounts or the letter changes.
  const pendingLetterId = useRef<string | null>(null);
  const pendingBody = useRef('');
  const flushTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const copyTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const persistBody = useCallback(
    (body: string) => {
      pendingBody.current = body;
      if (flushTimer.current) clearTimeout(flushTimer.current);
      flushTimer.current = setTimeout(() => {
        flushTimer.current = null;
        if (pendingLetterId.current) {
          updateCoverLetter(pendingLetterId.current, pendingBody.current);
        } else if (pendingBody.current) {
          pendingLetterId.current = saveCoverLetter({ body: pendingBody.current });
        }
      }, 500);
    },
    [saveCoverLetter, updateCoverLetter]
  );

  useEffect(() => {
    return () => {
      if (flushTimer.current) clearTimeout(flushTimer.current);
      if (copyTimer.current) clearTimeout(copyTimer.current);
      if (pendingLetterId.current) {
        updateCoverLetter(pendingLetterId.current, pendingBody.current);
      }
    };
  }, [updateCoverLetter]);

  // Each resume owns its own letter; never carry one resume's draft into another's.
  useEffect(() => {
    const existing = coverLetters.find((cl) => cl.resumeId === activeResumeId);
    pendingLetterId.current = existing?.id ?? null;
    pendingBody.current = existing?.body ?? '';
    setCoverLetter(existing?.body ?? '');
  }, [activeResumeId]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleBodyChange = (body: string) => {
    setCoverLetter(body);
    persistBody(body);
  };

  const requestCoverLetter = async (force = false) => {
    if (!aiConsentGiven && !force) {
      setShowConsentModal(true);
      return;
    }

    if (!activeResume) return;

    setIsGenerating(true);
    try {
      const res = await fetch('/api/ai/generate-cover-letter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resume: activeResume,
          jobDescription: jobDescriptionInput,
          companyName,
          jobTitle,
        }),
      });

      if (!res.ok) throw new Error('Cover letter generation failed');
      const data = await res.json();
      handleBodyChange(data.body || '');
    } catch (e: any) {
      alert(e.message || 'AI request failed');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = () => {
    if (!coverLetter) return;
    navigator.clipboard.writeText(coverLetter);
    setIsCopied(true);
    if (copyTimer.current) clearTimeout(copyTimer.current);
    copyTimer.current = setTimeout(() => setIsCopied(false), 2000);
  };

  const handleDownloadTxt = () => {
    if (!coverLetter) return;
    const slug = (companyName || 'cover-letter').replace(/[^a-z0-9]+/gi, '-').replace(/^-+|-+$/g, '');
    const blob = new Blob([coverLetter], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Cover-Letter-${slug || 'draft'}-${fileNameTimestamp()}.txt`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    // Revoking in the same task can abort the download in Firefox/Safari.
    setTimeout(() => URL.revokeObjectURL(url), 0);
  };

  if (!activeResume) return null;

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm space-y-6">
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <div>
          <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
            <FileCode className="w-5 h-5 text-blue-600" />
            Tailored Cover Letter Assistant
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Generate a personalized, professional cover letter matching your active resume and target company.
          </p>
        </div>

        <button
          type="button"
          onClick={requestCoverLetter}
          disabled={isGenerating}
          className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-semibold rounded-xl transition shadow-sm flex items-center gap-1.5 disabled:opacity-50"
        >
          {isGenerating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
          Generate Cover Letter
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
        <div>
          <label className="block text-slate-600 font-semibold mb-1">Company / Organization Name</label>
          <input
            type="text"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            placeholder="e.g. Acme Inc."
            className="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none font-medium text-slate-900"
          />
        </div>

        <div>
          <label className="block text-slate-600 font-semibold mb-1">Target Role Title</label>
          <input
            type="text"
            value={jobTitle}
            onChange={(e) => setJobTitle(e.target.value)}
            placeholder="e.g. Lead Software Engineer"
            className="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none font-medium text-slate-900"
          />
        </div>
      </div>

      {/* Cover Letter Content Textarea */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-700">Cover Letter Output</label>

          {coverLetter && (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleCopy}
                className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition flex items-center gap-1"
              >
                {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                {isCopied ? 'Copied!' : 'Copy'}
              </button>
              <button
                type="button"
                onClick={handleDownloadTxt}
                className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition flex items-center gap-1"
              >
                <Download className="w-3.5 h-3.5" /> TXT
              </button>
            </div>
          )}
        </div>

        <textarea
          rows={12}
          value={coverLetter}
          onChange={(e) => handleBodyChange(e.target.value)}
          placeholder="Click 'Generate Cover Letter' above to create a tailored draft..."
          className="w-full p-4 border border-slate-200 rounded-2xl text-xs text-slate-800 leading-relaxed focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none resize-y font-sans"
        />
      </div>

      {/* Privacy Consent Gate Modal */}
      {showConsentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100">
            <div className="flex items-center gap-2 text-amber-600 font-bold text-base mb-2">
              <ShieldAlert className="w-5 h-5" />
              Privacy Consent Gate
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              To generate your custom cover letter, your resume details and target company info will be transmitted securely to Gemini AI.
            </p>

            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowConsentModal(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  setAiConsentGiven(true);
                  setShowConsentModal(false);
                  requestCoverLetter(true);
                }}
                className="px-5 py-2 text-xs font-semibold bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition"
              >
                Allow & Generate
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
