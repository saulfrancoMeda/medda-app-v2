/**
 * Formato de moneda MXN sin depender de Intl (Hermes puede variar): "$1,234.50" / "-$80.00".
 * Lógica pura y testeable; se traslada igual a Kotlin/Swift.
 */
export const formatCurrency = (amount: number): string => {
  const negative = amount < 0;
  const [intPart, decPart] = Math.abs(amount).toFixed(2).split('.');
  const withThousands = (intPart ?? '0').replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return `${negative ? '-' : ''}$${withThousands}.${decPart ?? '00'}`;
};
