import React, { useState, useMemo } from 'react';
import { useResumeStore } from '../../store/useResumeStore';
import { Resume } from '../../types';
import { Target, Sparkles, CheckCircle2, AlertCircle, ShieldAlert, Loader2, AlertTriangle } from 'lucide-react';
import { describeAiFailure, AI_NETWORK_ERROR_MESSAGE } from '../../lib/aiErrors';

export const ResumeScorePanel: React.FC = () => {
  const {
    resumes,
    activeResumeId,
    jobDescriptionInput,
    setJobDescriptionInput,
    jdMatch,
    setJdMatch,
    aiConsentGiven,
    setAiConsentGiven,
  } = useResumeStore();

  const [isAiAnalyzing, setIsAiAnalyzing] = useState(false);
  const [showConsentModal, setShowConsentModal] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  const activeResume = resumes.find((r) => r.id === activeResumeId);

  // Local ATS Quality Score calculation
  const scoreBreakdown = useMemo(() => {
    if (!activeResume) return { total: 0, items: [] };

    const items: { label: string; score: number; max: number; status: 'good' | 'warn' }[] = [];

    // 1. Contact completeness
    const p = activeResume.personal || ({} as Resume['personal']);
    const hasContact = Boolean(p.email && p.phone && p.location);
    items.push({
      label: 'Contact Info Completeness',
      score: hasContact ? 15 : 8,
      max: 15,
      status: hasContact ? 'good' : 'warn',
    });

    // 2. Professional Summary
    const sumLen = (activeResume.summary || '').length;
    const goodSummary = sumLen >= 100 && sumLen <= 500;
    items.push({
      label: 'Professional Summary Length',
      score: goodSummary ? 15 : sumLen > 0 ? 8 : 0,
      max: 15,
      status: goodSummary ? 'good' : 'warn',
    });

    // 3. Technical Skills
    const skillCount = (activeResume.skills || []).flatMap((s) => s?.items || []).length;
    items.push({
      label: 'Skills Density',
      score: skillCount >= 10 ? 20 : skillCount >= 5 ? 12 : 5,
      max: 20,
      status: skillCount >= 10 ? 'good' : 'warn',
    });

    // 4. Quantified Metrics in Experience
    const allBullets = (activeResume.experience || []).flatMap((e) => e?.description || []);
    // Must require a real number: a bare /k|M|x/ also matches "Key", "Complex", etc.
    const metricBullets = allBullets.filter((b) =>
      /(?:\d+\s*%)|(?:\$\s*\d)|(?:\b\d[\d,.]*\s*[kKmMbB]\b)|(?:\b\d[\d,.]*\+?\b)|(?:\bx\d+\b)/.test(b)
    ).length;
    const metricRatio = allBullets.length > 0 ? metricBullets / allBullets.length : 0;
    items.push({
      label: 'Quantified Impact Metrics (% / $ / #)',
      score: metricRatio >= 0.5 ? 25 : metricRatio > 0.2 ? 15 : 5,
      max: 25,
      status: metricRatio >= 0.5 ? 'good' : 'warn',
    });

    // 5. Job Description Overlap (if JD entered)
    if (jobDescriptionInput.trim()) {
      const jdWords = new Set(
        jobDescriptionInput
          .toLowerCase()
          .replace(/[^a-z0-9\s]/g, '')
          .split(/\s+/)
          .filter((w) => w.length > 3)
      );

      const resumeWords = new Set(
        JSON.stringify(activeResume)
          .toLowerCase()
          .replace(/[^a-z0-9\s]/g, '')
          .split(/\s+/)
          .filter((w) => w.length > 3)
      );

      let matched = 0;
      jdWords.forEach((w) => {
        if (resumeWords.has(w)) matched++;
      });

      const matchPercent = jdWords.size > 0 ? Math.round((matched / jdWords.size) * 100) : 0;
      const jdScore = Math.min(25, Math.round((matchPercent / 100) * 25));

      items.push({
        label: 'Job Description Keyword Alignment',
        score: jdScore,
        max: 25,
        status: jdScore >= 18 ? 'good' : 'warn',
      });
    } else {
      items.push({
        label: 'Job Description Keyword Alignment (Paste JD below)',
        score: 15,
        max: 25,
        status: 'warn',
      });
    }

    const total = items.reduce((acc, curr) => acc + curr.score, 0);

    return { total, items };
  }, [activeResume, jobDescriptionInput]);

  // Handle AI JD tailoring request
  const requestAiJdTailoring = async (force = false) => {
    if (!aiConsentGiven && !force) {
      setShowConsentModal(true);
      return;
    }

    if (!jobDescriptionInput.trim()) {
      setAiError('Please paste a Job Description first.');
      return;
    }

    setIsAiAnalyzing(true);
    setAiError(null);
    try {
      const res = await fetch('/api/ai/tailor-jd', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resume: activeResume,
          jobDescription: jobDescriptionInput,
        }),
      });

      // Read the server's structured error code so the user sees why it failed.
      if (!res.ok) {
        const failure = await describeAiFailure(res);
        setAiError(failure.message);
        return;
      }
      const data = await res.json();
      // The model response is untyped and the server falls back to `{}`, so
      // normalise before storing or the render below will throw on `.length`.
      setJdMatch({
        score: Number(data.score) || 0,
        matchedKeywords: Array.isArray(data.matchedKeywords) ? data.matchedKeywords : [],
        missingKeywords: Array.isArray(data.missingKeywords) ? data.missingKeywords : [],
        suggestions: Array.isArray(data.suggestions) ? data.suggestions : [],
        lastAnalyzedAt: new Date().toISOString(),
      });
    } catch {
      // The request never reached the server (offline, server down, aborted).
      setAiError(AI_NETWORK_ERROR_MESSAGE);
    } finally {
      setIsAiAnalyzing(false);
    }
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
            <Target className="w-5 h-5 text-blue-600" />
            Resume Score & ATS Job Match
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Evaluate ATS readiness and tailor your resume against target job postings.
          </p>
        </div>

        {/* Overall Score Badge */}
        <div className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-2xl shadow-sm">
          <div className="text-2xl font-black text-blue-400">{scoreBreakdown.total}</div>
          <div className="text-[10px] font-bold tracking-wider uppercase text-slate-300">
            / 100<br />ATS SCORE
          </div>
        </div>
      </div>

      {/* Score Breakdown List */}
      <div className="space-y-2.5">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Score Audit Breakdown</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          {scoreBreakdown.items.map((item, idx) => (
            <div key={idx} className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-2">
                {item.status === 'good' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-amber-500 shrink-0" />
                )}
                <span className="font-semibold text-slate-800">{item.label}</span>
              </div>
              <span className="font-mono font-bold text-slate-900">{item.score}/{item.max}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Job Description Input Section */}
      <div className="pt-4 border-t border-slate-100 space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
            Target Job Description (JD)
          </label>

          <button
            type="button"
            onClick={requestAiJdTailoring}
            disabled={isAiAnalyzing || !jobDescriptionInput.trim()}
            className="px-3.5 py-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-semibold rounded-xl transition shadow-sm flex items-center gap-1.5 disabled:opacity-50"
          >
            {isAiAnalyzing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
            AI Tailor Pass
          </button>
        </div>

        <textarea
          rows={5}
          value={jobDescriptionInput}
          onChange={(e) => setJobDescriptionInput(e.target.value)}
          placeholder="Paste job posting text here (e.g. required skills, responsibilities)..."
          className="w-full p-3 border border-slate-200 rounded-xl text-xs text-slate-800 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none resize-y"
        />
      </div>

      {/* AI Analysis Result */}
      {jdMatch && (
        <div className="p-5 bg-indigo-50/70 border border-indigo-200 rounded-2xl space-y-4 animate-in fade-in">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-indigo-950 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-600" />
              AI Tailoring Analysis
            </h4>
            <span className="px-3 py-1 bg-indigo-600 text-white rounded-full text-xs font-bold">
              {jdMatch.score}% JD Match
            </span>
          </div>

          {/* Keywords */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <div className="font-bold text-emerald-800 mb-1.5 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Matched Keywords ({jdMatch.matchedKeywords.length})
              </div>
              <div className="flex flex-wrap gap-1">
                {jdMatch.matchedKeywords.map((k) => (
                  <span key={k} className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded font-medium text-[11px]">
                    {k}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <div className="font-bold text-rose-800 mb-1.5 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" /> Missing / Recommended ({jdMatch.missingKeywords.length})
              </div>
              <div className="flex flex-wrap gap-1">
                {jdMatch.missingKeywords.map((k) => (
                  <span key={k} className="px-2 py-0.5 bg-rose-100 text-rose-800 rounded font-medium text-[11px]">
                    +{k}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Actionable Tailoring Tips */}
          {jdMatch.suggestions && jdMatch.suggestions.length > 0 && (
            <div className="pt-3 border-t border-indigo-200 text-xs">
              <div className="font-bold text-indigo-950 mb-2">Specific Tailoring Suggestions:</div>
              <ul className="list-disc list-outside ml-4 space-y-1.5 text-indigo-900">
                {jdMatch.suggestions.map((s, idx) => (
                  <li key={idx}>{s}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Privacy Consent Gate Modal */}
      {showConsentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100">
            <div className="flex items-center gap-2 text-amber-600 font-bold text-base mb-2">
              <ShieldAlert className="w-5 h-5" />
              Privacy Consent Gate
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              ResumeCraft AI is privacy-first. To analyze and tailor your resume against this job description, your resume summary, skills, and the job description text will be sent to the AI service.
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
                  requestAiJdTailoring(true);
                }}
                className="px-5 py-2 text-xs font-semibold bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition"
              >
                Allow & Analyze
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
