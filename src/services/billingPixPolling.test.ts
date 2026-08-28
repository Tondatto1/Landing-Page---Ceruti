import { describe, expect, it, vi } from 'vitest';
import {
  clearPersistedTrackedCardCheckout,
  createCheckoutRedirectGuard,
  isCheckoutSuccessfullyCompleted,
  parseTransparentCardCheckout,
  persistTrackedCardCheckout,
  pollOrderUntilCompletion,
  readPersistedTrackedCardCheckout,
} from './billingCheckout';

const order = {
  orderId: 'order-pix-1',
  statusUrl: '/billing/orders/order-pix-1/status',
};
const redirectTo = `/checkout/success#ticket=ct_${'a'.repeat(43)}`;

function statusResponse(overrides: Record<string, unknown> = {}) {
  return new Response(JSON.stringify({
    ok: true,
    orderId: order.orderId,
    status: 'awaiting_payment',
    paid: false,
    canRedirect: false,
    ...overrides,
  }), { status: 200, headers: { 'Content-Type': 'application/json' } });
}

describe('order payment status polling', () => {
  it('uses one polling algorithm for card, smoke card, and Pix: pending provisioning redirects only after canRedirect', async () => {
    const responses = [
      statusResponse(),
      statusResponse({ paid: true, status: 'payment_confirmed', canRedirect: true, redirectTo }),
    ];
    let now = 0;
    const result = await pollOrderUntilCompletion(order, {
      fetcher: async () => responses.shift()!,
      now: () => now,
      wait: async (delay) => { now += delay; },
      intervalMs: 4_000,
      timeoutMs: 10_000,
    });

    expect(result).toEqual({ kind: 'confirmed', redirectTo });
  });

  it('completes the transparent card lifecycle from awaiting payment to active', async () => {
    const cardOrder = { orderId: 'order-card-1', statusUrl: '/billing/orders/order-card-1/status' };
    const responses = [
      statusResponse({ orderId: cardOrder.orderId, status: 'awaiting_payment', paid: false, canRedirect: false }),
      statusResponse({ orderId: cardOrder.orderId, status: 'active', financialStatus: 'ACTIVE', checkoutProvisioningStatus: 'completed', redirectTo }),
    ];
    let now = 0;
    const result = await pollOrderUntilCompletion(cardOrder, {
      fetcher: async () => responses.shift()!,
      now: () => now,
      wait: async (delay) => { now += delay; },
      intervalMs: 4_000,
      timeoutMs: 10_000,
    });
    expect(result).toEqual({ kind: 'confirmed', redirectTo });
  });

  it('does not treat authorization_active, temporary errors, or paid without redirect permission as completion', async () => {
    const responses: Array<Response | Error> = [
      statusResponse({ status: 'authorization_active', paid: false }),
      new Error('temporary network failure'),
      statusResponse({ status: 'payment_confirmed', paid: true, canRedirect: false }),
    ];
    let now = 0;
    const result = await pollOrderUntilCompletion(order, {
      fetcher: async () => {
        const next = responses.shift();
        if (next instanceof Error) throw next;
        return next!;
      },
      now: () => now,
      wait: async (delay) => { now += delay; },
      intervalMs: 4_000,
      timeoutMs: 12_000,
    });

    expect(result).toEqual({ kind: 'timeout' });
  });

  it('stops on a terminal state and honours an aborted lifecycle', async () => {
    const terminal = await pollOrderUntilCompletion(order, {
      fetcher: async () => statusResponse({ status: 'canceled', paid: false }),
    });
    expect(terminal.kind).toBe('terminal');

    const controller = new AbortController();
    controller.abort();
    await expect(pollOrderUntilCompletion(order, { signal: controller.signal })).rejects.toMatchObject({ name: 'AbortError' });
  });

  it.each(['real', 'smoke'])('accepts %s transparent card checkout only with its official order status endpoint', (mode) => {
    const card = parseTransparentCardCheckout({
      ok: true,
      orderId: `order-card-${mode}`,
      status: 'AWAITING_PAYMENT',
      statusUrl: `/billing/orders/order-card-${mode}/status`,
      reused: false,
      paymentMethod: 'CREDIT_CARD',
      paymentFlow: 'CREDIT_CARD_UPFRONT',
      creditCard: { status: 'PROCESSING', hosted: false },
    }, 201);

    expect(card).toEqual({
      orderId: `order-card-${mode}`,
      statusUrl: `/billing/orders/order-card-${mode}/status`,
      reused: false,
    });
  });

  it('uses exactly the API redirect, including a relative hash URL', async () => {
    const result = await pollOrderUntilCompletion(order, {
      fetcher: async () => statusResponse({ status: 'active', paid: true, canRedirect: true, redirectTo }),
    });
    expect(result).toEqual({ kind: 'confirmed', redirectTo });
    expect(result.kind === 'confirmed' && result.redirectTo.startsWith('file:')).toBe(false);
  });

  it('treats canRedirect as the fail-closed authority instead of deriving completion from paid', async () => {
    const result = await pollOrderUntilCompletion(order, {
      fetcher: async () => statusResponse({ status: 'active', paid: false, canRedirect: true, redirectTo }),
    });
    expect(result).toEqual({ kind: 'confirmed', redirectTo });
  });

  it('recognizes the canonical Billing completion state independently of Asaas paid', async () => {
    const state = statusResponse({
      status: 'active',
      paid: false,
      financialStatus: 'ACTIVE',
      checkoutProvisioningStatus: 'completed',
      redirectTo,
    });
    const parsed = await state.json() as Record<string, unknown>;
    expect(isCheckoutSuccessfullyCompleted(parsed as any)).toBe(true);
    expect(isCheckoutSuccessfullyCompleted({ ...parsed, status: 'ACTIVE', financial_status: 'active', checkout_provisioning_status: 'COMPLETED' } as any)).toBe(true);
    expect(isCheckoutSuccessfullyCompleted({ ...parsed, status: 'canceled', canRedirect: true } as any)).toBe(false);
    await expect(pollOrderUntilCompletion(order, {
      fetcher: async () => new Response(JSON.stringify(parsed), { status: 200 }),
    })).resolves.toEqual({ kind: 'confirmed', redirectTo });
  });

  it.each([
    { name: 'Asaas confirmed while provisioning is incomplete', asaasPaymentStatus: 'CONFIRMED', financialStatus: 'ACTIVE', checkoutProvisioningStatus: 'processing' },
    { name: 'provisioning complete while financial state is pending', asaasPaymentStatus: 'CONFIRMED', financialStatus: 'PENDING', checkoutProvisioningStatus: 'completed' },
  ])('does not redirect for $name', async (state) => {
    let now = 0;
    const result = await pollOrderUntilCompletion(order, {
      fetcher: async () => statusResponse({ status: 'active', paid: true, canRedirect: false, ...state }),
      now: () => now,
      wait: async (delay) => { now += delay; },
      intervalMs: 4_000,
      timeoutMs: 5_000,
    });
    expect(result.kind).toBe('timeout');
  });

  it('recovers after a temporary polling error and then recognizes active', async () => {
    const responses: Array<Response | Error> = [
      new Error('temporary network failure'),
      statusResponse({ status: 'active', financialStatus: 'ACTIVE', checkoutProvisioningStatus: 'completed', redirectTo }),
    ];
    const result = await pollOrderUntilCompletion(order, {
      fetcher: async () => {
        const next = responses.shift();
        if (next instanceof Error) throw next;
        return next!;
      },
      wait: async () => {},
    });
    expect(result).toEqual({ kind: 'confirmed', redirectTo });
  });

  it('claims a detected completion only once', () => {
    const guard = createCheckoutRedirectGuard();
    expect(guard.claim(order.orderId)).toBe(true);
    expect(guard.claim(order.orderId)).toBe(false);
    expect(guard.claim('another-order')).toBe(true);
  });

  it('persists only card order identity for reload recovery', () => {
    const storage = new Map<string, string>();
    vi.stubGlobal('window', {
      sessionStorage: {
        getItem: (key: string) => storage.get(key) ?? null,
        setItem: (key: string, value: string) => storage.set(key, value),
        removeItem: (key: string) => storage.delete(key),
      },
    });
    persistTrackedCardCheckout({
      orderId: 'order-card-reload',
      statusUrl: '/billing/orders/order-card-reload/status',
      paymentMethod: 'credit_card',
      paymentFlow: 'CREDIT_CARD_UPFRONT',
      fingerprint: 'checkout-fingerprint-card',
    });
    expect(readPersistedTrackedCardCheckout()).toMatchObject({ orderId: 'order-card-reload', paymentFlow: 'CREDIT_CARD_UPFRONT' });
    expect(JSON.stringify([...storage.values()])).not.toContain('4111111111111111');
    clearPersistedTrackedCardCheckout();
    expect(readPersistedTrackedCardCheckout()).toBeNull();
    vi.unstubAllGlobals();
  });
});
