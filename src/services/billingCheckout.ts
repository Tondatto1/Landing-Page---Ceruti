import { BILLING_API_BASE_URL, requireCerutiHttpsApiBase } from './apiBaseUrl';

/** Exact public Billing enum for the normal checkout. */
export type BillingPaymentMethod = 'pix' | 'credit_card' | 'boleto';

export type BillingAddon = 'training_platform';

export type BillingCheckoutRequest = {
  agentType: 'campo';
  frequency: 'monthly' | 'semiannual' | 'annual';
  accessQuantity: number;
  paymentMethod: BillingPaymentMethod;
  customer: {
    name: string;
    email: string;
    phone: string;
    documentNumber: string;
  };
  /** Omit for a single access; Billing then uses customer.phone. */
  accessNumbers?: string[];
  /** The API owns the price for every selected add-on. */
  addons?: BillingAddon[];
};

export type CreditCardCheckoutRequest = Omit<BillingCheckoutRequest, 'paymentMethod'> & {
  paymentMethod: 'credit_card';
  creditCard: {
    holderName: string;
    number: string;
    expiryMonth: string;
    expiryYear: string;
    ccv: string;
  };
  creditCardHolderInfo: {
    name: string;
    email: string;
    cpfCnpj: string;
    postalCode: string;
    addressNumber: string;
    addressComplement?: string;
    phone: string;
    mobilePhone?: string;
  };
};

export type ResumeCheckoutRequest = {
  resumeToken: string;
  frequency: 'monthly' | 'semiannual' | 'annual';
  accessQuantity: number;
  paymentMethod: BillingPaymentMethod;
  documentNumber: string;
  additionalAccessNumbers?: string[];
};

export type ResumeCreditCardCheckoutRequest = Omit<ResumeCheckoutRequest, 'paymentMethod'> & {
  paymentMethod: 'credit_card';
  creditCard: CreditCardCheckoutRequest['creditCard'];
  creditCardHolderInfo: {
    name: string;
    email: string;
    cpfCnpj: string;
    postalCode: string;
    addressNumber: string;
    addressComplement?: string;
    phone: string;
    mobilePhone?: string;
  };
};

export type SmokeCreditCardCheckoutRequest = {
  agentType: 'campo';
  paymentMethod: 'CREDIT_CARD';
  customer: BillingCheckoutRequest['customer'];
  accessNumber: string;
  addons?: BillingAddon[];
  creditCard: CreditCardCheckoutRequest['creditCard'];
  creditCardHolderInfo: {
    name: string;
    email: string;
    cpfCnpj: string;
    postalCode: string;
    addressNumber: string;
    addressComplement?: string;
    phone: string;
    mobilePhone: string;
  };
};

export type SmokePixAutomaticCheckoutRequest = {
  agentType: 'campo';
  paymentMethod: 'PIX_AUTOMATIC';
  customer: BillingCheckoutRequest['customer'];
  accessNumber: string;
  addons?: BillingAddon[];
};

export type SmokeCheckoutRequest =
  | SmokeCreditCardCheckoutRequest
  | SmokePixAutomaticCheckoutRequest;

type CheckoutCustomer = BillingCheckoutRequest['customer'];

export type CheckoutCommercialInput = {
  agentType: 'campo';
  frequency: BillingCheckoutRequest['frequency'];
  accessQuantity: number;
  customer: CheckoutCustomer;
  accessNumbers: readonly string[];
  addons: readonly BillingAddon[];
};

export type CheckoutContractFingerprintInput = {
  agentType: 'campo';
  frequency: BillingCheckoutRequest['frequency'];
  accessQuantity: number;
  trainingPlatform: boolean;
  paymentMethod: BillingPaymentMethod;
};

/** Identifies only the commercial/payment contract, never customer or card data. */
export function createCheckoutContractFingerprint(input: CheckoutContractFingerprintInput): string {
  return JSON.stringify({
    agentType: input.agentType,
    frequency: input.frequency,
    accessQuantity: input.accessQuantity,
    trainingPlatform: input.trainingPlatform,
    paymentMethod: input.paymentMethod,
  });
}

/**
 * Builds the commercial portion accepted by POST /billing/checkout.
 * Empty optional collections are omitted, never serialized as [] or undefined.
 */
export function buildCheckoutPayload(input: CheckoutCommercialInput): Omit<BillingCheckoutRequest, 'paymentMethod'> {
  return {
    agentType: input.agentType,
    frequency: input.frequency,
    accessQuantity: input.accessQuantity,
    customer: input.customer,
    ...(input.accessNumbers.length ? { accessNumbers: [...input.accessNumbers] } : {}),
    ...(input.addons.length ? { addons: [...input.addons] } : {}),
  };
}

/** Smoke has a separate security/transport contract, but shares customer and add-on normalization. */
export function buildSmokeCheckoutPayloadBase(input: Pick<CheckoutCommercialInput, 'agentType' | 'customer' | 'addons'> & { accessNumber: string }): {
  agentType: 'campo';
  customer: CheckoutCustomer;
  accessNumber: string;
  addons?: BillingAddon[];
} {
  return {
    agentType: input.agentType,
    customer: input.customer,
    accessNumber: input.accessNumber,
    ...(input.addons.length ? { addons: [...input.addons] } : {}),
  };
}

export type BillingPix = {
  qrCodeImage: string;
  payload: string;
  conciliationIdentifier?: string;
  expirationDate?: string;
};

export type PixAutomaticCheckoutResponse = {
  ok: true;
  orderId: string;
  status: string;
  paymentMethod: 'PIX';
  paymentFlow: 'PIX_AUTOMATIC';
  pix?: BillingPix;
};

export type SmokePixAutomaticCheckout = {
  orderId: string;
  status: string;
  statusUrl?: string;
  pix: BillingPix;
};

/** One-time Pix checkout capability returned by the normal Billing checkout. */
export type PixUpfrontCheckout = SmokePixAutomaticCheckout & {
  checkoutControlToken: string;
};

export type CheckoutAbandonmentResult =
  | 'canceled'
  | 'already_canceled'
  | 'payment_already_completed'
  | 'not_cancellable';

export type CheckoutAbandonmentResponse = {
  state: string;
  result: CheckoutAbandonmentResult;
  canStartNewCheckout: boolean;
  orderId: string;
  statusUrl: string;
};

export type PersistedPixUpfrontCheckout = {
  orderId: string;
  statusUrl: string;
  checkoutControlToken: string;
  paymentMethod: 'pix';
  paymentFlow: 'PIX_UPFRONT';
  fingerprint: string;
  state: 'pending' | 'abandoning' | 'reconciliation_required' | 'payment_confirmed';
  qrCodeSrc?: string;
  pixPayload?: string;
  expiresAt?: number;
  amount?: number;
  abandonmentIdempotencyKey: string;
};

/** Card order identity only; never persist card or holder data. */
export type PersistedCardCheckout = {
  orderId: string;
  statusUrl: string;
  paymentMethod: 'credit_card';
  paymentFlow: 'CREDIT_CARD_UPFRONT' | 'ASAAS_HOSTED_CHECKOUT';
  fingerprint: string;
};

const checkoutControlTokenPattern = /^cc_[A-Za-z0-9_-]{43}$/;
const checkoutIdempotencyKeyPattern = /^[A-Za-z0-9._:-]{8,128}$/;
const TRACKED_PIX_CHECKOUT_STORAGE_KEY = 'ceruti.billing.tracked-pix-upfront';
const TRACKED_CARD_CHECKOUT_STORAGE_KEY = 'ceruti.billing.tracked-card';
const PIX_CANCEL_BLOCK_STORAGE_PREFIX = 'pix-cancel-block:';

/** Stable for the order/configuration-change operation and safe to retry. */
export function createCheckoutAbandonmentIdempotencyKey(orderId: string): string {
  if (!/^[A-Za-z0-9._:-]{1,96}$/.test(orderId)) throw new Error('Invalid Billing order id.');
  const key = `checkout-abandon:${orderId}:configuration-change`;
  if (!checkoutIdempotencyKeyPattern.test(key)) throw new Error('Invalid abandonment idempotency key.');
  return key;
}

function trackedCheckoutStorage(): Storage | null {
  try { return typeof window === 'undefined' ? null : window.sessionStorage; } catch { return null; }
}

function pixCancelBlockStorageKey(orderId: string): string {
  return `${PIX_CANCEL_BLOCK_STORAGE_PREFIX}${orderId}`;
}

export function persistPixCancelBlock(orderId: string, blockedUntil: number): void {
  if (!/^[A-Za-z0-9._:-]{1,96}$/.test(orderId) || !Number.isFinite(blockedUntil)) return;
  try { trackedCheckoutStorage()?.setItem(pixCancelBlockStorageKey(orderId), JSON.stringify({ blockedUntil })); } catch {
    // UX cache only; Billing remains authoritative.
  }
}

export function clearPixCancelBlock(orderId: string): void {
  if (!/^[A-Za-z0-9._:-]{1,96}$/.test(orderId)) return;
  try { trackedCheckoutStorage()?.removeItem(pixCancelBlockStorageKey(orderId)); } catch { /* best effort */ }
}

export function readPixCancelBlock(orderId: string): number | null {
  if (!/^[A-Za-z0-9._:-]{1,96}$/.test(orderId)) return null;
  try {
    const raw = trackedCheckoutStorage()?.getItem(pixCancelBlockStorageKey(orderId));
    if (!raw) return null;
    const value = JSON.parse(raw) as Record<string, unknown>;
    if (typeof value.blockedUntil !== 'number' || !Number.isFinite(value.blockedUntil)) return null;
    if (value.blockedUntil <= Date.now()) {
      clearPixCancelBlock(orderId);
      return null;
    }
    return value.blockedUntil;
  } catch { return null; }
}

export function persistTrackedPixUpfrontCheckout(checkout: PersistedPixUpfrontCheckout): void {
  try { trackedCheckoutStorage()?.setItem(TRACKED_PIX_CHECKOUT_STORAGE_KEY, JSON.stringify(checkout)); } catch {
    // Persistence is a resume/reconciliation aid, never a prerequisite for Billing.
  }
}

export function clearPersistedTrackedPixUpfrontCheckout(): void {
  try { trackedCheckoutStorage()?.removeItem(TRACKED_PIX_CHECKOUT_STORAGE_KEY); } catch {
    // Storage may be unavailable or user-cleared.
  }
}

