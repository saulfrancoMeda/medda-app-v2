// @ts-check
/**
 * Tokens del design system = FUENTE ÚNICA de verdad.
 * Este archivo es CommonJS a propósito: lo consume `tailwind.config.js` (require) Y el
 * código TS de la app (import). Así las utilidades NativeWind y los estilos imperativos
 * nunca divergen.
 *
 * ⚠️ COLORES PLACEHOLDER: el scrape de https://meda.com.mx no expuso los hex/tipografías
 * reales. Reemplazar `colors.brand`, `fontFamily` y la tipografía con los valores del
 * manual de marca (o inspeccionando las variables CSS del sitio en vivo) en la Fase 0.
 */

/** Paleta. `brand` = primario; `neutral` = grises; semánticos para estados. */
const colors = {
  brand: {
    50: '#e9f9f3',
    100: '#c9efe0',
    200: '#97e0c5',
    300: '#5fcaa5',
    400: '#2faE86',
    500: '#0f9a72', // primario (PLACEHOLDER — verde fintech)
    600: '#0a7d5d',
    700: '#0a634a',
    800: '#0b4d3b',
    900: '#0a3f31',
  },
  neutral: {
    0: '#ffffff',
    50: '#f7f8f8',
    100: '#eef0f1',
    200: '#dfe3e5',
    300: '#c4cacd',
    400: '#9aa3a8',
    500: '#6f797e',
    600: '#525b5f',
    700: '#3c4346',
    800: '#262b2d',
    900: '#14181a',
  },
  success: '#15a34a',
  warning: '#d97706',
  danger: '#dc2626',
  info: '#2563eb',
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

/** Familias. PLACEHOLDER: ajustar a la fuente de marca de Medá. */
const fontFamily = {
  sans: ['System'],
};

module.exports = { colors, spacing, radii, fontSize, fontFamily };
