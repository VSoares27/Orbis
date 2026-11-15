/**
 * Cenários de chuva e temperatura para a localização do aparelho.
 *
 * Não há projeção futura aqui. Os três cenários são grupos de anos que
 * aconteceram de verdade na coordenada, segundo a API mensal histórica da
 * NASA POWER (1985–2024):
 *
 * - `ssp126` ("Mais chuva"): média dos 10 anos mais chuvosos;
 * - `ssp245` ("Normal"): média dos 40 anos;
 * - `ssp370` ("Mais seco"): média dos 10 anos mais secos.
 *
 * "Mais chuvoso" e "mais seco" usam a chuva total do ano civil. A temperatura
 * de cada cenário é a média do mesmo grupo de anos.
 *
 * As chaves `ssp*` foram mantidas só porque são o contrato com as telas.
 * A API de projeção da NASA POWER (CMIP6) não cobre o Brasil, por isso não é
 * consultada.
 */

import { buildAnnual, MONTH_LABELS } from '@/lib/projection';
import type { MonthValues, YearSeries } from '@/lib/serra-talhada';
import type { ClimateProjection, ClimateScenario, FarmLocation, MonthlyProjection } from '@/types';

export type { MonthValues, YearSeries } from '@/lib/serra-talhada';

const POWER_MONTHLY_URL = 'https://power.larc.nasa.gov/api/temporal/monthly/point';

const HISTORY_START_YEAR = 1985;
const HISTORY_END_YEAR = 2024;
/** Quantos anos entram nos grupos "mais chuvosos" e "mais secos". */
const EXTREME_GROUP_SIZE = 10;
/** Abaixo disso a amostra é pequena demais para separar os grupos. */
const MIN_COMPLETE_YEARS = 20;
const FILL_VALUE = -999;
const REQUEST_TIMEOUT_MS = 12_000;

export const PROJECTION_ERROR_MESSAGE =
  'Não foi possível obter os dados históricos de chuva e temperatura.';

/** Histórico ano a ano por coordenada (troca de cenário sem nova chamada). */
const yearsCache = new Map<string, Promise<YearSeries[] | null>>();
/** Resultado pronto por coordenada + cenário. */
const projectionCache = new Map<string, ClimateProjection>();

type ParameterSeries = Record<string, number>;

type PowerMonthlyResponse = {
  properties?: {
    parameter?: Record<string, ParameterSeries>;
  };
};

/**
 * Busca a comparação completa para uma localização e cenário.
 *
 * `startYear` é ignorado: os cenários vêm de anos reais já observados
 * (1985–2024), e não de uma janela futura. O parâmetro continua na assinatura
 * para não mudar o hook `useNasaProjection` nem o card do simulador.
 */
export async function fetchNasaProjection(
  location: FarmLocation,
  _startYear: number,
  scenario: ClimateScenario,
): Promise<ClimateProjection> {
  const coordKey = coordinateKey(location);
  const cacheKey = `${coordKey}:${scenario}`;
  const cached = projectionCache.get(cacheKey);
  if (cached) return cached;

  const years = await loadYearSeries(location);
  if (!years) {
    throw new Error(PROJECTION_ERROR_MESSAGE);
  }

  const result = buildProjectionFromYears(location, years, scenario);
  projectionCache.set(cacheKey, result);
  return result;
}

/**
 * Média mensal do grupo de anos que define o cenário (função pura).
 * Chuva arredondada para 0 casas e temperatura para 1 casa.
 */
export function buildScenario(years: YearSeries[], scenario: ClimateScenario): MonthValues[] {
  const group = scenarioYears(years, scenario);
  if (group.length === 0) {
    throw new Error('Sem anos suficientes para montar o cenário.');
  }

  return Array.from({ length: 12 }, (_, index) => ({
    rainMm: round(average(group.map((year) => year.months[index].rainMm)), 0),
    tempC: round(average(group.map((year) => year.months[index].tempC)), 1),
  }));
}

/** Anos que entram no cenário, em ordem cronológica. */
export function scenarioYears(years: YearSeries[], scenario: ClimateScenario): YearSeries[] {
  const complete = years.filter(isCompleteYear);
  if (scenario === 'ssp245') {
    return [...complete].sort((a, b) => a.year - b.year);
  }

  const byRain = [...complete].sort((a, b) => a.rainMm - b.rainMm || a.year - b.year);
  const size = Math.min(EXTREME_GROUP_SIZE, byRain.length);
  const group = scenario === 'ssp370' ? byRain.slice(0, size) : byRain.slice(-size);
  return group.sort((a, b) => a.year - b.year);
}

/** Monta o `ClimateProjection` que as telas esperam a partir dos anos reais. */
export function buildProjectionFromYears(
  location: FarmLocation,
  years: YearSeries[],
  scenario: ClimateScenario,
  extraNotes: string[] = [],
): ClimateProjection {
  const complete = years.filter(isCompleteYear);
  const baseline = buildScenario(complete, 'ssp245');
  const projected = scenario === 'ssp245' ? baseline : buildScenario(complete, scenario);

  const months: MonthlyProjection[] = baseline.map((month, index) => ({
    month: index + 1,
    label: MONTH_LABELS[index],
    baselineRainMm: month.rainMm,
    projectedRainMm: projected[index].rainMm,
    baselineTempC: month.tempC,
    projectedTempC: projected[index].tempC,
  }));

  const yearNumbers = complete.map((year) => year.year);
  const startYear = Math.min(...yearNumbers);
  const endYear = Math.max(...yearNumbers);

  return {
    location,
    scenario,
    startYear,
    endYear,
    source: 'nasa-power',
    model: `NASA POWER — anos reais ${startYear}–${endYear}`,
    updatedAt: new Date().toISOString(),
    months,
    annual: buildAnnual(months),
    notes: [scenarioNote(complete, scenario, startYear, endYear), ...extraNotes],
  };
}