export function readPersistedTrackedPixUpfrontCheckout(): PersistedPixUpfrontCheckout | null {
  try {
    const raw = trackedCheckoutStorage()?.getItem(TRACKED_PIX_CHECKOUT_STORAGE_KEY);
    if (!raw) return null;
    const value = JSON.parse(raw) as Record<string, unknown>;
    if (
      typeof value.orderId !== 'string'
      || !/^[A-Za-z0-9._:-]{1,96}$/.test(value.orderId)
      || typeof value.statusUrl !== 'string'
      || typeof value.checkoutControlToken !== 'string'
      || !checkoutControlTokenPattern.test(value.checkoutControlToken)
      || value.paymentMethod !== 'pix'
      || value.paymentFlow !== 'PIX_UPFRONT'
      || typeof value.fingerprint !== 'string'
      || !['pending', 'abandoning', 'reconciliation_required', 'payment_confirmed'].includes(String(value.state))
      || typeof value.abandonmentIdempotencyKey !== 'string'
      || !checkoutIdempotencyKeyPattern.test(value.abandonmentIdempotencyKey)
    ) return null;
    resolveBillingStatusUrl(value.statusUrl, value.orderId);
    if (value.qrCodeSrc !== undefined && typeof value.qrCodeSrc !== 'string') return null;
    if (value.pixPayload !== undefined && typeof value.pixPayload !== 'string') return null;
    if (value.expiresAt !== undefined && typeof value.expiresAt !== 'number') return null;
    if (value.amount !== undefined && (typeof value.amount !== 'number' || !Number.isFinite(value.amount))) return null;
    return value as unknown as PersistedPixUpfrontCheckout;
  } catch {
    return null;
  }
}

export function persistTrackedCardCheckout(checkout: PersistedCardCheckout): void {
  try { trackedCheckoutStorage()?.setItem(TRACKED_CARD_CHECKOUT_STORAGE_KEY, JSON.stringify(checkout)); } catch {
    // Persistence is a reload recovery aid, never a prerequisite for Billing.
  }
}

export function clearPersistedTrackedCardCheckout(): void {
  try { trackedCheckoutStorage()?.removeItem(TRACKED_CARD_CHECKOUT_STORAGE_KEY); } catch {
    // Storage may be unavailable or user-cleared.
  }
}

export function readPersistedTrackedCardCheckout(): PersistedCardCheckout | null {
  try {
    const raw = trackedCheckoutStorage()?.getItem(TRACKED_CARD_CHECKOUT_STORAGE_KEY);
    if (!raw) return null;
    const value = JSON.parse(raw) as Record<string, unknown>;
    if (
      typeof value.orderId !== 'string'
      || !/^[A-Za-z0-9._:-]{1,96}$/.test(value.orderId)
      || typeof value.statusUrl !== 'string'
      || value.paymentMethod !== 'credit_card'
      || !['CREDIT_CARD_UPFRONT', 'ASAAS_HOSTED_CHECKOUT'].includes(String(value.paymentFlow))
      || typeof value.fingerprint !== 'string'
      || value.fingerprint.length === 0
    ) return null;
    resolveBillingStatusUrl(value.statusUrl, value.orderId);
    return value as unknown as PersistedCardCheckout;
  } catch {
    return null;
  }
}

export function toPixCheckoutDisplay(pix: Partial<BillingPix> | null | undefined): {
  qrCodeSrc: string | undefined;
  pixPayload: string;
  expiresAt: number | undefined;
} {
  return {
    qrCodeSrc: typeof pix?.qrCodeImage === 'string' && pix.qrCodeImage
      ? `data:image/png;base64,${pix.qrCodeImage}`
      : undefined,
    pixPayload: typeof pix?.payload === 'string' ? pix.payload : '',
    expiresAt: parsePixExpirationDate(pix?.expirationDate),
  };
}

/** Billing remains the source of truth for Pix validity. */
export function parsePixExpirationDate(expirationDate: unknown): number | undefined {
  if (typeof expirationDate !== 'string' || !expirationDate.trim()) return undefined;
  const normalized = expirationDate.trim();
  const localDateTime = /^(\d{4})-(\d{2})-(\d{2}) (\d{2}):(\d{2}):(\d{2})$/.exec(normalized);
  if (localDateTime) {
    const [, year, month, day, hour, minute, second] = localDateTime;
    const date = new Date(Number(year), Number(month) - 1, Number(day), Number(hour), Number(minute), Number(second));
    return Number.isNaN(date.getTime()) ? undefined : date.getTime();
  }
  const parsed = Date.parse(normalized);
  return Number.isNaN(parsed) ? undefined : parsed;
}

/** The public checkout must never present a Pix validity window longer than 24h. */
export function capPixExpirationAt24Hours(
  expiresAt: number | undefined,
  issuedAt = Date.now(),
): number | undefined {
  if (expiresAt === undefined || !Number.isFinite(expiresAt) || !Number.isFinite(issuedAt)) return expiresAt;
  return Math.min(expiresAt, issuedAt + 24 * 60 * 60 * 1_000);
}

export type CheckoutErrorDisposition =
  | 'definitive'
  | 'validation'
  | 'security_block'
  | 'origin_block'
  | 'refresh_capabilities'
  | 'retry_same'
  | 'reconcile_same'
  | 'wait_same'
  | 'idempotency_conflict'
  | 'hold_unknown';

export type TransparentCardCheckout = {
  orderId: string;
  statusUrl: string;
  reused: boolean;
};

export const CARD_REQUEST_TIMEOUT_MS = 75_000;
export const CARD_AUTOMATIC_RETRY_DELAYS_MS = [2_000, 5_000] as const;
export const CARD_ATTEMPT_WALL_CLOCK_LIMIT_MS = 240_000;
export const BOLETO_POLL_DELAYS_MS = [1_000, 2_000, 4_000, 8_000, 15_000, 30_000] as const;
export const BOLETO_STATUS_TIMEOUT_MS = 10_000;
export const BOLETO_POLL_WALL_CLOCK_LIMIT_MS = 120_000;

export type BoletoCheckout =
  | {
      state: 'PROCESSING';
      orderId: string;
      statusUrl: string;
      dueDate?: string;
    }
  | {
      state: 'READY';
      orderId: string;
      statusUrl: string;
      paymentId: string;
      bankSlipUrl: string;
      identificationField?: string;
      dueDate?: string;
    };

export type BoletoPollingDependencies = BillingCheckoutExecutionDependencies & {
};

export type BillingCheckoutExecutionDependencies = {
  waiter?: (delayMs: number, signal?: AbortSignal) => Promise<void>;
  clock?: () => number;
  scheduleAbort?: (abort: () => void, delayMs: number) => unknown;
  cancelAbort?: (handle: unknown) => void;
  signal?: AbortSignal;
  diagnosticSink?: BillingCheckoutDiagnosticSink;
};

export type BillingCheckoutDiagnosticEvent = {
  event:
    | 'billing_checkout.payload_shape'
    | 'billing_checkout.request_started'
    | 'billing_checkout.transport_failed'
    | 'billing_checkout.response_received'
    | 'billing_checkout.response_rejected'
    | 'billing_checkout.retry_scheduled'
    | 'billing_checkout.response_accepted'
    | 'billing_checkout.failed';
  paymentMethod: BillingPaymentMethod | 'pix_automatic';
  apiOrigin: string;
  browserOrigin?: string;
  elapsedMs: number;
  maxRequests: number;
  requestNumber?: number;
  timeoutMs?: number;
  reason?: 'browser_network_or_cors' | 'timeout' | 'cancelled';
  httpStatus?: number;
  retryDelayMs?: number;
  disposition?: CheckoutErrorDisposition;
  code?: string;
  requestId?: string;
  payloadShape?: {
    topLevelKeys: string[];
    agentType?: string;
    frequency?: string;
    paymentMethod?: string;
    accessQuantity?: number;
    customerKeys?: string[];
    accessNumbersCount?: number;
    addons?: string[];
    hasCreditCard: boolean;
    creditCardKeys?: string[];
    creditCardHolderInfoKeys?: string[];
  };
};

export type BillingCheckoutDiagnosticSink = (event: BillingCheckoutDiagnosticEvent) => void;

export type BillingCheckoutHttpResult = { status: number; data: unknown };

export type CheckoutAttempt = {
  fingerprint: string;
  key: string;
};

const CHECKOUT_ATTEMPT_STORAGE_PREFIX = 'ceruti.billing.checkout.';

const defaultBillingCheckoutDiagnosticSink: BillingCheckoutDiagnosticSink = (event) => {
  const runtimeMode = (import.meta as unknown as { env?: { MODE?: string } }).env?.MODE;
  // Shape diagnostics are intentionally development-only. They contain no
  // values from customer, card, session, or idempotency data.
  if (typeof window === 'undefined' || runtimeMode !== 'development') return;
  console.info('[ceruti:billing-checkout]', event);
};

function emitBillingCheckoutDiagnostic(
  sink: BillingCheckoutDiagnosticSink,
  event: BillingCheckoutDiagnosticEvent,
): void {
  try {
    sink(event);
  } catch {
    // Diagnostics must never alter or interrupt a financial attempt.
  }
}

export type HostedCardCheckout = {
  orderId: string;
  statusUrl: string;
  checkoutUrl: string;
};

export type BillingCheckoutResponseRoute =
  | 'pix'
  | 'boleto'
  | 'transparent_card'
  | 'hosted_card';

/**
 * The submitted payment method is only the customer's intent. Billing's
 * response method/flow identifies the payment attempt that actually exists.
 */
export function identifyBillingCheckoutResponse(value: unknown): BillingCheckoutResponseRoute | null {
  if (!isRecord(value)) return null;
  if (value.paymentMethod === 'PIX' && value.paymentFlow === 'PIX_UPFRONT') return 'pix';
  if (value.paymentMethod === 'BOLETO' && value.paymentFlow === 'ASAAS_SUBSCRIPTION') return 'boleto';
  if (value.paymentMethod === 'CREDIT_CARD' && value.paymentFlow === 'CREDIT_CARD_UPFRONT') {
    return 'transparent_card';
  }
  if (value.paymentMethod === 'CREDIT_CARD' && value.paymentFlow === 'ASAAS_HOSTED_CHECKOUT') {
    return 'hosted_card';
  }
  return null;
}

