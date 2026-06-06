/** Enmascara un nombre dejando solo la inicial de cada palabra: "Saul Franco" -> "S*** F*****". */
export const maskName = (name: string): string =>
  name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => `${w[0] ?? ''}${'*'.repeat(Math.max(0, w.length - 1))}`)
    .join(' ');
