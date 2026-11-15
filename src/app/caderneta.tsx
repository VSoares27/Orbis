import { useFocusEffect } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';

import { ActivitySheet } from '@/components/activity-sheet';
import { Badge } from '@/components/ui/badge';
import { Button, IconButton } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { Icon } from '@/components/ui/icon';
import { Screen } from '@/components/ui/screen';
import { AppText } from '@/components/ui/text';
import { Brand, Radii, Spacing } from '@/constants/theme';
import { useActivities } from '@/hooks/use-activities';
import { useCrops } from '@/hooks/use-crops';
import {
  activityTypeIcons,
  activityTypeLabels,
  activityTypeTones,
  activityTypes,
} from '@/lib/activities';
import { formatActivityDate, formatDayMonth } from '@/lib/format';
import type { FieldActivity, FieldActivityType, IconName } from '@/types';

type FilterKey = 'todas' | FieldActivityType;

const filters: { key: FilterKey; label: string }[] = [
  { key: 'todas', label: 'Todas' },
  ...activityTypes.map((type) => ({ key: type, label: activityTypeLabels[type] })),
];

const toneColors = {
  green: { color: Brand.green, background: Brand.greenSoft },
  amber: { color: Brand.amber, background: Brand.amberSoft },
  sky: { color: Brand.sky, background: Brand.skySoft },
  neutral: { color: Brand.textSecondary, background: Brand.cream },
} as const;

