import { StyleSheet, View } from 'react-native';

import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Icon } from './ui/icon';
import { ProgressBar } from './ui/progress-bar';
import { AppText } from './ui/text';

import { Brand, Radii, Spacing } from '@/constants/theme';
import { cropStatusLabels } from '@/data/mock';
import { formatDayMonth, formatNumber } from '@/lib/format';
import type { Crop, CropStatus } from '@/types';

type CropCardProps = {
  crop: Crop;
  expanded?: boolean;
  onToggleDetails?: () => void;
  onManage?: () => void;
};

const statusStyles: Record<
  CropStatus,
  { badge: 'green' | 'amber' | 'sky'; color: string; background: string }
> = {
  saudavel: { badge: 'green', color: Brand.green, background: Brand.greenSoft },
  atencao: { badge: 'amber', color: Brand.amber, background: Brand.amberSoft },
  colheita: { badge: 'sky', color: Brand.sky, background: Brand.skySoft },
};

/** Card de lavoura com progresso, próxima ação e detalhes expansíveis. */
export function CropCard({ crop, expanded, onToggleDetails, onManage }: CropCardProps) {
  const status = statusStyles[crop.status];

  return (
    <Card style={styles.card}>
      <View style={styles.header}>
        <View style={[styles.iconBox, { backgroundColor: status.background }]}>
          <Icon name={crop.icon} size={26} color={status.color} />
        </View>

        <View style={styles.headerText}>
          <View style={styles.titleRow}>
            <AppText variant="subtitle" numberOfLines={1} style={styles.name}>
              {crop.name}
            </AppText>
            <Badge label={cropStatusLabels[crop.status]} tone={status.badge} small />
          </View>
          <AppText variant="caption" tone="secondary">
            {crop.variety} · {formatNumber(crop.areaHectares, 2)} ha
          </AppText>
        </View>
      </View>

      <View style={styles.progressBlock}>
        <View style={styles.progressLabels}>
          <AppText variant="caption" tone="secondary">
            Progresso do ciclo
          </AppText>
          <AppText variant="caption" tone="brand" style={styles.progressValue}>
            {crop.progress}%
          </AppText>
        </View>
        <ProgressBar value={crop.progress} color={status.color} trackColor={status.background} />
      </View>

      <View style={styles.metaRow}>
        <Meta
          icon="calendar-check-outline"
          label="Colheita prevista"
          value={formatDayMonth(crop.harvestForecast)}
        />
        <View style={styles.metaDivider} />
        <Meta
          icon="water-outline"
          label="Irrigação recomendada"
          value={`${formatNumber(crop.irrigation.recommendedMm, 0)} mm`}
        />
      </View>

      <View style={styles.nextAction}>
        <Icon name="clipboard-check-outline" size={18} color={Brand.green} />
        <View style={styles.nextActionText}>
          <AppText variant="caption" tone="muted">
            Próxima ação
          </AppText>
          <AppText variant="label">{crop.nextAction}</AppText>
        </View>
      </View>

      {expanded && (
        <View style={styles.notes}>
          <AppText variant="caption" tone="secondary">
            {crop.notes}
          </AppText>
          <AppText variant="caption" tone="muted">
            Plantio em {formatDayMonth(crop.plantedAt)} · necessidade de {crop.irrigation.needMm} mm
          </AppText>
        </View>
      )}

      <View style={styles.actions}>
        <Button
          label={expanded ? 'Ocultar' : 'Ver detalhes'}
          variant="secondary"
          size="sm"
          icon={expanded ? 'chevron-up' : 'chevron-down'}
          onPress={onToggleDetails}
          style={styles.actionButton}
        />
        <Button
          label="Registrar manejo"
          variant="outline"
          size="sm"
          icon="pencil-outline"
          onPress={onManage}
          style={styles.actionButton}
        />
      </View>
    </Card>
  );
}

function Meta({
  icon,
  label,
  value,
}: {
  icon: 'calendar-check-outline' | 'water-outline';
  label: string;
  value: string;
}) {
  return (
    <View style={styles.meta}>
      <Icon name={icon} size={18} color={Brand.textSecondary} />
      <View>
        <AppText variant="caption" tone="muted">
          {label}
        </AppText>
        <AppText variant="bodyBold">{value}</AppText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: Spacing.three,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  iconBox: {
    width: 52,
    height: 52,
    borderRadius: Radii.md,
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
  progressBlock: {
    gap: 6,
  },
  progressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  progressValue: {
    fontWeight: '700',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Brand.cream,
    borderRadius: Radii.md,
    padding: Spacing.two,
  },
  meta: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaDivider: {
    width: 1,
    height: 30,
    backgroundColor: Brand.border,
    marginHorizontal: Spacing.one,
  },
  nextAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    backgroundColor: Brand.greenSoft,
    borderRadius: Radii.md,
    padding: Spacing.two,
  },
  nextActionText: {
    flex: 1,
    gap: 1,
  },
  notes: {
    gap: 6,
    padding: Spacing.two,
    borderRadius: Radii.md,
    borderWidth: 1,
    borderColor: Brand.border,
    borderStyle: 'dashed',
  },
  actions: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  actionButton: {
    flex: 1,
  },
});
