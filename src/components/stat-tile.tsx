import { StyleSheet, View } from 'react-native';

import { Icon } from './ui/icon';
import { AppText } from './ui/text';

import { Brand, Radii, Spacing } from '@/constants/theme';
import type { IconName } from '@/types';

type Tone = 'green' | 'amber' | 'sky' | 'danger';

type StatTileProps = {
  icon: IconName;
  label: string;
  value: string;
  unit?: string;
  tone?: Tone;
};

const tones: Record<Tone, { background: string; color: string }> = {
  green: { background: Brand.greenSoft, color: Brand.green },
  amber: { background: Brand.amberSoft, color: Brand.amber },
  sky: { background: Brand.skySoft, color: Brand.sky },
  danger: { background: Brand.dangerSoft, color: Brand.danger },
};

/** Bloco compacto de métrica (clima, solo, mercado etc.). */
export function StatTile({ icon, label, value, unit, tone = 'green' }: StatTileProps) {
  const colors = tones[tone];

  return (
    <View style={[styles.tile, { backgroundColor: colors.background }]}>
      <View style={[styles.iconBox, { backgroundColor: Brand.surface }]}>
        <Icon name={icon} size={18} color={colors.color} />
      </View>
      <View style={styles.valueRow}>
        <AppText variant="heading" style={styles.value}>
          {value}
        </AppText>
        {unit && (
          <AppText variant="caption" tone="secondary">
            {unit}
          </AppText>
        )}
      </View>
      <AppText variant="caption" tone="secondary" numberOfLines={2}>
        {label}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  tile: {
    flex: 1,
    minWidth: 132,
    borderRadius: Radii.lg,
    padding: Spacing.three,
    gap: 6,
  },
  iconBox: {
    width: 30,
    height: 30,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
  },
  value: {
    fontSize: 22,
    lineHeight: 26,
  },
});
