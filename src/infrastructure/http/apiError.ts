/**
 * Extrae un mensaje legible del cuerpo de error del backend, revisando los campos comunes
 * (como en el legacy apiBase.js): error_description / message / error / errors[].
 * Devuelve undefined si no encuentra ninguno.
 */
export const extractApiMessage = (body: unknown): string | undefined => {
  if (!body || typeof body !== 'object') return undefined;
  const b = body as Record<string, unknown>;

  if (typeof b.error_description === 'string') return b.error_description;
  if (typeof b.message === 'string') return b.message;
  if (typeof b.error === 'string') return b.error;

  const errors = b.errors;
  if (Array.isArray(errors) && errors.length > 0) {
    const first = errors[0] as unknown;
    if (typeof first === 'string') return first;
    if (first && typeof first === 'object' && typeof (first as { message?: unknown }).message === 'string') {
      return (first as { message: string }).message;
    }
  }
  return undefined;
};
