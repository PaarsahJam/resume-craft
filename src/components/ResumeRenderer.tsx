import React from 'react';
import { Resume, TemplateId, TemplateOptions } from '../types';
import { ModernTechTemplate } from './templates/ModernTechTemplate';
import { MinimalTemplate } from './templates/MinimalTemplate';
import { ExecutiveTemplate } from './templates/ExecutiveTemplate';
import { TwoColumnTemplate } from './templates/TwoColumnTemplate';
import { CreativeTemplate } from './templates/CreativeTemplate';
import { IvyLeagueTemplate } from './templates/IvyLeagueTemplate';
import { CompactGridTemplate } from './templates/CompactGridTemplate';
import { NordicSlateTemplate } from './templates/NordicSlateTemplate';
import { MetroSplitTemplate } from './templates/MetroSplitTemplate';
import { PlumDuotoneTemplate } from './templates/PlumDuotoneTemplate';

interface ResumeRendererProps {
  resume: Resume;
  template: TemplateId;
  options: TemplateOptions;
  className?: string;
  isPrintMode?: boolean;
}

export const ResumeRenderer: React.FC<ResumeRendererProps> = ({
  resume,
  template,
  options,
  className = '',
  isPrintMode = false,
}) => {
  // Map font styles
  const getFontFamilyClass = () => {
    switch (options.font) {
      case 'serif':
      case 'merriweather':
        return 'font-serif';
      case 'playfair':
        return 'font-serif';
      case 'mono':
        return 'font-mono';
      case 'outfit':
      case 'inter':
      case 'sans':
      default:
        return 'font-sans';
    }
  };

  // Map padding / margins
  const getMarginStyle = () => {
    if (template === 'plum-duotone') {
      return 'p-0 overflow-hidden';
    }
    switch (options.margins) {
      case 'compact':
        return 'p-6 sm:p-8';
      case 'spacious':
        return 'p-12 sm:p-14';
      case 'normal':
      default:
        return 'p-8 sm:p-10';
    }
  };

  // Map font size scaling
  const getFontSizeClass = () => {
    switch (options.fontSize) {
      case 'sm':
        return 'text-[13px]';
      case 'lg':
        return 'text-[15px]';
      case 'md':
      default:
        return 'text-[14px]';
    }
  };

  // Paper width aspect container
  // A4 ratio ~ 1 : 1.414, Letter ratio ~ 1 : 1.294
  const paperWidthClass = options.paperSize === 'letter' ? 'max-w-[816px]' : 'max-w-[794px]';

  const renderTemplateContent = () => {
    switch (template) {
      case 'minimal':
        return <MinimalTemplate resume={resume} options={options} />;
      case 'executive':
        return <ExecutiveTemplate resume={resume} options={options} />;
      case 'two-column':
        return <TwoColumnTemplate resume={resume} options={options} />;
      case 'creative':
        return <CreativeTemplate resume={resume} options={options} />;
      case 'ivy-league':
        return <IvyLeagueTemplate resume={resume} options={options} />;
      case 'compact-grid':
        return <CompactGridTemplate resume={resume} options={options} />;
      case 'nordic-slate':
        return <NordicSlateTemplate resume={resume} options={options} />;
      case 'metro-split':
        return <MetroSplitTemplate resume={resume} options={options} />;
      case 'plum-duotone':
        return <PlumDuotoneTemplate resume={resume} options={options} />;
      case 'modern-tech':
      default:
        return <ModernTechTemplate resume={resume} options={options} />;
    }
  };

  return (
    <div
      id="resume-render-target"
      className={`bg-white shadow-xl rounded-sm mx-auto transition-all duration-200 border border-slate-200/60 print:shadow-none print:border-none ${paperWidthClass} ${getMarginStyle()} ${getFontFamilyClass()} ${getFontSizeClass()} ${className}`}
      style={{
        minHeight: isPrintMode ? 'auto' : '1056px',
        width: '100%',
        boxSizing: 'border-box',
        overflowWrap: 'break-word',
        wordBreak: 'break-word',
      }}
    >
      {renderTemplateContent()}
    </div>
  );
};
