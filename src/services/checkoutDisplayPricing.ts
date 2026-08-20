import type { BillingAddon } from './billingCheckout';

export type CheckoutDisplayFrequency = 'mensal' | 'semestral' | 'anual';

export function getCheckoutDisplayPricing(options: {
  isSmokeMode: boolean;
  frequency: CheckoutDisplayFrequency;
  accessQuantity: number;
  addons: BillingAddon[];
}) {
  const contractMonths = options.isSmokeMode ? 1 : options.frequency === 'mensal' ? 1 : options.frequency === 'semestral' ? 6 : 12;
  const unitPrice = options.isSmokeMode ? 5 : options.frequency === 'mensal' ? 57 : options.frequency === 'semestral' ? 47 : 37;
  const addonMonthlyPrice = options.addons.includes('training_platform') ? (options.isSmokeMode ? 1 : 47) : 0;
  const baseMonthlyTotal = unitPrice * options.accessQuantity;
  const originalUnitPrice = options.isSmokeMode ? unitPrice : 147.5;
  const originalMonthlyTotal = originalUnitPrice * options.accessQuantity;
  return {
    unitPrice,
    originalUnitPrice,
    originalMonthlyTotal,
    originalGrandTotal: originalMonthlyTotal * contractMonths,
    addonMonthlyPrice,
    totalPricePerMonth: baseMonthlyTotal + addonMonthlyPrice,
    grandTotal: (baseMonthlyTotal + addonMonthlyPrice) * contractMonths,
    contractMonths,
  };
}
