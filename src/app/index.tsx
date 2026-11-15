import { router, useFocusEffect, type Href } from 'expo-router';
import { useCallback } from 'react';
import { ActivityIndicator, Alert, Pressable, RefreshControl, ScrollView, StyleSheet, View } from 'react-native';

import { AlertBanner } from '@/components/alert-banner';
import { DataSourceNote } from '@/components/data-source-note';
import { StatTile } from '@/components/stat-tile';
import { Badge } from '@/components/ui/badge';
import { Button, IconButton } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Icon } from '@/components/ui/icon';
import { ProgressBar } from '@/components/ui/progress-bar';
import { Screen } from '@/components/ui/screen';
import { SectionHeader } from '@/components/ui/section-header';
import { AppText } from '@/components/ui/text';
import { WeatherHero } from '@/components/weather-hero';
import { Brand, Radii, Spacing } from '@/constants/theme';
import { cropStatusLabels } from '@/data/mock';
import { useCrops } from '@/hooks/use-crops';
import { useNasaClimate } from '@/hooks/use-nasa-climate';
import { buildAlerts } from '@/lib/alerts';
import { irrigationAdvice, lastNDays, latestDay, totalRain } from '@/lib/climate';
import { formatDayMonth } from '@/lib/format';
import type { CropStatus, IconName } from '@/types';

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Bom dia';
  if (hour < 18) return 'Boa tarde';
  return 'Boa noite';
}

const quickActions: { label: string; icon: IconName; href: Href; tone: 'green' | 'sky' | 'amber' }[] = [
  { label: 'Clima', icon: 'weather-partly-cloudy', href: '/clima', tone: 'sky' },
  { label: 'Lavouras', icon: 'sprout', href: '/lavouras', tone: 'green' },
  { label: 'Caderneta', icon: 'notebook-outline', href: '/caderneta', tone: 'amber' },
  { label: 'Mercado', icon: 'storefront-outline', href: '/mercado', tone: 'amber' },
];

const cropStatusColor: Record<CropStatus, string> = {
  saudavel: Brand.green,
  atencao: Brand.amber,
  colheita: Brand.sky,
};

