/**
 * Design tokens do Orbis.
 *
 * As quatro cores oficiais da marca ficam em `Brand`. Sempre que possível,
 * use esses tokens em vez de escrever hexadecimais direto nas telas.
 *
 * Observação: o app foi pensado para uso no campo (leitura sob sol forte),
 * por isso o tema claro com fundo creme é o padrão.
 */

import '@/global.css';

import { Platform } from 'react-native';

export const Brand = {
  /** Verde principal — cabeçalhos, botões e identidade. */
  green: '#164734',
  /** Verde mais escuro — gradientes e estados pressionados. */
  greenDark: '#0E2F22',
  /** Verde bem claro — fundos suaves de destaque. */
  greenSoft: '#DCE8E1',
  /** Laranja/âmbar — alertas, destaques e ações secundárias. */
  amber: '#D97706',
  amberSoft: '#FBE9CF',
  /** Azul — dados de clima, chuva e links. */
  sky: '#0284C7',
  skySoft: '#D9EDF8',
  /** Creme — fundo geral das telas. */
  cream: '#F4EFE6',
  /** Superfícies (cards) sobre o creme. */
  surface: '#FFFFFF',
  /** Texto principal e secundário. */
  text: '#1F2A24',
  textSecondary: '#5B6B62',
  textMuted: '#8A978F',
  /** Bordas e divisores. */
  border: '#E4DDCF',
  /** Estados. */
  danger: '#B91C1C',
  dangerSoft: '#FBE3E3',
  success: '#15803D',
  successSoft: '#DCF0E3',
} as const;

/**
 * Mantido no formato antigo para os componentes herdados do template do Expo.
 * O novo design system usa `Brand`.
 */
export const Colors = {
  light: {
    text: Brand.text,
    background: Brand.cream,
    backgroundElement: Brand.surface,
    backgroundSelected: Brand.greenSoft,
    textSecondary: Brand.textSecondary,
    primary: Brand.green,
  },
  dark: {
    text: '#F4EFE6',
    background: '#0E2F22',
    backgroundElement: '#164734',
    backgroundSelected: '#1D5A42',
    textSecondary: '#C4D2C9',
    primary: '#7FC8A2',
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: 'var(--font-display)',
    serif: 'var(--font-serif)',
    rounded: 'var(--font-rounded)',
    mono: 'var(--font-mono)',
  },
});

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 48,
  seven: 64,
} as const;

export const Radii = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  pill: 999,
} as const;

/** Sombra leve e compatível com Android/iOS (use em superfícies elevadas). */
export const Shadows = {
  card: Platform.select({
    ios: {
      shadowColor: '#164734',
      shadowOpacity: 0.08,
      shadowRadius: 12,
      shadowOffset: { width: 0, height: 4 },
    },
    android: { elevation: 2 },
    default: {},
  }),
  floating: Platform.select({
    ios: {
      shadowColor: '#164734',
      shadowOpacity: 0.18,
      shadowRadius: 18,
      shadowOffset: { width: 0, height: 8 },
    },
    android: { elevation: 6 },
    default: {},
  }),
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 720;

/** Gradientes reutilizáveis (propriedade experimental suportada no RN 0.88). */
export const Gradients = {
  green: 'linear-gradient(135deg, #164734 0%, #1D5A42 55%, #0E2F22 100%)',
  sky: 'linear-gradient(135deg, #0284C7 0%, #0B6FA4 100%)',
  cream: 'linear-gradient(180deg, #F4EFE6 0%, #FBF8F2 100%)',
  amber: 'linear-gradient(135deg, #D97706 0%, #B45309 100%)',
} as const;
