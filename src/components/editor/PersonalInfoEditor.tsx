import React, { useState } from 'react';
import { PersonalInfo, PhotoShape } from '../../types';
import { PhotoCropModal } from './PhotoCropModal';
import { User, Mail, Phone, MapPin, Globe, Github, Linkedin, Camera, Image as ImageIcon, Trash2, Sliders, Circle, Square, LayoutGrid, EyeOff } from 'lucide-react';

interface PersonalInfoEditorProps {
  personal: PersonalInfo;
  onChange: (updated: PersonalInfo) => void;
}

export const PersonalInfoEditor: React.FC<PersonalInfoEditorProps> = ({ personal, onChange }) => {
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);

  const handleFieldChange = (field: keyof PersonalInfo, value: any) => {
    onChange({
      ...personal,
      [field]: value,
    });
  };

  const handleDirectPhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (evt) => {
        if (evt.target?.result) {
          handleFieldChange('photo', {
            dataUrl: evt.target.result as string,
            shape: personal.photo?.shape || 'circle',
          });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const currentShape = personal.photo?.shape || 'circle';
  const hasPhoto = Boolean(personal.photo?.dataUrl);

  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm space-y-4">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <User className="w-4 h-4 text-blue-600" />
          Personal Details
        </h3>
      </div>

      {/* Profile Photo Section Banner */}
      <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-xl space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
            <Camera className="w-3.5 h-3.5 text-blue-600" />
            Profile Photo (Appears at Top of CV)
          </label>

          {hasPhoto && (
            <button
              type="button"
              onClick={() => handleFieldChange('photo', undefined)}
              className="text-[11px] font-semibold text-rose-600 hover:text-rose-700 flex items-center gap-1 transition"
            >
              <Trash2 className="w-3 h-3" /> Remove Photo
            </button>
          )}
        </div>

        <div className="flex items-center gap-4">
          {/* Avatar Preview */}
          <div className="shrink-0 relative">
            {hasPhoto ? (
              <img
                src={personal.photo?.dataUrl}
                alt="Profile Preview"
                className={`w-16 h-16 object-cover border-2 border-white shadow-sm transition-all ${
                  currentShape === 'circle'
                    ? 'rounded-full'
                    : currentShape === 'rounded'
                    ? 'rounded-xl'
                    : currentShape === 'square'
                    ? 'rounded-none'
                    : 'rounded-full opacity-40'
                }`}
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-slate-200/80 border border-dashed border-slate-300 flex flex-col items-center justify-center text-slate-400">
                <ImageIcon className="w-6 h-6" />
              </div>
            )}
          </div>

          {/* Action buttons & shape selector */}
          <div className="flex-1 space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <label className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg cursor-pointer transition flex items-center gap-1.5 shadow-xs">
                <Camera className="w-3.5 h-3.5" />
                {hasPhoto ? 'Change Photo' : 'Upload Photo'}
                <input type="file" accept="image/*" onChange={handleDirectPhotoUpload} className="hidden" />
              </label>

              {hasPhoto && (
                <button
                  type="button"
                  onClick={() => setIsPhotoModalOpen(true)}
                  className="px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded-lg transition flex items-center gap-1.5"
                >
                  <Sliders className="w-3.5 h-3.5 text-slate-500" />
                  Crop & Frame
                </button>
              )}
            </div>

            {/* Quick Shape Toggles */}
            {hasPhoto && (
              <div className="flex items-center gap-1 text-[11px] text-slate-600">
                <span className="font-semibold text-slate-500 mr-1">Shape:</span>
                <button
                  type="button"
                  onClick={() =>
                    handleFieldChange('photo', { ...personal.photo, shape: 'circle' })
                  }
                  className={`p-1 rounded flex items-center gap-1 border ${
                    currentShape === 'circle'
                      ? 'bg-blue-100 border-blue-400 text-blue-800 font-bold'
                      : 'bg-white border-slate-200 hover:bg-slate-100'
                  }`}
                  title="Circle"
                >
                  <Circle className="w-3 h-3" /> Circle
                </button>

                <button
                  type="button"
                  onClick={() =>
                    handleFieldChange('photo', { ...personal.photo, shape: 'rounded' })
                  }
                  className={`p-1 rounded flex items-center gap-1 border ${
                    currentShape === 'rounded'
                      ? 'bg-blue-100 border-blue-400 text-blue-800 font-bold'
                      : 'bg-white border-slate-200 hover:bg-slate-100'
                  }`}
                  title="Rounded"
                >
                  <LayoutGrid className="w-3 h-3" /> Rounded
                </button>

                <button
                  type="button"
                  onClick={() =>
                    handleFieldChange('photo', { ...personal.photo, shape: 'square' })
                  }
                  className={`p-1 rounded flex items-center gap-1 border ${
                    currentShape === 'square'
                      ? 'bg-blue-100 border-blue-400 text-blue-800 font-bold'
                      : 'bg-white border-slate-200 hover:bg-slate-100'
                  }`}
                  title="Square"
                >
                  <Square className="w-3 h-3" /> Square
                </button>

                <button
                  type="button"
                  onClick={() =>
                    handleFieldChange('photo', { ...personal.photo, shape: 'none' })
                  }
                  className={`p-1 rounded flex items-center gap-1 border ${
                    currentShape === 'none'
                      ? 'bg-amber-100 border-amber-400 text-amber-800 font-bold'
                      : 'bg-white border-slate-200 hover:bg-slate-100'
                  }`}
                  title="Hide Photo on CV"
                >
                  <EyeOff className="w-3 h-3" /> Hide
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
        {/* Full Name */}
        <div className="sm:col-span-2">
          <label className="block text-slate-600 font-semibold mb-1">Full Name *</label>
          <input
            type="text"
            value={personal.fullName}
            onChange={(e) => handleFieldChange('fullName', e.target.value)}
            placeholder="e.g. Jane Doe"
            className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none font-medium text-slate-900"
          />
        </div>

        {/* Headline */}
        <div className="sm:col-span-2">
          <label className="block text-slate-600 font-semibold mb-1">Headline / Professional Title</label>
          <input
            type="text"
            value={personal.headline}
            onChange={(e) => handleFieldChange('headline', e.target.value)}
            placeholder="e.g. Senior Full-Stack Engineer"
            className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none font-medium text-slate-900"
          />
        </div>

        {/* Email */}
        <div>
          <label className="block text-slate-600 font-semibold mb-1 flex items-center gap-1">
            <Mail className="w-3 h-3 text-slate-400" /> Email
          </label>
          <input
            type="email"
            value={personal.email || ''}
            onChange={(e) => handleFieldChange('email', e.target.value)}
            placeholder="jane@example.com"
            className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none text-slate-900"
          />
        </div>

        {/* Phone */}
        <div>
          <label className="block text-slate-600 font-semibold mb-1 flex items-center gap-1">
            <Phone className="w-3 h-3 text-slate-400" /> Phone
          </label>
          <input
            type="text"
            value={personal.phone || ''}
            onChange={(e) => handleFieldChange('phone', e.target.value)}
            placeholder="+1 (555) 019-2834"
            className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none text-slate-900"
          />
        </div>

        {/* Location */}
        <div>
          <label className="block text-slate-600 font-semibold mb-1 flex items-center gap-1">
            <MapPin className="w-3 h-3 text-slate-400" /> Location
          </label>
          <input
            type="text"
            value={personal.location || ''}
            onChange={(e) => handleFieldChange('location', e.target.value)}
            placeholder="San Francisco, CA (or Remote)"
            className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none text-slate-900"
          />
        </div>

        {/* Website */}
        <div>
          <label className="block text-slate-600 font-semibold mb-1 flex items-center gap-1">
            <Globe className="w-3 h-3 text-slate-400" /> Portfolio / Website
          </label>
          <input
            type="text"
            value={personal.website || ''}
            onChange={(e) => handleFieldChange('website', e.target.value)}
            placeholder="https://janedoe.dev"
            className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none text-slate-900"
          />
        </div>

        {/* GitHub */}
        <div>
          <label className="block text-slate-600 font-semibold mb-1 flex items-center gap-1">
            <Github className="w-3 h-3 text-slate-400" /> GitHub Profile
          </label>
          <input
            type="text"
            value={personal.github || ''}
            onChange={(e) => handleFieldChange('github', e.target.value)}
            placeholder="github.com/janedoe"
            className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none text-slate-900"
          />
        </div>

        {/* LinkedIn */}
        <div>
          <label className="block text-slate-600 font-semibold mb-1 flex items-center gap-1">
            <Linkedin className="w-3 h-3 text-slate-400" /> LinkedIn Profile
          </label>
          <input
            type="text"
            value={personal.linkedin || ''}
            onChange={(e) => handleFieldChange('linkedin', e.target.value)}
            placeholder="linkedin.com/in/janedoe"
            className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none text-slate-900"
          />
        </div>
      </div>

      <PhotoCropModal
        isOpen={isPhotoModalOpen}
        currentDataUrl={personal.photo?.dataUrl}
        currentShape={personal.photo?.shape}
        onSave={(dataUrl, shape) => {
          handleFieldChange('photo', { dataUrl, shape });
        }}
        onClose={() => setIsPhotoModalOpen(false)}
      />
    </div>
  );
};
