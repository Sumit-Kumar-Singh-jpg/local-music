/**
 * Nocturnal Gallery — Design Tokens (React Native)
 * Maps 1:1 to the CSS variables in apps/web/src/index.css
 */
import { StyleSheet } from 'react-native'

export const colors = {
  bg:           '#0e0e13',
  surface:      '#131319',
  surfaceMid:   '#19191f',
  surfaceHigh:  '#1f1f26',
  surfaceTop:   '#25252d',
  primary:      '#cc97ff',
  primaryDim:   '#A855F7',
  secondary:    '#ff67ad',
  tertiary:     '#699cff',
  text:         '#f9f5fd',
  textMuted:    '#acaab1',
  outline:      'rgba(255,255,255,0.08)',
  glassBg:      'rgba(255,255,255,0.06)',
  glassBorder:  'rgba(255,255,255,0.08)',
  success:      '#10B981',
  error:        '#EF4444',
  warning:      '#F59E0B',
}

export const gradients = {
  primary:   ['#A855F7', '#EC4899'] as [string, string],
  hero:      ['#A855F7', '#EC4899', '#3B82F6'] as [string, string, string],
  text:      ['#cc97ff', '#ff67ad'] as [string, string],
  card:      ['rgba(168,85,247,0.15)', 'rgba(236,72,153,0.08)'] as [string, string],
  dark:      ['rgba(14,14,19,0)', 'rgba(14,14,19,0.95)'] as [string, string],
}

export const radii = {
  sm:   6,
  md:   10,
  lg:   16,
  xl:   20,
  xxl:  24,
  full: 999,
}

export const spacing = {
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  5: 20,
  6: 24,
  8: 32,
  10: 40,
  12: 48,
}

export const typography = {
  h1: { fontSize: 28, fontWeight: '900' as const, letterSpacing: -0.5, color: colors.text },
  h2: { fontSize: 22, fontWeight: '800' as const, letterSpacing: -0.3, color: colors.text },
  h3: { fontSize: 18, fontWeight: '700' as const, color: colors.text },
  body: { fontSize: 15, fontWeight: '400' as const, color: colors.text },
  bodyMd: { fontSize: 14, fontWeight: '500' as const, color: colors.text },
  caption: { fontSize: 12, fontWeight: '400' as const, color: colors.textMuted },
  label: { fontSize: 11, fontWeight: '700' as const, letterSpacing: 0.8, color: colors.textMuted },
}

export const layout = {
  tabBarHeight: 64,
  miniPlayerHeight: 72,
  headerHeight: 56,
}

/** Reusable glassmorphism card style */
export const glass = StyleSheet.create({
  card: {
    backgroundColor: colors.glassBg,
    borderColor: colors.glassBorder,
    borderWidth: 1,
    borderRadius: radii.xl,
  },
  cardMd: {
    backgroundColor: colors.glassBg,
    borderColor: colors.glassBorder,
    borderWidth: 1,
    borderRadius: radii.lg,
  },
})

export const shadows = {
  glow: {
    shadowColor: '#A855F7',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
  },
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
}
