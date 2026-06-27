import { describe, expect, it } from '@jest/globals';
import {
  isAdult,
  isValidCurp,
  isValidNip,
  isValidPhone,
  validatePassword,
} from '@domain/registration/services/credentials';

describe('registration credentials', () => {
  it('valida teléfono y NIP de la longitud correcta', () => {
    expect(isValidPhone('5512345678')).toBe(true);
    expect(isValidPhone('551234')).toBe(false);
    expect(isValidNip('123456')).toBe(true);
    expect(isValidNip('12a456')).toBe(false);
  });

  describe('password', () => {
    it('acepta una contraseña fuerte', () => {
      expect(validatePassword('Hola@2580')).toBeNull();
    });

    it('exige longitud, mayúscula, número y especial', () => {
      expect(validatePassword('corta1')).toBe('Usa al menos 8 caracteres.');
      expect(validatePassword('todominuscula9@')).toBe('Incluye al menos una mayúscula.');
      expect(validatePassword('SinNumero@x')).toBe('Incluye al menos un número.');
      expect(validatePassword('SinEspecial9x')).toBe(
        'Incluye un carácter especial (_ ? @ . + # $ &).',
      );
    });

    it('rechaza repeticiones, secuencias y "meda"', () => {
      expect(validatePassword('Baaaa@129')).toBe(
        'No repitas el mismo carácter más de 3 veces seguidas.',
      );
      expect(validatePassword('Abcde@258')).toBe('Evita secuencias como "abcd" o "1234".');
      expect(validatePassword('Meda@2589')).toBe('La contraseña no puede contener "meda".');
    });

    it('rechaza contraseña que contiene teléfono o fecha de nacimiento', () => {
      expect(validatePassword('Tel5512389@x', { phone: '5512389' })).toBe(
        'La contraseña no puede contener tu teléfono.',
      );
      expect(validatePassword('Fec19900105@x', { birthDate: '05/01/1990' })).toBe(
        'La contraseña no puede contener tu fecha de nacimiento.',
      );
    });
  });

  it('valida CURP', () => {
    expect(isValidCurp('PERA900101HDFRNN09')).toBe(true);
    expect(isValidCurp('NOPE')).toBe(false);
  });

  it('exige mayoría de edad (18+)', () => {
    const now = new Date(Date.UTC(2026, 5, 9));
    expect(isAdult('09/06/2000', now)).toBe(true);
    expect(isAdult('09/06/2010', now)).toBe(false);
  });
});
