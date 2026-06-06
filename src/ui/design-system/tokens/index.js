// @ts-check
/**
 * Tokens del design system = FUENTE ÚNICA de verdad. CommonJS: lo consume tailwind.config.js
 * (require) y el código TS (import).
 *
 * Paleta REAL del legacy (app/assets/commonStyles.js): dorado de marca #FCD535 + tinta #0A0F14,
 * fondos claros, link azul #3b82f6, semánticos Tailwind. Soporta light (default) y dark.
 * Color sobre el dorado = oscuro (`ink`).
 */

const colors = {
  // Dorado de marca #FCD535 (+ tonos para hover/pressed/tints).
  brand: {
    50: '#fffceb',
    100: '#fff6c5',
    200: '#ffec85',
    300: '#ffde46',
    400: '#fcd535',
    500: '#fcd535',
    600: '#d7a300',
    700: '#c99400',
    800: '#a37400',
    900: '#785400',
  },
  // Neutros alineados a commonStyles.js del legacy.
  neutral: {
    0: '#ffffff',
    50: '#fcfcfc',
    100: '#f5f6fa',
    200: '#e0e4ec',
    300: '#b7bdc6',
    400: '#9ca3af',
    500: '#6b7280',
    600: '#545454',
    700: '#363636',
    800: '#1a1a1a',
    900: '#0a0f14',
    950: '#060612',
  },
  ink: '#0a0f14', // texto sobre el dorado / texto principal en light
  link: '#3b82f6', // "Recuperar contraseña", "Registrarme"
  success: '#10b981',
  warning: '#f59e0b',
  danger: '#ef4444',
  info: '#3b82f6',
  // Acentos del legacy (por feature)
  orange: '#ff9222', // monto Mi billetera
  orangeStrong: '#ff7d00', // círculo Mi billetera
  violet: '#6330d3', // monto/círculo Mis gastos, historial
  violetStrong: '#8428da', // card Pago de servicios
  violetSoft: '#efeafb', // fondo historial de aclaraciones
  blueAccent: '#1468c5', // card Chatea con nosotros
  blueLink: '#47a3e0', // Mi QR / teléfono
};

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

const radii = {
  none: 0,
  sm: 4,
  md: 8,
  lg: 12,
  xl: 20,
  card: 16,
  pill: 999,
};

const fontSize = {
  caption: ['12px', { lineHeight: '16px' }],
  body: ['16px', { lineHeight: '24px' }],
  h2: ['20px', { lineHeight: '28px' }],
  h1: ['28px', { lineHeight: '36px' }],
  display: ['34px', { lineHeight: '40px' }],
};

// Fuente de marca real (app/assets/fonts/Binance PLEX.ttf), embebida vía expo-font.
const fontFamily = {
  sans: ['BinancePlex', 'System'],
};

module.exports = { colors, spacing, radii, fontSize, fontFamily };
