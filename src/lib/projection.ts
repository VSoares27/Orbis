/**
 * Constantes, agregações e textos simples dos cenários de clima para o produtor.
 *
 * Os cenários são grupos de anos reais da NASA POWER (1985–2024), não projeções
 * futuras. Veja `src/services/nasa-projection.ts`.
 */

import type {
  ClimateScenario,
  MonthlyProjection,
  ProjectionAnnual,
  ProjectionSource,
} from '@/types';

export const SCENARIOS: ClimateScenario[] = ['ssp126', 'ssp245', 'ssp370'];

export const SCENARIO_LABELS: Record<ClimateScenario, string> = {
  ssp126: 'Como nos anos mais chuvosos',
  ssp245: 'Média dos últimos 40 anos',
  ssp370: 'Como nos anos mais secos',
};

export const SCENARIO_SHORT_LABELS: Record<ClimateScenario, string> = {
  ssp126: 'Mais chuva',
  ssp245: 'Normal',
  ssp370: 'Mais seco',
};

export const SCENARIO_DESCRIPTIONS: Record<ClimateScenario, string> = {
  ssp126: 'Média dos 10 anos com mais chuva entre 1985 e 2024 (NASA POWER).',
  ssp245: 'Média de todos os anos de 1985 a 2024 (NASA POWER).',
  ssp370: 'Média dos 10 anos com menos chuva entre 1985 e 2024 (NASA POWER).',
};

export const MONTH_LABELS = [
  'Jan',
  'Fev',
  'Mar',
  'Abr',
  'Mai',
  'Jun',
  'Jul',
  'Ago',
  'Set',
  'Out',
  'Nov',
  'Dez',
] as const;

export function daysInMonth(month: number) {
  return new Date(Date.UTC(2023, month, 0)).getUTCDate();
}

export function buildAnnual(months: MonthlyProjection[]): ProjectionAnnual {
  return {
    baselineRainMm: round(
      months.reduce((total, month) => total + month.baselineRainMm, 0),
      0,
    ),
    projectedRainMm: round(
      months.reduce((total, month) => total + month.projectedRainMm, 0),
      0,
    ),
    baselineTempC: round(average(months.map((month) => month.baselineTempC)), 1),
    projectedTempC: round(average(months.map((month) => month.projectedTempC)), 1),
  };
}

export function rainChangePercent(annual: ProjectionAnnual) {
  if (annual.baselineRainMm <= 0) return null;
  return round(
    ((annual.projectedRainMm - annual.baselineRainMm) / annual.baselineRainMm) * 100,
    1,
  );
}

export function temperatureChange(annual: ProjectionAnnual) {
  return round(annual.projectedTempC - annual.baselineTempC, 1);
}

export function projectionSourceLabel(_source: ProjectionSource) {
  return 'NASA POWER · 1985 a 2024';
}

export function projectionSourceDescription(_source: ProjectionSource) {
  return 'Dados de satélite da NASA POWER, 1985 a 2024, para a coordenada da sua propriedade.';
}

export function formatSignedNumber(value: number, digits = 1) {
  const sign = value > 0 ? '+' : '';
  return `${sign}${value.toLocaleString('pt-BR', {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  })}`;
}

function average(values: number[]) {
  if (values.length === 0) return 0;
  return values.reduce((total, value) => total + value, 0) / values.length;
}

function round(value: number, digits: number) {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}