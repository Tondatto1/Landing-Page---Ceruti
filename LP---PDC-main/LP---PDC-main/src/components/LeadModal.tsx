import React, { useState } from 'react';
import { X, CheckCircle2, Shield, ArrowRight, Building2, Phone, Mail, User, Sparkles } from 'lucide-react';
import { LeadFormData } from '../types';

interface LeadModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultPlan?: string;
}

export const LeadModal: React.FC<LeadModalProps> = ({ isOpen, onClose, defaultPlan }) => {
  const [formData, setFormData] = useState<LeadFormData>({
    fullName: '',
    email: '',
    phone: '',
    companyName: '',
    role: 'Diretor / Gerente Comercial',
    teamSize: 'Equipe Comercial',
    segment: 'Agronegócio'
  });

  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const saveLeadData = (lead: LeadFormData) => {
    try {
      const existingLeads = JSON.parse(localStorage.getItem('agro_leads') || '[]');
      const newLead = {
        ...lead,
        createdAt: new Date().toISOString()
      };
      existingLeads.push(newLead);
      localStorage.setItem('agro_leads', JSON.stringify(existingLeads));
      
      // Store on window object for easy spreadsheet sync inspection
      if (typeof window !== 'undefined') {
        (window as any).__lastSubmittedLead = newLead;
      }
    } catch {
      // Ignore storage errors
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Save lead data internally for spreadsheet integration
    saveLeadData(formData);

    // Send data to Google Sheets Webhook
    const webhookUrl = 
      (import.meta as any).env?.VITE_GOOGLE_SHEETS_WEBHOOK_URL ||
      'https://script.google.com/macros/s/AKfycbwL8IwOFCKNNMirg-JtFjz3x3lwAIvTqnBDynHfq9odVhKG6FYmPv__z3ey1zKsJjFSIA/exec';

    if (webhookUrl) {
      try {
        fetch(webhookUrl, {
          method: 'POST',
          mode: 'no-cors',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            dataHora: new Date().toLocaleString('pt-BR'),
            nome: formData.fullName,
            empresa: formData.companyName,
            whatsapp: formData.phone,
            email: formData.email
          })
        }).catch(() => {});
      } catch {
        // Ignore sync errors to not block user
      }
    }

    // Construct WhatsApp URL
    const message = `Olá, venho através da página. Gostaria de falar com consultor.`;
    const waUrl = `https://wa.me/5567998190294?text=${encodeURIComponent(message)}`;

    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
      // External action: open WhatsApp in a new window/tab
      window.open(waUrl, '_blank');
    }, 400);
  };

  const resetAndClose = () => {
    setSubmitted(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div 
        className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-900 p-6 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
          
          <button 
            onClick={resetAndClose}
            className="absolute top-4 right-4 p-2 text-slate-300 hover:text-white rounded-full bg-slate-800/60 hover:bg-slate-700 transition-colors cursor-pointer"
            aria-label="Fechar"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold mb-3 border border-emerald-500/30">
            <Sparkles className="w-3.5 h-3.5" />
            Venda até 5x mais
          </div>

          <h3 className="text-xl font-extrabold tracking-tight text-white leading-snug">
            Preencha os dados abaixo para falar diretamente com nosso consultor.
          </h3>
        </div>

        {/* Form Body */}
        <div className="p-6 md:p-8">
          {submitted ? (
            <div className="py-6 text-center space-y-4">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h4 className="text-xl font-bold text-slate-900">
                Redirecionando para o WhatsApp...
              </h4>
              <p className="text-slate-600 text-sm leading-relaxed max-w-xs mx-auto">
                Se a janela não abrir automaticamente, clique no botão abaixo para conversar com nosso consultor.
              </p>

              <div className="pt-2 flex flex-col gap-2.5 justify-center">
                <a
                  href={`https://wa.me/5567998190294?text=${encodeURIComponent('Olá, venho através da página. Gostaria de falar com consultor.')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3.5 bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black rounded-xl border border-emerald-300/60 ring-2 ring-emerald-500/20 text-sm transition shadow-lg flex items-center justify-center gap-2 uppercase tracking-wider"
                >
                  Falar com consultor <ArrowRight className="w-4 h-4" />
                </a>
                <button
                  onClick={resetAndClose}
                  className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs transition"
                >
                  Fechar janela
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Nome *
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    required
                    placeholder="Seu nome completo"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    className="w-full pl-9 pr-3 py-2.5 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Empresa *
                </label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    required
                    placeholder="Nome da sua empresa"
                    value={formData.companyName}
                    onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                    className="w-full pl-9 pr-3 py-2.5 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  WhatsApp *
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                  <input
                    type="tel"
                    required
                    placeholder="(00) 99999-9999"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full pl-9 pr-3 py-2.5 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Melhor email *
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                  <input
                    type="email"
                    required
                    placeholder="seu.email@empresa.com.br"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full pl-9 pr-3 py-2.5 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-base uppercase tracking-wider rounded-xl border border-emerald-300/60 ring-2 ring-emerald-500/20 shadow-lg shadow-emerald-600/30 transition-all transform active:scale-98 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {loading ? (
                    <span>Processando...</span>
                  ) : (
                    <>
                      <span>Falar com consultor</span>
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </button>
              </div>

              <div className="flex items-center justify-center gap-2 text-xs text-slate-500 pt-1">
                <Shield className="w-3.5 h-3.5 text-emerald-600" />
                <span>Seus dados estão protegidos. Atendimento exclusivo para empresas.</span>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

