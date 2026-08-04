import React, { useState } from 'react';
import { Header } from './Header';
import { HeroSection } from './HeroSection';
import { TargetSection } from './TargetSection';
import { TestimonialsSection } from './TestimonialsSection';
import { TrustCompaniesSection } from './TrustCompaniesSection';
import { AboutUsSection } from './AboutUsSection';
import { PlanBuilderSection } from './PlanBuilderSection';
import { FaqSection } from './FaqSection';
import { Footer } from './Footer';
import { LeadModal } from './LeadModal';

export function ObrigadoOfertaPdcPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPlanName, setSelectedPlanName] = useState<string | undefined>();

  const handleOpenModal = (planName?: string) => {
    setSelectedPlanName(planName);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedPlanName(undefined);
  };

  const handleScrollToPlan = () => {
    const section = document.getElementById('planos');
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' });
    } else {
      setIsModalOpen(true);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50/80 via-emerald-50/40 via-white to-slate-50 font-sans text-slate-900 antialiased selection:bg-emerald-600 selection:text-white scroll-smooth">
      {/* Top Fixed Header */}
      <Header onOpenCtaModal={handleScrollToPlan} />

      <main>
        {/* 1ª SEÇÃO: Hero Banner */}
        <HeroSection onOpenCtaModal={handleScrollToPlan} />

        {/* 2ª SEÇÃO: Para Quem É o Programa? */}
        <TargetSection onOpenCtaModal={handleScrollToPlan} />

        {/* 3ª SEÇÃO: O Que Dizem (Depoimentos) */}
        <TestimonialsSection onOpenCtaModal={handleScrollToPlan} />

        {/* 4ª SEÇÃO: Empresas que Confiam em Nós */}
        <TrustCompaniesSection />

        {/* 5ª SEÇÃO: Quem Somos? */}
        <AboutUsSection onOpenCtaModal={handleScrollToPlan} />

        {/* 6ª SEÇÃO: Personalize Seu Plano */}
        <PlanBuilderSection onOpenCtaModal={(planName) => handleOpenModal(planName)} />

        {/* 7ª SEÇÃO: FAQ */}
        <FaqSection onOpenCtaModal={handleScrollToPlan} />
      </main>

      {/* RODAPÉ */}
      <Footer onOpenCtaModal={handleScrollToPlan} />

      {/* Interactive Lead Proposal Modal */}
      <LeadModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        defaultPlan={selectedPlanName}
      />
    </div>
  );
}

export default ObrigadoOfertaPdcPage;
