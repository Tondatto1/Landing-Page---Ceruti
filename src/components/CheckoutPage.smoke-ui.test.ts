import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

describe('smoke payment UI', () => {
  const source = readFileSync(resolve(process.cwd(), 'src/components/CheckoutPage.tsx'), 'utf8').replace(/\r\n/g, '\n');

  it('keeps only PIX and card available in every checkout mode', () => {
    expect(source).toContain('grid grid-cols-2 gap-3');
    expect(source).toContain("setPaymentMethod('pix_automatic')");
    expect(source).toContain("setPaymentMethod('credit_card')");
    expect(source).not.toContain("setPaymentMethod('boleto')");
    expect(source).not.toContain('>Boleto<');
  });

  it('routes smoke submission separately from normal checkout', () => {
    expect(source).toContain('postBillingSmokeCheckout');
    expect(source).toContain("paymentMethod: 'CREDIT_CARD'");
    expect(source).toContain("paymentMethod: 'PIX_AUTOMATIC'");
    expect(source).toContain('postBillingCheckout(checkoutAttemptRef.current, requestBody)');
  });

  it('uses the same order polling and API redirect for normal and smoke orders', () => {
    expect(source).toContain('pollOrderUntilCompletion(trackedOrder');
    expect(source).toContain('beginOrderTracking({ orderId: pix.orderId, statusUrl: pix.statusUrl })');
    expect(source).toContain('beginOrderTracking(card)');
    expect(source).toContain('window.location.assign(result.redirectTo)');
    expect(source).not.toContain('new URL(result.redirectTo');
  });

  it('cancels the single order loop on unmount and guards a second checkout while polling', () => {
    expect(source).toContain('const controller = new AbortController()');
    expect(source).toContain('return () => {\n      controller.abort()');
    expect(source).toContain('if (isSubmitting || pollingOrderRef.current) return;');
    expect(source).toContain('checkoutSequenceRef');
  });
});
