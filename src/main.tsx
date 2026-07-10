import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import {BrowserRouter, Routes, Route} from 'react-router-dom';
import App from './App.tsx';
import {CheckoutPage} from './components/CheckoutPage.tsx';
import {ThankYouPage} from './components/ThankYouPage.tsx';
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
        <Route path="/obrigado" element={<ThankYouPage />} />
        <Route path="/politica-de-privacidade" element={<PrivacyPolicyPage />} />
        <Route path="/politica-de-reembolso" element={<RefundPolicyPage />} />
        <Route path="/termos-de-servico" element={<TermsOfServicePage />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
);
