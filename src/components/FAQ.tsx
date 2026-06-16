import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown, MessageCircleQuestion } from 'lucide-react';

const faqs = [
  {
    question: "Como e onde a minha equipe vai usar o Ceruti?",
    answer: "É tudo feito pelo WhatsApp! O nosso agente treinador está integrado a um número exclusivo nosso. Assim que você assinar, basta nos informar quais números da sua equipe estão autorizados a acessá-lo. Sua equipe vai mandar mensagem para esse nosso número e conversar com o agente como se fosse uma pessoa normal no WhatsApp."
  },
  {
    question: "Preciso baixar algum aplicativo ou ter conhecimento técnico?",
    answer: "Não! Não existe dificuldade técnica nenhuma. Como o treinador funciona diretamente dentro do seu WhatsApp convencional, a experiência é tão simples quanto trocar mensagens com um contato do dia a dia."
  },
  {
    question: "Preciso enviar manuais ou informações da minha empresa para ele aprender?",
    answer: "Não é necessário. Você não precisa fornecer informações sobre sua empresa ou cadastrar todos os detalhes do seu produto. O treinador já vem com uma inteligência avançada e pré-treinada especificamente para o segmento do agronegócio, entendendo com clareza todo o seu contexto."
  },
  {
    question: "A Ceruti funciona para qualquer tipo de negócio agrícola?",
    answer: "Sim, o modelo da Ceruti é flexível e apoia tanto o modelo de vendas B2B (distribuidores, indústria) quanto B2C (venda direta ao produtor). O foco está na quebra de objeção e alta conversão que geram resultado independentemente da fase da safra."
  },
  {
    question: "A ferramenta vai substituir meus vendedores?",
    answer: "De forma alguma. O agente veio para potencializar o trabalho dos consultores e RTVs, não para substituí-los. Ele atua como um assistente de vendas e treinador superinteligente no WhatsApp para tornar o time mais focado, rápido nas respostas e eficiente."
  },
  {
    question: "Qual a diferença de assinar uma IA comum (como o ChatGPT)?",
    answer: "Enquanto outras IAs são de uso muito geral e precisam de comandos (“prompts”) complexos elaborados toda vez, o agente Ceruti já possui engenharia baseada exclusivamente em vendas do agro. Ele carrega metodologias de negócio e negociação validadas na prática."
  },
  {
    question: "Em quanto tempo consigo ver os resultados?",
    answer: "Muitos assinantes percebem melhorias no processo comercial já nos primeiros dias de uso da equipe, especialmente para destravar negociações paradas e argumentar contra os preços dos concorrentes."
  },
  {
    question: "Como posso adicionar mais pessoas do meu time?",
    answer: "Dependendo da sua estrutura, permitimos que você contrate volumes de acessos diferentes para abraçar a sua necessidade. Você nos reporta quais números devem ter autorização de uso na licença contratada."
  },
  {
    question: "E se não funcionar no dia a dia da minha equipe?",
    answer: "Contamos com uma metodologia extremamente orgânica e comprovada, pois não tira o consultor do WhatsApp. Além disso, você conta com a garantia de devolução de 7 dias, retirando o seu risco caso não perceba valor."
  },
  {
    question: "A assinatura tem fidelidade?",
    answer: "Oferecemos planos mensais e semestrais. O plano semestral tem sua duração de contrato estipulada em 6 meses com excelentes benefícios no preço. No plano mensal, você tem a liberdade de cancelar ou pausar a renovação quando desejar, sem multas."
  }
];

export const FAQ = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleOpen = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="bg-white py-20 sm:py-24 relative overflow-hidden" id="faq">
      <div className="absolute inset-0 opacity-[0.015] pointer-events-none bg-[radial-gradient(#0070f3_1px,transparent_1px)] [background-size:24px_24px] z-0"></div>
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        <div className="flex items-center justify-center gap-4 mb-3">
          <div className="h-px bg-[#0070f3] w-12 sm:w-16 opacity-70"></div>
          <div className="flex items-center gap-2">
           <div className="w-7 h-7 rounded-full bg-[#f0f7ff] border border-[#d3e7ff] flex items-center justify-center text-[#0070f3] shadow-sm">
             <MessageCircleQuestion className="w-4 h-4" />
           </div>
           <span className="text-xs sm:text-sm font-sans font-extrabold uppercase tracking-widest text-[#0070f3] text-center">
             Perguntas Frequentes
           </span>
          </div>
          <div className="h-px bg-[#0070f3] w-12 sm:w-16 opacity-70"></div>
        </div>

        <div className="text-center mb-12 sm:mb-16">
          <h2 className="notranslate text-3xl sm:text-4xl lg:text-[42px] font-sans font-black text-[#0b1a30] tracking-tighter leading-tight uppercase" translate="no">
            Ainda tem dúvidas?
          </h2>
          <p className="mt-4 text-[13px] sm:text-[15px] font-medium text-neutral-500 max-w-2xl mx-auto">
            Respondemos abaixo às principais dúvidas sobre o funcionamento e assinatura do nosso modelo.
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;
            
            return (
              <div 
                key={index}
                className={`border-2 rounded-2xl overflow-hidden transition-colors duration-300 ${
                  isOpen ? 'border-[#0070f3] bg-[#fcfdff] shadow-sm shadow-[#0070f3]/5' : 'border-neutral-100 bg-white hover:border-[#0070f3]/30'
                }`}
              >
                <button
                  onClick={() => toggleOpen(index)}
                  className="w-full flex items-center justify-between p-5 sm:p-6 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0070f3] focus-visible:ring-offset-2"
                >
                  <span className={`font-bold font-sans text-sm sm:text-base pr-4 transition-colors ${isOpen ? 'text-[#0b1a30]' : 'text-neutral-700'}`}>
                    {faq.question}
                  </span>
                  <div className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-colors duration-300 ${isOpen ? 'bg-[#0070f3] text-white' : 'bg-[#f0f3f6] text-neutral-400'}`}>
                    <ChevronDown 
                      className={`w-5 h-5 transition-transform duration-300 ${isOpen ? 'rotate-180' : 'rotate-0'}`} 
                    />
                  </div>
                </button>
                
                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: 'easeInOut' }}
                    >
                      <div className="px-5 sm:px-6 pb-5 sm:pb-6 pt-0">
                        <div className="w-full h-px bg-neutral-100 mb-4" />
                        <p className="text-sm text-neutral-600 font-medium leading-relaxed">
                          {faq.answer}
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>

      </div>

      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#0070f3]/30 via-[#00a83e]/25 via-transparent to-transparent z-10" />
      <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-gradient-to-r from-transparent via-[#0070f3]/10 via-[#00a83e]/10 to-transparent z-10 blur-[2px] opacity-85" />
    </section>
  );
};
