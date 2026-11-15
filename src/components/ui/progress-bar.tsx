import { StyleSheet, View } from 'react-native';

import { Brand, Radii } from '@/constants/theme';

type ProgressBarProps = {
  /** 0 a 100. */
  value: number;
  color?: string;
  trackColor?: string;
  height?: number;
};

export function ProgressBar({
  value,
  color = Brand.green,
  trackColor = Brand.greenSoft,
  height = 8,
}: ProgressBarProps) {
  const clamped = Math.min(100, Math.max(0, value));

  return (
    <View style={[styles.track, { backgroundColor: trackColor, height }]}>
      <View
        style={[styles.fill, { width: `${clamped}%`, backgroundColor: color, height }]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    width: '100%',
    borderRadius: Radii.pill,
    overflow: 'hidden',
  },
  fill: {
    borderRadius: Radii.pill,
  },
});
