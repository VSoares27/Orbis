import { StyleSheet, View } from 'react-native';

import { Badge } from './ui/badge';
import { Icon } from './ui/icon';
import { AppText } from './ui/text';

import { Brand, Gradients, Radii, Spacing } from '@/constants/theme';
import { conditionLabels } from '@/data/mock';
import { formatDayMonth, formatUpdatedAt, formatWeekday } from '@/lib/format';
import { weatherIconMap } from '@/lib/weather-icons';
import type { ClimateSource, DailyClimate, FarmLocation } from '@/types';

type WeatherHeroProps = {
  day: DailyClimate;
  location: FarmLocation;
  source: ClimateSource;
  updatedAt: string;
  /** Quando true, mostra um rótulo de carregamento discreto. */
  loading?: boolean;
};

/**
 * Cartão principal de clima.
 * Usa gradiente verde da marca e destaca a temperatura + 3 métricas rápidas.
 */
export function WeatherHero({ day, location, source, updatedAt, loading }: WeatherHeroProps) {
  const weather = weatherIconMap[day.condition];

  return (
    <View style={styles.hero}>
      {/* Círculos decorativos (não capturam toque). */}
      <View pointerEvents="none" style={styles.circleLarge} />
      <View pointerEvents="none" style={styles.circleSmall} />

      <View style={styles.topRow}>
        <View style={styles.location}>
          <Icon name="map-marker-outline" size={14} color="rgba(244,239,230,0.85)" />
          <AppText variant="caption" tone="inverse" numberOfLines={1} style={styles.locationText}>
            {location.label} · {location.city} - {location.state}
          </AppText>
        </View>
        <Badge label={source === 'nasa' ? 'NASA POWER' : 'DEMO'} tone="inverse" small />
      </View>

      <View style={styles.mainRow}>
        <View style={styles.tempBlock}>
          <AppText variant="caption" style={styles.overline}>
            {loading ? 'ATUALIZANDO...' : `${formatWeekday(day.date).toUpperCase()}, ${formatDayMonth(day.date).toUpperCase()}`}
          </AppText>
          <View style={styles.tempRow}>
            <AppText style={styles.temperature}>{Math.round(day.tempAvg)}</AppText>
            <AppText style={styles.degree}>°C</AppText>
          </View>
          <AppText variant="subtitle" tone="inverse">
            {conditionLabels[day.condition]}
          </AppText>
          <AppText variant="caption" style={styles.range}>
            Máx. {Math.round(day.tempMax)}° · Mín. {Math.round(day.tempMin)}°
          </AppText>
        </View>

        <View style={styles.weatherIcon}>
          <Icon name={weather.icon} size={72} color={Brand.cream} />
        </View>
      </View>

      <View style={styles.metrics}>
        <Metric icon="water-outline" label="Chuva" value={`${day.rainMm} mm`} />
        <View style={styles.divider} />
        <Metric icon="water-percent" label="Umidade" value={`${Math.round(day.humidityAvg)}%`} />
        <View style={styles.divider} />
        <Metric icon="weather-windy" label="Vento" value={`${day.windAvg} km/h`} />
      </View>

      <AppText variant="caption" style={styles.updated}>
        Dados de {formatDayMonth(day.date)} · consulta em {formatUpdatedAt(updatedAt)}
      </AppText>
    </View>
  );
}

function Metric({ icon, label, value }: { icon: 'water-outline' | 'water-percent' | 'weather-windy'; label: string; value: string }) {
  return (
    <View style={styles.metric}>
      <Icon name={icon} size={16} color="rgba(244,239,230,0.8)" />
      <AppText variant="caption" style={styles.metricLabel}>
        {label}
      </AppText>
      <AppText variant="bodyBold" tone="inverse">
        {value}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  hero: {
    overflow: 'hidden',
    borderRadius: Radii.xl,
    padding: Spacing.four,
    gap: Spacing.three,
    // Fallback para plataformas sem suporte ao gradiente experimental.
    backgroundColor: Brand.green,
    experimental_backgroundImage: Gradients.green,
  },
  circleLarge: {
    position: 'absolute',
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: 'rgba(244,239,230,0.06)',
    top: -90,
    right: -60,
  },
  circleSmall: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(244,239,230,0.06)',
    bottom: -50,
    left: -30,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.two,
  },
  location: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    flex: 1,
  },
  locationText: {
    opacity: 0.9,
  },
  mainRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  tempBlock: {
    gap: 2,
    flex: 1,
  },
  overline: {
    color: 'rgba(244,239,230,0.75)',
    letterSpacing: 1,
    fontWeight: '700',
    fontSize: 11,
  },
  tempRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 2,
  },
  temperature: {
    color: Brand.cream,
    fontSize: 64,
    lineHeight: 68,
    fontWeight: '700',
    letterSpacing: -3,
  },
  degree: {
    color: Brand.cream,
    fontSize: 22,
    lineHeight: 30,
    fontWeight: '700',
    marginTop: 8,
  },
  range: {
    color: 'rgba(244,239,230,0.72)',
  },
  weatherIcon: {
    width: 96,
    height: 96,
    alignItems: 'center',
    justifyContent: 'center',
  },
  metrics: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(244,239,230,0.12)',
    borderRadius: Radii.md,
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.two,
  },
  metric: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
  },
  metricLabel: {
    color: 'rgba(244,239,230,0.7)',
    fontSize: 11,
  },
  divider: {
    width: 1,
    height: 28,
    backgroundColor: 'rgba(244,239,230,0.18)',
  },
  updated: {
    color: 'rgba(244,239,230,0.6)',
    fontSize: 10,
    textAlign: 'center',
  },
});
