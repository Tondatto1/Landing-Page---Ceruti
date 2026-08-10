import React, { useEffect, useRef, useState } from 'react';
import { ArrowLeft, Check, ChevronDown, CreditCard, FileText, LockKeyhole, QrCode, ShieldCheck } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
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

type Agent = 'consultor' | 'campo';
type Frequency = 'mensal' | 'semestral' | 'anual';
type PaymentMethod = 'pix_automatic' | 'credit_card' | 'boleto';

const frequencyApi: Record<Frequency, 'monthly' | 'semiannual' | 'annual'> = {
  mensal: 'monthly', semestral: 'semiannual', anual: 'annual',
};

function formatCurrency(value: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
}

function unitPrice(agent: Agent, frequency: Frequency, quantity: number) {
  const price = agent === 'consultor'
    ? quantity <= 10
      ? { mensal: 337.45, semestral: 297.75, anual: 258.05 }
      : { mensal: 297.75, semestral: 258.05, anual: 218.35 }
    : quantity <= 10
      ? { mensal: 125.38, semestral: 110.63, anual: 95.88 }
      : { mensal: 110.63, semestral: 95.88, anual: 81.13 };
  return price[frequency];
}

function formatPhone(value: string) {
  const digits = value.replace(/\D/g, '').slice(0, 11);
  if (digits.length <= 2) return digits;
  const tail = digits.slice(2);
  return `(${digits.slice(0, 2)}) ${tail.slice(0, tail.startsWith('9') ? 5 : 4)}${tail.length > (tail.startsWith('9') ? 5 : 4) ? `-${tail.slice(tail.startsWith('9') ? 5 : 4)}` : ''}`;
}

