import { StyleSheet, View } from 'react-native';

import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Icon } from './ui/icon';
import { AppText } from './ui/text';

import { Brand, Radii, Spacing } from '@/constants/theme';
import { categoryLabels } from '@/data/mock';
import { formatCurrency, formatNumber, formatSignedPercent } from '@/lib/format';
import type { MarketCategory, MarketItem } from '@/types';

type MarketCardProps = {
  item: MarketItem;
  onContact?: () => void;
};

const categoryTone: Record<MarketCategory, 'green' | 'sky' | 'amber' | 'neutral'> = {
  frutas: 'amber',
  verduras: 'green',
  graos: 'amber',
  laticinios: 'sky',
};

/** Card de produto do mercado da agricultura familiar. */
export function MarketCard({ item, onContact }: MarketCardProps) {
  const trendUp = item.trend > 0;
  const trendDown = item.trend < 0;
  const trendColor = trendUp ? Brand.success : trendDown ? Brand.danger : Brand.textMuted;

  return (
    <Card style={styles.card}>
      <View style={styles.header}>
        <View style={styles.iconBox}>
          <Icon name={item.icon} size={26} color={Brand.green} />
        </View>

        <View style={styles.headerText}>
          <View style={styles.titleRow}>
            <AppText variant="subtitle" numberOfLines={1} style={styles.name}>
              {item.product}
            </AppText>
            <Badge label={categoryLabels[item.category]} tone={categoryTone[item.category]} small />
          </View>
          <AppText variant="caption" tone="secondary" numberOfLines={1}>
            {item.producer} · {item.distanceKm} km
          </AppText>
          <View style={styles.ratingRow}>
            <Icon name="star" size={13} color={Brand.amber} />
            <AppText variant="caption" tone="secondary">
              {formatNumber(item.rating, 1)}
            </AppText>
            <AppText variant="caption" tone="muted">
              · {item.location}
            </AppText>
          </View>
        </View>
      </View>

      <View style={styles.footer}>
        <View style={styles.priceBlock}>
          <AppText variant="caption" tone="muted">
            Preço por {item.unit}
          </AppText>
          <View style={styles.priceRow}>
            <AppText variant="heading" tone="brand">
              {formatCurrency(item.price)}
            </AppText>
            <View style={styles.trend}>
              <Icon
                name={trendUp ? 'trending-up' : trendDown ? 'trending-down' : 'minus'}
                size={14}
                color={trendColor}
              />
              <AppText variant="caption" style={{ color: trendColor }}>
                {item.trend === 0 ? 'estável' : formatSignedPercent(item.trend)}
              </AppText>
            </View>
          </View>
          <AppText variant="caption" tone="muted">
            {item.quantity}
          </AppText>
        </View>

        <Button
          label="Tenho interesse"
          size="sm"
          icon="handshake-outline"
          iconPosition="right"
          onPress={onContact}
        />
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: Spacing.three,
  },
  header: {
    flexDirection: 'row',
    gap: Spacing.two,
    alignItems: 'center',
  },
  iconBox: {
    width: 52,
    height: 52,
    borderRadius: Radii.md,
    backgroundColor: Brand.greenSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerText: {
    flex: 1,
    gap: 2,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.two,
  },
  name: {
    flex: 1,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: Spacing.two,
    borderTopWidth: 1,
    borderTopColor: Brand.border,
    paddingTop: Spacing.two,
  },
  priceBlock: {
    gap: 1,
    flex: 1,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: Spacing.two,
    flexWrap: 'wrap',
  },
  trend: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
});
