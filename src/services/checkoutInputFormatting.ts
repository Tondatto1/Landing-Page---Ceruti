/** Keeps the document field constrained to CPF (11) or CNPJ (14) digits. */
export function formatCpfCnpjInput(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 14);
  if (digits.length <= 11) {
    if (digits.length <= 3) return digits;
    if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`;
    if (digits.length <= 9) return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
    return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`;
  }
  if (digits.length <= 2) return digits;
  if (digits.length <= 5) return `${digits.slice(0, 2)}.${digits.slice(2)}`;
  if (digits.length <= 8) return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5)}`;
  if (digits.length <= 12) return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8)}`;
  return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8, 12)}-${digits.slice(12)}`;
}

/** Validates the CPF check digits without changing the accepted CNPJ flow. */
export function isValidCpf(value: string): boolean {
  const digits = value.replace(/\D/g, '');
  if (digits.length !== 11 || /^([0-9])\1{10}$/.test(digits)) return false;

  let firstSum = 0;
  for (let index = 0; index < 9; index += 1) firstSum += Number(digits[index]) * (10 - index);
  const firstCheckDigit = (firstSum * 10) % 11 % 10;
  if (firstCheckDigit !== Number(digits[9])) return false;

  let secondSum = 0;
  for (let index = 0; index < 10; index += 1) secondSum += Number(digits[index]) * (11 - index);
  const secondCheckDigit = (secondSum * 10) % 11 % 10;
  return secondCheckDigit === Number(digits[10]);
}

export function normalizeCardAddressNumber(value: string): string {
  return value.replace(/\D/g, '').slice(0, 6);
}

export function formatCepInput(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 8);
  return digits.length > 5 ? `${digits.slice(0, 5)}-${digits.slice(5)}` : digits;
}
