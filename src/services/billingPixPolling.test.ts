import { describe, expect, it } from 'vitest';
import { parseTransparentCardCheckout, pollOrderUntilCompletion } from './billingCheckout';

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
      paymentFlow: 'ASAAS_TRANSPARENT_SUBSCRIPTION',
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
});
