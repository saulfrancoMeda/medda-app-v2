import { describe, expect, it } from '@jest/globals';
import { expensesTotal, isExpense, type Movement } from '@domain/wallet/entities/Movement';

const movement = (overrides: Partial<Movement>): Movement => ({
  id: 'm',
  description: '',
  date: '',
  channels: [],
  amount: 0,
  ...overrides,
});

describe('movement expenses', () => {
  const sent = movement({ description: 'Envío SPEI', channels: ['transactional'], amount: 100 });
  const received = movement({ description: 'Abono SPEI', channels: ['credit'], amount: 250 });

  it('trata un abono como ingreso, no como gasto', () => {
    expect(isExpense(received)).toBe(false);
    expect(isExpense(sent)).toBe(true);
  });

  it('suma solo las salidas e ignora los abonos', () => {
    expect(expensesTotal([sent, received, sent])).toBe(200);
  });
});
