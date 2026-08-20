function isSessionToken(value: unknown): value is string {
  // A signed opaque bearer can use standard-base64 punctuation (+, /, =),
  // especially after the dot separator. Accept visible ASCII only; never
  // accept whitespace or control characters in a request header.
  return typeof value === 'string' && /^[\x21-\x7E]{16,2048}$/.test(value);
}

let smokeSessionInMemory: string | null | undefined;

declare global {
  interface Window { __CERUTI_SMOKE_SESSION__?: string; }
}

/** Reads the bootstrap value once, then removes the global reference. */
export function consumeCapturedSmokeSession(): string | null {
  if (typeof window === 'undefined') return null;
  const value = window.__CERUTI_SMOKE_SESSION__;
  delete window.__CERUTI_SMOKE_SESSION__;
  // A new fragment wins over HMR-preserved module state. Without this, Vite
  // Fast Refresh can reuse an older opaque session for a newly opened link.
  if (isSessionToken(value)) smokeSessionInMemory = value;
  else if (smokeSessionInMemory === undefined) smokeSessionInMemory = null;
  return smokeSessionInMemory;
}

export async function reportSmokeSessionDiagnostic(
  stage: 'before-fetch',
  token: string,
  identity: { name: string; email: string; phone: string; documentNumber: string },
): Promise<void> {
  if (typeof window === 'undefined' || !window.crypto?.subtle || !window.TextEncoder) return;
  try {
    const digest = await window.crypto.subtle.digest('SHA-256', new TextEncoder().encode(token));
    const sha256 = Array.from(new Uint8Array(digest)).map((value) => value.toString(16).padStart(2, '0')).join('');
    console.info('[ceruti:smoke-session]', {
      stage, length: token.length, prefix: token.slice(0, 8), suffix: token.slice(-8),
      hasSignatureSeparator: token.includes('.'), sha256, identity,
    });
  } catch {
    // Diagnostics must never interrupt the checkout.
  }
}
