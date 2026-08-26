import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

describe('Pix payment modal', () => {
  const source = readFileSync(resolve(process.cwd(), 'src/components/CheckoutPage.tsx'), 'utf8');

  it('renders the generated data URL, preserves the full payload for copying, and exposes only real expiry', () => {
    expect(source).toContain('toPixCheckoutDisplay(pix.pix)');
    expect(source).toContain('toPixCheckoutDisplay(pix.pix)');
    expect(source).toContain('src={checkoutResult.qrCodeSrc}');
    expect(source).toContain('Código Pix copia e cola');
    expect(source).toContain('value={checkoutResult.pixPayload}');
    expect(source).toContain('readOnly');
    expect(source).toContain('copyPixPayload(checkoutResult.pixPayload)');
    expect(source).toContain("'✓ CÓDIGO COPIADO'");
    expect(source).toContain('expiresAt?: number; amount: number');
    expect(source).toContain('pixExpiresAt - pixNow');
    expect(source).toContain('formatPixRemainingTime(pixRemainingMs)');
    expect(source).toContain("paymentState === 'awaiting_completion'");
    expect(source).toContain('CONSULTAR PAGAMENTO NOVAMENTE');
  });

  it('keeps Pix polling scoped to the open modal and resumes the same tracked order', () => {
    expect(source).toContain('if (!trackedOrder) return;');
    expect(source).toContain('const controller = new AbortController();');
    expect(source).toContain('controller.abort();');
    expect(source).toContain('const pollIntervalMs = isDocumentHidden ? 30_000 : showSuccessModal ? 4_000 : 12_000;');
    expect(source).toContain('intervalMs: pollIntervalMs');
    expect(source).toContain("document.addEventListener('visibilitychange'");
    expect(source).toContain("document.removeEventListener('visibilitychange'");
    expect(source).toContain('setTrackedOrder((current) => current?.orderId === activeOrderId ? { ...current } : current);');
    expect(source).toContain('const closePixModal = () => setShowSuccessModal(false);');
    expect(source).toContain('const reopenPixModal = () => setShowSuccessModal(true);');
    expect(source).toContain('onClick={reopenPixModal}');
    expect(source).toContain('onClick={closePixModal}');
    expect(source).not.toContain('const closePixModal = () => { setTrackedOrder(null);');
    expect(source).not.toContain('Como pagar');
  });

  it('uses one column on mobile and a two-column QR and payment-details layout from md', () => {
    expect(source).toContain("'max-w-3xl'");
    expect(source).toContain('grid-cols-1 items-center gap-5 text-left md:grid-cols-[auto_minmax(0,1fr)]');
    expect(source).toContain("paymentState !== 'awaiting_completion' ? 'max-w-3xl' : 'max-w-lg'");
  });

  it('keeps paid/provisioning and Billing-authorized redirect independent of modal visibility', () => {
    expect(source).toContain("setPaymentState('awaiting_completion')");
    expect(source).toContain("setCheckoutUiState('provisioning')");
    expect(source).toContain('window.location.assign(result.redirectTo)');
    expect(source).toContain('pollOrderUntilCompletion(trackedOrder');
  });

  it('routes a reused Pix response by Billing method instead of the selected form', () => {
    expect(source).toContain('const responseRoute = identifyBillingCheckoutResponse(response.data);');
    expect(source).toContain("if (responseRoute === 'pix')");
    expect(source).toContain('parsePixUpfrontCheckout(response.data)');
    expect(source).toContain("requestBody.paymentMethod !== 'pix'");
    expect(source).toContain('Nenhum pagamento anterior foi reutilizado');
    expect(source).toContain('beginOrderTracking({ orderId: pix.orderId, statusUrl: pix.statusUrl });');
    expect(source).toContain("if (responseRoute === 'transparent_card')");
    expect(source).toContain("Boleto indisponível no momento. Escolha Pix ou cartão.");
    expect(source).toContain("setPaymentMethod('boleto')");
    expect(source.match(/postBillingCheckout\(checkoutAttemptRef\.current, requestBody, fetch/g)?.length).toBe(1);
  });

});
