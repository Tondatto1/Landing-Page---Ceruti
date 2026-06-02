import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageCircle, X, Send, CheckCheck, Landmark, Sparkles, HelpCircle } from 'lucide-react';

interface Message {
  id: string;
  sender: 'bot' | 'user';
  text: string;
  time: string;
  options?: { text: string; action: string }[];
  cta?: { text: string; link: string; icon?: string };
}

export const WhatsAppWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showBalloon, setShowBalloon] = useState(true);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Default target number
  const WHATSAPP_NUMBER = '5567981246558';

  const formatTime = () => {
    const now = new Date();
    return now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  };

  const renderMessageText = (text: string) => {
    if (!text) return '';
    const parts = text.split(/(\*[^*]+\*)/g);
    return parts.map((part, index) => {
      if (part.startsWith('*') && part.endsWith('*')) {
        return (
          <strong key={index} className="font-extrabold text-neutral-950">
            {part.slice(1, -1)}
          </strong>
        );
      }
      return part;
    });
  };

  // Setup initial message sequence
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      triggerInitialSequence();
    }
  }, [isOpen]);

  const triggerInitialSequence = async () => {
    setIsTyping(true);
    await new Promise((resolve) => setTimeout(resolve, 800));
    setIsTyping(false);

    const msg1: Message = {
      id: '1',
      sender: 'bot',
      text: 'Olá! Sou o assistente do Ceruti. 🚀',
      time: formatTime()
    };
    setMessages([msg1]);

    setIsTyping(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsTyping(false);

    const msg2: Message = {
      id: '2',
      sender: 'bot',
      text: 'Como posso te ajudar hoje? Selecione uma das opções abaixo para começarmos:',
      time: formatTime(),
      options: [
        { text: '1️⃣ Desejo testar por 3 dias gratuitamente', action: 'test_3_days' },
        { text: '2️⃣ Desejo falar com o suporte/atendimento', action: 'support' },
        { text: '3️⃣ Quero saber mais sobre o Agente Ceruti', action: 'more_about_ceruti' }
      ]
    };
    setMessages((prev) => [...prev, msg2]);
  };

  // Scroll to bottom when messages update
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleOptionClick = async (action: string, optionText: string) => {
    // Add user message
    const userMsg: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: optionText,
      time: formatTime()
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsTyping(true);

    // Filter interactive options from previous bot messages to avoid double clicks
    setMessages((prev) =>
      prev.map((m) => (m.options ? { ...m, options: undefined } : m))
    );

    await new Promise((resolve) => setTimeout(resolve, 1200));
    setIsTyping(false);

    if (action === 'test_3_days') {
      const botMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'bot',
        text: 'Excelente escolha! O nosso Agente está pronto para treinar sua equipe diretamente pelo WhatsApp. Clique no botão abaixo para iniciar seu teste de 3 dias agora mesmo!',
        time: formatTime(),
        cta: {
          text: 'Iniciar Teste Grátis no WhatsApp',
          link: `https://wa.me/${WHATSAPP_NUMBER}?text=Olá. Venho através da página e desejo fazer o teste de 3 dias.`,
        },
        options: [
          { text: '🔄 Voltar para o menu principal', action: 'reset' }
        ]
      };
      setMessages((prev) => [...prev, botMsg]);
    } else if (action === 'support') {
      const botMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'bot',
        text: 'Com certeza! Nosso suporte técnico está a postos para te ajudar com qualquer dúvida sobre nosso treinamento. Clique no botão abaixo para falar conosco:',
        time: formatTime(),
        cta: {
          text: 'Falar com Suporte no WhatsApp',
          link: `https://wa.me/${WHATSAPP_NUMBER}?text=Olá. Venho através da página e gostaria de tirar uma dúvida.`,
        },
        options: [
          { text: '🔄 Voltar para o menu principal', action: 'reset' }
        ]
      };
      setMessages((prev) => [...prev, botMsg]);
    } else if (action === 'more_about_ceruti') {
      const botMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'bot',
        text: 'Perfeito! Selecione um dos tópicos abaixo para conhecer melhor o Agente Ceruti através das informações oficiais de cada seção:',
        time: formatTime(),
        options: [
          { text: '1️⃣ Benefícios de assinar o agente Ceruti', action: 'about_benefits' },
          { text: '2️⃣ Quem deveria assinar o agente Ceruti', action: 'about_who' },
          { text: '3️⃣ Como funciona o agente Ceruti', action: 'about_how_it_works' },
          { text: '4️⃣ Resultados de assinar o Agente Ceruti', action: 'about_results' },
          { text: '5️⃣ Principais dúvidas sobre o agente Ceruti', action: 'about_faq' },
          { text: '🔄 Voltar para o menu principal', action: 'reset' }
        ]
      };
      setMessages((prev) => [...prev, botMsg]);
    } else if (action === 'about_benefits') {
      const botMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'bot',
        text: '📊 *Benefícios reais de assinar o agente Ceruti:*\n\n' +
              '• *Aumento significativo nas vendas*\n' +
              '• *Redução drástica no tempo de fechamento* de negociações\n' +
              '• *Aumento na recuperação de vendas* que seriam perdidas\n' +
              '• *Redução drástica do tempo* para novos vendedores darem resultado\n' +
              '• *Aumento considerável no valor médio* das vendas\n' +
              '• *Redução drástica na rotatividade* do time comercial',
        time: formatTime(),
        options: [
          { text: '⬅️ Voltar ao menu Ceruti', action: 'more_about_ceruti' },
          { text: '🚀 Iniciar Teste Grátis de 3 Dias', action: 'test_3_days' },
          { text: '🔄 Voltar para o menu principal', action: 'reset' }
        ]
      };
      setMessages((prev) => [...prev, botMsg]);
    } else if (action === 'about_who') {
      const botMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'bot',
        text: '👥 *QUEM DEVE TER O CERUTI COMO TREINADOR:*\n\n' +
              'O agente foi idealizado e configurado sob medida para o aprendizado e desenvolvimento dos seguintes perfis:\n' +
              '• Vendedores\n' +
              '• Supervisores\n' +
              '• Representantes Comerciais\n' +
              '• Promotores de Vendas\n' +
              '• Gerentes Comerciais\n' +
              '• Assistentes Técnicos Comerciais (ATCs)\n\n' +
              'Capacita do operacional à gestão de forma orgânica e em minutos.',
        time: formatTime(),
        options: [
          { text: '⬅️ Voltar ao menu Ceruti', action: 'more_about_ceruti' },
          { text: '🚀 Iniciar Teste Grátis de 3 Dias', action: 'test_3_days' },
          { text: '🔄 Voltar para o menu principal', action: 'reset' }
        ]
      };
      setMessages((prev) => [...prev, botMsg]);
    } else if (action === 'about_how_it_works') {
      const botMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'bot',
        text: '⚙️ *Como funciona o processo de treinamento com o Ceruti:*\n\n' +
              'Todo o loop de aprendizado ocorre de forma extremamente simples diretamente em nosso canal oficial do WhatsApp:\n\n' +
              '1️⃣ *Envio do Problema:* O profissional de vendas da sua equipe envia a objeção ou o caso prático comercial de campo que precisa resolver.\n\n' +
              '2️⃣ *Diagnóstico:* O Agente Ceruti interage fazendo as perguntas chave ideais para mapear as particularidades do cenário.\n\n' +
              '3️⃣ *Plano de solução:* O Agente entrega um plano estratégico de argumentação rico, focado em alta conversão e quebra daquela objeção específica.\n\n' +
              '4️⃣ *Pós-Plano:* O treinador se mantém à disposição ajudando com criação de scripts de texto, refinamentos adicionais ou simulações adicionais.\n\n' +
              'Tudo isso ocorre em segundos e 100% no WhatsApp, sem tirar o vendedor do campo de batalha.',
        time: formatTime(),
        options: [
          { text: '⬅️ Voltar ao menu Ceruti', action: 'more_about_ceruti' },
          { text: '🚀 Iniciar Teste Grátis de 3 Dias', action: 'test_3_days' },
          { text: '🔄 Voltar para o menu principal', action: 'reset' }
        ]
      };
      setMessages((prev) => [...prev, botMsg]);
    } else if (action === 'about_results') {
      const botMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'bot',
        text: '📈 *Resultados Práticos ao treinar seu time com o Ceruti:*\n\n' +
              '• ⏱️ *Aprendizado 24/7:* Disponibilidade total com suporte instantâneo para tomadas de decisão comercial a qualquer hora do dia ou da noite.\n\n' +
              '• 🤝 *Treinamento individual personalizado:* Cada membro recebe feedback e orientações 1:1 formatados exclusivamente para o seu caso real.\n\n' +
              '• 🎯 *Padronização da operação:* Alinhamento de discursos comerciais para garantir 100% de consistência nas ações em campo.\n\n' +
              '• ⚡ *Eficiência Máxima:* Redução de até 95% do tempo costumeiramente gasto no treinamento e integração de novos contratados.\n\n' +
              '• 🛡️ *Segurança de Margem:* Corte de até 80% nos erros de argumentação comercial de preços ou de descontos.\n\n' +
              '• 🏆 *Sucesso Prático (ROI):* Time inteiramente mais veloz, preparado, confiante nas gôndolas e vendendo de forma consistente.',
        time: formatTime(),
        options: [
          { text: '⬅️ Voltar ao menu Ceruti', action: 'more_about_ceruti' },
          { text: '🚀 Iniciar Teste Grátis de 3 Dias', action: 'test_3_days' },
          { text: '🔄 Voltar para o menu principal', action: 'reset' }
        ]
      };
      setMessages((prev) => [...prev, botMsg]);
    } else if (action === 'about_faq') {
      const botMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'bot',
        text: '❓ *Ainda tem dúvidas? Principais respostas sobre o Ceruti:*\n\n' +
              '• *Onde a equipe usa o Ceruti?* Tudo pelo WhatsApp! Integrado a um número nosso exclusivo. Sem instalação de aplicativos ou conhecimento técnico.\n\n' +
              '• *Preciso enviar manuais da empresa?* Não é necessário. O treinador foi pré-treinado com profunda inteligência focada exclusivamente no segmento do agronegócio nacional.\n\n' +
              '• *Funciona para qualquer modelo de negócio?* Sim! Suporta B2B (distribuição, indústrias) e B2C (venda ao produtor), operando nas quebras de objeções.\n\n' +
              '• *Substituirá meus vendedores?* Não, ele atua como assistente ou parceiro complementar focado em acelerar respostas e converter negócios.\n\n' +
              '• *Como se diferencia de modelos comuns?* O Ceruti carrega engenharia e metodologias validadas e proprietárias de negociação do agro, sem termos técnicos difíceis.\n\n' +
              '• *Garantia e Fidelidade:* Garantia incondicional de devolução de 14 dias para teste sem riscos. Semestral tem desconto com prazo fechado; mensal dá total flexibilidade para pausar ou cancelar sem fidelidades ou multas.',
        time: formatTime(),
        options: [
          { text: '⬅️ Voltar ao menu Ceruti', action: 'more_about_ceruti' },
          { text: '🚀 Iniciar Teste Grátis de 3 Dias', action: 'test_3_days' },
          { text: '🔄 Voltar para o menu principal', action: 'reset' }
        ]
      };
      setMessages((prev) => [...prev, botMsg]);
    } else if (action === 'reset') {
      const botMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'bot',
        text: 'Como posso te ajudar hoje? Selecione uma das opções abaixo para começarmos:',
        time: formatTime(),
        options: [
          { text: '1️⃣ Desejo testar por 3 dias gratuitamente', action: 'test_3_days' },
          { text: '2️⃣ Desejo falar com o suporte/atendimento', action: 'support' },
          { text: '3️⃣ Quero saber mais sobre o Agente Ceruti', action: 'more_about_ceruti' }
        ]
      };
      setMessages((prev) => [...prev, botMsg]);
    }
  };

  const toggleWidget = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      setShowBalloon(false); // Hide balloon when chatbot is expanded
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 font-sans pointer-events-none">
      {/* Container for absolute overlays */}
      <div className="relative w-full h-full flex flex-col items-end pointer-events-auto">

        {/* 1. Pulse Promo Balloon */}
        <AnimatePresence>
          {showBalloon && !isOpen && (
            <motion.div
              initial={{ opacity: 0, y: 15, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="absolute bottom-20 sm:bottom-24 right-0 mr-1 flex flex-col items-end w-72 sm:w-80 max-w-[325px] drop-shadow-[0_12px_35px_rgba(0,0,0,0.35)] select-none z-50 cursor-pointer"
              onClick={toggleWidget}
            >
              {/* Balloon Bubble Body - More expanded padding */}
              <div className="relative w-full group bg-gradient-to-br from-neutral-900 via-neutral-950 to-neutral-900 border border-neutral-800 text-white rounded-2xl py-5 px-6 pr-12 text-sm font-medium tracking-tight shadow-[0_6px_35px_rgba(0,168,62,0.25)] transition-all duration-300 hover:border-[#10b981]/60">
                {/* Clean, high-contrast message with force-white class and direct inline style safety */}
                <div 
                  className="flex items-center gap-2 text-[16px] sm:text-[18px] font-extrabold force-white leading-tight select-none"
                  style={{ color: '#FFFFFF' }}
                >
                  <Sparkles className="w-5 h-5 text-[#10b981] animate-pulse shrink-0" />
                  <span className="force-white" style={{ color: '#FFFFFF' }}>Teste por 3 dias</span>
                </div>
                
                <div 
                  className="flex items-center gap-1.5 text-[12px] sm:text-[13px] font-bold force-white mt-2 select-none transition-colors duration-200 group-hover:text-[#10b981]"
                  style={{ color: '#FFFFFF' }}
                >
                  <span className="force-white opacity-90 group-hover:opacity-100" style={{ color: '#FFFFFF' }}>Clique aqui</span>
                  <span className="text-[11px]">⚡</span>
                </div>

                {/* Dismiss X button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowBalloon(false);
                  }}
                  className="absolute top-3 right-3 text-neutral-400 hover:text-white transition-colors p-1.5 rounded-full hover:bg-neutral-800/60"
                  aria-label="Fechar balão"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Chat Bubble Arrow Pin */}
              <div className="w-4 h-4 bg-neutral-950 rotate-45 -mt-2.5 mr-6 border-r border-b border-neutral-800" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* 2. Expanded Chatbot Window */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: 40, scale: 0.92 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 30, scale: 0.95 }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="absolute bottom-20 sm:bottom-24 right-0 w-[350px] sm:w-[380px] max-w-[calc(100vw-32px)] h-[520px] max-h-[80vh] flex flex-col bg-[#efeae2] rounded-3xl border border-neutral-200 shadow-[0_15px_60px_-15px_rgba(0,0,0,0.3)] overflow-hidden z-[999]"
            >
              {/* Custom Header (WhatsApp teal styled) */}
              <div className="bg-[#008069] text-white py-3.5 px-4 flex items-center justify-between shadow-sm relative shrink-0">
                <div className="flex items-center gap-3">
                  {/* Custom avatar badge representing Ceruti Assistant */}
                  <div className="relative w-10 h-10 rounded-full bg-white/10 flex items-center justify-center border border-white/20 shadow-inner">
                    <span className="font-extrabold text-white text-base font-sans tracking-tight">C</span>
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-400 rounded-full border-2 border-[#008069] animate-pulse" />
                  </div>
                  <div className="text-left">
                    <h4 className="font-bold text-sm tracking-tight leading-tight">Assistente Virtual</h4>
                    <p className="text-[11px] text-emerald-100 flex items-center gap-1 font-medium font-sans">
                      <span>Online</span>
                      <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-300 animate-ping" />
                    </p>
                  </div>
                </div>

                {/* Close Chat Window */}
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-white/80 hover:text-white p-1.5 hover:bg-white/10 rounded-full transition-colors"
                  aria-label="Minimizar conversa"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Chat Messages Log Area */}
              <div 
                className="flex-1 overflow-y-auto p-4 space-y-4"
                style={{
                  backgroundImage: 'url("https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png")',
                  backgroundBlendMode: 'overlay',
                  backgroundColor: '#efeae2',
                  opacity: 0.97
                }}
              >
                {/* Auto greeting instructions header */}
                <div className="flex justify-center mb-2">
                  <div className="bg-amber-100/90 border border-amber-200 text-amber-900 text-[11px] px-3 py-1 rounded-lg text-center font-medium max-w-[85%] shadow-sm">
                    🔒 Canal Oficial • Resposta automatizada imediata
                  </div>
                </div>

                {/* Messages Mapping */}
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex flex-col max-w-[82%] ${
                      msg.sender === 'user' ? 'ml-auto items-end' : 'mr-auto items-start'
                    }`}
                  >
                    {/* Message Bubble Container */}
                    <div
                      className={`relative px-3.5 py-2.5 rounded-2xl shadow-sm text-sm ${
                        msg.sender === 'user'
                          ? 'bg-[#d9fdd3] text-neutral-800 rounded-tr-none'
                          : 'bg-white text-neutral-800 rounded-tl-none'
                      }`}
                    >
                      {/* Message Content */}
                      <p className="whitespace-pre-wrap leading-relaxed break-words font-medium text-[13.5px] font-sans">
                        {renderMessageText(msg.text)}
                      </p>

                      {/* CTA Actions Embedded inside bubble */}
                      {msg.cta && (
                        <div className="mt-3.5">
                          <a
                            href={msg.cta.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-center gap-2 w-full py-3 px-4 bg-[#25D366] text-white font-extrabold uppercase text-[11px] tracking-wider rounded-xl hover:bg-[#20ba5c] hover:scale-[1.02] shadow-[0_4px_12px_rgba(37,211,102,0.3)] transition-all duration-300"
                          >
                            <MessageCircle className="w-4 h-4 fill-white" />
                            {msg.cta.text}
                          </a>
                        </div>
                      )}

                      {/* Time and Double checkmark indicator */}
                      <span className="block text-[10px] text-neutral-400 text-right mt-1.5 select-none font-sans font-normal leading-none">
                        {msg.time}
                        {msg.sender === 'user' && (
                          <CheckCheck className="inline-block w-3.5 h-3.5 ml-1 text-sky-500" />
                        )}
                      </span>
                    </div>

                    {/* Options Actions below message */}
                    {msg.options && (
                      <div className="mt-2.5 w-full flex flex-col gap-2">
                        {msg.options.map((opt, i) => {
                          const isTestOption = opt.action === 'test_3_days';
                          return (
                            <button
                              key={i}
                              onClick={() => handleOptionClick(opt.action, opt.text)}
                              className={`text-left w-full transition-all duration-300 active:scale-98 rounded-xl ${
                                isTestOption
                                  ? "bg-emerald-50/90 text-[#006e4a] font-extrabold text-xs sm:text-[13px] py-3.5 px-4 border-2 border-[#00a83e] shadow-[0_0_15px_rgba(0,168,62,0.25)] animate-[pulse_3.5s_infinite] cursor-pointer"
                                  : "bg-white hover:bg-teal-50 hover:text-[#008069] text-gray-700 font-semibold text-xs sm:text-[13px] py-2.5 px-3.5 border border-neutral-200 shadow-sm cursor-pointer"
                              }`}
                            >
                              {opt.text}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                ))}

                {/* Simulated Typing Indicator */}
                {isTyping && (
                  <div className="flex items-center gap-1.5 max-w-[40%] bg-white px-4 py-3 rounded-2xl rounded-tl-none shadow-sm mr-auto">
                    <span className="w-1.5 h-1.5 bg-neutral-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-1.5 h-1.5 bg-neutral-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-1.5 h-1.5 bg-neutral-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                )}

                {/* Scroll Target */}
                <div ref={chatEndRef} />
              </div>

              {/* Chat window footer - dummy typing area */}
              <div className="bg-[#f0f2f5] px-3.5 py-3 flex items-center gap-2.5 border-t border-neutral-200 shrink-0">
                <div className="flex-1 bg-white rounded-full py-2 px-4 shadow-inner text-neutral-300 font-sans text-xs sm:text-sm select-none">
                  Escolha uma opção acima...
                </div>
                <div className="flex items-center justify-center bg-[#008069] text-white p-2.5 h-10 w-10 rounded-full shadow-sm">
                  <Send className="w-4 h-4 ml-0.5" />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 3. Main Floating WhatsApp Button Switcher */}
        <button
          onClick={toggleWidget}
          id="whatsapp_floating_button"
          aria-label="Fale conosco no WhatsApp"
          className={`flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-full text-white shadow-[0_8px_30px_rgba(37,211,102,0.4)] transition-all duration-300 group border-2 border-white/90 cursor-pointer ${
            isOpen ? 'bg-neutral-800 hover:bg-neutral-900 shadow-neutral-700/30 rotate-90' : 'bg-[#25D366] hover:bg-[#20ba5c] hover:scale-110'
          }`}
        >
          {/* Pulsing glow highlights */}
          {!isOpen && (
            <>
              <div className="absolute inset-0 rounded-full bg-[#25D366]/30 animate-pulse pointer-events-none -z-10 group-hover:scale-115 transition-transform duration-300" />
              <div className="absolute inset-0 rounded-full bg-[#25D366]/20 animate-ping pointer-events-none -z-10" />
            </>
          )}

          {isOpen ? (
            <X className="w-7 h-7 stroke-[2.5]" />
          ) : (
            <svg 
              className="w-8 h-8 sm:w-9 sm:h-9 fill-current stroke-none drop-shadow-sm select-none" 
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M17.472 14.382c-.022-.015-.029-.02-.054-.051l-.105-.125c-.27-.324-1.79-1.082-1.79-1.082s-.225-.138-.415.111l-.475.63s-.167.228-.432.115c-.266-.113-.99-.44-1.85-1.205-.666-.595-1.116-1.332-1.246-1.56-.13-.227-.014-.35.101-.462l.307-.36s.1-.15.004-.298c-.097-.15-1.015-2.45-1.015-2.45s-.125-.335-.41-.318c-.287.017-.822.422-1.137.77-.314.347-.565.807-.533 1.393.07 1.314.614 2.502 1.488 3.518.874 1.015 1.956 1.83 3.12 2.38 1.127.531 2.155.805 2.873.744.757-.064 1.348-.38 1.66-.75.312-.371.492-.852.492-.852s.06-.182-.016-.27-.268-.14-.268-.14zm-5.466 7.424h-.01c-1.875 0-3.71-.493-5.32-1.425l-.382-.22-3.955 1.038 1.056-3.855-.24-.383A9.761 9.761 0 011.82 12c0-5.411 4.417-9.82 9.851-9.82a9.774 9.774 0 016.968 2.878c1.859 1.861 2.883 4.34 2.88 6.945C21.516 17.411 17.1 21.82 11.666 21.82zM12 0C5.373 0 0 5.372 0 12c0 2.11.547 4.16 1.59 5.973L0 24l6.216-1.63C7.94 23.36 9.94 24 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0z"/>
            </svg>
          )}

          {/* Text tooltip for hover (Desktops) */}
          {!isOpen && (
            <span className="absolute right-18 sm:right-20 scale-0 bg-neutral-950 text-white font-sans text-xs font-semibold px-3 py-1.5 rounded-lg shadow-md transition-all duration-200 group-hover:scale-100 whitespace-nowrap shadow-black/20">
              Demonstração Ceruti ⚡
            </span>
          )}
        </button>

      </div>
    </div>
  );
};
