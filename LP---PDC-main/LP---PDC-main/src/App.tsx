import React, { useState } from 'react';
import { Header } from './components/Header';
import { HeroSection } from './components/HeroSection';
import { TargetSection } from './components/TargetSection';
import { TestimonialsSection } from './components/TestimonialsSection';
import { TrustCompaniesSection } from './components/TrustCompaniesSection';
import { AboutUsSection } from './components/AboutUsSection';
import { PlanBuilderSection } from './components/PlanBuilderSection';
import { FaqSection } from './components/FaqSection';
import { Footer } from './components/Footer';
import { LeadModal } from './components/LeadModal';

export default function App() {
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
