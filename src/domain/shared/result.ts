/**
 * Result<T, E> — resultado explícito sin lanzar excepciones a través de los límites
 * de las capas. Hace que el contrato de error sea parte del tipo y se traduce directo a
 * `Result` de Kotlin / Swift cuando se porte a nativo.
 */
export type Result<T, E> =
  | { readonly ok: true; readonly value: T }
  | { readonly ok: false; readonly error: E };

export const ok = <T>(value: T): Result<T, never> => ({ ok: true, value });
export const err = <E>(error: E): Result<never, E> => ({ ok: false, error });

export const isOk = <T, E>(r: Result<T, E>): r is { ok: true; value: T } => r.ok;
export const isErr = <T, E>(r: Result<T, E>): r is { ok: false; error: E } => !r.ok;

/** Aplica fn al valor si es ok; propaga el error sin tocarlo. */
export const mapResult = <T, U, E>(r: Result<T, E>, fn: (v: T) => U): Result<U, E> =>
  r.ok ? ok(fn(r.value)) : r;
