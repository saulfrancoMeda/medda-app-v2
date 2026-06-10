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

export const isCredit = (movement: Movement): boolean => movement.channels.includes('credit');

export const signedAmount = (movement: Movement): number =>
  isCredit(movement) ? Math.abs(movement.amount) : -Math.abs(movement.amount);

export const isExpense = (movement: Movement): boolean => !isCredit(movement);

export const expensesTotal = (movements: readonly Movement[]): number =>
  movements.filter(isExpense).reduce((sum, movement) => sum + Math.abs(movement.amount), 0);
