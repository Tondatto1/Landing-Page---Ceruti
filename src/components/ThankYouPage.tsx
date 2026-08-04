import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowRight, 
  Home, 
  ShieldCheck, 
  AlertTriangle, 
  MessageCircle, 
  GraduationCap, 
  Check, 
  Zap
} from 'lucide-react';
import { OglAurora } from './OglAurora';
import { trackMetaEvent } from '../lib/metaPixel';

export function ThankYouPage() {
  const navigate = useNavigate();

  useEffect(() => {
    // Retrieve checkout data from localStorage
    const rawData = localStorage.getItem('ceruti_last_checkout');
    if (rawData) {
      try {
        const details = JSON.parse(rawData);
        
        // Track the Purchase event with Meta Pixel & Conversions API
        trackMetaEvent('Purchase', {
          value: details.value || 0,
          currency: details.currency || 'BRL',
          content_name: `Assinatura Ceruti - ${details.agent || 'Geral'}`,
          content_ids: [details.agent || 'geral'],
          content_type: 'product',
          num_items: details.usersCount || 1,
        }, {
          name: details.name,
          email: details.email,
          phone: details.phone,
        });

        // Clear data so it doesn't trigger again on reload
        localStorage.removeItem('ceruti_last_checkout');
      } catch (err) {
        console.error('[ThankYouPage Purchase Track Error]', err);
      }
    } else {
      // Fallback tracking if they navigated directly or refreshed
      trackMetaEvent('Purchase', {
        value: 0,
        currency: 'BRL',
        content_name: 'Assinatura Ceruti - Direto',
      });
    }
  }, []);

  const whatsappMessage = encodeURIComponent(
    'Olá, eu adquiri o Agente IA e quero saber mais sobre a oferta especial do programa de capacitação?'
  );
  const whatsappUrl = `https://wa.me/556798190294?text=${whatsappMessage}`;

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
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-8 md:py-14 relative overflow-hidden">
        {/* WebGL Aurora Background Effect */}
        <div className="absolute inset-0 pointer-events-none z-0 opacity-30">
          <OglAurora
            colorStops={["#004d1a", "#00a83e", "#a2d9b1"]}
            blend={0.6}
            amplitude={1.2}
            speed={0.8}
          />
        </div>

        {/* Background Decorative Blobs */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] sm:w-[500px] h-[350px] sm:h-[500px] bg-gradient-to-r from-emerald-100/20 to-blue-100/20 rounded-full blur-3xl pointer-events-none -z-10" />

        <div className="max-w-5xl w-full relative z-10 my-4">
          
          {/* MAIN UPSELL SECTION CARD */}
          <div className="bg-[#0b1728] text-white rounded-3xl shadow-2xl border border-neutral-800 relative overflow-hidden">
            
            {/* 1. Top Warning Banner */}
            <div className="bg-amber-500 text-neutral-950 font-black text-[11px] sm:text-xs uppercase tracking-wider py-2.5 px-4 text-center flex items-center justify-center gap-2">
              <AlertTriangle className="w-4 h-4 text-neutral-950 shrink-0" />
              <span>OPORTUNIDADE ÚNICA E EXCLUSIVA (SE SAIR DESTA PÁGINA, NÃO PODERÁ VOLTAR)</span>
            </div>

            {/* 2. Main Content Grid */}
            <div className="p-6 sm:p-10 lg:p-12">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
                
                {/* Left Column: Headline, Subheadline, Price Box, Bullet points, CTA */}
                <div className="lg:col-span-7 space-y-6 text-left">
                  
                  {/* Headline */}
                  <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white leading-[1.25] tracking-tight uppercase">
                    SEU TIME COMERCIAL VENDENDO ATÉ{' '}
                    <span className="inline-block px-3.5 py-1 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 font-black italic shadow-lg shadow-emerald-500/30 border border-emerald-300 mx-1 align-middle">
                      5X MAIS
                    </span>{' '}
                    COM NOSSO{' '}
                    <span className="underline decoration-[#00c853] decoration-4 underline-offset-4">
                      PROGRAMA DE CAPACITAÇÃO
                    </span>
                    .
                  </h1>

                  {/* Subheadline with vertical accent line */}
                  <div className="flex items-start gap-3 border-l-2 border-[#00c853] pl-3 py-0.5">
                    <p className="text-neutral-300 text-sm sm:text-base leading-relaxed font-medium">
                      Somos a maior escola de capacitação comercial para <strong className="text-white font-bold">Agronegócios</strong> do Brasil!
                    </p>
                  </div>

                  {/* Price Anchoring Box */}
                  <div className="bg-[#122238]/90 border border-white/10 rounded-2xl p-4 sm:p-5 space-y-2.5">
                    <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-wide">
                      <Zap className="w-4 h-4 text-amber-400 shrink-0" />
                      <span>CONDIÇÃO EXCLUSIVA DE CONFIRMAÇÃO</span>
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="text-xs sm:text-sm text-neutral-400 line-through font-semibold">
                        A partir de R$ 2.000,00 por colaborador
                      </span>
                    </div>

                    <div>
                      <span className="inline-block bg-[#00a83e] text-white text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider">
                        35% OFF GARANTIDO
                      </span>
                    </div>

                    <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed font-medium pt-1">
                      Somente agora, ao adquirir o Agente IA, sua empresa recebe um super desconto de <strong className="text-amber-300 font-bold">35% no Programa de Capacitação</strong> para o seu time de vendas.
                    </p>
                  </div>

                  {/* Highlights Bullet List */}
                  <div className="space-y-3 text-xs sm:text-sm text-neutral-200 pt-1">
                    <div className="flex items-start gap-3">
                      <div className="p-1 bg-[#00c853]/20 text-[#00c853] rounded-full mt-0.5 shrink-0">
                        <Check className="w-4 h-4 stroke-[3]" />
                      </div>
                      <span className="leading-snug">
                        <strong className="text-white font-bold">Treinamentos Completos:</strong> Vendas, Negociações de Alto Impacto & Quebra de Objeções no Campo.
                      </span>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="p-1 bg-[#00c853]/20 text-[#00c853] rounded-full mt-0.5 shrink-0">
                        <Check className="w-4 h-4 stroke-[3]" />
                      </div>
                      <span className="leading-snug">
                        <strong className="text-white font-bold">Metodologia Aplicada no Agro:</strong> Tudo o que seu time necessita para escalar resultados e aumentar conversões.
                      </span>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="p-1 bg-[#00c853]/20 text-[#00c853] rounded-full mt-0.5 shrink-0">
                        <Check className="w-4 h-4 stroke-[3]" />
                      </div>
                      <span className="leading-snug">
                        <strong className="text-white font-bold">Sinergia Total com a IA:</strong> Seu time alinhado perfeitamente com a inteligência do Agente Ceruti.
                      </span>
                    </div>
                  </div>

                  {/* CTA Button to WhatsApp */}
                  <div className="pt-2">
                    <a
                      href={whatsappUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-3 w-full px-6 py-4 bg-gradient-to-r from-[#00c853] via-[#00a83e] to-[#008f35] hover:from-[#00db5b] hover:to-[#009e3b] text-white font-black text-sm sm:text-base uppercase tracking-wider rounded-2xl shadow-[0_10px_30px_rgba(0,200,83,0.35)] hover:shadow-[0_15px_40px_rgba(0,200,83,0.5)] hover:scale-[1.01] active:scale-[0.99] transition-all duration-300 text-center"
                    >
                      <MessageCircle className="w-6 h-6 fill-white shrink-0" />
                      <span>GARANTIR CAPACITAÇÃO COM 35% DE DESCONTO</span>
                    </a>
                    <p className="text-[11px] text-neutral-400 text-center sm:text-left mt-2.5 flex items-center gap-1.5 justify-center sm:justify-start">
                      <Zap className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <span>Atendimento direto via WhatsApp com nosso consultor especialista (67 9819-0294)</span>
                    </p>
                  </div>

                </div>

                {/* Right Column: Image */}
                <div className="lg:col-span-5 flex flex-col items-center justify-center pt-2 lg:pt-8">
                  <div className="relative group rounded-2xl overflow-hidden border-2 border-amber-500/50 shadow-2xl max-w-md w-full">
                    <img
                      src="/cerutti_turma.png"
                      alt="Treinamento de Equipes no Agro"
                      className="w-full h-auto object-cover rounded-2xl transform group-hover:scale-105 transition-transform duration-500"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />
                    <div className="absolute bottom-4 left-4 right-4 text-left">
                      <span className="inline-flex items-center gap-2 bg-black/75 backdrop-blur-md text-amber-300 font-bold text-xs px-3.5 py-1.5 rounded-xl border border-amber-500/40 shadow-lg">
                        <GraduationCap className="w-4 h-4 text-amber-400" />
                        <span>Treinamento de Equipes no Agro</span>
                      </span>
                    </div>
                  </div>
                </div>

              </div>
            </div>

          </div>

          {/* Footer Navigation Bar */}
          <div className="mt-6 bg-white/80 backdrop-blur-sm border border-neutral-200/80 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-xs font-bold text-neutral-500 uppercase tracking-wide">
              <ShieldCheck className="w-4.5 h-4.5 text-emerald-600" />
              Ambiente Seguro & Credenciamento Ativo
            </div>

            <button
              onClick={() => navigate('/')}
              className="inline-flex items-center gap-2 text-xs sm:text-sm font-black uppercase tracking-wider text-[#00a83e] hover:text-emerald-800 transition-colors"
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

