import { describe, expect, it } from '@jest/globals';
import { isValidAmount, isValidClabe, isValidNip } from '@domain/wallet/entities/Transfer';

describe('validadores de transferencia', () => {
  it('CLABE: 18 dígitos', () => {
    expect(isValidClabe('012345678901234567')).toBe(true);
    expect(isValidClabe('123')).toBe(false);
    expect(isValidClabe('01234567890123456a')).toBe(false);
  });

  it('NIP: 6 dígitos', () => {
    expect(isValidNip('123456')).toBe(true);
    expect(isValidNip('12345')).toBe(false);
  });

  it('Monto: número > 0 con hasta 2 decimales', () => {
    expect(isValidAmount('100')).toBe(true);
    expect(isValidAmount('100.50')).toBe(true);
    expect(isValidAmount('0')).toBe(false);
    expect(isValidAmount('1.234')).toBe(false);
  });
});
