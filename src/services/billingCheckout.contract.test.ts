import { describe, expect, it, vi } from 'vitest';
import {
  createCheckoutAttempt,
  createSmokeCheckoutAttempt,
  buildCheckoutPayload,
  buildSmokeCheckoutPayloadBase,
  identifyBillingCheckoutResponse,
  postBillingCheckout,
  postBillingSmokeCheckout,
  type BillingCheckoutRequest,
  type SmokeCreditCardCheckoutRequest,
  type SmokePixAutomaticCheckoutRequest,
} from './billingCheckout';

const customer = {
  name: 'Ana Teste',
  email: 'ana@example.test',
  phone: '67999999999',
  documentNumber: '12345678901',
};

function checkoutBody(addons: BillingCheckoutRequest['addons'] = []): BillingCheckoutRequest {
  return {
    ...buildCheckoutPayload({
      agentType: 'campo', frequency: 'monthly', accessQuantity: 1, customer,
      accessNumbers: [], addons: addons ?? [],
    }),
    paymentMethod: 'pix_automatic',
  };
}

describe('Ceruti Campo checkout contract', () => {
  it('routes checkout responses by Billing payment method and flow', () => {
    expect(identifyBillingCheckoutResponse({ paymentMethod: 'PIX', paymentFlow: 'PIX_AUTOMATIC' })).toBe('pix');
    expect(identifyBillingCheckoutResponse({ paymentMethod: 'BOLETO', paymentFlow: 'ASAAS_SUBSCRIPTION' })).toBe('boleto');
    expect(identifyBillingCheckoutResponse({ paymentMethod: 'CREDIT_CARD', paymentFlow: 'ASAAS_TRANSPARENT_SUBSCRIPTION' })).toBe('transparent_card');
    expect(identifyBillingCheckoutResponse({ paymentMethod: 'CREDIT_CARD', paymentFlow: 'ASAAS_HOSTED_CHECKOUT' })).toBe('hosted_card');
    expect(identifyBillingCheckoutResponse({ paymentMethod: 'CREDIT_CARD', paymentFlow: 'PIX_AUTOMATIC' })).toBeNull();
  });

  it.each([[[]], [['training_platform']]] as const)('posts Campo with permitted addons %j and no client financial fields', async (addons) => {
    const body = checkoutBody([...addons]);
    const attempt = createCheckoutAttempt(null, body, () => `test-${addons.length}`);
    const fetcher = vi.fn<typeof fetch>().mockResolvedValue(new Response(JSON.stringify({ ok: true }), { status: 201 }));

    await postBillingCheckout(attempt, body, fetcher);

    const [, init] = fetcher.mock.calls[0];
    const sent = JSON.parse(String(init?.body)) as Record<string, unknown>;
    expect(sent).toEqual(body);
    expect(fetcher.mock.calls[0][0]).toContain('/billing/checkout');
    expect(init?.headers).not.toHaveProperty('x-smoke-session');
    for (const forbidden of ['price', 'discount', 'total', 'unitPrice', 'monthlyAmount', 'metadata']) {
      expect(sent).not.toHaveProperty(forbidden);
    }
  });

  it('serializes a single-access real checkout without empty optional arrays', async () => {
    const body = checkoutBody();
    const attempt = createCheckoutAttempt(null, body, () => 'single-access');
    const fetcher = vi.fn<typeof fetch>().mockResolvedValue(new Response(JSON.stringify({ ok: true }), { status: 201 }));

    await postBillingCheckout(attempt, body, fetcher);

    const [, init] = fetcher.mock.calls[0];
    expect(init?.headers).toMatchObject({ 'Content-Type': 'application/json', 'Idempotency-Key': attempt.key });
    expect(typeof init?.body).toBe('string');
    expect(JSON.parse(String(init?.body))).toEqual({
      agentType: 'campo', frequency: 'monthly', accessQuantity: 1,
      paymentMethod: 'pix_automatic', customer,
    });
  });

  it.each(['pix', 'pix_automatic', 'boleto'] as const)('serializes real %s with the Billing enum and no optional placeholders', async (paymentMethod) => {
    const body = { ...checkoutBody(), paymentMethod };
    const attempt = createCheckoutAttempt(null, body, () => `${paymentMethod}-contract`);
    const fetcher = vi.fn<typeof fetch>().mockResolvedValue(new Response(JSON.stringify({ ok: true }), { status: 201 }));

    await postBillingCheckout(attempt, body, fetcher);

    expect(JSON.parse(String(fetcher.mock.calls[0][1]?.body))).toEqual({
      agentType: 'campo', frequency: 'monthly', accessQuantity: 1, paymentMethod, customer,
    });
  });

  it('uses the same normalized customer and EAD selection in real and smoke payloads without leaking smoke fields', () => {
    const real = {
      ...buildCheckoutPayload({
        agentType: 'campo', frequency: 'annual', accessQuantity: 2, customer,
        accessNumbers: ['67999999999', '67988888888'], addons: ['training_platform'],
      }),
      paymentMethod: 'boleto' as const,
    };
    const smoke = {
      ...buildSmokeCheckoutPayloadBase({
        agentType: 'campo', customer, accessNumber: '67999999999', addons: ['training_platform'],
      }),
      paymentMethod: 'PIX_AUTOMATIC' as const,
    };

    expect(real.customer).toEqual(smoke.customer);
    expect(real.addons).toEqual(smoke.addons);
    expect(real).toMatchObject({ frequency: 'annual', accessQuantity: 2, accessNumbers: ['67999999999', '67988888888'] });
    expect(smoke).toMatchObject({ accessNumber: '67999999999', paymentMethod: 'PIX_AUTOMATIC' });
    for (const smokeOnly of ['accessNumber', 'smokeSession', 'smoke', 'smokePrice', 'smokeId']) {
      expect(real).not.toHaveProperty(smokeOnly);
    }
  });

  it('serializes the transparent-card block required by real checkout', async () => {
    const body = {
      ...buildCheckoutPayload({
        agentType: 'campo', frequency: 'semiannual', accessQuantity: 1, customer,
        accessNumbers: [], addons: [],
      }),
      paymentMethod: 'credit_card' as const,
      creditCard: { holderName: 'Ana Teste', number: '4111111111111111', expiryMonth: '12', expiryYear: '2030', ccv: '123' },
      creditCardHolderInfo: { name: 'Ana Teste', email: customer.email, cpfCnpj: customer.documentNumber, postalCode: '79000000', addressNumber: '10', phone: customer.phone },
    };
    const attempt = createCheckoutAttempt(null, body, () => 'card-contract');
    const fetcher = vi.fn<typeof fetch>().mockResolvedValue(new Response(JSON.stringify({ ok: true }), { status: 201 }));

    await postBillingCheckout(attempt, body, fetcher);

    const sent = JSON.parse(String(fetcher.mock.calls[0][1]?.body));
    expect(sent).toMatchObject({ paymentMethod: 'credit_card', creditCard: body.creditCard, creditCardHolderInfo: body.creditCardHolderInfo });
    expect(sent).not.toHaveProperty('accessNumbers');
    expect(sent).not.toHaveProperty('addons');
  });

  it('emits only a redacted development payload shape', async () => {
    const body = {
      ...buildCheckoutPayload({ agentType: 'campo', frequency: 'monthly', accessQuantity: 1, customer, accessNumbers: [], addons: [] }),
      paymentMethod: 'credit_card' as const,
      creditCard: { holderName: 'Ana Teste', number: '4111111111111111', expiryMonth: '12', expiryYear: '2030', ccv: '123' },
      creditCardHolderInfo: { name: 'Ana Teste', email: customer.email, cpfCnpj: customer.documentNumber, postalCode: '79000000', addressNumber: '10', phone: customer.phone },
    };
    const attempt = createCheckoutAttempt(null, body, () => 'safe-diagnostic');
    const fetcher = vi.fn<typeof fetch>().mockResolvedValue(new Response(JSON.stringify({ ok: true }), { status: 201 }));
    const diagnosticSink = vi.fn();

    await postBillingCheckout(attempt, body, fetcher, { diagnosticSink });

    const event = diagnosticSink.mock.calls.find(([entry]) => entry.event === 'billing_checkout.payload_shape')?.[0];
    expect(event.payloadShape).toMatchObject({ hasCreditCard: true, creditCardKeys: ['ccv', 'expiryMonth', 'expiryYear', 'holderName', 'number'] });
    expect(JSON.stringify(event.payloadShape)).not.toContain('4111111111111111');
    expect(JSON.stringify(event.payloadShape)).not.toContain('12345678901');
    expect(JSON.stringify(event.payloadShape)).not.toContain('123');
  });

  it('rejects CRM, Consultor, and unsupported payment enums before transport', async () => {
    const fetcher = vi.fn<typeof fetch>();
    for (const invalid of [
      { ...checkoutBody(['training_platform']), addons: ['crm'] },
      { ...checkoutBody(), agentType: 'consultor' },
      { ...checkoutBody(), paymentMethod: 'bank_transfer' },
      { ...checkoutBody(), total: 57 },
      { ...checkoutBody(), metadata: { monthlyAmount: 57 } },
    ]) {
      const attempt = createCheckoutAttempt(null, invalid as BillingCheckoutRequest, () => 'invalid-contract');
      await expect(postBillingCheckout(attempt, invalid as BillingCheckoutRequest, fetcher)).rejects.toMatchObject({ code: 'VALIDATION_ERROR' });
    }
    expect(fetcher).not.toHaveBeenCalled();
  });

  it('uses only the opaque smoke session header', async () => {
    const body: SmokePixAutomaticCheckoutRequest = {
      agentType: 'campo',
      paymentMethod: 'PIX_AUTOMATIC',
      customer,
      accessNumber: '67999999999',
      addons: [],
    };
    const attempt = createSmokeCheckoutAttempt('campo', () => 'session-test', () => 1);
    const fetcher = vi.fn<typeof fetch>().mockResolvedValue(new Response(JSON.stringify({ ok: true }), { status: 201 }));

    await postBillingSmokeCheckout(attempt, body, 'opaque-session-token-1234', fetcher);

    const [, init] = fetcher.mock.calls[0];
    expect(init?.headers).toMatchObject({ 'x-smoke-session': 'opaque-session-token-1234' });
    expect(init?.headers).not.toHaveProperty('x-smoke-ticket');
    expect(fetcher.mock.calls[0][0]).toContain('/billing/smoke-test/checkout');
    expect(JSON.parse(String(init?.body))).toEqual(body);
    for (const forbidden of ['price', 'amount', 'unitPrice', 'monthlyAmount', 'total', 'totalAmount', 'smokeAmount', 'addonAmount']) {
      expect(JSON.parse(String(init?.body))).not.toHaveProperty(forbidden);
    }
  });

  it('posts smoke card data and EAD only to the smoke endpoint', async () => {
    const body: SmokeCreditCardCheckoutRequest = {
      agentType: 'campo',
      paymentMethod: 'CREDIT_CARD',
      customer,
      accessNumber: '67999999999',
      addons: ['training_platform'],
      creditCard: { holderName: 'Ana Teste', number: '4111111111111111', expiryMonth: '12', expiryYear: '2030', ccv: '123' },
      creditCardHolderInfo: {
        name: 'Ana Teste', email: 'ana@example.test', cpfCnpj: '12345678901', postalCode: '79000000',
        addressNumber: '10', phone: '67999999999', mobilePhone: '67999999999',
      },
    };
    const attempt = createSmokeCheckoutAttempt('campo', () => 'card-session-test', () => 1);
    const fetcher = vi.fn<typeof fetch>().mockResolvedValue(new Response(JSON.stringify({ ok: true }), { status: 201 }));

    await postBillingSmokeCheckout(attempt, body, 'opaque-session-token-1234', fetcher);

    const [, init] = fetcher.mock.calls[0];
    expect(fetcher.mock.calls[0][0]).toContain('/billing/smoke-test/checkout');
    expect(init?.headers).toMatchObject({ 'x-smoke-session': 'opaque-session-token-1234' });
    expect(JSON.parse(String(init?.body))).toEqual(body);
  });

  it('keeps EAD in the PIX smoke payload without adding a financial field', async () => {
    const body: SmokePixAutomaticCheckoutRequest = {
      agentType: 'campo', paymentMethod: 'PIX_AUTOMATIC', customer, accessNumber: '67999999999', addons: ['training_platform'],
    };
    const attempt = createSmokeCheckoutAttempt('campo', () => 'pix-ead-session-test', () => 1);
    const fetcher = vi.fn<typeof fetch>().mockResolvedValue(new Response(JSON.stringify({ ok: true }), { status: 201 }));

    await postBillingSmokeCheckout(attempt, body, 'opaque-session-token-1234', fetcher);

    const sent = JSON.parse(String(fetcher.mock.calls[0][1]?.body)) as Record<string, unknown>;
    expect(sent).toEqual(body);
    expect(sent).not.toHaveProperty('amount');
    expect(sent).not.toHaveProperty('price');
  });

  it('forwards a signed smoke session byte-for-byte in the header', async () => {
    const body: SmokePixAutomaticCheckoutRequest = {
      agentType: 'campo', paymentMethod: 'PIX_AUTOMATIC', customer, accessNumber: '11984953116', addons: [],
    };
    const token = 'payload+segment.signature/with=padding';
    const attempt = createSmokeCheckoutAttempt('campo', () => 'exact-header-test', () => 1);
    const fetcher = vi.fn<typeof fetch>().mockResolvedValue(new Response(JSON.stringify({ ok: true }), { status: 201 }));

    await postBillingSmokeCheckout(attempt, body, token, fetcher);

    expect(fetcher.mock.calls[0][1]?.headers).toMatchObject({ 'x-smoke-session': token });
  });
});
