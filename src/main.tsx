import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import {BrowserRouter, Routes, Route} from 'react-router-dom';
import App from './App.tsx';
import {CheckoutPage} from './components/CheckoutPage.tsx';
import {ThankYouPage} from './components/ThankYouPage.tsx';
import {ObrigadoOfertaPdcPage} from './components/ObrigadoOfertaPdcPage.tsx';
import {PrivacyPolicyPage} from './components/PrivacyPolicyPage.tsx';
import {RefundPolicyPage} from './components/RefundPolicyPage.tsx';
import {TermsOfServicePage} from './components/TermsOfServicePage.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/checkout/*" element={<CheckoutPage />} />
        <Route path="/obrigado" element={<ObrigadoOfertaPdcPage />} />
        <Route path="/obrigado/*" element={<ObrigadoOfertaPdcPage />} />
        <Route path="/obrigadoofertapdc" element={<ObrigadoOfertaPdcPage />} />
        <Route path="/obrigadoofertapdc/*" element={<ObrigadoOfertaPdcPage />} />
        <Route path="/obrigado-oferta-pdc" element={<ObrigadoOfertaPdcPage />} />
        <Route path="/obrigado-oferta-pdc/*" element={<ObrigadoOfertaPdcPage />} />
        <Route path="/politica-de-privacidade" element={<PrivacyPolicyPage />} />
        <Route path="/politica-de-reembolso" element={<RefundPolicyPage />} />
        <Route path="/termos-de-servico" element={<TermsOfServicePage />} />
        <Route path="/termos-de-uso" element={<TermsOfServicePage />} />
        <Route path="*" element={<App />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
);
