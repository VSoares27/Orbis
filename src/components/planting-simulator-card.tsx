import DateTimePicker from '@react-native-community/datetimepicker';
import { useMemo, useState } from 'react';
import { ActivityIndicator, Platform, Pressable, StyleSheet, View } from 'react-native';

import { StatTile } from '@/components/stat-tile';
import { Badge } from '@/components/ui/badge';
import { BarChart, type BarDatum } from '@/components/ui/bar-chart';
import { Card } from '@/components/ui/card';
import { Icon } from '@/components/ui/icon';
import { SectionHeader } from '@/components/ui/section-header';
import { AppText } from '@/components/ui/text';
import { Brand, Radii, Spacing } from '@/constants/theme';
import { useNasaProjection } from '@/hooks/use-nasa-projection';
import {
  CROP_PRESETS,
  simulatePlanting,
  type CropPresetId,
} from '@/lib/planting-simulator';
import { formatSignedNumber, SCENARIOS } from '@/lib/projection';
import type { ClimateScenario } from '@/types';

const CROPS_LIST: CropPresetId[] = ['milho', 'feijao', 'soja', 'mandioca'];

const FARMER_SCENARIO_LABELS: Record<ClimateScenario, string> = {
  ssp126: 'Mais chuva',
  ssp245: 'Normal',
  ssp370: 'Mais seco',
};