export default function HomeScreen() {
  const { snapshot, loading, error, refresh } = useNasaClimate();
  const { crops, reload } = useCrops();

  useFocusEffect(
    useCallback(() => {
      void reload();
    }, [reload]),
  );

  const today = latestDay(snapshot);

  if (!today) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 }}>
        {loading ? (
          <ActivityIndicator size="large" color={Brand.green} />
        ) : (
          <>
            <AppText variant="subtitle">Sem dados de clima</AppText>
            <Button label="Tentar novamente" onPress={() => void refresh()} />
          </>
        )}
      </View>
    );
  }

  const week = lastNDays(snapshot, 7);
  const rainWeek = totalRain(week);
  const advice = irrigationAdvice(today);
  const alerts = buildAlerts(snapshot);
  const mainAlert = alerts[0];
  const greeting = getGreeting();
  const { location } = snapshot;

  function showAlerts() {
    Alert.alert(
      'Alertas da propriedade',
      alerts.map((alert) => `• ${alert.title}`).join('\n'),
      [{ text: 'Entendi' }],
    );
  }

  return (
    <Screen
      refreshControl={
        <RefreshControl
          refreshing={loading}
          onRefresh={() => {
            void refresh();
            void reload();
          }}
          tintColor={Brand.green}
          colors={[Brand.green]}
        />
      }>
      {/* Cabeçalho com saudação, localização e notificações. */}
      <View style={styles.header}>
        <View style={styles.headerText}>
          <AppText variant="caption" tone="secondary" style={styles.greeting}>
            {greeting}
          </AppText>
          <AppText variant="title">{location.city}</AppText>
          <View style={styles.locationRow}>
            <Icon name="map-marker-outline" size={14} color={Brand.textSecondary} />
            <AppText variant="caption" tone="secondary">
              {location.label} · {location.state}
            </AppText>
          </View>
        </View>

        <IconButton
          icon="bell-outline"
          accessibilityLabel="Ver alertas"
          onPress={showAlerts}
          size={44}
          iconSize={22}
        />
      </View>

      <WeatherHero
        day={today}
        location={snapshot.location}
        source={snapshot.source}
        updatedAt={snapshot.updatedAt}
        loading={loading}
      />

      {error ? (
        <AlertBanner
          severity="info"
          title="Modo demonstração"
          message={error}
          actionLabel="Tentar novamente"
          onPress={() => void refresh()}
        />
      ) : (
        mainAlert && (
          <AlertBanner
            severity={mainAlert.severity}
            title={mainAlert.title}
            message={mainAlert.message}
            actionLabel={mainAlert.actionLabel}
            onPress={() => router.push((mainAlert.href ?? '/clima') as Href)}
          />
        )
      )}

      {/* Atalhos para as áreas principais. */}
      <View style={styles.quickActions}>
        {quickActions.map((action) => (
          <Pressable
            key={action.label}
            accessibilityRole="button"
            accessibilityLabel={`Abrir ${action.label}`}
            onPress={() => router.push(action.href)}
            style={({ pressed }) => [styles.quickAction, pressed && styles.pressed]}>
            <View
              style={[
                styles.quickActionIcon,
                { backgroundColor: toneBackground[action.tone] },
              ]}>
              <Icon name={action.icon} size={24} color={toneColor[action.tone]} />
            </View>
            <AppText variant="label" numberOfLines={1}>
              {action.label}
            </AppText>
          </Pressable>
        ))}
      </View>

      {/* Resumo rápido da semana com dados da NASA POWER. */}
      <View style={styles.statRow}>
        <StatTile
          icon="weather-rainy"
          label="Chuva nos últimos 7 dias"
          value={`${rainWeek}`}
          unit="mm"
          tone="sky"
        />
        <StatTile
          icon="white-balance-sunny"
          label="Radiação solar na última leitura"
          value={`${today.solarKwh}`}
          unit="kWh/m²"
          tone="amber"
        />
      </View>

      <View style={styles.section}>
        <SectionHeader
          title="Suas lavouras"
          subtitle={`${crops.length} culturas em acompanhamento`}
          actionLabel="Ver todas"
          onActionPress={() => router.push('/lavouras')}
        />

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.carousel}>
          {crops.map((crop) => (
            <Pressable
              key={crop.id}
              accessibilityRole="button"
              accessibilityLabel={`Abrir lavoura de ${crop.name}`}
              onPress={() => router.push('/lavouras')}
              style={({ pressed }) => pressed && styles.pressed}>
              <Card style={styles.cropCard}>
                <View style={styles.cropTop}>
                  <View
                    style={[styles.cropIcon, { backgroundColor: `${cropStatusColor[crop.status]}22` }]}>
                    <Icon name={crop.icon} size={22} color={cropStatusColor[crop.status]} />
                  </View>
                  <Badge
                    label={cropStatusLabels[crop.status]}
                    tone={
                      crop.status === 'saudavel' ? 'green' : crop.status === 'atencao' ? 'amber' : 'sky'
                    }
                    small
                  />
                </View>

                <View style={styles.cropInfo}>
                  <AppText variant="subtitle" numberOfLines={1}>
                    {crop.name}
                  </AppText>
                  <AppText variant="caption" tone="secondary" numberOfLines={1}>
                    {crop.variety} · {crop.areaHectares} ha
                  </AppText>
                </View>

                <ProgressBar
                  value={crop.progress}
                  color={cropStatusColor[crop.status]}
                  trackColor={`${cropStatusColor[crop.status]}22`}
                  height={6}
                />

                <View style={styles.cropFooter}>
                  <AppText variant="caption" tone="muted">
                    Colheita
                  </AppText>
                  <AppText variant="caption" tone="brand" style={styles.cropDate}>
                    {formatDayMonth(crop.harvestForecast)}
                  </AppText>
                </View>
              </Card>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      {/* Recomendação gerada a partir das métricas de clima. */}
      <Card variant="soft" style={styles.recommendation}>
        <View style={styles.recommendationHeader}>
          <View style={styles.recommendationIcon}>
            <Icon name="lightbulb-on-outline" size={20} color={Brand.amber} />
          </View>
          <AppText variant="label" tone="amber">
            RECOMENDAÇÃO DO DIA
          </AppText>
        </View>

        <AppText variant="subtitle">{advice.title}</AppText>
        <AppText variant="body" tone="secondary">
          {advice.description}
        </AppText>

        <Button
          label="Ver análise completa"
          variant="secondary"
          size="sm"
          icon="arrow-right"
          iconPosition="right"
          onPress={() => router.push('/clima')}
          style={styles.recommendationButton}
        />
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

const toneColor = {
  green: Brand.green,
  sky: Brand.sky,
  amber: Brand.amber,
} as const;

const toneBackground = {
  green: Brand.greenSoft,
  sky: Brand.skySoft,
  amber: Brand.amberSoft,
} as const;

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
  greeting: {
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    fontWeight: '700',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  quickActions: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  quickAction: {
    flex: 1,
    alignItems: 'center',
    gap: 6,
    backgroundColor: Brand.surface,
    borderWidth: 1,
    borderColor: Brand.border,
    borderRadius: Radii.lg,
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.one,
  },
  quickActionIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.75,
  },
  statRow: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  section: {
    gap: Spacing.two,
  },
  carousel: {
    gap: Spacing.two,
    paddingRight: Spacing.three,
    paddingBottom: Spacing.one,
  },
  cropCard: {
    width: 188,
    gap: Spacing.two,
  },
  cropTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.one,
  },
  cropIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cropInfo: {
    gap: 1,
  },
  cropFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cropDate: {
    fontWeight: '700',
  },
  recommendation: {
    gap: Spacing.two,
  },
  recommendationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  recommendationIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: Brand.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  recommendationButton: {
    alignSelf: 'flex-start',
    marginTop: Spacing.one,
  },
});