export type BillingOrderStatus = {
  ok: true;
  orderId: string;
  status: string;
  paid: boolean;
  financialStatus?: string | null;
  financial_status?: string | null;
  checkoutProvisioningStatus?: string | null;
  checkout_provisioning_status?: string | null;
  asaasPaymentStatus?: string | null;
  asaas_payment_status?: string | null;
  authorizationStatus?: string;
  canRedirect?: boolean;
  redirectTo?: string;
  paymentFlow?: string;
  paymentMethod?: string;
};

export type CardFinancialState = 'awaiting_confirmation' | 'paid' | 'canceled' | 'expired' | 'failed';

export type OrderPollingResult =
  | { kind: 'confirmed'; redirectTo: string }
  | { kind: 'terminal'; status: BillingOrderStatus }
  | { kind: 'timeout' };

/** Claims a checkout completion once for the lifetime of the mounted flow. */
export function createCheckoutRedirectGuard() {
  let redirectedOrderId: string | null = null;
  return {
    claim(orderId: string): boolean {
      if (redirectedOrderId === orderId) return false;
      redirectedOrderId = orderId;
      return true;
    },
  };
}

/** @deprecated Use OrderPollingResult. */
export type PixPaymentPollingResult = OrderPollingResult;

export const PIX_STATUS_POLL_INTERVAL_MS = 4_000;
export const PIX_STATUS_POLL_TIMEOUT_MS = 180_000;

export class BillingApiError extends Error {
  readonly code?: string;
  readonly disposition: CheckoutErrorDisposition;
  readonly requestId?: string;
  readonly recoverable: boolean;
  readonly status?: number;
  readonly retryAfterMs?: number;

  constructor(
    message: string,
    options: {
      code?: string;
      disposition?: CheckoutErrorDisposition;
      requestId?: string;
      recoverable: boolean;
      status?: number;
      retryAfterMs?: number;
    },
  ) {
    super(message);
    this.name = 'BillingApiError';
    this.code = options.code;
    this.disposition = options.disposition ?? (options.recoverable ? 'retry_same' : 'definitive');
    this.requestId = options.requestId;
    this.recoverable = options.recoverable;
    this.status = options.status;
    this.retryAfterMs = options.retryAfterMs;
  }
}

const DEFAULT_ERROR_MESSAGE = 'Não foi possível processar o pagamento agora.';
const IDEMPOTENCY_CONFLICT_MESSAGE =
  'Esta tentativa não pode ser reutilizada. Digite os dados novamente para iniciar uma nova tentativa.';

const PUBLIC_ERROR_MESSAGES: Record<CheckoutErrorDisposition, string> = {
  definitive: 'Não foi possível autorizar o cartão. Confira os dados e tente novamente.',
  validation: 'Confira os dados informados e tente novamente.',
  security_block: 'Não foi possível processar o cartão com segurança. Digite os dados novamente.',
  origin_block: 'Esta origem não está autorizada a processar o cartão.',
  refresh_capabilities: 'O pagamento com cartão está temporariamente indisponível.',
  retry_same: 'A conexão foi interrompida. Tente novamente com esta mesma tentativa.',
  reconcile_same: 'Esta tentativa ainda está sendo verificada. Aguarde antes de tentar novamente.',
  wait_same: 'Aguarde antes de tentar novamente com esta mesma tentativa.',
  idempotency_conflict: IDEMPOTENCY_CONFLICT_MESSAGE,
  hold_unknown: 'Não foi possível confirmar o resultado desta tentativa. Aguarde antes de tentar novamente.',
};

const PUBLIC_ERROR_MESSAGES_BY_CODE: Partial<Record<string, string>> = {
  PAYMENT_CHANGE_RATE_LIMITED: 'Você poderá alterar a forma de pagamento novamente em alguns minutos.',
  INVALID_CPF: 'Informe um CPF válido. Confira os números e tente novamente.',
  INVALID_CNPJ: 'Informe um CNPJ válido. Confira os números e tente novamente.',
  CHECKOUT_CONFIGURATION_CONFLICT:
    'Existe um pagamento Pix anterior aguardando encerramento. Vamos confirmar essa troca antes de iniciar outro.',
  SMOKE_TEST_DISABLED: 'O modo de teste financeiro está desabilitado no momento.',
  SMOKE_TEST_IDENTITY_NOT_ALLOWED: 'Esses dados não estão autorizados para o smoke test.',
  SMOKE_IDEMPOTENCY_KEY_REQUIRED: 'Erro interno no identificador do teste. Recarregue a página e tente novamente.',
  SMOKE_TICKET_INVALID:
    'O link de teste expirou ou não corresponde aos dados informados.',
  SMOKE_TICKET_UNAVAILABLE:
    'O teste financeiro está temporariamente indisponível.',
  AGENT_DELIVERY_TARGET_UNAVAILABLE:
    'Este agente ainda não está disponível para smoke test neste ambiente. Teste primeiro com Campo.',
  PIX_AUTOMATIC_UNAVAILABLE:
    'Não foi possível iniciar o Pix Automático agora. Tente novamente mais tarde ou escolha cartão.',
  ASAAS_REQUEST_FAILED:
    'Não foi possível iniciar o Pix Automático agora. Tente novamente mais tarde ou escolha cartão.',
  PIX_AUTOMATIC_PROVIDER_UNAVAILABLE:
    'Não foi possível iniciar o Pix Automático agora. Tente novamente mais tarde ou escolha cartão.',
  PIX_AUTOMATIC_DISABLED: 'Pix Automático está desabilitado neste ambiente de teste.',
  PIX_AUTOMATIC_SMOKE_DISABLED: 'Pix Automático está desabilitado neste ambiente de teste.',
  SMOKE_TEST_RATE_LIMITED: 'Limite de tentativas de teste atingido. Aguarde alguns minutos.',
  RATE_LIMITED: 'Limite de tentativas de teste atingido. Aguarde alguns minutos.',
  INVALID_BRAZILIAN_PHONE:
    'O número de celular informado é inválido. Confira o DDD e o número e tente novamente.',
  INVALID_DOCUMENT: 'Informe um CPF ou CNPJ válido.',
  INVALID_FREQUENCY: 'A frequência escolhida não está disponível neste checkout.',
  INVALID_ACCESS_QUANTITY: 'A quantidade de acessos informada não é permitida.',
  DUPLICATE_ACCESS_NUMBER: 'Os números adicionais devem ser únicos e diferentes do telefone principal.',
  ACCESS_NUMBER_ALREADY_ACTIVE:
    'Este número de acesso já está ativo para este agente. Use outro número de acesso para continuar.',
  RESUME_NOT_FOUND: 'Este link de assinatura não é válido. Solicite um novo link.',
  RESUME_TOKEN_INVALID: 'Este link de assinatura não é válido. Solicite um novo link.',
  RESUME_EXPIRED: 'Este link de assinatura expirou. Solicite um novo link.',
  RESUME_TRIAL_STILL_ACTIVE: 'Seu período de teste ainda está ativo.',
  RESUME_ALREADY_CONVERTED: 'Esta assinatura já foi concluída.',
  RESUME_ALREADY_USED: 'Já existe uma assinatura em andamento para este link.',
  RESUME_EVENT_NOT_ELIGIBLE: 'Este checkout não está mais elegível. Solicite um novo link.',
};

type CheckoutRequest =
  | BillingCheckoutRequest
  | CreditCardCheckoutRequest
  | ResumeCheckoutRequest
  | ResumeCreditCardCheckoutRequest;

export function createCheckoutAttempt(
  current: CheckoutAttempt | null,
  body: CheckoutRequest,
  createUuid: () => string,
  forceNew = false,
): CheckoutAttempt {
  const fingerprint = createNonSensitiveFingerprint(body);

  if (!forceNew && current?.fingerprint === fingerprint) {
    return current;
  }

  const persisted = forceNew || body.paymentMethod === 'credit_card' || isResumeCheckoutRequest(body)
    ? null
    : readPersistedAttempt(fingerprint);
  const attempt = persisted ?? {
    fingerprint,
    key: `checkout-${createUuid()}`,
  };
  if (body.paymentMethod !== 'credit_card' && !isResumeCheckoutRequest(body)) persistAttempt(attempt);
  return attempt;
}

export function createSmokeCheckoutAttempt(
  agentType: SmokeCheckoutRequest['agentType'],
  createUuid: () => string,
  now: () => number = Date.now,
): CheckoutAttempt {
  const key = `smoke-${agentType}-${now()}-${createUuid()}`;
  return { fingerprint: key, key };
}

