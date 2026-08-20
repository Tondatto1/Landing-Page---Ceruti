import { BILLING_API_BASE_URL, requireCerutiHttpsApiBase } from './apiBaseUrl';

export type CompletionAccessStatus = 'active' | 'activating' | 'pending' | string;

export type CompletionAccessNumber = {
  display: string;
  status: CompletionAccessStatus;
};

export type BillingCompletion = {
  firstName: string;
  agentType: string;
  agentLabel: string;
  frequencyLabel: string;
  paymentMethodLabel: string;
  activationStatus: string;
  accessNumbers: CompletionAccessNumber[];
  paidAt: string;
};

type CompletionSuccessResponse = {
  ok: true;
  completion: BillingCompletion;
};

type CompletionErrorResponse = {
  ok?: false;
  error?: {
    code?: string;
    message?: string;
  };
};

type CompletionApiResponse = CompletionSuccessResponse | CompletionErrorResponse;

export type CompletionErrorKind = 'invalid' | 'pending' | 'temporary';

export class CompletionApiError extends Error {
  readonly kind: CompletionErrorKind;
  readonly status?: number;
  readonly code?: string;

  constructor(kind: CompletionErrorKind, message: string, status?: number, code?: string) {
    super(message);
    this.name = 'CompletionApiError';
    this.kind = kind;
    this.status = status;
    this.code = code;
  }
}

export const COMPLETION_API_URL = requireCerutiHttpsApiBase(BILLING_API_BASE_URL).toString().replace(/\/$/, '');
const COMPLETION_TICKET_PATTERN = /^ct_[A-Za-z0-9_-]{43}$/;

const INVALID_COMPLETION_STATUSES = new Set([400, 401, 403, 404, 410, 422]);

function getErrorDetails(data: CompletionApiResponse | null) {
  if (!data || data.ok === true) return { code: '', message: '' };

  return {
    code: typeof data.error?.code === 'string' ? data.error.code : '',
    message: typeof data.error?.message === 'string' ? data.error.message : '',
  };
}

function classifyError(response: Response, data: CompletionApiResponse | null): CompletionErrorKind {
  const { code, message } = getErrorDetails(data);
  if (response.status === 409 && code.toUpperCase() === 'COMPLETION_PAYMENT_PENDING') {
    return 'pending';
  }

  if (INVALID_COMPLETION_STATUSES.has(response.status)) return 'invalid';
  if (response.status >= 500) return 'temporary';

  const description = `${code} ${message}`.toLocaleLowerCase('pt-BR');
  return /(ticket|session).*(invalid|expir|used|utiliz)|(?:invalid|expir|used|utiliz).*(ticket|session)/i.test(description)
    ? 'invalid'
    : 'temporary';
}

function isCompletionSuccess(data: CompletionApiResponse | null): data is CompletionSuccessResponse {
  if (!data || data.ok !== true || !('completion' in data)) return false;

  const completion = data.completion;
  return Boolean(
    completion
      && isNonEmptyString(completion.firstName)
      && isNonEmptyString(completion.agentType)
      && isNonEmptyString(completion.agentLabel)
      && isNonEmptyString(completion.frequencyLabel)
      && isNonEmptyString(completion.paymentMethodLabel)
      && isNonEmptyString(completion.activationStatus)
      && isNonEmptyString(completion.paidAt)
      && !Number.isNaN(Date.parse(completion.paidAt))
      && Array.isArray(completion.accessNumbers)
      && completion.accessNumbers.every((accessNumber) => (
        accessNumber
        && isNonEmptyString(accessNumber.display)
        && isNonEmptyString(accessNumber.status)
      )),
  );
}

async function parseResponse(response: Response): Promise<CompletionApiResponse | null> {
  try {
    return await response.json() as CompletionApiResponse;
  } catch {
    return null;
  }
}

