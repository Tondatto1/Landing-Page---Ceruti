import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

describe('stale public checkout lifecycle', () => {
  const source = readFileSync(resolve(process.cwd(), 'src/components/CheckoutPage.tsx'), 'utf8').replace(/\r\n/g, '\n');

  it('invalidates a pending monthly Pix when the financial contract changes', () => {
    expect(source).toContain('createCheckoutContractFingerprint');
    expect(source).toContain('activeFingerprint === checkoutFingerprint');
    expect(source).toContain('setCheckoutResult(null)');
    expect(source).toContain('setTrackedOrder(null)');
    expect(source).toContain('setShowSuccessModal(false)');
    expect(source).toContain('pollingAbortRef.current?.abort()');
    expect(source).toContain('forceNewAttemptRef.current = true');
  });

  it('rejects delayed responses from the old fingerprint and forwards the current frequency', () => {
    expect(source).toContain('currentCheckoutFingerprintRef.current !== requestFingerprint');
    expect(source).toContain('frequency: frequencyByLabel[frequency]');
    expect(source).toContain('trainingPlatform: includesTrainingPlatform');
    expect(source).toContain('accessQuantity: usersCount');
  });

  it('does not persist or reuse the old order as the visible Pix action', () => {
    expect(source).toContain('checkoutAttemptRef.current = null');
    expect(source).toContain("checkoutResult?.kind === 'pix' && trackedOrder && !showSuccessModal");
    expect(source).toContain('onClick={reopenPixModal}');
  });

  it('keeps the opaque capability until Billing confirms safe replacement', () => {
    expect(source).toContain('checkoutControlToken');
    expect(source).toContain('postBillingAbandonPayment');
    expect(source).toContain('createCheckoutAbandonmentIdempotencyKey');
    expect(source).toContain("setCheckoutTransitionState('abandoning')");
    expect(source).toContain("setCheckoutTransitionState('reconciliation_required')");
    expect(source).toContain("setCheckoutTransitionState('payment_confirmed')");
    expect(source).toContain('setTrackedOrder({ orderId: result.orderId, statusUrl: result.statusUrl });');
    expect(source).toContain("setCheckoutUiState('provisioning')");
    expect(source).toContain("if (result.canStartNewCheckout)");
    expect(source).toContain('clearPersistedTrackedPixUpfrontCheckout');
    expect(source).toContain("restoredPixCheckout?.state !== 'abandoning'");
    expect(source).toContain('TENTAR NOVAMENTE');
  });

  it('does not blind-retry a configuration conflict', () => {
    expect(source).toContain("error.code === 'CHECKOUT_CONFIGURATION_CONFLICT'");
    expect(source).toContain('never blindly retry checkout');
    expect(source).toContain('abandonTrackedPixCheckout();');
  });
});