function createNonSensitiveFingerprint(body: CheckoutRequest): string {
  if (isResumeCheckoutRequest(body)) {
    const identity = JSON.stringify({
      resumeToken: body.resumeToken,
      frequency: body.frequency,
      accessQuantity: body.accessQuantity,
      paymentMethod: body.paymentMethod,
      documentNumber: body.documentNumber,
      additionalAccessNumbers: body.additionalAccessNumbers ?? [],
      ...(isResumeCreditCardCheckoutRequest(body)
        ? { cardAttempt: `${body.creditCard.holderName}|${body.creditCard.number}|${body.creditCard.expiryMonth}|${body.creditCard.expiryYear}|${body.creditCard.ccv}` }
        : {}),
    });
    let hash = 2166136261;
    for (let index = 0; index < identity.length; index += 1) {
      hash ^= identity.charCodeAt(index);
      hash = Math.imul(hash, 16777619);
    }
    return `resume-checkout-fingerprint-${(hash >>> 0).toString(16).padStart(8, '0')}`;
  }
  const identity = JSON.stringify({
    agentType: body.agentType,
    frequency: body.frequency,
    accessQuantity: body.accessQuantity,
    paymentMethod: body.paymentMethod,
    customer: body.customer,
    accessNumbers: body.accessNumbers ?? [],
    addons: body.addons ?? [],
    // The card values participate only in the in-memory fingerprint, so a
    // changed card cannot reuse an attempt. Card attempts are never written
    // to sessionStorage (nor are any raw card values).
    ...(isCreditCardCheckoutRequest(body)
      ? { cardAttempt: `${body.creditCard.holderName}|${body.creditCard.number}|${body.creditCard.expiryMonth}|${body.creditCard.expiryYear}|${body.creditCard.ccv}` }
      : {}),
  });
  let hash = 2166136261;
  for (let index = 0; index < identity.length; index += 1) {
    hash ^= identity.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return `checkout-fingerprint-${(hash >>> 0).toString(16).padStart(8, '0')}`;
}

function isCreditCardCheckoutRequest(body: CheckoutRequest): body is CreditCardCheckoutRequest {
  return body.paymentMethod === 'credit_card' && 'creditCard' in body && 'customer' in body;
}

function checkoutPayloadShape(body: Record<string, unknown>): BillingCheckoutDiagnosticEvent['payloadShape'] {
  const customer = isRecord(body.customer) ? body.customer : undefined;
  const creditCard = isRecord(body.creditCard) ? body.creditCard : undefined;
  const holder = isRecord(body.creditCardHolderInfo) ? body.creditCardHolderInfo : undefined;
  return {
    topLevelKeys: Object.keys(body).sort(),
    ...(typeof body.agentType === 'string' ? { agentType: body.agentType } : {}),
    ...(typeof body.frequency === 'string' ? { frequency: body.frequency } : {}),
    ...(typeof body.paymentMethod === 'string' ? { paymentMethod: body.paymentMethod } : {}),
    ...(typeof body.accessQuantity === 'number' ? { accessQuantity: body.accessQuantity } : {}),
    ...(customer ? { customerKeys: Object.keys(customer).sort() } : {}),
    ...(Array.isArray(body.accessNumbers) ? { accessNumbersCount: body.accessNumbers.length } : {}),
    ...(Array.isArray(body.addons) ? { addons: body.addons.filter((value): value is string => typeof value === 'string') } : {}),
    hasCreditCard: Boolean(creditCard),
    ...(creditCard ? { creditCardKeys: Object.keys(creditCard).sort() } : {}),
    ...(holder ? { creditCardHolderInfoKeys: Object.keys(holder).sort() } : {}),
  };
}

function isResumeCreditCardCheckoutRequest(body: CheckoutRequest): body is ResumeCreditCardCheckoutRequest {
  return body.paymentMethod === 'credit_card' && 'resumeToken' in body && 'creditCard' in body;
}

function checkoutAttemptStorage(): Storage | null {
  try {
    return typeof window === 'undefined' ? null : window.sessionStorage;
  } catch {
    return null;
  }
}

function readPersistedAttempt(fingerprint: string): CheckoutAttempt | null {
  const storage = checkoutAttemptStorage();
  if (!storage) return null;
  try {
    const key = storage.getItem(`${CHECKOUT_ATTEMPT_STORAGE_PREFIX}${fingerprint}`);
    return key && /^[A-Za-z0-9._:-]{8,128}$/.test(key) ? { fingerprint, key } : null;
  } catch {
    return null;
  }
}

function persistAttempt(attempt: CheckoutAttempt): void {
  const storage = checkoutAttemptStorage();
  if (!storage) return;
  try {
    storage.setItem(`${CHECKOUT_ATTEMPT_STORAGE_PREFIX}${attempt.fingerprint}`, attempt.key);
  } catch {
    // Storage is an idempotency optimization, never a requirement to charge.
  }
}

export function discardCheckoutAttempt(attempt: CheckoutAttempt | null): void {
  if (!attempt) return;
  try {
    checkoutAttemptStorage()?.removeItem(`${CHECKOUT_ATTEMPT_STORAGE_PREFIX}${attempt.fingerprint}`);
  } catch {
    // Nothing to recover when storage is unavailable.
  }
}

export function isValidHttpsUrl(value: unknown): value is string {
  if (typeof value !== 'string') return false;

  try {
    const url = new URL(value);
    return url.protocol === 'https:' && Boolean(url.hostname) && !url.username && !url.password;
  } catch {
    return false;
  }
}

export function parseHostedCardCheckout(value: unknown): HostedCardCheckout | null {
  if (!isRecord(value)) return null;
  const creditCard = value.creditCard;

  if (
    value.ok !== true ||
    value.paymentMethod !== 'CREDIT_CARD' ||
    value.paymentFlow !== 'ASAAS_HOSTED_CHECKOUT' ||
    typeof value.orderId !== 'string' ||
    !value.orderId ||
    typeof value.statusUrl !== 'string' ||
    !value.statusUrl ||
    !isRecord(creditCard) ||
    creditCard.hosted !== true ||
    !isValidHttpsUrl(creditCard.checkoutUrl)
  ) {
    return null;
  }
  return {
    orderId: value.orderId,
    statusUrl: value.statusUrl,
    checkoutUrl: creditCard.checkoutUrl,
  };
}

const completionRedirectPattern = /^\/checkout\/success#ticket=ct_[A-Za-z0-9_-]{43}$/;
const transparentResponseKeys = new Set([
  'ok',
  'orderId',
  'status',
  'statusUrl',
  'reused',
  'paymentMethod',
  'paymentFlow',
  'creditCard',
]);
const transparentCreditCardKeys = new Set(['status', 'hosted']);

export function parseTransparentCardCheckout(
  value: unknown,
  httpStatus: number,
): TransparentCardCheckout | null {
  if (!isRecord(value) || hasUnexpectedKeys(value, transparentResponseKeys)) return null;
  const creditCard = value.creditCard;
  if (!isRecord(creditCard) || hasUnexpectedKeys(creditCard, transparentCreditCardKeys)) return null;

  const reused = httpStatus === 200 ? true : httpStatus === 201 ? false : null;
  if (
    reused === null ||
    value.ok !== true ||
    value.status !== 'AWAITING_PAYMENT' ||
    value.paymentMethod !== 'CREDIT_CARD' ||
    value.paymentFlow !== 'CREDIT_CARD_UPFRONT' ||
    value.reused !== reused ||
    creditCard.status !== 'PROCESSING' ||
    creditCard.hosted !== false ||
    typeof value.orderId !== 'string' ||
    !value.orderId ||
    typeof value.statusUrl !== 'string'
  ) {
    return null;
  }

  try {
    resolveBillingStatusUrl(value.statusUrl, value.orderId);
  } catch {
    return null;
  }

  return {
    orderId: value.orderId,
    statusUrl: value.statusUrl,
    reused,
  };
}

function hasUnexpectedKeys(value: Record<string, unknown>, allowedKeys: ReadonlySet<string>): boolean {
  return Object.keys(value).some((key) => !allowedKeys.has(key));
}

export function postBillingCheckout(
  attempt: CheckoutAttempt,
  body: CheckoutRequest,
  fetcher?: typeof fetch,
  executionDependencies?: BillingCheckoutExecutionDependencies,
): Promise<BillingCheckoutHttpResult>;
export async function postBillingCheckout(
  attempt: CheckoutAttempt,
  body: CheckoutRequest,
  fetcher: typeof fetch = fetch,
  executionDependencies: BillingCheckoutExecutionDependencies = {},
): Promise<BillingCheckoutHttpResult> {
  assertCheckoutRequest(body, attempt);

  const base = requireCerutiHttpsApiBase(BILLING_API_BASE_URL);
  const checkoutUrl = new URL('/billing/checkout', base).toString();
  const clock = executionDependencies.clock ?? Date.now;
  const waiter = executionDependencies.waiter ?? wait;
  const scheduleAbort = executionDependencies.scheduleAbort ?? (
    (abort: () => void, delayMs: number) => setTimeout(abort, delayMs)
  );
  const cancelAbort = executionDependencies.cancelAbort ?? (
    (handle: unknown) => clearTimeout(handle as ReturnType<typeof setTimeout>)
  );
  const diagnosticSink = executionDependencies.diagnosticSink ?? defaultBillingCheckoutDiagnosticSink;
  const startedAt = clock();
  const maxRequests = CARD_AUTOMATIC_RETRY_DELAYS_MS.length + 1;
  const browserOrigin = typeof window === 'undefined' ? undefined : window.location.origin;
  let lastError: BillingApiError | null = null;
  const retryDispositions: ReadonlySet<CheckoutErrorDisposition> = new Set([
    'retry_same',
    'reconcile_same',
    'wait_same',
  ]);
  const reportDiagnostic = (
    event: BillingCheckoutDiagnosticEvent['event'],
    details: Omit<
      Partial<BillingCheckoutDiagnosticEvent>,
      'event' | 'paymentMethod' | 'apiOrigin' | 'browserOrigin' | 'elapsedMs' | 'maxRequests'
    > = {},
  ) => {
    emitBillingCheckoutDiagnostic(diagnosticSink, {
      event,
      paymentMethod: body.paymentMethod,
      apiOrigin: base.origin,
      ...(browserOrigin ? { browserOrigin } : {}),
      elapsedMs: Math.max(0, clock() - startedAt),
      maxRequests,
      ...details,
    });
  };

  reportDiagnostic('billing_checkout.payload_shape', { payloadShape: checkoutPayloadShape(body) });

  for (let requestIndex = 0; requestIndex <= CARD_AUTOMATIC_RETRY_DELAYS_MS.length; requestIndex += 1) {
    throwIfAborted(executionDependencies.signal);
    const requestNumber = requestIndex + 1;
    const controller = new AbortController();
    const abortFromParent = () => controller.abort();
    executionDependencies.signal?.addEventListener('abort', abortFromParent, { once: true });
    const remainingMs = CARD_ATTEMPT_WALL_CLOCK_LIMIT_MS - (clock() - startedAt);
    const requestTimeoutMs = Math.min(CARD_REQUEST_TIMEOUT_MS, remainingMs);
    if (requestTimeoutMs <= 0) {
      throw createPublicBillingError(
        lastError?.status,
        lastError?.code,
        lastError?.requestId,
        'hold_unknown',
      );
    }
    let requestTimedOut = false;
    const timeout = scheduleAbort(() => {
      requestTimedOut = true;
      controller.abort();
    }, requestTimeoutMs);
    let response: Response;

    reportDiagnostic('billing_checkout.request_started', {
      requestNumber,
      timeoutMs: requestTimeoutMs,
    });
    try {
      response = await fetcher(checkoutUrl, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          'Idempotency-Key': attempt.key,
        },
        body: JSON.stringify(body),
        signal: controller.signal,
      });
    } catch {
      const reason = executionDependencies.signal?.aborted
        ? 'cancelled'
        : requestTimedOut
          ? 'timeout'
          : 'browser_network_or_cors';
      reportDiagnostic('billing_checkout.transport_failed', {
        requestNumber,
        timeoutMs: requestTimeoutMs,
        reason,
      });
      if (executionDependencies.signal?.aborted) throw createAbortError();
      lastError = createPublicBillingError(undefined, undefined, undefined, 'retry_same');
      response = new Response(null, { status: 599 });
    } finally {
      cancelAbort(timeout);
      executionDependencies.signal?.removeEventListener('abort', abortFromParent);
    }

    if (!lastError) {
      reportDiagnostic('billing_checkout.response_received', {
        requestNumber,
        httpStatus: response.status,
      });
      const data = await readJson(response);
      if (response.ok && isRecord(data) && data.ok === true) {
        reportDiagnostic('billing_checkout.response_accepted', {
          requestNumber,
          httpStatus: response.status,
        });
        return { status: response.status, data };
      }
      lastError = toBillingApiError(response.status, data);
      reportDiagnostic('billing_checkout.response_rejected', {
        requestNumber,
        httpStatus: response.status,
        disposition: lastError.disposition,
        ...(lastError.code ? { code: lastError.code } : {}),
        ...(lastError.requestId ? { requestId: lastError.requestId } : {}),
      });
    }

    if (lastError.code === 'CHECKOUT_CONFIGURATION_CONFLICT' || !retryDispositions.has(lastError.disposition)) {
      reportDiagnostic('billing_checkout.failed', {
        requestNumber,
        ...(lastError.status === undefined ? {} : { httpStatus: lastError.status }),
        disposition: lastError.disposition,
        ...(lastError.code ? { code: lastError.code } : {}),
        ...(lastError.requestId ? { requestId: lastError.requestId } : {}),
      });
      throw lastError;
    }

    const delayMs = lastError.retryAfterMs ?? CARD_AUTOMATIC_RETRY_DELAYS_MS[requestIndex];
    if (
      delayMs === undefined ||
      clock() - startedAt + delayMs >= CARD_ATTEMPT_WALL_CLOCK_LIMIT_MS
    ) {
      reportDiagnostic('billing_checkout.failed', {
        requestNumber,
        ...(lastError.status === undefined ? {} : { httpStatus: lastError.status }),
        disposition: 'hold_unknown',
        ...(lastError.code ? { code: lastError.code } : {}),
        ...(lastError.requestId ? { requestId: lastError.requestId } : {}),
      });
      throw createPublicBillingError(
        lastError.status,
        lastError.code,
        lastError.requestId,
        'hold_unknown',
      );
    }

    reportDiagnostic('billing_checkout.retry_scheduled', {
      requestNumber,
      retryDelayMs: delayMs,
      disposition: lastError.disposition,
      ...(lastError.code ? { code: lastError.code } : {}),
      ...(lastError.requestId ? { requestId: lastError.requestId } : {}),
    });
    await waitWithAbort(waiter, delayMs, executionDependencies.signal);
    lastError = null;
  }

  throw createPublicBillingError(
    lastError?.status,
    lastError?.code,
    lastError?.requestId,
    'hold_unknown',
  );
}

