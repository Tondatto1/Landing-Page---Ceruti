import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

describe('checkout access quantity', () => {
  const source = readFileSync(resolve(process.cwd(), 'src/components/CheckoutPage.tsx'), 'utf8').replace(/\r\n/g, '\n');

  it('treats the customer WhatsApp as the first access', () => {
    expect(source).toContain('const [accessNumbers, setAccessNumbers] = useState<string[]>([]);');
    expect(source).toContain('const targetLength = Math.max(0, usersCount - 1);');
    expect(source).toContain('const expectedAdditionalAccessNumbers = Math.max(0, usersCount - 1);');
  });

  it('labels additional access fields starting at the second access', () => {
    expect(source).toContain('{idx + 2}º Acesso');
    expect(source).not.toContain('{idx + 1}º Acesso');
  });

  it('keeps the selected commercial quantity in the checkout payload', () => {
    expect(source).toContain('accessQuantity: usersCount');
    expect(source).toContain('accessNumbers: cleanedAccessNumbers');
  });
});
