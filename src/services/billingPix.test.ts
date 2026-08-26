import { describe, expect, it } from 'vitest';
import { capPixExpirationAt24Hours, identifyBillingCheckoutResponse, parsePixUpfrontCheckout, parsePixExpirationDate, toPixCheckoutDisplay } from './billingCheckout';

const response201 = {
  ok: true,
  orderId: '692c71f5-5c9c-4e91-8b22-cfd4dea55ad8',
  status: 'AWAITING_PAYMENT',
  checkoutControlToken: 'cc_1234567890123456789012345678901234567890123',
  paymentMethod: 'PIX',
  paymentFlow: 'PIX_UPFRONT',
  pix: {
    qrCodeImage: 'iVBORw0KGgoAAAANSUhEUg==',
    payload: '000201PIX-COPIA-E-COLA',
    conciliationIdentifier: 'pix-123',
    expirationDate: '2026-08-19 10:29:28',
  },
};

describe('Pix checkout response contract', () => {
  it('parses the HTTP 201 upfront response with nested pix and produces a PNG data URL', () => {
    const parsed = parsePixUpfrontCheckout(response201);
    expect(parsed?.pix).toEqual(response201.pix);
    expect(toPixCheckoutDisplay(parsed?.pix)).toEqual({
      qrCodeSrc: `data:image/png;base64,${response201.pix.qrCodeImage}`,
      pixPayload: response201.pix.payload,
      expiresAt: parsePixExpirationDate(response201.pix.expirationDate),
    });
  });

  it('uses the nested payload for copy and tolerates an absent Pix object', () => {
    expect(toPixCheckoutDisplay(response201.pix).pixPayload).toBe('000201PIX-COPIA-E-COLA');
    expect(toPixCheckoutDisplay(undefined)).toEqual({ qrCodeSrc: undefined, pixPayload: '', expiresAt: undefined });
  });

  it('only exposes a countdown timestamp when Billing supplied a valid expiration date', () => {
    expect(parsePixExpirationDate('not-a-date')).toBeUndefined();
    expect(toPixCheckoutDisplay({ payload: 'payload', expirationDate: 'not-a-date' }).expiresAt).toBeUndefined();
    expect(toPixCheckoutDisplay({ payload: 'payload', expirationDate: '2026-08-19T10:29:28-03:00' }).expiresAt).toBe(Date.parse('2026-08-19T10:29:28-03:00'));
  });

  it('caps an erroneously long provider expiry at 24 hours without extending shorter validity', () => {
    const issuedAt = Date.parse('2026-08-25T12:00:00Z');
    expect(capPixExpirationAt24Hours(Date.parse('2027-08-25T17:00:00Z'), issuedAt)).toBe(issuedAt + 24 * 60 * 60 * 1_000);
    expect(capPixExpirationAt24Hours(issuedAt + 60 * 60 * 1_000, issuedAt)).toBe(issuedAt + 60 * 60 * 1_000);
  });

  it('accepts a reused Pix response even when the submitted method was different', () => {
    const reusedPix = {
      ...response201,
      reused: true,
      statusUrl: `/billing/orders/${response201.orderId}/status`,
    };
    expect(identifyBillingCheckoutResponse(reusedPix)).toBe('pix');
    expect(parsePixUpfrontCheckout(reusedPix)).toMatchObject({
      orderId: response201.orderId,
      statusUrl: reusedPix.statusUrl,
      pix: response201.pix,
    });
  });

});
