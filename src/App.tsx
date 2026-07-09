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
  ShieldCheck,
  Play,
  CheckCheck,
  Mic,
  Phone,
  Video,
  MoreVertical,
  Zap,
  Brain
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Link } from 'react-router-dom';
import { Aurora } from './components/Aurora';
import { MagicBento } from './components/MagicBento';
import ScrollStack, { ScrollStackItem } from './components/ScrollStack';

import { VideoEmbed } from './components/VideoEmbed';
import { FAQ } from './components/FAQ';
import AnimatedList from './components/AnimatedList';
import { WhatsAppWidget } from './components/WhatsAppWidget';
import { HanaAvatar, CerutiAvatar } from './components/HanaAvatar';

export default function App() {
  // Mobile menu toggle
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<'consultor' | 'campo'>('consultor');

  return (
    <div className="bg-agro-deep text-gray-100 min-h-screen font-sans selection:bg-agro-green selection:text-agro-deep theme-natural-tones w-full overflow-x-clip relative" id="top_container">
      
      {/* Background ambient light effects */}
      <div className="absolute top-0 left-1/4 w-96 h-96 pointer-events-none animate-pulse-glow bg-[radial-gradient(circle_at_center,rgba(0,168,62,0.1)_0%,transparent_70%)]" />
      <div className="absolute top-1/2 right-1/4 w-96 h-96 pointer-events-none bg-[radial-gradient(circle_at_center,rgba(5,150,105,0.05)_0%,transparent_70%)]" />
      <div className="absolute bottom-1/4 left-1/3 w-80 h-80 pointer-events-none bg-[radial-gradient(circle_at_center,rgba(34,197,94,0.05)_0%,transparent_70%)]" />

      {/* HEADER / NAVIGATION BAR */}
      <header className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-white/85 border-b border-neutral-200/50" id="nav_header">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center">
            <img 
              id="header_logo"
              src="/LETRA ESCURA - FUNDO TRANS - HOR.png" 
              alt="Ceruti" 
              className="h-11 md:h-12 w-auto object-contain" 
              referrerPolicy="no-referrer"
            />
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8 text-sm font-semibold text-neutral-600">
            <a href="#dois-modelos" className="hover:text-black transition-colors">Os dois modelos</a>
            <a href="#resultados" className="hover:text-black transition-colors">Resultados práticos</a>
            <a href="#depoimentos" className="hover:text-black transition-colors">Depoimentos</a>
          </nav>

          <div className="hidden md:flex items-center">
            <a 
              href="#planos" 
              className="bg-gradient-to-r from-[#004d1a] via-[#00a83e] to-[#00c853] hover:from-[#006020] hover:via-[#00b944] hover:to-[#05d95b] text-white font-extrabold text-xs tracking-wider uppercase px-5 py-2.5 rounded-lg transition-all duration-300 shadow-md shadow-emerald-950/20 hover:shadow-emerald-600/30 active:scale-98 border-b-2 border-[#003813]"
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
                href="#dois-modelos" 
                onClick={() => setMobileMenuOpen(false)}
                className="block text-neutral-700 hover:text-[#00a83e] text-base py-1 font-medium"
              >
                Os dois modelos
              </a>
              <a 
                href="#resultados" 
                onClick={() => setMobileMenuOpen(false)}
                className="block text-neutral-700 hover:text-[#00a83e] text-base py-1 font-medium"
              >
                Resultados práticos
              </a>
              <a 
                href="#depoimentos" 
                onClick={() => setMobileMenuOpen(false)}
                className="block text-neutral-700 hover:text-[#00a83e] text-base py-1 font-medium"
              >
                Depoimentos
              </a>
              <div className="pt-4 border-t border-neutral-100">
                <a 
                  href="#planos"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block w-full text-center bg-gradient-to-r from-[#004d1a] via-[#00a83e] to-[#00c853] text-white py-2.5 rounded-lg font-extrabold text-xs tracking-wider uppercase transition-all duration-300 shadow-md shadow-emerald-950/20 border-b-2 border-[#003813]"
                >
                  Quero ter acesso
                </a>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* HERO SECTION / VALUATION HOOK */}
      <section className="relative pt-28 pb-14 md:pt-36 md:pb-24 overflow-hidden bg-[#FAF9F6]" id="hero_section">
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

              <h1 className="order-1 text-3xl sm:text-4xl lg:text-[44px] font-sans font-black text-neutral-900 leading-[1.2] sm:leading-[1.15] lg:leading-[1.1] tracking-tight sm:tracking-tighter lg:tracking-tighter pl-[1px]">
                Agente de <span className="text-[#00a83e]">IA</span> que treina seus vendedores <span className="text-[#00a83e]">24/7</span> e libera seus gestores para o que realmente <span className="text-[#00a83e]">importa</span>
              </h1>



              {/* Action Button CTA */}
              <div className="order-4 lg:order-3 pt-0.5">
                <a 
                  href="#planos" 
                  className="inline-flex items-center gap-3 bg-gradient-to-r from-[#004d1a] via-[#00a83e] to-[#00c853] hover:from-[#006020] hover:via-[#00b944] hover:to-[#05d95b] text-white px-8 py-4.5 rounded-xl font-extrabold text-sm tracking-widest uppercase transition-all shadow-lg shadow-emerald-950/25 hover:shadow-emerald-600/35 hover:scale-[1.01] active:scale-[0.99] border-b-[3px] border-[#003813]"
                >
                  <MessageCircle className="w-5 h-5 text-current" />
                  Quero ter acesso
                </a>
              </div>

              {/* Highlight Pillars (Clock, Bullseye, Increase Arrow) */}
              <div className="order-3 lg:order-4 grid grid-cols-1 md:grid-cols-3 gap-4.5 pt-5 sm:pt-6 border-t border-neutral-200 text-left max-w-2xl mb-[2px] mr-0 w-full">
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

            {/* Right Column: Premium 3D Phone Chassis with Popout Messages */}
            <div className="lg:col-span-6 flex flex-col justify-center items-center relative">
              
              {/* Resizing / Scaling Container to fit beautifully on any screen size */}
              <div className="relative w-full max-w-[440px] sm:max-w-[500px] h-[680px] flex items-center justify-center scale-[0.93] min-[380px]:scale-[0.97] min-[440px]:scale-[1.02] sm:scale-100 md:scale-[1.06] origin-center select-none pointer-events-none">
                
                {/* 3D Slanted/Rotated Container (Straightened & Centered as requested) */}
                <div 
                  style={{ 
                    transform: 'perspective(1600px) rotateY(0deg) rotateX(0deg) rotateZ(0deg)', 
                    transformStyle: 'preserve-3d' 
                  }}
                  className="relative w-full max-w-[315px] sm:max-w-[348px] h-[645px]"
                >
                             {/* 1. Glossy 3D Translucent WhatsApp Logo */}
                  <div 
                    style={{ transform: 'translateZ(90px)', transformStyle: 'preserve-3d' }}
                    className="absolute -top-3 -right-6 sm:-right-10 w-22 h-22 sm:w-26 sm:h-26 z-30 pointer-events-none"
                  >
                    <motion.div
                       animate={{ y: [0, -8, 0], rotate: [2, -2, 2] }}
                       transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                       className="w-full h-full rounded-2xl bg-gradient-to-tr from-[#128c7e] via-[#25d366] to-[#4af48e] p-[2.5px] relative flex items-center justify-center overflow-hidden drop-shadow-[0_15px_30px_rgba(37,211,102,0.45)]"
                    >
                       <div className="absolute inset-0 bg-gradient-to-b from-white/25 to-transparent rounded-2xl z-10" />
                       <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.35),transparent)] rounded-2xl z-10" />
                       <svg className="w-11 h-11 sm:w-13 sm:h-13 text-white fill-current relative z-20 drop-shadow-md" viewBox="0 0 24 24">
                         <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.993c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.746.953 3.71 1.454 5.709 1.455h.008c6.56 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                       </svg>
                    </motion.div>
                  </div>
 
                   {/* 2. Premium iPhone Metallic Chassis */}
                   <div 
                      style={{ transform: 'translateZ(10px)' }}
                      className="absolute inset-0 bg-neutral-950 rounded-[52px] p-2.5 shadow-[0_28px_60px_-15px_rgba(0,0,0,0.5),_0_0_40px_rgba(37,211,102,0.12)] border-[5.5px] border-black ring-[1.5px] ring-neutral-900/80 flex flex-col"
                    >
                      {/* Physical buttons deco with high-end polished styling */}
                      <div className="absolute left-[-5px] top-[105px] w-[5px] h-[35px] bg-gradient-to-r from-neutral-500 to-neutral-800 rounded-l shadow-sm border-r border-neutral-600" />
                      <div className="absolute left-[-5px] top-[150px] w-[5px] h-[45px] bg-gradient-to-r from-neutral-500 to-neutral-800 rounded-l shadow-sm border-r border-neutral-600" />
                      <div className="absolute left-[-5px] top-[205px] w-[5px] h-[45px] bg-gradient-to-r from-neutral-500 to-neutral-800 rounded-l shadow-sm border-r border-neutral-600" />
                      <div className="absolute right-[-5px] top-[135px] w-[5px] h-[65px] bg-gradient-to-l from-neutral-500 to-neutral-800 rounded-r shadow-sm border-l border-neutral-600" />
 
                      {/* Dynamic Island / Notch עם Lens Highlight */}
                      <div className="absolute left-1/2 -translate-x-1/2 top-4.5 w-26 h-5 bg-black rounded-full flex items-center justify-between px-3.5 z-30 shadow-[inset_0_1.5px_3px_rgba(255,255,255,0.15),_0_1.5px_1.5px_rgba(0,0,0,0.4)]">
                        <div className="w-2.5 h-2.5 bg-[#080a15] rounded-full border border-neutral-900 flex items-center justify-center">
                          <div className="w-1 h-1 bg-indigo-950/70 rounded-full opacity-70" />
                        </div>
                        <div className="w-3.5 h-1 bg-neutral-950 rounded-full" />
                      </div>
 
                      {/* Screen Envelope */}
                      <div className="relative w-full h-full overflow-hidden bg-[#e5ddd5] rounded-[42px] flex flex-col select-none border border-black/25 shadow-inner">
                        
                        {/* High-fidelity Glass Glare Reflection Overlay */}
                        <div 
                          className="absolute inset-0 pointer-events-none z-15 opacity-[0.22] mix-blend-overlay"
                          style={{
                            background: 'linear-gradient(135deg, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0.1) 28%, rgba(255,255,255,0) 29%, rgba(255,255,255,0) 100%)'
                          }}
                        />
                        
                        {/* Subtle inner bezel reflection highlight */}
                        <div className="absolute inset-[0.5px] rounded-[42px] border border-white/5 pointer-events-none z-15" />

                        {/* WhatsApp Wallpaper texture overlay */}
                        <div 
                          className="absolute inset-0 opacity-[0.24] pointer-events-none z-0"
                          style={{ 
                            backgroundImage: "url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png')",
                            backgroundRepeat: 'repeat',
                            backgroundSize: '110px',
                          }}
                        />
 
                        {/* Inner Status Bar */}
                        <div className="relative z-10 w-full h-9 px-5 pt-3.5 flex justify-between items-center text-neutral-800 text-[10px] font-sans font-extrabold leading-none select-none">
                          <span>11:30</span>
                          <div className="flex items-center space-x-1.5 pt-0.5">
                            {/* Network signals */}
                            <svg className="w-3.5 h-3.5 fill-current text-neutral-800" viewBox="0 0 24 24">
                              <path d="M2 22h3v-3H2v3zm4 0h3v-6H6v6zm4 0h3v-10h-3v10zm4 0h3v-15h-3v15zm4 0h3V2h-3v20z" />
                            </svg>
                            {/* Wave */}
                            <svg className="w-3.5 h-3.5 stroke-current text-neutral-800 fill-none stroke-[2.5]" viewBox="0 0 24 24">
                              <path d="M5 12.55a11 11 0 0 1 14.08 0" />
                              <path d="M8.53 16.1a6 6 0 0 1 6.95 0" />
                            </svg>
                            {/* Battery outline */}
                            <div className="w-5 h-2.2 border-[1.2px] border-neutral-800 rounded-sm p-[1px] flex items-center">
                              <div className="bg-[#00a83e] h-full w-[85%] rounded-[0.5px]" />
                            </div>
                          </div>
                        </div>
 
                        {/* Inner WhatsApp Header */}
                        <div className="relative z-10 bg-[#008069] px-3.5 py-2.5 flex items-center justify-between shadow-sm shrink-0 text-white">
                          <div className="flex items-center space-x-2.5">
                            <div className="relative">
                              <div className="w-8.5 h-8.5 rounded-full overflow-hidden bg-white/10 flex items-center justify-center border border-white/20 shadow-sm">
                                <CerutiAvatar className="w-full h-full" />
                              </div>
                              <span className="absolute bottom-0 right-0 w-2 h-2 bg-emerald-400 border border-[#008069] rounded-full animate-pulse" />
                            </div>
                            <div className="text-left font-sans">
                              <h3 className="font-bold text-[14px] text-white force-white leading-tight">
                                Agente Ceruti
                              </h3>
                              <p className="text-[10px] text-[#e2f0ee] force-white font-medium leading-none mt-1">online</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-3 text-white/80 force-white">
                            <Phone className="w-4 h-4 cursor-context-menu hover:text-white force-white" />
                            <Video className="w-4 h-4 cursor-context-menu hover:text-white force-white" />
                            <MoreVertical className="w-4 h-4 cursor-context-menu hover:text-white force-white" />
                          </div>
                        </div>
 
                        {/* Spacer for screen list (This portion is blurred out because active cards pop OUT above it) */}
                        <div className="flex-1" />
 
                        {/* WhatsApp Styled Footer send-message control */}
                        <div className="relative z-10 bg-[#fafafa]/90 backdrop-blur-sm p-3 flex items-center justify-between gap-2.5 border-t border-neutral-200/40 pb-5">
                          <div className="bg-white border border-neutral-200 text-[10.5px] px-3.5 py-2 rounded-full flex-1 text-neutral-400 text-left shadow-inner truncate">
                            Aguardando retorno prático...
                          </div>
                          <div className="w-7.5 h-7.5 rounded-full bg-[#00a83e] flex items-center justify-center text-white shadow-sm shrink-0">
                            <svg className="w-3.5 h-3.5 rotate-[45deg]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                              <line x1="22" y1="2" x2="11" y2="13" />
                              <polygon points="22 2 15 22 11 13 2 9 22 2" />
                            </svg>
                          </div>
                        </div>

                      </div>
                    </div>

                                                            {/* 3. The 3D Popouts: 5 Gorgeous Speech Bubbles positioned in a dynamic flex layout inside the WhatsApp chat area */}
                    <div 
                      style={{ 
                        transform: 'translateZ(115px)',
                        transformStyle: 'preserve-3d'
                      }}
                      className="absolute top-[115px] bottom-[85px] left-[16px] right-[16px] flex flex-col justify-center gap-3 sm:gap-4 z-20 pointer-events-auto"
                    >
                      
                      {/* Message 1: Usuário Audio 1 */}
                      <div 
                        style={{ transform: 'translateZ(25px) translateX(24px)', transformStyle: 'preserve-3d' }}
                        className="self-end w-[85%] sm:w-[88%] max-w-[220px] sm:max-w-[245px] relative"
                      >
                        <motion.div 
                          animate={{ y: [0, -3, 0] }}
                          transition={{ duration: 4.8, repeat: Infinity, ease: "easeInOut" }}
                          className="bg-[#d9fdd3] text-neutral-850 p-1.5 px-2 rounded-2xl rounded-tr-none shadow-[0_18px_32px_rgba(37,211,102,0.18),_0_6px_12px_rgba(0,0,0,0.12)] border border-[#c1fca9] text-left relative"
                        >
                          {/* pointy right tail */}
                          <div className="absolute top-0 right-[-6px] w-3 h-3 bg-[#d9fdd3] pointer-events-none" style={{ clipPath: 'polygon(0 0, 100% 0, 0 100%)' }} />
                          
                          <div className="flex items-center gap-1.5">
                            {/* Avatar wrapper */}
                            <div className="relative shrink-0">
                              <div 
                                className="w-7 h-7 rounded-full bg-neutral-200/80 border border-white/25 shadow-sm leading-none bg-cover" 
                                style={{ backgroundImage: "url('https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=150&auto=format&fit=crop')" }} 
                              />
                              <div className="absolute right-[-2px] bottom-[-2px] w-3 h-3 bg-emerald-500 rounded-full flex items-center justify-center border border-white shadow-xs">
                                <Mic className="w-1.5 h-1.5 text-white animate-pulse" />
                              </div>
                            </div>
   
                            {/* Audio Player details */}
                            <div className="flex-1 flex flex-col justify-between">
                              <div className="flex items-center gap-1">
                                {/* Play button */}
                                <div className="w-5 h-5 rounded-full bg-neutral-800/5 hover:bg-neutral-800/10 flex items-center justify-center cursor-context-menu">
                                  <Play className="w-2 h-2 text-neutral-700 fill-neutral-700 ml-0.5" />
                                </div>
                                
                                {/* Waves */}
                                <div className="flex-1 flex items-center justify-between h-4 px-0.5 pt-1 select-none">
                                  {[5, 8, 14, 20, 16, 11, 6, 9, 13, 19, 16, 12, 7, 5, 10, 15, 18, 14, 9, 11, 16, 21, 19, 14, 9, 7, 11, 15, 13, 9, 6, 11, 7, 4].map((h, i) => (
                                    <div 
                                      key={i} 
                                      className="w-[2px] rounded-full"
                                      style={{ 
                                        height: `${h * 0.7}px`,
                                        backgroundColor: i < 13 ? '#34b7f1' : '#a1daaa' 
                                      }} 
                                    />
                                  ))}
                                </div>
                              </div>
                              
                              {/* Time and checks */}
                              <div className="flex justify-between items-center mt-0.5 text-[8px] text-[#667781] leading-none select-none">
                                <span className="font-sans font-medium">0:18</span>
                                <div className="flex items-center gap-0.5">
                                  <span>11:30</span>
                                  <CheckCheck className="w-2.5 h-2.5 text-[#34b7f1]" />
                                </div>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      </div>
   
                      {/* Message 2: Ceruti Response 1 */}
                      <div 
                        style={{ transform: 'translateZ(35px) translateX(-24px)', transformStyle: 'preserve-3d' }}
                        className="self-start w-[85%] sm:w-[88%] max-w-[210px] sm:max-w-[235px] relative"
                      >
                        <motion.div 
                          animate={{ y: [0, -3, 0] }}
                          transition={{ duration: 5.2, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                          className="bg-white text-neutral-800 p-2 rounded-2xl rounded-tl-none shadow-[0_20px_35px_rgba(0,0,0,0.14),_0_6px_12px_rgba(0,0,0,0.11)] border border-neutral-100 text-left relative"
                        >
                          {/* pointy left tail */}
                          <div className="absolute top-0 left-[-6px] w-3 h-3 bg-white pointer-events-none" style={{ clipPath: 'polygon(100% 0, 0 0, 100% 100%)' }} />
                          
                          <p className="font-sans font-medium text-[10.5px] sm:text-[11px] leading-snug text-neutral-900 pr-1">
                            Opa, João. Prospecção realmente é complicado... vamos dar um jeito nisso.
                          </p>
                          
                          <div className="text-[7.5px] text-[#667781] text-right mt-0.5 font-sans">
                            11:31
                          </div>
                        </motion.div>
                      </div>
   
                      {/* Message 3: Ceruti Response 2 */}
                      <div 
                        style={{ transform: 'translateZ(30px) translateX(-16px)', transformStyle: 'preserve-3d' }}
                        className="self-start w-[85%] sm:w-[88%] max-w-[210px] sm:max-w-[235px] relative"
                      >
                        <motion.div 
                          animate={{ y: [0, -3, 0] }}
                          transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut", delay: 1.0 }}
                          className="bg-white text-neutral-800 p-2 rounded-2xl rounded-tl-none shadow-[0_18px_32px_rgba(0,0,0,0.13),_0_6px_12px_rgba(0,0,0,0.11)] border border-neutral-100 text-left relative"
                        >
                          {/* pointy left tail */}
                          <div className="absolute top-0 left-[-6px] w-3 h-3 bg-white pointer-events-none" style={{ clipPath: 'polygon(100% 0, 0 0, 100% 100%)' }} />
                          
                          <p className="font-sans font-medium text-[10.5px] sm:text-[11px] leading-snug text-neutral-900 pr-1">
                            Vou te fazer 3 perguntas rápidas, somente para eu entender melhor o cenário
                          </p>
                          
                          <div className="text-[7.5px] text-[#667781] text-right mt-0.5 font-sans">
                            11:32
                          </div>
                        </motion.div>
                      </div>
   
                      {/* Message 4: Ceruti Response 3 (Padronizada) */}
                      <div 
                        style={{ transform: 'translateZ(40px) translateX(-24px)', transformStyle: 'preserve-3d' }}
                        className="self-start w-[85%] sm:w-[88%] max-w-[215px] sm:max-w-[240px] relative"
                      >
                        <motion.div 
                          animate={{ y: [0, -3, 0] }}
                          transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
                          className="bg-white text-neutral-800 p-2 rounded-2xl rounded-tl-none shadow-[0_22px_38px_rgba(0,0,0,0.16),_0_8px_16px_rgba(0,0,0,0.13)] border border-neutral-100 text-left relative"
                        >
                          {/* pointy left tail */}
                          <div className="absolute top-0 left-[-6px] w-3 h-3 bg-white pointer-events-none" style={{ clipPath: 'polygon(100% 0, 0 0, 100% 100%)' }} />
                          
                          <p className="font-sans font-medium text-[10.5px] sm:text-[11px] leading-snug text-neutral-900 pr-1">
                            Primeiro, gostaria de entender melhor quem você está prospectando. Produtor de grande, médio ou pequeno porte? E o que ele planta?
                          </p>
                          
                          <div className="text-[7.5px] text-[#667781] text-right mt-0.5 font-sans">
                            11:32
                          </div>
                        </motion.div>
                      </div>
   
                      {/* Message 5: Usuário Audio 2 */}
                      <div 
                        style={{ transform: 'translateZ(26px) translateX(24px)', transformStyle: 'preserve-3d' }}
                        className="self-end w-[85%] sm:w-[88%] max-w-[220px] sm:max-w-[245px] relative"
                      >
                        <motion.div 
                          animate={{ y: [0, -3, 0] }}
                          transition={{ duration: 5.0, repeat: Infinity, ease: "easeInOut", delay: 2.0 }}
                          className="bg-[#d9fdd3] text-neutral-850 p-1.5 px-2 rounded-2xl rounded-tr-none shadow-[0_18px_32px_rgba(37,211,102,0.18),_0_6px_12px_rgba(0,0,0,0.12)] border border-[#c1fca9] text-left relative"
                        >
                          {/* pointy right tail */}
                          <div className="absolute top-0 right-[-6px] w-3 h-3 bg-[#d9fdd3] pointer-events-none" style={{ clipPath: 'polygon(0 0, 100% 0, 0 100%)' }} />
                          
                          <div className="flex items-center gap-1.5">
                            {/* Avatar wrapper */}
                            <div className="relative shrink-0">
                              <div 
                                className="w-7 h-7 rounded-full bg-neutral-200/80 border border-white/25 shadow-sm leading-none bg-cover" 
                                style={{ backgroundImage: "url('https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=150&auto=format&fit=crop')" }} 
                              />
                              <div className="absolute right-[-2px] bottom-[-2px] w-3 h-3 bg-emerald-500 rounded-full flex items-center justify-center border border-white shadow-xs">
                                <Mic className="w-1.5 h-1.5 text-white active-pulse" />
                              </div>
                            </div>
   
                            {/* Audio Player details */}
                            <div className="flex-1 flex flex-col justify-between">
                              <div className="flex items-center gap-1">
                                {/* Play button */}
                                <div className="w-5 h-5 rounded-full bg-neutral-800/5 hover:bg-neutral-800/10 flex items-center justify-center cursor-context-menu">
                                  <Play className="w-2 h-2 text-neutral-700 fill-neutral-700 ml-0.5" />
                                </div>
                                
                                {/* Waves */}
                                <div className="flex-1 flex items-center justify-between h-4 px-0.5 pt-1 select-none">
                                  {[4, 7, 12, 18, 15, 10, 6, 8, 12, 19, 16, 11, 8, 5, 9, 14, 17, 13, 8, 10, 15, 20, 17, 12, 8, 6, 10, 14, 18, 14, 10, 7, 11, 8, 5, 9, 6, 4].map((h, i) => (
                                    <div 
                                      key={i} 
                                      className="w-[2px] rounded-full"
                                      style={{ 
                                        height: `${h * 0.6}px`,
                                        backgroundColor: i < 25 ? '#34b7f1' : '#a1daaa' 
                                      }} 
                                    />
                                  ))}
                                </div>
                              </div>
                              
                              {/* Time and checks */}
                              <div className="flex justify-between items-center mt-0.5 text-[8px] text-[#667781] leading-none select-none">
                                <span className="font-sans font-medium flex items-center gap-0.5">
                                  <span>0:42</span>
                                  <span className="text-[6px]">⚡ 1.5x</span>
                                </span>
                                <div className="flex items-center gap-0.5">
                                  <span>11:33</span>
                                  <CheckCheck className="w-2.5 h-2.5 text-[#34b7f1]" />
                                </div>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      </div>
                    </div>

                 </div>

                 {/* Simulated Ambient Glow under the 3D element */}
                 <div className="absolute -bottom-10 w-[240px] sm:w-[280px] h-6 bg-[#00a83e]/15 blur-2xl rounded-full z-0 pointer-events-none" />

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

      {/* SECTION: DOIS MODELOS DE AGENTES */}
      <section className="bg-gradient-to-b from-white via-neutral-50/50 to-[#FAF9F6] py-20 sm:py-24 relative overflow-hidden" id="dois-modelos">
        {/* Decorative background grid and elements */}
        <div className="absolute inset-0 opacity-[0.02] pointer-events-none bg-[radial-gradient(#00a83e_1px,transparent_1px)] [background-size:24px_24px] z-0"></div>
        <div className="absolute top-1/4 -right-48 w-96 h-96 pointer-events-none bg-[radial-gradient(circle_at_center,rgba(0,112,243,0.06)_0%,transparent_70%)]" />
        <div className="absolute bottom-1/4 -left-48 w-96 h-96 pointer-events-none bg-[radial-gradient(circle_at_center,rgba(0,168,62,0.06)_0%,transparent_70%)]" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          
          {/* Heading */}
          <div className="text-center max-w-3xl mx-auto mb-16">
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="text-3xl sm:text-4xl lg:text-[44px] font-sans font-black text-[#0b1a30] tracking-tighter leading-[1.08] uppercase"
            >
              Dois Modelos de Agentes
            </motion.h2>
          </div>

          {/* Dual layout container with high contrast cards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
            
            {/* CARD 1: CERUTI CONSULTOR */}
            <motion.div 
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
              whileHover={{ y: -5 }}
              className="relative bg-white border border-neutral-200/60 rounded-[32px] p-8 sm:p-10 shadow-[0_12px_40px_rgba(11,26,48,0.03)] hover:shadow-[0_24px_50px_rgba(11,26,48,0.08)] transition-all duration-300 flex flex-col justify-between group overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-2 h-full bg-[#0070f3] opacity-80" />
              
              <div>
                {/* Header Row */}
                <div className="flex items-center justify-between mb-6">
                  <div className="w-14 h-14 rounded-2xl bg-[#ecf3ff] flex items-center justify-center border border-[#d2e4ff] text-[#0070f3] group-hover:scale-105 transition-transform duration-300 shadow-sm">
                    <Brain className="w-7 h-7" />
                  </div>
                </div>

                <h3 className="text-2xl font-sans font-black text-[#0b1a30] tracking-tight uppercase mb-4">
                  Ceruti Consultor
                </h3>
                
                <p className="text-[#3A4338]/90 text-sm sm:text-base leading-relaxed mb-6 font-medium">
                  O Ceruti Consultor foi criado para situações que exigem mais análise, contexto e construção de estratégia. Ele aprofunda o cenário, faz diagnóstico e entrega um plano prático para destravar negociações mais complexas.
                </p>
              </div>

              {/* Direct Difference Highlight Area */}
              <div className="mt-6 pt-6 border-t border-neutral-100">
                <span className="text-xs font-sans font-black text-neutral-400 uppercase tracking-wider block mb-3">Foco e Diferencial:</span>
                <div className="bg-[#f5f9ff] border border-[#e2efff] rounded-2xl p-4 flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-[#0070f3]/10 flex items-center justify-center shrink-0 mt-0.5">
                    <CheckCheck className="w-3.5 h-3.5 text-[#0070f3]" />
                  </div>
                  <div className="text-xs sm:text-sm text-[#004bb4] font-bold leading-relaxed">
                    Mais profundidade, diagnóstico e plano de ação estruturado.
                  </div>
                </div>
              </div>
            </motion.div>

            {/* CARD 2: CERUTI CAMPO */}
            <motion.div 
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
              whileHover={{ y: -5 }}
              className="relative bg-white border border-neutral-200/60 rounded-[32px] p-8 sm:p-10 shadow-[0_12px_40px_rgba(11,26,48,0.03)] hover:shadow-[0_24px_50px_rgba(0,168,62,0.08)] transition-all duration-300 flex flex-col justify-between group overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-2 h-full bg-[#00a83e] opacity-80" />
              
              <div>
                {/* Header Row */}
                <div className="flex items-center justify-between mb-6">
                  <div className="w-14 h-14 rounded-2xl bg-[#eafdf0] flex items-center justify-center border border-[#cbeed4] text-[#00a83e] group-hover:scale-105 transition-transform duration-300 shadow-sm">
                    <Zap className="w-7 h-7" />
                  </div>
                </div>

                <h3 className="text-2xl font-sans font-black text-[#0b1a30] tracking-tight uppercase mb-4">
                  Ceruti Campo
                </h3>
                
                <p className="text-[#3A4338]/90 text-sm sm:text-base leading-relaxed mb-6 font-medium">
                  O Ceruti Campo foi criado para a rotina da ponta. Ele é mais direto, rápido e objetivo, com respostas imediatas para ajudar o vendedor no dia a dia, no momento em que a dúvida aparece.
                </p>
              </div>

              {/* Direct Difference Highlight Area */}
              <div className="mt-6 pt-6 border-t border-neutral-100">
                <span className="text-xs font-sans font-black text-neutral-400 uppercase tracking-wider block mb-3">Foco e Diferencial:</span>
                <div className="bg-[#f0fdf4] border border-[#d2f4dc] rounded-2xl p-4 flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-[#00a83e]/10 flex items-center justify-center shrink-0 mt-0.5">
                    <CheckCheck className="w-3.5 h-3.5 text-[#00a83e]" />
                  </div>
                  <div className="text-xs sm:text-sm text-[#006b27] font-bold leading-relaxed">
                    Mais agilidade, objetividade e resposta imediata em tempo real.
                  </div>
                </div>
              </div>
            </motion.div>

          </div>



        </div>
        
        {/* Soft elegant gradient transition divider matching other sections */}
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
              COMO FUNCIONA O CERUTI CONSULTOR?
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
                    <h4 className="font-sans font-black text-lg text-[#0c1f22]">Plano de solução</h4>
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
              className="inline-flex items-center gap-3 bg-gradient-to-r from-[#004d1a] via-[#00a83e] to-[#00c853] hover:from-[#006020] hover:via-[#00b944] hover:to-[#05d95b] text-white px-8 py-4.5 rounded-xl font-extrabold text-sm tracking-widest uppercase transition-all shadow-lg shadow-emerald-950/25 hover:shadow-emerald-600/35 hover:scale-[1.01] active:scale-[0.99] border-b-[3px] border-[#003813]"
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

      {/* SECTION: COMO FUNCIONA O CERUTI CAMPO */}
      <section className="bg-gradient-to-b from-[#FAF9F6] via-white to-white py-24 relative overflow-hidden" id="como-funciona-campo">
        {/* Subtle decorative dot grid background for that professional slide feeling */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[radial-gradient(#00a83e_1px,transparent_1px)] [background-size:24px_24px] z-0"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          
          {/* Header styled exactly like the section above */}
          <div className="text-center max-w-3xl mx-auto space-y-5 mb-20">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-sans font-black text-[#0c1f22] tracking-tight uppercase">
              COMO FUNCIONA O CERUTI CAMPO?
            </h2>
            <div className="w-16 h-1.5 bg-[#00a83e] mx-auto rounded-full"></div>
          </div>

          {/* Stepped Timeline Progress Track - Interactive Horizontal on Desktop, Vertical on Mobile */}
          <div className="relative mt-16 max-w-4xl mx-auto">
            
            {/* Horizontal Timeline bar (hidden on mobile) */}
            <div className="hidden lg:block absolute top-[94px] left-[25%] right-[25%] h-[2px] bg-neutral-200/80 z-0">
              <div className="absolute top-0 left-0 h-full w-[100%] bg-gradient-to-r from-[#00a83e] to-[#0070f3] rounded-full"></div>
            </div>

            {/* Steps Container Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 relative z-10 justify-items-center">
              
              {/* STEP 1: ENVIO DA PERGUNTA */}
              <div className="flex flex-col items-center group relative w-full max-w-[280px]">
                <div className="relative bg-white border border-neutral-200/60 rounded-[32px] p-8 text-center flex flex-col items-center shadow-[0_20px_50px_rgba(0,168,62,0.03)] hover:shadow-[0_30px_70px_rgba(0,168,62,0.07)] hover:-translate-y-1.5 transition-all duration-300 w-full min-h-[310px] justify-between border-b-[3px] border-b-[#00a83e]/80">
                  
                  {/* Badge centered on top boundary */}
                  <span className="absolute -top-5 left-1/2 transform -translate-x-1/2 bg-[#00a83e] text-white font-sans font-black w-10 h-10 rounded-full flex items-center justify-center text-base shadow-[0_4px_12px_rgba(0,168,62,0.3)] border-2 border-white">
                    1
                  </span>

                  {/* Icon illustration: green question / speech bubble */}
                  <div className="w-32 h-32 rounded-[24px] bg-[#eefaf2] border border-[#d2f4dc] flex items-center justify-center mt-2 group-hover:scale-105 transition-transform duration-300">
                    <svg className="w-16 h-16 text-[#00a83e]" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <rect x="15" y="25" width="70" height="46" rx="20" fill="white" stroke="#00a83e" strokeWidth="4" />
                      <path d="M35 71L25 83V71H35Z" fill="white" stroke="#00a83e" strokeWidth="4" strokeLinejoin="round" />
                      <path d="M50 35C46 35 44 38 44 41M50 35C54 35 56 38 56 41C56 45 50 46 50 50M50 56V57" stroke="#00a83e" strokeWidth="5.5" strokeLinecap="round" />
                    </svg>
                  </div>

                  {/* Title and details */}
                  <div className="mt-6 space-y-2">
                    <h4 className="font-sans font-black text-lg text-[#0c1f22]">Envio da Pergunta</h4>
                    <p className="text-xs text-neutral-500 font-semibold leading-relaxed px-1">
                      Vendedor envia sua dúvida em tempo real de forma prática
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

              {/* STEP 2: RESPOSTA DIRETA DO AGENTE */}
              <div className="flex flex-col items-center group relative w-full max-w-[280px]">
                <div className="relative bg-white border border-neutral-200/60 rounded-[32px] p-8 text-center flex flex-col items-center shadow-[0_20px_50px_rgba(0,112,243,0.03)] hover:shadow-[0_30px_70px_rgba(0,112,243,0.07)] hover:-translate-y-1.5 transition-all duration-300 w-full min-h-[310px] justify-between border-b-[3px] border-b-[#0070f3]/80">
                  
                  {/* Badge centered on top boundary */}
                  <span className="absolute -top-5 left-1/2 transform -translate-x-1/2 bg-[#0070f3] text-white font-sans font-black w-10 h-10 rounded-full flex items-center justify-center text-base shadow-[0_4px_12px_rgba(0,112,243,0.3)] border-2 border-white">
                    2
                  </span>

                  {/* Icon illustration: blue direct message/lightning agent answer */}
                  <div className="w-32 h-32 rounded-[24px] bg-[#f0f7ff] border border-[#d1e6ff] flex items-center justify-center mt-2 group-hover:scale-105 transition-transform duration-300">
                    <svg className="w-16 h-16 text-[#0070f3]" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <rect x="15" y="25" width="70" height="46" rx="20" fill="white" stroke="#0070f3" strokeWidth="4" />
                      <path d="M65 71L75 83V71H65Z" fill="white" stroke="#0070f3" strokeWidth="4" strokeLinejoin="round" />
                      <path d="M32 42H68M32 54H56" stroke="#0070f3" strokeWidth="5" strokeLinecap="round" />
                    </svg>
                  </div>

                  {/* Title and details */}
                  <div className="mt-6 space-y-2">
                    <h4 className="font-sans font-black text-lg text-[#0c1f22]">Resposta do Agente</h4>
                    <p className="text-xs text-neutral-500 font-semibold leading-relaxed px-1">
                      O agente responde de forma imediata, direta e objetiva
                    </p>
                  </div>

                </div>
              </div>

            </div>
          </div>

          {/* Quick format explanation card */}
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="max-w-2xl mx-auto mt-16 bg-[#eafdf0]/60 backdrop-blur-md border border-[#cbeed4] rounded-3xl p-6 shadow-sm text-center"
          >
            <p className="text-[#006b27] font-sans font-black text-sm sm:text-base leading-relaxed uppercase tracking-tight">
              Ele trabalha de forma ágil no formato: <br className="sm:hidden" />
              <span className="text-[#00a83e] underline decoration-[2px] decoration-[#00a83e]/30">pergunta &gt; resposta &gt; pergunta &gt; resposta</span>
            </p>
          </motion.div>

          {/* CTA Button */}
          <div className="flex justify-center mt-12 relative z-20">
            <a 
              href="#planos" 
              className="inline-flex items-center gap-3 bg-gradient-to-r from-[#004d1a] via-[#00a83e] to-[#00c853] hover:from-[#006020] hover:via-[#00b944] hover:to-[#05d95b] text-white px-8 py-4.5 rounded-xl font-extrabold text-sm tracking-widest uppercase transition-all shadow-lg shadow-emerald-950/25 hover:shadow-emerald-600/35 hover:scale-[1.01] active:scale-[0.99] border-b-[3px] border-[#003813]"
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
                  Padronização da operação
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
            <div className="bg-white border border-neutral-100 rounded-[32px] p-4 sm:p-10 shadow-[0_20px_45px_0_rgba(12,31,34,0.04)] lg:hover:shadow-[0_25px_50px_-10px_rgba(37,211,102,0.12)] lg:hover:-translate-y-1 transition-all duration-300 flex flex-col justify-center">
              
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
            <div className="bg-white border border-neutral-100 rounded-[32px] p-4 sm:p-10 shadow-[0_20px_45px_0_rgba(12,31,34,0.04)] lg:hover:shadow-[0_25px_50px_-10px_rgba(0,112,243,0.12)] lg:hover:-translate-y-1 transition-all duration-300 flex flex-col justify-center">
              
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
              className="inline-flex items-center gap-3 bg-gradient-to-r from-[#004d1a] via-[#00a83e] to-[#00c853] hover:from-[#006020] hover:via-[#00b944] hover:to-[#05d95b] text-white px-8 py-4.5 rounded-xl font-extrabold text-sm tracking-widest uppercase transition-all shadow-lg shadow-emerald-950/25 hover:shadow-emerald-600/35 hover:scale-[1.01] active:scale-[0.99] border-b-[3px] border-[#003813]"
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






      {/* NEW PRICING SECTION */}
      <section className="bg-white py-20 sm:py-24 relative overflow-hidden" id="planos">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-4">
            <h2 className="text-3xl sm:text-[44px] font-sans font-black text-[#0b1a30] tracking-tighter leading-tight uppercase">
              ESCOLHA SUA ASSINATURA
            </h2>
          </div>

          <div className="flex justify-center mt-6 mb-4">
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-[#00a83e] to-[#0070f3] rounded-full blur opacity-60 animate-pulse"></div>
              <div className="relative flex items-center gap-2 px-6 py-2.5 bg-white border border-neutral-100 rounded-full text-neutral-600 shadow-sm">
                <ShieldCheck className="w-5 h-5 text-[#00a83e]" />
                <span className="text-sm font-bold tracking-wide">
                  Garantia Incondicional de <strong className="text-[#00a83e] font-black">7 DIAS</strong>
                </span>
              </div>
            </div>
          </div>

          {/* Selector de Agente com Caixa de Opções */}
          <div className="max-w-md mx-auto mt-8 mb-6 p-6 bg-white border border-neutral-200/60 rounded-3xl shadow-[0_10px_30px_rgba(0,168,62,0.03)] text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#00a83e] to-[#0070f3]"></div>
            <label className="block text-xs font-black tracking-wider text-neutral-400 uppercase mb-3.5">
              Escolha o agente que deseja:
            </label>
            <div className="grid grid-cols-2 gap-2 p-1 bg-neutral-50 border border-neutral-200/50 rounded-2xl">
              <button
                type="button"
                onClick={() => setSelectedAgent('consultor')}
                className={`py-3 px-4 rounded-xl font-sans font-black text-xs sm:text-sm uppercase tracking-wider transition-all duration-300 ${
                  selectedAgent === 'consultor'
                    ? 'bg-gradient-to-r from-[#004d1a] to-[#00a83e] text-white shadow-md'
                    : 'text-neutral-500 hover:text-neutral-900 bg-transparent'
                }`}
              >
                Ceruti Consultor
              </button>
              <button
                type="button"
                onClick={() => setSelectedAgent('campo')}
                className={`py-3 px-4 rounded-xl font-sans font-black text-xs sm:text-sm uppercase tracking-wider transition-all duration-300 ${
                  selectedAgent === 'campo'
                    ? 'bg-gradient-to-r from-[#004d1a] to-[#00a83e] text-white shadow-md'
                    : 'text-neutral-500 hover:text-neutral-900 bg-transparent'
                }`}
              >
                Ceruti Campo
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 mt-10 items-start justify-center max-w-5xl mx-auto">
            {/* COLUMN 1 */}
            <div className="flex flex-col w-full pt-6 relative">
              <div className="text-center mb-6">
                <span className="text-xs sm:text-sm font-sans font-black uppercase tracking-widest text-[#0070f3] bg-[#f0f7ff] border-2 border-[#d9e6ff] px-6 py-2.5 rounded-full shadow-sm">
                  Assinando até 10 acessos
                </span>
              </div>

              {/* CARD 1 */}
              <div className="bg-white border-2 border-[#d9e6ff] rounded-[32px] p-6 sm:p-8 flex flex-col relative w-full pt-12 shadow-[0_12px_45px_rgba(11,26,48,0.02)]">
                {/* Floating Badge */}
                <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-[#f0f7ff] border-2 border-[#d9e6ff] text-[#0070f3] w-14 h-14 rounded-2xl flex items-center justify-center shadow-sm">
                  <Users className="w-7 h-7" />
                </div>
                
                <h3 className="text-center font-black text-xl text-[#0070f3] uppercase tracking-tighter mb-2">
                  Valores POR acesso
                </h3>
                <div className="text-center mb-6">
                  <span className="relative inline-block group">
                    <span className="absolute inset-0 bg-red-400/20 blur-md rounded-full transition-all duration-300"></span>
                    <span className="relative inline-flex items-center justify-center px-4 py-1 rounded-full bg-red-50/80 border border-red-100 text-red-500 text-sm font-black line-through decoration-red-500/70 decoration-[2px]">
                      {selectedAgent === 'consultor' ? 'R$ 397,00' : 'R$ 147,50'}
                    </span>
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 lg:gap-3 xl:gap-4">
                  {/* Mensal */}
                  <div className="bg-white border border-neutral-100 shadow-sm rounded-[24px] p-4 sm:p-2.5 md:p-3.5 xl:p-5 flex flex-col items-center">
                    <div className="w-10 h-10 sm:w-8 sm:h-8 md:w-11 md:h-11 rounded-full bg-[#f0f7ff] text-[#0070f3] flex items-center justify-center mb-2.5">
                      <CalendarDays className="w-5 h-5 sm:w-4 md:w-5.5 md:h-5.5" />
                    </div>
                    <span className="font-bold text-neutral-900 text-sm sm:text-xs md:text-sm mb-1.5">Mensal</span>
                    <div className="flex items-baseline gap-0.5 sm:gap-0 lg:gap-0.5 xl:gap-1 mb-3.5">
                      <span className="font-bold text-sm sm:text-xs md:text-sm lg:text-xs xl:text-sm text-neutral-400 mt-0.5">R$</span>
                      <span className="font-black text-2xl xs:text-3xl sm:text-xl md:text-2xl lg:text-xl xl:text-3xl text-[#0b1a30] tracking-tighter leading-none">
                        {selectedAgent === 'consultor' ? '337' : '125'}
                        <span className="text-sm sm:text-xs md:text-sm lg:text-xs xl:text-lg font-bold">
                          {selectedAgent === 'consultor' ? ',45' : ',38'}
                        </span>
                      </span>
                    </div>
                    <div className="text-[10px] sm:text-[9px] md:text-[10px] text-neutral-500 font-extrabold -mt-2.5 mb-2.5 uppercase tracking-wide">
                      POR MÊS
                    </div>
                    <div className="bg-[#eafdf0] text-[#00a83e] font-black text-[10px] sm:text-[9px] md:text-[10px] xl:text-xs uppercase px-3 py-1 sm:px-1.5 md:px-2.5 rounded-full mt-auto">
                      15% OFF
                    </div>
                  </div>

                  {/* Semestral */}
                  <div className="bg-white border border-neutral-100 shadow-sm rounded-[24px] p-4 sm:p-2.5 md:p-3.5 xl:p-5 flex flex-col items-center">
                    <div className="w-10 h-10 sm:w-8 sm:h-8 md:w-11 md:h-11 rounded-full bg-[#f0f7ff] text-[#0070f3] flex items-center justify-center mb-2.5">
                      <CalendarDays className="w-5 h-5 sm:w-4 md:w-5.5 md:h-5.5" />
                    </div>
                    <span className="font-bold text-neutral-900 text-sm sm:text-xs md:text-sm mb-1.5">Semestral</span>
                    <div className="flex items-baseline gap-0.5 sm:gap-0 lg:gap-0.5 xl:gap-1 mb-3.5">
                      <span className="font-bold text-sm sm:text-xs md:text-sm lg:text-xs xl:text-sm text-neutral-400 mt-0.5">R$</span>
                      <span className="font-black text-2xl xs:text-3xl sm:text-xl md:text-2xl lg:text-xl xl:text-3xl text-[#0b1a30] tracking-tighter leading-none">
                        {selectedAgent === 'consultor' ? '297' : '110'}
                        <span className="text-sm sm:text-xs md:text-sm lg:text-xs xl:text-lg font-bold">
                          {selectedAgent === 'consultor' ? ',75' : ',63'}
                        </span>
                      </span>
                    </div>
                    <div className="text-[10px] sm:text-[9px] md:text-[10px] text-neutral-500 font-extrabold -mt-2.5 mb-2.5 uppercase tracking-wide">
                      POR MÊS
                    </div>
                    <div className="bg-[#eafdf0] text-[#00a83e] font-black text-[10px] sm:text-[9px] md:text-[10px] xl:text-xs uppercase px-3 py-1 sm:px-1.5 md:px-2.5 rounded-full mt-auto">
                      25% OFF
                    </div>
                  </div>

                  {/* Anual */}
                  <div className="bg-white border-2 border-[#0070f3]/25 shadow-md rounded-[24px] p-4 sm:p-2.5 md:p-3.5 xl:p-5 flex flex-col items-center relative overflow-hidden">
                    <div className="absolute top-0 right-0 bg-[#00a83e] text-white font-black text-[7px] sm:text-[6px] md:text-[8px] uppercase px-1.5 py-0.5 rounded-bl-lg tracking-tight">
                      RECOMENDADO
                    </div>
                    <div className="w-10 h-10 sm:w-8 sm:h-8 md:w-11 md:h-11 rounded-full bg-[#f0f7ff] text-[#0070f3] flex items-center justify-center mb-2.5">
                      <CalendarDays className="w-5 h-5 sm:w-4 md:w-5.5 md:h-5.5" />
                    </div>
                    <span className="font-bold text-neutral-900 text-sm sm:text-xs md:text-sm mb-1.5">Anual</span>
                    <div className="flex items-baseline gap-0.5 sm:gap-0 lg:gap-0.5 xl:gap-1 mb-3.5">
                      <span className="font-bold text-sm sm:text-xs md:text-sm lg:text-xs xl:text-sm text-neutral-400 mt-0.5">R$</span>
                      <span className="font-black text-2xl xs:text-3xl sm:text-xl md:text-2xl lg:text-xl xl:text-3xl text-[#0b1a30] tracking-tighter leading-none">
                        {selectedAgent === 'consultor' ? '258' : '95'}
                        <span className="text-sm sm:text-xs md:text-sm lg:text-xs xl:text-lg font-bold">
                          {selectedAgent === 'consultor' ? ',05' : ',88'}
                        </span>
                      </span>
                    </div>
                    <div className="text-[10px] sm:text-[9px] md:text-[10px] text-neutral-500 font-extrabold -mt-2.5 mb-2.5 uppercase tracking-wide">
                      POR MÊS
                    </div>
                    <div className="bg-[#eafdf0] text-[#00a83e] font-black text-[10px] sm:text-[9px] md:text-[10px] xl:text-xs uppercase px-3 py-1 sm:px-1.5 md:px-2.5 rounded-full mt-auto">
                      35% OFF
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* COLUMN 2 */}
            <div className="flex flex-col w-full pt-6 relative">
              <div className="text-center mb-6">
                <span className="text-xs sm:text-sm font-sans font-black uppercase tracking-widest text-[#00a83e] bg-[#eafdf0] border-2 border-[#cbeed4] px-6 py-2.5 rounded-full shadow-sm">
                  Assinando acima de 10 acessos
                </span>
              </div>

              {/* CARD 2 */}
              <div className="bg-white border-[3px] border-[#00a83e] rounded-[32px] p-6 sm:p-8 flex flex-col relative w-full pt-12 shadow-[0_16px_50px_rgba(0,168,62,0.06)]">
                {/* Floating Badge */}
                <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-[#eafdf0] border-[3px] border-[#00a83e] text-[#00a83e] w-14 h-14 rounded-2xl flex items-center justify-center shadow-sm">
                  <Users className="w-7 h-7" />
                </div>
                
                <h3 className="text-center font-black text-xl text-[#00a83e] uppercase tracking-tighter mb-2">
                  Valores POR acesso
                </h3>
                <div className="text-center mb-6">
                  <span className="relative inline-block group">
                    <span className="absolute inset-0 bg-red-400/20 blur-md rounded-full transition-all duration-300"></span>
                    <span className="relative inline-flex items-center justify-center px-4 py-1 rounded-full bg-red-50/80 border border-red-100 text-red-500 text-sm font-black line-through decoration-red-500/70 decoration-[2px]">
                      {selectedAgent === 'consultor' ? 'R$ 397,00' : 'R$ 147,50'}
                    </span>
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 lg:gap-3 xl:gap-4">
                  {/* Mensal */}
                  <div className="bg-white border border-neutral-100 shadow-sm rounded-[24px] p-4 sm:p-2.5 md:p-3.5 xl:p-5 flex flex-col items-center">
                    <div className="w-10 h-10 sm:w-8 sm:h-8 md:w-11 md:h-11 rounded-full bg-[#eafdf0] text-[#00a83e] flex items-center justify-center mb-2.5">
                      <CalendarDays className="w-5 h-5 sm:w-4 md:w-5.5 md:h-5.5" />
                    </div>
                    <span className="font-bold text-neutral-900 text-sm sm:text-xs md:text-sm mb-1.5">Mensal</span>
                    <div className="flex items-baseline gap-0.5 sm:gap-0 lg:gap-0.5 xl:gap-1 mb-3.5">
                      <span className="font-bold text-sm sm:text-xs md:text-sm lg:text-xs xl:text-sm text-neutral-400 mt-0.5">R$</span>
                      <span className="font-black text-2xl xs:text-3xl sm:text-xl md:text-2xl lg:text-xl xl:text-3xl text-[#0b1a30] tracking-tighter leading-none">
                        {selectedAgent === 'consultor' ? '297' : '110'}
                        <span className="text-sm sm:text-xs md:text-sm lg:text-xs xl:text-lg font-bold">
                          {selectedAgent === 'consultor' ? ',75' : ',63'}
                        </span>
                      </span>
                    </div>
                    <div className="text-[10px] sm:text-[9px] md:text-[10px] text-neutral-500 font-extrabold -mt-2.5 mb-2.5 uppercase tracking-wide">
                      POR MÊS
                    </div>
                    <div className="bg-[#eafdf0] text-[#00a83e] font-black text-[10px] sm:text-[9px] md:text-[10px] xl:text-xs uppercase px-3 py-1 sm:px-1.5 md:px-2.5 rounded-full mt-auto">
                      25% OFF
                    </div>
                  </div>

                  {/* Semestral */}
                  <div className="bg-white border border-neutral-100 shadow-sm rounded-[24px] p-4 sm:p-2.5 md:p-3.5 xl:p-5 flex flex-col items-center">
                    <div className="w-10 h-10 sm:w-8 sm:h-8 md:w-11 md:h-11 rounded-full bg-[#eafdf0] text-[#00a83e] flex items-center justify-center mb-2.5">
                      <CalendarDays className="w-5 h-5 sm:w-4 md:w-5.5 md:h-5.5" />
                    </div>
                    <span className="font-bold text-neutral-900 text-sm sm:text-xs md:text-sm mb-1.5">Semestral</span>
                    <div className="flex items-baseline gap-0.5 sm:gap-0 lg:gap-0.5 xl:gap-1 mb-3.5">
                      <span className="font-bold text-sm sm:text-xs md:text-sm lg:text-xs xl:text-sm text-neutral-400 mt-0.5">R$</span>
                      <span className="font-black text-2xl xs:text-3xl sm:text-xl md:text-2xl lg:text-xl xl:text-3xl text-[#0b1a30] tracking-tighter leading-none">
                        {selectedAgent === 'consultor' ? '258' : '95'}
                        <span className="text-sm sm:text-xs md:text-sm lg:text-xs xl:text-lg font-bold">
                          {selectedAgent === 'consultor' ? ',05' : ',88'}
                        </span>
                      </span>
                    </div>
                    <div className="text-[10px] sm:text-[9px] md:text-[10px] text-neutral-500 font-extrabold -mt-2.5 mb-2.5 uppercase tracking-wide">
                      POR MÊS
                    </div>
                    <div className="bg-[#eafdf0] text-[#00a83e] font-black text-[10px] sm:text-[9px] md:text-[10px] xl:text-xs uppercase px-3 py-1 sm:px-1.5 md:px-2.5 rounded-full mt-auto">
                      35% OFF
                    </div>
                  </div>

                  {/* Anual */}
                  <div className="bg-white border-2 border-[#00a83e]/25 shadow-md rounded-[24px] p-4 sm:p-2.5 md:p-3.5 xl:p-5 flex flex-col items-center relative overflow-hidden">
                    <div className="absolute top-0 right-0 bg-[#00a83e] text-white font-black text-[7px] sm:text-[6px] md:text-[8px] uppercase px-1.5 py-0.5 rounded-bl-lg tracking-tight">
                      RECOMENDADO
                    </div>
                    <div className="w-10 h-10 sm:w-8 sm:h-8 md:w-11 md:h-11 rounded-full bg-[#eafdf0] text-[#00a83e] flex items-center justify-center mb-2.5">
                      <CalendarDays className="w-5 h-5 sm:w-4 md:w-5.5 md:h-5.5" />
                    </div>
                    <span className="font-bold text-neutral-900 text-sm sm:text-xs md:text-sm mb-1.5">Anual</span>
                    <div className="flex items-baseline gap-0.5 sm:gap-0 lg:gap-0.5 xl:gap-1 mb-3.5">
                      <span className="font-bold text-sm sm:text-xs md:text-sm lg:text-xs xl:text-sm text-neutral-400 mt-0.5">R$</span>
                      <span className="font-black text-2xl xs:text-3xl sm:text-xl md:text-2xl lg:text-xl xl:text-3xl text-[#0b1a30] tracking-tighter leading-none">
                        {selectedAgent === 'consultor' ? '218' : '81'}
                        <span className="text-sm sm:text-xs md:text-sm lg:text-xs xl:text-lg font-bold">
                          {selectedAgent === 'consultor' ? ',35' : ',13'}
                        </span>
                      </span>
                    </div>
                    <div className="text-[10px] sm:text-[9px] md:text-[10px] text-neutral-500 font-extrabold -mt-2.5 mb-2.5 uppercase tracking-wide">
                      POR MÊS
                    </div>
                    <div className="bg-[#eafdf0] text-[#00a83e] font-black text-[10px] sm:text-[9px] md:text-[10px] xl:text-xs uppercase px-3 py-1 sm:px-1.5 md:px-2.5 rounded-full mt-auto">
                      45% OFF
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col items-center justify-center mt-12 pb-8 gap-4">
            <Link 
              to={`/checkout?agent=${selectedAgent}`}
              className="inline-flex items-center gap-3 bg-gradient-to-r from-[#004d1a] via-[#00a83e] to-[#00c853] hover:from-[#006020] hover:via-[#00b944] hover:to-[#05d95b] text-white px-8 sm:px-10 py-4 sm:py-4.5 rounded-2xl font-black text-sm sm:text-[15px] tracking-widest uppercase transition-all shadow-lg shadow-emerald-950/25 hover:shadow-emerald-600/35 hover:-translate-y-1 active:scale-[0.99] border-b-[3px] border-[#003813]"
            >
              <Rocket className="w-6 h-6" />
              ASSINAR AGORA
            </Link>

            {/* Certificação de Segurança */}
            <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-6 px-5 py-2.5 bg-white border border-neutral-200/60 rounded-2xl shadow-sm text-neutral-700 max-w-lg mt-2">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-[#00a83e]" />
                <span className="text-xs font-black uppercase tracking-wider text-[#0b1a30]">
                  Certificação de Segurança
                </span>
              </div>
              <div className="hidden sm:block w-px h-4 bg-neutral-200" />
              <div className="flex items-center gap-1 text-[11px] font-bold text-neutral-500">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#00a83e]" />
                Ambiente 100% Criptografado & Protegido por SSL de 256 bits
              </div>
            </div>
          </div>
        </div>

        {/* Soft elegant gradient transition divider */}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#00a83e]/30 via-[#0070f3]/25 via-transparent to-transparent z-10" />
        <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-gradient-to-r from-transparent via-[#00a83e]/10 via-[#0070f3]/10 to-transparent z-10 blur-[2px] opacity-85" />
      </section>



      <FAQ />

      {/* FOOTER COOPERATIVE INFO DECLARED */}
      <footer className="bg-agro-deep border-t border-white/5 py-16 text-sm text-gray-500" id="main_footer">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 pb-12 border-b border-white/5 text-left">
            
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <img 
                  id="footer_logo"
                  src="/LETRA ESCURA - FUNDO TRANS - HOR.png" 
                  alt="Ceruti" 
                  className="h-9 w-auto object-contain invert brightness-200" 
                  referrerPolicy="no-referrer"
                />
              </div>
              <p className="text-xs text-gray-400 leading-relaxed font-sans font-medium">
                A inteligência de vendas criada exclusivamente para potencializar o treinamento de equipes comerciais e aumentar o fechamento de negócios.
              </p>
            </div>

            <div className="space-y-4 font-sans">
              <h5 className="font-bold text-white text-xs mb-1 font-mono uppercase tracking-wider">Segurança & Termos</h5>
              <p className="text-xs text-gray-400 leading-relaxed font-medium">
                Sua operação comercial protegida. Processamento seguro de dados em total conformidade com a LGPD e criptografia integrada com APIs oficiais do WhatsApp.
              </p>
              <div className="flex flex-col space-y-2 mt-4 text-xs font-semibold text-gray-400">
                <Link to="/politica-de-privacidade" className="hover:text-white transition-colors w-fit">
                  Política de Privacidade
                </Link>
                <Link to="/politica-de-reembolso" className="hover:text-white transition-colors w-fit">
                  Política de Reembolso
                </Link>
                <Link to="/termos-de-servico" className="hover:text-white transition-colors w-fit">
                  Termos de Serviço
                </Link>
              </div>
            </div>

          </div>

          <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs space-y-4 sm:space-y-0">
            <p className="text-[11px] text-gray-600 font-mono">
              © 2026 Ceruti. Todos os direitos reservados. Desenvolvido para o agronegócio brasileiro de alta performance.
            </p>
            <div className="flex flex-wrap items-center justify-center sm:justify-end gap-x-6 gap-y-3 font-medium text-gray-400">
              <a href="#dois-modelos" className="hover:text-white transition-colors">Os dois modelos</a>
              <a href="#resultados" className="hover:text-white transition-colors">Resultados práticos</a>
              <a href="#depoimentos" className="hover:text-white transition-colors">Depoimentos</a>
              <span className="text-white/10 hidden lg:inline">|</span>
              <a href="#top_container" className="text-gray-600 hover:text-white transition-colors font-semibold">Voltar para o Topo</a>
            </div>
          </div>

        </div>
      </footer>

      {/* Floating WhatsApp Chat Widget */}
      <WhatsAppWidget />
    </div>
  );
}
