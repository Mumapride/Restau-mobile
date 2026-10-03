/**
 * Restau Mobile — Central Design Tokens
 *
 * Single source of truth for colour, spacing, radius, typography and elevation.
 * All new reusable components MUST import from here.
 * Existing screens are NOT migrated yet — this file is additive only.
 *
 * Brand direction: existing dominant Restau green (#1B5E3A).
 * No new brand hue is introduced; supporting shades are derived from it.
 * System font only (no custom font packages).
 */

export const COLORS = {
  // Brand — derived around the existing dominant green.
  primary: '#1B5E3A',
  primaryDark: '#123F27',
  primaryLight: '#E7F2EB',

  // Text on primary backgrounds (for headers / buttons).
  onPrimary: '#FFFFFF',
  onPrimaryMuted: '#C9E2D3',
  overlayLight: 'rgba(255,255,255,0.15)',

  // Surfaces — deliberately neutral, not many competing green washes.
  background: '#F4F6F5',
  surface: '#FFFFFF',
  surfaceAlt: '#EDF1EE',

  // Text hierarchy.
  text: '#17251D',
  textSecondary: '#51655B',
  textMuted: '#8A9A91',

  // Lines / dividers.
  border: '#E1E8E4',

  // Feedback.
  danger: '#C93A3A',
  dangerLight: '#FDECEC',
  success: '#157F3D',
  successLight: '#E6F4EB',
  warning: '#9A6B00',
  warningLight: '#FFF4D6',

  // Accent — kept from existing student "Most Popular" badge.
  gold: '#D9A441',
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
};

export const RADIUS = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
};

export const TYPOGRAPHY = {
  display: { fontSize: 28, lineHeight: 34, fontWeight: '800' },
  h1: { fontSize: 24, lineHeight: 30, fontWeight: '800' },
  h2: { fontSize: 20, lineHeight: 26, fontWeight: '700' },
  h3: { fontSize: 16, lineHeight: 22, fontWeight: '700' },
  body: { fontSize: 14, lineHeight: 20, fontWeight: '400' },
  bodySmall: { fontSize: 13, lineHeight: 18, fontWeight: '400' },
  label: { fontSize: 13, lineHeight: 18, fontWeight: '600' },
  caption: { fontSize: 12, lineHeight: 16, fontWeight: '500' },
};

export const SHADOWS = {
  none: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  sm: {
    shadowColor: '#0B2E1D',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 1,
  },
  md: {
    shadowColor: '#0B2E1D',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
};

/** Minimum comfortable touch target (44pt guideline). */
export const TOUCH_TARGET = 48;

const tokens = {
  COLORS,
  SPACING,
  RADIUS,
  TYPOGRAPHY,
  SHADOWS,
  TOUCH_TARGET,
};

export default tokens;