/** Explicitly releases a known pending PIX_UPFRONT order. */
export async function postBillingAbandonPayment(
  orderId: string,
  checkoutControlToken: string,
  idempotencyKey: string,
  fetcher: typeof fetch = fetch,
  signal?: AbortSignal,
): Promise<CheckoutAbandonmentResponse> {
  if (!/^[A-Za-z0-9._:-]{1,96}$/.test(orderId)
    || !checkoutControlTokenPattern.test(checkoutControlToken)
    || !checkoutIdempotencyKeyPattern.test(idempotencyKey)) {
    throw createPublicBillingError(422, 'VALIDATION_ERROR', undefined, 'validation');
  }
  throwIfAborted(signal);
  const base = requireCerutiHttpsApiBase(BILLING_API_BASE_URL);
  const endpoint = new URL(`/billing/orders/${encodeURIComponent(orderId)}/abandon-payment`, base).toString();
  let response: Response;
  try {
    response = await fetcher(endpoint, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        'X-Checkout-Control-Token': checkoutControlToken,
        'Idempotency-Key': idempotencyKey,
      },
      body: '{}',
      signal,
    });
  } catch (error) {
    if (signal?.aborted || (error instanceof DOMException && error.name === 'AbortError')) throw error;
    throw new BillingApiError('Estamos confirmando o cancelamento do pagamento anterior. Tente novamente em instantes.', {
      recoverable: true,
      disposition: 'reconcile_same',
    });
  }
  throwIfAborted(signal);
  const data = await readJson(response);
  if (!response.ok) throw toBillingApiError(response.status, data, response.headers, 600, 600_000);
  const parsed = parseCheckoutAbandonmentResponse(data, orderId);
  if (!parsed) {
    throw new BillingApiError('Estamos confirmando o cancelamento do pagamento anterior. Tente novamente em instantes.', {
      recoverable: true,
      disposition: 'reconcile_same',
      status: response.status,
    });
  }
  return parsed;
}

export async function postBillingSmokeCheckout(
  attempt: CheckoutAttempt,
  body: SmokeCheckoutRequest,
  smokeSession: string,
  fetcher: typeof fetch = fetch,
  signal?: AbortSignal,
  diagnosticSink: BillingCheckoutDiagnosticSink = defaultBillingCheckoutDiagnosticSink,
): Promise<BillingCheckoutHttpResult> {
  if (
    !/^smoke-[A-Za-z0-9._:-]{8,128}$/.test(attempt.key)
    || !isSmokeCheckoutRequest(body)
    || !/^[\x21-\x7E]{16,2048}$/.test(smokeSession)
  ) {
    throw createPublicBillingError(422, 'VALIDATION_ERROR', undefined, 'validation');
  }

  const base = requireCerutiHttpsApiBase(BILLING_API_BASE_URL);
  const paymentMethod: BillingCheckoutDiagnosticEvent['paymentMethod'] = body.paymentMethod === 'PIX_AUTOMATIC'
    ? 'pix_automatic'
    : 'credit_card';
  const reportDiagnostic = (
    event: BillingCheckoutDiagnosticEvent['event'],
    details: Omit<
      Partial<BillingCheckoutDiagnosticEvent>,
      'event' | 'paymentMethod' | 'apiOrigin' | 'elapsedMs' | 'maxRequests'
    > = {},
  ) => emitBillingCheckoutDiagnostic(diagnosticSink, {
    event,
    paymentMethod,
    apiOrigin: base.origin,
    elapsedMs: 0,
    maxRequests: 1,
    ...details,
  });

  reportDiagnostic('billing_checkout.payload_shape', { payloadShape: checkoutPayloadShape(body) });

  let response: Response;
  reportDiagnostic('billing_checkout.request_started', { requestNumber: 1 });
  try {
    response = await fetcher(new URL('/billing/smoke-test/checkout', base).toString(), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Idempotency-Key': attempt.key,
        'x-smoke-session': smokeSession,
      },
      body: JSON.stringify(body),
      signal,
    });
  } catch {
    if (signal?.aborted) throw createAbortError();
    reportDiagnostic('billing_checkout.transport_failed', {
      requestNumber: 1,
      reason: 'browser_network_or_cors',
    });
    throw createPublicBillingError(undefined, undefined, undefined, 'retry_same');
  }

  const data = await readJson(response);
  if (response.ok && isRecord(data) && data.ok === true) {
    reportDiagnostic('billing_checkout.response_accepted', { requestNumber: 1, httpStatus: response.status });
    return { status: response.status, data };
  }
  const error = toBillingApiError(response.status, data);
  reportDiagnostic('billing_checkout.response_rejected', {
    requestNumber: 1,
    httpStatus: response.status,
    disposition: error.disposition,
    ...(error.code ? { code: error.code } : {}),
    ...(error.requestId ? { requestId: error.requestId } : {}),
  });
  reportDiagnostic('billing_checkout.failed', {
    requestNumber: 1,
    httpStatus: response.status,
    disposition: error.disposition,
    ...(error.code ? { code: error.code } : {}),
    ...(error.requestId ? { requestId: error.requestId } : {}),
  });
  throw error;
}

function assertCheckoutRequest(body: CheckoutRequest, attempt: CheckoutAttempt): void {
  if (!isRecord(body) || createNonSensitiveFingerprint(body) !== attempt.fingerprint) {
    throw createPublicBillingError(422, 'VALIDATION_ERROR', undefined, 'validation');
  }

  if (
    !(isPublicCheckoutRequest(body)
      && (body.paymentMethod !== 'credit_card' || isTransparentCardRequest(body)))
    && !isResumePublicCheckoutRequest(body)
  ) {
    throw createPublicBillingError(422, 'VALIDATION_ERROR', undefined, 'validation');
  }
}

function isSmokeCheckoutRequest(value: unknown): value is SmokeCheckoutRequest {
  if (!isRecord(value)) return false;
  const customer = value.customer;
  const validBase = value.agentType === 'campo'
    && typeof value.accessNumber === 'string'
    && (value.addons === undefined || (
      Array.isArray(value.addons)
      && value.addons.every((addon) => addon === 'training_platform')
      && new Set(value.addons).size === value.addons.length
    ))
    && isRecord(customer)
    && hasExactKeys(customer, ['name', 'email', 'phone', 'documentNumber']);
  if (!validBase) return false;
  if (value.paymentMethod === 'PIX_AUTOMATIC') {
    return Object.keys(value).every((key) => ['agentType', 'paymentMethod', 'customer', 'accessNumber', 'addons'].includes(key));
  }
  const creditCard = value.creditCard;
  const holder = value.creditCardHolderInfo;
  return value.paymentMethod === 'CREDIT_CARD'
    && Object.keys(value).every((key) => ['agentType', 'paymentMethod', 'customer', 'accessNumber', 'addons', 'creditCard', 'creditCardHolderInfo'].includes(key))
    && isRecord(creditCard)
    && hasExactKeys(creditCard, ['holderName', 'number', 'expiryMonth', 'expiryYear', 'ccv'])
    && isRecord(holder)
    && Object.keys(holder).every((key) => [
      'name', 'email', 'cpfCnpj', 'postalCode', 'addressNumber', 'addressComplement', 'phone', 'mobilePhone',
    ].includes(key))
    && typeof holder.name === 'string'
    && typeof holder.email === 'string'
    && typeof holder.cpfCnpj === 'string'
    && typeof holder.postalCode === 'string'
    && typeof holder.addressNumber === 'string'
    && (holder.addressComplement === undefined || typeof holder.addressComplement === 'string')
    && typeof holder.phone === 'string'
    && typeof holder.mobilePhone === 'string';
}

