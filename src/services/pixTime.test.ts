import { describe, expect, it } from 'vitest';
import { formatPixRemainingTime } from './pixTime';

describe('formatPixRemainingTime', () => {
  it('formats less than one minute with minutes and seconds', () => {
    expect(formatPixRemainingTime(42_000)).toBe('00:42');
  });

  it('formats durations below one hour as mm:ss', () => {
    expect(formatPixRemainingTime((9 * 60 + 42) * 1_000)).toBe('09:42');
    expect(formatPixRemainingTime((59 * 60 + 5) * 1_000)).toBe('59:05');
  });

  it('formats exactly one hour without noisy zero minutes', () => {
    expect(formatPixRemainingTime(60 * 60 * 1_000)).toBe('1h');
  });

  it('formats several hours with padded minutes and omits seconds', () => {
    expect(formatPixRemainingTime((1 * 60 * 60 + 8 * 60) * 1_000)).toBe('1h 08min');
    expect(formatPixRemainingTime((22 * 60 + 38) * 60 * 1_000)).toBe('22h 38min');
  });

  it('formats exactly one day and longer durations as days plus hours', () => {
    expect(formatPixRemainingTime(24 * 60 * 60 * 1_000)).toBe('1d');
    expect(formatPixRemainingTime((27 * 60 + 15) * 60 * 1_000)).toBe('1d 3h');
  });

  it('reports expired for zero, negative, or non-finite durations', () => {
    expect(formatPixRemainingTime(0)).toBe('Pix expirado');
    expect(formatPixRemainingTime(-1)).toBe('Pix expirado');
    expect(formatPixRemainingTime(Number.NaN)).toBe('Pix expirado');
  });
});
