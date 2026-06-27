import { describe, expect, it } from '@jest/globals';
import { formatCurrency } from '@domain/shared/money';

describe('formatCurrency', () => {
  it('formatea con separador de miles y 2 decimales', () => {
    expect(formatCurrency(1234.5)).toBe('$1,234.50');
    expect(formatCurrency(0)).toBe('$0.00');
    expect(formatCurrency(1000000)).toBe('$1,000,000.00');
  });

  it('maneja montos negativos', () => {
    expect(formatCurrency(-80)).toBe('-$80.00');
  });
});
