import { AlertBanner } from '@/components/alert-banner';
import { DataSourceNote } from '@/components/data-source-note';
import { StatTile } from '@/components/stat-tile';
import { BarChart, type BarDatum } from '@/components/ui/bar-chart';
import { IconButton } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Icon } from '@/components/ui/icon';
import { Screen } from '@/components/ui/screen';
import { SectionHeader } from '@/components/ui/section-header';
import { AppText } from '@/components/ui/text';
import { WeatherHero } from '@/components/weather-hero';
import { Brand, Radii, Spacing } from '@/constants/theme';
import { useNasaClimate } from '@/hooks/use-nasa-climate';
import {
  average,
  irrigationAdvice,
  lastNDays,
  latestDay,
  temperatureRange,
  totalRain,
} from '@/lib/climate';
import { formatWeekday } from '@/lib/format';
import type { IconName } from '@/types';
import { ActivityIndicator, RefreshControl, StyleSheet, View } from 'react-native';

type Tone = 'green' | 'amber' | 'sky';

type Insight = {
  icon: IconName;
  title: string;
  description: string;
  tone: Tone;
};

export default function ClimateScreen() {
  const { snapshot, loading, error, refresh } = useNasaClimate();

  const today = latestDay(snapshot);

  // Sem nenhum dia na série: mostra carregamento ou um estado vazio com opção de tentar de novo.
  if (!today) {
    return (
      <Screen
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={refresh}
            tintColor={Brand.green}
            colors={[Brand.green]}
          />
        }>
        <View style={{ alignItems: 'center', justifyContent: 'center', gap: 12, paddingTop: 80 }}>
          {loading ? (
            <ActivityIndicator size="large" color={Brand.green} />
          ) : (
            <>
              <AppText variant="subtitle">Sem dados de clima</AppText>
              <AppText variant="caption" tone="secondary" style={{ textAlign: 'center' }}>
                {error ?? 'Não foi possível carregar a série de clima.'}
              </AppText>
              <IconButton
                icon="refresh"
                accessibilityLabel="Tentar novamente"
                onPress={refresh}
                background={Brand.greenSoft}
                color={Brand.green}
              />
            </>
          )}
        </View>
      </Screen>
    );
  }

  const week = lastNDays(snapshot, 7);
  const rainWeek = totalRain(week);
  const range = temperatureRange(week);
  const avgHumidity = average(week, (day) => day.humidityAvg);
  const avgWind = average(week, (day) => day.windAvg);
  const avgSolar = average(week, (day) => day.solarKwh);
  const avgEvapotranspiration = average(week, (day) => day.evapotranspirationMm);
  const avgTemperature = average(week, (day) => day.tempAvg);
  const advice = irrigationAdvice(today);

  // Barras de chuva: a última leitura recebida fica destacada.
  const rainBars: BarDatum[] = week.map((day, index) => ({
    label: formatWeekday(day.date),
    value: day.rainMm,
    highlight: index === week.length - 1,
  }));

  const insights: Insight[] = [
    {
      icon: advice.level === 'ok' ? 'water-check-outline' : 'water-alert-outline',
      title: advice.title,
      description: advice.description,
      tone: advice.level === 'alta' ? 'amber' : 'sky',
    },
    {
      icon: 'weather-windy',
      title: avgWind > 10 ? 'Evite pulverização hoje' : 'Boa janela para pulverização',
      description:
        avgWind > 10
          ? `Vento médio de ${avgWind} km/h pode causar deriva do produto.`
          : `Vento médio de ${avgWind} km/h, dentro da faixa segura para aplicações.`,
      tone: avgWind > 10 ? 'amber' : 'green',
    },
    {
      icon: 'bug-outline',
      title:
        avgHumidity >= 80 ? 'Atenção a doenças fúngicas' : 'Risco fúngico sob controle',
      description:
        avgHumidity >= 80
          ? `Umidade média de ${avgHumidity}% favorece fungos. Vistorie as folhas baixas.`
          : `Umidade média de ${avgHumidity}%, sem alerta forte para fungos nesta semana.`,
      tone: avgHumidity >= 80 ? 'amber' : 'green',
    },
    {
      icon: 'white-balance-sunny',
      title: avgSolar >= 5 ? 'Boa condição de secagem' : 'Secagem mais lenta',
      description:
        avgSolar >= 5
          ? 'A radiação solar favorece a secagem de grãos e a fotossíntese.'
          : 'A baixa radiação pede mais cuidado ao secar grãos e ao manejar mudas.',
      tone: avgSolar >= 5 ? 'green' : 'sky',
    },
  ];

  return (
    <Screen
      refreshControl={
        <RefreshControl
          refreshing={loading}
          onRefresh={refresh}
          tintColor={Brand.green}
          colors={[Brand.green]}
        />
      }>
      <View style={styles.header}>
        <View style={styles.headerText}>
          <AppText variant="title">Clima & Solo</AppText>
          <AppText variant="caption" tone="secondary">
            {snapshot.location.label} · {snapshot.location.city} - {snapshot.location.state}
          </AppText>
        </View>
        <IconButton
          icon="refresh"
          accessibilityLabel="Atualizar dados da NASA POWER"
          onPress={refresh}
          background={Brand.greenSoft}
          color={Brand.green}
        />
      </View>

      {error && (
        <AlertBanner
          severity="info"
          title="Modo demonstração"
          message={error}
          actionLabel="Tentar novamente"
          onPress={refresh}
        />
      )}

      <WeatherHero
        day={today}
        location={snapshot.location}
        source={snapshot.source}
        updatedAt={snapshot.updatedAt}
        loading={loading}
      />

      <Card style={styles.chartCard}>
        <SectionHeader
          title="Chuva nos últimos 7 dias"
          subtitle="Precipitação diária observada por satélite"
        />

        <View style={styles.chartSummary}>
          <AppText variant="title" tone="sky">
            {rainWeek} mm
          </AppText>
          <AppText variant="caption" tone="secondary">
            acumulado no período
          </AppText>
        </View>

        <BarChart
          data={rainBars}
          height={110}
          color={Brand.sky}
          highlightColor={Brand.green}
          formatValue={(value) => `${Math.round(value)}`}
        />

        <View style={styles.legend}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: Brand.sky }]} />
            <AppText variant="caption" tone="secondary">
              Chuva (mm)
            </AppText>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: Brand.green }]} />
            <AppText variant="caption" tone="secondary">
              Última leitura
            </AppText>
          </View>
        </View>
      </Card>

      <View style={styles.section}>
        <SectionHeader
          title="Indicadores da semana"
          subtitle="Médias calculadas a partir dos dados NASA POWER"
        />

        <View style={styles.statsGrid}>
          <StatTile
            icon="thermometer"
            label="Temperatura média"
            value={`${avgTemperature}`}
            unit="°C"
            tone="amber"
          />
          <StatTile
            icon="thermometer-lines"
            label="Amplitude térmica"
            value={`${Math.round((range.max - range.min) * 10) / 10}`}
            unit="°C"
            tone="amber"
          />
          <StatTile
            icon="water-percent"
            label="Umidade relativa"
            value={`${avgHumidity}`}
            unit="%"
            tone="sky"
          />
          <StatTile
            icon="weather-windy"
            label="Vento médio"
            value={`${avgWind}`}
            unit="km/h"
            tone="green"
          />
          <StatTile
            icon="white-balance-sunny"
            label="Radiação solar"
            value={`${avgSolar}`}
            unit="kWh/m²"
            tone="amber"
          />
          <StatTile
            icon="water-outline"
            label="Evapotranspiração"
            value={`${avgEvapotranspiration}`}
            unit="mm/dia"
            tone="sky"
          />
        </View>
      </View>

      <Card variant="default" style={styles.insightsCard}>
        <SectionHeader
          title="O que isso significa"
          subtitle="Leitura prática para a sua lavoura"
        />

        <View style={styles.insights}>
          {insights.map((insight) => (
            <View key={insight.title} style={styles.insight}>
              <View
                style={[
                  styles.insightIcon,
                  { backgroundColor: toneBackground[insight.tone] },
                ]}>
                <Icon name={insight.icon} size={20} color={toneColor[insight.tone]} />
              </View>
              <View style={styles.insightText}>
                <AppText variant="bodyBold">{insight.title}</AppText>
                <AppText variant="caption" tone="secondary">
                  {insight.description}
                </AppText>
              </View>
            </View>
          ))}
        </View>
      </Card>

      <Card variant="outline" style={styles.noteCard}>
        <Icon name="information-outline" size={20} color={Brand.sky} />
        <View style={styles.noteText}>
          <AppText variant="label">Dados observados, não previsão</AppText>
          <AppText variant="caption" tone="secondary">
            A NASA POWER entrega medições e reanálises por satélite. Para previsão de curto prazo,
            conecte um serviço meteorológico ao backend.
          </AppText>
        </View>
      </Card>

      <DataSourceNote
        source={snapshot.source}
        updatedAt={snapshot.updatedAt}
        loading={loading}
        onRefresh={refresh}
      />
    </Screen>
  );
}

const toneColor: Record<Tone, string> = {
  green: Brand.green,
  amber: Brand.amber,
  sky: Brand.sky,
};

const toneBackground: Record<Tone, string> = {
  green: Brand.greenSoft,
  amber: Brand.amberSoft,
  sky: Brand.skySoft,
};

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
  chartCard: {
    gap: Spacing.two,
  },
  chartSummary: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: Spacing.two,
  },
  legend: {
    flexDirection: 'row',
    gap: Spacing.three,
    marginTop: Spacing.one,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  section: {
    gap: Spacing.two,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  insightsCard: {
    gap: Spacing.three,
  },
  insights: {
    gap: Spacing.three,
  },
  insight: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  insightIcon: {
    width: 40,
    height: 40,
    borderRadius: Radii.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  insightText: {
    flex: 1,
    gap: 2,
  },
  noteCard: {
    flexDirection: 'row',
    gap: Spacing.two,
    backgroundColor: Brand.skySoft,
    borderColor: Brand.skySoft,
  },
  noteText: {
    flex: 1,
    gap: 2,
  },
});
