import { describe, expect, it, vi } from 'vitest';
import {
  clearPersistedTrackedPixUpfrontCheckout,
  createCheckoutAbandonmentIdempotencyKey,
  parseCheckoutAbandonmentResponse,
  persistTrackedPixUpfrontCheckout,
  postBillingAbandonPayment,
  readPersistedTrackedPixUpfrontCheckout,
  type PersistedPixUpfrontCheckout,
} from './billingCheckout';

const orderId = '692c71f5-5c9c-4e91-8b22-cfd4dea55ad8';
const token = 'cc_1234567890123456789012345678901234567890123';

function response(state: string, canStartNewCheckout: boolean) {
  return {
    ok: true,
    state,
    canStartNewCheckout,
    orderId,
    statusUrl: `/billing/orders/${orderId}/status`,
  };
}

describe('safe PIX_UPFRONT abandonment contract', () => {
  it('uses one deterministic key for every retry of an order operation', () => {
    const first = createCheckoutAbandonmentIdempotencyKey(orderId);
    expect(first).toBe(`checkout-abandon:${orderId}:configuration-change`);
    expect(createCheckoutAbandonmentIdempotencyKey(orderId)).toBe(first);
  });

  it.each([
    ['ABANDONED', true],
    ['ALREADY_TERMINAL', true],
    ['PAYMENT_CONFIRMED', false],
    ['RECONCILIATION_REQUIRED', false],
    ['STILL_PAYABLE', false],
  ] as const)('accepts %s without changing Billing authority', (state, canStartNewCheckout) => {
    expect(parseCheckoutAbandonmentResponse(response(state, canStartNewCheckout), orderId)).toMatchObject({ state, canStartNewCheckout, orderId });
  });

  it('posts the exact order, opaque control header and same idempotency key', async () => {
    const fetcher = vi.fn<typeof fetch>().mockResolvedValue(new Response(JSON.stringify(response('ABANDONED', true)), { status: 200 }));
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
      .mockResolvedValueOnce(new Response(JSON.stringify(response('RECONCILIATION_REQUIRED', false)), { status: 200 }))
      .mockResolvedValueOnce(new Response(JSON.stringify(response('ABANDONED', true)), { status: 200 }));
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
    expect(parseCheckoutAbandonmentResponse(response('ABANDONED', true), 'other-order')).toBeNull();
    expect(parseCheckoutAbandonmentResponse(response('PAYMENT_CONFIRMED', true), orderId)).toBeNull();
  });
});
