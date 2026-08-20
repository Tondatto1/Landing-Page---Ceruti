import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

describe('checkout CTA state contract', () => {
  const source = readFileSync(resolve(process.cwd(), 'src/components/CheckoutPage.tsx'), 'utf8');

  it('has explicit idle, submitting, payment, provisioning, completed and error states', () => {
    expect(source).toContain("type CheckoutUiState = 'idle' | 'submitting' | 'awaiting_payment' | 'provisioning' | 'completed' | 'error'");
    expect(source).toContain("setCheckoutUiState('submitting')");
    expect(source).toContain("setCheckoutUiState('awaiting_payment')");
    expect(source).toContain("setCheckoutUiState('provisioning')");
    expect(source).toContain("setCheckoutUiState('completed')");
    expect(source).toContain("setCheckoutUiState('error')");
  });

  it('keeps CTA geometry stable, prevents duplicate submits, and uses one spinner', () => {
    expect(source).toContain('disabled={isSubmitting || ctaBusy || Boolean(trackedOrder)');
    expect(source).toContain('<CheckoutSpinner />');
    expect(source).toContain("if (isSubmitting || pollingOrderRef.current) return;");
    expect(source).toContain('PROCESSANDO PAGAMENTO...');
    expect(source).toContain('CONFIRMANDO PAGAMENTO...');
    expect(source).toContain('LIBERANDO SEU ACESSO...');
  });
});
