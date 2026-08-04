import React from 'react';
import { motion } from 'motion/react';
import { CircleDollarSign } from 'lucide-react';
import { AGRO_SEGMENTS } from '../data/agroData';

interface TargetSectionProps {
  onOpenCtaModal: () => void;
}

// 1. +ROI: Animated trend line rising continuously with a glowing upward trajectory
const RoiIcon = () => (
  <div className="relative w-6 h-6 flex items-center justify-center">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
      <motion.path
        d="M23 6l-9.5 9.5-5-5L1 18"
        initial={{ pathLength: 0.8 }}
        animate={{
          pathLength: [0.6, 1, 0.6],
          opacity: [0.7, 1, 0.7],
        }}
        transition={{
          duration: 2.2,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      <motion.polyline
        points="17 6 23 6 23 12"
        animate={{
          x: [0, 2.5, 0],
          y: [0, -2.5, 0],
        }}
        transition={{
          duration: 1.8,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
    </svg>
    <motion.span
      className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-emerald-400 rounded-full shadow-sm shadow-emerald-400/50"
      animate={{
        scale: [1, 1.8, 1],
        opacity: [0.3, 1, 0.3]
      }}
      transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
    />
  </div>
);

// 2. +MARGEM: Animated percentage symbol with orbiting/pulsing dots & margin protection halo
const MargemIcon = () => (
  <div className="relative w-6 h-6 flex items-center justify-center">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
      <line x1="19" y1="5" x2="5" y2="19" />
      <motion.circle
        cx="6.5"
        cy="6.5"
        r="2.5"
        animate={{
          scale: [1, 1.35, 1],
          strokeWidth: [2.5, 3.2, 2.5],
        }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.circle
        cx="17.5"
        cy="17.5"
        r="2.5"
        animate={{
          scale: [1.35, 1, 1.35],
          strokeWidth: [3.2, 2.5, 3.2],
        }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      />
    </svg>
    <motion.div
      className="absolute -inset-1 rounded-lg border border-emerald-400/50 pointer-events-none"
      animate={{
        scale: [0.95, 1.2, 0.95],
        opacity: [0.1, 0.6, 0.1],
      }}
      transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
    />
  </div>
);

// 3. +VENDAS: Animated bar chart with dynamic sequential growth of sales volumes
const VendasIcon = () => (
  <div className="relative w-6 h-6 flex items-center justify-center">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
      <motion.line
        x1="18" y1="20" x2="18" y2="10"
        animate={{ y2: [15, 6, 15] }}
        transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut", delay: 0.4 }}
      />
      <motion.line
        x1="12" y1="20" x2="12" y2="4"
        animate={{ y2: [12, 3, 12] }}
        transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut", delay: 0.2 }}
      />
      <motion.line
        x1="6" y1="20" x2="6" y2="14"
        animate={{ y2: [17, 10, 17] }}
        transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
      />
    </svg>
  </div>
);

// 4. +FATURAMENTO: Animated currency coin with gentle rotation & revenue ripple pulse
const FaturamentoIcon = () => (
  <div className="relative w-6 h-6 flex items-center justify-center">
    <motion.div
      animate={{
        rotateY: [0, 180, 360],
      }}
      transition={{
        duration: 4.5,
        repeat: Infinity,
        ease: "easeInOut",
      }}
      className="flex items-center justify-center"
    >
      <CircleDollarSign className="w-5 h-5" />
    </motion.div>
    <motion.div
      className="absolute inset-0 rounded-full bg-emerald-400/40"
      animate={{
        scale: [0.9, 1.45, 0.9],
        opacity: [0.6, 0, 0.6],
      }}
      transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }}
    />
  </div>
);

export const TargetSection: React.FC<TargetSectionProps> = () => {
  return (
    <section id="para-quem-e" className="py-20 lg:py-28 bg-gradient-to-br from-emerald-100/60 via-blue-50/70 to-white text-slate-900 relative overflow-hidden">
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Top Area - Grid with Text on Left, Image on Right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
          
          {/* Left Column: Text Content */}
          <div className="lg:col-span-7 space-y-5 text-center lg:text-left">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight uppercase">
              PARA QUEM É O PROGRAMA?
            </h2>

            <div className="space-y-4 text-slate-700 text-base sm:text-lg leading-relaxed pt-1">
              <p className="text-slate-700 font-medium">
                Para <span className="font-extrabold text-emerald-800 bg-emerald-100/90 px-2.5 py-0.5 rounded-md border border-emerald-300/80 shadow-2xs">EMPRESAS DO AGRONEGÓCIO</span> que pensam grande. Não importa se você atua em grãos, pecuária, insumos ou máquinas: se o seu objetivo é vender <span className="font-extrabold text-emerald-700">MAIS</span>, faturar <span className="font-extrabold text-emerald-700">MAIS</span> e <span className="font-extrabold text-emerald-700">DOMINAR</span> o mercado, este método foi desenhado para você.
              </p>
            </div>
          </div>

          {/* Right Column: Framed Image (Circular / Moldura Redonda with Gradient Border) */}
          <div className="lg:col-span-5 w-full flex justify-center lg:justify-end">
            <div className="relative mx-auto lg:ml-auto w-[300px] sm:w-[360px] lg:w-[390px] aspect-square group">
              {/* Ambient Glow */}
              <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500/30 via-blue-500/30 to-emerald-500/30 rounded-full blur-lg opacity-75 group-hover:opacity-100 transition duration-500"></div>
              
              {/* Circular Thin Frame with Blue-Green Gradient */}
              <div className="relative w-full h-full p-[2px] bg-gradient-to-r from-emerald-500 via-blue-500 to-emerald-500 rounded-full shadow-2xl shadow-emerald-950/15 overflow-hidden">
                <div className="relative w-full h-full overflow-hidden rounded-full bg-slate-100">
                  <img
                    src="/ceruti_matsuda.png"
                    alt="Treinamento Comercial - Método DNA Cerutti"
                    className="w-full h-full object-cover object-[center_32%] rounded-full transform group-hover:scale-[1.03] transition-transform duration-500"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/10 via-transparent to-transparent pointer-events-none rounded-full"></div>
                </div>
              </div>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};

