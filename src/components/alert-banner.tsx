import { Pressable, StyleSheet, View } from 'react-native';

import { Icon } from './ui/icon';
import { AppText } from './ui/text';

import { Brand, Radii, Spacing } from '@/constants/theme';
import type { AlertSeverity, IconName } from '@/types';

type AlertBannerProps = {
  severity: AlertSeverity;
  title: string;
  message: string;
  actionLabel?: string;
  onPress?: () => void;
};

const severityStyles: Record<
  AlertSeverity,
  { background: string; accent: string; icon: IconName; badge: string }
> = {
  info: {
    background: Brand.skySoft,
    accent: Brand.sky,
    icon: 'information-outline',
    badge: 'Informação',
  },
  atencao: {
    background: Brand.amberSoft,
    accent: Brand.amber,
    icon: 'alert-outline',
    badge: 'Atenção',
  },
  critico: {
    background: Brand.dangerSoft,
    accent: Brand.danger,
    icon: 'alert-octagon-outline',
    badge: 'Crítico',
  },
};

/** Faixa de alerta usada na home e em recomendações. */
export function AlertBanner({ severity, title, message, actionLabel, onPress }: AlertBannerProps) {
  const colors = severityStyles[severity];

  const content = (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.iconCircle, { backgroundColor: colors.accent }]}>
        <Icon name={colors.icon} size={18} color="#FFFFFF" />
      </View>

      <View style={styles.texts}>
        <AppText variant="caption" style={{ color: colors.accent, fontWeight: '700' }}>
          {colors.badge.toUpperCase()}
        </AppText>
        <AppText variant="bodyBold">{title}</AppText>
        <AppText variant="caption" tone="secondary">
          {message}
        </AppText>

        {actionLabel && (
          <View style={styles.action}>
            <AppText variant="label" style={{ color: colors.accent }}>
              {actionLabel}
            </AppText>
            <Icon name="arrow-right" size={14} color={colors.accent} />
          </View>
        )}
      </View>
    </View>
  );

  if (!onPress) return content;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={actionLabel ?? title}
      onPress={onPress}
      style={({ pressed }) => [pressed && styles.pressed]}>
      {content}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: Spacing.two,
    padding: Spacing.three,
    borderRadius: Radii.lg,
    borderWidth: 1,
    borderColor: 'rgba(22, 71, 52, 0.08)',
  },
  iconCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  texts: {
    flex: 1,
    gap: 2,
  },
  action: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: Spacing.one,
  },
  pressed: {
    opacity: 0.75,
  },
});
