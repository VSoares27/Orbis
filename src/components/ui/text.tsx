import { StyleSheet, Text, type TextProps } from 'react-native';

import { Brand } from '@/constants/theme';

/**
 * Texto padrão do app.
 * `variant` define tamanho/peso e `tone` define a cor semântica.
 * Prefira este componente a usar <Text> direto, para manter consistência.
 */

export type TextVariant =
  | 'display'
  | 'title'
  | 'heading'
  | 'subtitle'
  | 'body'
  | 'bodyBold'
  | 'caption'
  | 'label'
  | 'mono';

export type TextTone =
  | 'primary'
  | 'secondary'
  | 'muted'
  | 'inverse'
  | 'brand'
  | 'amber'
  | 'sky'
  | 'danger'
  | 'success';

type AppTextProps = TextProps & {
  variant?: TextVariant;
  tone?: TextTone;
};

const tones: Record<TextTone, string> = {
  primary: Brand.text,
  secondary: Brand.textSecondary,
  muted: Brand.textMuted,
  inverse: Brand.cream,
  brand: Brand.green,
  amber: Brand.amber,
  sky: Brand.sky,
  danger: Brand.danger,
  success: Brand.success,
};

export function AppText({ variant = 'body', tone = 'primary', style, ...rest }: AppTextProps) {
  return <Text style={[styles[variant], { color: tones[tone] }, style]} {...rest} />;
}

const styles = StyleSheet.create({
  display: {
    fontSize: 40,
    lineHeight: 44,
    fontWeight: '700',
    letterSpacing: -1,
  },
  title: {
    fontSize: 26,
    lineHeight: 32,
    fontWeight: '700',
    letterSpacing: -0.4,
  },
  heading: {
    fontSize: 20,
    lineHeight: 26,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 17,
    lineHeight: 24,
    fontWeight: '600',
  },
  body: {
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '400',
  },
  bodyBold: {
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '700',
  },
  caption: {
    fontSize: 12,
    lineHeight: 17,
    fontWeight: '500',
  },
  label: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  mono: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
  },
});
