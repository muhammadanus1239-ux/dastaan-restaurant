/**
 * Theme 2: Royal Burgundy, Gold & Cream
 * Official Palettes and Tokens as specified in design.md
 */

export const lightPalette = {
  primary: '#4B1420',       // Burgundy: buttons, headers, active tabs, main icons
  gold: '#D4AF37',          // Warm Gold: thin lines, selected indicators, small accents
  background: '#F8F1E5',    // Cream: screen background
  surface: '#FFFFFF',       // White: cards, inputs, modals
  text: '#2B2118',          // Espresso: headings, body, prices
  border: '#E5D9C8',        // Separators, input borders, card outlines
  textMuted: '#766B63',     // Secondary text, inactive icons, upcoming steps
  tint: '#F3E5E8',          // Light burgundy highlight, selected row bg
  onPrimary: '#FFFFFF',     // Text on burgundy
  onGold: '#2B2118',        // Text on gold (espresso text, never white on gold)
  success: '#2E7D4F',       // Ready status, success banners
  danger: '#B3261E',        // Errors, Cancelled status
  cardBg: '#FFFFFF',
  inputBg: '#FFFFFF',
  tabBarBg: '#FFFFFF',
  badgeBg: '#4B1420',
  badgeText: '#FFFFFF',
};

export const darkPalette = {
  primary: '#8A2A3F',       // Lighter burgundy for dark backgrounds
  gold: '#D4AF37',          // Warm Gold
  background: '#1A1114',    // Deep dark burgundy-black
  surface: '#2A1B20',       // Dark warm surface
  text: '#F8F1E5',          // Cream text
  border: '#4A3A3F',        // Dark borders
  textMuted: '#B7A9A0',     // Muted cream-grey
  tint: '#3A222A',          // Subtle dark burgundy tint
  onPrimary: '#FFFFFF',     // Text on primary
  onGold: '#2B2118',        // Text on gold
  success: '#5CC38A',       // Vibrant green for dark mode
  danger: '#EF6B63',        // Soft red for dark mode
  cardBg: '#2A1B20',
  inputBg: '#23161B',
  tabBarBg: '#23161B',
  badgeBg: '#8A2A3F',
  badgeText: '#FFFFFF',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
};

export const radius = {
  sm: 8,
  button: 12,
  card: 16,
  chip: 20,
  full: 9999,
};

export const typography = {
  title: { fontSize: 24, fontWeight: '700', fontFamily: 'serif' },
  subtitle: { fontSize: 18, fontWeight: '600' },
  body: { fontSize: 15, fontWeight: '400' },
  caption: { fontSize: 12, fontWeight: '400' },
  price: { fontSize: 16, fontWeight: '700' },
};