export function parseSmokePixAutomaticCheckout(value: unknown): SmokePixAutomaticCheckout | null {
  if (
    !isRecord(value)
    || value.ok !== true
    || value.paymentMethod !== 'PIX'
    || value.paymentFlow !== 'PIX_AUTOMATIC'
  ) return null;
  if (
    typeof value.orderId !== 'string'
    || value.orderId.length === 0
    || typeof value.status !== 'string'
    || !isRecord(value.pix)
    || typeof value.pix.qrCodeImage !== 'string'
    || value.pix.qrCodeImage.length === 0
    || typeof value.pix.payload !== 'string'
    || value.pix.payload.length === 0
  ) return null;
  if (value.statusUrl !== undefined) {
    if (typeof value.statusUrl !== 'string') return null;
    try { resolveBillingStatusUrl(value.statusUrl, value.orderId); } catch { return null; }
  }
  return {
    orderId: value.orderId,
    status: value.status,
    ...(typeof value.statusUrl === 'string' ? { statusUrl: value.statusUrl } : {}),
    pix: {
      qrCodeImage: value.pix.qrCodeImage,
      payload: value.pix.payload,
      ...(typeof value.pix.conciliationIdentifier === 'string'
        ? { conciliationIdentifier: value.pix.conciliationIdentifier }
        : {}),
      ...(typeof value.pix.expirationDate === 'string'
        ? { expirationDate: value.pix.expirationDate }
        : {}),
    },
  };
}

function isPublicCheckoutRequest(value: Record<string, unknown>): value is CheckoutRequest {
  const customer = value.customer;
  const accessNumbers = value.accessNumbers;
  const allowedKeys = value.paymentMethod === 'credit_card'
    ? ['agentType', 'frequency', 'accessQuantity', 'paymentMethod', 'customer', 'accessNumbers', 'addons', 'creditCard', 'creditCardHolderInfo']
    : ['agentType', 'frequency', 'accessQuantity', 'paymentMethod', 'customer', 'accessNumbers', 'addons'];
  if (!isRecord(customer) || !hasExactKeys(customer, ['name', 'email', 'phone', 'documentNumber'])) return false;
  if (!Object.keys(value).every((key) => allowedKeys.includes(key))
    || value.agentType !== 'campo'
    || !['monthly', 'semiannual', 'annual'].includes(String(value.frequency))
  || !['pix', 'boleto', 'credit_card'].includes(String(value.paymentMethod))
    || !Number.isSafeInteger(value.accessQuantity)
    || (value.accessQuantity as number) < 1
    || (value.accessQuantity as number) > 500
    || typeof customer.name !== 'string' || customer.name.trim().length < 2
    || typeof customer.email !== 'string' || !/^\S+@\S+\.\S+$/.test(customer.email)
    || typeof customer.phone !== 'string' || !/^\d{10,11}$/.test(customer.phone.replace(/\D/g, ''))
    || typeof customer.documentNumber !== 'string' || !/^\d{11,18}$/.test(customer.documentNumber.replace(/\D/g, ''))
  ) return false;

  const addons = value.addons;
  if (addons !== undefined && (!Array.isArray(addons) || !addons.every((addon) => addon === 'training_platform') || new Set(addons).size !== addons.length)) return false;
  if (accessNumbers === undefined) return value.accessQuantity === 1;
  if (!Array.isArray(accessNumbers) || !accessNumbers.every((number) => typeof number === 'string')) return false;
  if (value.accessQuantity === 1) return accessNumbers.length <= 1;
  const normalized = accessNumbers.map((number) => number.replace(/\D/g, ''));
  return normalized.length === value.accessQuantity
    && normalized.every((number) => /^\d{10,11}$/.test(number))
    && new Set(normalized).size === normalized.length;
}

/** Validates the one-time Pix response and its order-bound abandonment capability. */
export function parsePixUpfrontCheckout(value: unknown): PixUpfrontCheckout | null {
  if (
    !isRecord(value)
    || value.paymentFlow !== 'PIX_UPFRONT'
    || typeof value.checkoutControlToken !== 'string'
    || !checkoutControlTokenPattern.test(value.checkoutControlToken)
  ) return null;
  const parsed = parseSmokePixAutomaticCheckout({
    ...value,
    paymentFlow: 'PIX_AUTOMATIC',
  });
  return parsed ? { ...parsed, checkoutControlToken: value.checkoutControlToken } : null;
}

export function parseCheckoutAbandonmentResponse(
  value: unknown,
  expectedOrderId: string,
): CheckoutAbandonmentResponse | null {
  if (!isRecord(value)) return null;
  if (value.ok !== undefined && value.ok !== true) return null;
  if (
    typeof value.state !== 'string'
    || typeof value.result !== 'string'
    || !['canceled', 'already_canceled', 'payment_already_completed', 'not_cancellable'].includes(value.result)
    || typeof value.canStartNewCheckout !== 'boolean'
    || typeof value.orderId !== 'string'
    || value.orderId !== expectedOrderId
    || typeof value.statusUrl !== 'string'
  ) return null;
  try { resolveBillingStatusUrl(value.statusUrl, expectedOrderId); } catch { return null; }
  const state = value.state;
  const result = value.result as CheckoutAbandonmentResult;
  const canStartNewCheckout = value.canStartNewCheckout;
  if (canStartNewCheckout !== (result === 'canceled' || result === 'already_canceled')) return null;
  return { state, result, canStartNewCheckout, orderId: value.orderId, statusUrl: value.statusUrl };
}

function isResumeCheckoutRequest(value: CheckoutRequest): value is ResumeCheckoutRequest | ResumeCreditCardCheckoutRequest {
  return 'resumeToken' in value;
}

function isResumePublicCheckoutRequest(value: Record<string, unknown>): value is ResumeCheckoutRequest | ResumeCreditCardCheckoutRequest {
  const additionalAccessNumbers = value.additionalAccessNumbers;
  const allowedKeys = value.paymentMethod === 'credit_card'
    ? ['resumeToken', 'frequency', 'accessQuantity', 'paymentMethod', 'documentNumber', 'additionalAccessNumbers', 'creditCard', 'creditCardHolderInfo']
    : ['resumeToken', 'frequency', 'accessQuantity', 'paymentMethod', 'documentNumber', 'additionalAccessNumbers'];
  const validBase = Object.keys(value).every((key) => allowedKeys.includes(key))
    && typeof value.resumeToken === 'string'
    && /^rsm_[A-Za-z0-9_-]{16,512}$/.test(value.resumeToken)
    && (value.frequency === 'monthly' || value.frequency === 'semiannual' || value.frequency === 'annual')
    && Number.isSafeInteger(value.accessQuantity)
    && (value.accessQuantity as number) >= 1
    && (value.accessQuantity as number) <= 500
    && ['pix', 'boleto', 'credit_card'].includes(String(value.paymentMethod))
    && typeof value.documentNumber === 'string'
    && /^\d{11,18}$/.test(value.documentNumber.replace(/\D/g, ''))
    && (additionalAccessNumbers === undefined || (
      Array.isArray(additionalAccessNumbers)
      && additionalAccessNumbers.length === (value.accessQuantity as number) - 1
      && additionalAccessNumbers.every((number) => typeof number === 'string' && /^\d{10,11}$/.test(number.replace(/\D/g, '')))
    ));
  if (!validBase) return false;

  if (value.paymentMethod !== 'credit_card') return true;
  const creditCard = value.creditCard;
  const holder = value.creditCardHolderInfo;
  return isRecord(creditCard)
    && isRecord(holder)
    && hasExactKeys(creditCard, ['holderName', 'number', 'expiryMonth', 'expiryYear', 'ccv'])
    && Object.keys(holder).every((key) => ['name', 'email', 'cpfCnpj', 'postalCode', 'addressNumber', 'addressComplement', 'phone', 'mobilePhone'].includes(key))
    && typeof creditCard.holderName === 'string'
    && typeof creditCard.number === 'string'
    && typeof creditCard.expiryMonth === 'string'
    && typeof creditCard.expiryYear === 'string'
    && typeof creditCard.ccv === 'string'
    && typeof holder.name === 'string'
    && typeof holder.email === 'string'
    && holder.cpfCnpj === value.documentNumber
    && typeof holder.postalCode === 'string'
    && typeof holder.addressNumber === 'string'
    && typeof holder.phone === 'string';
}

