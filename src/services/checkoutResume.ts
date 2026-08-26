import { BILLING_API_BASE_URL, requireCerutiHttpsApiBase } from './apiBaseUrl';

export type ResumeFrequency = 'monthly' | 'semiannual' | 'annual';

export type CheckoutResumeContext = {
  agentType: 'campo';
  prefill: { name: string; email: string; phone: string };
  allowedFrequencies: ResumeFrequency[];
  maxAccessQuantity: number;
};

export type CheckoutResumeErrorCode =
  | 'RESUME_NOT_FOUND'
  | 'RESUME_TOKEN_INVALID'
  | 'RESUME_EXPIRED'
  | 'RESUME_TRIAL_STILL_ACTIVE'
  | 'RESUME_ALREADY_CONVERTED'
  | 'RESUME_ALREADY_USED'
  | 'RESUME_EVENT_NOT_ELIGIBLE'
  | 'RESUME_UNAVAILABLE';

export class CheckoutResumeApiError extends Error {
  constructor(readonly code: CheckoutResumeErrorCode, readonly status?: number) {
    super(code);
    this.name = 'CheckoutResumeApiError';
  }
}

type RecordValue = Record<string, unknown>;

function isRecord(value: unknown): value is RecordValue {
  return typeof value === 'object' && value !== null;
}

function readString(value: unknown): string | null {
  return typeof value === 'string' && value.trim() ? value.trim() : null;
}

function readFrequency(value: unknown): ResumeFrequency | null {
  return value === 'monthly' || value === 'semiannual' || value === 'annual' ? value : null;
}

function readPositiveInteger(value: unknown): number | null {
  return typeof value === 'number' && Number.isSafeInteger(value) && value > 0 ? value : null;
}

function parseContext(value: unknown): CheckoutResumeContext | null {
  if (!isRecord(value) || value.ok !== true || !isRecord(value.resume)) return null;
  const resume = value.resume;
  const prefill = isRecord(resume.prefill) ? resume.prefill : null;
  const offer = isRecord(resume.offer) ? resume.offer : null;
  if (!prefill || !offer || resume.agentType !== 'campo') return null;

  const name = readString(prefill.name);
  const email = readString(prefill.email);
  const phone = readString(prefill.phone);
  const allowedFrequencies = Array.isArray(offer.allowedFrequencies)
    ? offer.allowedFrequencies.map(readFrequency).filter((frequency): frequency is ResumeFrequency => frequency !== null)
    : [];
  const maxAccessQuantity = readPositiveInteger(offer.maxAccessQuantity);
  if (!name || !email || !phone || !maxAccessQuantity || !allowedFrequencies.includes('monthly')) return null;

  return {
    agentType: 'campo',
    prefill: { name, email, phone },
    allowedFrequencies,
    maxAccessQuantity,
  };
}

function readErrorCode(value: unknown): CheckoutResumeErrorCode {
  const code = isRecord(value) && isRecord(value.error) ? value.error.code : undefined;
  switch (code) {
    case 'RESUME_NOT_FOUND':
    case 'RESUME_TOKEN_INVALID':
    case 'RESUME_EXPIRED':
    case 'RESUME_TRIAL_STILL_ACTIVE':
    case 'RESUME_ALREADY_CONVERTED':
    case 'RESUME_ALREADY_USED':
    case 'RESUME_EVENT_NOT_ELIGIBLE':
      return code;
    default:
      return 'RESUME_UNAVAILABLE';
  }
}

async function readJson(response: Response): Promise<unknown> {
  try {
    return await response.json();
  } catch {
    return null;
  }
}

export async function getCheckoutResumeContext(
  token: string,
  signal?: AbortSignal,
  fetcher: typeof fetch = fetch,
): Promise<CheckoutResumeContext> {
  if (!/^rsm_[A-Za-z0-9_-]{16,512}$/.test(token)) {
    throw new CheckoutResumeApiError('RESUME_NOT_FOUND', 404);
  }

  const base = requireCerutiHttpsApiBase(BILLING_API_BASE_URL);
  const url = new URL('/billing/public/checkout-resume', base);
  url.searchParams.set('token', token);
  let response: Response;
  try {
    response = await fetcher(url.toString(), {
      method: 'GET',
      headers: { Accept: 'application/json', 'Cache-Control': 'no-store' },
      cache: 'no-store',
      referrerPolicy: 'no-referrer',
      signal,
    });
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') throw error;
    throw new CheckoutResumeApiError('RESUME_UNAVAILABLE');
  }

  const data = await readJson(response);
  const parsed = parseContext(data);
  if (response.ok && parsed) return parsed;
  throw new CheckoutResumeApiError(readErrorCode(data), response.status);
}

declare global {
  interface Window {
    __CERUTI_CHECKOUT_RESUME_TOKEN__?: string;
    __CERUTI_CHECKOUT_RESUME_REQUESTED__?: boolean;
  }
}

export function getCapturedCheckoutResumeToken(): string | null {
  const token = typeof window === 'undefined' ? undefined : window.__CERUTI_CHECKOUT_RESUME_TOKEN__;
  // Do not leave the bearer on window after React captures it. The component
  // keeps it only in its in-memory ref for this screen's lifetime.
  if (typeof window !== 'undefined') delete window.__CERUTI_CHECKOUT_RESUME_TOKEN__;
  return token && /^rsm_[A-Za-z0-9_-]{16,512}$/.test(token) ? token : null;
}

export function consumeCapturedCheckoutResumeRequest(): boolean {
  if (typeof window === 'undefined') return false;
  const requested = window.__CERUTI_CHECKOUT_RESUME_REQUESTED__ === true;
  delete window.__CERUTI_CHECKOUT_RESUME_REQUESTED__;
  return requested;
}
