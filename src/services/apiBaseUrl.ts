const DEFAULT_BILLING_API_BASE_URL = 'https://api.ceruti.ia.br';

export function normalizeApiBaseUrl(value: string): string {
  return value.trim().replace(/\/+$/, '');
}

export function resolveApiBaseUrl(value?: string): string {
  return normalizeApiBaseUrl(value ?? '') || DEFAULT_BILLING_API_BASE_URL;
}

const configuredBillingApiBase =
  (import.meta as unknown as { env?: Record<string, string | undefined> }).env
    ?.VITE_BILLING_API_BASE_URL
  ?? (import.meta as unknown as { env?: Record<string, string | undefined> }).env?.VITE_BILLING_API_URL
  // Compatibility during the environment-variable migration.  This is still
  // public configuration, never an API key or a deployment target.
  ?? (import.meta as unknown as { env?: Record<string, string | undefined> }).env?.VITE_API_BASE_URL
  ?? DEFAULT_BILLING_API_BASE_URL;

export const BILLING_API_BASE_URL = resolveApiBaseUrl(configuredBillingApiBase);
// Compatibility for non-Billing public integrations still sharing the same
// configured public API origin. New Billing code must use the explicit name.
export const API_BASE_URL = BILLING_API_BASE_URL;

export function requireCerutiHttpsApiBase(value: string): URL {
  const url = new URL(`${normalizeApiBaseUrl(value)}/`);
  if (
    url.protocol !== 'https:'
    || !url.hostname
    || url.username
    || url.password
    || url.hostname === 'localhost'
    || url.hostname.endsWith('.local')
    || url.hostname.endsWith('.internal')
  ) {
    throw new Error('Billing API HTTPS origin is not allowed.');
  }
  return url;
}