export function CheckoutPageRedesign() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [agent, setAgent] = useState<Agent>(params.get('agent') === 'campo' ? 'campo' : 'consultor');
  const [frequency, setFrequency] = useState<Frequency>('mensal');
  const [quantityText, setQuantityText] = useState('1');
  const quantity = Math.min(500, Math.max(1, Number.parseInt(quantityText, 10) || 1));
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('pix_automatic');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [documentNumber, setDocumentNumber] = useState('');
  const [accessNumbers, setAccessNumbers] = useState<string[]>([]);
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [cardName, setCardName] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [addressNumber, setAddressNumber] = useState('');
  const [showExtras, setShowExtras] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{ type: 'pix'; qr: string; payload: string } | { type: 'boleto'; url?: string; processing: boolean } | null>(null);
  const attemptRef = useRef<CheckoutAttempt | null>(null);

  const months = frequency === 'mensal' ? 1 : frequency === 'semestral' ? 6 : 12;
  const monthlyTotal = unitPrice(agent, frequency, quantity) * quantity;

  useEffect(() => {
    setAccessNumbers((current) => Array.from({ length: Math.max(0, quantity - 1) }, (_, index) => current[index] ?? ''));
  }, [quantity]);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('ceruti_checkout_contact') ?? '{}') as { name?: string; email?: string };
      if (typeof saved.name === 'string') setName(saved.name);
      if (typeof saved.email === 'string') setEmail(saved.email);
    } catch { /* Browser autocomplete remains available. */ }
  }, []);

  useEffect(() => {
    if (!name.trim() && !email.trim()) return;
    try { localStorage.setItem('ceruti_checkout_contact', JSON.stringify({ name: name.trim(), email: email.trim() })); } catch { /* optional */ }
  }, [name, email]);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (submitting) return;
    setError('');
    setResult(null);
    const cleanPhone = phone.replace(/\D/g, '');
    const cleanDocument = documentNumber.replace(/\D/g, '');
    const cleanAccesses = accessNumbers.map((item) => item.replace(/\D/g, ''));
    if (!name.trim() || !email.trim() || cleanPhone.length < 10 || ![11, 14].includes(cleanDocument.length) || cleanAccesses.some((item) => item.length < 10)) {
      setError('Confira seus dados e os números de acesso antes de continuar.');
      return;
    }

    const base: Omit<BillingCheckoutRequest, 'paymentMethod'> = {
      agentType: agent,
      frequency: frequencyApi[frequency],
      accessQuantity: quantity,
      customer: { name: name.trim(), email: email.trim(), phone: cleanPhone, documentNumber: cleanDocument },
      ...(cleanAccesses.length ? { accessNumbers: cleanAccesses } : {}),
    };
    let body: BillingCheckoutRequest | CreditCardCheckoutRequest;
    if (paymentMethod === 'credit_card') {
      const number = cardNumber.replace(/\D/g, '');
      const expiry = cardExpiry.replace(/\D/g, '');
      const zip = postalCode.replace(/\D/g, '');
      const month = expiry.slice(0, 2);
      const year = expiry.length === 4 ? `20${expiry.slice(2)}` : '';
      if (!cardName.trim() || number.length < 13 || !/^(0[1-9]|1[0-2])$/.test(month) || !year || cardCvv.length < 3 || zip.length !== 8 || !addressNumber.trim()) {
        setError('Confira os dados do cartão, o CEP e o número do endereço.');
        return;
      }
      body = {
        ...base,
        paymentMethod: 'credit_card',
        creditCard: { holderName: cardName.trim(), number, expiryMonth: month, expiryYear: year, ccv: cardCvv },
        creditCardHolderInfo: { name: name.trim(), email: email.trim(), cpfCnpj: cleanDocument, postalCode: zip, addressNumber: addressNumber.trim(), phone: cleanPhone, mobilePhone: cleanPhone },
      };
    } else {
      body = { ...base, paymentMethod };
    }

    attemptRef.current = createCheckoutAttempt(attemptRef.current, body, () => crypto.randomUUID());
    setSubmitting(true);
    try {
      const response = await postBillingCheckout(attemptRef.current, body);
      if (paymentMethod === 'credit_card') {
        const card = parseTransparentCardCheckout(response.data, response.status);
        if (!card) throw new BillingApiError('A resposta do pagamento não pôde ser validada. Tente novamente.', { recoverable: false });
        window.location.assign(card.completionUrl);
        return;
      }
      const data = response.data as { ok?: unknown; paymentFlow?: unknown; pix?: { qrCodeImage?: unknown; payload?: unknown } };
      if (data.ok === true && data.paymentFlow === 'PIX_AUTOMATIC' && typeof data.pix?.qrCodeImage === 'string' && typeof data.pix.payload === 'string') {
        setResult({ type: 'pix', qr: data.pix.qrCodeImage, payload: data.pix.payload });
        return;
      }
      const boleto = parseBoletoCheckout(response.data);
      if (boleto) {
        setResult({ type: 'boleto', processing: boleto.state === 'PROCESSING', ...(boleto.state === 'READY' ? { url: boleto.bankSlipUrl } : {}) });
        return;
      }
      throw new BillingApiError('A resposta do pagamento não pôde ser validada. Tente novamente.', { recoverable: false });
    } catch (reason) {
      setError(reason instanceof BillingApiError ? reason.message : 'Não foi possível iniciar o pagamento agora. Tente novamente.');
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass = 'mt-1.5 h-12 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-base text-slate-900 outline-none transition focus:border-emerald-600 focus:ring-4 focus:ring-emerald-100';
  return (
    <div className="min-h-screen bg-[#f6f8f7] font-sans text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex h-16 max-w-6xl items-center px-4 sm:px-6">
          <button type="button" onClick={() => navigate('/')} className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-emerald-800"><ArrowLeft className="h-4 w-4" /> Voltar</button>
          <img src="/LETRA ESCURA - FUNDO TRANS - HOR.png" alt="Ceruti" className="ml-auto h-8 w-auto" />
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-7 sm:px-6 sm:py-10">
        <div className="mb-7 max-w-2xl">
          <p className="text-sm font-semibold text-emerald-700">Checkout seguro</p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">Concluir assinatura</h1>
          <p className="mt-2 text-sm leading-6 text-slate-600">Informe seus dados e escolha como prefere pagar. Você verá a confirmação antes de qualquer liberação de acesso.</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_330px] lg:items-start">
          <form onSubmit={submit} className="space-y-5">
            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <div className="flex items-center gap-3"><span className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-700 text-sm font-bold text-white">1</span><h2 className="text-lg font-bold">Sua assinatura</h2></div>
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <label className="text-sm font-medium">Produto<select value={agent} onChange={(e) => setAgent(e.target.value as Agent)} className={inputClass}><option value="consultor">Agente Consultor</option><option value="campo">Agente Campo</option></select></label>
                <label className="text-sm font-medium">Quantidade de acessos<input value={quantityText} onChange={(e) => setQuantityText(e.target.value.replace(/\D/g, '').slice(0, 3))} inputMode="numeric" className={inputClass} /></label>
              </div>
              <div className="mt-4 grid grid-cols-3 gap-2" role="radiogroup" aria-label="Periodicidade">
                {(['mensal', 'semestral', 'anual'] as Frequency[]).map((item) => <button key={item} type="button" onClick={() => setFrequency(item)} className={`min-h-12 rounded-xl border px-2 text-sm font-semibold transition ${frequency === item ? 'border-emerald-700 bg-emerald-50 text-emerald-900' : 'border-slate-200 text-slate-600 hover:border-slate-300'}`}>{item === 'mensal' ? 'Mensal' : item === 'semestral' ? 'Semestral' : 'Anual'}</button>)}
              </div>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <div className="flex items-center gap-3"><span className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-700 text-sm font-bold text-white">2</span><h2 className="text-lg font-bold">Dados de acesso</h2></div>
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <label className="text-sm font-medium sm:col-span-2">Nome completo<input required name="name" autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} className={inputClass} placeholder="Como devemos te chamar" /></label>
                <label className="text-sm font-medium">E-mail<input required type="email" name="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} className={inputClass} placeholder="voce@empresa.com" /></label>
                <label className="text-sm font-medium">WhatsApp<input required type="tel" name="tel" autoComplete="tel" value={phone} onChange={(e) => setPhone(formatPhone(e.target.value))} className={inputClass} placeholder="(00) 00000-0000" /></label>
                <label className="text-sm font-medium sm:col-span-2">CPF ou CNPJ<input required inputMode="numeric" autoComplete="off" value={documentNumber} onChange={(e) => setDocumentNumber(e.target.value.replace(/\D/g, '').slice(0, 14))} className={inputClass} placeholder="Somente números" /></label>
              </div>
              {accessNumbers.length > 0 && <div className="mt-5 border-t border-slate-100 pt-5"><p className="text-sm font-semibold">Acessos adicionais</p><div className="mt-3 grid gap-3 sm:grid-cols-2">{accessNumbers.map((value, index) => <label key={index} className="text-sm font-medium">Acesso {index + 2}<input required type="tel" autoComplete="tel" value={value} onChange={(e) => setAccessNumbers((current) => current.map((item, itemIndex) => itemIndex === index ? formatPhone(e.target.value) : item))} className={inputClass} placeholder="(00) 00000-0000" /></label>)}</div></div>}
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <div className="flex items-center gap-3"><span className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-700 text-sm font-bold text-white">3</span><h2 className="text-lg font-bold">Pagamento</h2></div>
              <div className="mt-5 grid gap-2 sm:grid-cols-3">
                {([{ key: 'pix_automatic', label: 'Pix', icon: QrCode }, { key: 'credit_card', label: 'Cartão', icon: CreditCard }, { key: 'boleto', label: 'Boleto', icon: FileText }] as const).map(({ key, label, icon: Icon }) => <button key={key} type="button" onClick={() => setPaymentMethod(key)} className={`flex min-h-14 items-center justify-center gap-2 rounded-xl border px-3 text-sm font-semibold transition ${paymentMethod === key ? 'border-emerald-700 bg-emerald-50 text-emerald-900' : 'border-slate-200 text-slate-600 hover:border-slate-300'}`}><Icon className="h-5 w-5" />{label}</button>)}
              </div>
              {paymentMethod === 'credit_card' && <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <label className="text-sm font-medium sm:col-span-2">Número do cartão<input required name="cc-number" autoComplete="cc-number" inputMode="numeric" value={cardNumber} onChange={(e) => setCardNumber(e.target.value.replace(/\D/g, '').slice(0, 16).replace(/(\d{4})(?=\d)/g, '$1 '))} className={inputClass} /></label>
                <label className="text-sm font-medium">Validade<input required name="cc-exp" autoComplete="cc-exp" inputMode="numeric" value={cardExpiry} onChange={(e) => { const digits = e.target.value.replace(/\D/g, '').slice(0, 4); setCardExpiry(digits.length > 2 ? `${digits.slice(0, 2)}/${digits.slice(2)}` : digits); }} className={inputClass} placeholder="MM/AA" /></label>
                <label className="text-sm font-medium">CVV<input required name="cc-csc" autoComplete="cc-csc" inputMode="numeric" value={cardCvv} onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, '').slice(0, 4))} className={inputClass} /></label>
                <label className="text-sm font-medium sm:col-span-2">Nome no cartão<input required name="cc-name" autoComplete="cc-name" value={cardName} onChange={(e) => setCardName(e.target.value)} className={inputClass} /></label>
                <label className="text-sm font-medium">CEP<input required name="postal-code" autoComplete="postal-code" inputMode="numeric" value={postalCode} onChange={(e) => setPostalCode(e.target.value.replace(/\D/g, '').slice(0, 8))} className={inputClass} /></label>
                <label className="text-sm font-medium">Número<input required name="address-number" autoComplete="address-line2" value={addressNumber} onChange={(e) => setAddressNumber(e.target.value)} className={inputClass} /></label>
              </div>}
            </section>

            <details className="rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm" open={showExtras} onToggle={(event) => setShowExtras((event.currentTarget as HTMLDetailsElement).open)}>
              <summary className="flex cursor-pointer list-none items-center justify-between text-sm font-semibold">Adicionais <span className="text-xs font-medium text-slate-500">Indisponíveis para cobrança online <ChevronDown className="ml-1 inline h-4 w-4" /></span></summary>
              <p className="mt-3 text-sm leading-6 text-slate-600">Treinamentos e CRM Agro serão disponibilizados quando estiverem integrados ao mesmo contrato de cobrança. Eles não serão cobrados junto desta assinatura por enquanto.</p>
            </details>

            {error && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-800">{error}</p>}
            <button type="submit" disabled={submitting} className="flex min-h-14 w-full items-center justify-center gap-2 rounded-xl bg-emerald-700 px-5 text-base font-semibold text-white shadow-sm transition hover:bg-emerald-800 focus:outline-none focus:ring-4 focus:ring-emerald-200 disabled:cursor-wait disabled:opacity-70"><LockKeyhole className="h-5 w-5" />{submitting ? 'Processando pagamento...' : 'Concluir assinatura'}</button>
            <p className="flex items-center justify-center gap-2 text-center text-xs text-slate-500"><ShieldCheck className="h-4 w-4 text-emerald-700" />Pagamento processado com segurança pela Asaas.</p>
          </form>

          <aside className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm lg:sticky lg:top-6">
            <p className="text-sm font-semibold text-slate-500">Resumo do pedido</p>
            <h2 className="mt-2 text-lg font-bold">Agente {agent === 'consultor' ? 'Consultor' : 'Campo'}</h2>
            <p className="mt-1 text-sm text-slate-600">{quantity} {quantity === 1 ? 'acesso' : 'acessos'} · plano {frequency}</p>
            <div className="my-5 border-t border-slate-100" />
            <div className="flex items-end justify-between gap-4"><div><p className="text-sm text-slate-600">Mensalidade</p><p className="mt-1 text-xs text-slate-500">Compromisso de {months} {months === 1 ? 'mês' : 'meses'}</p></div><strong className="text-xl tracking-tight">{formatCurrency(monthlyTotal)}</strong></div>
            <p className="mt-5 rounded-xl bg-slate-50 px-3 py-3 text-xs leading-5 text-slate-600"><Check className="mr-1 inline h-4 w-4 text-emerald-700" />Os valores finais e a ativação são confirmados pela plataforma de pagamento.</p>
          </aside>
        </div>
      </main>

      {result && <div className="fixed inset-0 z-50 flex items-end bg-slate-950/40 p-0 sm:items-center sm:justify-center sm:p-4"><div className="w-full rounded-t-3xl bg-white p-6 shadow-2xl sm:max-w-md sm:rounded-3xl"><h2 className="text-xl font-bold">{result.type === 'pix' ? 'Pague com Pix' : 'Pagamento por boleto'}</h2>{result.type === 'pix' ? <><p className="mt-2 text-sm text-slate-600">Escaneie o QR Code ou copie o código Pix.</p><img src={result.qr} alt="QR Code Pix" className="mx-auto my-5 h-48 w-48 rounded-xl border border-slate-100 p-2" /><button type="button" onClick={() => void navigator.clipboard?.writeText(result.payload)} className="min-h-12 w-full rounded-xl border border-emerald-200 bg-emerald-50 px-4 text-sm font-semibold text-emerald-800">Copiar código Pix</button></> : <><p className="mt-2 text-sm text-slate-600">{result.processing ? 'Seu boleto está sendo preparado. Tente novamente em alguns instantes.' : 'Abra o boleto para concluir o pagamento.'}</p>{result.url && <a href={result.url} target="_blank" rel="noopener noreferrer" className="mt-5 flex min-h-12 items-center justify-center rounded-xl bg-emerald-700 px-4 text-sm font-semibold text-white">Abrir boleto</a>}</>}<button type="button" onClick={() => setResult(null)} className="mt-3 min-h-11 w-full text-sm font-semibold text-slate-600">Voltar</button></div></div>}
    </div>
  );
}
