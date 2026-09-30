import React from 'react';
import { useResumeStore } from '../../store/useResumeStore';
import { TemplateId, FontOption, MarginOption, PaperSizeOption, FontSizeOption } from '../../types';
import { Palette, Layout, Type, ShieldCheck } from 'lucide-react';

export const DesignControls: React.FC = () => {
  const {
    resumes,
    activeResumeId,
    selectedTemplate,
    setSelectedTemplate,
    templateOptions,
    setTemplateOptions,
  } = useResumeStore();

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

  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm space-y-5 text-xs">
      <div className="pb-4 border-b border-slate-100">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <Layout className="w-4 h-4 text-blue-600" />
          Template &amp; Design Controls
        </h3>
        <p className="text-[11px] text-slate-500">
          Customize typography, spacing, and layout.
        </p>
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
