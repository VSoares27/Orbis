import { StyleSheet, View } from 'react-native';

import { AppText } from './text';

import { Brand, Radii, Spacing } from '@/constants/theme';

type BadgeTone = 'green' | 'amber' | 'sky' | 'danger' | 'neutral' | 'inverse';

type BadgeProps = {
  label: string;
  tone?: BadgeTone;
  /** Versão compacta, usada dentro de cards. */
  small?: boolean;
};

const toneStyles: Record<BadgeTone, { background: string; text: string }> = {
  green: { background: Brand.greenSoft, text: Brand.green },
  amber: { background: Brand.amberSoft, text: '#92400E' },
  sky: { background: Brand.skySoft, text: '#075985' },
  danger: { background: Brand.dangerSoft, text: Brand.danger },
  neutral: { background: Brand.cream, text: Brand.textSecondary },
  inverse: { background: 'rgba(244,239,230,0.18)', text: Brand.cream },
};

export function Badge({ label, tone = 'green', small = false }: BadgeProps) {
  const colors = toneStyles[tone];

  return (
    <View
      style={[
        styles.base,
        { backgroundColor: colors.background },
        small ? styles.small : styles.regular,
      ]}>
      <AppText variant="caption" style={[styles.text, { color: colors.text }, small && styles.smallText]}>
        {label}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    alignSelf: 'flex-start',
    borderRadius: Radii.pill,
  },
  regular: {
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.one,
  },
  small: {
    paddingHorizontal: 6,
    paddingVertical: 1,
  },
  text: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '700',
  },
  smallText: {
    fontSize: 11,
    lineHeight: 15,
  },
});
