import { StyleSheet, View } from 'react-native';

import { Icon } from './icon';
import { AppText } from './text';

import { Brand, Spacing } from '@/constants/theme';
import type { IconName } from '@/types';

type EmptyStateProps = {
  icon?: IconName;
  title: string;
  description?: string;
};

export function EmptyState({ icon = 'sprout-outline', title, description }: EmptyStateProps) {
  return (
    <View style={styles.container}>
      <View style={styles.iconCircle}>
        <Icon name={icon} size={28} color={Brand.green} />
      </View>
      <AppText variant="subtitle" style={styles.center}>
        {title}
      </AppText>
      {description && (
        <AppText variant="body" tone="secondary" style={styles.center}>
          {description}
        </AppText>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.five,
    gap: Spacing.two,
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Brand.greenSoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.one,
  },
  center: {
    textAlign: 'center',
  },
});
