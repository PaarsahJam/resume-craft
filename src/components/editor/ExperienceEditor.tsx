import React, { useEffect, useState } from 'react';
import { ExperienceItem } from '../../types';
import { Briefcase, Plus, Trash2, Copy, AlertTriangle, Sparkles, Loader2, ChevronDown, ChevronUp, ShieldAlert } from 'lucide-react';
import { useResumeStore } from '../../store/useResumeStore';

interface ExperienceEditorProps {
  experience: ExperienceItem[];
  onChange: (updated: ExperienceItem[]) => void;
}

export const ExperienceEditor: React.FC<ExperienceEditorProps> = ({ experience, onChange }) => {
  const { aiConsentGiven, setAiConsentGiven } = useResumeStore();
  const [expandedId, setExpandedId] = useState<string | null>(experience[0]?.id || null);
  // This editor is reused across resume switches and the first role can be
  // deleted, so the remembered id can point at a role that no longer exists.
  useEffect(() => {
    if (expandedId && experience.some((e) => e.id === expandedId)) return;
    setExpandedId(experience[0]?.id ?? null);
  }, [experience, expandedId]);
  const [improvingBulletInfo, setImprovingBulletInfo] = useState<{
    expId: string;
    bulletIndex: number;
  } | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [showConsentModal, setShowConsentModal] = useState(false);
  const [pendingAiBullet, setPendingAiBullet] = useState<{
    expId: string;
    bulletIndex: number;
    currentBullet: string;
    jobTitle: string;
    company: string;
  } | null>(null);
  const [aiBulletChoices, setAiBulletChoices] = useState<{
    impact?: string;
    concise?: string;
    technical?: string;
  } | null>(null);

  const handleAddExperience = () => {
    const newExp: ExperienceItem = {
      id: 'exp-' + Date.now(),
      jobTitle: 'Software Engineer',
      company: 'Company / Organization',
      location: 'Remote',
      startDate: '2023',
      endDate: 'Present',
      description: ['Engineered scalable web systems and API microservices.'],
    };
    onChange([newExp, ...experience]);
    setExpandedId(newExp.id);
  };

  const handleDelete = (id: string) => {
    onChange(experience.filter((e) => e.id !== id));
  };

  const handleDuplicate = (id: string) => {
    const target = experience.find((e) => e.id === id);
    if (!target) return;
    const duplicated: ExperienceItem = {
      ...JSON.parse(JSON.stringify(target)),
      id: 'exp-' + Date.now(),
      company: `${target.company} (Copy)`,
    };
    onChange([duplicated, ...experience]);
    setExpandedId(duplicated.id);
  };

  const handleUpdateItem = (id: string, updates: Partial<ExperienceItem>) => {
    onChange(
      experience.map((e) => (e.id === id ? { ...e, ...updates } : e))
    );
  };

  const handleBulletChange = (expId: string, bulletIndex: number, text: string) => {
    const target = experience.find((e) => e.id === expId);
    if (!target) return;
    const newDesc = [...target.description];
    newDesc[bulletIndex] = text;
    handleUpdateItem(expId, { description: newDesc });
  };

  const handleAddBullet = (expId: string) => {
    const target = experience.find((e) => e.id === expId);
    if (!target) return;
    handleUpdateItem(expId, {
      description: [...target.description, 'Key responsibility or measurable achievement'],
    });
  };

  const handleRemoveBullet = (expId: string, bulletIndex: number) => {
    const target = experience.find((e) => e.id === expId);
    if (!target) return;
    const newDesc = target.description.filter((_, idx) => idx !== bulletIndex);
    handleUpdateItem(expId, { description: newDesc });
  };

  const triggerAiBulletImprovement = async (expId: string, bulletIndex: number, currentBullet: string, jobTitle: string, company: string) => {
    setImprovingBulletInfo({ expId, bulletIndex });

    if (!aiConsentGiven) {
      setPendingAiBullet({ expId, bulletIndex, currentBullet, jobTitle, company });
      setShowConsentModal(true);
      return;
    }

    await runAiBulletImprovement(expId, bulletIndex, currentBullet, jobTitle, company);
  };

  const runAiBulletImprovement = async (expId: string, bulletIndex: number, currentBullet: string, jobTitle: string, company: string) => {
    setIsAiLoading(true);
    setAiBulletChoices(null);

    try {
      const res = await fetch('/api/ai/improve-bullet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bullet: currentBullet,
          jobTitle,
          company,
        }),
      });

      if (!res.ok) throw new Error('AI bullet enhancement failed');
      const data = await res.json();
      setAiBulletChoices({
        impact: data.impact,
        concise: data.concise,
        technical: data.technical,
      });
    } catch (e: any) {
      alert(e.message || 'AI request failed');
    } finally {
      setIsAiLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm space-y-4">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <Briefcase className="w-4 h-4 text-blue-600" />
          Professional Experience
        </h3>

        <button
          type="button"
          onClick={handleAddExperience}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl transition shadow-sm"
        >
          <Plus className="w-3.5 h-3.5" />
          Add Role
        </button>
      </div>

      <div className="space-y-3">
        {experience.map((exp) => {
          const isExpanded = expandedId === exp.id;

          return (
            <div
              key={exp.id}
              className="border border-slate-200 rounded-xl bg-slate-50/50 overflow-hidden transition"
            >
              {/* Header Bar */}
              <div
                onClick={() => setExpandedId(isExpanded ? null : exp.id)}
                className="p-3.5 flex items-center justify-between cursor-pointer hover:bg-slate-100/80 transition"
              >
                <div className="flex items-center gap-2 overflow-hidden">
                  <span className="font-bold text-xs text-slate-900 truncate">
                    {exp.jobTitle || 'Role'} @ {exp.company || 'Company'}
                  </span>
                  {exp.flagged && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                      <AlertTriangle className="w-3 h-3 text-amber-600" /> Needs Review
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); handleDuplicate(exp.id); }}
                    className="p-1 text-slate-400 hover:text-slate-600 rounded"
                    title="Duplicate"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); handleDelete(exp.id); }}
                    className="p-1 text-slate-400 hover:text-red-600 rounded"
                    title="Delete"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                  {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                </div>
              </div>

              {/* Form Body */}
              {isExpanded && (
                <div className="p-4 border-t border-slate-200 bg-white space-y-3 text-xs">
                  {exp.flagged && (
                    <div className="p-2.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                      <div>
                        <strong className="font-bold">Parser Notice:</strong> This entry contained ambiguous formatting or confidential tags. Please review the details below.
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-600 font-semibold mb-1">Job Title / Role</label>
                      <input
                        type="text"
                        value={exp.jobTitle}
                        onChange={(e) => handleUpdateItem(exp.id, { jobTitle: e.target.value })}
                        className="w-full px-3 py-1.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none text-slate-900 font-medium"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-600 font-semibold mb-1">Company / Organization</label>
                      <input
                        type="text"
                        value={exp.company}
                        onChange={(e) => handleUpdateItem(exp.id, { company: e.target.value })}
                        className="w-full px-3 py-1.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none text-slate-900 font-medium"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-600 font-semibold mb-1">Location</label>
                      <input
                        type="text"
                        value={exp.location || ''}
                        onChange={(e) => handleUpdateItem(exp.id, { location: e.target.value })}
                        placeholder="e.g. Remote / San Francisco, CA"
                        className="w-full px-3 py-1.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none text-slate-900"
                      />
                    </div>

                    <div className="flex gap-2">
                      <div className="flex-1">
                        <label className="block text-slate-600 font-semibold mb-1">Start Date</label>
                        <input
                          type="text"
                          value={exp.startDate || ''}
                          onChange={(e) => handleUpdateItem(exp.id, { startDate: e.target.value })}
                          placeholder="2022"
                          className="w-full px-3 py-1.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none text-slate-900"
                        />
                      </div>
                      <div className="flex-1">
                        <label className="block text-slate-600 font-semibold mb-1">End Date</label>
                        <input
                          type="text"
                          value={exp.endDate || ''}
                          onChange={(e) => handleUpdateItem(exp.id, { endDate: e.target.value })}
                          placeholder="Present"
                          className="w-full px-3 py-1.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none text-slate-900"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Bullet points */}
                  <div className="space-y-2 pt-2 border-t border-slate-100">
                    <label className="block text-slate-700 font-bold">Key Responsibilities & Achievements</label>
                    {exp.description.map((bullet, bIdx) => (
                      <div key={bIdx} className="space-y-1">
                        <div className="flex items-start gap-2">
                          <span className="text-slate-400 font-bold mt-2">•</span>
                          <textarea
                            rows={2}
                            value={bullet}
                            onChange={(e) => handleBulletChange(exp.id, bIdx, e.target.value)}
                            className="flex-1 p-2 border border-slate-200 rounded-lg text-slate-800 text-xs focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none resize-y"
                          />
                          <div className="flex flex-col gap-1 shrink-0">
                            <button
                              type="button"
                              onClick={() => triggerAiBulletImprovement(exp.id, bIdx, bullet, exp.jobTitle, exp.company)}
                              className="p-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg transition"
                              title="AI Polish Bullet"
                            >
                              <Sparkles className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleRemoveBullet(exp.id, bIdx)}
                              className="p-1.5 hover:bg-red-50 text-slate-400 hover:text-red-600 rounded-lg transition"
                              title="Remove Bullet"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* AI Choices dropdown for this bullet */}
                        {improvingBulletInfo?.expId === exp.id && improvingBulletInfo.bulletIndex === bIdx && (
                          <div className="ml-5 p-3 bg-indigo-50/70 border border-indigo-200 rounded-xl space-y-2">
                            {isAiLoading ? (
                              <div className="flex items-center gap-2 text-indigo-700 font-semibold text-xs py-1">
                                <Loader2 className="w-4 h-4 animate-spin" /> Rewriting bullet point with AI metrics...
                              </div>
                            ) : aiBulletChoices ? (
                              <div className="space-y-2">
                                <div className="text-[11px] font-bold text-indigo-900">Select an improved bullet option:</div>
                                {aiBulletChoices.impact && (
                                  <div
                                    onClick={() => {
                                      handleBulletChange(exp.id, bIdx, aiBulletChoices.impact!);
                                      setImprovingBulletInfo(null);
                                    }}
                                    className="p-2 bg-white rounded border border-indigo-200 hover:border-indigo-500 cursor-pointer text-xs text-slate-800 font-medium"
                                  >
                                    <strong className="text-indigo-600">High Impact: </strong> {aiBulletChoices.impact}
                                  </div>
                                )}
                                {aiBulletChoices.concise && (
                                  <div
                                    onClick={() => {
                                      handleBulletChange(exp.id, bIdx, aiBulletChoices.concise!);
                                      setImprovingBulletInfo(null);
                                    }}
                                    className="p-2 bg-white rounded border border-indigo-200 hover:border-indigo-500 cursor-pointer text-xs text-slate-800 font-medium"
                                  >
                                    <strong className="text-indigo-600">Concise: </strong> {aiBulletChoices.concise}
                                  </div>
                                )}
                                {aiBulletChoices.technical && (
                                  <div
                                    onClick={() => {
                                      handleBulletChange(exp.id, bIdx, aiBulletChoices.technical!);
                                      setImprovingBulletInfo(null);
                                    }}
                                    className="p-2 bg-white rounded border border-indigo-200 hover:border-indigo-500 cursor-pointer text-xs text-slate-800 font-medium"
                                  >
                                    <strong className="text-indigo-600">Technical Outcome: </strong> {aiBulletChoices.technical}
                                  </div>
                                )}
                              </div>
                            ) : null}
                          </div>
                        )}
                      </div>
                    ))}

                    <button
                      type="button"
                      onClick={() => handleAddBullet(exp.id)}
                      className="inline-flex items-center gap-1 px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition"
                    >
                      <Plus className="w-3 h-3" /> Add Bullet Point
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
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
              To rewrite this bullet point, the bullet text, job title and company name will be transmitted securely to the AI service.
            </p>

            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setShowConsentModal(false);
                  setPendingAiBullet(null);
                  setImprovingBulletInfo(null);
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
                  const p = pendingAiBullet;
                  setPendingAiBullet(null);
                  if (p) {
                    runAiBulletImprovement(p.expId, p.bulletIndex, p.currentBullet, p.jobTitle, p.company);
                  }
                }}
                className="px-5 py-2 text-xs font-semibold bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition"
              >
                Allow &amp; Rewrite
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
