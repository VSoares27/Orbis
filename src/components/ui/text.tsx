import { createElement, type ReactNode } from 'react';
import { StyleSheet, Text, type TextProps } from 'react-native';

import { Brand } from '@/constants/theme';
import { lookup, t, useLanguage } from '@/lib/i18n';

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

export function AppText({ variant = 'body', tone = 'primary', style, children, ...rest }: AppTextProps) {
  const language = useLanguage();
  const props = { style: [styles[variant], { color: tones[tone] }, style], ...rest };
  if (language === 'pt') return <Text {...props}>{children}</Text>;
  return createElement(Text, props, ...translateChildren(children));
}

/**
 * Traduz os filhos de um texto. Se forem só textos e números, traduz a frase
 * inteira (ex.: "Nota ", 49, " de 100"); senão, traduz cada pedaço de texto.
 */
function translateChildren(children: ReactNode): ReactNode[] {
  const list = Array.isArray(children) ? children : [children];
  const primitives = list.every((child) => typeof child === 'string' || typeof child === 'number');
  if (primitives && list.length > 1) {
    const whole = lookup(list.join(''));
    if (whole !== null) return [whole];
  }
  return list.map((child) => (typeof child === 'string' ? t(child) : child));
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
