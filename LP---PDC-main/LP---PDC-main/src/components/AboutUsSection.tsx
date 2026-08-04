import React from 'react';
import { ArrowRight, History } from 'lucide-react';

interface AboutUsSectionProps {
  onOpenCtaModal: () => void;
}

export const AboutUsSection: React.FC<AboutUsSectionProps> = ({ onOpenCtaModal }) => {
  return (
    <section id="quem-somos" className="py-20 lg:py-28 bg-gradient-to-tr from-emerald-100/60 via-blue-50/70 to-white text-slate-900 relative overflow-hidden">
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-100/80 border border-emerald-300 text-emerald-800 text-xs font-extrabold uppercase tracking-widest">
            <History className="w-4 h-4" />
            <span>Pioneirismo & Tradição no Agro</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight">
            QUEM SOMOS?
          </h2>

          <p className="text-xl sm:text-2xl lg:text-3xl font-black text-emerald-700 uppercase tracking-tight max-w-4xl mx-auto">
            A MAIOR ESCOLA DE CAPACITAÇÃO COMERCIAL PARA AGRONEGÓCIOS DO BRASIL!
          </p>
        </div>

        {/* Highlights & Metrics Cards */}
        <div className="mt-12 max-w-4xl mx-auto">
          <div className="bg-white/95 border border-slate-200/90 rounded-3xl p-6 sm:p-10 shadow-md">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-emerald-50/80 border border-emerald-200/80 rounded-2xl p-4 text-center space-y-1">
                <span className="block text-2xl sm:text-3xl font-black text-emerald-700">+19 Anos</span>
                <span className="text-xs sm:text-sm font-bold text-slate-700">de história</span>
              </div>
              <div className="bg-emerald-50/80 border border-emerald-200/80 rounded-2xl p-4 text-center space-y-1">
                <span className="block text-2xl sm:text-3xl font-black text-emerald-700">+20 Mil</span>
                <span className="text-xs sm:text-sm font-bold text-slate-700">alunos formados</span>
              </div>
              <div className="bg-emerald-50/80 border border-emerald-200/80 rounded-2xl p-4 text-center space-y-1">
                <span className="block text-2xl sm:text-3xl font-black text-emerald-700">+150</span>
                <span className="text-xs sm:text-sm font-bold text-slate-700">empresas atendidas</span>
              </div>
              <div className="bg-emerald-50/80 border border-emerald-200/80 rounded-2xl p-4 text-center space-y-1">
                <span className="block text-2xl sm:text-3xl font-black text-emerald-700">+1 Bi</span>
                <span className="text-xs sm:text-sm font-bold text-slate-700">de receita incremental gerada</span>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-slate-100 text-center">
              <span className="inline-block text-lg sm:text-xl font-extrabold text-emerald-800 bg-emerald-100/80 px-6 py-2.5 rounded-full border border-emerald-300/80 shadow-sm">
                🌱 Treinadores e mentores que vivem o campo!
              </span>
            </div>
          </div>
        </div>

        {/* Section CTA */}
        <div className="mt-16 text-center space-y-4">
          <p className="text-slate-700 font-medium text-base">
            Leve a metodologia líder de vendas do agronegócio para dentro da sua empresa.
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
