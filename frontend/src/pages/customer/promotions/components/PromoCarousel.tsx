import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Sparkles, Copy, ArrowRight, Check } from 'lucide-react';
import { IBannerSlide } from '../types';
import { toast } from '../../../../context/ToastContext';

interface PromoCarouselProps {
  slides: IBannerSlide[];
  onUseCode: (code: string) => void;
}

export const PromoCarousel: React.FC<PromoCarouselProps> = ({ slides, onUseCode }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (isPaused || slides.length === 0) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [isPaused, slides.length]);

  const handleCopy = (code: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    toast.success(`Đã sao chép mã ưu đãi: ${code}`, 'Sao Chép Thành Công');
    setTimeout(() => setCopiedCode(null), 3000);
  };

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % slides.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);

  if (slides.length === 0) return null;
  const slide = slides[currentSlide];

  return (
    <div 
      className="relative w-full rounded-2xl overflow-hidden shadow-xl bg-slate-900 border border-slate-800 text-white select-none transition-all"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      style={{ minHeight: '340px' }}
    >
      {/* Background Image with Dark & Gradient Overlays */}
      <div 
        className="absolute inset-0 bg-cover bg-center transition-all duration-700 transform scale-105"
        style={{ backgroundImage: `url(${slide.image})` }}
      />
      <div 
        className="absolute inset-0 transition-opacity duration-700"
        style={{ background: slide.gradient }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent" />

      {/* Content Area */}
      <div className="relative z-10 flex flex-col justify-between h-full p-6 md:p-10 max-w-4xl" style={{ minHeight: '340px' }}>
        <div>
          {/* Top Badges */}
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider bg-amber-400 text-slate-950 shadow-md">
              <Sparkles size={13} className="animate-pulse" /> {slide.badge}
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-white/20 backdrop-blur-md text-white border border-white/20">
              {slide.tag}
            </span>
          </div>

          {/* Heading */}
          <h1 className="text-2xl md:text-4xl font-black text-white leading-tight mb-2 drop-shadow-md">
            {slide.title}
          </h1>

          {/* Subtitle */}
          <p className="text-sm md:text-base text-slate-200 font-medium max-w-2xl leading-relaxed drop-shadow mb-4">
            {slide.subtitle}
          </p>
        </div>

        {/* Voucher Action Card */}
        <div className="flex flex-wrap items-center gap-3 pt-2">
          {/* Code box */}
          <div className="inline-flex items-center bg-white/10 backdrop-blur-md rounded-xl p-1.5 pl-3.5 border border-white/25 shadow-lg">
            <span className="text-xs text-slate-300 font-bold uppercase tracking-wider mr-2">Mã:</span>
            <span className="text-base md:text-lg font-black text-amber-300 tracking-wider font-mono mr-3">
              {slide.voucherCode}
            </span>
            <button
              onClick={(e) => handleCopy(slide.voucherCode, e)}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold bg-white text-slate-900 hover:bg-amber-300 transition-colors shadow"
              title="Sao chép mã vào bộ nhớ đệm"
            >
              {copiedCode === slide.voucherCode ? (
                <>
                  <Check size={14} className="text-emerald-600" /> Đã chép
                </>
              ) : (
                <>
                  <Copy size={13} /> Chép mã
                </>
              )}
            </button>
          </div>

          {/* Use Now CTA */}
          <button
            onClick={() => onUseCode(slide.voucherCode)}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-extrabold bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white shadow-lg hover:shadow-orange-500/30 transition-all transform hover:-translate-y-0.5 active:translate-y-0"
          >
            {slide.actionText} <ArrowRight size={16} />
          </button>
        </div>
      </div>

      {/* Navigation Controls */}
      <button
        onClick={prevSlide}
        aria-label="Previous Slide"
        className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-slate-950/60 hover:bg-slate-900 border border-white/20 text-white flex items-center justify-center transition-all backdrop-blur-sm opacity-80 hover:opacity-100 hover:scale-105"
      >
        <ChevronLeft size={20} />
      </button>

      <button
        onClick={nextSlide}
        aria-label="Next Slide"
        className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-slate-950/60 hover:bg-slate-900 border border-white/20 text-white flex items-center justify-center transition-all backdrop-blur-sm opacity-80 hover:opacity-100 hover:scale-105"
      >
        <ChevronRight size={20} />
      </button>

      {/* Pagination Dots */}
      <div className="absolute bottom-4 right-6 z-20 flex items-center gap-2">
        {slides.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentSlide(idx)}
            aria-label={`Slide ${idx + 1}`}
            className={`transition-all rounded-full ${
              currentSlide === idx 
                ? 'w-7 h-2 bg-amber-400' 
                : 'w-2 h-2 bg-white/40 hover:bg-white/70'
            }`}
          />
        ))}
      </div>
    </div>
  );
};

