import { StyleSheet, View } from 'react-native';

import { AppText } from './text';

import { Brand, Radii, Spacing } from '@/constants/theme';

export type BarDatum = {
  label: string;
  value: number;
  /** Destaque visual (ex.: hoje). */
  highlight?: boolean;
};

type BarChartProps = {
  data: BarDatum[];
  /** Altura máxima das barras. */
  height?: number;
  color?: string;
  highlightColor?: string;
  /** Exibe o valor acima de cada barra. */
  showValues?: boolean;
  formatValue?: (value: number) => string;
};

/**
 * Gráfico de barras simples feito com Views.
 * Não depende de bibliotecas externas e funciona igual em iOS, Android e web.
 */
export function BarChart({
  data,
  height = 96,
  color = Brand.sky,
  highlightColor = Brand.green,
  showValues = true,
  formatValue = (value) => `${Math.round(value)}`,
}: BarChartProps) {
  const maxValue = Math.max(...data.map((item) => item.value), 1);

  return (
    <View style={styles.wrapper}>
      <View style={[styles.bars, { height }]}>
        {data.map((item, index) => {
          const barHeight = Math.max(3, (item.value / maxValue) * (height - 18));
          return (
            <View key={`${item.label}-${index}`} style={styles.barColumn}>
              {showValues && (
                <AppText
                  variant="caption"
                  tone={item.highlight ? 'brand' : 'muted'}
                  style={styles.value}>
                  {formatValue(item.value)}
                </AppText>
              )}
              <View
                accessibilityLabel={`${item.label}: ${formatValue(item.value)}`}
                style={[
                  styles.bar,
                  {
                    height: barHeight,
                    backgroundColor: item.highlight ? highlightColor : color,
                  },
                ]}
              />
            </View>
          );
        })}
      </View>

      <View style={styles.labels}>
        {data.map((item, index) => (
          <AppText
            key={`label-${item.label}-${index}`}
            variant="caption"
            tone={item.highlight ? 'brand' : 'muted'}
            style={styles.label}
            numberOfLines={1}>
            {item.label}
          </AppText>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: Spacing.one,
  },
  bars: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: Spacing.one,
  },
  barColumn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 4,
  },
  bar: {
    width: '70%',
    borderTopLeftRadius: Radii.sm,
    borderTopRightRadius: Radii.sm,
    minWidth: 8,
  },
  labels: {
    flexDirection: 'row',
    gap: Spacing.one,
  },
  value: {
    fontSize: 10,
    lineHeight: 13,
  },
  label: {
    flex: 1,
    textAlign: 'center',
    fontSize: 11,
  },
});
