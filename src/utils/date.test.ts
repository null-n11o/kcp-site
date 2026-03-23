import { describe, it, expect } from 'vitest';
import { formatDateJa } from './date';

describe('formatDateJa', () => {
  it('formats a date as Japanese string', () => {
    const date = new Date('2026-03-23');
    expect(formatDateJa(date)).toBe('2026年3月23日');
  });

  it('formats single-digit month and day correctly', () => {
    const date = new Date('2026-01-05');
    expect(formatDateJa(date)).toBe('2026年1月5日');
  });

  it('formats December 31 correctly', () => {
    const date = new Date('2026-12-31');
    expect(formatDateJa(date)).toBe('2026年12月31日');
  });
});
