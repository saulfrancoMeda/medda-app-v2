/** Une clases truthy con espacios. No fusiona (a propósito): con NativeWind y tokens
 * propios, fusionar por prefijo `text-`/`bg-` rompería tamaños vs colores. */
export const cn = (...parts: (string | false | null | undefined)[]): string =>
  parts.filter(Boolean).join(' ');
