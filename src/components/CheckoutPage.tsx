import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft,
  CreditCard, 
  Lock, 
  ShieldCheck, 
  Users,
  QrCode,
  FileText
} from 'lucide-react';

export function CheckoutPage() {
  const navigate = useNavigate();
  const [frequency, setFrequency] = useState<'mensal' | 'semestral'>('mensal');
  const [usersCount, setUsersCount] = useState<number>(1);
  const [paymentMethod, setPaymentMethod] = useState<'credit_card' | 'pix' | 'boleto'>('pix');

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [documentNumber, setDocumentNumber] = useState('');
  const [accessNumbers, setAccessNumbers] = useState<string[]>(['']);

  useEffect(() => {
    setAccessNumbers(prev => {
      const newArr = [...prev];
      if (newArr.length < usersCount) {
        while(newArr.length < usersCount) newArr.push('');
      } else if (newArr.length > usersCount) {
        newArr.length = usersCount;
      }
      return newArr;
    });
  }, [usersCount]);

  // Pricing Logic
  const getUnitPrice = () => {
    if (usersCount <= 10) {
      return frequency === 'mensal' ? 337.45 : 297.75;
    } else {
      return frequency === 'mensal' ? 297.75 : 258.05;
    }
  };

  const unitPrice = getUnitPrice();
  const totalPricePerMonth = unitPrice * usersCount;
  const grandTotal = frequency === 'mensal' ? totalPricePerMonth : totalPricePerMonth * 6;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  const handleCheckout = (e: React.FormEvent) => {
    e.preventDefault();
    
    const paymentMethodNames = {
      credit_card: 'Cartão de Crédito',
      pix: 'PIX',
      boleto: 'Boleto'
    };

    const accessNumbersText = usersCount > 1 
      ? `\n\n━━━━━━━━━━━━━━━━━━━━━━\n\n📱 *NÚMEROS COM ACESSO*\n${accessNumbers.map((n, i) => `*${i + 1}º Acesso:* ${n}`).join('\n')}` 
      : '';

    const message = `🚨 *NOVO PEDIDO DE ASSINATURA* 🚨
━━━━━━━━━━━━━━━━━━━━━━

👤 *DADOS DO CLIENTE*
*Nome:* ${name}
*E-mail:* ${email}
*WhatsApp:* ${phone}
*Documento:* ${documentNumber}

━━━━━━━━━━━━━━━━━━━━━━

💼 *DETALHES DO PLANO*
*Plano:* ${frequency === 'mensal' ? 'Mensal' : 'Semestral'}
*Acessos:* ${usersCount}
*Valor por Acesso:* ${formatCurrency(unitPrice)}/mês
*Total:* ${formatCurrency(grandTotal)}${accessNumbersText}

━━━━━━━━━━━━━━━━━━━━━━

💳 *PAGAMENTO*
*Método:* ${paymentMethodNames[paymentMethod]}

━━━━━━━━━━━━━━━━━━━━━━
⏳ _Aguardo as instruções para finalizar._`;

    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/5567999431658?text=${encodedMessage}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      {/* Top Header */}
      <header className="w-full bg-white border-b border-gray-200 px-4 py-4 flex items-center justify-between shadow-sm sticky top-0 z-30">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-neutral-500 hover:text-neutral-800 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-semibold text-sm hidden sm:inline">Voltar</span>
          </button>
          <div className="h-6 w-px bg-gray-300 hidden sm:block"></div>
          <span className="font-extrabold text-xl tracking-tight text-neutral-900">
            Ceruti
          </span>
        </div>
        <div className="flex items-center gap-2 text-neutral-500">
          <Lock className="w-4 h-4" />
          <span className="text-xs font-bold tracking-wider">CHECKOUT SEGURO</span>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 w-full max-w-6xl mx-auto flex flex-col lg:flex-row items-stretch overflow-hidden px-4 py-8 sm:px-6 gap-6 sm:gap-8">
        
        {/* Left Side: Product Summary */}
        <div className="w-full lg:w-5/12 bg-white rounded-3xl shadow-sm border border-neutral-200 p-6 sm:p-10 flex flex-col h-fit">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 bg-[#00a83e] rounded-xl flex items-center justify-center shadow-md">
              <ShieldCheck className="w-7 h-7 text-white" />
            </div>
            <div>
              <h3 className="font-black text-2xl text-[#0b1a30]">Ceruti AI</h3>
              <p className="text-xs font-bold text-neutral-500 uppercase tracking-wider">Treinador de Vendas</p>
            </div>
          </div>

          <div className="mb-8">
            <h4 className="font-bold text-neutral-900 mb-4">Escolha a frequência:</h4>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setFrequency('mensal')}
                className={`p-4 rounded-xl border-2 text-sm font-bold text-center transition-all ${
                  frequency === 'mensal' 
                    ? 'border-[#0070f3] bg-[#f0f7ff] text-[#0070f3] shadow-inner' 
                    : 'border-neutral-200 bg-white text-neutral-500 hover:border-neutral-300 hover:bg-gray-50'
                }`}
              >
                Mensal
              </button>
              <button
                onClick={() => setFrequency('semestral')}
                className={`p-4 rounded-xl border-2 text-sm font-bold text-center transition-all ${
                  frequency === 'semestral' 
                    ? 'border-[#0070f3] bg-[#f0f7ff] text-[#0070f3] shadow-inner' 
                    : 'border-neutral-200 bg-white text-neutral-500 hover:border-neutral-300 hover:bg-gray-50'
                }`}
              >
                Semestral
                <div className="text-[10px] text-[#0070f3] opacity-80 mt-0.5 uppercase tracking-widest">Até 35% OFF</div>
              </button>
            </div>
          </div>

          <div className="mb-8">
            <h4 className="font-bold text-neutral-900 flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
              Quantidade de acessos:
              <span className="text-[#0070f3] bg-[#f0f7ff] px-3 py-1 rounded-full text-xs self-start sm:self-auto w-fit">
                {usersCount <= 10 ? 'Até 10 acessos' : 'Acima de 10 acessos'}
              </span>
            </h4>
            <div className="flex items-center">
              <div className="relative flex-1">
                <Users className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#0070f3]" />
                <input 
                  type="number" 
                  min="1"
                  value={usersCount}
                  onChange={(e) => setUsersCount(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-neutral-200 rounded-xl focus:outline-none focus:border-[#0070f3] focus:bg-white focus:ring-4 ring-[#0070f3]/10 font-black text-xl text-neutral-900 transition-all"
                />
              </div>
            </div>
          </div>

          <div className="mt-4 pt-6 border-t border-neutral-200">
            <div className="flex justify-between items-center mb-4">
              <span className="text-neutral-500 font-medium text-sm">Preço por acesso:</span>
              <span className="font-bold text-neutral-900">{formatCurrency(unitPrice)}/mês</span>
            </div>
            {frequency === 'semestral' && (
              <div className="flex justify-between items-center mb-4">
                <span className="text-neutral-500 font-medium text-sm">Tempo de contrato:</span>
                <span className="font-bold text-neutral-900">6 meses</span>
              </div>
            )}
            
            <div className="flex justify-between items-end mt-4 pt-4 border-t border-neutral-200">
              <span className="font-black text-neutral-900 text-lg uppercase">Total {frequency === 'mensal' ? 'Mensal' : 'Semestral'}:</span>
              <div className="text-right">
                <div className="font-black text-4xl text-[#0b1a30] leading-none mb-1">{formatCurrency(grandTotal)}</div>
                {frequency === 'semestral' && (
                  <div className="text-sm font-bold text-[#00a83e] mt-1 line-clamp-1 bg-[#eafdf0] px-3 py-1 rounded-md inline-block">
                     Em 1x de {formatCurrency(grandTotal)}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Payment Form */}
        <div className="w-full lg:w-7/12 bg-white rounded-3xl shadow-sm border border-neutral-200 p-6 sm:p-10 flex flex-col lg:order-last order-first">
          <div className="mb-8">
            <h2 className="text-3xl font-black text-[#0b1a30] mb-2 tracking-tight">Finalizar Assinatura</h2>
            <p className="text-neutral-500 font-medium">Preencha seus dados para liberar seu acesso instantaneamente.</p>
          </div>

          <form onSubmit={handleCheckout} className="flex flex-col gap-6 flex-1">
            {/* Personal Data */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-neutral-700 mb-1.5 ml-1">Nome completo</label>
                <input 
                  type="text" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  placeholder="Seu nome ou nome da empresa"
                  className="w-full px-4 py-3.5 bg-neutral-50 border border-neutral-300 rounded-xl focus:outline-none focus:ring-4 focus:ring-[#0070f3]/15 focus:border-[#0070f3] focus:bg-white transition-all text-base font-medium placeholder-gray-400"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-neutral-700 mb-1.5 ml-1">E-mail de acesso</label>
                  <input 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="email@empresa.com.br"
                    className="w-full px-4 py-3.5 bg-neutral-50 border border-neutral-300 rounded-xl focus:outline-none focus:ring-4 focus:ring-[#0070f3]/15 focus:border-[#0070f3] focus:bg-white transition-all text-base font-medium placeholder-gray-400"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-neutral-700 mb-1.5 ml-1">WhatsApp / Telefone</label>
                  <input 
                    type="tel" 
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                    placeholder="(00) 00000-0000"
                    className="w-full px-4 py-3.5 bg-neutral-50 border border-neutral-300 rounded-xl focus:outline-none focus:ring-4 focus:ring-[#0070f3]/15 focus:border-[#0070f3] focus:bg-white transition-all text-base font-medium placeholder-gray-400"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-neutral-700 mb-1.5 ml-1">CPF ou CNPJ</label>
                <input 
                  type="text" 
                  value={documentNumber}
                  onChange={(e) => setDocumentNumber(e.target.value)}
                  required
                  placeholder="000.000.000-00 ou 00.000.000/0000-00"
                  className="w-full px-4 py-3.5 bg-neutral-50 border border-neutral-300 rounded-xl focus:outline-none focus:ring-4 focus:ring-[#0070f3]/15 focus:border-[#0070f3] focus:bg-white transition-all text-base font-medium placeholder-gray-400"
                />
              </div>
            </div>

            {/* Additional Access Numbers */}
            {usersCount > 1 && (
              <div className="mt-4 pt-6 border-t border-neutral-200">
                <div className="mb-4">
                  <h3 className="block text-base font-bold text-neutral-900 mb-1">Números com Acesso Liberado</h3>
                  <p className="text-sm font-medium text-neutral-500">Informe o WhatsApp de cada atendente que terá acesso ao treinador.</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {accessNumbers.map((num, idx) => (
                    <div key={idx}>
                      <label className="block text-sm font-bold text-neutral-700 mb-1.5 ml-1">{idx + 1}º Acesso</label>
                      <input 
                        type="tel"
                        value={num}
                        onChange={(e) => {
                          const newArr = [...accessNumbers];
                          newArr[idx] = e.target.value;
                          setAccessNumbers(newArr);
                        }}
                        required
                        placeholder="(00) 00000-0000"
                        className="w-full px-4 py-3.5 bg-neutral-50 border border-neutral-300 rounded-xl focus:outline-none focus:ring-4 focus:ring-[#0070f3]/15 focus:border-[#0070f3] focus:bg-white transition-all text-base font-medium placeholder-gray-400"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Payment Method Selection */}
            <div className="mt-4 pt-6 border-t border-neutral-200">
              <label className="block text-base font-bold text-neutral-900 mb-4">Forma de pagamento (Asaas)</label>
              <div className="grid grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('pix')}
                  className={`flex flex-col items-center justify-center gap-3 p-4 rounded-xl border-2 transition-all ${
                    paymentMethod === 'pix' 
                      ? 'border-[#00a83e] bg-[#eafdf0] text-[#00a83e] shadow-md shadow-[#00a83e]/10' 
                      : 'border-neutral-200 bg-white text-neutral-500 hover:border-neutral-300 hover:bg-gray-50'
                  }`}
                >
                  <QrCode className="w-8 h-8" />
                  <span className="text-xs font-black uppercase tracking-wider">PIX</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod('credit_card')}
                  className={`flex flex-col items-center justify-center gap-3 p-4 rounded-xl border-2 transition-all ${
                    paymentMethod === 'credit_card' 
                      ? 'border-[#0070f3] bg-[#f0f7ff] text-[#0070f3] shadow-md shadow-[#0070f3]/10' 
                      : 'border-neutral-200 bg-white text-neutral-500 hover:border-neutral-300 hover:bg-gray-50'
                  }`}
                >
                  <CreditCard className="w-8 h-8" />
                  <span className="text-xs font-black uppercase tracking-wider text-center">Cartão</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod('boleto')}
                  className={`flex flex-col items-center justify-center gap-3 p-4 rounded-xl border-2 transition-all ${
                    paymentMethod === 'boleto' 
                      ? 'border-[#0b1a30] bg-neutral-100 text-[#0b1a30] shadow-md shadow-[#0b1a30]/10' 
                      : 'border-neutral-200 bg-white text-neutral-500 hover:border-neutral-300 hover:bg-gray-50'
                  }`}
                >
                  <FileText className="w-8 h-8" />
                  <span className="text-xs font-black uppercase tracking-wider text-center">Boleto</span>
                </button>
              </div>

              {/* Supported Card Flags (visible conditionally but nice to show for asaas integration) */}
              <div className="flex flex-wrap items-center gap-3 mt-5 opacity-50 grayscale mx-1">
                {/* Simulated Flags for Visa, Mastercard, Elo, Amex - visually represented with text for now, but commonly icon svgs are used */}
                <span className="text-[10px] font-bold border px-2 py-0.5 rounded uppercase font-mono tracking-widest">Visa</span>
                <span className="text-[10px] font-bold border px-2 py-0.5 rounded uppercase font-mono tracking-widest">Mastercard</span>
                <span className="text-[10px] font-bold border px-2 py-0.5 rounded uppercase font-mono tracking-widest">Elo</span>
                <span className="text-[10px] font-bold border px-2 py-0.5 rounded uppercase font-mono tracking-widest">Amex</span>
              </div>
            </div>

            {/* Submit Button */}
            <div className="mt-8">
              <div className="relative group">
                {/* Perpetual Glow Effect */}
                <div className="absolute -inset-1 bg-gradient-to-r from-[#00a83e] via-[#00cf4d] to-[#00a83e] rounded-[16px] blur opacity-75 animate-pulse"></div>
                
                <button 
                  type="submit"
                  className="relative w-full flex items-center justify-center gap-3 bg-[#00a83e] hover:bg-[#009035] text-white px-8 py-5 rounded-xl font-black text-lg tracking-widest uppercase transition-all shadow-[0_10px_25px_rgba(0,168,62,0.3)] hover:-translate-y-1 active:translate-y-0"
                >
                  <Lock className="w-6 h-6 text-current opacity-80" />
                  CONCLUIR ASSINATURA
                </button>
              </div>
              
              <div className="relative mt-6">
                <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 opacity-60">
                  <div className="flex items-center gap-1.5">
                    <Lock className="w-4 h-4 text-neutral-600" />
                    <span className="text-xs font-bold text-neutral-600 uppercase tracking-wide">Pagamento Seguro</span>
                  </div>
                  <div className="w-1.5 h-1.5 bg-neutral-300 rounded-full"></div>
                  <div className="flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-neutral-600" />
                    <span className="text-xs font-bold text-neutral-600 uppercase tracking-wide">Site Criptografado</span>
                  </div>
                  <div className="hidden sm:block w-1.5 h-1.5 bg-neutral-300 rounded-full"></div>
                  <div className="hidden sm:flex items-center gap-1.5">
                    <span className="font-black text-[11px] text-neutral-600 tracking-widest">PROCESSADO POR ASAAS</span>
                  </div>
                </div>
                <div className="sm:hidden flex items-center justify-center mt-3 opacity-60">
                  <span className="font-black text-[11px] text-neutral-600 tracking-widest">PROCESSADO POR ASAAS</span>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
