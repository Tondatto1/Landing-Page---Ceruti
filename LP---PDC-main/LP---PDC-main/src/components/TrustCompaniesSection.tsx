import React, { useMemo, useCallback } from 'react';
import { TRUSTED_COMPANIES } from '../data/agroData';
import LogoLoop, { LogoItem } from './LogoLoop';

export const TrustCompaniesSection: React.FC = () => {
  const logoItems = useMemo<LogoItem[]>(
    () =>
      TRUSTED_COMPANIES.map((company) => ({
        src: company.logoUrl || '',
        alt: company.name,
        title: company.name,
      })),
    []
  );

  const renderLogoCard = useCallback((item: LogoItem, key: React.Key) => {
    const logo = item as { src: string; alt?: string; title?: string };
    return (
      <div
        key={key}
        className="flex items-center justify-center h-20 sm:h-24 px-2 shrink-0 group transition-transform duration-300 hover:scale-105"
      >
        <img
          src={logo.src}
          alt={logo.alt || 'Empresa Parceira'}
          title={logo.title}
          className="h-full w-auto max-w-[220px] sm:max-w-[260px] object-contain rounded-lg transition-transform duration-300"
          loading="lazy"
          decoding="async"
        />
      </div>
    );
  }, []);

  return (
    <section id="empresas" className="py-16 sm:py-20 lg:py-24 bg-gradient-to-r from-emerald-100/50 via-white to-blue-100/50 text-slate-900 border-y border-slate-200/80 relative overflow-hidden">
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-10">
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            EMPRESAS QUE CONFIAM EM NÓS
          </h2>
        </div>

        {/* Logo Loop Carousel */}
        <div className="my-8 py-2 relative">
          <LogoLoop
            logos={logoItems}
            speed={60}
            direction="left"
            logoHeight={96}
            gap={28}
            pauseOnHover={true}
            scaleOnHover={false}
            fadeOut={true}
            fadeOutColor="rgba(248, 250, 252, 0.85)"
            renderItem={renderLogoCard}
            ariaLabel="Empresas parceiras que confiam no Método PCP"
          />
        </div>

        {/* Corporate Trust Banner */}
        <div className="mt-12 p-6 rounded-2xl bg-white border border-slate-200 text-center shadow-sm">
          <h3 className="text-lg font-bold text-slate-900">
            Mais de <span className="text-emerald-700 font-extrabold">+150 empresas atendidas</span> em todo o Brasil
          </h3>
        </div>

      </div>
    </section>
  );
};
