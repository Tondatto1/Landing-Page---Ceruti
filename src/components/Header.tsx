import React from 'react';

interface HeaderProps {
  onOpenCtaModal?: () => void;
}

export const Header: React.FC<HeaderProps> = () => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 shadow-xl border-b border-amber-400/40">
      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0%); }
          100% { transform: translateX(-100%); }
        }
        .animate-marquee-slow {
          animation: marquee 30s linear infinite;
        }
        .marquee-wrapper:hover .animate-marquee-slow {
          animation-play-state: paused;
        }
      `}</style>
      
      <div className="marquee-wrapper w-full overflow-hidden whitespace-nowrap py-3.5 bg-gradient-to-r from-[#042f2e] via-[#0b1728] to-[#064e3b] text-white flex items-center font-black tracking-wider text-xs sm:text-sm md:text-base uppercase shadow-inner select-none">
        <div className="animate-marquee-slow flex items-center shrink-0 space-x-12 pr-12">
          <span>
            ESTA É SUA ÚNICA OPORTUNIDADE DE RECEBER <span className="text-amber-300 underline decoration-amber-400 decoration-2 underline-offset-2">35% DE DESCONTO NO NOSSO PROGRAMA DE CAPACITAÇÃO</span>. VOCÊ NUNCA MAIS VERÁ ESTA PÁGINA.
          </span>
          <span className="text-amber-400/80">•</span>
          <span>
            ESTA É SUA ÚNICA OPORTUNIDADE DE RECEBER <span className="text-amber-300 underline decoration-amber-400 decoration-2 underline-offset-2">35% DE DESCONTO NO NOSSO PROGRAMA DE CAPACITAÇÃO</span>. VOCÊ NUNCA MAIS VERÁ ESTA PÁGINA.
          </span>
          <span className="text-amber-400/80">•</span>
          <span>
            ESTA É SUA ÚNICA OPORTUNIDADE DE RECEBER <span className="text-amber-300 underline decoration-amber-400 decoration-2 underline-offset-2">35% DE DESCONTO NO NOSSO PROGRAMA DE CAPACITAÇÃO</span>. VOCÊ NUNCA MAIS VERÁ ESTA PÁGINA.
          </span>
          <span className="text-amber-400/80">•</span>
        </div>

        <div className="animate-marquee-slow flex items-center shrink-0 space-x-12 pr-12" aria-hidden="true">
          <span>
            ESTA É SUA ÚNICA OPORTUNIDADE DE RECEBER <span className="text-amber-300 underline decoration-amber-400 decoration-2 underline-offset-2">35% DE DESCONTO NO NOSSO PROGRAMA DE CAPACITAÇÃO</span>. VOCÊ NUNCA MAIS VERÁ ESTA PÁGINA.
          </span>
          <span className="text-amber-400/80">•</span>
          <span>
            ESTA É SUA ÚNICA OPORTUNIDADE DE RECEBER <span className="text-amber-300 underline decoration-amber-400 decoration-2 underline-offset-2">35% DE DESCONTO NO NOSSO PROGRAMA DE CAPACITAÇÃO</span>. VOCÊ NUNCA MAIS VERÁ ESTA PÁGINA.
          </span>
          <span className="text-amber-400/80">•</span>
          <span>
            ESTA É SUA ÚNICA OPORTUNIDADE DE RECEBER <span className="text-amber-300 underline decoration-amber-400 decoration-2 underline-offset-2">35% DE DESCONTO NO NOSSO PROGRAMA DE CAPACITAÇÃO</span>. VOCÊ NUNCA MAIS VERÁ ESTA PÁGINA.
          </span>
          <span className="text-amber-400/80">•</span>
        </div>
      </div>
    </header>
  );
};


