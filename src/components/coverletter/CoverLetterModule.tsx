import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useResumeStore } from '../../store/useResumeStore';
import { FileCode, Sparkles, Copy, Check, Loader2, Download, ShieldAlert, AlertTriangle } from 'lucide-react';
import { fileNameTimestamp } from '../../lib/pdfExporter';
import { describeAiFailure, AI_NETWORK_ERROR_MESSAGE } from '../../lib/aiErrors';

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
  const [aiError, setAiError] = useState<string | null>(null);
  // A generated letter is held for review when a draft already exists.
  const [pendingLetter, setPendingLetter] = useState<string | null>(null);
  // Whether a draft already existed, so the review copy can be accurate.
  const [isReplacingDraft, setIsReplacingDraft] = useState(false);

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
    setAiError(null);
    setPendingLetter(null);
    setIsReplacingDraft(false);
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

      // Read the server's structured error code so the user sees why it failed.
      // The existing draft letter is left exactly as it was.
      if (!res.ok) {
        const failure = await describeAiFailure(res);
        setAiError(failure.message);
        return;
      }
      const data = await res.json();
      const draft = typeof data.body === 'string' ? data.body : '';

      // Never overwrite an existing draft implicitly. If there is already
      // content, present the generated letter for review instead.
      // Decision 3: ALWAYS require explicit acceptance, even when the editor
      // is empty. Generation and application are separate steps so the user
      // always reads what the model produced before it becomes their letter.
      setIsReplacingDraft(coverLetter.trim().length > 0);
      setPendingLetter(draft);
    } catch {
      // The request never reached the server (offline, server down, aborted).
      setAiError(AI_NETWORK_ERROR_MESSAGE);
    } finally {
      setIsGenerating(false);
    }
  };

  /** Explicit acceptance: the only path that replaces an existing draft. */
  const acceptPendingLetter = () => {
    if (pendingLetter === null) return;
    handleBodyChange(pendingLetter);
    setPendingLetter(null);
    setIsReplacingDraft(false);
  };

  /** Explicit rejection: keep whatever the editor already contained. */
  const rejectPendingLetter = () => {
    setPendingLetter(null);
    setIsReplacingDraft(false);
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

      {/* Cover-letter review gate: an existing draft is never overwritten silently. */}
      {pendingLetter !== null && (
        <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-xl space-y-3">
          <div className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            Review Generated Letter — not saved yet
          </div>
          <p className="text-[11px] text-slate-600 leading-relaxed">
            {isReplacingDraft
              ? 'You already have a draft saved. Applying will replace it. Your current draft is unchanged until you accept.'
              : 'Your editor is unchanged. Read the generated letter below, then accept it to add it to your editor.'}
          </p>
          <p className="text-[11px] text-slate-600 leading-relaxed">
            AI text can introduce details you never wrote. Verify every claim against your own
            experience before accepting.
          </p>
          <div className="p-3 bg-white border border-slate-200 rounded-lg max-h-56 overflow-y-auto">
            <pre className="text-[11px] text-slate-600 whitespace-pre-wrap break-words font-sans">
              {pendingLetter.slice(0, 1200)}
            </pre>
          </div>
          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={rejectPendingLetter}
              className="px-3 py-1.5 bg-white border border-slate-300 text-slate-700 font-semibold rounded-xl transition hover:bg-slate-50"
            >
              Discard — keep my text
            </button>
            <button
              type="button"
              onClick={acceptPendingLetter}
              className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition"
            >
              {isReplacingDraft ? 'Replace Draft' : 'Use This Letter'}
            </button>
          </div>
        </div>
      )}

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
              To generate your custom cover letter, your resume details and target company info will be transmitted securely to our AI service provider.
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
