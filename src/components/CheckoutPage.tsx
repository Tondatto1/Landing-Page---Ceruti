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
  const [usersCountStr, setUsersCountStr] = useState<string>('1');
  const usersCount = Math.max(1, parseInt(usersCountStr) || 1);
  const [paymentMethod, setPaymentMethod] = useState<'credit_card' | 'pix' | 'boleto'>('pix');

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [documentNumber, setDocumentNumber] = useState('');
  const [accessNumbers, setAccessNumbers] = useState<string[]>(['']);

  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [cardName, setCardName] = useState('');

  useEffect(() => {
    window.scrollTo(0, 0);
    const scrollTimer = setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'instant' });
    }, 100);
    return () => clearTimeout(scrollTimer);
  }, []);

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

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 11) value = value.slice(0, 11);
    
    let formatted = value;
    if (value.length > 2) {
      formatted = `(${value.slice(0, 2)})`;
      if (value.length > 3) {
        formatted += ` ${value.slice(2, 3)}`;
        if (value.length > 7) {
          formatted += ` ${value.slice(3, 7)}-${value.slice(7)}`;
        } else {
          formatted += ` ${value.slice(3)}`;
        }
      } else if (value.length === 3) {
        formatted += ` ${value.slice(2)}`;
      }
    }
    setPhone(formatted);
  };

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 16) value = value.slice(0, 16);
    let formatted = value.replace(/(\d{4})/g, '$1 ').trim();
    setCardNumber(formatted);
  };

  const handleCardExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 4) value = value.slice(0, 4);
    if (value.length > 2) {
      setCardExpiry(`${value.slice(0, 2)}/${value.slice(2)}`);
    } else {
      setCardExpiry(value);
    }
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

    const cardText = paymentMethod === 'credit_card' 
      ? `\n*Número do Cartão:* ${cardNumber}\n*Validade:* ${cardExpiry}\n*CVV:* ${cardCvv}\n*Nome no Cartão:* ${cardName}`
      : '';

    // Utilizando encodeURIComponent padrão, garantindo que os emojis sejam mantidos
    const emojis = {
      alert: '🚨',
      user: '👤',
      plan: '💼',
      card: '💳',
      clock: '⏳'
    };

    const message = `${emojis.alert} *NOVO PEDIDO DE ASSINATURA* ${emojis.alert}
━━━━━━━━━━━━━━━━━━━━━━

${emojis.user} *DADOS DO CLIENTE*
*Nome:* ${name}
*E-mail:* ${email}
*WhatsApp:* ${phone}
*Documento:* ${documentNumber}

━━━━━━━━━━━━━━━━━━━━━━

${emojis.plan} *DETALHES DO PLANO*
*Plano:* ${frequency === 'mensal' ? 'Mensal' : 'Semestral'}
*Acessos:* ${usersCount}
*Valor por Acesso:* ${formatCurrency(unitPrice)}/mês
*Total:* ${formatCurrency(grandTotal)}${accessNumbersText}

━━━━━━━━━━━━━━━━━━━━━━

${emojis.card} *PAGAMENTO*
*Método:* ${paymentMethodNames[paymentMethod]}${cardText}

━━━━━━━━━━━━━━━━━━━━━━
${emojis.clock} _Aguardo as instruções para finalizar._`;

    const encodedMessage = encodeURIComponent(message);
    window.open(`https://api.whatsapp.com/send?phone=5567981246558&text=${encodedMessage}`, '_blank');
  };

  return (
    <>
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
        <div className="w-full lg:w-5/12 relative z-10 flex flex-col h-fit rounded-[24px] overflow-hidden shadow-sm border border-neutral-100/50">
          <div className="absolute top-1/2 left-1/2 w-[200%] h-[200%] bg-[conic-gradient(from_0deg,transparent_0%,rgba(0,168,62,0.8)_25%,transparent_50%,rgba(0,112,243,0.8)_75%,transparent_100%)] opacity-70 blur-xl animate-[spin_20s_linear_infinite] -z-20 -translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute inset-[1px] bg-[#fafcff] rounded-[23px] -z-10"></div>
          <div className="w-full h-full bg-transparent p-6 sm:p-10 flex flex-col relative z-0">

            <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 bg-[#00a83e] rounded-xl flex items-center justify-center shadow-md">
              <ShieldCheck className="w-7 h-7 text-white" />
            </div>
            <div>
              <h3 className="font-black text-2xl text-[#0b1a30]">Ceruti</h3>
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

          <div className="mb-6 relative z-10 p-5 sm:p-6 rounded-[24px] overflow-hidden shadow-[0_4px_20px_rgba(0,112,243,0.05)] border border-neutral-100/50">
            <div className="absolute top-1/2 left-1/2 w-[200%] h-[200%] bg-[conic-gradient(from_0deg,transparent_0%,rgba(0,168,62,0.8)_25%,transparent_50%,rgba(0,112,243,0.8)_75%,transparent_100%)] opacity-70 blur-xl animate-[spin_20s_linear_infinite] -z-20 -translate-x-1/2 -translate-y-1/2"></div>
            <div className="absolute inset-[1px] bg-[#fafcff] rounded-[23px] -z-10"></div>
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 relative z-0">
              <h4 className="font-bold text-[#0b1a30] text-sm sm:text-base">
                Quantidade de acessos:
              </h4>
            </div>
            <div className="flex items-center relative z-0">
              <div className="relative flex-1">
                <Users className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#0070f3]" />
                <input 
                  type="number" 
                  min="1"
                  value={usersCountStr}
                  onChange={(e) => setUsersCountStr(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 sm:py-4 bg-white border-2 border-[#0070f3]/20 rounded-xl focus:outline-none focus:border-[#0070f3] focus:ring-4 ring-[#0070f3]/10 font-black text-xl text-neutral-900 transition-all cursor-text text-center sm:text-left shadow-inner"
                />
              </div>
            </div>
          </div>

          <div className="mt-4 pt-6 border-t border-neutral-200">
            <div className="flex justify-between items-center mb-2">
              <span className="text-neutral-500 font-medium text-sm">
                Preço original:
              </span>
              <span className="font-bold text-red-400/80 decoration-red-400 decoration-2 line-through text-sm">
                R$ 397,00/mês
              </span>
            </div>
            
            <div className="flex justify-between items-center mb-4">
              <span className="text-[#00a83e] font-bold text-sm flex items-center gap-1.5">
                Preço com desconto:
                <span className="bg-[#eafdf0] px-2 py-0.5 rounded-full text-[11px] uppercase tracking-wide">
                  {usersCount <= 10 ? (frequency === 'mensal' ? '15% OFF' : '25% OFF') : (frequency === 'mensal' ? '25% OFF' : '35% OFF')}
                </span>
              </span>
              <span className="font-black text-neutral-900 text-lg">{formatCurrency(unitPrice)}/mês</span>
            </div>

            {frequency === 'semestral' && (
              <div className="flex justify-between items-center mb-4 pt-4 border-t border-neutral-100">
                <span className="text-neutral-500 font-medium text-sm">Tempo de contrato:</span>
                <span className="font-bold text-neutral-900">6 meses</span>
              </div>
            )}
            
            <div className="flex flex-col items-center mt-6 pt-6 border-t border-neutral-200 gap-2 sm:gap-3 pb-2 text-center">
              <span className="font-black text-neutral-500 text-xs sm:text-sm uppercase tracking-widest">
                Total {frequency === 'mensal' ? 'Mensal' : 'Semestral'}
              </span>
              <div className="flex items-baseline gap-1 sm:gap-1.5 justify-center">
                <span className="font-bold text-lg sm:text-xl text-[#0b1a30]">R$</span>
                <span className="font-black text-[32px] sm:text-[40px] text-[#0b1a30] leading-none tracking-tight truncate">
                  {formatCurrency(grandTotal).replace('R$', '').trim()}
                </span>
              </div>
              {frequency === 'semestral' && (
                <div className="text-[11px] sm:text-sm font-bold text-[#00a83e] bg-[#eafdf0] px-3 py-1.5 sm:px-4 sm:py-1.5 rounded-full inline-block mt-1 sm:mt-1.5">
                   Em 1x de R$ {formatCurrency(grandTotal).replace('R$', '').trim()}
                </div>
              )}
            </div>
          </div>
          </div>
        </div>

        {/* Right Side: Payment Form */}
        <div className="w-full lg:w-7/12 relative z-10 flex flex-col h-fit rounded-[24px] overflow-hidden shadow-sm border border-neutral-100/50 bg-white">
          <div className="absolute top-1/2 left-1/2 w-[200%] h-[200%] bg-[conic-gradient(from_0deg,transparent_0%,rgba(0,112,243,0.8)_25%,transparent_50%,rgba(0,168,62,0.8)_75%,transparent_100%)] opacity-70 blur-xl animate-[spin_20s_linear_infinite_reverse] -z-20 -translate-x-1/2 -translate-y-1/2 transform"></div>
          <div className="absolute inset-[1px] bg-white rounded-[23px] -z-10"></div>
          <div className="w-full h-full bg-transparent p-6 sm:p-10 flex flex-col relative z-0">
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
                    onChange={handlePhoneChange}
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
                          let value = e.target.value.replace(/\D/g, '');
                          if (value.length > 11) value = value.slice(0, 11);
                          let formatted = value;
                          if (value.length > 2) {
                            formatted = `(${value.slice(0, 2)})`;
                            if (value.length > 3) {
                              formatted += ` ${value.slice(2, 3)}`;
                              if (value.length > 7) {
                                formatted += ` ${value.slice(3, 7)}-${value.slice(7)}`;
                              } else {
                                formatted += ` ${value.slice(3)}`;
                              }
                            } else if (value.length === 3) {
                              formatted += ` ${value.slice(2)}`;
                            }
                          }

                          const newArr = [...accessNumbers];
                          newArr[idx] = formatted;
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

              {/* Supported Card Flags */}
              <div className="flex flex-wrap items-center gap-3 mt-5 mx-1">
                <svg className="h-5" viewBox="0 0 38 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M14.532 0L9.467 11.968h3.298l1.01-2.825h4.153l.394 2.825h2.89L18.006 0h-3.474zm2.148 2.052l1.353 4.542h-3.324l1.971-4.542zM4.148 0L2.709 8.163l-1.32-6.52A1.895 1.895 0 0 0 .11 0H.001L.004.147l2.868 11.821h3.407L10.384 0H6.945L4.148 0z" fill="#1434CB"/>
                  <path d="M29.627 0h-2.906v11.968h2.906V0zM38.001 0h-3.153a1.9 1.9 0 0 0-1.638 1.052l-2.866 6.843L28.164.004H25.26l3.418 11.968h2.906L38.001 0z" fill="#F5A623"/>
                </svg>
                {/* Mastercard-like overlapping circles */}
                <svg className="h-5" viewBox="0 0 32 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="10" cy="10" r="10" fill="#EB001B"/>
                  <circle cx="22" cy="10" r="10" fill="#F79E1B" fillOpacity="0.8"/>
                </svg>
                {/* Generic Amex-like minimal */}
                <div className="text-[10px] font-bold border border-blue-600 text-blue-600 bg-white px-1.5 py-0.5 rounded-sm uppercase tracking-wider">AMEX</div>
                {/* Generic Elo-like minimal */}
                <div className="text-[10px] items-center justify-center font-bold border border-black bg-black text-white px-2 py-0.5 rounded-sm uppercase tracking-wider">elo</div>
              </div>

              {/* Credit Card Expanded Form */}
              {paymentMethod === 'credit_card' && (
                <div className="mt-6 space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                  <div>
                    <label className="block text-sm font-bold text-neutral-700 mb-1.5 ml-1">Número do Cartão</label>
                    <input 
                      type="text" 
                      value={cardNumber}
                      onChange={handleCardNumberChange}
                      required={paymentMethod === 'credit_card'}
                      placeholder="0000 0000 0000 0000" 
                      className="w-full px-4 py-3.5 bg-neutral-50 border border-neutral-300 rounded-xl focus:outline-none focus:ring-4 focus:ring-[#0070f3]/15 focus:border-[#0070f3] focus:bg-white transition-all text-base font-medium placeholder-gray-400"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-neutral-700 mb-1.5 ml-1">Validade</label>
                      <input 
                        type="text" 
                        value={cardExpiry}
                        onChange={handleCardExpiryChange}
                        required={paymentMethod === 'credit_card'}
                        placeholder="MM/AA" 
                        maxLength={5}
                        className="w-full px-4 py-3.5 bg-neutral-50 border border-neutral-300 rounded-xl focus:outline-none focus:ring-4 focus:ring-[#0070f3]/15 focus:border-[#0070f3] focus:bg-white transition-all text-base font-medium placeholder-gray-400"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-neutral-700 mb-1.5 ml-1">CVV</label>
                      <input 
                        type="text" 
                        value={cardCvv}
                        onChange={(e) => {
                          const val = e.target.value.replace(/\D/g, '');
                          if (val.length <= 4) setCardCvv(val);
                        }}
                        required={paymentMethod === 'credit_card'}
                        placeholder="123" 
                        maxLength={4}
                        className="w-full px-4 py-3.5 bg-neutral-50 border border-neutral-300 rounded-xl focus:outline-none focus:ring-4 focus:ring-[#0070f3]/15 focus:border-[#0070f3] focus:bg-white transition-all text-base font-medium placeholder-gray-400"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-neutral-700 mb-1.5 ml-1">Nome no Cartão</label>
                    <input 
                      type="text" 
                      value={cardName}
                      onChange={(e) => setCardName(e.target.value)}
                      required={paymentMethod === 'credit_card'}
                      placeholder="Como impresso no cartão" 
                      className="w-full px-4 py-3.5 bg-neutral-50 border border-neutral-300 rounded-xl focus:outline-none focus:ring-4 focus:ring-[#0070f3]/15 focus:border-[#0070f3] focus:bg-white transition-all text-base font-medium placeholder-gray-400"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Submit Button */}
            <div className="mt-8">
              <div className="flex justify-center mb-6">
                 <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 rounded-full border border-emerald-200 shadow-sm">
                   <ShieldCheck className="w-5 h-5 text-emerald-600" />
                   <span className="text-sm font-bold text-emerald-800">Garantia incondicional de 14 dias</span>
                 </div>
              </div>

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
              
              <div className="relative mt-6 pb-2">
                <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 opacity-60">
                  <div className="flex items-center gap-1.5">
                    <Lock className="w-4 h-4 text-neutral-600" />
                    <span className="text-xs font-bold text-neutral-600 uppercase tracking-wide">Pagamento Seguro</span>
                  </div>
                  <div className="w-1.5 h-1.5 bg-neutral-300 rounded-full hidden sm:block"></div>
                  <div className="flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-neutral-600" />
                    <span className="text-xs font-bold text-neutral-600 uppercase tracking-wide">Site Criptografado</span>
                  </div>
                </div>
                <div className="flex items-center justify-center mt-6">
                  <div className="bg-[#f0f3f6] px-5 py-2.5 rounded-full border border-[#dce3ec] shadow-sm">
                     <span className="font-black text-xs text-[#061c3a] tracking-widest flex items-center gap-2">
                        <Lock className="w-3.5 h-3.5" /> PROCESSADO POR ASAAS
                     </span>
                  </div>
                </div>
              </div>
            </div>
          </form>
          </div>
        </div>
      </div>
    </div>
      
    {/* Floating WhatsApp Button */}
      <a 
        href="https://wa.me/554999993352?text=Ol%C3%A1%2C%20Ceruti%21%20Gostaria%20de%20saber%20mais%20sobre%20o%20Treinador%20Comercial%20IA."
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-50 flex items-center justify-center w-14 h-14 bg-[#25D366] text-white rounded-full shadow-lg hover:bg-[#20bd5a] hover:scale-110 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-[#25D366]/50 group"
        aria-label="Fale conosco no WhatsApp"
      >
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8 relative z-10">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.82 9.82 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/>
        </svg>
        <span className="absolute right-16 bg-black text-white text-sm font-medium px-3 py-1.5 rounded-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity whitespace-nowrap">
          Chamar no WhatsApp
        </span>
      </a>
    </>
  );
}
