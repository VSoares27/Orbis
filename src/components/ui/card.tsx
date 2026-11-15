import type { ReactNode } from 'react';
import { StyleSheet, View, type ViewProps } from 'react-native';

import { Brand, Radii, Shadows, Spacing } from '@/constants/theme';

type CardVariant = 'default' | 'soft' | 'outline' | 'green' | 'cream';

type CardProps = ViewProps & {
  children: ReactNode;
  variant?: CardVariant;
  /** Padding interno (o padrão é 16). Use 0 para cards que sangram. */
  padding?: number;
};

/** Superfície base usada em quase todos os blocos do app. */
export function Card({ children, variant = 'default', padding = Spacing.three, style, ...rest }: CardProps) {
  return (
    <View style={[styles.base, variants[variant], { padding }, style]} {...rest}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: Radii.lg,
  },
});

const variants = StyleSheet.create({
  default: {
    backgroundColor: Brand.surface,
    borderWidth: 1,
    borderColor: Brand.border,
    ...Shadows.card,
  },
  soft: {
    backgroundColor: Brand.greenSoft,
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: Brand.border,
  },
  green: {
    backgroundColor: Brand.green,
  },
  cream: {
    backgroundColor: Brand.cream,
  },
});
