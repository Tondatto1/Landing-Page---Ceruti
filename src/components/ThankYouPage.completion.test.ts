import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

describe('/checkout/success completion flow', () => {
  const source = readFileSync(resolve(process.cwd(), 'src/components/ThankYouPage.tsx'), 'utf8');

  it('keeps the hash ticket in React memory through StrictMode effect replay', () => {
    expect(source).toContain('useState(() => getCompletionTicketFromHash(window.location.hash))');
    expect(source).toContain('window.location.pathname + window.location.search');
    expect(source).not.toContain('localStorage');
    expect(source).not.toContain('sessionStorage');
  });

  it('exchanges and validates the existing HTTP-only completion session before redirecting to the upsell', () => {
    expect(source).toContain('resolveBillingCompletionWithRetries({ ticket, signal: controller.signal })');
    expect(source).toContain('getBillingCompletion(controller.signal)');
    expect(source).toContain("navigate('/obrigado', { replace: true })");
    expect(source).toContain('completion.exchange_succeeded');
    expect(source).toContain('completion.validation_succeeded');
  });
});
