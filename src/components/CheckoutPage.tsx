import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { 
  ArrowLeft,
  CreditCard, 
  Lock, 
  ShieldCheck, 
  Users,
  QrCode,
  FileText,
  Sparkles,
  Check,
  GraduationCap,
  Database,
  CheckCircle2,
  Clock,
  MessageSquare,
  ArrowRight
} from 'lucide-react';
import { WhatsAppWidget } from './WhatsAppWidget';
import { trackMetaEvent } from '../lib/metaPixel';
import {
  BillingApiError,
  createCheckoutAttempt,
  parseBoletoCheckout,
  parseTransparentCardCheckout,
  postBillingCheckout,
  type BillingCheckoutRequest,
  type CheckoutAttempt,
  type CreditCardCheckoutRequest,
} from '../services/billingCheckout';

export function CheckoutPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialAgent = (searchParams.get('agent') === 'campo') ? 'campo' : 'consultor';
  const [selectedAgent, setSelectedAgent] = useState<'consultor' | 'campo'>(initialAgent);
  const [frequency, setFrequency] = useState<'mensal' | 'semestral' | 'anual'>('mensal');
  const [usersCountStr, setUsersCountStr] = useState<string>('1');
  const usersCount = Math.max(1, parseInt(usersCountStr) || 1);
  const [paymentMethod, setPaymentMethod] = useState<'credit_card' | 'pix_automatic' | 'boleto'>('pix_automatic');
  const [includeOrderBump, setIncludeOrderBump] = useState<boolean>(false);
  const [includeCrmBump, setIncludeCrmBump] = useState<boolean>(false);
  const [showSuccessModal, setShowSuccessModal] = useState<boolean>(false);
  const [checkoutError, setCheckoutError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [checkoutResult, setCheckoutResult] = useState<
    | { kind: 'pix'; qrCodeImage: string; payload: string }
    | { kind: 'boleto'; bankSlipUrl?: string; processing: boolean }
    | null
  >(null);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [documentNumber, setDocumentNumber] = useState('');
  const [accessNumbers, setAccessNumbers] = useState<string[]>(['']);

  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [cardName, setCardName] = useState('');
  const [cardPostalCode, setCardPostalCode] = useState('');
  const [cardAddressNumber, setCardAddressNumber] = useState('');
  const checkoutAttemptRef = useRef<CheckoutAttempt | null>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    const scrollTimer = setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'instant' });
    }, 100);
    return () => clearTimeout(scrollTimer);
  }, []);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('ceruti_checkout_contact');
      if (!saved) return;
      const contact = JSON.parse(saved) as { name?: unknown; email?: unknown };
      if (typeof contact.name === 'string') setName(contact.name);
      if (typeof contact.email === 'string') setEmail(contact.email);
    } catch {
      // Browser autocomplete continues to work even if local storage is unavailable.
    }
  }, []);

  useEffect(() => {
    if (!name.trim() && !email.trim()) return;
    try {
      localStorage.setItem('ceruti_checkout_contact', JSON.stringify({
        name: name.trim(),
        email: email.trim(),
      }));
    } catch {
      // Saving a convenience preference must never interrupt checkout.
    }
  }, [name, email]);

  // Order Bump pricing calculations
  const bumpMonthlyPrice = 47;
  const crmMonthlyPrice = 249;
  const contractMonths = frequency === 'mensal' ? 1 : (frequency === 'semestral' ? 6 : 12);
  const bumpTotalAmount = bumpMonthlyPrice * contractMonths;
  const crmTotalAmount = crmMonthlyPrice * contractMonths;

  // Track InitiateCheckout when checkout parameters change or stabilize
  useEffect(() => {
    const timer = setTimeout(() => {
      const bumpAdd = (includeOrderBump ? bumpTotalAmount : 0) + (includeCrmBump ? crmTotalAmount : 0);
      const value = (getUnitPrice() * usersCount * contractMonths) + bumpAdd;
      const content_ids: string[] = [selectedAgent];
      if (includeOrderBump) content_ids.push('order_bump_treinamentos');
      if (includeCrmBump) content_ids.push('order_bump_crm_agro');

      trackMetaEvent('InitiateCheckout', {
        value,
        currency: 'BRL',
        content_name: `Assinatura Ceruti - ${selectedAgent}${includeOrderBump ? ' + Treinamentos' : ''}${includeCrmBump ? ' + CRM Agro' : ''}`,
        content_category: 'Treinador de Vendas',
        content_ids,
        content_type: 'product',
        num_items: usersCount,
      });
    }, 1000); // Debounce track to avoid spamming on user adjustments

    return () => clearTimeout(timer);
  }, [selectedAgent, frequency, usersCount, includeOrderBump, includeCrmBump]);

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
    if (selectedAgent === 'consultor') {
      if (usersCount <= 10) {
        if (frequency === 'mensal') return 337.45;
        if (frequency === 'semestral') return 297.75;
        return 258.05; // anual
      } else {
        if (frequency === 'mensal') return 297.75;
        if (frequency === 'semestral') return 258.05;
        return 218.35; // anual
      }
    } else { // campo
      if (usersCount <= 10) {
        if (frequency === 'mensal') return 125.38;
        if (frequency === 'semestral') return 110.63;
        return 95.88; // anual
      } else {
        if (frequency === 'mensal') return 110.63;
        if (frequency === 'semestral') return 95.88;
        return 81.13; // anual
      }
    }
  };

  const basePrice = selectedAgent === 'consultor' ? 397 : 147.50;

  const unitPrice = getUnitPrice();
  const baseMonthlyTotal = unitPrice * usersCount;
  const totalPricePerMonth = baseMonthlyTotal + (includeOrderBump ? bumpMonthlyPrice : 0) + (includeCrmBump ? crmMonthlyPrice : 0);

  const baseGrandTotal = frequency === 'mensal' 
    ? baseMonthlyTotal 
    : (frequency === 'semestral' ? baseMonthlyTotal * 6 : baseMonthlyTotal * 12);

  const grandTotal = baseGrandTotal + (includeOrderBump ? bumpTotalAmount : 0) + (includeCrmBump ? crmTotalAmount : 0);

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

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    setCheckoutError('');
    setCheckoutResult(null);

    // The current Billing API does not expose an add-on field. Never charge a
    // base subscription while visually promising the selected order bump.
    if (includeOrderBump || includeCrmBump) {
      setCheckoutError('Os adicionais ainda não estão disponíveis para cobrança online. Desmarque-os para concluir a assinatura base.');
      return;
    }

    const cleanedPhone = phone.replace(/\D/g, '');
    const cleanedDocument = documentNumber.replace(/\D/g, '');
    const cleanedAccessNumbers = accessNumbers.map((value) => value.replace(/\D/g, '')).filter(Boolean);
    if (cleanedPhone.length < 10 || cleanedDocument.length < 11 || (usersCount > 1 && cleanedAccessNumbers.length !== usersCount)) {
      setCheckoutError('Confira os dados de contato e os números de acesso antes de continuar.');
      return;
    }

    const frequencyByLabel = { mensal: 'monthly', semestral: 'semiannual', anual: 'annual' } as const;
    const baseRequest: Omit<BillingCheckoutRequest, 'paymentMethod'> = {
      agentType: selectedAgent,
      frequency: frequencyByLabel[frequency],
      accessQuantity: usersCount,
      customer: { name: name.trim(), email: email.trim(), phone: cleanedPhone, documentNumber: cleanedDocument },
      ...(cleanedAccessNumbers.length ? { accessNumbers: cleanedAccessNumbers } : {}),
    };

    let requestBody: BillingCheckoutRequest | CreditCardCheckoutRequest;
    if (paymentMethod === 'credit_card') {
      const cardDigits = cardNumber.replace(/\D/g, '');
      const expiryDigits = cardExpiry.replace(/\D/g, '');
      const postalCode = cardPostalCode.replace(/\D/g, '');
      const expiryMonth = expiryDigits.slice(0, 2);
      const expiryYear = expiryDigits.length === 4 ? `20${expiryDigits.slice(2)}` : '';
      if (!cardName.trim() || cardDigits.length < 13 || !/^(0[1-9]|1[0-2])$/.test(expiryMonth) || !expiryYear || cardCvv.length < 3 || postalCode.length !== 8 || !cardAddressNumber.trim()) {
        setCheckoutError('Confira todos os dados do cartão, incluindo CEP e número do endereço.');
        return;
      }
      requestBody = {
        ...baseRequest,
        paymentMethod: 'credit_card',
        creditCard: { holderName: cardName.trim(), number: cardDigits, expiryMonth, expiryYear, ccv: cardCvv },
        creditCardHolderInfo: {
          name: name.trim(), email: email.trim(), cpfCnpj: cleanedDocument, postalCode,
          addressNumber: cardAddressNumber.trim(), phone: cleanedPhone, mobilePhone: cleanedPhone,
        },
      };
    } else {
      requestBody = { ...baseRequest, paymentMethod };
    }

    checkoutAttemptRef.current = createCheckoutAttempt(checkoutAttemptRef.current, requestBody, () => crypto.randomUUID());
    setIsSubmitting(true);
    try {
      const response = await postBillingCheckout(checkoutAttemptRef.current, requestBody);
      if (paymentMethod === 'credit_card') {
        const transparent = parseTransparentCardCheckout(response.data, response.status);
        if (!transparent) throw new BillingApiError('A resposta do pagamento não pôde ser validada. Tente novamente.', { recoverable: false });
        window.location.assign(transparent.completionUrl);
        return;
      }

      const data = response.data as { ok?: unknown; paymentFlow?: unknown; pix?: { qrCodeImage?: unknown; payload?: unknown } };
      if (data.ok === true && data.paymentFlow === 'PIX_AUTOMATIC' && typeof data.pix?.qrCodeImage === 'string' && typeof data.pix.payload === 'string') {
        setCheckoutResult({ kind: 'pix', qrCodeImage: data.pix.qrCodeImage, payload: data.pix.payload });
        setShowSuccessModal(true);
        return;
      }
      const boleto = parseBoletoCheckout(response.data);
      if (boleto) {
        setCheckoutResult({ kind: 'boleto', processing: boleto.state === 'PROCESSING', ...(boleto.state === 'READY' ? { bankSlipUrl: boleto.bankSlipUrl } : {}) });
        setShowSuccessModal(true);
        return;
      }
      throw new BillingApiError('A resposta do pagamento não pôde ser validada. Tente novamente.', { recoverable: false });
    } catch (error) {
      setCheckoutError(error instanceof BillingApiError ? error.message : 'Não foi possível iniciar o pagamento agora. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className="checkout-page min-h-screen bg-gray-50 flex flex-col font-sans">
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
          <img 
            id="checkout_header_logo"
            src="/LETRA ESCURA - FUNDO TRANS - HOR.png" 
            alt="Ceruti" 
            className="h-8 sm:h-9 w-auto object-contain" 
            referrerPolicy="no-referrer"
          />
        </div>
        <div className="flex items-center gap-2 text-neutral-500">
          <Lock className="w-4 h-4" />
          <span className="text-xs font-bold tracking-wider">CHECKOUT SEGURO</span>
        </div>
      </header>

      {/* Main Content */}
      <div className="checkout-layout flex-1 w-full max-w-6xl mx-auto flex flex-col lg:flex-row items-stretch overflow-hidden px-4 py-8 sm:px-6 gap-6 sm:gap-8">
        
        {/* Left Side: Product Summary */}
        <div className="checkout-summary w-full lg:w-5/12 relative z-10 flex flex-col h-fit rounded-[24px] overflow-hidden shadow-sm border border-neutral-100/50">
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

          <div className="mb-6">
            <h4 className="font-bold text-neutral-900 mb-3">Escolha o Agente:</h4>
            <div className="grid grid-cols-2 gap-2 p-1 bg-neutral-50 border border-neutral-200/50 rounded-2xl">
              <button
                type="button"
                onClick={() => setSelectedAgent('consultor')}
                className={`py-2 px-3 rounded-xl font-sans font-black text-xs sm:text-sm uppercase tracking-wider transition-all duration-300 ${
                  selectedAgent === 'consultor'
                    ? 'bg-gradient-to-r from-[#004d1a] to-[#00a83e] text-white shadow-md'
                    : 'text-neutral-500 hover:text-neutral-900 bg-transparent'
                }`}
              >
                Ceruti Consultor
              </button>
              <button
                type="button"
                onClick={() => setSelectedAgent('campo')}
                className={`py-2 px-3 rounded-xl font-sans font-black text-xs sm:text-sm uppercase tracking-wider transition-all duration-300 ${
                  selectedAgent === 'campo'
                    ? 'bg-gradient-to-r from-[#004d1a] to-[#00a83e] text-white shadow-md'
                    : 'text-neutral-500 hover:text-neutral-900 bg-transparent'
                }`}
              >
                Ceruti Campo
              </button>
            </div>
          </div>

          <div className="mb-8">
            <h4 className="font-bold text-neutral-900 mb-4">Escolha a frequência:</h4>
            <div className="grid grid-cols-3 gap-1.5 sm:gap-2.5">
              <button
                type="button"
                onClick={() => setFrequency('mensal')}
                className={`px-1 py-2 sm:px-3 sm:p-4 rounded-xl border-2 text-xs sm:text-sm font-black text-center transition-all ${
                  frequency === 'mensal' 
                    ? 'border-[#0070f3] bg-[#f0f7ff] text-[#0070f3] shadow-inner' 
                    : 'border-neutral-200 bg-white text-neutral-500 hover:border-neutral-300 hover:bg-gray-50'
                }`}
              >
                Mensal
                <div className={`text-[8px] sm:text-[10px] mt-0.5 uppercase tracking-wider font-extrabold ${
                  frequency === 'mensal' ? 'text-[#0070f3]/90' : 'text-emerald-600'
                }`}>
                  {usersCount <= 10 ? '15% OFF' : '25% OFF'}
                </div>
              </button>
              <button
                type="button"
                onClick={() => setFrequency('semestral')}
                className={`px-1 py-2 sm:px-3 sm:p-4 rounded-xl border-2 text-xs sm:text-sm font-black text-center transition-all ${
                  frequency === 'semestral' 
                    ? 'border-[#0070f3] bg-[#f0f7ff] text-[#0070f3] shadow-inner' 
                    : 'border-neutral-200 bg-white text-neutral-500 hover:border-neutral-300 hover:bg-gray-50'
                }`}
              >
                Semestral
                <div className={`text-[8px] sm:text-[10px] mt-0.5 uppercase tracking-wider font-extrabold ${
                  frequency === 'semestral' ? 'text-[#0070f3]/90' : 'text-emerald-600'
                }`}>
                  {usersCount <= 10 ? '25% OFF' : '35% OFF'}
                </div>
              </button>
              <button
                type="button"
                onClick={() => setFrequency('anual')}
                className={`px-1 py-2 sm:px-3 sm:p-4 rounded-xl border-2 text-xs sm:text-sm font-black text-center transition-all ${
                  frequency === 'anual' 
                    ? 'border-[#0070f3] bg-[#f0f7ff] text-[#0070f3] shadow-inner' 
                    : 'border-neutral-200 bg-white text-neutral-500 hover:border-neutral-300 hover:bg-gray-50'
                }`}
              >
                Anual
                <div className={`text-[8px] sm:text-[10px] mt-0.5 uppercase tracking-wider font-extrabold ${
                  frequency === 'anual' ? 'text-[#0070f3]/90' : 'text-emerald-600'
                }`}>
                  {usersCount <= 10 ? '35% OFF' : '45% OFF'}
                </div>
              </button>
            </div>
          </div>

          <div className="checkout-access-count mb-6 relative z-10 p-5 sm:p-6 rounded-[24px] overflow-hidden shadow-[0_4px_20px_rgba(0,112,243,0.05)] border border-neutral-100/50">
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
                Mensalidade (Preço original):
              </span>
              <span className="font-bold text-red-400/80 decoration-red-400 decoration-2 line-through text-sm">
                {formatCurrency(basePrice * usersCount)}/mês
              </span>
            </div>

            <div className="flex justify-between items-center mb-2">
              <span className="text-neutral-500 font-medium text-sm">
                Total (Preço original):
              </span>
              <span className="font-bold text-red-400/80 decoration-red-400 decoration-2 line-through text-sm">
                {formatCurrency(basePrice * usersCount * (frequency === 'mensal' ? 1 : (frequency === 'semestral' ? 6 : 12)))}
              </span>
            </div>
            


            {frequency === 'semestral' && (
              <div className="flex justify-between items-center mb-4 pt-4 border-t border-neutral-100">
                <span className="text-neutral-500 font-medium text-sm">Tempo de contrato:</span>
                <span className="font-bold text-neutral-900">6 meses</span>
              </div>
            )}

            {frequency === 'anual' && (
              <div className="flex justify-between items-center mb-4 pt-4 border-t border-neutral-100">
                <span className="text-neutral-500 font-medium text-sm">Tempo de contrato:</span>
                <span className="font-bold text-neutral-900">12 meses</span>
              </div>
            )}

            {includeOrderBump && (
              <div className="flex justify-between items-center mb-2 pt-2 border-t border-dashed border-amber-300/80 text-xs sm:text-sm">
                <span className="text-amber-900 font-extrabold flex items-center gap-1.5">
                  <GraduationCap className="w-4 h-4 text-amber-600 shrink-0" />
                  Treinamentos (+R$ 47/mês):
                </span>
                <span className="font-extrabold text-amber-900">
                  +{formatCurrency(bumpTotalAmount)}
                </span>
              </div>
            )}

            {includeCrmBump && (
              <div className="flex justify-between items-center mb-2 pt-2 border-t border-dashed border-amber-300/80 text-xs sm:text-sm">
                <span className="text-amber-900 font-extrabold flex items-center gap-1.5">
                  <Database className="w-4 h-4 text-amber-600 shrink-0" />
                  CRM Agro (+R$ 249/mês):
                </span>
                <span className="font-extrabold text-amber-900">
                  +{formatCurrency(crmTotalAmount)}
                </span>
              </div>
            )}

            <div className="flex flex-col items-center mt-6 pt-6 border-t border-neutral-200 gap-2 sm:gap-3 pb-2 text-center">
              <span className="font-black text-neutral-500 text-xs sm:text-sm uppercase tracking-widest">
                Mensalidade
              </span>
              <div className="flex items-baseline gap-1 sm:gap-1.5 justify-center">
                <span className="font-bold text-lg sm:text-xl text-[#0b1a30]">R$</span>
                <span className="font-black text-[32px] sm:text-[40px] text-[#0b1a30] leading-none tracking-tight truncate">
                  {formatCurrency(totalPricePerMonth).replace('R$', '').trim()}
                </span>
                <span className="font-bold text-neutral-500 text-sm ml-1">/mês</span>
              </div>
              
              <div className="text-xs sm:text-sm font-semibold text-neutral-500 mt-1">
                Total do plano somente <span className="font-black text-[#0b1a30]">{formatCurrency(grandTotal)}</span> para os {usersCount} {usersCount === 1 ? 'acesso' : 'acessos'}
              </div>
            </div>
          </div>
          </div>
        </div>

        {/* Right Side: Payment Form */}
        <div className="checkout-form-card w-full lg:w-7/12 relative z-10 flex flex-col h-fit rounded-[24px] overflow-hidden shadow-sm border border-neutral-100/50 bg-white">
          <div className="absolute inset-[1px] bg-white rounded-[23px] -z-10"></div>
          <div className="w-full h-full bg-transparent p-6 sm:p-10 flex flex-col relative z-0">
            <div className="mb-8">
            <h2 className="text-3xl font-black text-[#0b1a30] mb-2 tracking-tight">Finalizar Assinatura</h2>
            <p className="text-neutral-500 font-medium">Preencha seus dados para liberar seu acesso instantaneamente.</p>
          </div>

          <form onSubmit={handleCheckout} className="checkout-form flex flex-col gap-6 flex-1">
            {/* Personal Data */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-neutral-700 mb-1.5 ml-1">Nome completo</label>
                <input 
                  type="text" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  name="name"
                  autoComplete="name"
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
                    name="email"
                    autoComplete="email"
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
                    name="tel"
                    autoComplete="tel"
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
                  name="document"
                  autoComplete="off"
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

            {/* Order Bump - Treinamentos */}
            <div className="checkout-addons mt-4 pt-6 border-t border-neutral-200 space-y-4">
              <div
                onClick={() => setIncludeOrderBump(!includeOrderBump)}
                className={`checkout-addon relative rounded-2xl p-4 sm:p-5 transition-all duration-300 cursor-pointer select-none border-2 ${
                  includeOrderBump 
                    ? 'bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-amber-500/15 border-amber-500 shadow-lg shadow-amber-500/15 ring-2 ring-amber-500/20' 
                    : 'bg-gradient-to-br from-amber-50/50 via-orange-50/30 to-amber-100/40 border-dashed border-amber-400/90 hover:border-amber-500 hover:bg-amber-50/80'
                }`}
              >
                {/* Top Header & Badges */}
                <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center gap-1 bg-gradient-to-r from-amber-500 to-amber-600 text-white font-black text-[10px] sm:text-[11px] uppercase tracking-wider px-2.5 py-0.5 rounded-full shadow-xs">
                      <Sparkles className="w-3 h-3 fill-white" />
                      RECOMENDADO
                    </span>
                    <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-900 font-black text-[10px] sm:text-[11px] uppercase tracking-wider px-2.5 py-0.5 rounded-full border border-amber-300/70">
                      🔥 9 EM CADA 10 PROFISSIONAIS LEVAM
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-black text-amber-900 uppercase tracking-tight block">
                      + R$ 47,00<span className="text-[10px] text-amber-700 font-bold">/mês</span>
                    </span>
                  </div>
                </div>

                {/* Checkbox & Details */}
                <div className="flex items-start gap-3.5">
                  <div className="pt-0.5 shrink-0">
                    <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${
                      includeOrderBump 
                        ? 'bg-amber-500 border-amber-600 text-white shadow-md shadow-amber-500/30' 
                        : 'border-amber-400 bg-white hover:border-amber-500'
                    }`}>
                      {includeOrderBump && <Check className="w-4 h-4 stroke-[3]" />}
                    </div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <h4 className="font-black text-neutral-900 text-sm sm:text-base leading-snug mb-1">
                      Acesso Completo a Todos os Nossos Treinamentos
                    </h4>
                    <p className="text-xs sm:text-sm text-neutral-600 font-medium leading-relaxed mb-3">
                      Capacitação em vendas, negociações, quebra de objeções e tudo o que seu time necessita para vender mais!
                    </p>

                    {/* Dynamic Duration Badge */}
                    <div className="inline-flex items-center gap-2 bg-white/90 border border-amber-300/80 rounded-xl px-3 py-1.5 text-xs text-amber-900 font-bold shadow-xs">
                      <GraduationCap className="w-4 h-4 text-amber-600 shrink-0" />
                      <span>
                        Acesso liberado por <strong>{contractMonths} {contractMonths === 1 ? 'mês' : 'meses'}</strong> (R$ {bumpTotalAmount},00 total acumulado)
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Order Bump - CRM Agro */}
              <div
                onClick={() => setIncludeCrmBump(!includeCrmBump)}
                className={`checkout-addon relative rounded-2xl p-4 sm:p-5 transition-all duration-300 cursor-pointer select-none border-2 ${
                  includeCrmBump 
                    ? 'bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-amber-500/15 border-amber-500 shadow-lg shadow-amber-500/15 ring-2 ring-amber-500/20' 
                    : 'bg-gradient-to-br from-amber-50/50 via-orange-50/30 to-amber-100/40 border-dashed border-amber-400/90 hover:border-amber-500 hover:bg-amber-50/80'
                }`}
              >
                {/* Top Header & Badges */}
                <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-900 font-black text-[10px] sm:text-[11px] uppercase tracking-wider px-2.5 py-0.5 rounded-full border border-amber-300/70">
                      🔥 6 EM CADA 10 PROFISSIONAIS LEVAM
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-black text-amber-900 uppercase tracking-tight block">
                      + R$ 249,00<span className="text-[10px] text-amber-700 font-bold">/mês</span>
                    </span>
                  </div>
                </div>

                {/* Checkbox & Details */}
                <div className="flex items-start gap-3.5">
                  <div className="pt-0.5 shrink-0">
                    <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${
                      includeCrmBump 
                        ? 'bg-amber-500 border-amber-600 text-white shadow-md shadow-amber-500/30' 
                        : 'border-amber-400 bg-white hover:border-amber-500'
                    }`}>
                      {includeCrmBump && <Check className="w-4 h-4 stroke-[3]" />}
                    </div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <h4 className="font-black text-neutral-900 text-sm sm:text-base leading-snug mb-1">
                      CRM Feito para Vendedores do Agro
                    </h4>
                    <p className="text-xs sm:text-sm text-neutral-600 font-medium leading-relaxed mb-3">
                      Simples, objetivo e feito para profissionais do Agro.
                    </p>

                    {/* Dynamic Duration Badge */}
                    <div className="inline-flex items-center gap-2 bg-white/90 border border-amber-300/80 rounded-xl px-3 py-1.5 text-xs text-amber-900 font-bold shadow-xs">
                      <Database className="w-4 h-4 text-amber-600 shrink-0" />
                      <span>
                        Acesso liberado por <strong>{contractMonths} {contractMonths === 1 ? 'mês' : 'meses'}</strong> (R$ {crmTotalAmount},00 total acumulado)
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Method Selection */}
            <div className="checkout-payment-methods mt-4 pt-6 border-t border-neutral-200">
              <label className="block text-base font-bold text-neutral-900 mb-4">Forma de pagamento (Asaas)</label>
              <div className="grid grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('pix_automatic')}
                  className={`flex flex-col items-center justify-center gap-3 p-4 rounded-xl border-2 transition-all ${
                    paymentMethod === 'pix_automatic'
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
                {/* Visa Badge */}
                <div className="flex items-center justify-center font-extrabold italic text-[#1434CB] bg-white border border-neutral-200 px-2 py-0.5 rounded text-[12px] h-[22px] tracking-tighter select-none font-sans leading-none shadow-sm">
                  <span className="text-[#F5A623]">V</span>ISA
                </div>
                {/* Mastercard-like overlapping circles */}
                <svg className="h-[22px] w-auto py-0.5" viewBox="0 0 32 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="10" cy="10" r="10" fill="#EB001B"/>
                  <circle cx="22" cy="10" r="10" fill="#F79E1B" fillOpacity="0.8"/>
                </svg>
                {/* Generic Amex-like minimal */}
                <div className="text-[10px] h-[22px] flex items-center justify-center font-bold border border-blue-600 text-blue-600 bg-white px-1.5 rounded uppercase tracking-wider shadow-sm select-none">
                  AMEX
                </div>
                {/* Generic Elo-like minimal */}
                <div className="text-[10px] h-[22px] flex items-center justify-center font-bold border border-black bg-black text-white px-2 rounded uppercase tracking-wider shadow-sm select-none">
                  elo
                </div>
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
                      name="cc-number"
                      autoComplete="cc-number"
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
                        name="cc-exp"
                        autoComplete="cc-exp"
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
                        name="cc-csc"
                        autoComplete="cc-csc"
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
                      name="cc-name"
                      autoComplete="cc-name"
                      required={paymentMethod === 'credit_card'}
                      placeholder="Como impresso no cartão" 
                      className="w-full px-4 py-3.5 bg-neutral-50 border border-neutral-300 rounded-xl focus:outline-none focus:ring-4 focus:ring-[#0070f3]/15 focus:border-[#0070f3] focus:bg-white transition-all text-base font-medium placeholder-gray-400"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-neutral-700 mb-1.5 ml-1">CEP</label>
                      <input
                        type="text"
                        value={cardPostalCode}
                        onChange={(e) => setCardPostalCode(e.target.value.replace(/\D/g, '').slice(0, 8))}
                        name="postal-code"
                        autoComplete="postal-code"
                        required={paymentMethod === 'credit_card'}
                        placeholder="00000-000"
                        className="w-full px-4 py-3.5 bg-neutral-50 border border-neutral-300 rounded-xl focus:outline-none focus:ring-4 focus:ring-[#0070f3]/15 focus:border-[#0070f3] focus:bg-white transition-all text-base font-medium placeholder-gray-400"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-neutral-700 mb-1.5 ml-1">Número</label>
                      <input
                        type="text"
                        value={cardAddressNumber}
                        onChange={(e) => setCardAddressNumber(e.target.value.slice(0, 20))}
                        name="address-number"
                        autoComplete="address-line2"
                        required={paymentMethod === 'credit_card'}
                        placeholder="123"
                        className="w-full px-4 py-3.5 bg-neutral-50 border border-neutral-300 rounded-xl focus:outline-none focus:ring-4 focus:ring-[#0070f3]/15 focus:border-[#0070f3] focus:bg-white transition-all text-base font-medium placeholder-gray-400"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {checkoutError && (
              <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-800">
                {checkoutError}
              </div>
            )}

            {/* Submit Button */}
            <div className="mt-8">
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-6">
                 <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 rounded-full border border-emerald-200/60 shadow-sm">
                   <ShieldCheck className="w-5 h-5 text-[#00a83e]" />
                   <span className="text-xs sm:text-sm font-black text-emerald-800 uppercase tracking-wider">Garantia incondicional de 7 dias</span>
                 </div>
                 <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50/80 rounded-full border border-blue-200/60 shadow-sm">
                   <Lock className="w-4.5 h-4.5 text-blue-600" />
                   <span className="text-xs sm:text-sm font-black text-blue-800 uppercase tracking-wider">Certificação de Segurança SSL</span>
                 </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="checkout-submit-button"
                aria-label={isSubmitting ? 'Processando assinatura' : 'Concluir assinatura'}
              >
                <span className="checkout-submit-left" aria-hidden="true">
                  <span className="checkout-submit-card">
                    <span className="checkout-submit-card-line" />
                    <span className="checkout-submit-card-dots" />
                  </span>
                  <span className="checkout-submit-receipt">
                    <span className="checkout-submit-receipt-line" />
                    <span className="checkout-submit-receipt-screen">$</span>
                    <span className="checkout-submit-receipt-numbers" />
                    <span className="checkout-submit-receipt-numbers checkout-submit-receipt-numbers--second" />
                  </span>
                </span>
                <span className="checkout-submit-text">{isSubmitting ? 'Processando...' : 'Concluir assinatura'}</span>
              </button>
              
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
      
    {/* Success Confirmation Modal */}
    {showSuccessModal && (
      <div className="fixed inset-0 bg-neutral-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in duration-300">
        <div className="max-w-lg w-full bg-white rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden text-center border border-emerald-100">
          {/* Top Green Accent Bar */}
          <div className="absolute top-0 left-0 right-0 h-2.5 bg-gradient-to-r from-[#004d1a] via-[#00a83e] to-[#00c853]" />

          {/* Icon */}
          <div className="inline-flex items-center justify-center w-20 h-20 bg-emerald-50 rounded-full border border-emerald-100 mb-5 relative">
            <span className="absolute inset-0 bg-emerald-400/20 blur-lg rounded-full animate-pulse"></span>
            <CheckCircle2 className="w-10 h-10 text-[#00a83e] relative z-10" />
          </div>

          {/* Title */}
          <h2 className="text-2xl sm:text-3xl font-black text-[#0b1a30] tracking-tight mb-2 uppercase">
            {checkoutResult?.kind === 'pix' ? 'Pague com Pix' : checkoutResult?.kind === 'boleto' ? 'Pagamento por boleto' : 'Pagamento iniciado'}
          </h2>
          <p className="text-neutral-600 font-medium text-sm sm:text-base max-w-md mx-auto mb-6 leading-relaxed">
            {checkoutResult?.kind === 'pix'
              ? 'Escaneie o QR Code ou copie o código Pix para concluir o pagamento.'
              : checkoutResult?.kind === 'boleto'
                ? (checkoutResult.processing ? 'Seu boleto está sendo preparado. Aguarde alguns instantes e tente novamente.' : 'Abra o boleto para concluir o pagamento.')
                : 'Aguarde a confirmação do pagamento para liberar o acesso.'}
          </p>

          {checkoutResult?.kind === 'pix' && (
            <div className="mb-6 rounded-2xl border border-emerald-100 bg-emerald-50/60 p-4">
              <img src={checkoutResult.qrCodeImage} alt="QR Code Pix" className="mx-auto h-44 w-44 rounded-lg bg-white p-2" />
              <button
                type="button"
                onClick={() => void navigator.clipboard?.writeText(checkoutResult.payload)}
                className="mt-4 w-full rounded-xl border border-emerald-200 bg-white px-4 py-3 text-sm font-bold text-emerald-800 transition-colors hover:bg-emerald-100"
              >
                COPIAR CÓDIGO PIX
              </button>
            </div>
          )}

          {/* Steps / Info Grid */}
          <div className="flex flex-col gap-3 text-left mb-8 max-w-md mx-auto">
            <div className="p-4 bg-blue-50/60 border border-blue-100/70 rounded-2xl flex gap-3.5 items-center">
              <div className="p-2.5 bg-blue-100/70 text-blue-600 rounded-xl shrink-0">
                <MessageSquare className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-neutral-800 text-xs sm:text-sm leading-snug">
                O agente enviará uma mensagem de saudação no seu WhatsApp.
              </h3>
            </div>

            <div className="p-4 bg-emerald-50/70 border border-emerald-100/70 rounded-2xl flex gap-3.5 items-center">
              <div className="p-2.5 bg-emerald-100/70 text-[#00a83e] rounded-xl shrink-0">
                <Clock className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-neutral-800 text-xs sm:text-sm leading-snug">
                Seu acesso estará ativo e liberado em até 10 minutos.
              </h3>
            </div>
          </div>

          {checkoutResult?.kind === 'boleto' && checkoutResult.bankSlipUrl ? (
            <a
              href={checkoutResult.bankSlipUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-4 px-6 bg-gradient-to-r from-[#004d1a] via-[#00a83e] to-[#00c853] hover:from-[#006020] hover:via-[#00b944] hover:to-[#05d95b] text-white font-extrabold text-sm sm:text-base uppercase tracking-wider rounded-2xl shadow-xl shadow-emerald-600/30 hover:scale-[1.01] active:scale-[0.99] transition-all duration-300 flex items-center justify-center gap-2 group"
            >
              <span>ABRIR BOLETO</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </a>
          ) : (
            <button
              type="button"
              onClick={() => setShowSuccessModal(false)}
              className="w-full py-4 px-6 bg-gradient-to-r from-[#004d1a] via-[#00a83e] to-[#00c853] hover:from-[#006020] hover:via-[#00b944] hover:to-[#05d95b] text-white font-extrabold text-sm sm:text-base uppercase tracking-wider rounded-2xl shadow-xl shadow-emerald-600/30 hover:scale-[1.01] active:scale-[0.99] transition-all duration-300 flex items-center justify-center gap-2 group"
            >
              <span>VOLTAR AO CHECKOUT</span>
            </button>
          )}
        </div>
      </div>
    )}

    {/* Floating WhatsApp Chat Widget */}
    <WhatsAppWidget />
  </>
);
}