export default function CadernetaScreen() {
  const { crops } = useCrops();
  const { activities, loading, error, reload, addActivity, removeActivity } = useActivities();
  const [filter, setFilter] = useState<FilterKey>('todas');
  const [formVisible, setFormVisible] = useState(false);

  useFocusEffect(
    useCallback(() => {
      void reload();
    }, [reload]),
  );

  const filtered = useMemo(
    () =>
      filter === 'todas'
        ? activities
        : activities.filter((activity) => activity.type === filter),
    [activities, filter],
  );

  const now = new Date();
  const thisMonth = activities.filter((activity) => {
    const date = new Date(activity.occurredAt);
    return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
  }).length;
  const lastActivity = activities[0];

  function countFor(key: FilterKey) {
    return key === 'todas'
      ? activities.length
      : activities.filter((activity) => activity.type === key).length;
  }

  function confirmRemove(activity: FieldActivity) {
    Alert.alert(
      'Excluir registro',
      `Remover "${activityTypeLabels[activity.type]}" de ${activity.cropName}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: () => {
            void removeActivity(activity.id).catch((cause: unknown) => {
              Alert.alert(
                'Não foi possível excluir',
                cause instanceof Error ? cause.message : 'Tente novamente em instantes.',
              );
            });
          },
        },
      ],
    );
  }

  return (
    <Screen>
      <View style={styles.header}>
        <View style={styles.headerText}>
          <AppText variant="title">Caderneta do campo</AppText>
          <AppText variant="caption" tone="secondary">
            Anote irrigação, adubação e outros manejos de cada lavoura.
          </AppText>
        </View>
        <Button
          label="Novo"
          size="sm"
          icon="plus"
          onPress={() => setFormVisible(true)}
          disabled={crops.length === 0}
        />
      </View>

      <Card variant="soft" style={styles.databaseCard}>
        <View style={styles.databaseIcon}>
          <Icon name="database" size={20} color={Brand.green} />
        </View>
        <View style={styles.databaseText}>
          <AppText variant="label">Banco local SQLite</AppText>
          <AppText variant="caption" tone="secondary">
            Lavouras e manejos ficam salvos no aparelho, mesmo sem internet.
          </AppText>
        </View>
        <Badge label="orbis.db" tone="green" small />
      </Card>

      <Card style={styles.summary}>
        <SummaryStat
          icon="notebook-outline"
          value={`${activities.length}`}
          label="registros"
        />
        <View style={styles.summaryDivider} />
        <SummaryStat
          icon="calendar-month-outline"
          value={`${thisMonth}`}
          label="este mês"
        />
        <View style={styles.summaryDivider} />
        <SummaryStat
          icon="clock-outline"
          value={lastActivity ? formatDayMonth(lastActivity.occurredAt.slice(0, 10)) : '—'}
          label="último"
        />
      </Card>

      {error && (
        <Card variant="outline">
          <AppText variant="caption" tone="danger">
            Não foi possível acessar o banco local: {error}
          </AppText>
        </Card>
      )}

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filters}>
        {filters.map((item) => {
          const active = filter === item.key;
          return (
            <Pressable
              key={item.key}
              accessibilityRole="button"
              accessibilityState={{ selected: active }}
              accessibilityLabel={`Filtrar por ${item.label}`}
              onPress={() => setFilter(item.key)}
              style={({ pressed }) => [
                styles.filterChip,
                active && styles.filterChipActive,
                pressed && styles.pressed,
              ]}>
              <AppText
                variant="label"
                tone={active ? 'inverse' : 'secondary'}
                style={active && styles.filterChipTextActive}>
                {item.label} · {countFor(item.key)}
              </AppText>
            </Pressable>
          );
        })}
      </ScrollView>

      {loading && activities.length === 0 && (
        <Card style={styles.loading}>
          <ActivityIndicator color={Brand.green} />
          <AppText variant="caption" tone="secondary">
            Carregando a caderneta...
          </AppText>
        </Card>
      )}

      <View style={styles.list}>
        {filtered.map((activity) => (
          <ActivityCard
            key={activity.id}
            activity={activity}
            onRemove={() => confirmRemove(activity)}
          />
        ))}
      </View>

      {!loading && filtered.length === 0 && (
        <Card>
          <EmptyState
            icon="notebook-outline"
            title={activities.length === 0 ? 'Caderneta vazia' : 'Nenhum registro neste filtro'}
            description={
              activities.length === 0
                ? 'Registre o primeiro manejo para começar o histórico da propriedade.'
                : 'Troque o filtro para ver outros manejos registrados.'
            }
          />
        </Card>
      )}

      <Card variant="cream" style={styles.tipCard}>
        <View style={styles.tipHeader}>
          <Icon name="lightbulb-on-outline" size={20} color={Brand.amber} />
          <AppText variant="label" tone="amber">
            POR QUE ANOTAR?
          </AppText>
        </View>
        <AppText variant="body" tone="secondary">
          O histórico ajuda a comparar resultados entre ciclos, planejar a próxima safra e
          comprovar boas práticas de manejo.
        </AppText>
      </Card>

      {formVisible && (
        <ActivitySheet
          crops={crops}
          visible
          onClose={() => setFormVisible(false)}
          onSave={addActivity}
        />
      )}
    </Screen>
  );
}

function SummaryStat({
  icon,
  value,
  label,
}: {
  icon: IconName;
  value: string;
  label: string;
}) {
  return (
    <View style={styles.summaryItem}>
      <Icon name={icon} size={18} color={Brand.green} />
      <AppText variant="subtitle" style={styles.summaryValue}>
        {value}
      </AppText>
      <AppText variant="caption" tone="secondary" numberOfLines={1}>
        {label}
      </AppText>
    </View>
  );
}

function ActivityCard({
  activity,
  onRemove,
}: {
  activity: FieldActivity;
  onRemove: () => void;
}) {
  const colors = toneColors[activityTypeTones[activity.type]];

  return (
    <Card style={styles.activityCard}>
      <View style={styles.activityHeader}>
        <View style={[styles.activityIcon, { backgroundColor: colors.background }]}>
          <Icon name={activityTypeIcons[activity.type]} size={20} color={colors.color} />
        </View>

        <View style={styles.activityText}>
          <AppText variant="subtitle" numberOfLines={1}>
            {activityTypeLabels[activity.type]}
          </AppText>
          <AppText variant="caption" tone="secondary" numberOfLines={1}>
            {activity.cropName} · {formatActivityDate(activity.occurredAt)}
          </AppText>
        </View>

        <IconButton
          icon="trash-can-outline"
          accessibilityLabel={`Excluir registro de ${activityTypeLabels[activity.type]}`}
          onPress={onRemove}
          size={36}
          iconSize={18}
          background={Brand.cream}
          color={Brand.textSecondary}
        />
      </View>

      {activity.notes.length > 0 && (
        <AppText variant="body" tone="secondary">
          {activity.notes}
        </AppText>
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.two,
    paddingTop: Spacing.one,
  },
  headerText: {
    flex: 1,
    gap: 2,
  },
  databaseCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  databaseIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: Brand.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  databaseText: {
    flex: 1,
    gap: 1,
  },
  summary: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.three,
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
  },
  summaryValue: {
    fontSize: 18,
    lineHeight: 24,
  },
  summaryDivider: {
    width: 1,
    height: 44,
    backgroundColor: Brand.border,
  },
  filters: {
    gap: Spacing.two,
    paddingRight: Spacing.three,
  },
  filterChip: {
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.three,
    borderRadius: Radii.pill,
    backgroundColor: Brand.surface,
    borderWidth: 1,
    borderColor: Brand.border,
  },
  filterChipActive: {
    backgroundColor: Brand.green,
    borderColor: Brand.green,
  },
  filterChipTextActive: {
    fontWeight: '700',
  },
  pressed: {
    opacity: 0.75,
  },
  loading: {
    alignItems: 'center',
    gap: Spacing.two,
  },
  list: {
    gap: Spacing.two,
  },
  activityCard: {
    gap: Spacing.two,
  },
  activityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  activityIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activityText: {
    flex: 1,
    gap: 1,
  },
  tipCard: {
    gap: Spacing.two,
  },
  tipHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
});
