import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  CreditCard,
  Lock,
  ShieldCheck,
  Users,
  QrCode,
  Sparkles,
  Check,
  GraduationCap,
  CheckCircle2,
  Clock,
  Copy,
  LoaderCircle,
  X,
  MessageSquare,
  Flame,
} from 'lucide-react';
import { WhatsAppWidget } from './WhatsAppWidget';
import { Aurora } from './Aurora';
import { OglAurora } from './OglAurora';
import { trackMetaEvent } from '../lib/metaPixel';
import {
  BillingApiError,
  capPixExpirationAt24Hours,
  buildCheckoutPayload,
  buildSmokeCheckoutPayloadBase,
  createCheckoutContractFingerprint,
  createCheckoutAttempt,
  createCheckoutRedirectGuard,
  createSmokeCheckoutAttempt,
  createCheckoutAbandonmentIdempotencyKey,
  discardCheckoutAttempt,
  identifyBillingCheckoutResponse,
  parseHostedCardCheckout,
  parseBoletoCheckout,
  parsePixUpfrontCheckout,
  parseSmokePixAutomaticCheckout,
  parseTransparentCardCheckout,
  postBillingAbandonPayment,
  postBillingCheckout,
  postBillingSmokeCheckout,
  pollOrderUntilCompletion,
  clearPersistedTrackedCardCheckout,
  clearPersistedTrackedPixUpfrontCheckout,
  getCheckoutStatusDiagnostics,
  isCheckoutSuccessfullyCompleted,
  persistTrackedCardCheckout,
  persistTrackedPixUpfrontCheckout,
  clearPixCancelBlock,
  persistPixCancelBlock,
  readPixCancelBlock,
  readPersistedTrackedCardCheckout,
  readPersistedTrackedPixUpfrontCheckout,
  toPixCheckoutDisplay,
  type BillingCheckoutRequest,
  type BillingAddon,
  type CheckoutAttempt,
  type PersistedCardCheckout,
  type PersistedPixUpfrontCheckout,
  type CreditCardCheckoutRequest,
  type ResumeCheckoutRequest,
  type ResumeCreditCardCheckoutRequest,
  type SmokeCheckoutRequest,
} from '../services/billingCheckout';
import { consumeCapturedSmokeSession, reportSmokeSessionDiagnostic } from '../services/smokeSession';
import { getCheckoutDisplayPricing } from '../services/checkoutDisplayPricing';
import { formatCpfCnpjInput, formatCepInput, isValidCpf, normalizeCardAddressNumber } from '../services/checkoutInputFormatting';
import { formatPixRemainingTime } from '../services/pixTime';
import {
  CheckoutResumeApiError,
  consumeCapturedCheckoutResumeRequest,
  getCapturedCheckoutResumeToken,
  getCheckoutResumeContext,
  type CheckoutResumeContext,
} from '../services/checkoutResume';

type CheckoutUiState = 'idle' | 'submitting' | 'awaiting_payment' | 'provisioning' | 'completed' | 'error';
type CheckoutTransitionState = 'idle' | 'abandoning' | 'reconciliation_required' | 'rate_limited' | 'payment_confirmed';

function checkoutDiagnostic(event: string, details: Record<string, unknown> = {}) {
  const runtimeMode = (import.meta as unknown as { env?: { MODE?: string } }).env?.MODE;
  if (runtimeMode === 'test') return;
  console.info('[ceruti:checkout]', { event, ...details });
}

function CheckoutSpinner() {
  return <span className="checkout-spinner" aria-hidden="true" />;
}