function isTransparentCardRequest(value: Record<string, unknown>): value is CreditCardCheckoutRequest {
  const customer = value.customer;
  const creditCard = value.creditCard;
  const creditCardHolderInfo = value.creditCardHolderInfo;
  if (
    !isRecord(customer) ||
    !isRecord(creditCard) ||
    !isRecord(creditCardHolderInfo)
  ) {
    return false;
  }

  return (
    Object.keys(value).every((key) => [
      'agentType',
      'frequency',
      'accessQuantity',
      'paymentMethod',
      'customer',
      'accessNumbers',
      'addons',
      'creditCard',
      'creditCardHolderInfo',
    ].includes(key)) &&
    hasExactKeys(customer, ['name', 'email', 'phone', 'documentNumber']) &&
    hasExactKeys(creditCard, [
      'holderName',
      'number',
      'expiryMonth',
      'expiryYear',
      'ccv',
    ]) &&
    Object.keys(creditCardHolderInfo).every((key) => [
      'name',
      'email',
      'cpfCnpj',
      'postalCode',
      'addressNumber',
      'addressComplement',
      'phone',
      'mobilePhone',
    ].includes(key)) &&
    value.agentType === 'campo' &&
    (
      value.frequency === 'monthly' ||
      value.frequency === 'semiannual' ||
      value.frequency === 'annual'
    ) &&
    typeof value.accessQuantity === 'number' &&
    Number.isSafeInteger(value.accessQuantity) &&
    value.accessQuantity > 0 &&
    (value.accessNumbers === undefined || (
      Array.isArray(value.accessNumbers)
      && value.accessNumbers.every((accessNumber) => typeof accessNumber === 'string')
      && (value.accessQuantity === 1 || value.accessNumbers.length === value.accessQuantity)
    )) &&
    (value.addons === undefined || (Array.isArray(value.addons) && value.addons.every((addon) => addon === 'training_platform') && new Set(value.addons).size === value.addons.length)) &&
    value.paymentMethod === 'credit_card' &&
    typeof customer.name === 'string' &&
    typeof customer.email === 'string' &&
    typeof customer.phone === 'string' &&
    typeof customer.documentNumber === 'string' &&
    typeof creditCardHolderInfo.name === 'string' &&
    typeof creditCardHolderInfo.email === 'string' &&
    typeof creditCardHolderInfo.cpfCnpj === 'string' &&
    typeof creditCardHolderInfo.postalCode === 'string' &&
    typeof creditCardHolderInfo.addressNumber === 'string' &&
    (creditCardHolderInfo.addressComplement === undefined || typeof creditCardHolderInfo.addressComplement === 'string') &&
    typeof creditCardHolderInfo.phone === 'string' &&
    (creditCardHolderInfo.mobilePhone === undefined || typeof creditCardHolderInfo.mobilePhone === 'string') &&
    customer.documentNumber === creditCardHolderInfo.cpfCnpj &&
    typeof creditCard.holderName === 'string' &&
    typeof creditCard.number === 'string' &&
    typeof creditCard.expiryMonth === 'string' &&
    typeof creditCard.expiryYear === 'string' &&
    typeof creditCard.ccv === 'string'
  );
}

function hasExactKeys(value: Record<string, unknown>, keys: readonly string[]): boolean {
  const actualKeys = Object.keys(value);
  return actualKeys.length === keys.length && keys.every((key) => key in value);
}

function createAbortError(): DOMException {
  return new DOMException('Aborted', 'AbortError');
}

function throwIfAborted(signal?: AbortSignal): void {
  if (signal?.aborted) throw createAbortError();
}

function wait(delayMs: number, signal?: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    throwIfAborted(signal);
    const timer = setTimeout(() => {
      signal?.removeEventListener('abort', onAbort);
      resolve();
    }, delayMs);
    const onAbort = () => {
      clearTimeout(timer);
      reject(createAbortError());
    };
    signal?.addEventListener('abort', onAbort, { once: true });
  });
}

async function waitWithAbort(
  waiter: (delayMs: number, signal?: AbortSignal) => Promise<void>,
  delayMs: number,
  signal?: AbortSignal,
): Promise<void> {
  throwIfAborted(signal);
  if (!signal) {
    await waiter(delayMs);
    return;
  }

  let abortListener: (() => void) | undefined;
  const aborted = new Promise<never>((_resolve, reject) => {
    abortListener = () => reject(createAbortError());
    signal.addEventListener('abort', abortListener, { once: true });
  });
  try {
    await Promise.race([waiter(delayMs, signal), aborted]);
  } finally {
    if (abortListener) signal.removeEventListener('abort', abortListener);
  }
}

export async function getBillingOrderStatus(
  _legacyApiBaseUrl: string,
  order: Pick<HostedCardCheckout, 'orderId' | 'statusUrl'>,
  fetcher: typeof fetch = fetch,
  signal?: AbortSignal,
): Promise<BillingOrderStatus> {
  const statusUrl = resolveBillingStatusUrl(order.statusUrl, order.orderId);
  let response: Response;

  try {
    response = await fetcher(statusUrl.toString(), {
      method: 'GET',
      headers: { Accept: 'application/json' },
      signal,
    });
  } catch {
    throw new BillingApiError('Não foi possível verificar o pagamento agora. Tente novamente.', {
      recoverable: true,
    });
  }

  const data = await readJson(response);
  if (!response.ok || !isBillingOrderStatus(data)) {
    throw toBillingApiError(response.status, data);
  }

  return data;
}

export function classifyCheckoutFailure(
  status: number,
  code: string | undefined,
): CheckoutErrorDisposition {
  if (
    code === 'SMOKE_TEST_DISABLED' ||
    code === 'SMOKE_TEST_IDENTITY_NOT_ALLOWED' ||
    code === 'SMOKE_IDEMPOTENCY_KEY_REQUIRED' ||
    code === 'AGENT_DELIVERY_TARGET_UNAVAILABLE' ||
    code === 'PIX_AUTOMATIC_UNAVAILABLE' ||
    code === 'PIX_AUTOMATIC_DISABLED' ||
    code === 'PIX_AUTOMATIC_SMOKE_DISABLED' ||
    code === 'INVALID_CREDIT_CARD' ||
    code === 'INVALID_CREDIT_CARD_EXPIRY' ||
    code === 'INVALID_CREDIT_CARD_SECURITY_CODE' ||
    code === 'CARD_HOLDER_DOCUMENT_MISMATCH' ||
    code === 'INVALID_CARD_HOLDER_INFO' ||
    code === 'ACCESS_NUMBER_ALREADY_ACTIVE' ||
    (status === 502 && code === 'ASAAS_ERROR')
  ) {
    return 'definitive';
  }

  if (code === 'TRANSPARENT_CARD_HTTPS_REQUIRED' || code === 'BUYER_IP_UNAVAILABLE') {
    return 'security_block';
  }
  if (status === 403 && code === 'ORIGIN_NOT_ALLOWED') return 'origin_block';
  if (status === 503 && code === 'TRANSPARENT_CARD_DISABLED') return 'refresh_capabilities';
  if (
    code === 'ASAAS_TIMEOUT' ||
    code === 'ASAAS_NETWORK_ERROR' ||
    code === 'BROWSER_NETWORK_ERROR' ||
    status === 408 ||
    status === 425
  ) {
    return 'retry_same';
  }
  if (code === 'CHECKOUT_IN_PROGRESS' || code === 'CHECKOUT_RECONCILIATION_REQUIRED' || code === 'CHECKOUT_CONFIGURATION_CONFLICT') {
    return 'reconcile_same';
  }
  if (status === 409 && code === 'IDEMPOTENCY_CONFLICT') return 'idempotency_conflict';
  if (status === 429 || code === 'CARD_RATE_LIMITED' || code === 'RATE_LIMITED') {
    return 'wait_same';
  }
  if (status === 422 || code === 'VALIDATION_ERROR' || code === 'INVALID_CPF' || code === 'INVALID_CNPJ') return 'validation';
  if (status === 409 || status >= 500) return 'hold_unknown';
  return 'definitive';
}

export function classifyCardFinancialState(status: BillingOrderStatus): CardFinancialState {
  const normalizedStatus = status.status.trim().toLowerCase();

  if (
    status.paid === true &&
    ['active', 'paid', 'confirmed', 'payment_confirmed', 'payment_received'].includes(normalizedStatus)
  ) {
    return 'paid';
  }

  if (['canceled', 'cancelled', 'refunded', 'chargeback'].includes(normalizedStatus)) return 'canceled';
  if (['expired', 'overdue_expired'].includes(normalizedStatus)) return 'expired';
  if (['failed', 'failure', 'payment_failed'].includes(normalizedStatus)) return 'failed';
  return 'awaiting_confirmation';
}

type NormalizedStatusField = { present: boolean; value: string };

function readNormalizedStatusField(
  order: BillingOrderStatus,
  camelKey: 'financialStatus' | 'checkoutProvisioningStatus' | 'asaasPaymentStatus',
  snakeKey: 'financial_status' | 'checkout_provisioning_status' | 'asaas_payment_status',
): NormalizedStatusField {
  const record = order as unknown as Record<string, unknown>;
  const key = Object.prototype.hasOwnProperty.call(record, camelKey)
    ? camelKey
    : Object.prototype.hasOwnProperty.call(record, snakeKey)
      ? snakeKey
      : null;
  return key
    ? { present: true, value: typeof record[key] === 'string' ? record[key].trim().toLowerCase() : '' }
    : { present: false, value: '' };
}

/**
 * Single frontend completion rule. The public Billing response currently
 * projects its internal financial/provisioning gate as `canRedirect`; if a
 * response includes the canonical fields, those fields are preferred and
 * Asaas status alone can never complete checkout.
 */
export function isCheckoutSuccessfullyCompleted(order: BillingOrderStatus): boolean {
  const status = order.status.trim().toLowerCase();
  const financial = readNormalizedStatusField(order, 'financialStatus', 'financial_status');
  const provisioning = readNormalizedStatusField(order, 'checkoutProvisioningStatus', 'checkout_provisioning_status');
  const asaas = readNormalizedStatusField(order, 'asaasPaymentStatus', 'asaas_payment_status');
  const terminalValues = new Set(['failed', 'failure', 'payment_failed', 'canceled', 'cancelled', 'expired', 'refunded', 'chargeback']);
  if (terminalValues.has(status) || terminalValues.has(financial.value) || terminalValues.has(asaas.value)) return false;
  if (financial.present || provisioning.present) {
    return status === 'active'
      && financial.value === 'active'
      && provisioning.value === 'completed';
  }
  return order.canRedirect === true;
}

export function getCheckoutStatusDiagnostics(status: BillingOrderStatus): Record<string, unknown> {
  const financial = readNormalizedStatusField(status, 'financialStatus', 'financial_status');
  const provisioning = readNormalizedStatusField(status, 'checkoutProvisioningStatus', 'checkout_provisioning_status');
  const asaas = readNormalizedStatusField(status, 'asaasPaymentStatus', 'asaas_payment_status');
  return {
    order_id: status.orderId,
    order_status: status.status,
    financial_status: financial.present ? financial.value : undefined,
    provisioning_status: provisioning.present ? provisioning.value : undefined,
    asaas_payment_status: asaas.present ? asaas.value : undefined,
  };
}

export function getConfirmedCompletionRedirect(status: BillingOrderStatus): string | null {
  return isCheckoutSuccessfullyCompleted(status)
    && typeof status.redirectTo === 'string'
    && completionRedirectPattern.test(status.redirectTo)
    ? status.redirectTo
    : null;
}

