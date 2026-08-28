import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

describe('PIX_UPFRONT abandonment UI contract', () => {
  const source = readFileSync(resolve(process.cwd(), 'src/components/CheckoutPage.tsx'), 'utf8').replace(/\r\n/g, '\n');

  it('shows cancellation only for a tracked pending PIX_UPFRONT order', () => {
    expect(source).toContain("activePixCheckoutRef.current?.paymentFlow === 'PIX_UPFRONT'");
    expect(source).toContain("activePixCheckoutRef.current.state !== 'payment_confirmed'");
    expect(source).toContain("paymentState !== 'awaiting_completion'");
    expect(source).toContain('CANCELAR PIX E ESCOLHER OUTRO PLANO');
  });

  it('uses the existing guarded operation and disables it while abandoning', () => {
    expect(source).toContain('onClick={abandonTrackedPixCheckout}');
    expect(source).toContain("disabled={checkoutTransitionState === 'abandoning' || (pixCancelBlockedUntil !== null && pixCancelBlockedUntil > Date.now())}");
    expect(source).toContain('abandonmentPromiseRef.current');
    expect(source).toContain('tracked.checkoutControlToken');
    expect(source).toContain('tracked.abandonmentIdempotencyKey');
  });

  it('handles each Billing result without automatically starting a new checkout', () => {
    expect(source).toContain("result.result === 'canceled' || result.result === 'already_canceled'");
    expect(source).toContain("result.result === 'payment_already_completed'");
    expect(source).toContain("result.result === 'not_cancellable'");
    expect(source).toContain('clearTrackedPixCheckout();');
    expect(source).toContain('setTrackedOrder({ orderId: result.orderId, statusUrl: result.statusUrl });');
    expect(source).toContain("error.code === 'PAYMENT_CHANGE_RATE_LIMITED'");
    expect(source).toContain('persistPixCancelBlock(tracked.orderId, blockedUntil);');
    expect(source).not.toContain('abandonTrackedPixCheckout().then(() => handleCheckout');
  });
});