export function CheckoutPage() {
  const navigate = useNavigate();
  const isSmokeMode = new URLSearchParams(window.location.search).get('smoke') === '1';
  const smokeSessionRef = useRef<string | null>(isSmokeMode ? consumeCapturedSmokeSession() : null);
  const resumeTokenRef = useRef<string | null>(getCapturedCheckoutResumeToken());
  const resumeRequestedRef = useRef(consumeCapturedCheckoutResumeRequest());
  const isResumeMode = resumeRequestedRef.current;
  const restoredPixCheckoutRef = useRef<PersistedPixUpfrontCheckout | null>(
    !isSmokeMode && !isResumeMode ? readPersistedTrackedPixUpfrontCheckout() : null,
  );
  const restoredPixCheckout = restoredPixCheckoutRef.current;
  const restoredCardCheckoutRef = useRef<PersistedCardCheckout | null>(
    !isSmokeMode && !isResumeMode ? readPersistedTrackedCardCheckout() : null,
  );
  const restoredCardCheckout = restoredCardCheckoutRef.current;
  const restoredShowsPayment = restoredPixCheckout?.state === 'pending' || restoredPixCheckout?.state === 'payment_confirmed';
  // The upstream landing is now Campo-only. Keep this fixed so the visible
  // offer and the Billing API payload cannot diverge.
  const selectedAgent = 'campo' as const;
  const [frequency, setFrequency] = useState<'mensal' | 'semestral' | 'anual'>('mensal');
  const [usersCountStr, setUsersCountStr] = useState<string>('1');
  const usersCount = Math.max(1, parseInt(usersCountStr) || 1);
  const [paymentMethod, setPaymentMethod] = useState<'credit_card' | 'pix' | 'boleto'>(restoredCardCheckout ? 'credit_card' : 'pix');
  const [addons, setAddons] = useState<BillingAddon[]>([]);
  const [showSuccessModal, setShowSuccessModal] = useState<boolean>(Boolean(restoredShowsPayment || restoredCardCheckout));
  const [checkoutError, setCheckoutError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [checkoutUiState, setCheckoutUiState] = useState<CheckoutUiState>(
    restoredPixCheckout?.state === 'payment_confirmed' ? 'provisioning' : restoredPixCheckout ? 'awaiting_payment' : 'idle',
  );
  const [checkoutTransitionState, setCheckoutTransitionState] = useState<CheckoutTransitionState>(
    restoredPixCheckout?.state === 'abandoning' ? 'abandoning' : restoredPixCheckout?.state === 'reconciliation_required' ? 'reconciliation_required' : restoredPixCheckout?.state === 'payment_confirmed' ? 'payment_confirmed' : 'idle',
  );
  const [pixCancelBlockedUntil, setPixCancelBlockedUntil] = useState<number | null>(
    restoredPixCheckout ? readPixCancelBlock(restoredPixCheckout.orderId) : null,
  );
  const [checkoutResult, setCheckoutResult] = useState<
    | { kind: 'pix'; qrCodeSrc?: string; pixPayload: string; expiresAt?: number; amount: number }
    | { kind: 'card' }
    | { kind: 'boleto'; bankSlipUrl?: string }
    | null
  >(restoredPixCheckout ? {
    kind: 'pix',
    ...(restoredPixCheckout.qrCodeSrc ? { qrCodeSrc: restoredPixCheckout.qrCodeSrc } : {}),
    pixPayload: restoredPixCheckout.pixPayload ?? '',
    ...(restoredPixCheckout.expiresAt !== undefined ? { expiresAt: restoredPixCheckout.expiresAt } : {}),
    amount: restoredPixCheckout.amount ?? 0,
  } : restoredCardCheckout ? { kind: 'card' } : null);
  const [trackedOrder, setTrackedOrder] = useState<{ orderId: string; statusUrl: string } | null>(
    restoredPixCheckout
      ? { orderId: restoredPixCheckout.orderId, statusUrl: restoredPixCheckout.statusUrl }
      : restoredCardCheckout
        ? { orderId: restoredCardCheckout.orderId, statusUrl: restoredCardCheckout.statusUrl }
        : null,
  );
  const [paymentState, setPaymentState] = useState<'awaiting' | 'checking' | 'temporary_error' | 'awaiting_completion' | 'timeout' | 'terminal'>(
    restoredPixCheckout?.state === 'payment_confirmed' ? 'awaiting_completion' : (restoredPixCheckout || restoredCardCheckout) ? 'checking' : 'awaiting',
  );
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState(false);
  const [pixNow, setPixNow] = useState(() => Date.now());
  const [isDocumentHidden, setIsDocumentHidden] = useState(
    () => typeof document !== 'undefined' && document.visibilityState === 'hidden',
  );
  const pollingOrderRef = useRef<string | null>(null);
  const terminalOrderRef = useRef<string | null>(null);
  const checkoutSequenceRef = useRef(0);
  const redirectGuardRef = useRef(createCheckoutRedirectGuard());

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [documentNumber, setDocumentNumber] = useState('');
  const [accessNumbers, setAccessNumbers] = useState<string[]>([]);

  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [cardName, setCardName] = useState('');
  const [cardPostalCode, setCardPostalCode] = useState('');
  const [cardAddressNumber, setCardAddressNumber] = useState('');
  const checkoutAttemptRef = useRef<CheckoutAttempt | null>(null);
  const checkoutRequestAbortRef = useRef<AbortController | null>(null);
  const pollingAbortRef = useRef<AbortController | null>(null);
  const activeCheckoutFingerprintRef = useRef<string | null>(restoredPixCheckout?.fingerprint ?? restoredCardCheckout?.fingerprint ?? null);
  const activePixCheckoutRef = useRef<PersistedPixUpfrontCheckout | null>(restoredPixCheckout);
  const activeCardCheckoutRef = useRef<PersistedCardCheckout | null>(restoredCardCheckout);
  const abandonmentRequestRef = useRef<AbortController | null>(null);
  const abandonmentOperationRef = useRef<string | null>(null);
  const abandonmentPromiseRef = useRef<Promise<void> | null>(null);
  const forceNewAttemptRef = useRef(false);
  const [resumeState, setResumeState] = useState<'loading' | 'ready' | 'error'>(
    isResumeMode ? (resumeTokenRef.current ? 'loading' : 'error') : 'ready',
  );
  const [resumeErrorCode, setResumeErrorCode] = useState(isResumeMode && !resumeTokenRef.current ? 'RESUME_TOKEN_INVALID' : '');
  const [resumeContext, setResumeContext] = useState<CheckoutResumeContext | null>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    const scrollTimer = setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'instant' });
    }, 100);
    return () => clearTimeout(scrollTimer);
  }, []);

  useEffect(() => {
    try {
      if (isResumeMode) return;
      const saved = localStorage.getItem('ceruti_checkout_contact');
      if (!saved) return;
      const contact = JSON.parse(saved) as { name?: unknown; email?: unknown };
      if (typeof contact.name === 'string') setName(contact.name);
      if (typeof contact.email === 'string') setEmail(contact.email);
    } catch {
      // Browser autocomplete continues to work even if local storage is unavailable.
    }
  }, [isResumeMode]);

  useEffect(() => {
    if (isResumeMode || (!name.trim() && !email.trim())) return;
    try {
      localStorage.setItem('ceruti_checkout_contact', JSON.stringify({
        name: name.trim(),
        email: email.trim(),
      }));
    } catch {
      // Saving a convenience preference must never interrupt checkout.
    }
  }, [email, isResumeMode, name]);

  useEffect(() => {
    const token = resumeTokenRef.current;
    if (!token) return;
    const controller = new AbortController();
    void getCheckoutResumeContext(token, controller.signal)
      .then((context) => {
        if (controller.signal.aborted) return;
        setResumeContext(context);
        setName(context.prefill.name);
        setEmail(context.prefill.email);
        setPhone(context.prefill.phone);
        // Resume starts from the safe server-authorized baseline; the user
        // may choose only another explicitly allowed cadence.
        setFrequency('mensal');
        setUsersCountStr('1');
        setResumeState('ready');
      })
      .catch((error: unknown) => {
        if (controller.signal.aborted) return;
        setResumeErrorCode(error instanceof CheckoutResumeApiError ? error.code : 'RESUME_UNAVAILABLE');
        setResumeState('error');
      });
    return () => controller.abort();
  }, []);

  // Order Bump pricing calculations
  const includesTrainingPlatform = addons.includes('training_platform');
  const trainingPlatformMonthlyPrice = isSmokeMode ? 1 : 47;
  const displayPricing = getCheckoutDisplayPricing({
    isSmokeMode,
    frequency,
    accessQuantity: usersCount,
    addons,
  });
  const frequencyByLabel = { mensal: 'monthly', semestral: 'semiannual', anual: 'annual' } as const;
  const checkoutFingerprint = createCheckoutContractFingerprint({
    agentType: selectedAgent,
    frequency: frequencyByLabel[frequency],
    accessQuantity: usersCount,
    trainingPlatform: includesTrainingPlatform,
    paymentMethod,
  });
  const currentCheckoutFingerprintRef = useRef(checkoutFingerprint);
  currentCheckoutFingerprintRef.current = checkoutFingerprint;

  const updateTrackedPixCheckout = (state: PersistedPixUpfrontCheckout['state']) => {
    const current = activePixCheckoutRef.current;
    if (!current) return null;
    const updated = { ...current, state };
    activePixCheckoutRef.current = updated;
    persistTrackedPixUpfrontCheckout(updated);
    return updated;
  };

  const clearTrackedPixCheckout = () => {
    const tracked = activePixCheckoutRef.current;
    if (tracked) clearPixCancelBlock(tracked.orderId);
    setPixCancelBlockedUntil(null);
    if (tracked) discardCheckoutAttempt({ fingerprint: tracked.fingerprint, key: '' });
    discardCheckoutAttempt(checkoutAttemptRef.current);
    checkoutSequenceRef.current += 1;
    activePixCheckoutRef.current = null;
    clearPersistedTrackedPixUpfrontCheckout();
    activeCheckoutFingerprintRef.current = null;
    checkoutAttemptRef.current = null;
    forceNewAttemptRef.current = true;
    setCheckoutResult(null);
    setTrackedOrder(null);
    setShowSuccessModal(false);
    setPaymentState('awaiting');
    setCheckoutUiState('idle');
  };

  const abandonTrackedPixCheckout = () => {
    const tracked = activePixCheckoutRef.current;
    if (
      !tracked
      || tracked.paymentMethod !== 'pix'
      || tracked.paymentFlow !== 'PIX_UPFRONT'
      || tracked.state === 'payment_confirmed'
    ) return;
    if (pixCancelBlockedUntil !== null && pixCancelBlockedUntil > Date.now()) return;
    const operationKey = `${tracked.orderId}:${tracked.abandonmentIdempotencyKey}`;
    if (abandonmentOperationRef.current === operationKey && abandonmentPromiseRef.current) return;
    const controller = new AbortController();
    abandonmentRequestRef.current = controller;
    abandonmentOperationRef.current = operationKey;
    updateTrackedPixCheckout('abandoning');
    setCheckoutTransitionState('abandoning');
    setShowSuccessModal(false);
    setCheckoutError('');
    setCheckoutUiState('idle');
    const promise = postBillingAbandonPayment(
      tracked.orderId,
      tracked.checkoutControlToken,
      tracked.abandonmentIdempotencyKey,
      fetch,
      controller.signal,
    ).then((result) => {
      if (activePixCheckoutRef.current?.orderId !== tracked.orderId) return;
      if (result.result === 'payment_already_completed') {
        updateTrackedPixCheckout('payment_confirmed');
        setCheckoutTransitionState('payment_confirmed');
        setCheckoutError('O pagamento anterior foi confirmado. Estamos liberando seu acesso.');
        setTrackedOrder({ orderId: result.orderId, statusUrl: result.statusUrl });
        setCheckoutUiState('provisioning');
        setPaymentState('awaiting_completion');
        setShowSuccessModal(true);
        return;
      }
      if (result.result === 'canceled' || result.result === 'already_canceled') {
        if (result.canStartNewCheckout) {
          // Billing explicitly authorizes the current order to be replaced;
          // the next checkout still requires a new explicit plan selection.
        }
        clearTrackedPixCheckout();
        setCheckoutTransitionState('idle');
        setCheckoutError('');
        return;
      }
      updateTrackedPixCheckout('reconciliation_required');
      setCheckoutTransitionState('reconciliation_required');
      setCheckoutError(result.result === 'not_cancellable'
        ? 'Esta tentativa não pode ser cancelada. Atualize o status do pagamento ou fale com o suporte.'
        : 'Estamos confirmando o cancelamento do pagamento anterior. Tente novamente em instantes.');
      setCheckoutUiState('error');
    }).catch((error: unknown) => {
      if (controller.signal.aborted || (error instanceof DOMException && error.name === 'AbortError')) return;
      if (activePixCheckoutRef.current?.orderId !== tracked.orderId) return;
      if (error instanceof BillingApiError && error.status === 429 && error.code === 'PAYMENT_CHANGE_RATE_LIMITED') {
        const blockedUntil = Date.now() + (error.retryAfterMs ?? 600_000);
        persistPixCancelBlock(tracked.orderId, blockedUntil);
        setPixCancelBlockedUntil(blockedUntil);
        updateTrackedPixCheckout('reconciliation_required');
        setCheckoutTransitionState('rate_limited');
        setCheckoutError(error.message);
        setCheckoutUiState('error');
        return;
      }
      updateTrackedPixCheckout('reconciliation_required');
      setCheckoutTransitionState('reconciliation_required');
      setCheckoutError(error instanceof BillingApiError ? error.message : 'Estamos confirmando o cancelamento do pagamento anterior. Tente novamente em instantes.');
      setCheckoutUiState('error');
    }).finally(() => {
      if (abandonmentRequestRef.current === controller) abandonmentRequestRef.current = null;
      if (abandonmentOperationRef.current === operationKey) {
        abandonmentOperationRef.current = null;
        abandonmentPromiseRef.current = null;
      }
    });
    abandonmentPromiseRef.current = promise;
  };

  useEffect(() => {
    if (pixCancelBlockedUntil === null) return;
    const remaining = pixCancelBlockedUntil - Date.now();
    const release = () => {
      const orderId = activePixCheckoutRef.current?.orderId;
      if (orderId) clearPixCancelBlock(orderId);
      setPixCancelBlockedUntil(null);
      setCheckoutTransitionState((current) => current === 'rate_limited' ? 'idle' : current);
      setCheckoutError((current) => current === 'Você poderá alterar a forma de pagamento novamente em alguns minutos.' ? '' : current);
    };
    if (remaining <= 0) { release(); return; }
    const timer = window.setTimeout(release, remaining);
    return () => window.clearTimeout(timer);
  }, [pixCancelBlockedUntil, trackedOrder?.orderId]);

  // Track InitiateCheckout when checkout parameters change or stabilize
  useEffect(() => {
    if (isSmokeMode || (isResumeMode && resumeState !== 'ready')) return;
    const timer = setTimeout(() => {
      const value = displayPricing.grandTotal;
      const content_ids: string[] = [selectedAgent];
      if (includesTrainingPlatform) content_ids.push('training_platform');

      trackMetaEvent('InitiateCheckout', {
        value,
        currency: 'BRL',
        content_name: `Assinatura Ceruti - ${selectedAgent}${includesTrainingPlatform ? ' + Treinamentos' : ''}`,
        content_category: 'Treinador de Vendas',
        content_ids,
        content_type: 'product',
        num_items: usersCount,
      });
    }, 1000); // Debounce track to avoid spamming on user adjustments

    return () => clearTimeout(timer);
  }, [selectedAgent, frequency, usersCount, includesTrainingPlatform, displayPricing.grandTotal, isResumeMode, isSmokeMode, resumeState]);

  useEffect(() => {
    setAccessNumbers(prev => {
      const targetLength = Math.max(0, usersCount - 1);
      const newArr = [...prev];
      if (newArr.length < targetLength) {
        while(newArr.length < targetLength) newArr.push('');
      } else if (newArr.length > targetLength) {
        newArr.length = targetLength;
      }
      return newArr;
    });
  }, [isResumeMode, usersCount]);

  useEffect(() => {
    const activeFingerprint = activeCheckoutFingerprintRef.current;
    if (!activeFingerprint || activeFingerprint === checkoutFingerprint) return;

    checkoutSequenceRef.current += 1;
    checkoutRequestAbortRef.current?.abort();
    checkoutRequestAbortRef.current = null;
    pollingAbortRef.current?.abort();
    pollingAbortRef.current = null;
    pollingOrderRef.current = null;
    terminalOrderRef.current = null;
    setIsSubmitting(false);
    setShowSuccessModal(false);
    setPaymentState('awaiting');
    const trackedPix = activePixCheckoutRef.current;
    const trackedCard = activeCardCheckoutRef.current;
    if (trackedPix?.state === 'reconciliation_required') {
      setCheckoutResult(null);
      setCheckoutTransitionState('reconciliation_required');
      setCheckoutError('Estamos confirmando o cancelamento do pagamento anterior. Tente novamente em instantes.');
      setCheckoutUiState('error');
      return;
    }
    if (trackedPix && trackedPix.state !== 'payment_confirmed') {
      // Keep orderId/control capability until Billing proves that this exact
      // PIX_UPFRONT order is terminal. A changed fingerprint never authorizes
      // a blind second checkout.
      setCheckoutTransitionState('abandoning');
      setCheckoutError('Atualizando sua forma de pagamento...');
      setCheckoutUiState('idle');
      abandonTrackedPixCheckout();
      return;
    }
    if (trackedPix?.state === 'payment_confirmed') {
      setCheckoutTransitionState('payment_confirmed');
      setCheckoutError('O pagamento anterior foi confirmado. Estamos liberando seu acesso.');
      setCheckoutUiState('provisioning');
      setPaymentState('awaiting_completion');
      return;
    }
    if (trackedCard) {
      // A card order cannot be cancelled by the browser. Keep observing that
      // exact order if the user changes a local form field after a reload.
      activeCheckoutFingerprintRef.current = checkoutFingerprint;
      setCheckoutError('Já existe um pagamento em confirmação. Estamos acompanhando esta compra.');
      setCheckoutUiState('provisioning');
      setPaymentState('checking');
      setShowSuccessModal(true);
      setTrackedOrder((current) => current ? { ...current } : current);
      return;
    }
    activeCheckoutFingerprintRef.current = null;
    checkoutAttemptRef.current = null;
    forceNewAttemptRef.current = true;
    setCheckoutResult(null);
    setTrackedOrder(null);
    setCheckoutError('');
    setCheckoutTransitionState('idle');
    setCheckoutUiState('idle');
  }, [checkoutFingerprint]);

  useEffect(() => {
    // A reload during an in-flight abandonment must resume that exact
    // idempotent operation, never create a competing checkout.
    if (restoredPixCheckout?.state !== 'abandoning') return;
    setCheckoutTransitionState('abandoning');
    setCheckoutError('Atualizando sua forma de pagamento...');
    abandonTrackedPixCheckout();
  }, []);

  useEffect(() => {
    // Resume authorization is server-defined and does not currently expose
    // add-on capability. Do not silently drop a resumed selection.
    if (isResumeMode) setAddons([]);
  }, [isResumeMode]);

  useEffect(() => {
    if (!isSmokeMode) return;
    setFrequency('mensal');
    setUsersCountStr('1');
  }, [isSmokeMode]);

  useEffect(() => {
    const handleVisibilityChange = () => setIsDocumentHidden(document.visibilityState === 'hidden');
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  useEffect(() => () => {
    checkoutRequestAbortRef.current?.abort();
    pollingAbortRef.current?.abort();
    abandonmentRequestRef.current?.abort();
  }, []);

  useEffect(() => {
    if (!trackedOrder) return;

    const activeOrderId = trackedOrder.orderId;
    const activeFingerprint = activeCheckoutFingerprintRef.current;
    if (terminalOrderRef.current === activeOrderId) return;
    const controller = new AbortController();
    pollingAbortRef.current = controller;
    const pollIntervalMs = isDocumentHidden ? 30_000 : showSuccessModal ? 4_000 : 12_000;
    pollingOrderRef.current = activeOrderId;
    setPaymentState((current) => current === 'awaiting_completion' ? current : 'checking');
    void pollOrderUntilCompletion(trackedOrder, {
      signal: controller.signal,
      intervalMs: pollIntervalMs,
      onStatus: (status) => {
        if (controller.signal.aborted || activeCheckoutFingerprintRef.current !== activeFingerprint) return;
        checkoutDiagnostic('checkout_status_poll', getCheckoutStatusDiagnostics(status));
        if (isCheckoutSuccessfullyCompleted(status) || status.paid) {
          setPaymentState('awaiting_completion');
          setCheckoutUiState('provisioning');
        } else {
          setPaymentState('awaiting');
          setCheckoutUiState('awaiting_payment');
        }
      },
      onTemporaryError: () => {
        if (!controller.signal.aborted && activeCheckoutFingerprintRef.current === activeFingerprint) {
          checkoutDiagnostic('checkout_poll_error', { order_id: activeOrderId });
          setPaymentState('temporary_error');
        }
      },
    }).then((result) => {
      if (controller.signal.aborted || activeCheckoutFingerprintRef.current !== activeFingerprint) return;
      if (result.kind === 'confirmed') {
        if (!redirectGuardRef.current.claim(activeOrderId)) return;
        pollingOrderRef.current = null;
        clearPersistedTrackedPixUpfrontCheckout();
        clearPersistedTrackedCardCheckout();
        checkoutDiagnostic('checkout_success_detected', { order_id: activeOrderId });
        // Billing supplied this relative application URL. Do not derive a
        // completion URL locally or resolve it against file://.
        setCheckoutUiState('completed');
        checkoutDiagnostic('checkout_upsell_redirect', { order_id: activeOrderId, redirect_path: '/checkout/success' });
        window.location.assign(result.redirectTo);
      } else if (result.kind === 'terminal') {
        pollingOrderRef.current = null;
        terminalOrderRef.current = activeOrderId;
        clearPersistedTrackedPixUpfrontCheckout();
        clearPersistedTrackedCardCheckout();
        setPaymentState('terminal');
        setCheckoutUiState('error');
      } else {
        if (pollingOrderRef.current !== activeOrderId) return;
        setPaymentState('timeout');
        setCheckoutUiState('error');
        // Keep the same order under observation after a polling window ends.
        // This schedules one replacement cycle; it does not create a checkout.
        setTrackedOrder((current) => current?.orderId === activeOrderId ? { ...current } : current);
      }
    }).catch((error: unknown) => {
      if (controller.signal.aborted || activeCheckoutFingerprintRef.current !== activeFingerprint || (error instanceof DOMException && error.name === 'AbortError')) return;
      pollingOrderRef.current = null;
      checkoutDiagnostic('checkout_poll_error', { order_id: activeOrderId });
      setPaymentState('temporary_error');
      setCheckoutUiState('error');
    });

    return () => {
      controller.abort();
      if (pollingAbortRef.current === controller) pollingAbortRef.current = null;
      if (pollingOrderRef.current === activeOrderId) pollingOrderRef.current = null;
    };
  }, [trackedOrder, showSuccessModal, isDocumentHidden]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  const toggleTrainingPlatform = () => {
    setAddons((current) => current.includes('training_platform') ? [] : ['training_platform']);
  };

  const paymentPendingMessage = paymentState === 'terminal'
    ? 'Este pagamento não pôde ser concluído. Inicie uma nova tentativa para continuar.'
    : paymentState === 'timeout'
      ? 'Ainda não recebemos a confirmação. Consulte novamente em alguns instantes.'
      : paymentState === 'temporary_error'
        ? 'Não foi possível consultar o pagamento agora. Tentaremos novamente.'
        : paymentState === 'awaiting_completion'
          ? 'Pagamento recebido. Estamos preparando sua confirmação segura...'
          : 'Aguardando confirmação do pagamento...';

  const pixExpiresAt = checkoutResult?.kind === 'pix' ? checkoutResult.expiresAt : undefined;
  const pixRemainingMs = pixExpiresAt === undefined ? undefined : pixExpiresAt - pixNow;
  const pixExpired = pixRemainingMs !== undefined && pixRemainingMs <= 0;
  const pixCountdown = pixRemainingMs === undefined ? undefined : formatPixRemainingTime(pixRemainingMs);

  useEffect(() => {
    if (!showSuccessModal || pixExpiresAt === undefined) return;
    setPixNow(Date.now());
    const interval = window.setInterval(() => setPixNow(Date.now()), 1_000);
    return () => window.clearInterval(interval);
  }, [pixExpiresAt, showSuccessModal]);

  const copyPixPayload = async (payload: string) => {
    if (!payload) return;
    setCopyError(false);
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(payload);
      } else {
        const fallback = document.createElement('textarea');
        fallback.value = payload;
        fallback.setAttribute('readonly', '');
        fallback.style.position = 'fixed';
        fallback.style.opacity = '0';
        document.body.appendChild(fallback);
        fallback.select();
        const copiedWithFallback = document.execCommand('copy');
        document.body.removeChild(fallback);
        if (!copiedWithFallback) throw new Error('Clipboard fallback failed');
      }
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2_000);
    } catch {
      // Clipboard feedback must never alter order tracking or payment polling.
      setCopyError(true);
    }
  };

  const ctaLabel = checkoutTransitionState === 'abandoning'
    ? 'ATUALIZANDO PAGAMENTO...'
    : checkoutTransitionState === 'reconciliation_required' || checkoutTransitionState === 'rate_limited'
      ? 'AGUARDANDO CONFIRMAÇÃO...'
      : checkoutTransitionState === 'payment_confirmed'
        ? 'PAGAMENTO CONFIRMADO'
        : checkoutUiState === 'submitting'
          ? 'PROCESSANDO PAGAMENTO...'
          : checkoutUiState === 'awaiting_payment'
            ? 'CONFIRMANDO PAGAMENTO...'
            : checkoutUiState === 'provisioning'
              ? 'LIBERANDO SEU ACESSO...'
              : checkoutUiState === 'completed'
                ? 'ACESSO LIBERADO'
                : 'CONCLUIR ASSINATURA';
  const ctaBusy = checkoutUiState === 'submitting'
    || checkoutUiState === 'awaiting_payment'
    || checkoutUiState === 'provisioning'
    || checkoutTransitionState !== 'idle';
  const canAbandonPixCheckout = checkoutResult?.kind === 'pix'
    && Boolean(trackedOrder)
    && activePixCheckoutRef.current?.paymentFlow === 'PIX_UPFRONT'
    && activePixCheckoutRef.current.state !== 'payment_confirmed'
    && paymentState !== 'awaiting_completion'
    && checkoutTransitionState !== 'payment_confirmed';

  const beginOrderTracking = (order: { orderId: string; statusUrl: string }) => {
    // Set the imperative guard before React schedules the render. This makes a
    // double click or a delayed previous checkout response unable to create a
    // second checkout while this order is being reconciled.
    pollingOrderRef.current = order.orderId;
    terminalOrderRef.current = null;
    setTrackedOrder(order);
    setCheckoutUiState('awaiting_payment');
    setShowSuccessModal(true);
  };

  // Closing only pauses observation; it never discards the existing Billing order.
  const closePixModal = () => setShowSuccessModal(false);
  const reopenPixModal = () => setShowSuccessModal(true);

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
    if (isSubmitting || pollingOrderRef.current) return;
    if (checkoutTransitionState !== 'idle' || activePixCheckoutRef.current) return;
    const checkoutSequence = ++checkoutSequenceRef.current;
    if (isResumeMode && (!resumeTokenRef.current || !resumeContext || resumeState !== 'ready')) {
      setCheckoutError('Não foi possível validar este link de assinatura. Solicite um novo link.');
      return;
    }
    setCheckoutError('');
    setCheckoutResult(null);
    setTrackedOrder(null);
    setPaymentState('awaiting');
    setCheckoutUiState('submitting');

    const cleanedPhone = phone.replace(/\D/g, '');
    const cleanedDocument = documentNumber.replace(/\D/g, '');
    const cleanedAccessNumbers = accessNumbers.map((value) => value.replace(/\D/g, '')).filter(Boolean);
    const expectedAdditionalAccessNumbers = Math.max(0, usersCount - 1);
    const invalidCpf = cleanedDocument.length === 11 && !isValidCpf(cleanedDocument);
    if (
      cleanedDocument.length < 11
      || invalidCpf
      || (!isResumeMode && cleanedPhone.length < 10)
      || (usersCount > 1 && cleanedAccessNumbers.length !== expectedAdditionalAccessNumbers)
    ) {
      setCheckoutUiState('idle');
      setCheckoutError(invalidCpf
        ? 'O CPF informado não é válido. Confira os números e tente novamente.'
        : 'Confira os dados de contato e os números de acesso antes de continuar.');
      return;
    }
    if (isResumeMode) {
      const duplicateAdditional = new Set(cleanedAccessNumbers).size !== cleanedAccessNumbers.length;
      if (cleanedAccessNumbers.includes(cleanedPhone) || duplicateAdditional) {
        setCheckoutError('Os números adicionais devem ser únicos e diferentes do telefone principal.');
        return;
      }
    }

    const frequencyByLabel = { mensal: 'monthly', semestral: 'semiannual', anual: 'annual' } as const;
    const baseRequest = buildCheckoutPayload({
      agentType: selectedAgent,
      frequency: frequencyByLabel[frequency],
      accessQuantity: usersCount,
      customer: { name: name.trim(), email: email.trim(), phone: cleanedPhone, documentNumber: cleanedDocument },
      accessNumbers: cleanedAccessNumbers,
      addons,
    });

    if (isSmokeMode) {
      if (!smokeSessionRef.current) {
        setCheckoutError('A sessão de smoke não está disponível. Reabra o link operacional de teste.');
        return;
      }
      let smokeRequest: SmokeCheckoutRequest;
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
        smokeRequest = {
          ...buildSmokeCheckoutPayloadBase({
            agentType: selectedAgent,
            customer: baseRequest.customer,
            accessNumber: cleanedPhone,
            addons,
          }),
          paymentMethod: 'CREDIT_CARD',
          creditCard: { holderName: cardName.trim(), number: cardDigits, expiryMonth, expiryYear, ccv: cardCvv },
          creditCardHolderInfo: {
            name: name.trim(), email: email.trim(), cpfCnpj: cleanedDocument, postalCode,
            addressNumber: cardAddressNumber.trim(), phone: cleanedPhone, mobilePhone: cleanedPhone,
          },
        };
      } else {
        smokeRequest = {
          ...buildSmokeCheckoutPayloadBase({
            agentType: selectedAgent,
            customer: baseRequest.customer,
            accessNumber: cleanedPhone,
            addons,
          }),
          paymentMethod: 'PIX_AUTOMATIC',
        };
      }
      activeCheckoutFingerprintRef.current = checkoutFingerprint;
      const smokeRequestFingerprint = checkoutFingerprint;
      const smokeRequestController = new AbortController();
      checkoutRequestAbortRef.current = smokeRequestController;
      checkoutAttemptRef.current = createSmokeCheckoutAttempt('campo', () => crypto.randomUUID());
      setIsSubmitting(true);
      try {
        await reportSmokeSessionDiagnostic('before-fetch', smokeSessionRef.current, {
          name: baseRequest.customer.name,
          email: baseRequest.customer.email,
          phone: baseRequest.customer.phone,
          documentNumber: baseRequest.customer.documentNumber,
        });
        const response = await postBillingSmokeCheckout(checkoutAttemptRef.current, smokeRequest, smokeSessionRef.current, fetch, smokeRequestController.signal);
        if (checkoutSequence !== checkoutSequenceRef.current || currentCheckoutFingerprintRef.current !== smokeRequestFingerprint) return;
        if (smokeRequest.paymentMethod === 'PIX_AUTOMATIC') {
          const pix = parseSmokePixAutomaticCheckout(response.data);
          if (!pix) throw new BillingApiError('A resposta do smoke não pôde ser validada.', { recoverable: false });
          if (!pix.statusUrl) throw new BillingApiError('A resposta do smoke não informou o status do Pix.', { recoverable: false });
          const pixDisplay = toPixCheckoutDisplay(pix.pix);
          setCheckoutResult({ kind: 'pix', ...pixDisplay, expiresAt: capPixExpirationAt24Hours(pixDisplay.expiresAt), amount: displayPricing.grandTotal });
          beginOrderTracking({ orderId: pix.orderId, statusUrl: pix.statusUrl });
        } else {
          const card = parseTransparentCardCheckout(response.data, response.status);
          if (!card) throw new BillingApiError('A resposta do smoke de cartão não pôde ser validada.', { recoverable: false });
          setCheckoutResult({ kind: 'card' });
          beginOrderTracking(card);
        }
      } catch (error) {
        if (checkoutSequence !== checkoutSequenceRef.current || currentCheckoutFingerprintRef.current !== smokeRequestFingerprint) return;
        setCheckoutUiState('idle');
        setCheckoutError(error instanceof BillingApiError ? error.message : 'Não foi possível iniciar o smoke agora.');
      } finally {
        if (checkoutRequestAbortRef.current === smokeRequestController) {
          checkoutRequestAbortRef.current = null;
          setIsSubmitting(false);
        }
      }
      return;
    }

    let requestBody:
      | BillingCheckoutRequest
      | CreditCardCheckoutRequest
      | ResumeCheckoutRequest
      | ResumeCreditCardCheckoutRequest;
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
      requestBody = isResumeMode
        ? {
          resumeToken: resumeTokenRef.current!,
          frequency: frequencyByLabel[frequency],
          accessQuantity: usersCount,
          paymentMethod: 'credit_card',
          documentNumber: cleanedDocument,
          ...(cleanedAccessNumbers.length ? { additionalAccessNumbers: cleanedAccessNumbers } : {}),
          creditCard: { holderName: cardName.trim(), number: cardDigits, expiryMonth, expiryYear, ccv: cardCvv },
          creditCardHolderInfo: {
            name: name.trim(), email: email.trim(), cpfCnpj: cleanedDocument, postalCode,
            addressNumber: cardAddressNumber.trim(), phone: cleanedPhone, mobilePhone: cleanedPhone,
          },
        }
        : {
          ...baseRequest,
          paymentMethod: 'credit_card',
          creditCard: { holderName: cardName.trim(), number: cardDigits, expiryMonth, expiryYear, ccv: cardCvv },
          creditCardHolderInfo: {
            name: name.trim(), email: email.trim(), cpfCnpj: cleanedDocument, postalCode,
            addressNumber: cardAddressNumber.trim(), phone: cleanedPhone, mobilePhone: cleanedPhone,
          },
        };
    } else {
      requestBody = isResumeMode
        ? {
          resumeToken: resumeTokenRef.current!,
          frequency: frequencyByLabel[frequency],
          accessQuantity: usersCount,
          paymentMethod,
          documentNumber: cleanedDocument,
          ...(cleanedAccessNumbers.length ? { additionalAccessNumbers: cleanedAccessNumbers } : {}),
        }
        : { ...baseRequest, paymentMethod };
    }

    const requestFingerprint = checkoutFingerprint;
    activeCheckoutFingerprintRef.current = requestFingerprint;
    const requestController = new AbortController();
    checkoutRequestAbortRef.current = requestController;
    checkoutAttemptRef.current = createCheckoutAttempt(
      checkoutAttemptRef.current,
      requestBody,
      () => crypto.randomUUID(),
      forceNewAttemptRef.current,
    );
    forceNewAttemptRef.current = false;
    setIsSubmitting(true);
    try {
      const response = await postBillingCheckout(checkoutAttemptRef.current, requestBody, fetch, { signal: requestController.signal });
      if (checkoutSequence !== checkoutSequenceRef.current || currentCheckoutFingerprintRef.current !== requestFingerprint) return;
      const responseRoute = identifyBillingCheckoutResponse(response.data);
      if (responseRoute === 'pix') {
        if (requestBody.paymentMethod !== 'pix') {
          throw new BillingApiError('A Billing retornou um Pix para uma seleção de cartão. Nenhum pagamento anterior foi reutilizado; tente novamente.', { recoverable: false });
        }
        const pix = parsePixUpfrontCheckout(response.data);
        if (!pix?.statusUrl) throw new BillingApiError('A resposta do Pix não informou o status da cobrança. Tente novamente.', { recoverable: false });
        const pixDisplay = toPixCheckoutDisplay(pix.pix);
        const trackedPixCheckout: PersistedPixUpfrontCheckout = {
          orderId: pix.orderId,
          statusUrl: pix.statusUrl,
          checkoutControlToken: pix.checkoutControlToken,
          paymentMethod: 'pix',
          paymentFlow: 'PIX_UPFRONT',
          fingerprint: requestFingerprint,
          state: 'pending',
          ...(pixDisplay.qrCodeSrc ? { qrCodeSrc: pixDisplay.qrCodeSrc } : {}),
          ...(pixDisplay.pixPayload ? { pixPayload: pixDisplay.pixPayload } : {}),
          ...(pixDisplay.expiresAt !== undefined ? { expiresAt: capPixExpirationAt24Hours(pixDisplay.expiresAt) } : {}),
          amount: displayPricing.grandTotal,
          abandonmentIdempotencyKey: createCheckoutAbandonmentIdempotencyKey(pix.orderId),
        };
        activePixCheckoutRef.current = trackedPixCheckout;
        persistTrackedPixUpfrontCheckout(trackedPixCheckout);
        setPixCancelBlockedUntil(readPixCancelBlock(pix.orderId));
        setCheckoutTransitionState('idle');
        setCheckoutResult({ kind: 'pix', ...pixDisplay, expiresAt: capPixExpirationAt24Hours(pixDisplay.expiresAt), amount: displayPricing.grandTotal });
        beginOrderTracking({ orderId: pix.orderId, statusUrl: pix.statusUrl });
        return;
      }
      if (responseRoute === 'boleto') {
        if (!isResumeMode) {
          throw new BillingApiError('Boleto indisponível no momento. Escolha Pix ou cartão.', { recoverable: false });
        }
        const boleto = parseBoletoCheckout(response.data);
        if (!boleto) throw new BillingApiError('A resposta do boleto não pôde ser validada. Tente novamente.', { recoverable: false });
        // The returned order remains the authority. Its status is tracked by
        // the same existing completion lifecycle; the Billing response owns
        // the actual boleto details and no second checkout is created.
        setCheckoutResult({ kind: 'boleto', ...(boleto.state === 'READY' ? { bankSlipUrl: boleto.bankSlipUrl } : {}) });
        beginOrderTracking(boleto);
        return;
      }
      if (responseRoute === 'transparent_card') {
        const transparent = parseTransparentCardCheckout(response.data, response.status);
        if (!transparent) throw new BillingApiError('A resposta do pagamento não pôde ser validada. Tente novamente.', { recoverable: false });
        const trackedCardCheckout: PersistedCardCheckout = {
          orderId: transparent.orderId,
          statusUrl: transparent.statusUrl,
          paymentMethod: 'credit_card',
          paymentFlow: 'CREDIT_CARD_UPFRONT',
          fingerprint: requestFingerprint,
        };
        activeCardCheckoutRef.current = trackedCardCheckout;
        persistTrackedCardCheckout(trackedCardCheckout);
        setCheckoutResult({ kind: 'card' });
        beginOrderTracking(transparent);
        return;
      }
      if (responseRoute === 'hosted_card') {
        const hosted = parseHostedCardCheckout(response.data);
        if (!hosted) throw new BillingApiError('A resposta do pagamento não pôde ser validada. Tente novamente.', { recoverable: false });
        const trackedCardCheckout: PersistedCardCheckout = {
          orderId: hosted.orderId,
          statusUrl: hosted.statusUrl,
          paymentMethod: 'credit_card',
          paymentFlow: 'ASAAS_HOSTED_CHECKOUT',
          fingerprint: requestFingerprint,
        };
        activeCardCheckoutRef.current = trackedCardCheckout;
        persistTrackedCardCheckout(trackedCardCheckout);
        setCheckoutResult({ kind: 'card' });
        beginOrderTracking(hosted);
        return;
      }
      throw new BillingApiError('A resposta do pagamento não pôde ser validada. Tente novamente.', { recoverable: false });
    } catch (error) {
      if (checkoutSequence !== checkoutSequenceRef.current || currentCheckoutFingerprintRef.current !== requestFingerprint) return;
      if (error instanceof BillingApiError && error.code === 'CHECKOUT_CONFIGURATION_CONFLICT' && activePixCheckoutRef.current) {
        // A race can surface the conflict before the fingerprint effect gets
        // to Billing. Reconcile the known order; never blindly retry checkout.
        setCheckoutTransitionState('abandoning');
        setCheckoutError('Atualizando sua forma de pagamento...');
        abandonTrackedPixCheckout();
        return;
      }
      if (!pollingOrderRef.current) setCheckoutUiState('idle');
      setCheckoutError(error instanceof BillingApiError ? error.message : 'Não foi possível iniciar o pagamento agora. Tente novamente.');
    } finally {
      if (checkoutRequestAbortRef.current === requestController) {
        checkoutRequestAbortRef.current = null;
        setIsSubmitting(false);
      }
    }
  };

  const resumeErrorMessage: Record<string, string> = {
    RESUME_NOT_FOUND: 'Este link de assinatura não é válido. Solicite um novo link.',
    RESUME_TOKEN_INVALID: 'Este link de assinatura não é válido. Solicite um novo link.',
    RESUME_EXPIRED: 'Este link de assinatura expirou. Solicite um novo link.',
    RESUME_TRIAL_STILL_ACTIVE: 'Seu período de teste ainda está ativo. Volte ao WhatsApp se precisar de ajuda.',
    RESUME_ALREADY_CONVERTED: 'Esta assinatura já foi concluída. Consulte seu acesso ou fale com o suporte.',
    RESUME_ALREADY_USED: 'Já existe uma assinatura em andamento para este link. Aguarde ou fale com o suporte.',
    RESUME_EVENT_NOT_ELIGIBLE: 'Este checkout não está mais elegível. Solicite um novo link.',
    RESUME_UNAVAILABLE: 'Não foi possível abrir este checkout agora. Tente novamente em alguns instantes.',
  };

  if (isResumeMode && resumeState !== 'ready') {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center px-4 font-sans">
        <div className="max-w-md rounded-3xl border border-neutral-200 bg-white p-8 text-center shadow-xl">
          <ShieldCheck className="mx-auto mb-4 h-10 w-10 text-[#00a83e]" />
          <p className="text-base font-bold text-neutral-800">
            {resumeState === 'loading' ? 'Preparando seu checkout seguro...' : (resumeErrorMessage[resumeErrorCode] ?? resumeErrorMessage.RESUME_UNAVAILABLE)}
          </p>
          {resumeState === 'error' && <button type="button" onClick={() => navigate('/')} className="mt-6 font-bold text-[#00a83e]">Voltar ao início</button>}
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="checkout-page relative isolate min-h-screen bg-gray-50 flex flex-col font-sans">
      <div className="pointer-events-none absolute inset-0 z-0 opacity-30" aria-hidden="true">
        <OglAurora
          colorStops={['#d8f2df', '#9ed7ae', '#eef9f1']}
          amplitude={0.72}
          blend={0.42}
          speed={0.35}
        />
      </div>
      <Aurora
        colorStart="#d4f0dc"
        colorMiddle="#a6d5b3"
        colorEnd="#f2fbf4"
        speed={0.45}
        amplitude={78}
        layerCount={4}
        opacity={0.22}
        followMouse={false}
        verticalAnchor={0.08}
        className="opacity-70"
      />
      <div className="pointer-events-none absolute inset-0 z-[1] bg-white/35" aria-hidden="true" />
      {/* Top Header */}
      <header className="checkout-header relative z-30 w-full bg-white/95 border-b border-gray-200 px-4 py-4 flex items-center justify-between shadow-sm sticky top-0">
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
              <h3 className="font-black text-2xl text-[#0b1a30]">Ceruti Campo</h3>
              <p className="text-xs font-bold text-neutral-500 uppercase tracking-wider">Treinador de Vendas</p>
            </div>
          </div>

          <div className="mb-6">
            <div className="checkout-special-offer mt-3 flex items-center justify-center gap-2 rounded-xl border border-amber-300 bg-[#588c6b] px-3 py-2 text-center text-[10px] font-extrabold uppercase tracking-wide text-white shadow-sm sm:text-xs">
              <Flame className="h-4 w-4 shrink-0 text-amber-200" aria-hidden="true" />
              Oferta especial para os 100 próximos assinantes!
              <Flame className="h-4 w-4 shrink-0 text-amber-200" aria-hidden="true" />
            </div>
          </div>

          <div className="mb-8">
            <h4 className="font-bold text-neutral-900 mb-4">Escolha a frequência:</h4>
            <div className="grid grid-cols-3 gap-1.5 sm:gap-2.5">
              <button
                type="button"
                onClick={() => !isSmokeMode && (!isResumeMode || resumeContext?.allowedFrequencies.includes('monthly')) && setFrequency('mensal')}
                disabled={isSmokeMode || (isResumeMode && !resumeContext?.allowedFrequencies.includes('monthly'))}
                className={`px-1 py-2 sm:px-3 sm:p-4 rounded-xl border-2 text-xs sm:text-sm font-black text-center transition-all ${
                  frequency === 'mensal'
                    ? 'border-[#0070f3] bg-[#f0f7ff] text-[#0070f3] shadow-inner'
                    : 'border-neutral-200 bg-white text-neutral-500 hover:border-neutral-300 hover:bg-gray-50'
                }`}
              >
                <span className="block">Mensal</span>
                <span className="block text-[10px] sm:text-xs leading-tight opacity-85">60% OFF</span>
              </button>
              <button
                type="button"
                onClick={() => !isSmokeMode && (!isResumeMode || resumeContext?.allowedFrequencies.includes('semiannual')) && setFrequency('semestral')}
                disabled={isSmokeMode || (isResumeMode && !resumeContext?.allowedFrequencies.includes('semiannual'))}
                className={`px-1 py-2 sm:px-3 sm:p-4 rounded-xl border-2 text-xs sm:text-sm font-black text-center transition-all ${
                  frequency === 'semestral'
                    ? 'border-[#0070f3] bg-[#f0f7ff] text-[#0070f3] shadow-inner'
                    : 'border-neutral-200 bg-white text-neutral-500 hover:border-neutral-300 hover:bg-gray-50'
                }`}
              >
                <span className="block">Semestral</span>
                <span className="block text-[10px] sm:text-xs leading-tight opacity-85">67% OFF</span>
              </button>
              <button
                type="button"
                onClick={() => !isSmokeMode && (!isResumeMode || resumeContext?.allowedFrequencies.includes('annual')) && setFrequency('anual')}
                disabled={isSmokeMode || (isResumeMode && !resumeContext?.allowedFrequencies.includes('annual'))}
                className={`px-1 py-2 sm:px-3 sm:p-4 rounded-xl border-2 text-xs sm:text-sm font-black text-center transition-all ${
                  frequency === 'anual'
                    ? 'border-[#0070f3] bg-[#f0f7ff] text-[#0070f3] shadow-inner'
                    : 'border-neutral-200 bg-white text-neutral-500 hover:border-neutral-300 hover:bg-gray-50'
                }`}
              >
                <span className="block">Anual</span>
                <span className="block text-[10px] sm:text-xs leading-tight opacity-85">74% OFF</span>
              </button>
            </div>
          </div>

          <div className="checkout-access-count mb-6 relative z-10 p-5 sm:p-6 rounded-[24px] overflow-hidden shadow-[0_4px_20px_rgba(0,112,243,0.05)] border-2 border-[#0070f3]/30">
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
                  max={isSmokeMode ? 1 : (isResumeMode ? resumeContext?.maxAccessQuantity : undefined)}
                  disabled={isSmokeMode}
                  value={usersCountStr}
                  onChange={(e) => {
                    const next = e.target.value;
                    const limit = resumeContext?.maxAccessQuantity;
                    if (isResumeMode && limit && Number(next) > limit) {
                      setUsersCountStr(String(limit));
                      return;
                    }
                    setUsersCountStr(next);
                  }}
                  className="w-full pl-12 pr-4 py-3 sm:py-4 bg-white border-2 border-[#0070f3]/20 rounded-xl focus:outline-none focus:border-[#0070f3] focus:ring-4 ring-[#0070f3]/10 font-black text-xl text-neutral-900 transition-all cursor-text text-center sm:text-left shadow-inner"
                />
              </div>
            </div>
          </div>

          <div className="mb-6 rounded-2xl border border-neutral-100 bg-neutral-50/70 px-5 py-4">
            <div className="flex items-center justify-between gap-3">
              <span className="text-sm font-black text-[#0b1a30]">Ceruti Campo</span>
              <span className="text-xs font-bold uppercase tracking-wide text-neutral-500">Resumo</span>
            </div>
            <p className="mt-2 text-xs font-semibold leading-5 text-neutral-600">
              {usersCount} {usersCount === 1 ? 'acesso' : 'acessos'} · {includesTrainingPlatform ? 'Treinamentos incluído' : 'Treinamento não incluso'} · Cobrança {frequency === 'mensal' ? 'mensal' : frequency === 'semestral' ? 'semestral' : 'anual'}
            </p>
          </div>

          <div className="mt-4 pt-6 border-t border-neutral-200">
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

            {!isSmokeMode && (
              <div className="mb-4 space-y-2 border-y border-neutral-200 py-4 text-xs sm:text-sm">
                <div className="flex items-center justify-between gap-4 text-neutral-500">
                  <span>Mensalidade (Preço original):</span>
                  <span className="font-bold text-red-400 line-through">{formatCurrency(displayPricing.originalMonthlyTotal)}/mês</span>
                </div>
                <div className="flex items-center justify-between gap-4 text-neutral-500">
                  <span>Total (Preço original):</span>
                  <span className="font-bold text-red-400 line-through">{formatCurrency(displayPricing.originalGrandTotal)}</span>
                </div>
              </div>
            )}

            {includesTrainingPlatform && (
              <div className="flex justify-between items-center mb-2 pt-2 border-t border-dashed border-amber-300/80 text-xs sm:text-sm">
                <span className="text-amber-900 font-extrabold flex items-center gap-1.5">
                  <GraduationCap className="w-4 h-4 text-amber-600 shrink-0" />
                  Treinamentos (+R$ {isSmokeMode ? '1' : '47'}/mês):
                </span>
                <span className="font-extrabold text-amber-900">
                  +{formatCurrency(displayPricing.addonMonthlyPrice)}
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
                  {formatCurrency(displayPricing.totalPricePerMonth).replace('R$', '').trim()}
                </span>
                <span className="font-bold text-neutral-500 text-sm ml-1">/mês</span>
              </div>

              <div className="text-xs sm:text-sm font-semibold text-neutral-500 mt-1">
                Total do plano somente <span className="font-black text-[#0b1a30]">{formatCurrency(displayPricing.grandTotal)}</span> para os {usersCount} {usersCount === 1 ? 'acesso' : 'acessos'}
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
              <div className="checkout-section-heading" aria-hidden="true">
                <span className="checkout-section-kicker">DADOS DE ACESSO</span>
                <span className="checkout-section-rule" />
              </div>
              <div>
                <label className="block text-sm font-bold text-neutral-700 mb-1.5 ml-1">Nome completo</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  name="name"
                  autoComplete="name"
                  readOnly={isResumeMode}
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
                  readOnly={isResumeMode}
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
                  readOnly={isResumeMode}
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
                  onChange={(e) => setDocumentNumber(formatCpfCnpjInput(e.target.value))}
                  name="document"
                  autoComplete="off"
                  inputMode="numeric"
                  maxLength={18}
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
                      <label className="block text-sm font-bold text-neutral-700 mb-1.5 ml-1">{idx + 2}º Acesso</label>
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
            {!isResumeMode && <div className="checkout-addons mt-4 pt-6 border-t border-neutral-200 space-y-4">
              <div
                role="button"
                tabIndex={0}
                aria-pressed={includesTrainingPlatform}
                onClick={toggleTrainingPlatform}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    toggleTrainingPlatform();
                  }
                }}
                className={`checkout-addon relative rounded-2xl p-4 sm:p-5 transition-all duration-300 cursor-pointer select-none border-2 ${
                  includesTrainingPlatform
                    ? 'bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-amber-500/15 border-solid border-amber-500'
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
                      + R$ {isSmokeMode ? '1,00' : '47,00'}<span className="text-[10px] text-amber-700 font-bold">/mês</span>
                    </span>
                  </div>
                </div>

                {/* Checkbox & Details */}
                <div className="flex items-start gap-3.5">
                  <div className="pt-0.5 shrink-0">
                    <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${
                      includesTrainingPlatform
                        ? 'bg-amber-500 border-amber-600 text-white shadow-md shadow-amber-500/30'
                        : 'border-amber-400 bg-white hover:border-amber-500'
                    }`}>
                      {includesTrainingPlatform && <Check className="w-4 h-4 stroke-[3]" />}
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
                        Acesso liberado por {displayPricing.contractMonths} {displayPricing.contractMonths === 1 ? 'mês' : 'meses'} ({formatCurrency(trainingPlatformMonthlyPrice * displayPricing.contractMonths)} total acumulado)
                      </span>
                    </div>
                  </div>
                </div>
              </div>

            </div>}

            {/* Payment Method Selection */}
            <div className="checkout-payment-methods mt-4 pt-6 border-t border-neutral-200">
              <label className="block text-base font-bold text-neutral-900 mb-4">Forma de pagamento (Asaas)</label>
              <div className={`grid grid-cols-2 gap-3 ${isResumeMode ? 'sm:grid-cols-3' : ''}`}>
                <button
                  type="button"
                  onClick={() => setPaymentMethod('pix')}
                  aria-pressed={paymentMethod === 'pix'}
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
                  aria-pressed={paymentMethod === 'credit_card'}
                  className={`flex flex-col items-center justify-center gap-3 p-4 rounded-xl border-2 transition-all ${
                    paymentMethod === 'credit_card'
                      ? 'border-[#0070f3] bg-[#f0f7ff] text-[#0070f3] shadow-md shadow-[#0070f3]/10'
                      : 'border-neutral-200 bg-white text-neutral-500 hover:border-neutral-300 hover:bg-gray-50'
                  }`}
                >
                  <CreditCard className="w-8 h-8" />
                  <span className="text-xs font-black uppercase tracking-wider text-center">Cartão</span>
                </button>
                {isResumeMode && <button
                  type="button"
                  onClick={() => setPaymentMethod('boleto')}
                  aria-pressed={paymentMethod === 'boleto'}
                  className={`flex flex-col items-center justify-center gap-3 p-4 rounded-xl border-2 transition-all ${
                    paymentMethod === 'boleto'
                      ? 'border-amber-600 bg-amber-50 text-amber-700 shadow-md shadow-amber-600/10'
                      : 'border-neutral-200 bg-white text-neutral-500 hover:border-neutral-300 hover:bg-gray-50'
                  }`}
                >
                  <span className="text-lg font-black" aria-hidden="true">$</span>
                  <span className="text-xs font-black uppercase tracking-wider text-center">Boleto</span>
                </button>}
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
                      maxLength={70}
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
                        onChange={(e) => setCardPostalCode(formatCepInput(e.target.value))}
                        name="postal-code"
                        autoComplete="postal-code"
                        inputMode="numeric"
                        maxLength={9}
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
                        onChange={(e) => setCardAddressNumber(normalizeCardAddressNumber(e.target.value))}
                        name="address-number"
                        autoComplete="address-line2"
                        inputMode="numeric"
                        maxLength={6}
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
              <button
                type="submit"
                disabled={isSubmitting || ctaBusy || Boolean(trackedOrder) || (isResumeMode && resumeState !== 'ready')}
                className="checkout-submit-button"
                aria-label={ctaLabel}
              >
                {ctaBusy ? <CheckoutSpinner /> : checkoutUiState === 'completed' ? <Check className="w-6 h-6" aria-hidden="true" /> : <Lock className="w-6 h-6 text-current opacity-85" aria-hidden="true" />}
                <span>{ctaLabel}</span>
              </button>

              <div className="mt-4 flex items-center justify-center gap-2 text-xs font-bold text-neutral-600">
                <Lock className="h-4 w-4 text-neutral-500" aria-hidden="true" />
                <span>Pagamento seguro e processado pelo Asaas</span>
              </div>
              {checkoutTransitionState !== 'idle' && (
                <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-left text-sm font-semibold text-amber-950" role="status">
                  <p>{checkoutTransitionState === 'abandoning'
                    ? 'Atualizando sua forma de pagamento...'
                    : checkoutTransitionState === 'rate_limited'
                      ? 'Você poderá alterar a forma de pagamento novamente em alguns minutos.'
                    : checkoutTransitionState === 'payment_confirmed'
                      ? 'O pagamento anterior foi confirmado. Estamos liberando seu acesso.'
                      : 'Estamos confirmando o cancelamento do pagamento anterior. Tente novamente em instantes.'}</p>
                  {checkoutTransitionState === 'reconciliation_required' && pixCancelBlockedUntil === null && (
                    <button type="button" onClick={abandonTrackedPixCheckout} className="mt-2 text-xs font-extrabold underline">
                      TENTAR NOVAMENTE
                    </button>
                  )}
                </div>
              )}
              {checkoutTransitionState === 'idle' && checkoutResult?.kind === 'pix' && trackedOrder && !showSuccessModal && (
                <button type="button" onClick={reopenPixModal} className="mt-4 w-full rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-extrabold text-[#007a2d] hover:bg-emerald-100">
                  VER PAGAMENTO PIX
                </button>
              )}
            </div>
          </form>
          </div>
        </div>
      </div>
    </div>

    {/* Success Confirmation Modal */}
    {showSuccessModal && (
      <div className="fixed inset-0 bg-neutral-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in duration-300">
        <div className={`max-h-[calc(100vh-2rem)] w-full overflow-y-auto rounded-3xl border border-emerald-100 bg-white p-6 text-center shadow-2xl relative sm:p-8 ${checkoutResult?.kind === 'pix' && paymentState !== 'awaiting_completion' ? 'max-w-3xl' : 'max-w-lg'}`}>
          {/* Top Green Accent Bar */}
          <div className="absolute top-0 left-0 right-0 h-2.5 bg-gradient-to-r from-[#004d1a] via-[#00a83e] to-[#00c853]" />
          {checkoutResult?.kind === 'pix' && trackedOrder && (
            <button type="button" onClick={closePixModal} className="absolute right-4 top-5 rounded-lg p-2 text-neutral-500 hover:bg-neutral-100 hover:text-neutral-800" aria-label="Fechar acompanhamento Pix">
              <X className="h-5 w-5" aria-hidden="true" />
            </button>
          )}

          {/* Icon */}
          <div className="inline-flex items-center justify-center w-20 h-20 bg-emerald-50 rounded-full border border-emerald-100 mb-5 relative">
            <span className="absolute inset-0 bg-emerald-400/20 blur-lg rounded-full animate-pulse"></span>
            <CheckCircle2 className="w-10 h-10 text-[#00a83e] relative z-10" />
          </div>

          {/* Title */}
          <h2 className="text-2xl sm:text-3xl font-black text-[#0b1a30] tracking-tight mb-2 uppercase">
             {checkoutTransitionState === 'payment_confirmed' ? 'Pagamento confirmado' : checkoutResult?.kind === 'pix' ? (paymentState === 'awaiting_completion' ? 'Pagamento recebido' : 'Pague com Pix') : checkoutResult?.kind === 'boleto' ? 'Pague o boleto' : checkoutResult?.kind === 'card' ? 'Confirmando pagamento' : 'Pagamento iniciado'}
          </h2>
          <p className="text-neutral-600 font-medium text-sm sm:text-base max-w-md mx-auto mb-6 leading-relaxed">
             {checkoutTransitionState === 'payment_confirmed' ? 'O pagamento anterior foi confirmado. Estamos liberando seu acesso com segurança.' : checkoutResult?.kind === 'pix'
              ? (paymentState === 'awaiting_completion' ? 'Estamos liberando seu acesso com segurança.' : 'Escaneie o QR Code ou copie o código abaixo.')
              : checkoutResult?.kind === 'boleto' ? 'Abra o boleto para concluir o pagamento. A confirmação continuará sendo acompanhada.' : 'O pagamento foi recebido. Estamos confirmando seu acesso...'}
          </p>
          {checkoutResult?.kind === 'pix' && (
            <div className="mb-6 rounded-2xl border border-neutral-200 bg-neutral-50 p-4 sm:p-5">
              {paymentState === 'awaiting_completion' ? (
                <div className="py-10">
                  <CheckCircle2 className="mx-auto h-14 w-14 text-[#00a83e]" aria-hidden="true" />
                  <p className="mt-4 text-lg font-extrabold text-[#0b1a30]">Pagamento recebido</p>
                  <div className="mt-3 flex items-center justify-center gap-2 text-sm font-semibold text-neutral-600" role="status"><LoaderCircle className="h-4 w-4 animate-spin text-[#00a83e]" aria-hidden="true" />Estamos liberando seu acesso...</div>
                </div>
              ) : <div className="grid grid-cols-1 items-center gap-5 text-left md:grid-cols-[auto_minmax(0,1fr)] md:gap-7">
                {checkoutResult.qrCodeSrc && <div className="mx-auto w-fit rounded-2xl border border-neutral-200 bg-white p-3 shadow-sm sm:p-4 md:mx-0"><img src={checkoutResult.qrCodeSrc} alt="QR Code Pix" className="h-52 w-52 rounded-lg sm:h-56 sm:w-56" /></div>}
                <div className="min-w-0">
                  <p className="text-xs font-bold uppercase tracking-wide text-neutral-500">Valor do pagamento</p>
                  <p className="mt-1 text-2xl font-black tracking-tight text-[#0b1a30]">{formatCurrency(checkoutResult.amount)}</p>
                  {pixExpiresAt !== undefined && <div className="mt-3 flex items-center gap-2 text-sm font-bold text-neutral-700" role="status"><Clock className="h-4 w-4 text-[#00a83e]" aria-hidden="true" />{pixExpired ? 'Pix expirado' : `Expira em ${pixCountdown}`}</div>}
                  {checkoutResult.pixPayload && <div className="mt-5"><label htmlFor="pix-copy-paste" className="mb-1.5 block text-xs font-bold text-neutral-700">Código Pix copia e cola</label><div className="flex min-w-0 items-center gap-2 rounded-xl border border-neutral-200 bg-white px-3 py-2"><input id="pix-copy-paste" readOnly spellCheck={false} value={checkoutResult.pixPayload} className="min-w-0 flex-1 truncate bg-transparent text-xs text-neutral-700 outline-none" aria-label="Código Pix copia e cola completo" onFocus={(event) => event.currentTarget.select()} /><button type="button" onClick={() => void copyPixPayload(checkoutResult.pixPayload)} className="shrink-0 rounded-lg p-1.5 text-[#007a2d] hover:bg-emerald-50" aria-label="Copiar código Pix"><Copy className="h-4 w-4" aria-hidden="true" /></button></div></div>}
                  <button type="button" onClick={() => void copyPixPayload(checkoutResult.pixPayload)} disabled={!checkoutResult.pixPayload} className="mt-4 w-full rounded-xl bg-[#007a2d] px-4 py-3 text-sm font-extrabold text-white transition-colors hover:bg-[#006622] disabled:cursor-not-allowed disabled:opacity-50">{copied ? '✓ CÓDIGO COPIADO' : 'COPIAR CÓDIGO PIX'}</button>
                  {copyError && <p className="mt-2 text-xs font-medium text-neutral-600" role="status">Não foi possível copiar automaticamente. Selecione o código para copiar.</p>}
                </div>
              </div>}
              <div className="mt-4 rounded-xl border border-neutral-200 bg-white px-3 py-3 text-left" role="status">
                {paymentState === 'checking' ? <p className="flex items-center gap-2 text-sm font-bold text-neutral-800"><LoaderCircle className="h-4 w-4 animate-spin text-[#00a83e]" aria-hidden="true" />Verificando pagamento...</p>
                  : paymentState === 'awaiting_completion' ? <><p className="flex items-center gap-2 text-sm font-bold text-[#007a2d]"><Check className="h-4 w-4" aria-hidden="true" />Pagamento recebido</p><p className="mt-1 text-xs text-neutral-600">Estamos liberando seu acesso.</p></>
                    : paymentState === 'temporary_error' ? <><p className="text-sm font-bold text-neutral-800">Não conseguimos consultar agora.</p><p className="mt-1 text-xs text-neutral-600">Vamos tentar novamente automaticamente.</p></>
                      : paymentState === 'timeout' ? <><p className="text-sm font-bold text-neutral-800">Ainda aguardamos a confirmação.</p><p className="mt-1 text-xs text-neutral-600">Consulte o pagamento novamente quando quiser.</p></>
                        : paymentState === 'terminal' ? <p className="text-sm font-bold text-neutral-800">{paymentPendingMessage}</p>
                          : <><p className="flex items-center gap-2 text-sm font-bold text-neutral-800"><span className="h-2 w-2 rounded-full bg-[#00a83e] animate-pulse" aria-hidden="true" />Aguardando pagamento</p><p className="mt-1 text-xs text-neutral-600">Estamos verificando automaticamente.</p></>}
              </div>
               {paymentState === 'timeout' && trackedOrder && <button type="button" onClick={() => setTrackedOrder({ ...trackedOrder })} className="mt-3 w-full text-xs font-bold text-[#007a2d] underline">CONSULTAR PAGAMENTO NOVAMENTE</button>}
               {canAbandonPixCheckout && (
                 <button
                   type="button"
                   onClick={abandonTrackedPixCheckout}
                   disabled={checkoutTransitionState === 'abandoning' || (pixCancelBlockedUntil !== null && pixCancelBlockedUntil > Date.now())}
                   className="mt-4 w-full rounded-xl border border-neutral-300 bg-white px-4 py-3 text-sm font-extrabold text-neutral-700 transition-colors hover:border-neutral-400 hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-60"
                 >
                   {checkoutTransitionState === 'abandoning' ? 'CANCELANDO PIX...' : 'CANCELAR PIX E ESCOLHER OUTRO PLANO'}
                 </button>
               )}
             </div>
          )}

          {checkoutResult?.kind !== 'pix' && (
            <p className="mb-6 text-xs font-semibold text-emerald-900" role="status">
              {paymentPendingMessage}
            </p>
          )}
          {checkoutResult?.kind === 'boleto' && checkoutResult.bankSlipUrl && (
            <a href={checkoutResult.bankSlipUrl} target="_blank" rel="noopener noreferrer" className="mb-6 inline-flex rounded-xl bg-[#007a2d] px-5 py-3 text-sm font-extrabold text-white">
              ABRIR BOLETO
            </a>
          )}

          {/* This information is intentionally secondary until payment confirmation. */}
          {(checkoutResult?.kind !== 'pix' || paymentState === 'awaiting_completion') && <div className="flex flex-col gap-3 text-left mb-8 max-w-md mx-auto">
            <div className="p-4 bg-blue-50/60 border border-blue-100/70 rounded-2xl flex gap-3.5 items-center">
              <div className="p-2.5 bg-blue-100/70 text-blue-600 rounded-xl shrink-0">
                <MessageSquare className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-neutral-800 text-xs sm:text-sm leading-snug">
                Após a confirmação, enviaremos a mensagem de acesso pelo WhatsApp.
              </h3>
            </div>

            <div className="p-4 bg-emerald-50/70 border border-emerald-100/70 rounded-2xl flex gap-3.5 items-center">
              <div className="p-2.5 bg-emerald-100/70 text-[#00a83e] rounded-xl shrink-0">
                <Clock className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-neutral-800 text-xs sm:text-sm leading-snug">
                Seu acesso será liberado automaticamente após a confirmação.
              </h3>
            </div>
          </div>}

          {checkoutResult?.kind === 'pix' && trackedOrder ? null : (
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
