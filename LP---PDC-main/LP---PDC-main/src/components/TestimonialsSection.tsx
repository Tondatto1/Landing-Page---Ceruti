import React from 'react';
import { ArrowRight, MessageSquareQuote } from 'lucide-react';
import { VIDEO_TESTIMONIALS } from '../data/agroData';
import { VideoCarousel } from './VideoCarousel';

interface TestimonialsSectionProps {
  onOpenCtaModal: () => void;
}

export const TestimonialsSection: React.FC<TestimonialsSectionProps> = ({ onOpenCtaModal }) => {
  const fullVideos = VIDEO_TESTIMONIALS.filter((v) => v.type === 'full');
  const shortVideos = VIDEO_TESTIMONIALS.filter((v) => v.type === 'short');

  return (
    <section id="o-que-dizem" className="py-20 lg:py-28 bg-gradient-to-bl from-blue-100/60 via-emerald-50/70 to-white text-slate-900 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-100/80 border border-emerald-300 text-emerald-800 text-xs font-extrabold uppercase tracking-widest">
            <MessageSquareQuote className="w-4 h-4" />
            <span>Casos Reais de Sucesso</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight">
            O QUE DIZEM
          </h2>
        </div>

        {/* Content Area */}
        <div className="mt-12 space-y-12">
          
          {/* Section 1: Full Horizontal Videos (Casos de Sucesso) */}
          <VideoCarousel videos={fullVideos} aspectRatio="landscape" />

          {/* Section 2: Vertical Shorts Videos */}
          <VideoCarousel videos={shortVideos} aspectRatio="portrait" />

        </div>

        {/* Section CTA */}
        <div className="mt-16 text-center space-y-4">
          <p className="text-slate-700 font-medium text-base">
            Quer ver esses mesmos resultados na sua equipe comercial?
          </p>
          <div>
            <button
              onClick={onOpenCtaModal}
              className="inline-flex items-center gap-3 px-8 sm:px-10 py-4 bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-base uppercase tracking-wider rounded-2xl border border-emerald-300/60 ring-2 ring-emerald-500/20 shadow-lg shadow-emerald-600/30 transition-all transform hover:-translate-y-1 active:translate-y-0 cursor-pointer"
            >
              <span>QUERO VENDER MAIS!</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>

      </div>
    </section>
  );
};

