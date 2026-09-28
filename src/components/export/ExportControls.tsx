import React, { useState } from 'react';
import { useResumeStore } from '../../store/useResumeStore';
import { TemplateId, FontOption, MarginOption, PaperSizeOption, FontSizeOption } from '../../types';
import { Download, Printer, FileText, Check, Palette, Layout, Type, ShieldCheck, FileDown, Loader2, Globe, Sparkles } from 'lucide-react';
import { exportPdfFile, triggerPrintToPdf, formatFileName } from '../../lib/pdfExporter';
import { generateDocxBlob, downloadDocx } from '../../lib/docxExporter';

export const ExportControls: React.FC = () => {
  const {
    resumes,
    activeResumeId,
    selectedTemplate,
    setSelectedTemplate,
    templateOptions,
    setTemplateOptions,
    updateActiveResume,
  } = useResumeStore();

  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);

  const activeResume = resumes.find((r) => r.id === activeResumeId);

  if (!activeResume) return null;

  const templates: { id: TemplateId; name: string; desc: string; badge?: string }[] = [
    { id: 'plum-duotone', name: 'Plum Duotone', desc: 'Asymmetric 2-tone with plum sidebar & rating dots', badge: 'Featured' },
    { id: 'modern-tech', name: 'Modern Tech', desc: 'Sleek accent bar & tech stack badges', badge: 'Popular' },
    { id: 'ivy-league', name: 'Ivy League', desc: 'Academic, legal & finance Roman standard', badge: 'ATS High' },
    { id: 'compact-grid', name: 'Tech Grid', desc: 'High-density Silicon Valley engineering', badge: 'Compact' },
    { id: 'nordic-slate', name: 'Nordic Slate', desc: 'Minimalist editorial with timeline rail', badge: 'Clean' },
    { id: 'metro-split', name: 'Metro Split', desc: 'Corporate director with monogram badge', badge: 'Executive' },
    { id: 'executive', name: 'Executive', desc: 'Classic centered serif with divider rules', badge: 'Classic' },
    { id: 'two-column', name: 'Sidebar Split', desc: 'High-contrast full height colored sidebar', badge: '2-Column' },
    { id: 'minimal', name: 'Clean Minimal', desc: 'Spacious Swiss monochrome typography', badge: 'Minimal' },
    { id: 'creative', name: 'Creative Banner', desc: 'Vibrant header card for design & product', badge: 'Vibrant' },
  ];

  const colorSwatches = [
    { label: 'Deep Plum', hex: '#582949' },
    { label: 'Royal Blue', hex: '#2563eb' },
    { label: 'Deep Teal', hex: '#0f766e' },
    { label: 'Indigo', hex: '#4f46e5' },
    { label: 'Emerald', hex: '#059669' },
    { label: 'Slate Black', hex: '#0f172a' },
    { label: 'Rosewood', hex: '#be123c' },
    { label: 'Amber', hex: '#d97706' },
  ];

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
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleTranslateResume = async (targetLang: 'English' | 'Armenian') => {
    setIsTranslating(true);
    try {
      const res = await fetch('/api/ai/translate-resume', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resume: activeResume,
          targetLanguage: targetLang === 'Armenian' ? 'Armenian (Հայերեն)' : 'English',
        }),
      });

      if (!res.ok) {
        throw new Error('Translation request failed');
      }

      const translatedResume = await res.json();
      if (translatedResume && translatedResume.personal) {
        updateActiveResume(translatedResume);
        setTemplateOptions({ language: targetLang === 'Armenian' ? 'hy' : 'en' });
      }
    } catch (e: any) {
      alert('AI Translation failed: ' + e.message);
    } finally {
      setIsTranslating(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm space-y-5 text-xs">
      {/* Header & Export Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
        <div>
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Layout className="w-4 h-4 text-blue-600" />
            Template & Design Controls
          </h3>
          <p className="text-[11px] text-slate-500">
            Customize typography, spacing, and export options.
          </p>
        </div>

        {/* Quick Export Bar */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
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
            onClick={handlePrint}
            className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl transition flex items-center gap-1.5 cursor-pointer"
            title="Print Resume"
          >
            <Printer className="w-3.5 h-3.5" /> Print
          </button>

          <button
            type="button"
            onClick={handleDocxExport}
            className="px-3 py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-xl transition flex items-center gap-1.5 shadow-sm cursor-pointer"
          >
            <FileText className="w-3.5 h-3.5" /> Word (DOCX)
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
      </div>

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
            title="Translate entire resume using Gemini AI"
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

      {/* Templates Selector */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="block text-slate-700 font-bold uppercase tracking-wider text-[10px]">
            Resume Template Style ({templates.length} Professional Layouts)
          </label>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {templates.map((tmpl) => (
            <button
              key={tmpl.id}
              type="button"
              onClick={() => setSelectedTemplate(tmpl.id as TemplateId)}
              className={`p-2.5 rounded-xl border text-left transition flex flex-col justify-between ${
                selectedTemplate === tmpl.id
                  ? 'bg-blue-50/80 border-blue-600 text-blue-900 ring-2 ring-blue-500/20 shadow-xs'
                  : 'bg-slate-50/80 border-slate-200 text-slate-700 hover:bg-slate-100/90'
              }`}
            >
              <div className="flex items-center justify-between w-full mb-1">
                <span className="font-bold text-xs">{tmpl.name}</span>
                {tmpl.badge && (
                  <span className={`text-[9px] font-semibold px-1.5 py-0.2 rounded ${
                    selectedTemplate === tmpl.id
                      ? 'bg-blue-200/70 text-blue-800'
                      : 'bg-slate-200 text-slate-600'
                  }`}>
                    {tmpl.badge}
                  </span>
                )}
              </div>
              <span className="text-[10px] text-slate-500 line-clamp-1">
                {tmpl.desc}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Colors & Fonts Controls */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-slate-100">
        {/* Accent Color */}
        <div>
          <label className="block text-slate-700 font-bold uppercase tracking-wider text-[10px] mb-2 flex items-center gap-1">
            <Palette className="w-3 h-3 text-slate-400" /> Accent Color Swatch
          </label>
          <div className="flex flex-wrap items-center gap-2">
            {colorSwatches.map((swatch) => (
              <button
                key={swatch.hex}
                type="button"
                onClick={() => setTemplateOptions({ accentColor: swatch.hex })}
                style={{ backgroundColor: swatch.hex }}
                className={`w-6 h-6 rounded-full border-2 transition ${
                  templateOptions.accentColor === swatch.hex
                    ? 'border-slate-900 scale-110 shadow-md'
                    : 'border-white hover:scale-105'
                }`}
                title={swatch.label}
              />
            ))}
          </div>
        </div>

        {/* Font Family */}
        <div>
          <label className="block text-slate-700 font-bold uppercase tracking-wider text-[10px] mb-2 flex items-center gap-1">
            <Type className="w-3 h-3 text-slate-400" /> Typography Font
          </label>
          <div className="flex flex-wrap gap-1.5">
            {[
              { id: 'inter', label: 'Inter (Sans)' },
              { id: 'merriweather', label: 'Merriweather (Serif)' },
              { id: 'playfair', label: 'Playfair' },
              { id: 'mono', label: 'Mono Code' },
            ].map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setTemplateOptions({ font: f.id as FontOption })}
                className={`px-2.5 py-1 rounded-lg border text-xs font-medium transition ${
                  templateOptions.font === f.id
                    ? 'bg-slate-900 text-white border-slate-900 font-bold'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Layout Parameters: Margins, Paper Size, Font Size & ATS Mode */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-slate-100">
        <div>
          <label className="block text-slate-600 font-semibold mb-1 text-[11px]">Margins</label>
          <select
            value={templateOptions.margins}
            onChange={(e) => setTemplateOptions({ margins: e.target.value as MarginOption })}
            className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 outline-none"
          >
            <option value="compact">Compact (0.4 in)</option>
            <option value="normal">Normal (0.6 in)</option>
            <option value="spacious">Spacious (0.8 in)</option>
          </select>
        </div>

        <div>
          <label className="block text-slate-600 font-semibold mb-1 text-[11px]">Paper Format</label>
          <select
            value={templateOptions.paperSize}
            onChange={(e) => setTemplateOptions({ paperSize: e.target.value as PaperSizeOption })}
            className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 outline-none"
          >
            <option value="a4">A4 (International)</option>
            <option value="letter">US Letter</option>
          </select>
        </div>

        <div>
          <label className="block text-slate-600 font-semibold mb-1 text-[11px]">Font Scale</label>
          <select
            value={templateOptions.fontSize}
            onChange={(e) => setTemplateOptions({ fontSize: e.target.value as FontSizeOption })}
            className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 outline-none"
          >
            <option value="sm">Small (0.9x)</option>
            <option value="md">Normal (1.0x)</option>
            <option value="lg">Large (1.1x)</option>
          </select>
        </div>

        <div>
          <label className="block text-slate-600 font-semibold mb-1 text-[11px]">ATS Strict Mode</label>
          <button
            type="button"
            onClick={() => setTemplateOptions({ atsMode: !templateOptions.atsMode })}
            className={`w-full px-2.5 py-1.5 rounded-lg border text-xs font-semibold flex items-center justify-center gap-1 transition ${
              templateOptions.atsMode
                ? 'bg-emerald-50 border-emerald-500 text-emerald-800'
                : 'bg-slate-50 border-slate-200 text-slate-600'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            {templateOptions.atsMode ? 'ATS Active' : 'Standard'}
          </button>
        </div>
      </div>
    </div>
  );
};

