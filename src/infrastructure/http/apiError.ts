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
  } else if (errors && typeof errors === 'object') {
    for (const value of Object.values(errors)) {
      if (typeof value === 'string') return value;
    }
  }
  return undefined;
};

export const isNipError = (message: string | undefined): boolean =>
  typeof message === 'string' && /nip/i.test(message);
