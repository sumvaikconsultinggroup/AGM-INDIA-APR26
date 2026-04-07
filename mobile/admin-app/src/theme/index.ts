export const colors = {
  primary: {
    saffron: '#FF6B00',
    maroon: '#800020',
    deepRed: '#6E0000',
    vermillion: '#E34234',
  },
  gold: {
    main: '#D4A017',
    light: '#FFD54F',
    dark: '#B8860B',
  },
  background: {
    parchment: '#FFF8E7',
    sandstone: '#F5E6CC',
    warmWhite: '#FFFDF5',
    cream: '#FFF8E1',
  },
  accent: {
    peacock: '#006D6F',
    lotus: '#E8A0BF',
    sage: '#B8C4A8',
  },
  text: {
    primary: '#4A0010',
    secondary: '#8B7E74',
    gold: '#D4A017',
    white: '#FFFFFF',
  },
  status: {
    success: '#4CAF50',
    warning: '#FF9800',
    error: '#F44336',
    info: '#2196F3',
  },
  border: {
    gold: 'rgba(212, 160, 23, 0.3)',
    maroon: 'rgba(128, 0, 32, 0.2)',
  },
};

export const fonts = {
  regular: 'System',
  medium: 'System',
  bold: 'System',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const borderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
};

export const typography = {
  hero: {
    fontSize: 28,
    lineHeight: 34,
    fontWeight: '700' as const,
  },
  titleLg: {
    fontSize: 22,
    lineHeight: 28,
    fontWeight: '700' as const,
  },
  title: {
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '700' as const,
  },
  titleSm: {
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '600' as const,
  },
  body: {
    fontSize: 14,
    lineHeight: 21,
    fontWeight: '400' as const,
  },
  bodySm: {
    fontSize: 13,
    lineHeight: 19,
    fontWeight: '400' as const,
  },
  label: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '600' as const,
  },
  micro: {
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '600' as const,
  },
};

export const shadows = {
  soft: {
    shadowColor: '#2F1505',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 18,
    elevation: 3,
  },
  raised: {
    shadowColor: '#2F1505',
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.12,
    shadowRadius: 28,
    elevation: 6,
  },
};
