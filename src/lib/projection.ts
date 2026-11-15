/** Constantes, agregações e textos das simulações climáticas. */

import type {
  ClimateScenario,
  MonthlyProjection,
  ProjectionAnnual,
  ProjectionSource,
} from '@/types';

/** Primeiro ano disponível em todos os cenários usados pelo app. */
export const PROJECTION_YEAR_MIN = 2025;
/** Último início de janela que termina em 2100. */
export const PROJECTION_YEAR_MAX = 2096;
export const PROJECTION_YEAR_SPAN = 5;

export const SCENARIOS: ClimateScenario[] = ['ssp126', 'ssp245', 'ssp370'];

export const SCENARIO_LABELS: Record<ClimateScenario, string> = {
  ssp126: 'Baixas emissões',
  ssp245: 'Emissões intermediárias',
  ssp370: 'Altas emissões',
};

export const SCENARIO_SHORT_LABELS: Record<ClimateScenario, string> = {
  ssp126: 'SSP1-2.6',
  ssp245: 'SSP2-4.5',
  ssp370: 'SSP3-7.0',
};

export const SCENARIO_DESCRIPTIONS: Record<ClimateScenario, string> = {
  ssp126: 'Cenário com forte redução de emissões e mais ação climática.',
  ssp245: 'Cenário intermediário, próximo das políticas atuais.',
  ssp370: 'Cenário de altas emissões, com maior aquecimento.',
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

/** Variação percentual da chuva anual. Retorna null quando a base é zero. */
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
  return source === 'nasa-power' ? 'NASA POWER · CMIP6' : 'NEX-GDDP · ACCESS-CM2';
}

export function projectionSourceDescription(source: ProjectionSource) {
  return source === 'nasa-power'
    ? 'Média de modelos CMIP6 downscaled da NASA POWER para a sua localização.'
    : 'Fallback global NEX-GDDP-CMIP6 (NASA), usado onde a API de projeção ainda não cobre.';
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
