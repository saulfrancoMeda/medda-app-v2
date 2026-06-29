/**
 * Typed color constants that mirror the Tailwind token scale in tokens/index.js.
 * Use these in style props, StyleSheet.create, and icon color props.
 * For NativeWind className strings use the token class (e.g. "text-brand-700").
 */
export const palette = {
  brand: {
    50: '#FFFCEB',
    100: '#FEF6D1',
    200: '#FFE268',
    300: '#FFDA46',
    400: '#FCD535',
    500: '#FCD535',
    600: '#EAC11C',
    700: '#97720A',
    800: '#7A5D08',
    900: '#5C4606',
  },
  neutral: {
    0: '#FFFFFF',
    50: '#FAFAF9',
    100: '#F2F2F2',
    200: '#E8E4DC',
    300: '#D6D1C7',
    400: '#9A9384',
    500: '#6C6555',
    600: '#4A4639',
    700: '#33302A',
    800: '#26231D',
    900: '#1B1812',
    950: '#131110',
  },
  success: '#2E8C6A',
  successSoft: '#E3F2EC',
  danger: '#C24A30',
  dangerSoft: '#FAE8E2',
  warning: '#C9920A',
} as const;
