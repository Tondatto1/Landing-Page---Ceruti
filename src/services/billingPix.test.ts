import { describe, expect, it } from 'vitest';
import { identifyBillingCheckoutResponse, parsePixAutomaticCheckout, parsePixExpirationDate, parseSmokePixAutomaticCheckout, toPixCheckoutDisplay } from './billingCheckout';

const response201 = {
  ok: true,
  orderId: '692c71f5-5c9c-4e91-8b22-cfd4dea55ad8',
  status: 'AWAITING_PAYMENT',
  paymentMethod: 'PIX',
  paymentFlow: 'PIX_AUTOMATIC',
  pix: {
    qrCodeImage: 'iVBORw0KGgoAAAANSUhEUg==',
    payload: '000201PIX-COPIA-E-COLA',
    conciliationIdentifier: 'pix-123',
    expirationDate: '2026-08-19 10:29:28',
  },
};

describe('Pix checkout response contract', () => {
  it('parses the HTTP 201 smoke response with nested pix and produces a PNG data URL', () => {
    const parsed = parseSmokePixAutomaticCheckout(response201);
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

  it('accepts a reused Pix response even when the submitted method was different', () => {
    const reusedPix = {
      ...response201,
      reused: true,
      statusUrl: `/billing/orders/${response201.orderId}/status`,
    };
    expect(identifyBillingCheckoutResponse(reusedPix)).toBe('pix');
    expect(parsePixAutomaticCheckout(reusedPix)).toMatchObject({
      orderId: response201.orderId,
      statusUrl: reusedPix.statusUrl,
      pix: response201.pix,
    });
  });

});
