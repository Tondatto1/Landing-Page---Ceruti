import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { classifyCheckoutFailure } from './billingCheckout';

describe('Billing document error mapping', () => {
  const source = readFileSync(resolve(process.cwd(), 'src/services/billingCheckout.ts'), 'utf8');

  it.each([
    ['INVALID_CPF', 'Informe um CPF válido. Confira os números e tente novamente.'],
    ['INVALID_CNPJ', 'Informe um CNPJ válido. Confira os números e tente novamente.'],
  ])('maps %s independently of payment method', (code, message) => {
    expect(classifyCheckoutFailure(400, code)).toBe('validation');
    expect(source).toContain(`${code}: '${message}'`);
    expect(message).not.toContain('cartão');
  });
});
