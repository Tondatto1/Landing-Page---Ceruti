import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { FAQ_ITEMS } from '../data/agroData';

interface FaqSectionProps {
  onOpenCtaModal: () => void;
}

export const FaqSection: React.FC<FaqSectionProps> = ({ onOpenCtaModal }) => {
  const [openId, setOpenId] = useState<string>('1');

  const toggleAccordion = (id: string) => {
    setOpenId(openId === id ? '' : id);
  };

  return (
    <section id="faq" className="py-20 lg:py-28 bg-gradient-to-br from-emerald-100/50 via-white to-blue-100/50 text-slate-900 relative overflow-hidden border-t border-slate-200/80">
      
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight">
            PERGUNTAS FREQUENTES (FAQ)
          </h2>
        </div>

        {/* Accordion List */}
        <div className="space-y-4">
          {FAQ_ITEMS.map((faq) => {
            const isOpen = openId === faq.id;
            return (
              <div
                key={faq.id}
                className={`border rounded-2xl transition-all duration-200 overflow-hidden shadow-sm ${
                  isOpen ? 'bg-white border-2 border-emerald-500 shadow-md' : 'bg-white border-slate-200 hover:border-slate-300'
                }`}
              >
                <button
                  onClick={() => toggleAccordion(faq.id)}
                  className="w-full p-5 sm:p-6 text-left flex items-center justify-between gap-4 cursor-pointer"
                >
                  <span className="font-bold text-base sm:text-lg text-slate-900">
                    {faq.question}
                  </span>
                  <div className={`p-2 rounded-full transition-transform duration-300 shrink-0 ${
                    isOpen ? 'bg-emerald-100 text-emerald-800 rotate-180' : 'bg-slate-100 text-slate-600'
                  }`}>
                    <ChevronDown className="w-5 h-5" />
                  </div>
                </button>

                {isOpen && (
                  <div className="px-5 sm:px-6 pb-6 pt-0 text-slate-700 text-sm sm:text-base leading-relaxed border-t border-slate-100 mt-1">
                    <p className="pt-4">{faq.answer}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