function formatDateBR(date: Date): string {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

export function PlantingSimulatorCard() {
  const [cropId, setCropId] = useState<CropPresetId>('milho');
  const [dateObj, setDateObj] = useState<Date>(() => new Date(2027, 2, 15)); // 15/03/2027
  const [showPicker, setShowPicker] = useState(false);
  const [scenario, setScenario] = useState<ClimateScenario>('ssp245');

  const plantingDate = useMemo(() => formatDateBR(dateObj), [dateObj]);
  const startYear = Math.max(2025, Math.min(2096, dateObj.getFullYear()));

  const { projection, loading, error } = useNasaProjection(startYear, scenario);

  const simulation = useMemo(() => {
    if (!projection) return null;
    return simulatePlanting(projection, cropId, plantingDate);
  }, [projection, cropId, plantingDate]);

  const chartData: BarDatum[] = useMemo(() => {
    if (!simulation) return [];
    const selectedStart = simulation.selectedWindow.startMonth;
    const cycleSet = new Set(
      Array.from(
        { length: simulation.crop.cycleMonths },
        (_, i) => ((selectedStart - 1 + i) % 12) + 1,
      ),
    );

    return simulation.allWindows.map((win) => ({
      label: win.startMonthLabel,
      value: win.cycleMonths[0]?.projectedRainMm ?? 0,
      highlight: cycleSet.has(win.startMonth),
    }));
  }, [simulation]);

function handleValueChange(_event: unknown, selected?: Date) {
    if (Platform.OS !== 'ios') {
      setShowPicker(false);
    }
    if (selected) {
      setDateObj(selected);
    }
  }

  const statusTone =
    simulation?.selectedWindow.status === 'ideal'
      ? 'green'
      : simulation?.selectedWindow.status === 'moderado'
        ? 'amber'
        : 'red';

  const statusLabel =
    simulation?.selectedWindow.status === 'ideal'
      ? 'Época boa'
      : simulation?.selectedWindow.status === 'moderado'
        ? 'Atenção'
        : 'Risco alto';

  return (
    <Card style={styles.container}>
      <SectionHeader
        title="Simulador de Plantio"
        subtitle="Veja como o clima deve se comportar na sua safra"
      />

      {/* Seletor de Cultura */}
      <View style={styles.field}>
        <AppText variant="label" tone="secondary">
          1. O que você vai plantar?
        </AppText>
        <View style={styles.chipRow}>
          {CROPS_LIST.map((id) => {
            const active = cropId === id;
            return (
              <Pressable
                key={id}
                onPress={() => setCropId(id)}
                style={[styles.chip, active && styles.chipActive]}>
                <AppText variant="label" tone={active ? 'inverse' : 'secondary'}>
                  {CROP_PRESETS[id].name}
                </AppText>
              </Pressable>
            );
          })}
        </View>
      </View>

      {/* Data pretendida + Condição do clima */}
      <View style={styles.rowInputs}>
        <View style={[styles.field, { flex: 1 }]}>
          <AppText variant="label" tone="secondary">
            2. Quando vai plantar?
          </AppText>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Escolher data de plantio no calendário"
            onPress={() => setShowPicker((prev) => !prev)}
            style={styles.dateButton}>
            <Icon name="calendar-outline" size={16} color={Brand.green} />
            <AppText variant="label">{plantingDate}</AppText>
          </Pressable>
        </View>

        <View style={[styles.field, { flex: 1.3 }]}>
          <AppText variant="label" tone="secondary">
            3. Como estará o ano?
          </AppText>
          <View style={styles.chipRow}>
            {SCENARIOS.map((sc) => {
              const active = scenario === sc;
              return (
                <Pressable
                  key={sc}
                  onPress={() => setScenario(sc)}
                  style={[styles.chipSmall, active && styles.chipActive]}>
                  <AppText variant="caption" tone={active ? 'inverse' : 'secondary'}>
                    {FARMER_SCENARIO_LABELS[sc]}
                  </AppText>
                </Pressable>
              );
            })}
          </View>
        </View>
      </View>

      {showPicker && (
        <View style={styles.pickerContainer}>
          <DateTimePicker
            value={dateObj}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            minimumDate={new Date()}
            maximumDate={new Date(2096, 11, 31)}
            locale="pt-BR"
            onValueChange={handleValueChange}
            onDismiss={() => setShowPicker(false)}
          />
          {Platform.OS === 'ios' && (
            <Pressable onPress={() => setShowPicker(false)} style={styles.pickerDoneButton}>
              <AppText variant="label" tone="brand">
                Confirmar data
              </AppText>
            </Pressable>
          )}
        </View>
      )}

      {loading && !simulation ? (
        <View style={styles.loadingBox}>
          <ActivityIndicator color={Brand.green} />
          <AppText variant="caption" tone="secondary">
            Consultando dados de chuva e temperatura da região...
          </AppText>
        </View>
      ) : simulation ? (
        <>
          {/* Resultado Principal */}
          <View style={styles.scoreBox}>
            <View style={styles.scoreHeader}>
              <View style={{ flex: 1 }}>
                <AppText variant="caption" tone="secondary">
                  Plantio em {simulation.selectedWindow.startMonthLabel} · Colheita em{' '}
                  {simulation.selectedWindow.harvestMonthLabel}
                </AppText>
                <AppText variant="title" tone={statusTone === 'green' ? 'brand' : 'amber'}>
                  Nota {simulation.selectedWindow.score} de 100
                </AppText>
              </View>
              <Badge label={statusLabel} tone={statusTone === 'red' ? 'amber' : statusTone} />
            </View>

            {simulation.bestWindow.startMonth !== simulation.selectedWindow.startMonth && (
              <View style={styles.bestWindowBanner}>
                <Icon name="calendar-star" size={18} color={Brand.green} />
                <AppText variant="caption" style={{ flex: 1 }}>
                  <AppText variant="label" tone="brand">
                    Melhor época para plantar:{' '}
                  </AppText>
                  começando em <AppText variant="label">{simulation.bestWindow.startMonthLabel}</AppText>{' '}
                  a chance de boa colheita sobe para{' '}
                  <AppText variant="label" tone="brand">
                    {simulation.bestWindow.score}/100
                  </AppText>{' '}
                  (com {simulation.bestWindow.projectedRainTotal} mm de chuva).
                </AppText>
              </View>
            )}
          </View>

          {/* Comparativo com os Últimos Anos */}
          <View style={styles.statsRow}>
            <StatTile
              icon="weather-rainy"
              label={`Chuva na safra (${formatSignedNumber(simulation.selectedWindow.rainDeltaPercent, 0)}%)`}
              value={`${simulation.selectedWindow.projectedRainTotal}`}
              unit={`mm (antes ${simulation.selectedWindow.baselineRainTotal})`}
              tone="sky"
            />
            <StatTile
              icon="thermometer"
              label={`Calor médio (${formatSignedNumber(simulation.selectedWindow.tempDeltaC, 1)}°C)`}
              value={`${simulation.selectedWindow.projectedTempAvg}`}
              unit={`°C (antes ${simulation.selectedWindow.baselineTempAvg})`}
              tone="amber"
            />
          </View>

          {/* Gráfico Anual */}
          <View style={styles.chartSection}>
            <AppText variant="label">
              Chuva esperada por mês (em verde: meses da sua safra de{' '}
              {simulation.crop.name.toLowerCase()})
            </AppText>
            <BarChart
              data={chartData}
              height={105}
              color={Brand.sky}
              highlightColor={Brand.green}
              formatValue={(v) => `${Math.round(v)}`}
            />
          </View>

          {/* Dicas práticas */}
          <View style={styles.adviceList}>
            {simulation.selectedWindow.recommendations.map((rec) => (
              <View key={rec} style={styles.adviceRow}>
                <Icon name="check-circle-outline" size={16} color={Brand.green} />
                <AppText variant="caption" tone="secondary" style={{ flex: 1 }}>
                  {rec}
                </AppText>
              </View>
            ))}
          </View>
        </>
      ) : (
        error && (
          <AppText variant="caption" tone="danger">
            Não foi possível carregar os dados do clima agora. Tente novamente.
          </AppText>
        )
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  container: { gap: Spacing.three },
  field: { gap: 6 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  rowInputs: { flexDirection: 'row', gap: Spacing.two },
  chip: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: Radii.pill,
    backgroundColor: Brand.cream,
    borderWidth: 1,
    borderColor: Brand.border,
  },
  chipSmall: {
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: Radii.pill,
    backgroundColor: Brand.cream,
    borderWidth: 1,
    borderColor: Brand.border,
  },
  chipActive: {
    backgroundColor: Brand.green,
    borderColor: Brand.green,
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Brand.cream,
    borderWidth: 1,
    borderColor: Brand.border,
    borderRadius: Radii.md,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  pickerContainer: {
    backgroundColor: Brand.cream,
    borderRadius: Radii.md,
    padding: Spacing.two,
    borderWidth: 1,
    borderColor: Brand.border,
  },
  pickerDoneButton: {
    alignSelf: 'flex-end',
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  loadingBox: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.four,
    gap: 8,
  },
  scoreBox: {
    backgroundColor: Brand.cream,
    borderRadius: Radii.md,
    padding: Spacing.three,
    gap: Spacing.two,
  },
  scoreHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.two,
  },
  bestWindowBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Brand.greenSoft,
    padding: Spacing.two,
    borderRadius: Radii.sm,
  },
  statsRow: { flexDirection: 'row', gap: Spacing.two },
  chartSection: { gap: Spacing.one },
  adviceList: { gap: 6 },
  adviceRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 6 },
});