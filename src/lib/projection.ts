/** Constantes, agregações e textos simples das previsões climáticas para o produtor. */

import type {
  ClimateScenario,
  MonthlyProjection,
  ProjectionAnnual,
  ProjectionSource,
} from '@/types';

export const PROJECTION_YEAR_MIN = 2025;
export const PROJECTION_YEAR_MAX = 2096;
export const PROJECTION_YEAR_SPAN = 5;

export const SCENARIOS: ClimateScenario[] = ['ssp126', 'ssp245', 'ssp370'];

export const SCENARIO_LABELS: Record<ClimateScenario, string> = {
  ssp126: 'Ano com mais chuva',
  ssp245: 'Clima normal da região',
  ssp370: 'Ano mais quente e seco',
};

export const SCENARIO_SHORT_LABELS: Record<ClimateScenario, string> = {
  ssp126: 'Mais chuva',
  ssp245: 'Normal',
  ssp370: 'Mais seco',
};

export const SCENARIO_DESCRIPTIONS: Record<ClimateScenario, string> = {
  ssp126: 'Cenário com chuvas mais regulares e temperaturas mais amenas.',
  ssp245: 'Cenário esperado seguindo o comportamento normal dos últimos anos.',
  ssp370: 'Cenário com menos chuva e calor mais forte durante a safra.',
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

export const PROJECTION_DOCS_URL = 'https://power.larc.nasa.gov/docs/services/api/projection/';
export const NEX_GDDP_DOCS_URL =
  'https://www.nccs.nasa.gov/services/data-collections/land-based-products/nex-gddp-cmip6';

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

export function projectionSourceLabel(source: ProjectionSource) {
  return source === 'nasa-power' ? 'Satélite NASA · Clima' : 'Satélite NASA · Região';
}

export function projectionSourceDescription(source: ProjectionSource) {
  return source === 'nasa-power'
    ? 'Estimativa feita com dados de satélite da NASA para a sua propriedade.'
    : 'Estimativa climática da NASA ajustada para a região da sua propriedade.';
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