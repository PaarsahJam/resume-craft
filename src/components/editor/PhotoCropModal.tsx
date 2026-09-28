import React, { useEffect, useState } from 'react';
import { PhotoShape } from '../../types';
import { Camera, Check, X, Circle, Square, LayoutGrid, Image as ImageIcon } from 'lucide-react';

interface PhotoCropModalProps {
  isOpen: boolean;
  currentDataUrl?: string;
  currentShape?: PhotoShape;
  onSave: (dataUrl: string, shape: PhotoShape) => void;
  onClose: () => void;
}

export const PhotoCropModal: React.FC<PhotoCropModalProps> = ({
  isOpen,
  currentDataUrl,
  currentShape = 'circle',
  onSave,
  onClose,
}) => {
  const [dataUrl, setDataUrl] = useState<string>(currentDataUrl || '');
  const [shape, setShape] = useState<PhotoShape>(currentShape);
  const [zoom, setZoom] = useState<number>(1);

  // This component stays mounted while closed, so `useState` captured the props
  // once at mount — usually before the user had uploaded a photo. Sync on open
  // so the cropper shows the current image and "Apply" cannot wipe it.
  useEffect(() => {
    if (isOpen) {
      setDataUrl(currentDataUrl || '');
      setShape(currentShape);
      setZoom(1);
    }
  }, [isOpen, currentDataUrl, currentShape]);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (evt) => {
        if (evt.target?.result) {
          setDataUrl(evt.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const shapes: { id: PhotoShape; label: string; icon: React.ReactNode }[] = [
    { id: 'circle', label: 'Circle', icon: <Circle className="w-4 h-4" /> },
    { id: 'rounded', label: 'Rounded', icon: <LayoutGrid className="w-4 h-4" /> },
    { id: 'square', label: 'Square', icon: <Square className="w-4 h-4" /> },
    { id: 'none', label: 'Hidden', icon: <X className="w-4 h-4" /> },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Camera className="w-5 h-5 text-blue-600" />
            Profile Photo Settings
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mt-5 space-y-5">
          {/* Upload or Preview */}
          <div className="flex flex-col items-center justify-center">
            {dataUrl ? (
              <div className="relative group">
                <img
                  src={dataUrl}
                  alt="Profile Preview"
                  style={{ transform: `scale(${zoom})` }}
                  className={`w-32 h-32 object-cover border-4 border-slate-200 transition-all ${
                    shape === 'circle'
                      ? 'rounded-full'
                      : shape === 'rounded'
                      ? 'rounded-2xl'
                      : 'rounded-none'
                  }`}
                />
              </div>
            ) : (
              <div className="w-32 h-32 rounded-full bg-slate-100 border-2 border-dashed border-slate-300 flex flex-col items-center justify-center text-slate-400">
                <ImageIcon className="w-8 h-8 mb-1" />
                <span className="text-xs">No image</span>
              </div>
            )}

            <label className="mt-3 inline-flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-semibold cursor-pointer hover:bg-slate-800 transition">
              <Camera className="w-3.5 h-3.5" />
              Upload Image
              <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
            </label>
          </div>

          {/* Shape selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-2">Display Shape</label>
            <div className="grid grid-cols-4 gap-2">
              {shapes.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setShape(s.id)}
                  className={`flex flex-col items-center gap-1.5 p-2.5 rounded-xl border text-xs font-medium transition ${
                    shape === s.id
                      ? 'bg-blue-50 border-blue-600 text-blue-700 font-bold'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {s.icon}
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* Zoom slider */}
          {dataUrl && (
            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                <span>Zoom / Scale</span>
                <span>{Math.round(zoom * 100)}%</span>
              </div>
              <input
                type="range"
                min="0.8"
                max="1.5"
                step="0.05"
                value={zoom}
                onChange={(e) => setZoom(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
            </div>
          )}
        </div>

        {/* Modal Actions */}
        <div className="mt-6 pt-4 border-t border-slate-100 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={!dataUrl}
            onClick={() => {
              if (!dataUrl) return;
              onSave(dataUrl, shape);
              onClose();
            }}
            className="px-5 py-2 text-xs font-semibold bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition flex items-center gap-1.5 shadow-sm shadow-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Check className="w-3.5 h-3.5" />
            Apply Photo
          </button>
        </div>
      </div>
    </div>
  );
};
