export interface Movement {
  readonly id: string;
  readonly description: string;
  readonly date: string;
  readonly channels: readonly string[];
  readonly amount: number;
  readonly reference?: string;
  readonly referenceLabel?: string;
  readonly commission?: number;
  readonly provider?: string;
  readonly destinyAccount?: string;
  readonly claveRastreo?: string;
  readonly beneficiaryName?: string;
  readonly beneficiaryEmail?: string;
  readonly comments?: string;
  readonly state?: string;
}

/** Un abono (entra dinero) si el canal incluye 'credit'; si no, es cargo. */
export const isCredit = (movement: Movement): boolean => movement.channels.includes('credit');

/** Monto con signo según sea abono o cargo. */
export const signedAmount = (movement: Movement): number =>
  isCredit(movement) ? Math.abs(movement.amount) : -Math.abs(movement.amount);

/** Un gasto es dinero que sale (cargo); lo que entra (abono) es un ingreso, no un gasto. */
export const isExpense = (movement: Movement): boolean => !isCredit(movement);

/** Suma de los gastos (salidas). Ignora los abonos. */
export const expensesTotal = (movements: readonly Movement[]): number =>
  movements.filter(isExpense).reduce((sum, movement) => sum + Math.abs(movement.amount), 0);
