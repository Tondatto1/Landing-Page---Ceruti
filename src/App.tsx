/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { 
  MessageCircle, 
  TrendingUp, 
  TrendingDown,
  Award, 
  Sparkles, 
  AlertTriangle, 
  Users, 
  Coins, 
  Clock, 
  Menu, 
  FileSpreadsheet, 
  UserX, 
  AlertOctagon, 
  ChevronDown,
  RotateCcw,
  User,
  ClipboardList,
  MapPin,
  ShoppingBag,
  Wrench,
  CalendarDays,
  Rocket,
  ShieldCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Link } from 'react-router-dom';
import { Aurora } from './components/Aurora';
import { MagicBento } from './components/MagicBento';
import ScrollStack, { ScrollStackItem } from './components/ScrollStack';

import { VideoEmbed } from './components/VideoEmbed';
import { FAQ } from './components/FAQ';
import AnimatedList from './components/AnimatedList';

const CONVERSATION_THREADS: Record<string, Array<{ sender: 'user' | 'ceruti', text: string, time: string }>> = {
  'preco-saca': [
    { sender: 'user', text: 'Ceruti, cliente falou que meu produto é 30 reais mais caro por saca. Como quebro isso?', time: '10:15' },
    { sender: 'ceruti', text: 'Opa! Antes do plano, me responde: qual o perfil desse cliente e qual problema ele tem que sua semente resolve?', time: '10:16' },
    { sender: 'user', text: 'Fazendeiro de soja, 800 ha. Perde produtividade com pragas. Minha semente resolve, mas ele só vê preço.', time: '10:16' },
    { sender: 'ceruti', text: 'Perfeito. O que você falou quando ele disse que tava caro?', time: '10:17' },
    { sender: 'user', text: "Falei que era mais resistente e dava mais produtividade. Ele disse 'depois eu vejo' e não voltou.", time: '10:18' },
    { sender: 'ceruti', text: 'Pronto. O erro não foi o preço — foi não traduzir os 15% a mais de produtividade em dinheiro no bolso dele. Vou montar um plano pra você voltar com argumento que ele não ignora. Topa?', time: '10:19' }
  ],
  'fidelidade-cooperativa': [
    { sender: 'user', text: 'Ceruti, o diretor da Fronteira disse que compra há 15 anos da cooperativa local e o agrônomo é amigo de pescaria dele. Como entro lá?', time: '14:20' },
    { sender: 'ceruti', text: 'Grande desafio! Me responde: a cooperativa atua forte em biológicos de última geração com eles ou focam só no químico de balcão?', time: '14:21' },
    { sender: 'user', text: 'Químico de balcão. Eles quase não usam biológicos de raiz, mas têm medo de mexer no que dá certo.', time: '14:22' },
    { sender: 'ceruti', text: 'Perfeito. Esse é o ponto fraco. Deixe o químico com eles. O que você falou sobre blindagem e diversificação de fornecimento de biológicos?', time: '14:23' },
    { sender: 'user', text: 'Falei que nosso biológico era melhor e tinha prêmio de qualidade, mas ele disse que prefere a segurança da parceria antiga.', time: '14:24' },
    { sender: 'ceruti', text: 'Entendi. O erro foi tentar concorrer com a cooperativa. Proponha apenas uma área piloto de 5% da fazenda exclusivamente para prevenção microbiológica. Convide o próprio agrônomo da cooperativa para auditar e assinar o resultado. Topa tentar?', time: '14:26' }
  ],
  'prazo-barter': [
    { sender: 'user', text: 'Seu Jamil aceitou, mas quer barter de 100% pra pagar na colheita. Meu financeiro só me libera 30% barter e o resto boleto. Como resolvo?', time: '16:02' },
    { sender: 'ceruti', text: 'Hedge é seguro! Me conta, o boleto das parcelas restante oferecido pelo seu financeiro tem algum desconto de antecipação ou taxa reduzida?', time: '16:03' },
    { sender: 'user', text: 'Tem sim, o financeiro dá 6% de desconto se fechar no boleto com garantias agrícolas padrão.', time: '16:04' },
    { sender: 'ceruti', text: 'Excelente! Faça as contas com ele de forma simples: use os 30% em barter físico. Para os 70%, sugira uma CPR física registrada na colheita aplicando os 6% de desconto.', time: '16:06' },
    { sender: 'user', text: 'Verdade, assim ele preserva a paridade das sacas sem risco de câmbio e ainda economiza nominalmente.', time: '16:07' },
    { sender: 'ceruti', text: 'Exato! Hege garantido, evita as altas taxas embutidas das cooperativas e ainda embolsa 6% de desconto real. Mostre esse ganho no bolso dele. Fechamos essa estrutura?', time: '16:09' }
  ]
};

