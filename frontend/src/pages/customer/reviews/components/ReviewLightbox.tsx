import React from 'react';
import { X, ZoomIn } from 'lucide-react';

interface ReviewLightboxProps {
  imageUrl: string | null;
  onClose: () => void;
}

export const ReviewLightbox: React.FC<ReviewLightboxProps> = ({ imageUrl, onClose }) => {
  if (!imageUrl) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md animate-fadeIn"
      onClick={onClose}
    >
      <div 
        className="relative max-w-4xl max-h-[90vh] overflow-hidden rounded-3xl shadow-2xl animate-scaleUp"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-slate-900/80 hover:bg-slate-900 text-white flex items-center justify-center border border-white/20 transition-all shadow-lg"
        >
          <X size={20} />
        </button>

        <img
          src={imageUrl}
          alt="Phóng to ảnh đánh giá"
          className="w-full h-full max-h-[85vh] object-contain rounded-2xl"
        />

        <div className="absolute bottom-4 left-4 bg-slate-900/80 backdrop-blur-md text-white text-xs px-3.5 py-1.5 rounded-xl border border-white/10 flex items-center gap-1.5">
          <ZoomIn size={14} className="text-orange-400" /> Ảnh chụp thực tế từ hành khách TravelEasy
        </div>
      </div>
    </div>
  );
};
