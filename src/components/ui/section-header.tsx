import { Pressable, StyleSheet, View } from 'react-native';

import { Icon } from './icon';
import { AppText } from './text';

import { Brand } from '@/constants/theme';

type SectionHeaderProps = {
  title: string;
  subtitle?: string;
  actionLabel?: string;
  onActionPress?: () => void;
};

/** Cabeçalho de seção: título, subtítulo e ação opcional à direita. */
export function SectionHeader({ title, subtitle, actionLabel, onActionPress }: SectionHeaderProps) {
  return (
    <View style={styles.row}>
      <View style={styles.texts}>
        <AppText variant="heading">{title}</AppText>
        {subtitle && (
          <AppText variant="caption" tone="secondary">
            {subtitle}
          </AppText>
        )}
      </View>

      {actionLabel && onActionPress && (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={actionLabel}
          onPress={onActionPress}
          style={({ pressed }) => [styles.action, pressed && styles.pressed]}>
          <AppText variant="label" tone="brand">
            {actionLabel}
          </AppText>
          <Icon name="chevron-right" size={16} color={Brand.green} />
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  texts: {
    flex: 1,
    gap: 2,
  },
  action: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  pressed: {
    opacity: 0.6,
  },
});
