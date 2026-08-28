import { describe, expect, it, vi } from 'vitest';
import {
  clearPersistedTrackedPixUpfrontCheckout,
  createCheckoutAbandonmentIdempotencyKey,
  parseCheckoutAbandonmentResponse,
  persistTrackedPixUpfrontCheckout,
  postBillingAbandonPayment,
  readPixCancelBlock,
  persistPixCancelBlock,
  clearPixCancelBlock,
  readPersistedTrackedPixUpfrontCheckout,
  type PersistedPixUpfrontCheckout,
} from './billingCheckout';

const orderId = '692c71f5-5c9c-4e91-8b22-cfd4dea55ad8';
const token = 'cc_1234567890123456789012345678901234567890123';

function response(result: string, canStartNewCheckout: boolean) {
  return {
    ok: true,
    state: result === 'payment_already_completed' ? 'PAYMENT_CONFIRMED' : result === 'not_cancellable' ? 'NOT_CANCELLABLE' : 'ABANDONED',
    result,
    canStartNewCheckout,
    orderId,
    statusUrl: `/billing/orders/${orderId}/status`,
  };
}

describe('safe PIX_UPFRONT abandonment contract', () => {
  it('maps the body retryAfterSeconds before the exposed Retry-After header', async () => {
    const fetcher = vi.fn<typeof fetch>().mockResolvedValue(new Response(JSON.stringify({ ok: false, error: { code: 'PAYMENT_CHANGE_RATE_LIMITED', retryAfterSeconds: 300 } }), { status: 429, headers: { 'Retry-After': '600' } }));
    await expect(postBillingAbandonPayment(orderId, token, createCheckoutAbandonmentIdempotencyKey(orderId), fetcher)).rejects.toMatchObject({ code: 'PAYMENT_CHANGE_RATE_LIMITED', status: 429, retryAfterMs: 300_000 });
  });

  it('falls back to Retry-After and then to 600 seconds for the rate limit', async () => {
    const withHeader = vi.fn<typeof fetch>().mockResolvedValue(new Response(JSON.stringify({ ok: false, error: { code: 'PAYMENT_CHANGE_RATE_LIMITED' } }), { status: 429, headers: { 'Retry-After': '300' } }));
    await expect(postBillingAbandonPayment(orderId, token, createCheckoutAbandonmentIdempotencyKey(orderId), withHeader)).rejects.toMatchObject({ retryAfterMs: 300_000 });
    const withoutHeader = vi.fn<typeof fetch>().mockResolvedValue(new Response(JSON.stringify({ ok: false, error: { code: 'PAYMENT_CHANGE_RATE_LIMITED' } }), { status: 429 }));
    await expect(postBillingAbandonPayment(orderId, token, createCheckoutAbandonmentIdempotencyKey(orderId), withoutHeader)).rejects.toMatchObject({ retryAfterMs: 600_000 });
  });

  it('stores and removes only the UX block cache', () => {
    const storage = new Map<string, string>();
    vi.stubGlobal('window', { sessionStorage: { getItem: (key: string) => storage.get(key) ?? null, setItem: (key: string, value: string) => storage.set(key, value), removeItem: (key: string) => storage.delete(key) } });
    const blockedUntil = Date.now() + 300_000;
    persistPixCancelBlock(orderId, blockedUntil);
    expect(readPixCancelBlock(orderId)).toBe(blockedUntil);
    clearPixCancelBlock(orderId);
    expect(readPixCancelBlock(orderId)).toBeNull();
    vi.unstubAllGlobals();
  });
  it('uses one deterministic key for every retry of an order operation', () => {
    const first = createCheckoutAbandonmentIdempotencyKey(orderId);
    expect(first).toBe(`checkout-abandon:${orderId}:configuration-change`);
    expect(createCheckoutAbandonmentIdempotencyKey(orderId)).toBe(first);
  });

  it.each([
    ['canceled', true],
    ['already_canceled', true],
    ['payment_already_completed', false],
    ['not_cancellable', false],
  ] as const)('accepts %s without changing Billing authority', (result, canStartNewCheckout) => {
    expect(parseCheckoutAbandonmentResponse(response(result, canStartNewCheckout), orderId)).toMatchObject({ result, canStartNewCheckout, orderId });
  });

  it('posts the exact order, opaque control header and same idempotency key', async () => {
    const fetcher = vi.fn<typeof fetch>().mockResolvedValue(new Response(JSON.stringify(response('canceled', true)), { status: 200 }));
    const key = createCheckoutAbandonmentIdempotencyKey(orderId);
    await postBillingAbandonPayment(orderId, token, key, fetcher);
    const [url, init] = fetcher.mock.calls[0];
    expect(url).toContain(`/billing/orders/${orderId}/abandon-payment`);
    expect(init?.method).toBe('POST');
    expect(init?.headers).toMatchObject({
      'X-Checkout-Control-Token': token,
      'Idempotency-Key': key,
    });
    expect(init?.body).toBe('{}');
    expect(JSON.stringify(init)).not.toContain('price');
    expect(JSON.stringify(init)).toContain(token);
  });

  it('retries the same logical abandonment with the same key', async () => {
    const fetcher = vi.fn<typeof fetch>()
      .mockResolvedValueOnce(new Response(JSON.stringify(response('not_cancellable', false)), { status: 200 }))
      .mockResolvedValueOnce(new Response(JSON.stringify(response('canceled', true)), { status: 200 }));
    const key = createCheckoutAbandonmentIdempotencyKey(orderId);
    await postBillingAbandonPayment(orderId, token, key, fetcher);
    await postBillingAbandonPayment(orderId, token, key, fetcher);
    expect(fetcher.mock.calls).toHaveLength(2);
    expect(fetcher.mock.calls[0][1]?.headers).toMatchObject({ 'Idempotency-Key': key });
    expect(fetcher.mock.calls[1][1]?.headers).toMatchObject({ 'Idempotency-Key': key });
  });

  it('fails closed on network failure so the UI can reconcile instead of creating a checkout', async () => {
    const fetcher = vi.fn<typeof fetch>().mockRejectedValue(new Error('offline'));
    await expect(postBillingAbandonPayment(orderId, token, createCheckoutAbandonmentIdempotencyKey(orderId), fetcher))
      .rejects.toMatchObject({ disposition: 'reconcile_same', recoverable: true });
  });

  it('keeps the token/order reference across reload and clears it only explicitly', () => {
    const storage = new Map<string, string>();
    vi.stubGlobal('window', { sessionStorage: {
      getItem: (key: string) => storage.get(key) ?? null,
      setItem: (key: string, value: string) => storage.set(key, value),
      removeItem: (key: string) => storage.delete(key),
    } });
    const record: PersistedPixUpfrontCheckout = {
      orderId,
      statusUrl: `/billing/orders/${orderId}/status`,
      checkoutControlToken: token,
      paymentMethod: 'pix',
      paymentFlow: 'PIX_UPFRONT',
      fingerprint: '{"frequency":"monthly"}',
      state: 'abandoning',
      abandonmentIdempotencyKey: createCheckoutAbandonmentIdempotencyKey(orderId),
    };
    persistTrackedPixUpfrontCheckout(record);
    expect(readPersistedTrackedPixUpfrontCheckout()).toEqual(record);
    clearPersistedTrackedPixUpfrontCheckout();
    expect(readPersistedTrackedPixUpfrontCheckout()).toBeNull();
    vi.unstubAllGlobals();
  });

  it('rejects a response for a different order or a mismatched canStartNewCheckout flag', () => {
    expect(parseCheckoutAbandonmentResponse(response('canceled', true), 'other-order')).toBeNull();
    expect(parseCheckoutAbandonmentResponse(response('payment_already_completed', true), orderId)).toBeNull();
  });
});