function scenarioNote(
  years: YearSeries[],
  scenario: ClimateScenario,
  startYear: number,
  endYear: number,
) {
  const group = scenarioYears(years, scenario);
  const list = group.map((year) => year.year).join(', ');

  if (scenario === 'ssp126') {
    return `Mais chuva: média dos ${group.length} anos com mais chuva desde ${startYear} (${list}).`;
  }
  if (scenario === 'ssp370') {
    return `Mais seco: média dos ${group.length} anos com menos chuva desde ${startYear} (${list}).`;
  }
  return `Normal: média dos ${group.length} anos de ${startYear} a ${endYear}.`;
}

/** Histórico ano a ano da coordenada, com uma única chamada por coordenada. */
function loadYearSeries(location: FarmLocation): Promise<YearSeries[] | null> {
  const key = coordinateKey(location);
  const pending = yearsCache.get(key);
  if (pending) return pending;

  const request = fetchPowerYears(location).then((years) => {
    // Falhas não ficam no cache, para a próxima consulta tentar de novo.
    if (!years) yearsCache.delete(key);
    return years;
  });
  yearsCache.set(key, request);
  return request;
}

/** Chuva e temperatura mês a mês, ano a ano, na API mensal da NASA POWER. */
async function fetchPowerYears(location: FarmLocation): Promise<YearSeries[] | null> {
  const url =
    `${POWER_MONTHLY_URL}?parameters=T2M,PRECTOTCORR_SUM,PRECTOTCORR` +
    '&community=AG' +
    `&longitude=${location.longitude}` +
    `&latitude=${location.latitude}` +
    `&start=${HISTORY_START_YEAR}` +
    `&end=${HISTORY_END_YEAR}` +
    '&format=JSON' +
    '&units=metric';

  try {
    const payload = await fetchJson<PowerMonthlyResponse>(url);
    const parameter = payload.properties?.parameter;
    const years = parsePowerYears(
      parameter?.T2M,
      parameter?.PRECTOTCORR_SUM,
      parameter?.PRECTOTCORR,
    );
    return years.length >= MIN_COMPLETE_YEARS ? years : null;
  } catch (error) {
    if (typeof __DEV__ !== 'undefined' && __DEV__) {
      console.warn('[NASA POWER] falha no histórico mensal:', error);
    }
    return null;
  }
}

/**
 * Converte a resposta da API mensal em `YearSeries[]`.
 *
 * - `PRECTOTCORR_SUM` é o total do mês em mm. Se faltar, usa `PRECTOTCORR`
 *   (média diária em mm/dia) × dias daquele mês, contando anos bissextos.
 * - Chaves com mês `13` (total do ano) e valores `-999` são ignorados.
 * - Só entram anos com os 12 meses válidos.
 */
export function parsePowerYears(
  temp: ParameterSeries | undefined,
  rainSum: ParameterSeries | undefined,
  rainDaily: ParameterSeries | undefined,
): YearSeries[] {
  if (!isSeries(temp) || (!isSeries(rainSum) && !isSeries(rainDaily))) return [];

  const years: YearSeries[] = [];

  for (let year = HISTORY_START_YEAR; year <= HISTORY_END_YEAR; year += 1) {
    const months: MonthValues[] = [];

    for (let month = 1; month <= 12; month += 1) {
      const key = `${year}${String(month).padStart(2, '0')}`;
      const tempC = temp[key];
      const sum = rainSum?.[key];
      const daily = rainDaily?.[key];

      let rainMm: number | null = null;
      if (isValid(sum)) rainMm = sum;
      else if (isValid(daily)) rainMm = daily * daysInMonthOfYear(year, month);

      if (rainMm === null || !isValid(tempC)) break;
      months.push({ rainMm: round(rainMm, 1), tempC: round(tempC, 2) });
    }

    if (months.length === 12) {
      years.push({
        year,
        rainMm: round(
          months.reduce((total, month) => total + month.rainMm, 0),
          1,
        ),
        months,
      });
    }
  }

  return years;
}

function isCompleteYear(year: YearSeries) {
  return (
    year.months.length === 12 &&
    Number.isFinite(year.rainMm) &&
    year.months.every((month) => isValid(month.rainMm) && isValid(month.tempC))
  );
}

function coordinateKey(location: FarmLocation) {
  return `${location.latitude.toFixed(2)},${location.longitude.toFixed(2)}`;
}

function daysInMonthOfYear(year: number, month: number) {
  return new Date(Date.UTC(year, month, 0)).getUTCDate();
}

function isSeries(value: unknown): value is ParameterSeries {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isValid(value: number | undefined | null): value is number {
  return (
    typeof value === 'number' &&
    Number.isFinite(value) &&
    value !== FILL_VALUE &&
    Math.abs(value) < 1e19
  );
}

async function fetchJson<T>(url: string): Promise<T> {
  const response = await fetchWithTimeout(url, {
    headers: { Accept: 'application/json' },
  });

  if (!response.ok) {
    throw new Error(`NASA POWER respondeu ${response.status}`);
  }

  return (await response.json()) as T;
}

async function fetchWithTimeout(url: string, init?: RequestInit) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timeout);
  }
}

function average(values: number[]) {
  if (values.length === 0) return 0;
  return values.reduce((total, value) => total + value, 0) / values.length;
}

function round(value: number, digits: number) {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}