async function requestCompletion(
  path: '/billing/completion/exchange' | '/billing/completion',
  init: RequestInit,
): Promise<BillingCompletion> {
  let response: Response;

  try {
    response = await fetch(`${COMPLETION_API_URL}${path}`, {
      ...init,
      credentials: 'include',
    });
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') throw error;
    throw new CompletionApiError('temporary', 'Não foi possível acessar o serviço de confirmação.');
  }

  const data = await parseResponse(response);
  if (response.ok && isCompletionSuccess(data)) return data.completion;

  const { code, message } = getErrorDetails(data);
  throw new CompletionApiError(
    classifyError(response, data),
    message || 'Não foi possível confirmar a compra.',
    response.status,
    code,
  );
}

export function exchangeCompletionTicket(ticket: string, signal?: AbortSignal) {
  return requestCompletion('/billing/completion/exchange', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ticket }),
    signal,
  });
}

export function getCompletionTicketFromHash(hash: string): string | null {
  const ticket = new URLSearchParams(hash.replace(/^#/, '')).get('ticket');
  return ticket && COMPLETION_TICKET_PATTERN.test(ticket) ? ticket : null;
}

export function getBillingCompletion(signal?: AbortSignal) {
  return requestCompletion('/billing/completion', {
    method: 'GET',
    signal,
  });
}

export function isInvalidCompletionError(error: unknown) {
  return error instanceof CompletionApiError && error.kind === 'invalid';
}

export function isPendingCompletionError(error: unknown) {
  return error instanceof CompletionApiError && error.kind === 'pending';
}

type ResolveCompletionOptions = {
  ticket: string | null;
  signal?: AbortSignal;
};

export async function resolveBillingCompletion({
  ticket,
  signal,
}: ResolveCompletionOptions) {
  // A ticket identifies a specific checkout. Never let a pre-existing completion
  // cookie replace it, including after retries or a StrictMode effect restart.
  return ticket
    ? exchangeCompletionTicket(ticket, signal)
    : getBillingCompletion(signal);
}

export const COMPLETION_PENDING_RETRY_MS = 2_000;
export const COMPLETION_PENDING_TIMEOUT_MS = 60_000;
export const COMPLETION_TEMPORARY_MAX_ATTEMPTS = 3;

type CompletionRetryOptions = ResolveCompletionOptions & {
  onTicketExchangeAttempt?: () => void;
  onPending?: () => void;
  pendingRetryMs?: number;
  pendingTimeoutMs?: number;
  temporaryMaxAttempts?: number;
  wait?: (delayMs: number, signal?: AbortSignal) => Promise<void>;
};

export async function resolveBillingCompletionWithRetries({
  ticket,
  signal,
  onTicketExchangeAttempt,
  onPending,
  pendingRetryMs = COMPLETION_PENDING_RETRY_MS,
  pendingTimeoutMs = COMPLETION_PENDING_TIMEOUT_MS,
  temporaryMaxAttempts = COMPLETION_TEMPORARY_MAX_ATTEMPTS,
  wait = waitForDelay,
}: CompletionRetryOptions): Promise<BillingCompletion> {
  let temporaryAttempts = 0;
  const pendingDeadline = Date.now() + pendingTimeoutMs;

  while (true) {
    if (ticket) onTicketExchangeAttempt?.();

    try {
      return await resolveBillingCompletion({
        ticket,
        signal,
      });
    } catch (error) {
      if (isPendingCompletionError(error)) {
        onPending?.();
        if (Date.now() >= pendingDeadline) throw error;
        await wait(Math.min(pendingRetryMs, Math.max(0, pendingDeadline - Date.now())), signal);
        continue;
      }

      if (error instanceof CompletionApiError && error.kind === 'temporary') {
        temporaryAttempts += 1;
        if (temporaryAttempts >= temporaryMaxAttempts) throw error;
        await wait(pendingRetryMs, signal);
        continue;
      }

      throw error;
    }
  }
}

function waitForDelay(delayMs: number, signal?: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(new DOMException('Aborted', 'AbortError'));
      return;
    }

    const onAbort = () => {
      clearTimeout(timer);
      reject(new DOMException('Aborted', 'AbortError'));
    };
    const timer = setTimeout(() => {
      signal?.removeEventListener('abort', onAbort);
      resolve();
    }, delayMs);
    signal?.addEventListener('abort', onAbort, { once: true });
  });
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}
