/**
 * ZAKEVENTS Unified Design System — Single Source of Truth
 * Every color, spacing, radius, shadow, and animation token lives here.
 * Import from this file. Never hardcode values.
 */

export const colors = {
  primary: '#C49A3C',
  primaryLight: '#D4B060',
  primaryDark: '#A67E2E',
  secondary: '#1C1C1E',
  secondaryLight: '#2C2C2E',
  background: '#FAF8F4',
  backgroundAlt: '#F5F2EC',
  accent: '#D4816A',
  success: '#6A9E7F',
  error: '#B85C4A',
  foreground: '#1C1C1E',
  muted: '#6B7280',
  border: '#E8E4DC',
  white: '#FFFFFF',
} as const;

export const chartColors = {
  positive: colors.success,
  negative: colors.accent,
  neutral: colors.primary,
} as const;

/** Status color mapping — use instead of arbitrary Tailwind color classes */
export const statusColors = {
  pending: { bg: 'bg-[var(--color-primary)]/10', text: 'text-[var(--color-primary-dark)]' },
  active: { bg: 'bg-[var(--color-success)]/10', text: 'text-[var(--color-success)]' },
  approved: { bg: 'bg-[var(--color-success)]/10', text: 'text-[var(--color-success)]' },
  completed: { bg: 'bg-[var(--color-success)]/10', text: 'text-[var(--color-success)]' },
  cancelled: { bg: 'bg-[var(--color-error)]/10', text: 'text-[var(--color-error)]' },
  rejected: { bg: 'bg-[var(--color-error)]/10', text: 'text-[var(--color-error)]' },
  overdue: { bg: 'bg-[var(--color-accent)]/10', text: 'text-[var(--color-accent)]' },
  inReview: { bg: 'bg-[var(--color-primary)]/10', text: 'text-[var(--color-primary)]' },
  premium: { bg: 'bg-[var(--color-primary)]', text: 'text-white' },
} as const;

export const spacing = {
  base: 4,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  '2xl': 32,
  '3xl': 48,
  '4xl': 64,
} as const;

export const radii = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  full: 9999,
} as const;

export const typography = {
  display: '"Playfair Display", serif',
  body: '"Plus Jakarta Sans", sans-serif',
  arabic: '"Cairo", sans-serif',
  mono: '"JetBrains Mono", monospace',
} as const;

export const shadows = {
  sm: '0 1px 2px rgba(28, 28, 30, 0.05)',
  md: '0 4px 12px rgba(28, 28, 30, 0.08)',
  lg: '0 8px 24px rgba(28, 28, 30, 0.12)',
  cardHover: '0 8px 24px rgba(196, 154, 60, 0.12)',
} as const;

export const animation = {
  curve: 'cubic-bezier(0.2, 0, 0, 1)',
  fast: '150ms',
  normal: '200ms',
  slow: '300ms',
} as const;

export const focusRing = {
  color: colors.primary,
  width: '2px',
  offset: '2px',
} as const;

export const touchTargets = {
  min: 48,
} as const;
