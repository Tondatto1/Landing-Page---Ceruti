import { describe, expect, it } from 'vitest';
import { formatCpfCnpjInput, formatCepInput, normalizeCardAddressNumber } from './checkoutInputFormatting';

describe('checkout input formatting', () => {
  it('formats and limits CPF and CNPJ values', () => {
    expect(formatCpfCnpjInput('12345678901')).toBe('123.456.789-01');
    expect(formatCpfCnpjInput('12.345.678/0001-99')).toBe('12.345.678/0001-99');
    expect(formatCpfCnpjInput('12345678901234567890')).toBe('12.345.678/9012-34');
  });

  it('accepts only up to six digits in the card address-number field', () => {
    expect(normalizeCardAddressNumber('12A3-456789')).toBe('123456');
  });

  it('formats CEP and limits it to eight digits', () => {
    expect(formatCepInput('12345678')).toBe('12345-678');
    expect(formatCepInput('12345-678999')).toBe('12345-678');
  });
});
