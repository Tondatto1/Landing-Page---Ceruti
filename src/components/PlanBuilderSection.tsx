import React from 'react';
import { 
  GraduationCap, 
  Bot, 
  Video, 
  UserCheck, 
  Presentation,
  MessageCircle,
  Clock,
  ArrowRight
} from 'lucide-react';
import ScrollStack, { ScrollStackItem } from './ScrollStack';

interface PlanBuilderSectionProps {
  onOpenCtaModal: (planName?: string) => void;
}

export const PlanBuilderSection: React.FC<PlanBuilderSectionProps> = ({ onOpenCtaModal }) => {
  // 6 Deliverables of the Program
  const deliverables = [
    {
      id: 'presencial',
      icon: Presentation,
      title: 'Treinamento presencial - 32h de treinamento',
      description: 'Imersão prática presencial para aplicação direta de metodologias e vivência em campo.',
      highlight: '32h de Imersão',
    },
    {
      id: 'ia',
      icon: Bot,
      title: 'Acesso ao nosso agente de IA Ceruti - 24/7',
      description: 'Inteligência Artificial especialista que capacita e tira dúvidas técnicas e comerciais direto no WhatsApp.',
      highlight: 'IA disponível 24/7',
    },
    {
      id: 'mentoria',
      icon: UserCheck,
      title: 'Mentoria individual online',
      description: 'Sessões individuais para direcionamento estratégico, métricas e acompanhamento próximo de cada liderado.',
      highlight: 'Individual & Personalizado',
    },
    {
      id: 'grupo',
      icon: Video,
      title: 'Treinamento em grupo online',
      description: 'Aulas ao vivo focadas em técnicas comerciais, alinhamento de equipe e simulações do agronegócio.',
      highlight: 'Ao Vivo & Interativo',
    },
    {
      id: 'ead',
      icon: GraduationCap,
      title: 'Acesso a todos os nossos treinamentos - EAD',
      description: 'Acesso completo e ilimitado à nossa plataforma de conteúdos gravados, materiais e certificação.',
      highlight: 'Acesso Ilimitado EAD',
    },
    {
      id: 'whatsapp',
      icon: MessageCircle,
      title: 'Grupo de WhatsApp exclusivo',
      description: 'Canal de comunicação direta, suporte contínuo, troca de experiências e mentoria no dia a dia.',
      highlight: 'Suporte Exclusivo',
    },
  ];

  return (
    <section id="planos" className="py-20 lg:py-28 bg-gradient-to-b from-blue-100/60 via-emerald-50/60 to-white text-slate-900 relative overflow-hidden">
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight uppercase">
            ENTREGÁVEIS DO PROGRAMA
          </h2>
          
          {/* Highlighted Duration (Clean Typographic Highlight) */}
          <div className="mt-4 flex flex-wrap items-center justify-center gap-x-2.5 gap-y-1.5 text-slate-700 text-sm sm:text-base">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600" />
              <span className="text-slate-600 font-bold uppercase tracking-wider text-xs sm:text-sm">Duração:</span>
              <span className="text-emerald-900 font-black text-base sm:text-lg">4, 6 ou 8 meses</span>
            </div>
            <span className="text-slate-300 hidden sm:inline">•</span>
            <span className="text-slate-500 text-xs sm:text-sm font-normal">
              (De acordo com a complexidade e necessidade da empresa)
            </span>
          </div>
        </div>

        {/* Scroll Stack for Deliverables */}
        <div className="mt-8 max-w-3xl mx-auto">
          <ScrollStack 
            useWindowScroll={true} 
            itemDistance={24} 
            itemStackDistance={20}
            baseScale={0.92}
            itemScale={0.02}
            stackPosition="22%"
          >
            {deliverables.map((item) => {
              const IconComponent = item.icon;
              return (
                <ScrollStackItem key={item.id}>
                  <div className="p-6 sm:p-8 bg-white border border-slate-200/90 rounded-3xl shadow-xl hover:border-emerald-500/80 transition-all duration-300">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-3">
                      <div className="flex items-center gap-3.5">
                        <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-emerald-100/80 text-emerald-800 flex items-center justify-center shrink-0 shadow-xs">
                          <IconComponent className="w-5 h-5 sm:w-6 sm:h-6" />
                        </div>
                        <h3 className="text-lg sm:text-xl font-bold text-slate-900 leading-snug">
                          {item.title}
                        </h3>
                      </div>
                      <span className="self-start sm:self-center text-[11px] sm:text-xs font-black uppercase tracking-wider text-emerald-800 bg-emerald-100/90 border border-emerald-200/90 px-3 py-1.5 rounded-full shrink-0">
                        {item.highlight}
                      </span>
                    </div>
                    <p className="text-sm sm:text-base text-slate-600 font-normal leading-relaxed pl-0 sm:pl-15">
                      {item.description}
                    </p>
                  </div>
                </ScrollStackItem>
              );
            })}
          </ScrollStack>
        </div>

        {/* CTA Button */}
        <div className="mt-16 text-center">
          <button
            onClick={() => onOpenCtaModal('Estrutura do Programa')}
            className="inline-flex items-center gap-3 px-8 sm:px-10 py-4 bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-sm sm:text-base uppercase tracking-wider rounded-2xl border border-emerald-300/60 ring-2 ring-emerald-500/20 shadow-lg shadow-emerald-600/30 transition-all transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
          >
            <span>FALAR COM CONSULTOR</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>

      </div>
    </section>
  );
};



