import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

describe('training order bump card', () => {
  const source = readFileSync(resolve(process.cwd(), 'src/components/CheckoutPage.tsx'), 'utf8').replace(/\r\n/g, '\n');

  it('keeps a closed border, toggles on click, and does not add a glow layer', () => {
    expect(source).toContain('checkout-addon relative rounded-2xl');
    expect(source).toContain('border-solid border-amber-500');
    expect(source).toContain('border-dashed border-amber-400/90');
    expect(source).toContain('const trainingPlatformMonthlyPrice = isSmokeMode ? 1 : 47;');
    expect(source).toContain('Acesso liberado por {displayPricing.contractMonths}');
    expect(source).toContain('formatCurrency(trainingPlatformMonthlyPrice * displayPricing.contractMonths)');
    expect(source).toContain('onClick={toggleTrainingPlatform}');
    expect(source).toContain('aria-pressed={includesTrainingPlatform}');
    expect(source).not.toContain('ring-2 ring-amber-500/20');
    expect(source).not.toContain('bg-[conic-gradient');
  });

  it('supports toggling the same card with Enter and Space', () => {
    expect(source).toContain("event.key === 'Enter' || event.key === ' '");
    expect(source).toContain('event.preventDefault();');
    expect(source).toContain('toggleTrainingPlatform();');
  });
});
