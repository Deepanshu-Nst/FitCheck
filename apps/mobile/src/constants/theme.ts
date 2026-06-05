// ── Design Tokens ─────────────────────────────────────────────────────────────
// Light Luxury Theme - Tailored for a premium fashion-tech aesthetic.

export const Colors = {
  // Backgrounds
  bg: '#F9F9F7',         // Warm off-white main background
  bgSecondary: '#F2F2F0',// Slightly darker for contrasts (tabs, etc.)
  bgTertiary: '#EAEAE8', // For input backgrounds, muted cards
  bgCard: '#FFFFFF',     // Pure white elevated surfaces

  // Accents (Muted Luxury Palette)
  accent: '#4A2E3B',     // Deep plum / sophisticated primary
  accentMuted: 'rgba(74, 46, 59, 0.08)',
  accentLight: '#6B4A59',
  
  gold: '#C8A96E',       // Existing gold, great for premium highlights
  goldMuted: 'rgba(200, 169, 110, 0.15)',
  
  graphite: '#2D2D33',   // Dark graphite for buttons/headers

  // Surfaces & Borders
  surface: '#FFFFFF',
  surfaceElevated: '#FFFFFF',
  border: '#E8E8E6',     // Extremely soft border
  borderDark: '#D1D1CE', // For focused inputs

  // Text
  textPrimary: '#1A1A1C',   // Charcoal, not pure black
  textSecondary: '#6B6B75', // Muted graphite
  textMuted: '#9696A0',     // Soft placeholder text
  textInverse: '#FFFFFF',   // Text on dark buttons (plum/graphite)

  // Status (Restrained tones)
  success: '#3A7D5C',
  successMuted: 'rgba(58, 125, 92, 0.1)',
  warning: '#B87A24',
  warningMuted: 'rgba(184, 122, 36, 0.1)',
  error: '#BA4343',
  errorMuted: 'rgba(186, 67, 67, 0.1)',
  info: '#4B7BBA',

  // Overlays
  overlay: 'rgba(26, 26, 28, 0.65)',
  overlayLight: 'rgba(26, 26, 28, 0.2)',
} as const;

export const Typography = {
  // Font sizes - Editorial scaling
  xs: 12,
  sm: 14,
  base: 16,
  md: 18,
  lg: 20,
  xl: 24,
  '2xl': 28,
  '3xl': 36,
  '4xl': 48,
  '5xl': 64, // Massive hero numbers

  // Line heights
  lineHeight: {
    tight: 1.1,
    normal: 1.5,
    relaxed: 1.7,
  },

  // Letter spacing
  tracking: {
    tight: -0.5,
    normal: 0,
    wide: 0.5,
    wider: 1,
    widest: 2,
  },
} as const;

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  '2xl': 40,
  '3xl': 56,
  '4xl': 80,
  '5xl': 120, // Huge breathing room for hero sections
} as const;

export const Radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  '2xl': 32,
  '3xl': 40,
  full: 9999,
} as const;

export const Shadow = {
  // Softer, more expensive shadows
  sm: {
    shadowColor: '#1A1A1C',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 12,
    elevation: 2,
  },
  md: {
    shadowColor: '#1A1A1C',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.05,
    shadowRadius: 24,
    elevation: 4,
  },
  lg: {
    shadowColor: '#1A1A1C',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.06,
    shadowRadius: 40,
    elevation: 8,
  },
  accent: {
    shadowColor: Colors.accent,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 24,
    elevation: 6,
  },
} as const;
