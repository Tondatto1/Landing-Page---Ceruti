import { describe, expect, it } from 'vitest';
import { getCheckoutDisplayPricing } from './checkoutDisplayPricing';

describe('checkout display pricing', () => {
  it('uses the fixed smoke display pricing and never commercial pricing', () => {
    expect(getCheckoutDisplayPricing({ isSmokeMode: true, frequency: 'anual', accessQuantity: 1, addons: [] }))
      .toMatchObject({ unitPrice: 5, addonMonthlyPrice: 0, totalPricePerMonth: 5, grandTotal: 5, contractMonths: 1 });
    expect(getCheckoutDisplayPricing({ isSmokeMode: true, frequency: 'mensal', accessQuantity: 1, addons: ['training_platform'] }))
      .toMatchObject({ unitPrice: 5, addonMonthlyPrice: 1, totalPricePerMonth: 6, grandTotal: 6 });
  });

  it('keeps commercial Campo prices and keeps training per order', () => {
    expect(getCheckoutDisplayPricing({ isSmokeMode: false, frequency: 'mensal', accessQuantity: 1, addons: ['training_platform'] }))
      .toMatchObject({ unitPrice: 57, addonMonthlyPrice: 47, totalPricePerMonth: 104, grandTotal: 104, originalMonthlyTotal: 147.5, originalGrandTotal: 147.5 });
    expect(getCheckoutDisplayPricing({ isSmokeMode: false, frequency: 'anual', accessQuantity: 3, addons: ['training_platform'] }))
      .toMatchObject({ unitPrice: 37, addonMonthlyPrice: 47, totalPricePerMonth: 158, grandTotal: 1896, originalGrandTotal: 5310 });
  });

  it('calculates EAD accumulated access for each contract duration', () => {
    expect(getCheckoutDisplayPricing({ isSmokeMode: false, frequency: 'mensal', accessQuantity: 1, addons: ['training_platform'] }).contractMonths).toBe(1);
    expect(getCheckoutDisplayPricing({ isSmokeMode: false, frequency: 'semestral', accessQuantity: 1, addons: ['training_platform'] }).addonMonthlyPrice * 6).toBe(282);
    expect(getCheckoutDisplayPricing({ isSmokeMode: false, frequency: 'anual', accessQuantity: 1, addons: ['training_platform'] }).addonMonthlyPrice * 12).toBe(564);
  });
});
