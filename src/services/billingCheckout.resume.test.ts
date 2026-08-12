import { describe, expect, it, vi } from 'vitest';
import {
  createCheckoutAttempt,
  postBillingCheckout,
  type BillingCheckoutRequest,
  type ResumeCheckoutRequest,
} from './billingCheckout';

describe('resume checkout payload', () => {
  it('posts only the resume-authorized fields and never persists its idempotency key', async () => {
    const storage = new Map<string, string>();
    vi.stubGlobal('window', {
      location: { origin: 'https://lp.example.test' },
      sessionStorage: {
        getItem: (key: string) => storage.get(key) ?? null,
        setItem: (key: string, value: string) => storage.set(key, value),
        removeItem: (key: string) => storage.delete(key),
      },
    });
    const body: ResumeCheckoutRequest = {
      resumeToken: `rsm_${'b'.repeat(32)}`,
      frequency: 'monthly',
      accessQuantity: 2,
      paymentMethod: 'pix_automatic',
      documentNumber: '12345678901',
      additionalAccessNumbers: ['67999999999'],
    };
    const attempt = createCheckoutAttempt(null, body, () => 'resume-attempt');
    const fetcher = vi.fn<typeof fetch>().mockResolvedValue(new Response(JSON.stringify({ ok: true }), { status: 201 }));

    await postBillingCheckout(attempt, body, fetcher);

    const [, init] = fetcher.mock.calls[0];
    expect(JSON.parse(String(init?.body))).toEqual(body);
    expect(init?.headers).toMatchObject({ 'Idempotency-Key': 'checkout-resume-attempt' });
    expect(storage.get(`ceruti.billing.checkout.${attempt.fingerprint}`)).toBeUndefined();
    vi.unstubAllGlobals();
  });

  it('keeps the normal checkout payload and its session idempotency behavior unchanged', () => {
    const storage = new Map<string, string>();
    vi.stubGlobal('window', {
      location: { origin: 'https://lp.example.test' },
      sessionStorage: {
        getItem: (key: string) => storage.get(key) ?? null,
        setItem: (key: string, value: string) => storage.set(key, value),
        removeItem: (key: string) => storage.delete(key),
      },
    });
    const normalBody: BillingCheckoutRequest = {
      agentType: 'campo',
      frequency: 'monthly',
      accessQuantity: 1,
      paymentMethod: 'pix_automatic',
      customer: { name: 'Ana Teste', email: 'ana@example.test', phone: '67999999999', documentNumber: '12345678901' },
    };

    const attempt = createCheckoutAttempt(null, normalBody, () => 'normal-attempt');

    expect(attempt.key).toBe('checkout-normal-attempt');
    expect(storage.get(`ceruti.billing.checkout.${attempt.fingerprint}`)).toBe(attempt.key);
    vi.unstubAllGlobals();
  });
});
