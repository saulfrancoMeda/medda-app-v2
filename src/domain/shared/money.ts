export const formatCurrency = (amount: number): string => {
  const negative = amount < 0;
  const [intPart, decPart] = Math.abs(amount).toFixed(2).split('.');
  const withThousands = (intPart ?? '0').replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return `${negative ? '-' : ''}$${withThousands}.${decPart ?? '00'}`;
};

export const maskAmount = (text: string): { display: string; value: string } => {
  const digits = text.replace(/[^0-9]/g, '');
  const cents = digits ? Number.parseInt(digits, 10) : 0;
  if (cents === 0) return { display: '', value: '' };
  const amount = cents / 100;
  return { display: formatCurrency(amount), value: amount.toFixed(2) };
};
