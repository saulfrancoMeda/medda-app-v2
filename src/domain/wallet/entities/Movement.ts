/** Movimiento de billetera (/wallet/movements/list). Subconjunto fiel al legacy. */
export interface Movement {
  readonly id: string;
  readonly description: string;
  /** Fecha ISO 8601. */
  readonly date: string;
  /** p.ej. ['transactional','debit'] o ['credit']. */
  readonly channels: readonly string[];
  readonly amount: number;
  readonly reference?: string;
  readonly referenceLabel?: string;
}

/** Un abono (entra dinero) si el canal incluye 'credit'; si no, es cargo. */
export const isCredit = (movement: Movement): boolean => movement.channels.includes('credit');

/** Monto con signo según sea abono o cargo. */
export const signedAmount = (movement: Movement): number =>
  isCredit(movement) ? Math.abs(movement.amount) : -Math.abs(movement.amount);
