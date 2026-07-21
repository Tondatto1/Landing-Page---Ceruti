import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, Clock, MessageSquare, ArrowRight, Home, ShieldCheck } from 'lucide-react';
import { OglAurora } from './OglAurora';

export function ThankYouPage() {
  const navigate = useNavigate();

  React.useEffect(() => {
    window.scrollTo(0, 0);
    
    // Track PageView for thank you page explicitly
    if (typeof window !== "undefined" && window.fbq) {
      console.log("[Meta Pixel] Tracking thank you page PageView");
      window.fbq("track", "PageView");
    }
  }, []);

  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col font-sans select-none overflow-x-hidden">
      {/* Header */}
      <header className="w-full bg-white border-b border-gray-200 px-4 py-4 flex items-center justify-between shadow-sm sticky top-0 z-30">
        <div className="flex items-center gap-4 max-w-7xl mx-auto w-full">
          <img 
            id="thank_you_logo"
            src="/LETRA ESCURA - FUNDO TRANS - HOR.png" 
            alt="Ceruti" 
            className="h-8 sm:h-9 w-auto object-contain" 
            referrerPolicy="no-referrer"
          />
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-4 py-12 md:py-20 relative overflow-hidden">
        {/* WebGL Aurora Background Effect */}
        <div className="absolute inset-0 pointer-events-none z-0 opacity-40">
          <OglAurora
            colorStops={["#004d1a", "#00a83e", "#a2d9b1"]}
            blend={0.6}
            amplitude={1.2}
            speed={0.8}
          />
        </div>

        {/* Background Decorative Blobs */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] sm:w-[500px] h-[350px] sm:h-[500px] bg-gradient-to-r from-emerald-100/20 to-blue-100/20 rounded-full blur-3xl pointer-events-none -z-10" />

        <div className="max-w-2xl w-full bg-white/95 backdrop-blur-md border border-neutral-200/80 rounded-3xl p-8 md:p-12 shadow-xl shadow-emerald-950/[0.03] text-center relative overflow-hidden z-10">
          {/* Top Green Accent Bar */}
          <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-[#004d1a] via-[#00a83e] to-[#00c853]" />

          {/* Icon */}
          <div className="inline-flex items-center justify-center w-20 h-20 bg-emerald-50 rounded-full border border-emerald-100 mb-8 relative">
            <span className="absolute inset-0 bg-emerald-400/20 blur-lg rounded-full animate-pulse"></span>
            <CheckCircle2 className="w-10 h-10 text-[#00a83e] relative z-10" />
          </div>

          {/* Title */}
          <h1 className="text-3xl md:text-4xl font-black text-[#0b1a30] tracking-tight mb-4 uppercase">
            Obrigado pela Compra!
          </h1>
          <p className="text-neutral-600 font-medium text-base md:text-lg max-w-lg mx-auto mb-10 leading-relaxed">
            Sua assinatura foi recebida com sucesso e já está sendo processada.
          </p>

          {/* Steps / Info Grid */}
          <div className="flex flex-col gap-4 text-left mb-10 max-w-xl mx-auto">
            <div className="p-5 bg-blue-50/40 border border-blue-100/30 rounded-2xl flex gap-4 items-center">
              <div className="p-2.5 bg-blue-100/50 text-blue-600 rounded-xl shrink-0">
                <MessageSquare className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-neutral-800 text-sm sm:text-base leading-relaxed">
                O agente irá te enviar uma mensagem de saudação para facilitar o acesso.
              </h3>
            </div>

            <div className="p-5 bg-emerald-50/50 border border-emerald-100/50 rounded-2xl flex gap-4 items-center">
              <div className="p-2.5 bg-emerald-100/50 text-[#00a83e] rounded-xl shrink-0">
                <Clock className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-neutral-800 text-sm sm:text-base leading-relaxed">
                Seu acesso será liberado em até 10 minutos
              </h3>
            </div>
          </div>

          {/* Footer of Card */}
          <div className="border-t border-neutral-100 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-xs font-bold text-neutral-500 uppercase tracking-wide">
              <ShieldCheck className="w-4.5 h-4.5 text-emerald-600" />
              Ambiente Seguro & Credenciamento Ativo
            </div>

            <button
              onClick={() => navigate('/')}
              className="inline-flex items-center gap-2 text-sm font-black uppercase tracking-wider text-[#00a83e] hover:text-emerald-800 transition-colors"
            >
              <Home className="w-4 h-4" />
              Voltar ao Início
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full bg-white border-t border-gray-100 py-6 text-center text-xs text-neutral-400 font-medium">
        <div className="max-w-7xl mx-auto px-4">
          © {new Date().getFullYear()} Ceruti. Todos os direitos reservados.
        </div>
      </footer>
    </div>
  );
}
