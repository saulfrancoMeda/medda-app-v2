// @ts-check
/**
 * Tokens del design system = FUENTE ÚNICA de verdad.
 * CommonJS a propósito: lo consume `tailwind.config.js` (require) Y el código TS (import),
 * para que utilidades NativeWind y estilos imperativos nunca diverjan.
 *
 * Branding REAL extraído de meda.com.mx (estilo Binance): dorado #FCD535 sobre fondos
 * oscuros. Regla UX: el texto sobre el dorado va en oscuro (`ink`), no blanco.
 * Fuente de marca: "Binance Plex" (≈ IBM Plex Sans, alternativa libre) — pendiente cargar el .ttf.
 */

const colors = {
  // Dorado de marca (#FCD535). 500 = primario; 600/700 = hover/pressed (de #D7A300/#C99400).
  brand: {
    50: '#fffceb',
    100: '#fff6c5',
    200: '#ffec85',
    300: '#ffde46',
    400: '#fcd535', // primario
    500: '#fcd535',
    600: '#d7a300',
    700: '#c99400',
    800: '#a37400',
    900: '#785400',
  },
  // Neutros: claros arriba, oscuros de marca abajo (#929aa5 tenue, #060612 fondo más oscuro).
  neutral: {
    0: '#ffffff',
    50: '#f9fafb',
    100: '#f5f6fa',
    200: '#e4e7eb',
    300: '#cbd2d9',
    400: '#929aa5',
    500: '#6b7280',
    600: '#4b5563',
    700: '#252525',
    800: '#121212',
    900: '#0a0f14',
    950: '#060612',
  },
  // Texto/elementos oscuros sobre fondos claros o sobre el dorado.
  ink: '#060612',
  success: '#2e7d32',
  warning: '#ed6c02',
  danger: '#f44336',
  info: '#1976d2',
};

/** Escala de espaciado 4pt. Se usa como `p-md`, `gap-lg`, etc. */
const spacing = {
  none: 0,
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  '2xl': 48,
  '3xl': 64,
};

/** Radios. `card` y `pill` son alias semánticos. */
const radii = {
  none: 0,
  sm: 4,
  md: 8,
  lg: 12,
  xl: 20,
  card: 16,
  pill: 999,
};

/** Escala tipográfica [fontSize, { lineHeight }]. */
const fontSize = {
  caption: ['12px', { lineHeight: '16px' }],
  body: ['16px', { lineHeight: '24px' }],
  h2: ['20px', { lineHeight: '28px' }],
  h1: ['28px', { lineHeight: '36px' }],
  display: ['34px', { lineHeight: '40px' }],
};

/** Familias. Marca = "Binance Plex" (≈ IBM Plex Sans). System hasta cargar el .ttf. */
const fontFamily = {
  sans: ['System'],
};

module.exports = { colors, spacing, radii, fontSize, fontFamily };
