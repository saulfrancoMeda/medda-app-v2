// @ts-check

const colors = {
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
  ink: '#1B1812',
  goldSoft: '#FEF6D1',
  goldDeep: '#97720A',
  goldBright: '#FFE268',
  goldPress: '#EAC11C',
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
  sm: 10,
  md: 14,
  lg: 20,
  xl: 26,
  card: 18,
  pill: 999,
};

const fontSize = {
  caption: ['12px', { lineHeight: '16px' }],
  body: ['16px', { lineHeight: '24px' }],
  h2: ['20px', { lineHeight: '28px' }],
  h1: ['26px', { lineHeight: '34px' }],
  display: ['40px', { lineHeight: '46px' }],
};

const fontFamily = {
  sans: ['BinancePlex', 'System'],
};

module.exports = { colors, spacing, radii, fontSize, fontFamily };
