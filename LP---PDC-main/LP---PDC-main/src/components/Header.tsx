import React, { useState, useEffect } from 'react';
import { Sprout, PhoneCall, Menu, X, ArrowRight } from 'lucide-react';
import GooeyNav from './GooeyNav';

interface HeaderProps {
  onOpenCtaModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenCtaModal }) => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    let tick = false;
    const handleScroll = () => {
      if (!tick) {
        requestAnimationFrame(() => {
          const isScrolled = window.scrollY > 20;
          setScrolled(prev => (prev !== isScrolled ? isScrolled : prev));
          tick = false;
        });
        tick = true;
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { label: 'Para Quem É', href: '#para-quem-e' },
    { label: 'Depoimentos', href: '#o-que-dizem' },
    { label: 'Empresas', href: '#empresas' },
    { label: 'Quem Somos', href: '#quem-somos' },
    { label: 'Entregáveis', href: '#planos' },
    { label: 'FAQ', href: '#faq' },
  ];

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
        scrolled 
          ? 'bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-md py-3' 
          : 'bg-gradient-to-b from-white/95 via-white/70 to-transparent py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          
          {/* Logo */}
          <a href="#" className="flex items-center group py-1">
            <img 
              src="/LOGO - LETRA PRETA - TRANS - HOR.png" 
              alt="AGRO MÉTODO PCP Logo" 
              className="h-9 sm:h-11 w-auto object-contain transition-transform group-hover:scale-105"
            />
          </a>

          {/* Desktop Nav - Gooey Navigation */}
          <div className="hidden lg:flex items-center">
            <GooeyNav
              items={navLinks}
              particleCount={12}
              particleDistances={[70, 10]}
              particleR={80}
              initialActiveIndex={0}
              animationTime={500}
              timeVariance={200}
            />
          </div>

          {/* Right Action CTA */}
          <div className="hidden sm:flex items-center gap-4">
            <a
              href="https://wa.me/5567998190294?text=Ol%C3%A1!%20Gostaria%20de%20saber%20mais%20sobre%20o%20M%C3%A9todo%20PCP%20para%20capacita%C3%A7%C3%A3o%20comercial."
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-700 hover:text-emerald-600 text-xs font-bold flex items-center gap-1.5 px-3 py-2 rounded-lg hover:bg-slate-100 transition"
            >
              <PhoneCall className="w-3.5 h-3.5 text-emerald-600" />
              <span>(67) 9 9819-0294</span>
            </a>

            <button
              onClick={onOpenCtaModal}
              className="px-5 py-2.5 bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs uppercase tracking-wider rounded-lg border border-emerald-300/60 ring-2 ring-emerald-500/20 shadow-md shadow-emerald-600/20 transition-all transform hover:-translate-y-0.5 active:translate-y-0 flex items-center gap-2 cursor-pointer"
            >
              <span>QUERO VENDER MAIS!</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex lg:hidden items-center gap-3">
            <button
              onClick={onOpenCtaModal}
              className="sm:hidden px-3.5 py-1.5 bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-[11px] uppercase rounded-lg border border-emerald-300/60 ring-1 ring-emerald-500/20 shadow-sm"
            >
              QUERO VENDER MAIS!
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-700 hover:text-slate-900 rounded-lg bg-slate-100 border border-slate-200"
              aria-label="Toggle Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-b border-slate-200 px-4 pt-4 pb-6 mt-3 space-y-4 shadow-xl">
          <nav className="flex flex-col gap-3">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="text-slate-800 hover:text-emerald-600 font-bold text-base py-2 border-b border-slate-100"
              >
                {link.label}
              </a>
            ))}
          </nav>

          <div className="pt-2 flex flex-col gap-3">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenCtaModal();
              }}
              className="w-full py-3.5 bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-sm uppercase tracking-wider rounded-xl border border-emerald-300/60 ring-2 ring-emerald-500/20 shadow-md flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>QUERO VENDER MAIS!</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
