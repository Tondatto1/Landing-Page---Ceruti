import React from 'react';
import { Sprout, Phone, Mail, MapPin, Instagram, Youtube, ArrowUp, MessageCircle } from 'lucide-react';

interface FooterProps {
  onOpenCtaModal: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenCtaModal }) => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-slate-50 text-slate-800 border-t border-slate-200 relative">
      
      {/* Main Footer Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10">
          
          {/* Brand Info (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            <a href="#" className="inline-block group py-1">
              <img 
                src="/LOGO - LETRA PRETA - TRANS - HOR.png" 
                alt="AGRO MÉTODO PCP Logo" 
                className="h-10 sm:h-12 w-auto object-contain transition-transform group-hover:scale-105"
              />
            </a>

            <p className="text-slate-600 text-xs sm:text-sm leading-relaxed max-w-sm font-medium">
              A maior escola de capacitação comercial para Agronegócios do Brasil. Transformando equipes de vendas em parceiros estratégicos do produtor rural há mais de 19 anos.
            </p>

            <div className="flex items-center gap-3 text-slate-600 pt-2">
              <a 
                href="https://www.instagram.com/agrovendedoroficial/" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="w-9 h-9 rounded-xl bg-white hover:bg-emerald-600 hover:text-white text-slate-700 border border-slate-200 shadow-sm flex items-center justify-center transition cursor-pointer" 
                aria-label="Instagram"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a 
                href="https://www.youtube.com/@agrovendedoroficial" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="w-9 h-9 rounded-xl bg-white hover:bg-emerald-600 hover:text-white text-slate-700 border border-slate-200 shadow-sm flex items-center justify-center transition cursor-pointer" 
                aria-label="YouTube"
              >
                <Youtube className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Navigation Links (3 cols) */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-widest text-emerald-800">
              Navegação
            </h4>
            <ul className="space-y-2 text-xs text-slate-600 font-medium">
              <li><a href="#para-quem-e" className="hover:text-emerald-600 transition">Para Quem É o Programa</a></li>
              <li><a href="#o-que-dizem" className="hover:text-emerald-600 transition">Depoimentos & Casos de Sucesso</a></li>
              <li><a href="#empresas" className="hover:text-emerald-600 transition">Empresas Que Confiam</a></li>
              <li><a href="#quem-somos" className="hover:text-emerald-600 transition">Quem Somos & Método PCP</a></li>
              <li><a href="#planos" className="hover:text-emerald-600 transition">Entregáveis do Programa</a></li>
              <li><a href="#faq" className="hover:text-emerald-600 transition">Perguntas Frequentes (FAQ)</a></li>
            </ul>
          </div>

          {/* Contacts (4 cols) */}
          <div className="lg:col-span-4 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-widest text-emerald-800">
              Atendimento Corporativo
            </h4>
            <ul className="space-y-3 text-xs text-slate-600 font-medium">
              <li className="flex items-start gap-2.5">
                <Phone className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <span className="block font-bold text-slate-800">(67) 9 9819-0294</span>
                  <span className="text-[11px] text-slate-500 font-normal">(seg à sex, 08:00 às 17:00)</span>
                </div>
              </li>
              <li className="flex items-start gap-2.5">
                <Mail className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <a href="mailto:comercialagrovendedor@gmail.com" className="hover:text-emerald-600 transition break-all">
                  comercialagrovendedor@gmail.com
                </a>
              </li>
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>Avenida Marechal Rondon, 2083, Campo Grande - MS, CEP 79002-204</span>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 font-medium">
          <div>
            © {new Date().getFullYear()} Escola de Capacitação Comercial Agro. Todos os direitos reservados.
          </div>

          <div className="flex items-center gap-6">
            <a href="#" className="hover:text-emerald-700 transition">Termos de Uso</a>
            <a href="#" className="hover:text-emerald-700 transition">Política de Privacidade</a>
            <button 
              onClick={scrollToTop} 
              className="p-2 bg-white hover:bg-slate-100 text-slate-700 rounded-lg transition border border-slate-200 shadow-sm cursor-pointer"
              aria-label="Voltar ao topo"
            >
              <ArrowUp className="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>

      {/* Sticky Floating WhatsApp Button */}
      <a
        href={`https://wa.me/5567998190294?text=${encodeURIComponent('Olá, venho através da página. Gostaria de falar com consultor.')}`}
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-40 bg-gradient-to-r from-emerald-500 via-emerald-400 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 p-3.5 rounded-full border border-emerald-200/80 ring-2 ring-emerald-500/30 shadow-2xl shadow-emerald-500/50 flex items-center gap-2 font-black text-xs transition transform hover:scale-105 group"
        aria-label="Atendimento via WhatsApp"
      >
        <MessageCircle className="w-6 h-6 fill-slate-950 text-emerald-950" />
        <span className="hidden sm:inline-block pr-1 uppercase tracking-wider">Falar com consultor</span>
      </a>

    </footer>
  );
};