export default function App() {
  // Mobile menu toggle
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Active WhatsApp simulator objection ID
  const [activeObjectionId, setActiveObjectionId] = useState<string>('preco-saca');
  
  // Real-time progressive rendering and auto-scroll state
  const [visibleMessagesCount, setVisibleMessagesCount] = useState<number>(2);
  const [isTypingNext, setIsTypingNext] = useState<boolean>(false);
  const chatContainerRef = React.useRef<HTMLDivElement>(null);

  // Sync visible messages when selected objection changes
  useEffect(() => {
    setVisibleMessagesCount(2);
    setIsTypingNext(false);
  }, [activeObjectionId]);

  // Handle smooth programmatic scroll whenever messages count or typing status changes
  useEffect(() => {
    const timer = setTimeout(() => {
      if (chatContainerRef.current) {
        chatContainerRef.current.scrollTo({
          top: chatContainerRef.current.scrollHeight,
          behavior: 'smooth'
        });
      }
    }, 80);
    return () => clearTimeout(timer);
  }, [visibleMessagesCount, isTypingNext]);

  // Advance conversation safely with progressive replies
  const advanceConversation = () => {
    const thread = CONVERSATION_THREADS[activeObjectionId] || [];
    if (visibleMessagesCount < thread.length && !isTypingNext) {
      const nextMsg = thread[visibleMessagesCount];
      if (nextMsg.sender === 'ceruti') {
        setIsTypingNext(true);
        setTimeout(() => {
          setVisibleMessagesCount(prev => prev + 1);
          setIsTypingNext(false);
        }, 1200); // 1.2s typing simulation for peak realism
      } else {
        setVisibleMessagesCount(prev => prev + 1);
      }
    }
  };

  const restartConversation = () => {
    setVisibleMessagesCount(2);
    setIsTypingNext(false);
  };

  return (
    <div className="bg-agro-deep text-gray-100 min-h-screen font-sans selection:bg-agro-green selection:text-agro-deep theme-natural-tones w-full overflow-x-clip relative" id="top_container">
      
      {/* Background ambient light effects */}
      <div className="absolute top-0 left-1/4 w-96 h-96 pointer-events-none animate-pulse-glow bg-[radial-gradient(circle_at_center,rgba(0,168,62,0.1)_0%,transparent_70%)]" />
      <div className="absolute top-1/2 right-1/4 w-96 h-96 pointer-events-none bg-[radial-gradient(circle_at_center,rgba(5,150,105,0.05)_0%,transparent_70%)]" />
      <div className="absolute bottom-1/4 left-1/3 w-80 h-80 pointer-events-none bg-[radial-gradient(circle_at_center,rgba(34,197,94,0.05)_0%,transparent_70%)]" />

      {/* HEADER / NAVIGATION BAR */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-white/85 border-b border-neutral-200/50" id="nav_header">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center">
            <span className="font-sans font-extrabold text-3xl tracking-tight text-neutral-900">
              Ceruti
            </span>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8 text-sm font-semibold text-neutral-600">
            <a href="#quem-treinar" className="hover:text-black transition-colors">Para quem é</a>
            <a href="#como-funciona" className="hover:text-black transition-colors">Como funciona</a>
            <a href="#resultados" className="hover:text-black transition-colors">Resultados</a>
            <a href="#beneficios" className="hover:text-black transition-colors">Benefícios</a>
          </nav>

          <div className="hidden md:flex items-center">
            <a 
              href="#planos" 
              className="border-[1.5px] border-[#00a83e] text-[#00a83e] hover:bg-[#00a83e]/5 px-5 py-2 rounded-lg font-bold text-xs tracking-wider uppercase transition-colors"
            >
              Quero ter acesso
            </a>
          </div>

          {/* Mobile menu button */}
          <button 
            type="button" 
            className="md:hidden text-neutral-650 hover:text-black p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>

        {/* Mobile menu panel */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden border-t border-neutral-100 bg-white/95 backdrop-blur-md px-4 py-6 space-y-4 shadow-lg"
            >
              <a 
                href="#quem-treinar" 
                onClick={() => setMobileMenuOpen(false)}
                className="block text-neutral-700 hover:text-[#00a83e] text-base py-1 font-medium"
              >
                Para quem é
              </a>
              <a 
                href="#como-funciona" 
                onClick={() => setMobileMenuOpen(false)}
                className="block text-neutral-700 hover:text-[#00a83e] text-base py-1 font-medium"
              >
                Como funciona
              </a>
              <a 
                href="#resultados" 
                onClick={() => setMobileMenuOpen(false)}
                className="block text-neutral-700 hover:text-[#00a83e] text-base py-1 font-medium"
              >
                Resultados
              </a>
              <a 
                href="#beneficios" 
                onClick={() => setMobileMenuOpen(false)}
                className="block text-neutral-700 hover:text-[#00a83e] text-base py-1 font-medium"
              >
                Benefícios
              </a>
              <div className="pt-4 border-t border-neutral-100">
                <a 
                  href="#planos"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block w-full text-center border-[1.5px] border-[#00a83e] text-[#00a83e] py-2.5 rounded-lg font-bold text-xs tracking-wider uppercase"
                >
                  Quero ter acesso
                </a>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* HERO SECTION / VALUATION HOOK */}
      <section className="relative pt-8 pb-14 md:pt-16 md:pb-24 overflow-hidden bg-[#FAF9F6]" id="hero_section">
        {/* Interactive Aurora background - positioned precisely at the superior edge, with a very slow, elegant flow and low opacity */}
        <div className="absolute inset-0 pointer-events-none z-0 opacity-40">
          <Aurora
            colorStart="#a2d9b1"   // Glowing light-green-mint
            colorMiddle="#4A5D44"  // Perfect matching brand natural-tone green
            colorEnd="#eefaf2"     // Subtle highlight mint
            speed={0.35}           // Super slow, majestic flow
            amplitude={95}         // Subtle wave curvature
            layerCount={5}
            opacity={0.45}         // Extremely gentle visual blend
            followMouse={true}
            verticalAnchor={0.03}  // Anchored precisely at the upper margin of the fold
            className="custom-aurora"
          />
        </div>



        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            
            {/* Left Content Column */}
            <div className="lg:col-span-6 flex flex-col items-start gap-y-3.5 sm:gap-y-4 lg:gap-y-5 text-left">
              {/* Solid green indicator bar matching the screenshot */}
              <div className="w-14 h-1.5 bg-[#00a83e] rounded-full" />

              <div className="relative inline-flex items-center gap-2.5 bg-gradient-to-r from-[#00a83e] to-[#00c853] text-white font-sans font-black text-sm sm:text-base tracking-[0.12em] uppercase px-6 py-2.5 rounded-full shadow-[0_10px_30px_rgba(0,168,62,0.35)] border border-white/20 select-none transform hover:scale-[1.03] transition-all duration-300">
                {/* Dynamic mini glowing core */}
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-white"></span>
                </span>
                <span>É O FIM:</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-[62px] font-sans font-black text-neutral-900 leading-[1.14] sm:leading-[1.12] lg:leading-[1.1] tracking-tight sm:tracking-tighter lg:tracking-tighter uppercase pl-[1px]">
                Do treinamento comercial <br className="hidden sm:inline" />
                tradicional no Agro.
              </h1>

              <p className="text-[#3A4338]/90 text-lg md:text-xl font-medium leading-relaxed max-w-lg">
                Um agente de IA que atua como um treinador comercial sênior, integrado diretamente ao seu WhatsApp.
              </p>

              {/* Action Button CTA */}
              <div className="pt-0.5">
                <a 
                  href="#planos" 
                  className="inline-flex items-center gap-3 bg-[#00a83e] hover:bg-[#009035] text-white px-8 py-4.5 rounded-xl font-extrabold text-sm tracking-widest uppercase transition-all shadow-md shadow-[#00a83e]/20 hover:scale-[1.01] active:scale-[0.99]"
                >
                  <MessageCircle className="w-5 h-5 text-current" />
                  Quero ter acesso
                </a>
              </div>

              {/* Highlight Pillars (Clock, Bullseye, Increase Arrow) */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4.5 pt-5 sm:pt-6 border-t border-neutral-200 text-left max-w-2xl mb-[2px] mr-0">
                {/* Badge 1 */}
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 shrink-0 rounded-full bg-[#e8f5e9] border border-[#c8e6c9]/30 shadow-sm flex items-center justify-center">
                    <Clock className="w-5 h-5 text-[#00a83e]" />
                  </div>
                  <h4 className="font-sans font-extrabold text-neutral-900 text-sm leading-tight">24h com você</h4>
                </div>

                {/* Badge 2 */}
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 shrink-0 rounded-full bg-[#e3f2fd] border border-[#bbdefb]/30 shadow-sm flex items-center justify-center">
                    <svg className="w-5 h-5 text-[#0070f3]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <circle cx="12" cy="12" r="10" />
                      <circle cx="12" cy="12" r="6" />
                      <circle cx="12" cy="12" r="2" />
                    </svg>
                  </div>
                  <h4 className="font-sans font-extrabold text-neutral-900 text-sm leading-tight">Respostas práticas</h4>
                </div>

                {/* Badge 3 */}
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 shrink-0 rounded-full bg-[#e8f5e9] border border-[#c8e6c9]/30 shadow-sm flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-[#00a83e]" />
                  </div>
                  <h4 className="font-sans font-extrabold text-neutral-900 text-sm leading-tight">Mais resultados</h4>
                </div>
              </div>

            </div>

            {/* Right Column: Live Premium WhatsApp Simulator (Designed inside iOS Phone case) */}
            <div className="lg:col-span-6 flex flex-col justify-center items-center relative">
              
              {/* Floating Container to contain the cellphone and its floor shadow */}
              <div className="relative flex flex-col items-center w-full">
                
                {/* iPhone-Realistic Floating Frame */}
                <motion.div 
                  animate={{ y: [0, -12, 0] }}
                  transition={{ 
                    duration: 4.2, 
                    repeat: Infinity, 
                    ease: "easeInOut" 
                  }}
                  style={{ willChange: 'transform' }}
                  className="relative mx-auto w-full max-w-[280px] min-[360px]:max-w-[320px] min-[400px]:max-w-[340px] sm:max-w-[370px] bg-neutral-900 rounded-[56px] p-3 shadow-2xl border-[5px] border-neutral-800/90 ring-1 ring-white/10 z-10"
                >
                  {/* Physical buttons deco */}
                  <div className="absolute left-[-5px] top-[110px] w-[5px] h-[40px] bg-neutral-700 rounded-l shadow-sm" />
                  <div className="absolute left-[-5px] top-[165px] w-[5px] h-[55px] bg-neutral-700 rounded-l shadow-sm" />
                  <div className="absolute left-[-5px] top-[230px] w-[5px] h-[55px] bg-neutral-700 rounded-l shadow-sm" />
                  <div className="absolute right-[-5px] top-[150px] w-[5px] h-[75px] bg-neutral-700 rounded-r shadow-sm" />

                  {/* Upper Notch / Dynamic Island */}
                  <div className="absolute left-1/2 -translate-x-1/2 top-5 w-28 h-6 bg-black rounded-full flex items-center justify-between px-3.5 z-30 shadow-inner ring-1 ring-neutral-800/80">
                    <div className="w-[7px] h-[7px] bg-[#0c0d1c] rounded-full ring-[1px] ring-neutral-800/40" />
                    <div className="w-2.5 h-1.5 bg-[#09091a] rounded-full ring-[1px] ring-neutral-800/40" />
                  </div>

                  {/* Screen Content Wrapper */}
                  <div className="relative w-full overflow-hidden bg-[#FAF9F6] rounded-[46px] flex flex-col h-[650px] ring-1 ring-black/5">
                    
                    {/* Status Bar */}
                    <div className="bg-[#FAF9F6] h-10 px-6 pt-3.5 flex justify-between items-center text-neutral-800 text-xs font-bold leading-none select-none z-20 shrink-0">
                      <span>11:30</span>
                      <div className="flex items-center space-x-1.5 pt-0.5 pointer-events-none">
                        {/* Signal Strength bars */}
                        <svg className="w-4 h-4 fill-current text-neutral-800" viewBox="0 0 24 24">
                          <path d="M2 22h3v-3H2v3zm4 0h3v-6H6v6zm4 0h3v-10h-3v10zm4 0h3v-15h-3v15zm4 0h3V2h-3v20z" />
                        </svg>
                        {/* Wireless waves */}
                        <svg className="w-4 h-4 stroke-current text-neutral-800 fill-none stroke-[2.5]" viewBox="0 0 24 24">
                          <path d="M5 12.55a11 11 0 0 1 14.08 0" />
                          <path d="M1.42 9a16 16 0 0 1 21.16 0" />
                          <path d="M8.53 16.1a6 6 0 0 1 6.95 0" />
                        </svg>
                        {/* Battery outline */}
                        <div className="w-5.5 h-2.5 border-[1.5px] border-neutral-800 rounded-sm p-[1px] flex items-center">
                          <div className="bg-[#00a83e] h-full w-[80%] rounded-[1px]" />
                        </div>
                      </div>
                    </div>

                    {/* Custom Header */}
                    <div className="bg-white px-4 py-3 flex items-center justify-between border-b border-neutral-100 z-10 shrink-0 shadow-sm shadow-neutral-100/40">
                      <div className="flex items-center space-x-3">
                        <div className="relative select-none">
                          <div className="w-10 h-10 rounded-full bg-[#00a83e] flex items-center justify-center text-white font-sans font-black text-lg shadow-sm border border-[#00a83e]/10">
                            C
                          </div>
                          <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white rounded-full animate-pulse"></span>
                        </div>
                        <div className="text-left select-none">
                          <h3 className="font-extrabold text-sm text-neutral-900 leading-tight">
                            Treinador Ceruti
                          </h3>
                          <p className="text-[11px] text-green-600 font-bold leading-none mt-0.5">online</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3.5 text-neutral-400 select-none">
                        <svg className="w-5 h-5 cursor-pointer hover:text-neutral-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 9.24v9.68z" />
                        </svg>
                        <svg className="w-5 h-5 cursor-pointer hover:text-neutral-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                          <circle cx="12" cy="12" r="1" />
                          <circle cx="12" cy="5" r="1" />
                          <circle cx="12" cy="19" r="1" />
                        </svg>
                      </div>
                    </div>

                    {/* Chat Message Stream Pane - STRICTLY FIXED OVERFLOW HIDDEN TO PREVENT MOBILE TOUCH HIJACKING */}
                    <div 
                      ref={chatContainerRef}
                      className="flex-1 overflow-hidden p-4 space-y-3.5 bg-[#FAF9F6] relative border-b border-neutral-150 pointer-events-none select-none"
                      style={{ 
                        backgroundImage: "url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png')",
                        backgroundRepeat: 'repeat',
                        backgroundSize: '150px',
                        backgroundBlendMode: 'overlay',
                        backgroundColor: '#f1ede5'
                      }}
                    >
                      {/* Progressive message rendering up to visibleMessagesCount */}
                      <AnimatePresence mode="popLayout">
                        {CONVERSATION_THREADS[activeObjectionId]?.slice(0, visibleMessagesCount).map((msg, index) => {
                          const isUser = msg.sender === 'user';
                          return (
                            <motion.div 
                              key={activeObjectionId + '_' + index}
                              initial={{ opacity: 0, scale: 0.94, y: 12 }}
                              animate={{ opacity: 1, scale: 1, y: 0 }}
                              transition={{ duration: 0.32 }}
                              className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
                            >
                              <div 
                                className={`text-[12.5px] p-3 rounded-2xl max-w-[85%] shadow-[0_1px_2px_rgba(0,0,0,0.06)] relative border text-left ${
                                  isUser 
                                    ? 'bg-[#e2f9cb] border-[#e2f9cb] text-neutral-800 rounded-tr-none' 
                                    : 'bg-white border-neutral-100 text-neutral-800 rounded-tl-none'
                                }`}
                              >
                                <p className="leading-relaxed font-sans font-medium">{msg.text}</p>
                                <div className="text-[9px] text-neutral-400 text-right mt-1.5 flex items-center justify-end gap-0.5 font-mono">
                                  <span>{msg.time}</span>
                                  {isUser && (
                                    <svg className="w-3.5 h-3.5 text-[#53bdeb]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                      <polyline points="20 6 9 17 4 12" />
                                      <polyline points="13 6 9 10" />
                                      <line x1="20" y1="12" x2="16" y2="16" />
                                    </svg>
                                  )}
                                </div>
                              </div>
                            </motion.div>
                          );
                        })}

                        {/* Real-time typing bubble simulation for the AI coach */}
                        {isTypingNext && (
                          <motion.div 
                            key="typing-indicator"
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="flex justify-start"
                          >
                            <div className="bg-white border border-neutral-100 text-neutral-800 rounded-tl-none text-[12.5px] px-4 py-3 rounded-2xl shadow-[0_1px_2px_rgba(0,0,0,0.06)] flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 bg-[#00a83e] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                              <span className="w-1.5 h-1.5 bg-[#00a83e] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                              <span className="w-1.5 h-1.5 bg-[#00a83e] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* Highly intuitive, beautiful floating scroll/next pill button (pointer-events-auto overrides container locking) */}
                    <div className="absolute bottom-16 inset-x-0 flex justify-center z-20 pointer-events-auto select-none px-4">
                      {visibleMessagesCount < (CONVERSATION_THREADS[activeObjectionId]?.length || 0) ? (
                        <motion.button
                          onClick={advanceConversation}
                          disabled={isTypingNext}
                          animate={isTypingNext ? { scale: 0.98 } : {
                            scale: [1, 1.03, 1],
                          }}
                          transition={isTypingNext ? { duration: 0.2 } : {
                            duration: 2.2,
                            repeat: Infinity,
                            ease: "easeInOut"
                          }}
                          className={`relative overflow-visible inline-flex items-center gap-2 px-4 py-2 sm:px-6 sm:py-3 rounded-full text-[11px] sm:text-xs font-sans font-black tracking-widest uppercase border transition-all duration-300 ${
                            isTypingNext
                              ? 'bg-[#009035] border-[#00a83e] text-white force-white cursor-not-allowed shadow-none'
                              : 'bg-[#00a83e] hover:bg-[#00c54a] border-[#00c54a] text-white force-white hover:scale-[1.05] active:scale-95 cursor-pointer shadow-[0_4px_16px_rgba(34,197,94,0.3)]'
                          }`}
                        >
                          {/* Highly eye-catching concentric pulsing halos */}
                          {!isTypingNext && (
                            <>
                              <motion.div
                                className="absolute inset-0 rounded-full border border-[#00c54a]/30 pointer-events-none z-0"
                                animate={{
                                  scale: [1, 1.15, 1],
                                  opacity: [0.5, 0, 0.5]
                                }}
                                transition={{
                                  duration: 2.2,
                                  repeat: Infinity,
                                  ease: "easeInOut"
                                }}
                              />
                              <motion.div
                                className="absolute inset-0 rounded-full bg-[#00a83e]/10 pointer-events-none z-0"
                                animate={{
                                  scale: [1, 1.25, 1],
                                  opacity: [0.25, 0, 0.25]
                                }}
                                transition={{
                                  duration: 2.2,
                                  delay: 0.4,
                                  repeat: Infinity,
                                  ease: "easeInOut"
                                }}
                              />
                            </>
                          )}
                          <span className="relative z-10 text-white force-white font-sans font-black tracking-wider drop-shadow-sm">{isTypingNext ? 'Ceruti pensando...' : 'Avançar Resposta'}</span>
                          <ChevronDown className="relative z-10 w-3.5 h-3.5 sm:w-4 sm:h-4 text-white force-white animate-bounce" />
                        </motion.button>
                      ) : (
                        <motion.button
                          onClick={restartConversation}
                          animate={{
                            scale: [1, 1.02, 1],
                          }}
                          transition={{
                            duration: 2.5,
                            repeat: Infinity,
                            ease: "easeInOut"
                          }}
                          className="relative overflow-visible inline-flex items-center gap-2 px-3.5 py-2 sm:px-5 sm:py-3 rounded-full text-[10px] sm:text-[11px] font-sans font-black tracking-wider bg-neutral-900 hover:bg-black border border-neutral-800 text-white force-white transition-all hover:scale-[1.03] active:scale-95 cursor-pointer shadow-[0_4px_12px_rgba(0,0,0,0.2)]"
                        >
                          {/* Striking pulsing rings for restart button */}
                          <motion.div
                            className="absolute inset-0 rounded-full border border-neutral-600/30 pointer-events-none z-0"
                            animate={{
                              scale: [1, 1.12, 1],
                              opacity: [0.4, 0, 0.4]
                            }}
                            transition={{
                              duration: 2.5,
                              repeat: Infinity,
                              ease: "easeInOut"
                            }}
                          />
                          <motion.div
                            className="absolute inset-0 rounded-full bg-neutral-900/10 pointer-events-none z-0"
                            animate={{
                              scale: [1, 1.22, 1],
                              opacity: [0.2, 0, 0.2]
                            }}
                            transition={{
                              duration: 2.5,
                              delay: 0.5,
                              repeat: Infinity,
                              ease: "easeInOut"
                            }}
                          />
                          <span className="relative z-10 text-white force-white">Reiniciar Diálogo</span>
                          <RotateCcw className="relative z-10 w-3 h-3 sm:w-3.5 sm:h-3.5 text-white force-white animate-spin-slow" />
                        </motion.button>
                      )}
                    </div>

                    {/* Chat Input Bar */}
                    <div className="bg-[#FAF9F6] p-3 flex items-center justify-between gap-2.5 z-10 select-none shrink-0 border-t border-neutral-200/40">
                      <div className="bg-white border border-neutral-200/85 text-[11.5px] px-4 py-2 rounded-full flex-1 text-neutral-400 italic text-left shadow-inner truncate">
                        Aguardando retorno prático...
                      </div>
                      <div className="w-8.5 h-8.5 rounded-full bg-[#008069] flex items-center justify-center text-white cursor-pointer shadow-sm shadow-[#00806a]/15 shrink-0">
                        <svg className="w-4 h-4 rotate-[45deg]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <line x1="22" y1="2" x2="11" y2="13" />
                          <polygon points="22 2 15 22 11 13 2 9 22 2" />
                        </svg>
                      </div>
                    </div>

                  </div>
                </motion.div>

                {/* Simulated Floating Shadow to ground the device realistically as shown in screenshot */}
                <div 
                  className="w-[180px] sm:w-[220px] h-3.5 bg-neutral-500/70 rounded-full mt-7 shadow-lg z-0 mx-auto"
                />

              </div>

            </div>

          </div>
        </div>
        {/* Soft elegant gradient transition divider */}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#00a83e]/30 via-[#0070f3]/25 via-transparent to-transparent z-10" />
        <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-gradient-to-r from-transparent via-[#00a83e]/10 via-[#0070f3]/10 to-transparent z-10 blur-[2px] opacity-85" />
      </section>

      {/* NEW MASTER SECOND FOLD: WHO SHOULD HAVE CERUTI AS THEIR TRAINER */}
      <section className="bg-gradient-to-b from-[#FAF9F6] via-white to-white py-24 sm:py-28 relative overflow-hidden" id="quem-treinar">
        {/* Decorative background grid and elements */}
        <div className="absolute inset-0 opacity-[0.02] pointer-events-none bg-[radial-gradient(#00a83e_1px,transparent_1px)] [background-size:24px_24px] z-0"></div>
        <div className="absolute top-1/3 -left-48 w-96 h-96 pointer-events-none bg-[radial-gradient(circle_at_center,rgba(0,112,243,0.08)_0%,transparent_70%)]" />
        <div className="absolute bottom-1/3 -right-48 w-96 h-96 pointer-events-none bg-[radial-gradient(circle_at_center,rgba(0,168,62,0.08)_0%,transparent_70%)]" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          
          {/* Section badge for elegant design feeling */}
          <div className="flex justify-center mb-6">
            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#f2fcf5] border border-[#00a83e]/20 text-[11px] font-sans font-extrabold tracking-wider text-[#00a83e] uppercase"
            >
              <Award className="w-3.5 h-3.5 text-[#00a83e]" />
              Equipe de Elite no Agronegócio
            </motion.div>
          </div>

          {/* Heading with exquisite branding alignment */}
          <div className="text-center max-w-4xl mx-auto mb-16 sm:mb-20">
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="text-3xl sm:text-4xl lg:text-[44px] font-sans font-black text-[#0b1a30] tracking-tighter leading-[1.08] uppercase"
            >
              QUEM DEVE TER O CERUTI <br className="hidden sm:inline" />
              COMO TREINADOR?
            </motion.h2>
          </div>

          {/* Beautiful 6-card grid with high architecture precision */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 max-w-6xl mx-auto">
            
            {/* Card 1: VENDEDORES */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false }}
              transition={{ duration: 0.6, delay: 0.1 }}
              whileHover={{ scale: 1.03 }}
              className="electric-border-card rounded-[32px] min-h-[260px] shadow-[0_12px_45px_rgba(11,26,48,0.02)] hover:shadow-[0_24px_55px_rgba(11,26,48,0.07)] transition-all duration-300 group relative overflow-visible"
            >
              <div className="electric-border-glow" />
              <div className="electric-border-inner" />
              
              <motion.div 
                animate={{ y: [0, -6, 0] }}
                transition={{ repeat: Infinity, duration: 6, ease: "easeInOut", delay: 0 }}
                className="relative z-10 w-full h-full p-8 sm:p-10 flex flex-col items-center justify-center text-center"
              >
                {/* Icon Container */}
                <div className="w-20 h-20 rounded-full bg-[#ecf3ff] flex items-center justify-center transition-all duration-300 group-hover:scale-105">
                  <User className="w-9 h-9 text-[#0070f3]" />
                </div>
                {/* Horizontal blue line divider */}
                <div className="w-12 h-1 bg-[#0070f3] rounded-full mt-5 transition-all duration-300 group-hover:w-16" />
                
                <h3 className="text-[#0b1a30] font-sans font-black text-xl lg:text-2xl tracking-tight leading-tight uppercase mt-7">
                  VENDEDORES
                </h3>
              </motion.div>
            </motion.div>

            {/* Card 2: SUPERVISORES */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false }}
              transition={{ duration: 0.6, delay: 0.2 }}
              whileHover={{ scale: 1.03 }}
              className="electric-border-card rounded-[32px] min-h-[260px] shadow-[0_12px_45px_rgba(11,26,48,0.02)] hover:shadow-[0_24px_55px_rgba(11,26,48,0.07)] transition-all duration-300 group relative overflow-visible"
            >
              <div className="electric-border-glow" />
              <div className="electric-border-inner" />

              <motion.div 
                animate={{ y: [0, -6, 0] }}
                transition={{ repeat: Infinity, duration: 6.5, ease: "easeInOut", delay: 0.5 }}
                className="relative z-10 w-full h-full p-8 sm:p-10 flex flex-col items-center justify-center text-center"
              >
                {/* Icon Container */}
                <div className="w-20 h-20 rounded-full bg-[#ecf3ff] flex items-center justify-center transition-all duration-300 group-hover:scale-105">
                  <ClipboardList className="w-9 h-9 text-[#0070f3]" />
                </div>
                {/* Horizontal blue line divider */}
                <div className="w-12 h-1 bg-[#0070f3] rounded-full mt-5 transition-all duration-300 group-hover:w-16" />
                
                <h3 className="text-[#0b1a30] font-sans font-black text-xl lg:text-2xl tracking-tight leading-tight uppercase mt-7">
                  SUPERVISORES
                </h3>
              </motion.div>
            </motion.div>

            {/* Card 3: REPRESENTANTES COMERCIAIS */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false }}
              transition={{ duration: 0.6, delay: 0.3 }}
              whileHover={{ scale: 1.03 }}
              className="electric-border-card rounded-[32px] min-h-[260px] shadow-[0_12px_45px_rgba(11,26,48,0.02)] hover:shadow-[0_24px_55px_rgba(11,26,48,0.07)] transition-all duration-300 group relative overflow-visible"
            >
              <div className="electric-border-glow" />
              <div className="electric-border-inner" />

              <motion.div 
                animate={{ y: [0, -6, 0] }}
                transition={{ repeat: Infinity, duration: 7, ease: "easeInOut", delay: 1.0 }}
                className="relative z-10 w-full h-full p-8 sm:p-10 flex flex-col items-center justify-center text-center"
              >
                {/* Icon Container */}
                <div className="w-20 h-20 rounded-full bg-[#ecf3ff] flex items-center justify-center transition-all duration-300 group-hover:scale-105">
                  <MapPin className="w-9 h-9 text-[#0070f3]" />
                </div>
                {/* Horizontal blue line divider */}
                <div className="w-12 h-1 bg-[#0070f3] rounded-full mt-5 transition-all duration-300 group-hover:w-16" />
                
                <h3 className="text-[#0b1a30] font-sans font-black text-xl lg:text-2xl tracking-tight leading-tight uppercase mt-7">
                  REPRESENTANTES <br /> COMERCIAIS
                </h3>
              </motion.div>
            </motion.div>

            {/* Card 4: PROMOTORES DE VENDAS */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false }}
              transition={{ duration: 0.6, delay: 0.4 }}
              whileHover={{ scale: 1.03 }}
              className="electric-border-card rounded-[32px] min-h-[260px] shadow-[0_12px_45px_rgba(11,26,48,0.02)] hover:shadow-[0_24px_55px_rgba(11,26,48,0.07)] transition-all duration-300 group relative overflow-visible"
            >
              <div className="electric-border-glow" />
              <div className="electric-border-inner" />

              <motion.div 
                animate={{ y: [0, -6, 0] }}
                transition={{ repeat: Infinity, duration: 6.2, ease: "easeInOut", delay: 1.5 }}
                className="relative z-10 w-full h-full p-8 sm:p-10 flex flex-col items-center justify-center text-center"
              >
                {/* Icon Container */}
                <div className="w-20 h-20 rounded-full bg-[#ecf3ff] flex items-center justify-center transition-all duration-300 group-hover:scale-105">
                  <ShoppingBag className="w-9 h-9 text-[#0070f3]" />
                </div>
                {/* Horizontal blue line divider */}
                <div className="w-12 h-1 bg-[#0070f3] rounded-full mt-5 transition-all duration-300 group-hover:w-16" />
                
                <h3 className="text-[#0b1a30] font-sans font-black text-xl lg:text-2xl tracking-tight leading-tight uppercase mt-7">
                  PROMOTORES <br /> DE VENDAS
                </h3>
              </motion.div>
            </motion.div>

            {/* Card 5: GERENTES COMERCIAIS (SPECIAL HIGHLIGHT FROM SCREENSHOT) */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: false }}
              transition={{ duration: 0.6, delay: 0.2 }}
              whileHover={{ scale: 1.04 }}
              className="electric-border-card rounded-[32px] min-h-[260px] shadow-[0_16px_50px_rgba(0,168,62,0.06)] hover:shadow-[0_26px_60px_rgba(0,168,62,0.12)] transition-all duration-300 group relative overflow-visible"
            >
              <div className="electric-border-glow-special" />
              <div className="electric-border-inner" />

              <motion.div 
                animate={{ y: [0, -6, 0] }}
                transition={{ repeat: Infinity, duration: 5.8, ease: "easeInOut", delay: 0.2 }}
                className="relative z-10 w-full h-full p-8 sm:p-10 flex flex-col items-center justify-center text-center"
              >
                {/* Icon Container with bright green palette */}
                <div className="w-20 h-20 rounded-full bg-[#eafdf0] flex items-center justify-center transition-all duration-300 group-hover:scale-105 border border-[#00a83e]/25">
                  <div className="relative">
                    {/* Multi-user group representation matching screenshot */}
                    <Users className="w-9 h-9 text-[#00a83e]" />
                  </div>
                </div>
                {/* Horizontal GREEN line divider */}
                <div className="w-14 h-[5px] bg-[#00a83e] rounded-full mt-5 transition-all duration-300 group-hover:w-18" />
                
                <h3 className="text-[#0b1a30] font-sans font-black text-xl lg:text-2xl tracking-tight leading-tight uppercase mt-7">
                  GERENTES <br /> COMERCIAIS
                </h3>
              </motion.div>
            </motion.div>

            {/* Card 6: ASSISTENTES TÉCNICOS COMERCIAIS */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false }}
              transition={{ duration: 0.6, delay: 0.5 }}
              whileHover={{ scale: 1.03 }}
              className="electric-border-card rounded-[32px] min-h-[260px] shadow-[0_12px_45px_rgba(11,26,48,0.02)] hover:shadow-[0_24px_55px_rgba(11,26,48,0.07)] transition-all duration-300 group relative overflow-visible"
            >
              <div className="electric-border-glow" />
              <div className="electric-border-inner" />

              <motion.div 
                animate={{ y: [0, -6, 0] }}
                transition={{ repeat: Infinity, duration: 6.8, ease: "easeInOut", delay: 0.8 }}
                className="relative z-10 w-full h-full p-8 sm:p-10 flex flex-col items-center justify-center text-center"
              >
                {/* Icon Container */}
                <div className="w-20 h-20 rounded-full bg-[#ecf3ff] flex items-center justify-center transition-all duration-300 group-hover:scale-105">
                  <Wrench className="w-9 h-9 text-[#0070f3]" />
                </div>
                {/* Horizontal blue line divider */}
                <div className="w-12 h-1 bg-[#0070f3] rounded-full mt-5 transition-all duration-300 group-hover:w-16" />
                
                <h3 className="text-[#0b1a30] font-sans font-black text-xl lg:text-2xl tracking-tight leading-tight uppercase mt-7">
                  ASSISTENTES TÉCNICOS <br /> COMERCIAIS
                </h3>
              </motion.div>
            </motion.div>

          </div>

        </div>
        
        {/* Soft elegant gradient transition divider matching previous fold transitions beautifully */}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#00a83e]/30 via-[#0070f3]/25 via-transparent to-transparent z-10" />
        <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-gradient-to-r from-transparent via-[#00a83e]/10 via-[#0070f3]/10 to-transparent z-10 blur-[2px] opacity-85" />
      </section>

      <section className="bg-gradient-to-b from-white via-white to-[#FAF9F6] py-24 relative overflow-hidden" id="como-funciona">
        {/* Subtle decorative dot grid background for that professional slide feeling */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[radial-gradient(#00a83e_1px,transparent_1px)] [background-size:24px_24px] z-0"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          
          {/* Header styled exactly like the attached mockup */}
          <div className="text-center max-w-3xl mx-auto space-y-5 mb-20">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-sans font-black text-[#0c1f22] tracking-tight uppercase">
              Como funciona?
            </h2>
            <div className="w-16 h-1.5 bg-[#00a83e] mx-auto rounded-full"></div>
          </div>

          {/* Stepped Timeline Progress Track - Interactive Horizontal on Desktop, Vertical on Mobile */}
          <div className="relative mt-16 max-w-6xl mx-auto">
            
            {/* Horizontal Timeline bar (hidden on mobile) */}
            <div className="hidden lg:block absolute top-[94px] left-[12%] right-[12%] h-[2px] bg-neutral-200/80 z-0">
              <div className="absolute top-0 left-0 h-full w-[100%] bg-gradient-to-r from-[#00a83e] via-[#0070f3] to-[#00a83e] rounded-full"></div>
            </div>

            {/* Steps Container Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-12 lg:gap-8 relative z-10">
              
              {/* STEP 1: VENDEDOR PERGUNTA */}
              <div className="flex flex-col items-center group relative">
                <div className="relative bg-white border border-neutral-200/60 rounded-[32px] p-8 text-center flex flex-col items-center shadow-[0_20px_50px_rgba(0,168,62,0.03)] hover:shadow-[0_30px_70px_rgba(0,168,62,0.07)] hover:-translate-y-1.5 transition-all duration-300 w-full max-w-[280px] min-h-[310px] justify-between border-b-[3px] border-b-[#00a83e]/80">
                  
                  {/* Badge centered on top boundary */}
                  <span className="absolute -top-5 left-1/2 transform -translate-x-1/2 bg-[#00a83e] text-white font-sans font-black w-10 h-10 rounded-full flex items-center justify-center text-base shadow-[0_4px_12px_rgba(0,168,62,0.3)] border-2 border-white">
                    1
                  </span>

                  {/* Icon illustration: green speech bubble with dots */}
                  <div className="w-32 h-32 rounded-[24px] bg-[#eefaf2] border border-[#d2f4dc] flex items-center justify-center mt-2 group-hover:scale-105 transition-transform duration-300">
                    <svg className="w-16 h-16 text-[#00a83e]" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2050/svg">
                      <rect x="15" y="25" width="70" height="46" rx="20" fill="white" stroke="#00a83e" strokeWidth="4" />
                      <path d="M35 71L25 83V71H35Z" fill="white" stroke="#00a83e" strokeWidth="4" strokeLinejoin="round" />
                      <circle cx="38" cy="48" r="4.5" fill="#00a83e" />
                      <circle cx="50" cy="48" r="4.5" fill="#00a83e" />
                      <circle cx="62" cy="48" r="4.5" fill="#00a83e" />
                    </svg>
                  </div>

                  {/* Title and details */}
                  <div className="mt-6 space-y-2">
                    <h4 className="font-sans font-black text-lg text-[#0c1f22]">Envio do Problema</h4>
                    <p className="text-xs text-neutral-500 font-semibold leading-relaxed px-1">
                      Profissional envia o seu problema
                    </p>
                  </div>

                </div>
                {/* Horizontal flow pointer arrow for desktop */}
                <div className="hidden lg:flex absolute top-[80px] -right-[20px] z-20 text-[#0070f3] animate-pulse">
                  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                  </svg>
                </div>
              </div>

              {/* STEP 2: DIAGNÓSTICO */}
              <div className="flex flex-col items-center group relative border-[#0000]/0">
                <div className="relative bg-white border border-neutral-200/60 rounded-[32px] p-8 text-center flex flex-col items-center shadow-[0_20px_50px_rgba(0,112,243,0.03)] hover:shadow-[0_30px_70px_rgba(0,112,243,0.07)] hover:-translate-y-1.5 transition-all duration-300 w-full max-w-[280px] min-h-[310px] justify-between border-b-[3px] border-b-[#0070f3]/80">
                  
                  {/* Badge centered on top boundary */}
                  <span className="absolute -top-5 left-1/2 transform -translate-x-1/2 bg-[#0070f3] text-white font-sans font-black w-10 h-10 rounded-full flex items-center justify-center text-base shadow-[0_4px_12px_rgba(0,112,243,0.3)] border-2 border-white">
                    2
                  </span>

                  {/* Icon illustration: blue magnifying glass */}
                  <div className="w-32 h-32 rounded-[24px] bg-[#f0f7ff] border border-[#d1e6ff] flex items-center justify-center mt-2 group-hover:scale-105 transition-transform duration-300">
                    <svg className="w-16 h-16 text-[#0070f3]" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2050/svg">
                      <circle cx="46" cy="46" r="20" fill="white" stroke="#0070f3" strokeWidth="4.5" />
                      <line x1="60.5" y1="60.5" x2="80" y2="80" stroke="#0070f3" strokeWidth="5" strokeLinecap="round" />
                      <path d="M38 38C38 38 41 34 47 34" stroke="#0070f3" strokeWidth="3" strokeLinecap="round" />
                    </svg>
                  </div>

                  {/* Title and details */}
                  <div className="mt-6 space-y-2">
                    <h4 className="font-sans font-black text-lg text-[#0c1f22]">Diagnóstico</h4>
                    <p className="text-xs text-neutral-500 font-semibold leading-relaxed px-1">
                      Agente Ceruti faz perguntas para entender melhor o cenário
                    </p>
                  </div>

                </div>
                {/* Horizontal flow pointer arrow for desktop */}
                <div className="hidden lg:flex absolute top-[80px] -right-[20px] z-20 text-[#00a83e] animate-pulse">
                  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                  </svg>
                </div>
              </div>

              {/* STEP 3: PLANO PRÁTICO */}
              <div className="flex flex-col items-center group relative border-[#0000]/0">
                <div className="relative bg-white border border-neutral-200/60 rounded-[32px] p-8 text-center flex flex-col items-center shadow-[0_20px_50px_rgba(0,168,62,0.03)] hover:shadow-[0_30px_70px_rgba(0,168,62,0.07)] hover:-translate-y-1.5 transition-all duration-300 w-full max-w-[280px] min-h-[310px] justify-between border-b-[3px] border-b-[#00a83e]/80">
                  
                  {/* Badge centered on top boundary */}
                  <span className="absolute -top-5 left-1/2 transform -translate-x-1/2 bg-[#00a83e] text-white font-sans font-black w-10 h-10 rounded-full flex items-center justify-center text-base shadow-[0_4px_12px_rgba(0,168,62,0.3)] border-2 border-white">
                    3
                  </span>

                  {/* Icon illustration: green checklist document */}
                  <div className="w-32 h-32 rounded-[24px] bg-[#eefaf2] border border-[#d2f4dc] flex items-center justify-center mt-2 group-hover:scale-105 transition-transform duration-300">
                    <svg className="w-14 h-14 text-[#00a83e]" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2050/svg">
                      <rect x="22" y="16" width="56" height="68" rx="10" fill="white" stroke="#00a83e" strokeWidth="4" />
                      <path d="M34 32H44M34 50H50M34 68H44" stroke="#00a83e" strokeWidth="4" strokeLinecap="round" />
                      <path d="M58 28L63 33L74 22" stroke="#10b981" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
                      <path d="M58 48L63 53L74 42" stroke="#10b981" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
                      <path d="M58 66L63 71L74 60" stroke="#10b981" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>

                  {/* Title and details */}
                  <div className="mt-6 space-y-2">
                    <h4 className="font-sans font-black text-lg text-[#0c1f22]">Plano de Solução</h4>
                    <p className="text-xs text-neutral-500 font-semibold leading-relaxed px-1">
                      Agente Ceruti entrega um plano para solucionar o problema
                    </p>
                  </div>

                </div>
                {/* Horizontal flow pointer arrow for desktop */}
                <div className="hidden lg:flex absolute top-[80px] -right-[20px] z-20 text-[#0070f3] animate-pulse">
                  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                  </svg>
                </div>
              </div>

              {/* STEP 4: PÓS-PLANO */}
              <div className="flex flex-col items-center group">
                <div className="relative bg-white border border-neutral-200/60 rounded-[32px] p-8 text-center flex flex-col items-center shadow-[0_20px_50px_rgba(0,112,243,0.03)] hover:shadow-[0_30px_70px_rgba(0,112,243,0.07)] hover:-translate-y-1.5 transition-all duration-300 w-full max-w-[280px] min-h-[310px] justify-between border-b-[3px] border-b-[#0070f3]/80">
                  
                  {/* Badge centered on top boundary */}
                  <span className="absolute -top-5 left-1/2 transform -translate-x-1/2 bg-[#0070f3] text-white font-sans font-black w-10 h-10 rounded-full flex items-center justify-center text-base shadow-[0_4px_12px_rgba(0,112,243,0.3)] border-2 border-white">
                    4
                  </span>

                  {/* Icon illustration: blue rocket taking off */}
                  <div className="w-32 h-32 rounded-[24px] bg-[#f0f7ff] border border-[#d1e6ff] flex items-center justify-center mt-2 group-hover:scale-105 transition-transform duration-300">
                    <svg className="w-16 h-16 text-[#0070f3]" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2050/svg">
                      <path d="M68 22C68 22 55 25 45 35C35 45 32 58 32 58C32 58 41 55 49 49C57 43 68 22 68 22Z" fill="white" stroke="#0070f3" strokeWidth="4" strokeLinejoin="round" />
                      <path d="M41 59L28 72C24 76 27 80 27 80C27 80 31 83 35 79L48 66" stroke="#0070f3" strokeWidth="4.5" strokeLinecap="round" />
                      <path d="M53 37C55 35 59 35 61 37C63 39 63 43 61 45" stroke="#0070f3" strokeWidth="3" strokeLinecap="round" />
                      <circle cx="28" cy="80" r="1.5" fill="#0070f3" />
                      {/* Left and Right Small wings */}
                      <path d="M38 48C34 50 30 55 30 55L34 59" stroke="#0070f3" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
                      <path d="M48 38C50 34 55 30 55 30L59 34" stroke="#0070f3" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>

                  {/* Title and details */}
                  <div className="mt-6 space-y-2">
                    <h4 className="font-sans font-black text-lg text-[#0c1f22]">Pós plano</h4>
                    <p className="text-xs text-neutral-500 font-semibold leading-relaxed px-1">
                      Agente Ceruti abre para criação de scripts, refinamento do plano etc...
                    </p>
                  </div>

                </div>
              </div>

            </div>
          </div>

          {/* CTA Button */}
          <div className="flex justify-center mt-12 relative z-20">
            <a 
              href="#planos" 
              className="inline-flex items-center gap-3 bg-[#00a83e] hover:bg-[#009035] text-white px-8 py-4.5 rounded-xl font-extrabold text-sm tracking-widest uppercase transition-all shadow-md shadow-[#00a83e]/20 hover:scale-[1.01] active:scale-[0.99]"
            >
              <MessageCircle className="w-5 h-5 text-current" />
              Quero ter acesso
            </a>
          </div>

        </div>
        {/* Soft elegant gradient transition divider */}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#00a83e]/30 via-[#0070f3]/25 via-transparent to-transparent z-10" />
        <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-gradient-to-r from-transparent via-[#00a83e]/10 via-[#0070f3]/10 to-transparent z-10 blur-[2px] opacity-85" />
      </section>

      {/* SECOND FOLD: RESULTS OF THE NEW TRAINING MODEL */}
      <section className="bg-gradient-to-b from-white via-neutral-50/20 to-neutral-50 py-20 sm:py-24 relative overflow-visible" id="resultados">
        <div className="absolute inset-0 opacity-[0.015] pointer-events-none bg-[radial-gradient(#0070f3_1px,transparent_1px)] [background-size:24px_24px] z-0"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          
          <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
            <h2 className="text-3xl sm:text-[40px] font-sans font-black text-[#0c1f22] tracking-tighter uppercase leading-tight">
              Resultados Práticos
            </h2>
          </div>

          {/* Scroll Stack of Cards (6 Cards) */}
          <ScrollStack className="max-w-4xl mx-auto mt-12 mb-12" useWindowScroll={true} itemDistance={32} blurAmount={2} rotationAmount={0.5}>
            
            {/* Card 1: Aprendizado 24/7 */}
            <ScrollStackItem 
              itemClassName="relative bg-white border border-neutral-100/60 rounded-[32px] p-6 sm:p-8 md:p-12 shadow-[0_25px_50px_-12px_rgba(12,31,34,0.05)] hover:shadow-[0_35px_60px_-15px_rgba(0,168,62,0.1)] flex flex-col md:flex-row items-center gap-8 md:gap-12 transition-shadow duration-300 group"
            >
              <div 
                translate="no"
                className="notranslate flex flex-col items-center justify-center shrink-0 w-32 h-32 md:w-36 md:h-36 rounded-[24px] bg-[#eefaf2] border border-[#d5f6df] relative overflow-hidden shadow-inner font-sans"
              >
                <span className="font-sans font-black text-[#00a83e] tracking-tighter relative z-10 text-center leading-none select-none text-3xl sm:text-4xl md:text-5xl whitespace-nowrap">
                  24/7
                </span>
                <div className="absolute bottom-2 right-2 opacity-15 group-hover:scale-110 transition-transform duration-300">
                  <Clock className="w-6 h-6 sm:w-7 sm:h-7 text-[#00a83e]" />
                </div>
              </div>
              <div className="flex-1 text-center md:text-left space-y-3.5">
                <div className="flex flex-wrap justify-center md:justify-start gap-2">
                  <span className="text-[10px] font-sans font-extrabold uppercase tracking-widest text-[#00a83e] bg-[#eefaf2] px-3 py-1 rounded-full border border-[#d5f6df]">
                    Disponibilidade Total
                  </span>
                </div>
                <h3 className="text-xl sm:text-2xl font-sans font-black text-[#0c1f22] tracking-tight leading-tight uppercase">
                  Aprendizado 24/7
                </h3>
              </div>
            </ScrollStackItem>

            {/* Card 2: Treinamento individual personalizado */}
            <ScrollStackItem 
              itemClassName="relative bg-[#fafcff] border border-[#e4efff] rounded-[32px] p-6 sm:p-8 md:p-12 shadow-[0_25px_50px_-12px_rgba(12,31,34,0.05)] hover:shadow-[0_35px_60px_-15px_rgba(0,112,243,0.1)] flex flex-col md:flex-row items-center gap-8 md:gap-12 transition-shadow duration-300 group"
            >
              <div 
                translate="no"
                className="notranslate flex flex-col items-center justify-center shrink-0 w-32 h-32 md:w-36 md:h-36 rounded-[24px] bg-[#f0f7ff] border border-[#d6ebff] relative overflow-hidden shadow-inner font-sans"
              >
                <span className="text-4xl sm:text-5xl font-sans font-black text-[#0070f3] tracking-tight relative z-10">
                  1:1
                </span>
                <div className="absolute bottom-3 right-3 opacity-20 group-hover:scale-110 transition-transform duration-300">
                  <Sparkles className="w-8 h-8 text-[#0070f3]" />
                </div>
              </div>
              <div className="flex-1 text-center md:text-left space-y-3.5">
                <div className="flex flex-wrap justify-center md:justify-start gap-2">
                  <span className="text-[10px] font-sans font-extrabold uppercase tracking-widest text-[#0070f3] bg-[#f0f7ff] px-3 py-1 rounded-full border border-[#d3e7ff]">
                    Feedback Dedicado
                  </span>
                </div>
                <h3 className="text-xl sm:text-2xl font-sans font-black text-[#0c1f22] tracking-tight leading-tight uppercase">
                  Treinamento individual personalizado
                </h3>
              </div>
            </ScrollStackItem>

            {/* Card 3: Padronização da Operação */}
            <ScrollStackItem 
              itemClassName="relative bg-white border border-[#e2eed4]/70 rounded-[32px] p-6 sm:p-8 md:p-12 shadow-[0_25px_50px_-12px_rgba(12,31,34,0.05)] hover:shadow-[0_35px_60px_-15px_rgba(12,31,34,0.1)] flex flex-col md:flex-row items-center gap-8 md:gap-12 transition-shadow duration-300 group"
            >
              <div className="flex flex-col items-center justify-center shrink-0 w-32 h-32 md:w-36 md:h-36 rounded-[24px] bg-[#eefaf2] border border-[#cbeed4] relative overflow-hidden shadow-inner font-sans">
                <span className="text-4xl sm:text-5xl font-sans font-black text-[#00a83e] tracking-tight relative z-10">
                  100%
                </span>
                <div className="absolute bottom-3 right-3 opacity-20 group-hover:scale-110 transition-transform duration-300">
                  <ClipboardList className="w-8 h-8 text-[#00a83e]" />
                </div>
              </div>
              <div className="flex-1 text-center md:text-left space-y-3.5">
                <div className="flex flex-wrap justify-center md:justify-start gap-2">
                  <span className="text-[10px] font-sans font-extrabold uppercase tracking-widest text-[#00a83e] bg-[#eefaf2] px-3 py-1 rounded-full border border-[#cbeed4]">
                    Consistência no Campo
                  </span>
                </div>
                <h3 className="text-xl sm:text-2xl font-sans font-black text-[#0c1f22] tracking-tight leading-tight uppercase">
                  Padronização da Operação
                </h3>
              </div>
            </ScrollStackItem>

            {/* Card 4: Redução de até 95% do tempo de treinamento */}
            <ScrollStackItem 
              itemClassName="relative bg-[#fafcff] border border-[#e4efff] rounded-[32px] p-6 sm:p-8 md:p-12 shadow-[0_25px_50px_-12px_rgba(12,31,34,0.05)] hover:shadow-[0_35px_60px_-15px_rgba(0,112,243,0.1)] flex flex-col md:flex-row items-center gap-8 md:gap-12 transition-shadow duration-300 group"
            >
              <div className="flex flex-col items-center justify-center shrink-0 w-32 h-32 md:w-36 md:h-36 rounded-[24px] bg-[#f0f7ff] border border-[#d6ebff] relative overflow-hidden shadow-inner font-sans">
                <span className="text-4xl sm:text-5xl font-sans font-black text-[#0070f3] tracking-tight relative z-10">
                  95%
                </span>
                <div className="absolute bottom-3 right-3 opacity-20 group-hover:scale-110 transition-transform duration-300">
                  <TrendingUp className="w-8 h-8 text-[#0070f3]" />
                </div>
              </div>
              <div className="flex-1 text-center md:text-left space-y-3.5">
                <div className="flex flex-wrap justify-center md:justify-start gap-2">
                  <span className="text-[10px] font-sans font-extrabold uppercase tracking-widest text-[#0070f3] bg-[#f0f7ff] px-3 py-1 rounded-full border border-[#d3e7ff]">
                    Eficiência Máxima
                  </span>
                </div>
                <h3 className="text-xl sm:text-2xl font-sans font-black text-[#0c1f22] tracking-tight leading-tight uppercase">
                  Redução de até 95% do tempo de treinamento
                </h3>
              </div>
            </ScrollStackItem>

            {/* Card 5: Corte de até 80% nos erros comerciais */}
            <ScrollStackItem 
              itemClassName="relative bg-white border border-[#e2eed4]/70 rounded-[32px] p-6 sm:p-8 md:p-12 shadow-[0_25px_50px_-12px_rgba(12,31,34,0.05)] hover:shadow-[0_35px_60px_-15px_rgba(12,31,34,0.1)] flex flex-col md:flex-row items-center gap-8 md:gap-12 transition-shadow duration-300 group"
            >
              <div className="flex flex-col items-center justify-center shrink-0 w-32 h-32 md:w-36 md:h-36 rounded-[24px] bg-[#eefaf2] border border-[#cbeed4] relative overflow-hidden shadow-inner font-sans">
                <span className="text-4xl sm:text-5xl font-sans font-black text-[#00a83e] tracking-tight relative z-10">
                  80%
                </span>
                <div className="absolute bottom-3 right-3 opacity-20 group-hover:scale-110 transition-transform duration-300">
                  <Wrench className="w-8 h-8 text-[#00a83e]" />
                </div>
              </div>
              <div className="flex-1 text-center md:text-left space-y-3.5">
                <div className="flex flex-wrap justify-center md:justify-start gap-2">
                  <span className="text-[10px] font-sans font-extrabold uppercase tracking-widest text-[#00a83e] bg-[#eefaf2] px-3 py-1 rounded-full border border-[#cbeed4]">
                    Segurança de Margem
                  </span>
                </div>
                <h3 className="text-xl sm:text-2xl font-sans font-black text-[#0c1f22] tracking-tight leading-tight uppercase">
                  Corte de até 80% nos erros comerciais
                </h3>
              </div>
            </ScrollStackItem>

            {/* Card 6: Time mais preparado, rápido e vendendo mais! */}
            <ScrollStackItem 
              itemClassName="relative bg-transparent border-none rounded-[32px] shadow-[0_25px_50px_-12px_rgba(12,31,34,0.06)] hover:shadow-[0_35px_60px_-15px_rgba(0,112,243,0.15)] transition-shadow duration-300 group overflow-visible"
            >
              <div className="electric-border-glow-blue" />
              <div className="absolute inset-[1.5px] rounded-[30.5px] bg-[#fafcff] z-[1] pointer-events-none" />

              <div className="relative z-10 flex flex-col md:flex-row items-center gap-8 md:gap-12 p-6 sm:p-8 md:p-12 w-full h-full">
                <div className="flex flex-col items-center justify-center shrink-0 w-32 h-32 md:w-36 md:h-36 rounded-[24px] bg-[#f0f7ff] border border-[#d6ebff] relative overflow-hidden shadow-inner font-sans">
                  <span className="text-3xl sm:text-4xl font-sans font-extrabold text-[#0070f3] tracking-tight relative z-10 uppercase">
                    ROI
                  </span>
                  <div className="absolute bottom-3 right-3 opacity-20 group-hover:scale-110 transition-transform duration-300">
                    <Award className="w-8 h-8 text-[#0070f3]" />
                  </div>
                </div>
                <div className="flex-grow text-center md:text-left space-y-3.5">
                  <div className="flex flex-wrap justify-center md:justify-start gap-2">
                    <span className="text-[10px] font-sans font-extrabold uppercase tracking-widest text-[#0070f3] bg-[#f0f7ff] px-3 py-1 rounded-full border border-[#d3e7ff]">
                      Sucesso Prático
                    </span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-sans font-black text-[#0c1f22] tracking-tight leading-tight uppercase">
                    Time mais preparado, rápido e vendendo mais!
                  </h3>
                </div>
              </div>
            </ScrollStackItem>

          </ScrollStack>

        </div>
        {/* Soft elegant gradient transition divider */}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#00a83e]/30 via-[#0070f3]/25 via-transparent to-transparent z-10" />
        <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-gradient-to-r from-transparent via-[#00a83e]/10 via-[#0070f3]/10 to-transparent z-10 blur-[2px] opacity-85" />
      </section>

      {/* SECTION: DEPOIMENTOS DE SUCESSO (VÍDEOS DE QUEM TREINA COM O CERUTI) */}
      <section className="bg-white py-20 sm:py-24 relative overflow-x-hidden" id="depoimentos">
        <div className="absolute inset-0 opacity-[0.015] pointer-events-none bg-[radial-gradient(#00a83e_1px,transparent_1px)] [background-size:20px_20px] z-0"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          
          {/* Badge with lines like in the attachment */}
          <div className="flex items-center justify-center gap-4 mb-3">
            <div className="h-px bg-[#00a83e] w-12 sm:w-16 opacity-70"></div>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-[#00a83e] flex items-center justify-center text-white shadow-sm shadow-[#00a83e]/20">
                <Sparkles className="w-4 h-4" />
              </div>
              <span className="text-xs sm:text-sm font-sans font-extrabold uppercase tracking-widest text-[#00a83e] text-center" style={{ textAlign: "center" }}>
                Depoimentos de Sucesso
              </span>
            </div>
            <div className="h-px bg-[#00a83e] w-12 sm:w-16 opacity-70"></div>
          </div>

          {/* Main Title inspired by the attachment */}
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-[42px] font-sans font-black text-[#0c1f22] tracking-tighter uppercase leading-tight">
              O QUE ESTÃO DIZENDO
            </h2>
          </div>

          {/* Grid Layout of Cards (2 Cards side by side) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 max-w-6xl mx-auto">
            
            {/* Testimonial Card 1 */}
            <div className="bg-white border border-neutral-100 rounded-[32px] p-4 sm:p-10 shadow-[0_20px_45px_0_rgba(12,31,34,0.04)] hover:shadow-[0_25px_50px_-10px_rgba(37,211,102,0.12)] hover:-translate-y-1 transition-all duration-300 flex flex-col justify-center">
              
              {/* Vertical Video Embedding Slot suited for YouTube Shorts */}
              <div className="relative w-full max-w-[280px] sm:max-w-[320px] aspect-[9/16] mx-auto rounded-3xl overflow-hidden border-[4px] border-neutral-900 bg-neutral-950 shadow-2xl mb-0">
                {/* Simulated native player bar at top for a sleek aesthetic */}
                <div className="absolute top-0 inset-x-0 h-8 bg-gradient-to-b from-black/80 to-transparent z-20 flex items-center justify-between px-4 text-[10px] font-mono text-white/60 pointer-events-none">
                  <span>CERUTI PLAY</span>
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#ff3b30] animate-pulse"></span>
                    <span>HD 1080p</span>
                  </div>
                </div>

                <VideoEmbed videoId="8NO65aB9g6w" />
              </div>
            </div>

            {/* Testimonial Card 2 */}
            <div className="bg-white border border-neutral-100 rounded-[32px] p-4 sm:p-10 shadow-[0_20px_45px_0_rgba(12,31,34,0.04)] hover:shadow-[0_25px_50px_-10px_rgba(0,112,243,0.12)] hover:-translate-y-1 transition-all duration-300 flex flex-col justify-center">
              
              {/* Vertical Video Embedding Slot suited for YouTube Shorts */}
              <div className="relative w-full max-w-[280px] sm:max-w-[320px] aspect-[9/16] mx-auto rounded-3xl overflow-hidden border-[4px] border-neutral-900 bg-neutral-950 shadow-2xl mb-0">
                {/* Simulated native player bar at top for a sleek aesthetic */}
                <div className="absolute top-0 inset-x-0 h-8 bg-gradient-to-b from-black/80 to-transparent z-20 flex items-center justify-between px-4 text-[10px] font-mono text-white/60 pointer-events-none">
                  <span>CERUTI PLAY</span>
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#ff3b30] animate-pulse"></span>
                    <span>HD 1080p</span>
                  </div>
                </div>

                <VideoEmbed videoId="7R8Mn41HPRs" />
              </div>
            </div>

          </div>

          {/* CTA Action Button below the testimonials */}
          <div className="flex justify-center mt-12 relative z-20">
            <a 
              href="#planos" 
              className="inline-flex items-center gap-3 bg-[#00a83e] hover:bg-[#009035] text-white px-8 py-4.5 rounded-xl font-extrabold text-sm tracking-widest uppercase transition-all shadow-md shadow-[#00a83e]/20 hover:scale-[1.01] active:scale-[0.99]"
            >
              <MessageCircle className="w-5 h-5 text-current" />
              Quero ter acesso
            </a>
          </div>

        </div>

        {/* Beautiful Elegant Gradient Transition Divider to matching next section */}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#0070f3]/30 via-[#00a83e]/25 via-transparent to-transparent z-10" />
        <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-gradient-to-r from-transparent via-[#0070f3]/10 via-[#00a83e]/10 to-transparent z-10 blur-[2px] opacity-85" />
      </section>


      {/* SECTION: BENEFÍCIOS DO TREINAMENTO - PREMIUM FLUID SCROLL STACK DESIGN */}
      <section className="bg-gradient-to-b from-[#FAF9F6] via-white to-white py-24 sm:py-28 relative overflow-visible" id="beneficios">
        {/* Decorative background elements */}
        <div className="absolute inset-0 opacity-[0.015] pointer-events-none bg-[radial-gradient(#00a83e_1px,transparent_1px)] [background-size:24px_24px] z-0"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] pointer-events-none -z-10 bg-[radial-gradient(circle_at_center,rgba(0,168,62,0.06)_0%,transparent_70%)]" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          
          {/* Section badge for elegant design feeling */}
          <div className="flex justify-center mb-2.5">
            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#f2fcf5] border border-[#00a83e]/20 text-[11px] font-sans font-extrabold tracking-wider text-[#00a83e] uppercase"
            >
              <TrendingUp className="w-3.5 h-3.5 text-[#00a83e]" />
              Performance & Retorno
            </motion.div>
          </div>

          {/* Headline close to the cards */}
          <div className="text-center max-w-4xl mx-auto mb-4 sm:mb-5">
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="text-3xl sm:text-4xl lg:text-[44px] font-sans font-black text-[#0b1a30] tracking-tighter leading-[1.08] uppercase"
            >
              Benefícios reais
            </motion.h2>
          </div>

          {/* Perfect vertical stack that nests sticky cards smoothly - with tight balanced pb */}
          <div className="flex flex-col max-w-3xl mx-auto mt-0 relative rounded-3xl pb-6">
            <AnimatedList
              displayScrollbar={false}
              showGradients={false}
              items={[
              { 
                num: "01", 
                title: "Aumento significativo nas vendas", 
                accent: "#00a83e",
              },
              { 
                num: "02", 
                title: "Redução drástica no tempo de fechamento das negociações", 
                accent: "#0070f3",
              },
              { 
                num: "03", 
                title: "Aumento na recuperação de vendas que seriam perdidas", 
                accent: "#00a83e",
              },
              { 
                num: "04", 
                title: "Redução drástica do tempo para novos vendedores darem resultado", 
                accent: "#0070f3",
              },
              { 
                num: "05", 
                title: "Aumento considerável no valor médio das vendas", 
                accent: "#00a83e",
              },
              { 
                num: "06", 
                title: "Redução drástica na rotatividade do time comercial", 
                accent: "#0070f3",
              },
            ].map((benefit, idx) => (
              <div 
                key={idx}
                className={`relative w-full bg-white border border-neutral-100 rounded-2xl md:rounded-[24px] p-4 sm:p-5 shadow-[0_12px_32px_rgba(11,26,48,0.03)] hover:shadow-[0_20px_48px_rgba(11,26,48,0.08)] flex items-center gap-4 sm:gap-6 transition-all duration-300 group hover:scale-[1.005] select-none mx-auto max-w-[95%] sm:max-w-full`}
                style={{ 
                  zIndex: (idx + 1) * 10 
                }}
              >
                {/* Number Badge */}
                <div className="flex flex-col items-center justify-center shrink-0 w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-neutral-50/80 border border-neutral-200/70 relative overflow-hidden shadow-inner group-hover:border-neutral-300/80 transition-all duration-300 z-10">
                  <span className="text-xl sm:text-2xl font-sans font-black text-neutral-400 group-hover:text-neutral-900 tracking-tight transition-all duration-300">
                    {benefit.num}
                  </span>
                  <div className="absolute right-2 bottom-2 w-1.5 h-1.5 rounded-full opacity-80 group-hover:scale-150 transition-transform duration-300" style={{ backgroundColor: benefit.accent }} />
                </div>

                {/* Right Side Content with exact title, formatted to match premium results aesthetic */}
                <div className="flex-grow text-left z-10 font-sans">
                  <h3 className="text-[#0b1a30] font-sans font-black text-sm sm:text-base md:text-lg leading-tight uppercase tracking-tight transition-colors duration-200">
                    {benefit.title}
                  </h3>
                </div>

                {/* Elegant indicator dot */}
                <div className="flex h-8 w-8 rounded-full border border-neutral-100 group-hover:border-neutral-200 items-center justify-center transition-all duration-300 shrink-0 pointer-events-none self-center z-10">
                  <div className="w-2 h-2 rounded-full transition-transform duration-300 group-hover:scale-150" style={{ backgroundColor: benefit.accent }} />
                </div>
              </div>
            ))}
            />
          </div>

        </div>
        
        {/* Soft elegant gradient transition divider */}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#00a83e]/30 via-[#0070f3]/25 via-transparent to-transparent z-10" />
        <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-gradient-to-r from-transparent via-[#00a83e]/10 via-[#0070f3]/10 to-transparent z-10 blur-[2px] opacity-85" />
      </section>

      {/* NEW SECTION: TREINAMENTO VIRA ROTINA (CONTINUOUS CYCLE) */}
      <section className="bg-gradient-to-b from-[#FAF9F6] via-white to-white py-20 sm:py-24 relative overflow-hidden" id="treinamento-rotina">
        <div className="absolute inset-0 opacity-[0.015] pointer-events-none bg-[radial-gradient(#00a83e_1px,transparent_1px)] [background-size:24px_24px] z-0"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] pointer-events-none -z-10 bg-[radial-gradient(circle_at_center,rgba(0,168,62,0.06)_0%,transparent_70%)]" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 animate-fade-in-up">
          
          <div className="text-center max-w-3xl mx-auto space-y-4 mb-14">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#f2fcf5] border border-[#00a83e]/20 text-[10px] font-sans font-extrabold tracking-wider text-[#00a83e] uppercase">
              <RotateCcw className="w-3.5 h-3.5 animate-spin-slow text-[#00a83e]" />
              Loop de melhoria contínua
            </div>
            <h2 className="text-3xl sm:text-[40px] font-sans font-black text-[#0c1f22] tracking-tighter uppercase leading-tight">
              Resultado vira rotina
            </h2>
          </div>

          {/* Continuous Cycle Circle Layout */}
          <div className="relative max-w-5xl mx-auto my-12 min-h-[300px]">
            
            {/* SVG Background Connections for Continuous Cycle Loop (desktop only) */}
            <div className="hidden lg:block absolute inset-0 pointer-events-none z-0">
              <svg className="w-full h-full" viewBox="0 0 1000 300" fill="none" xmlns="http://www.w3.org/2000/svg">
                {/* Flow Line 1 to 2 */}
                <path d="M 166 125 Q 500 5 833 125" stroke="url(#gradient-cycle-1)" strokeWidth="3" strokeDasharray="6 6" className="animate-dash" />
                {/* Flow Line 2 to 3 (Return loop) */}
                <path d="M 833 175 Q 500 295 166 175" stroke="url(#gradient-cycle-2)" strokeWidth="3" strokeDasharray="6 6" className="animate-dash-reverse" />
                
                <defs>
                  <linearGradient id="gradient-cycle-1" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#0070f3" />
                    <stop offset="100%" stopColor="#00a83e" />
                  </linearGradient>
                  <linearGradient id="gradient-cycle-2" x1="100%" y1="0%" x2="0%" y2="0%">
                    <stop offset="0%" stopColor="#00a83e" />
                    <stop offset="100%" stopColor="#0070f3" />
                  </linearGradient>
                </defs>
              </svg>
            </div>

            {/* Loop Cards/Nodes */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 relative z-10">
              
              {/* STEP 1: TREINAMENTO */}
              <div className="bg-white/95 backdrop-blur-sm border border-neutral-100 rounded-[32px] p-8 md:p-10 shadow-[0_15px_40px_-10px_rgba(12,31,34,0.04)] hover:shadow-[0_20px_45px_-5px_rgba(0,112,243,0.08)] transition-all duration-300 group flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-2xl bg-[#f0f7ff] border border-[#d6ebff] flex items-center justify-center text-[#0070f3] shadow-inner mb-6 transition-transform duration-300 group-hover:scale-105">
                  <span className="font-sans font-black text-2xl">01</span>
                </div>
                <h3 className="text-lg font-sans font-black text-[#0c1f22] uppercase tracking-tight">
                  Treinamento
                </h3>
                
                {/* Mobile Flow Indicator */}
                <div className="block lg:hidden mt-6 text-[#0070f3] animate-bounce">
                  <svg className="w-5 h-5 rotate-90 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </div>
              </div>

              {/* STEP 2: ROTINA */}
              <div className="bg-white/95 backdrop-blur-sm border border-neutral-100 rounded-[32px] p-8 md:p-10 shadow-[0_15px_40px_-10px_rgba(12,31,34,0.04)] hover:shadow-[0_20px_45px_-5px_rgba(0,168,62,0.08)] transition-all duration-300 group flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-2xl bg-[#f2fcf5] border border-[#d3f2dd] flex items-center justify-center text-[#00a83e] shadow-inner mb-6 transition-transform duration-300 group-hover:scale-105">
                  <span className="font-sans font-black text-2xl">02</span>
                </div>
                <h3 className="text-lg font-sans font-black text-[#0c1f22] uppercase tracking-tight">
                  Rotina
                </h3>
                
                {/* Mobile Flow Indicator */}
                <div className="block lg:hidden mt-6 text-[#00a83e] animate-bounce">
                  <svg className="w-5 h-5 rotate-90 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </div>
              </div>

              {/* STEP 3: RESULTADO (LOOP) */}
              <div className="bg-[#fcfdfc]/95 backdrop-blur-sm border border-[#00a83e]/20 rounded-[32px] p-8 md:p-10 shadow-[0_15px_40px_-10px_rgba(12,31,34,0.04)] hover:shadow-[0_20px_45px_-5px_rgba(0,168,62,0.12)] transition-all duration-300 group flex flex-col items-center text-center relative overflow-hidden">
                <div className="w-16 h-16 rounded-2xl bg-[#eefaf2] border-2 border-[#00a83e] flex items-center justify-center text-[#00a83e] shadow-md mb-6 transition-transform duration-300 group-hover:scale-105">
                  <span className="font-sans font-black text-2xl">03</span>
                </div>
                <h3 className="text-lg font-sans font-black text-[#00a83e] uppercase tracking-tight">
                  Resultado
                </h3>
                
                {/* Mobile Return to Top Indicator */}
                <div className="block lg:hidden mt-6 text-[#0070f3] animate-pulse">
                  <div className="flex items-center justify-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#0070f3]">
                    <RotateCcw className="w-3.5 h-3.5" />
                    Ciclo recomeça
                  </div>
                </div>
              </div>

            </div>

          </div>

          {/* CTA Button */}
          <div className="flex justify-center mt-12 relative z-20">
            <a 
              href="#planos" 
              className="inline-flex items-center gap-3 bg-[#00a83e] hover:bg-[#009035] text-white px-8 py-4.5 rounded-xl font-extrabold text-sm tracking-widest uppercase transition-all shadow-md shadow-[#00a83e]/20 hover:scale-[1.01] active:scale-[0.99]"
            >
              <MessageCircle className="w-5 h-5 text-current" />
              Quero ter acesso
            </a>
          </div>

        </div>

        {/* Soft elegant gradient transition divider matching previous fold transitions beautifully */}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#00a83e]/30 via-[#0070f3]/25 via-transparent to-transparent z-10" />
        <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-gradient-to-r from-transparent via-[#00a83e]/10 via-[#0070f3]/10 to-transparent z-10 blur-[2px] opacity-85" />
      </section>

      {/* NEW PRICING SECTION */}
      <section className="bg-white py-20 sm:py-24 relative overflow-hidden" id="planos">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-4">
            <h2 className="text-3xl sm:text-[44px] font-sans font-black text-[#0b1a30] tracking-tighter leading-tight uppercase">
              ESCOLHA SUA ASSINATURA
            </h2>
            <p className="mt-5">
              <span className="relative inline-block group">
                <span className="absolute inset-0 bg-red-400/20 blur-md rounded-full transition-all duration-300 group-hover:bg-red-400/30"></span>
                <span className="relative inline-flex items-center justify-center px-6 py-1.5 rounded-full bg-red-50/80 border border-red-100 text-red-500 text-lg sm:text-xl font-black line-through decoration-red-500/70 decoration-[3px]">
                  R$ 397,00
                </span>
              </span>
            </p>
          </div>

          <div className="flex justify-center mt-6 mb-4">
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-[#00a83e] to-[#0070f3] rounded-full blur opacity-60 animate-pulse"></div>
              <div className="relative flex items-center gap-2 px-6 py-2.5 bg-white border border-neutral-100 rounded-full text-neutral-600 shadow-sm">
                <ShieldCheck className="w-5 h-5 text-[#00a83e]" />
                <span className="text-sm font-bold tracking-wide">
                  Garantia Incondicional de <strong className="text-[#00a83e] font-black">14 DIAS</strong>
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 mt-10 items-start justify-center max-w-4xl mx-auto">
            {/* ATÉ 10 VENDEDORES */}
            <div className="bg-white border-2 border-[#d9e6ff] rounded-[32px] p-6 sm:p-8 flex flex-col relative w-full pt-12 shadow-[0_12px_45px_rgba(11,26,48,0.02)]">
              {/* Floating Badge */}
              <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-[#f0f7ff] border-2 border-[#d9e6ff] text-[#0070f3] w-14 h-14 rounded-2xl flex items-center justify-center shadow-sm">
                <Users className="w-7 h-7" />
              </div>
              
              <h3 className="text-center font-black text-xl text-[#0070f3] uppercase tracking-tighter mb-8">
                ATÉ 10 VENDEDORES
              </h3>

              <div className="grid grid-cols-2 gap-4">
                {/* Mensal */}
                <div className="bg-white border border-neutral-100 shadow-sm rounded-[24px] p-5 flex flex-col items-center">
                  <div className="w-12 h-12 rounded-full bg-[#f0f7ff] text-[#0070f3] flex items-center justify-center mb-3">
                    <CalendarDays className="w-6 h-6" />
                  </div>
                  <span className="font-bold text-neutral-900 text-sm mb-2">Mensal</span>
                  <div className="flex items-baseline gap-1 mb-4">
                    <span className="font-bold text-lg text-neutral-900 mt-1">R$</span>
                    <span className="font-black text-3xl sm:text-4xl text-[#0b1a30] tracking-tighter leading-none">337<span className="text-xl sm:text-2xl">,45</span></span>
                  </div>
                  <div className="bg-[#eafdf0] text-[#00a83e] font-bold text-xs uppercase px-4 py-1.5 rounded-full mt-auto">
                    15% OFF
                  </div>
                </div>

                {/* Semestral */}
                <div className="bg-white border border-neutral-100 shadow-sm rounded-[24px] p-5 flex flex-col items-center">
                  <div className="w-12 h-12 rounded-full bg-[#f0f7ff] text-[#0070f3] flex items-center justify-center mb-3">
                    <CalendarDays className="w-6 h-6" />
                  </div>
                  <span className="font-bold text-neutral-900 text-sm mb-2">Semestral</span>
                  <div className="flex items-baseline gap-1 mb-4">
                    <span className="font-bold text-lg text-neutral-900 mt-1">R$</span>
                    <span className="font-black text-3xl sm:text-4xl text-[#0b1a30] tracking-tighter leading-none">297<span className="text-xl sm:text-2xl">,75</span></span>
                  </div>
                  <div className="bg-[#eafdf0] text-[#00a83e] font-bold text-xs uppercase px-4 py-1.5 rounded-full mt-auto">
                    25% OFF
                  </div>
                </div>
              </div>
            </div>

            {/* ACIMA DE 10 VENDEDORES */}
            <div className="bg-white border-[3px] border-[#00a83e] rounded-[32px] p-6 sm:p-8 flex flex-col relative w-full pt-12 shadow-[0_16px_50px_rgba(0,168,62,0.06)]">
              {/* Floating Badge */}
              <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-[#eafdf0] border-[3px] border-[#00a83e] text-[#00a83e] w-14 h-14 rounded-2xl flex items-center justify-center shadow-sm">
                <Users className="w-7 h-7" />
              </div>
              
              <h3 className="text-center font-black text-xl text-[#00a83e] uppercase tracking-tighter mb-8">
                ACIMA DE 10 VENDEDORES
              </h3>

              <div className="grid grid-cols-2 gap-4">
                {/* Mensal */}
                <div className="bg-white border border-neutral-100 shadow-sm rounded-[24px] p-5 flex flex-col items-center">
                  <div className="w-12 h-12 rounded-full bg-[#eafdf0] text-[#00a83e] flex items-center justify-center mb-3">
                    <CalendarDays className="w-6 h-6" />
                  </div>
                  <span className="font-bold text-neutral-900 text-sm mb-2">Mensal</span>
                  <div className="flex items-baseline gap-1 mb-4">
                    <span className="font-bold text-lg text-neutral-900 mt-1">R$</span>
                    <span className="font-black text-3xl sm:text-4xl text-[#0b1a30] tracking-tighter leading-none">297<span className="text-xl sm:text-2xl">,75</span></span>
                  </div>
                  <div className="bg-[#eafdf0] text-[#00a83e] font-bold text-xs uppercase px-4 py-1.5 rounded-full mt-auto">
                    25% OFF
                  </div>
                </div>

                {/* Semestral */}
                <div className="bg-white border border-neutral-100 shadow-sm rounded-[24px] p-5 flex flex-col items-center">
                  <div className="w-12 h-12 rounded-full bg-[#eafdf0] text-[#00a83e] flex items-center justify-center mb-3">
                    <CalendarDays className="w-6 h-6" />
                  </div>
                  <span className="font-bold text-neutral-900 text-sm mb-2">Semestral</span>
                  <div className="flex items-baseline gap-1 mb-4">
                    <span className="font-bold text-lg text-neutral-900 mt-1">R$</span>
                    <span className="font-black text-3xl sm:text-4xl text-[#0b1a30] tracking-tighter leading-none">258<span className="text-xl sm:text-2xl">,05</span></span>
                  </div>
                  <div className="bg-[#eafdf0] text-[#00a83e] font-bold text-xs uppercase px-4 py-1.5 rounded-full mt-auto">
                    35% OFF
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex justify-center mt-12 pb-8">
            <Link 
              to="/checkout"
              className="inline-flex items-center gap-3 bg-[#00a83e] hover:bg-[#009035] text-white px-8 sm:px-10 py-4 sm:py-4.5 rounded-2xl font-black text-sm sm:text-[15px] tracking-widest uppercase transition-all shadow-[0_8px_25px_rgba(0,168,62,0.3)] hover:-translate-y-1"
            >
              <Rocket className="w-6 h-6" />
              ASSINAR AGORA
            </Link>
          </div>
        </div>

        {/* Soft elegant gradient transition divider */}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#00a83e]/30 via-[#0070f3]/25 via-transparent to-transparent z-10" />
        <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-gradient-to-r from-transparent via-[#00a83e]/10 via-[#0070f3]/10 to-transparent z-10 blur-[2px] opacity-85" />
      </section>

      {/* DESIGNED THIRD FOLD: WHY THE TRADITIONAL TRAINING IS BECOMING OBSOLETE */}
      <section className="bg-gradient-to-b from-white via-white to-white py-20 sm:py-24 relative overflow-hidden" id="problema">
        {/* Subtle decorative dot grid background matching the mockup's neatness */}
        <div className="absolute inset-0 opacity-[0.02] pointer-events-none bg-[radial-gradient(#00a83e_1px,transparent_1px)] [background-size:24px_24px] z-0"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          
          {/* Heading with superb contrast */}
          <div className="text-center max-w-4xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-[42px] font-sans font-black text-[#0c1f22] tracking-tighter leading-[1.1] uppercase">
              POR QUE O MODELO <br className="hidden sm:inline" />
              TRADICIONAL ESTÁ FICANDO OBSOLETO?
            </h2>
          </div>

          {/* Magical Bento Card Grid Integration */}
          <MagicBento 
            textAutoHide={false}
            enableStars={true}
            enableSpotlight={true}
            enableBorderGlow={true}
            enableTilt={false}
            enableMagnetism={false}
            clickEffect={true}
            spotlightRadius={350}
            particleCount={14}
            glowColor="0, 168, 62"
          />

        </div>
        {/* Soft elegant gradient transition divider */}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#00a83e]/30 via-[#0070f3]/25 via-transparent to-transparent z-10" />
        <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-gradient-to-r from-transparent via-[#00a83e]/10 via-[#0070f3]/10 to-transparent z-10 blur-[2px] opacity-85" />
      </section>

      {/* NEW THIRD FOLD: THE COST OF THE STATUS QUO (BASED ON ATTACHMENT DIAGNOSTICS) */}
      <section className="bg-gradient-to-b from-white via-neutral-50/10 to-neutral-50 py-20 sm:py-24 relative overflow-hidden" id="custo-status-quo">
        {/* Abstract background decorative architecture */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[radial-gradient(#00a83e_1px,transparent_1px)] [background-size:24px_24px] z-0"></div>
        <div className="absolute top-1/4 right-0 w-[500px] h-[500px] pointer-events-none -z-10 bg-[radial-gradient(circle_at_center,rgba(240,253,244,0.4)_0%,transparent_70%)]"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 flex flex-col items-center">
          
          {/* Heavy architectural Heading */}
          <h2 className="text-3xl sm:text-4xl lg:text-[42px] font-sans font-black text-[#0c1f22] tracking-tighter leading-tight uppercase mb-4 text-center max-w-5xl">
            QUAL O CUSTO DE CONTINUAR COM UM MODELO QUE NÃO ENTREGA MAIS?
          </h2>
          
          {/* Heavy green line accents */}
          <div className="flex justify-center gap-1.5 mb-12">
            <div className="w-16 h-1.5 bg-[#00a83e] rounded-full"></div>
            <div className="w-4 h-1.5 bg-[#00a83e]/60 rounded-full"></div>
            <div className="w-2.5 h-1.5 bg-[#00a83e]/30 rounded-full"></div>
          </div>

          {/* Grid of 6 Invisible Costs - Centered & proportional, styled beautifully */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 w-full mt-4">
            
            {/* Card 1: Margens Perdidas */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.05 }}
              whileHover={{ y: -6, transition: { duration: 0.2 } }}
              className="bg-white border-2 border-neutral-100 rounded-3xl p-6 sm:p-7 flex flex-col justify-between shadow-[0_4px_20px_rgba(0,0,0,0.015)] hover:shadow-xl hover:border-[#00a83e]/20 transition-all duration-300 text-left relative overflow-hidden group"
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-[#00a83e]/5 to-transparent rounded-bl-full pointer-events-none transition-all group-hover:scale-110" />
              
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[10px] sm:text-[10.5px] uppercase font-sans font-black tracking-widest text-[#00a83e] bg-[#e8f5e9] border border-[#00a83e]/10 px-3 py-1 rounded-full select-none">
                    Custo Invisível 01
                  </span>
                  <div className="w-10 h-10 rounded-xl bg-[#e8f5e9]/40 border border-[#00a83e]/10 flex items-center justify-center text-[#00a83e]">
                    <Coins className="w-5 h-5" />
                  </div>
                </div>
                
                <h4 className="text-[#0c1f22] font-sans font-black text-base sm:text-lg tracking-tight mb-2">
                  Margens Perdidas
                </h4>
                
                <p className="text-[12px] sm:text-[13px] text-neutral-500 font-sans font-medium leading-relaxed">
                  Sem avanço nas negociações, descontos são dados para não perder a venda.
                </p>
              </div>
            </motion.div>

            {/* Card 2: Retrabalho de Propostas */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              whileHover={{ y: -6, transition: { duration: 0.2 } }}
              className="bg-white border-2 border-neutral-100 rounded-3xl p-6 sm:p-7 flex flex-col justify-between shadow-[0_4px_20px_rgba(0,0,0,0.015)] hover:shadow-xl hover:border-[#00a83e]/20 transition-all duration-300 text-left relative overflow-hidden group"
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-[#00a83e]/5 to-transparent rounded-bl-full pointer-events-none transition-all group-hover:scale-110" />
              
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[10px] sm:text-[10.5px] uppercase font-sans font-black tracking-widest text-[#00a83e] bg-[#e8f5e9] border border-[#00a83e]/10 px-3 py-1 rounded-full select-none">
                    Custo Invisível 02
                  </span>
                  <div className="w-10 h-10 rounded-xl bg-[#e8f5e9]/40 border border-[#00a83e]/10 flex items-center justify-center text-[#00a83e]">
                    <FileSpreadsheet className="w-5 h-5" />
                  </div>
                </div>
                
                <h4 className="text-[#0c1f22] font-sans font-black text-base sm:text-lg tracking-tight mb-2">
                  Retrabalho de Propostas
                </h4>
                
                <p className="text-[12px] sm:text-[13px] text-neutral-500 font-sans font-medium leading-relaxed">
                  Propostas comerciais mal formatadas e sem padrão exigem correções e aprovações infinitas.
                </p>
              </div>
            </motion.div>

            {/* Card 3: Turnover Comercial */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.15 }}
              whileHover={{ y: -6, transition: { duration: 0.2 } }}
              className="bg-white border-2 border-neutral-100 rounded-3xl p-6 sm:p-7 flex flex-col justify-between shadow-[0_4px_20px_rgba(0,0,0,0.015)] hover:shadow-xl hover:border-[#00a83e]/20 transition-all duration-300 text-left relative overflow-hidden group"
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-[#00a83e]/5 to-transparent rounded-bl-full pointer-events-none transition-all group-hover:scale-110" />
              
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[10px] sm:text-[10.5px] uppercase font-sans font-black tracking-widest text-[#00a83e] bg-[#e8f5e9] border border-[#00a83e]/10 px-3 py-1 rounded-full select-none">
                    Custo Invisível 03
                  </span>
                  <div className="w-10 h-10 rounded-xl bg-[#e8f5e9]/40 border border-[#00a83e]/10 flex items-center justify-center text-[#00a83e]">
                    <UserX className="w-5 h-5" />
                  </div>
                </div>
                
                <h4 className="text-[#0c1f22] font-sans font-black text-base sm:text-lg tracking-tight mb-2">
                  Turnover Comercial
                </h4>
                
                <p className="text-[12px] sm:text-[13px] text-neutral-500 font-sans font-medium leading-relaxed">
                  Vendedores desmotivados, sem clareza para quebrar objeções, pedem demissão rapidamente.
                </p>
              </div>
            </motion.div>

            {/* Card 4: Liderança Sobrecarregada */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              whileHover={{ y: -6, transition: { duration: 0.2 } }}
              className="bg-white border-2 border-neutral-100 rounded-3xl p-6 sm:p-7 flex flex-col justify-between shadow-[0_4px_20px_rgba(0,0,0,0.015)] hover:shadow-xl hover:border-[#00a83e]/20 transition-all duration-300 text-left relative overflow-hidden group"
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-[#00a83e]/5 to-transparent rounded-bl-full pointer-events-none transition-all group-hover:scale-110" />
              
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[10px] sm:text-[10.5px] uppercase font-sans font-black tracking-widest text-[#00a83e] bg-[#e8f5e9] border border-[#00a83e]/10 px-3 py-1 rounded-full select-none">
                    Custo Invisível 04
                  </span>
                  <div className="w-10 h-10 rounded-xl bg-[#e8f5e9]/40 border border-[#00a83e]/10 flex items-center justify-center text-[#00a83e]">
                    <AlertTriangle className="w-5 h-5" />
                  </div>
                </div>
                
                <h4 className="text-[#0c1f22] font-sans font-black text-base sm:text-lg tracking-tight mb-2">
                  Liderança Sobrecarregada
                </h4>
                
                <p className="text-[12px] sm:text-[13px] text-neutral-500 font-sans font-medium leading-relaxed">
                  Gestores passam o dia apagando incêndios operacionais e resolvendo gargalos de propostas.
                </p>
              </div>
            </motion.div>

            {/* Card 5: Crescimento Estagnado */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.25 }}
              whileHover={{ y: -6, transition: { duration: 0.2 } }}
              className="bg-white border-2 border-neutral-100 rounded-3xl p-6 sm:p-7 flex flex-col justify-between shadow-[0_4px_20px_rgba(0,0,0,0.015)] hover:shadow-xl hover:border-[#00a83e]/20 transition-all duration-300 text-left relative overflow-hidden group"
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-[#00a83e]/5 to-transparent rounded-bl-full pointer-events-none transition-all group-hover:scale-110" />
              
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[10px] sm:text-[10.5px] uppercase font-sans font-black tracking-widest text-[#00a83e] bg-[#e8f5e9] border border-[#00a83e]/10 px-3 py-1 rounded-full select-none">
                    Custo Invisível 05
                  </span>
                  <div className="w-10 h-10 rounded-xl bg-[#e8f5e9]/40 border border-[#00a83e]/10 flex items-center justify-center text-[#00a83e]">
                    <TrendingDown className="w-5 h-5" />
                  </div>
                </div>
                
                <h4 className="text-[#0c1f22] font-sans font-black text-base sm:text-lg tracking-tight mb-2">
                  Crescimento Estagnado
                </h4>
                
                <p className="text-[12px] sm:text-[13px] text-neutral-500 font-sans font-medium leading-relaxed">
                  Perda de tração nas novas contas devido à incapacidade em quebrar objeções comerciais difíceis.
                </p>
              </div>
            </motion.div>

            {/* Card 6: Vendas Perdidas */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
              whileHover={{ y: -6, transition: { duration: 0.2 } }}
              className="bg-white border-2 border-neutral-100 rounded-3xl p-6 sm:p-7 flex flex-col justify-between shadow-[0_4px_20px_rgba(0,0,0,0.015)] hover:shadow-xl hover:border-[#00a83e]/20 transition-all duration-300 text-left relative overflow-hidden group"
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-[#00a83e]/5 to-transparent rounded-bl-full pointer-events-none transition-all group-hover:scale-110" />
              
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[10px] sm:text-[10.5px] uppercase font-sans font-black tracking-widest text-[#00a83e] bg-[#e8f5e9] border border-[#00a83e]/10 px-3 py-1 rounded-full select-none">
                    Custo Invisível 06
                  </span>
                  <div className="w-10 h-10 rounded-xl bg-[#e8f5e9]/40 border border-[#00a83e]/10 flex items-center justify-center text-[#00a83e]">
                    <AlertOctagon className="w-5 h-5" />
                  </div>
                </div>
                
                <h4 className="text-[#0c1f22] font-sans font-black text-base sm:text-lg tracking-tight mb-2">
                  Vendas Perdidas
                </h4>
                
                <p className="text-[12px] sm:text-[13px] text-neutral-500 font-sans font-medium leading-relaxed">
                  Falta de agilidade e resposta técnica convincente faz o produtor assinar com o concorrente.
                </p>
              </div>
            </motion.div>

          </div>

          {/* CTA Button */}
          <div className="flex justify-center mt-12 relative z-20">
            <a 
              href="#planos" 
              className="inline-flex items-center gap-3 bg-[#00a83e] hover:bg-[#009035] text-white px-8 py-4.5 rounded-xl font-extrabold text-sm tracking-widest uppercase transition-all shadow-md shadow-[#00a83e]/20 hover:scale-[1.01] active:scale-[0.99]"
            >
              <MessageCircle className="w-5 h-5 text-current" />
              Quero ter acesso
            </a>
          </div>

        </div>
        {/* Soft elegant gradient transition divider */}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#0070f3]/30 via-[#00a83e]/25 via-transparent to-transparent z-10" />
        <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-gradient-to-r from-transparent via-[#0070f3]/10 via-[#00a83e]/10 to-transparent z-10 blur-[2px] opacity-85" />
      </section>

      <FAQ />

      {/* FOOTER COOPERATIVE INFO DECLARED */}
      <footer className="bg-agro-deep border-t border-white/5 py-16 text-sm text-gray-500" id="main_footer">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 pb-12 border-b border-white/5 text-left">
            
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-5 h-5 text-agro-accent" />
                <span className="font-sans font-extrabold text-2xl tracking-tight text-white uppercase select-none">
                  Ceruti
                </span>
              </div>
              <p className="text-xs text-gray-400 leading-relaxed font-sans font-medium">
                A inteligência de vendas criada exclusivamente para potencializar o treinamento de equipes comerciais e aumentar o fechamento de negócios.
              </p>
            </div>

            <div className="space-y-3 font-sans">
              <h5 className="font-bold text-white text-xs mb-1 font-mono uppercase tracking-wider">Segurança & Termos</h5>
              <p className="text-xs text-gray-400 leading-relaxed font-medium">
                Sua operação comercial protegida. Processamento seguro de dados em total conformidade com a LGPD e criptografia integrada com APIs oficiais do WhatsApp.
              </p>
            </div>

          </div>

          <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs space-y-4 sm:space-y-0">
            <p className="text-[11px] text-gray-600 font-mono">
              © 2026 Ceruti. Todos os direitos reservados. Desenvolvido para o agronegócio brasileiro de alta performance.
            </p>
            <div className="flex flex-wrap items-center justify-center sm:justify-end gap-x-6 gap-y-3 font-medium text-gray-400">
              <a href="#quem-treinar" className="hover:text-white transition-colors">Para quem é</a>
              <a href="#como-funciona" className="hover:text-white transition-colors">Como funciona</a>
              <a href="#resultados" className="hover:text-white transition-colors">Resultados</a>
              <a href="#beneficios" className="hover:text-white transition-colors">Benefícios</a>
              <span className="text-white/10 hidden lg:inline">|</span>
              <a href="#top_container" className="text-gray-600 hover:text-white transition-colors font-semibold">Voltar para o Topo</a>
            </div>
          </div>

        </div>
      </footer>

      {/* Floating WhatsApp Button */}
      <a
        href="https://wa.me/5567981246558?text=Olá! Gostaria de saber mais sobre o Ceruti."
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-50 flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-[#25D366] text-white shadow-[0_8px_30px_rgba(37,211,102,0.4)] hover:bg-[#20ba5c] hover:scale-110 hover:shadow-[0_12px_40px_rgba(37,211,102,0.6)] active:scale-95 transition-all duration-300 group border-2 border-white/90"
        aria-label="Fale conosco no WhatsApp"
        id="whatsapp_floating_button"
      >
        {/* Pulsing glow underlay */}
        <div className="absolute inset-0 rounded-full bg-[#25D366]/30 animate-pulse pointer-events-none -z-10 group-hover:scale-115 transition-transform duration-300" />
        <div className="absolute inset-0 rounded-full bg-[#25D366]/20 animate-ping pointer-events-none -z-10" />

        <svg 
          className="w-8 h-8 sm:w-9 sm:h-9 fill-current stroke-none drop-shadow-sm select-none" 
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M17.472 14.382c-.022-.015-.029-.02-.054-.051l-.105-.125c-.27-.324-1.79-1.082-1.79-1.082s-.225-.138-.415.111l-.475.63s-.167.228-.432.115c-.266-.113-.99-.44-1.85-1.205-.666-.595-1.116-1.332-1.246-1.56-.13-.227-.014-.35.101-.462l.307-.36s.1-.15.004-.298c-.097-.15-1.015-2.45-1.015-2.45s-.125-.335-.41-.318c-.287.017-.822.422-1.137.77-.314.347-.565.807-.533 1.393.07 1.314.614 2.502 1.488 3.518.874 1.015 1.956 1.83 3.12 2.38 1.127.531 2.155.805 2.873.744.757-.064 1.348-.38 1.66-.75.312-.371.492-.852.492-.852s.06-.182-.016-.27-.268-.14-.268-.14zm-5.466 7.424h-.01c-1.875 0-3.71-.493-5.32-1.425l-.382-.22-3.955 1.038 1.056-3.855-.24-.383A9.761 9.761 0 011.82 12c0-5.411 4.417-9.82 9.851-9.82a9.774 9.774 0 016.968 2.878c1.859 1.861 2.883 4.34 2.88 6.945C21.516 17.411 17.1 21.82 11.666 21.82zM12 0C5.373 0 0 5.372 0 12c0 2.11.547 4.16 1.59 5.973L0 24l6.216-1.63C7.94 23.36 9.94 24 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0z"/>
        </svg>
        
        {/* Help text on hover (Desktops) */}
        <span className="absolute right-18 sm:right-20 scale-0 bg-neutral-950 text-white font-sans text-xs font-semibold px-3 py-1.5 rounded-lg shadow-md transition-all duration-200 group-hover:scale-100 whitespace-nowrap shadow-black/20">
          Chamar no WhatsApp
        </span>
      </a>
    </div>
  );
}
