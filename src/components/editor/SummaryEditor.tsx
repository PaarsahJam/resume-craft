import React, { useState } from 'react';
import { Sparkles, FileText, Check, ShieldAlert, Loader2, AlertTriangle } from 'lucide-react';
import { useResumeStore } from '../../store/useResumeStore';
import { describeAiFailure, AI_NETWORK_ERROR_MESSAGE } from '../../lib/aiErrors';

interface SummaryEditorProps {
  summary?: string;
  headline?: string;
  onChange: (updatedSummary: string) => void;
}

export const SummaryEditor: React.FC<SummaryEditorProps> = ({ summary = '', headline, onChange }) => {
  const { aiConsentGiven, setAiConsentGiven } = useResumeStore();
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<{ concise?: string; executive?: string } | null>(null);
  const [showConsentModal, setShowConsentModal] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  const requestAiSummary = async (force = false) => {
    if (!aiConsentGiven && !force) {
      setShowConsentModal(true);
      return;
    }

    setIsAiLoading(true);
    setAiSuggestions(null);
    setAiError(null);

    try {
      const res = await fetch('/api/ai/improve-summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          summary,
          headline,
        }),
      });

      // Read the server's structured error code so the user sees why it failed.
      if (!res.ok) {
        const failure = await describeAiFailure(res);
        setAiError(failure.message);
        return;
      }
      const data = await res.json();
      setAiSuggestions(data);
    } catch {
      // The request never reached the server (offline, server down, aborted).
      setAiError(AI_NETWORK_ERROR_MESSAGE);
    } finally {
      setIsAiLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm space-y-3">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <FileText className="w-4 h-4 text-blue-600" />
          Professional Summary
        </h3>

        <button
          type="button"
          onClick={requestAiSummary}
          disabled={isAiLoading}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-semibold rounded-xl transition shadow-sm disabled:opacity-50"
        >
          {isAiLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
          AI Polish
        </button>
      </div>

      <textarea
        rows={4}
        value={summary}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Write a brief overview of your key qualifications, technical domain expertise, and career highlights..."
        className="w-full p-3 border border-slate-200 rounded-xl text-xs text-slate-800 leading-relaxed focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none resize-y"
      />

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

      {/* AI Suggestion preview choices */}
      {aiSuggestions && (
        <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3 animate-in fade-in">
          <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            AI Suggestions (your summary is unchanged until you pick one):
          </div>
          <p className="text-[11px] text-slate-500 leading-relaxed">
            AI can add achievements or employers you never mentioned. Check every suggestion against
            your real experience before applying it.
          </p>

          {aiSuggestions.concise && (
            <div className="p-3 bg-white rounded-lg border border-slate-200 hover:border-blue-300 transition cursor-pointer group" onClick={() => { onChange(aiSuggestions.concise!); setAiSuggestions(null); }}>
              <div className="flex justify-between items-center text-[11px] font-bold text-slate-500 mb-1">
                <span>CONCISE VERSION</span>
                <span className="text-blue-600 opacity-0 group-hover:opacity-100 flex items-center gap-0.5"><Check className="w-3 h-3" /> Apply</span>
              </div>
              <p className="text-xs text-slate-700">{aiSuggestions.concise}</p>
            </div>
          )}

          {aiSuggestions.executive && (
            <div className="p-3 bg-white rounded-lg border border-slate-200 hover:border-blue-300 transition cursor-pointer group" onClick={() => { onChange(aiSuggestions.executive!); setAiSuggestions(null); }}>
              <div className="flex justify-between items-center text-[11px] font-bold text-slate-500 mb-1">
                <span>EXECUTIVE IMPACT VERSION</span>
                <span className="text-blue-600 opacity-0 group-hover:opacity-100 flex items-center gap-0.5"><Check className="w-3 h-3" /> Apply</span>
              </div>
              <p className="text-xs text-slate-700">{aiSuggestions.executive}</p>
            </div>
          )}

          {/* Explicit reject: dismiss without touching the user's summary. */}
          <div className="flex justify-end pt-1">
            <button
              type="button"
              onClick={() => setAiSuggestions(null)}
              className="px-2.5 py-1 bg-white border border-slate-300 text-slate-600 rounded-lg text-[11px] font-semibold transition hover:bg-slate-50"
            >
              Discard suggestions
            </button>
          </div>
        </div>
      )}

      {/* Explicit Privacy Consent Gate Modal */}
      {showConsentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100">
            <div className="flex items-center gap-2 text-amber-600 font-bold text-base mb-2">
              <ShieldAlert className="w-5 h-5" />
              Privacy Consent Gate
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              ResumeCraft AI operates strictly local-first by default. To polish your summary, your summary draft and headline will be sent securely to the AI server.
            </p>
            <p className="text-xs text-slate-500 mt-2 italic">
              No data is ever stored on external servers or used for model training.
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
                  requestAiSummary(true);
                }}
                className="px-5 py-2 text-xs font-semibold bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition"
              >
                Allow & Proceed
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