function isTerminalPixStatus(status: BillingOrderStatus): boolean {
  const orderStatus = status.status.trim().toLowerCase();
  const financial = readNormalizedStatusField(status, 'financialStatus', 'financial_status');
  return ['failed', 'failure', 'payment_failed', 'canceled', 'cancelled', 'expired', 'refunded', 'chargeback']
    .includes(orderStatus)
    || (financial.present && ['failed', 'canceled', 'cancelled', 'expired', 'refunded', 'chargeback'].includes(financial.value));
}

export async function pollOrderUntilCompletion(
  order: Pick<HostedCardCheckout, 'orderId' | 'statusUrl'>,
  options: {
    fetcher?: typeof fetch;
    signal?: AbortSignal;
    intervalMs?: number;
    timeoutMs?: number;
    now?: () => number;
    wait?: (delayMs: number, signal?: AbortSignal) => Promise<void>;
    onStatus?: (status: BillingOrderStatus) => void;
    onTemporaryError?: () => void;
  } = {},
): Promise<OrderPollingResult> {
  const now = options.now ?? Date.now;
  const intervalMs = options.intervalMs ?? PIX_STATUS_POLL_INTERVAL_MS;
  const timeoutMs = options.timeoutMs ?? PIX_STATUS_POLL_TIMEOUT_MS;
  const waiter = options.wait ?? wait;
  const deadline = now() + timeoutMs;

  while (now() < deadline) {
    throwIfAborted(options.signal);
    try {
      const status = await getBillingOrderStatus('', order, options.fetcher, options.signal);
      options.onStatus?.(status);
      const redirectTo = getConfirmedCompletionRedirect(status);
      if (redirectTo) return { kind: 'confirmed', redirectTo };
      if (isTerminalPixStatus(status)) return { kind: 'terminal', status };
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') throw error;
      options.onTemporaryError?.();
    }

    const remaining = deadline - now();
    if (remaining <= 0) break;
    await waitWithAbort(waiter, Math.min(intervalMs, remaining), options.signal);
  }

  return { kind: 'timeout' };
}

/**
 * Compatibility name for callers that previously displayed only Pix. The
 * implementation is payment-method agnostic and must be shared by card,
 * Pix, Pix Automatic and compatible boleto orders.
 */
export const pollPixPaymentStatus = pollOrderUntilCompletion;

export function resolveBillingStatusUrl(statusUrl: string, orderId: string): URL {
  const base = requireCerutiHttpsApiBase(BILLING_API_BASE_URL);
  const expectedPath = `/billing/orders/${encodeURIComponent(orderId)}/status`;
  if (statusUrl !== expectedPath) throw new Error('Invalid Billing status path.');
  const resolved = new URL(statusUrl, base);
  if (resolved.origin !== base.origin || resolved.protocol !== 'https:') {
    throw new Error('Invalid Billing status origin.');
  }
  return resolved;
}

export function parseBoletoCheckout(value: unknown): BoletoCheckout | null {
  if (
    !isRecord(value) ||
    value.ok !== true ||
    value.paymentMethod !== 'BOLETO' ||
    value.paymentFlow !== 'ASAAS_SUBSCRIPTION' ||
    typeof value.orderId !== 'string' ||
    !value.orderId ||
    typeof value.statusUrl !== 'string' ||
    !isRecord(value.boleto)
  ) {
    return null;
  }
  const boletoStatus = value.boleto.status;
  const checkoutStatus = value.checkoutStatus;
  const state = checkoutStatus ?? boletoStatus;
  if (
    (state !== 'READY' && state !== 'PROCESSING') ||
    (checkoutStatus !== undefined && boletoStatus !== undefined && checkoutStatus !== boletoStatus)
  ) {
    return null;
  }

  try {
    resolveBillingStatusUrl(value.statusUrl, value.orderId);
  } catch {
    return null;
  }

  const dueDate = typeof value.boleto.dueDate === 'string' && value.boleto.dueDate
    ? value.boleto.dueDate
    : undefined;
  if (state === 'PROCESSING') {
    return {
      state: 'PROCESSING',
      orderId: value.orderId,
      statusUrl: value.statusUrl,
      ...(dueDate ? { dueDate } : {}),
    };
  }

  const paymentId = value.boleto.paymentId;
  const bankSlipUrl = value.boleto.bankSlipUrl;
  const identificationField = value.boleto.identificationField;
  if (
    typeof paymentId !== 'string' ||
    !paymentId ||
    !isValidHttpsUrl(bankSlipUrl) ||
    (identificationField !== undefined && typeof identificationField !== 'string')
  ) {
    return null;
  }
  const safeIdentificationField = typeof identificationField === 'string' && identificationField
    ? identificationField
    : undefined;

  return {
    state: 'READY',
    orderId: value.orderId,
    statusUrl: value.statusUrl,
    paymentId,
    bankSlipUrl,
    ...(safeIdentificationField ? { identificationField: safeIdentificationField } : {}),
    ...(dueDate ? { dueDate } : {}),
  };
}

export async function getBoletoCheckoutStatus(
  order: Extract<BoletoCheckout, { state: 'PROCESSING' }>,
  fetcher: typeof fetch = fetch,
  dependencies: BoletoPollingDependencies = {},
): Promise<BoletoCheckout> {
  const waiter = dependencies.waiter ?? wait;
  const clock = dependencies.clock ?? Date.now;
  const scheduleAbort = dependencies.scheduleAbort ?? (
    (abort: () => void, delayMs: number) => setTimeout(abort, delayMs)
  );
  const cancelAbort = dependencies.cancelAbort ?? (
    (handle: unknown) => clearTimeout(handle as ReturnType<typeof setTimeout>)
  );
  const startedAt = clock();
  let current: Extract<BoletoCheckout, { state: 'PROCESSING' }> = order;

  for (const delayMs of BOLETO_POLL_DELAYS_MS) {
    throwIfAborted(dependencies.signal);
    const remainingBeforeDelay = BOLETO_POLL_WALL_CLOCK_LIMIT_MS - (clock() - startedAt);
    if (remainingBeforeDelay <= delayMs) return current;
    await waitWithAbort(waiter, delayMs, dependencies.signal);

    const remainingBeforeRequest = BOLETO_POLL_WALL_CLOCK_LIMIT_MS - (clock() - startedAt);
    if (remainingBeforeRequest <= 0) return current;
    const requestUrl = resolveBillingStatusUrl(current.statusUrl, current.orderId).toString();
    const controller = new AbortController();
    const abortFromParent = () => controller.abort();
    dependencies.signal?.addEventListener('abort', abortFromParent, { once: true });
    const timeout = scheduleAbort(
      () => controller.abort(),
      Math.min(BOLETO_STATUS_TIMEOUT_MS, remainingBeforeRequest),
    );

    try {
      const response = await fetcher(requestUrl, {
        method: 'GET',
        headers: { Accept: 'application/json' },
        signal: controller.signal,
      });
      if (dependencies.signal?.aborted) throw createAbortError();
      const parsed = parseBoletoCheckout(await readJson(response));
      if (
        response.ok &&
        parsed &&
        parsed.orderId === order.orderId &&
        parsed.statusUrl === order.statusUrl
      ) {
        if (parsed.state === 'READY') return parsed;
        current = parsed;
      }
    } catch {
      if (dependencies.signal?.aborted) throw createAbortError();
    } finally {
      cancelAbort(timeout);
      dependencies.signal?.removeEventListener('abort', abortFromParent);
    }
  }

  return current;
}

function isBillingOrderStatus(value: unknown): value is BillingOrderStatus {
  return (
    isRecord(value) &&
    value.ok === true &&
    typeof value.orderId === 'string' &&
    typeof value.status === 'string' &&
    typeof value.paid === 'boolean' &&
    ['financialStatus', 'financial_status', 'checkoutProvisioningStatus', 'checkout_provisioning_status', 'asaasPaymentStatus', 'asaas_payment_status']
      .every((key) => value[key] === undefined || value[key] === null || typeof value[key] === 'string')
  );
}

function toBillingApiError(status: number, value: unknown, headers?: Headers, retryAfterFallbackSeconds?: number, retryAfterCapMs = CARD_ATTEMPT_WALL_CLOCK_LIMIT_MS): BillingApiError {
  const error = isRecord(value) && isRecord(value.error) ? value.error : undefined;
  const code = typeof error?.code === 'string' ? error.code : undefined;
  const requestId = typeof error?.requestId === 'string' ? error.requestId : undefined;
  const bodyRetryAfterSeconds = typeof error?.retryAfterSeconds === 'number'
    ? error.retryAfterSeconds
    : typeof error?.details === 'object'
    && error.details !== null
    && typeof (error.details as Record<string, unknown>).retryAfterSeconds === 'number'
    ? (error.details as Record<string, number>).retryAfterSeconds
    : undefined;
  const headerValue = headers?.get('Retry-After');
  const headerRetryAfterSeconds = headerValue && /^\d+(?:\.\d+)?$/.test(headerValue) ? Number(headerValue) : undefined;
  const retryAfterSeconds = bodyRetryAfterSeconds ?? headerRetryAfterSeconds
    ?? (status === 429 && code === 'PAYMENT_CHANGE_RATE_LIMITED' ? retryAfterFallbackSeconds : undefined);
  return createPublicBillingError(status, code, requestId, classifyCheckoutFailure(status, code), retryAfterSeconds, retryAfterCapMs);
}

function createPublicBillingError(
  status: number | undefined,
  code: string | undefined,
  requestId: string | undefined,
  disposition: CheckoutErrorDisposition,
  retryAfterSeconds?: number,
  retryAfterCapMs = CARD_ATTEMPT_WALL_CLOCK_LIMIT_MS,
): BillingApiError {
  const recoverable =
    disposition === 'refresh_capabilities' ||
    disposition === 'retry_same' ||
    disposition === 'reconcile_same' ||
    disposition === 'wait_same';
  const message = PUBLIC_ERROR_MESSAGES_BY_CODE[code ?? '']
    ?? PUBLIC_ERROR_MESSAGES[disposition]
    ?? DEFAULT_ERROR_MESSAGE;
  return new BillingApiError(message, {
    code,
    disposition,
    requestId,
    recoverable,
    status,
    retryAfterMs: typeof retryAfterSeconds === 'number' && retryAfterSeconds >= 0
      ? Math.min(retryAfterSeconds * 1_000, retryAfterCapMs)
      : undefined,
  });
}

async function readJson(response: Response): Promise<unknown> {
  try {
    return await response.json();
  } catch {
    return null;
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}
