// @ts-check
/**
 * Tokens del design system = FUENTE ÚNICA de verdad. CommonJS: lo consume tailwind.config.js
 * (require) y el código TS (import).
 *
 * Paleta alineada al prototipo standalone (MEDA_DESIGN): dorado de marca #FCD535 con tints
 * (goldSoft/goldDeep/goldPress), neutros CÁLIDOS (tinta #1B1812, taupe), semánticos apagados.
 * Color sobre el dorado = tinta oscura (`onGold`/`ink`). Soporta light (default) y dark.
 */

const colors = {
  // Dorado de marca #FCD535 + tonos del spec (goldBright/goldPress/goldDeep + tints).
  brand: {
    50: '#FFFCEB',
    100: '#FEF6D1', // goldSoft — fondos de íconos, botón secundario, tint suave
    200: '#FFE268', // goldBright — highlight del gradiente
    300: '#FFDA46',
    400: '#FCD535',
    500: '#FCD535', // gold — botón primario, gradiente saldo
    600: '#EAC11C', // goldPress — presionado
    700: '#97720A', // goldDeep — links, íconos sobre fondo claro, "Regístrate"/"Ver todos"
    800: '#7A5D08',
    900: '#5C4606',
  },
  // Neutros CÁLIDOS (taupe) del prototipo standalone.
  neutral: {
    0: '#FFFFFF', // bg / surface
    50: '#FAFAF9',
    100: '#F2F2F2', // surface2 — inputs, chips de selección
    200: '#E8E4DC', // surface3 — bordes suaves, divisores
    300: '#D6D1C7',
    400: '#9A9384', // ink3 — placeholders, deshabilitado
    500: '#6C6555', // ink2 — texto secundario, labels
    600: '#4A4639',
    700: '#33302A',
    800: '#26231D',
    900: '#1B1812', // ink — texto principal / onGold
    950: '#131110', // bg dark
  },
  ink: '#1B1812', // texto sobre el dorado / texto principal en light
  // Acentos dorados nombrados (uso directo: text-goldDeep, bg-goldSoft, bg-goldBright).
  goldSoft: '#FEF6D1',
  goldDeep: '#97720A',
  goldBright: '#FFE268',
  goldPress: '#EAC11C',
  // Rebrand: links/acentos en DORADO (goldDeep). Sin morado ni azul en toda la app.
  link: '#97720A',
  success: '#2E8C6A',
  successSoft: '#E3F2EC',
  warning: '#C9920A',
  danger: '#C24A30',
  dangerSoft: '#FAE8E2',
  info: '#97720A',
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
  sm: 10, // chips pequeños
  md: 14, // inputs, chips de banco
  lg: 20, // botones secundarios, cards medianas
  xl: 26, // bottom sheets, drawers, modales
  card: 18, // tarjetas (list rows, tiles)
  pill: 999,
};

const fontSize = {
  caption: ['12px', { lineHeight: '16px' }],
  body: ['16px', { lineHeight: '24px' }],
  h2: ['20px', { lineHeight: '28px' }],
  h1: ['26px', { lineHeight: '34px' }],
  display: ['40px', { lineHeight: '46px' }],
};

// Fuente de marca real (app/assets/fonts/Binance PLEX.ttf), embebida vía expo-font.
const fontFamily = {
  sans: ['BinancePlex', 'System'],
};

module.exports = { colors, spacing, radii, fontSize, fontFamily };
