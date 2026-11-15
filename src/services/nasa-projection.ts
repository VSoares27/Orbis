/**
 * Projeções climáticas para a localização do aparelho.
 *
 * 1. A climatologia de referência vem da API mensal histórica da NASA POWER
 *    (2015–2019), que cobre o Brasil.
 * 2. O cenário futuro é tentado primeiro na Climate Projection API da NASA
 *    POWER (ensemble CMIP6).
 * 3. Quando a API de projeção não cobre o ponto (caso do Brasil), usamos o
 *    conjunto global NEX-GDDP-CMIP6 via THREDDS/NCSS, modelo ACCESS-CM2.
 *
 * O resultado é sempre uma janela de cinco anos, agregada mês a mês. A chuva
 * é convertida para milímetros por mês e a temperatura para graus Celsius.
 */

import { NetCDFReader } from 'netcdfjs';

import {
  PROJECTION_YEAR_MAX,
  PROJECTION_YEAR_MIN,
  PROJECTION_YEAR_SPAN,
  buildAnnual,
  daysInMonth,
  MONTH_LABELS,
} from '@/lib/projection';
import type {
  ClimateProjection,
  ClimateScenario,
  FarmLocation,
  MonthlyProjection,
  ProjectionSource,
} from '@/types';

const POWER_MONTHLY_URL = 'https://power.larc.nasa.gov/api/temporal/monthly/point';
const POWER_PROJECTION_URL = 'https://power.larc.nasa.gov/api/projection/monthly/point';
const NEX_GDDP_BASE =
  'https://ds.nccs.nasa.gov/thredds/ncss/grid/AMES/NEX/GDDP-CMIP6/ACCESS-CM2';

const BASELINE_START_YEAR = 2015;
const BASELINE_END_YEAR = 2019;
const FILL_VALUE = -999;
const REQUEST_TIMEOUT_MS = 30_000;

type ParameterSeries = Record<string, number>;

type PowerMonthlyResponse = {
  properties?: {
    parameter?: Record<string, ParameterSeries | Record<string, ParameterSeries>>;
  };
};

type MonthlySeries = {
  rainMm: number;
  tempC: number;
};

type ProjectionTarget = {
  months: MonthlySeries[];
  source: ProjectionSource;
  model: string;
};

/**
 * Busca a comparação completa para uma localização e cenário.
 * Lança erro somente quando nem a fonte principal nem o fallback funcionam.
 */
export async function fetchNasaProjection(
  location: FarmLocation,
  startYear: number,
  scenario: ClimateScenario,
): Promise<ClimateProjection> {
  const safeStart = clamp(
    Math.round(startYear),
    PROJECTION_YEAR_MIN,
    PROJECTION_YEAR_MAX,
  );
  const endYear = Math.min(safeStart + PROJECTION_YEAR_SPAN - 1, 2100);

  const baseline = await fetchPowerBaseline(location);
  if (!baseline) {
    throw new Error('Não foi possível obter a climatologia de referência da NASA POWER.');
  }

  const notes: string[] = [];
  let target = await fetchPowerProjection(location, safeStart, endYear, scenario);

  if (!target) {
    target = await fetchNexProjection(location, safeStart, endYear, scenario);
    if (target) {
      notes.push(
        'A API de projeção da NASA POWER ainda não cobre esta localização. Usamos o conjunto global NEX-GDDP-CMIP6 (ACCESS-CM2).',
      );
    }
  }

  if (!target) {
    throw new Error(
      'Não foi possível obter a projeção climática para esta localização. Tente novamente em instantes.',
    );
  }

  const months: MonthlyProjection[] = baseline.map((month, index) => ({
    month: index + 1,
    label: MONTH_LABELS[index],
    baselineRainMm: month.rainMm,
    projectedRainMm: target.months[index]?.rainMm ?? 0,
    baselineTempC: month.tempC,
    projectedTempC: target.months[index]?.tempC ?? 0,
  }));

  notes.push(
    `Janela de ${PROJECTION_YEAR_SPAN} anos (${safeStart}–${endYear}) para reduzir a variabilidade de um único ano.`,
  );

  return {
    location,
    scenario,
    startYear: safeStart,
    endYear,
    source: target.source,
    model: target.model,
    updatedAt: new Date().toISOString(),
    months,
    annual: buildAnnual(months),
    notes,
  };
}

/** Climatologia mensal de referência (média diária de chuva e temperatura). */
async function fetchPowerBaseline(location: FarmLocation): Promise<MonthlySeries[] | null> {
  const url =
    `${POWER_MONTHLY_URL}?parameters=T2M,PRECTOTCORR` +
    '&community=AG' +
    `&longitude=${location.longitude}` +
    `&latitude=${location.latitude}` +
    `&start=${BASELINE_START_YEAR}` +
    `&end=${BASELINE_END_YEAR}` +
    '&format=JSON' +
    '&units=metric';

  try {
    const payload = await fetchJson<PowerMonthlyResponse>(url);
    const parameter = payload.properties?.parameter;
    const temp = parameter?.T2M;
    const rain = parameter?.PRECTOTCORR;

    if (!isSeries(temp) || !isSeries(rain)) return null;

    return aggregatePowerSeries(temp, rain);
  } catch (error) {
    if (__DEV__) {
      console.warn('[NASA POWER] falha na climatologia mensal:', error);
    }
    return null;
  }
}

/** Projeção mensal da NASA POWER para locais cobertos pela API beta. */
async function fetchPowerProjection(
  location: FarmLocation,
  startYear: number,
  endYear: number,
  scenario: ClimateScenario,
): Promise<ProjectionTarget | null> {
  const url =
    `${POWER_PROJECTION_URL}?parameters=T2M,PRECTOTCORR` +
    '&community=AG' +
    `&longitude=${location.longitude}` +
    `&latitude=${location.latitude}` +
    `&start=${startYear}01` +
    `&end=${endYear}12` +
    '&format=JSON' +
    '&time-standard=UTC' +
    `&scenario=${scenario}` +
    '&model=ensemble';

  try {
    const payload = await fetchJson<PowerMonthlyResponse>(url);
    const parameter = payload.properties?.parameter;
    const temp = parameter?.T2M;
    const rain = parameter?.PRECTOTCORR;

    if (!isNestedSeries(temp) || !isNestedSeries(rain)) return null;

    const tempScenario = temp[scenario];
    const rainScenario = rain[scenario];
    if (!tempScenario || !rainScenario) return null;

    const monthly = aggregatePowerSeries(tempScenario, rainScenario);
    if (!monthly) return null;

    return {
      months: monthly,
      source: 'nasa-power',
      model: 'Ensemble CMIP6',
    };
  } catch (error) {
    if (__DEV__) {
      console.warn('[NASA POWER] falha na projeção, tentando NEX-GDDP:', error);
    }
    return null;
  }
}

/**
 * Fallback global: lê um arquivo NetCDF3 por ano e variável no THREDDS/NCSS.
 * Usamos apenas a célula de grade mais próxima do ponto.
 */
async function fetchNexProjection(
  location: FarmLocation,
  startYear: number,
  endYear: number,
  scenario: ClimateScenario,
): Promise<ProjectionTarget | null> {
  const years = Array.from(
    { length: endYear - startYear + 1 },
    (_, index) => startYear + index,
  );

  try {
    const yearlyData = await Promise.all(
      years.map(async (year) => {
        const [temp, rain] = await Promise.all([
          fetchNexVariable(location, scenario, year, 'tas'),
          fetchNexVariable(location, scenario, year, 'pr'),
        ]);
        return { temp, rain };
      }),
    );

    const monthly = aggregateNexSeries(yearlyData, years.length);
    if (!monthly) return null;

    return {
      months: monthly,
      source: 'nex-gddp',
      model: 'ACCESS-CM2',
    };
  } catch (error) {
    if (__DEV__) {
      console.warn('[NEX-GDDP] falha ao ler o NetCDF:', error);
    }
    return null;
  }
}

type NexDailyPoint = {
  month: number;
  value: number;
};

type NexYearlyPoint = {
  temp: NexDailyPoint[];
  rain: NexDailyPoint[];
};

async function fetchNexVariable(
  location: FarmLocation,
  scenario: ClimateScenario,
  year: number,
  variable: 'tas' | 'pr',
): Promise<NexDailyPoint[]> {
  const delta = 0.05;
  const north = clamp(location.latitude + delta, -90, 90);
  const south = clamp(location.latitude - delta, -90, 90);
  const west = clamp(location.longitude - delta, -180, 180);
  const east = clamp(location.longitude + delta, -180, 180);

  const file = `${variable}_day_ACCESS-CM2_${scenario}_r1i1p1f1_gn_${year}_v2.0.nc`;
  const query = [
    ['var', variable],
    ['north', north.toFixed(4)],
    ['west', west.toFixed(4)],
    ['east', east.toFixed(4)],
    ['south', south.toFixed(4)],
    ['horizStride', '1'],
    ['time_start', `${year}-01-01T00:00:00Z`],
    ['time_end', `${year}-12-31T23:59:59Z`],
    ['accept', 'netcdf3'],
  ]
    .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
    .join('&');

  const url = `${NEX_GDDP_BASE}/${scenario}/r1i1p1f1/${variable}/${file}?${query}`;
  const response = await fetchWithTimeout(url, { headers: { Accept: 'application/x-netcdf' } });
  if (!response.ok) {
    throw new Error(`NEX-GDDP respondeu ${response.status}`);
  }

  const buffer = await response.arrayBuffer();
  const reader = new NetCDFReader(new Uint8Array(buffer));

  if (!reader.dataVariableExists('time') || !reader.dataVariableExists(variable)) {
    throw new Error('Arquivo NetCDF sem as variáveis esperadas.');
  }

  const time = numericVariable(reader, 'time');
  const values = numericVariable(reader, variable);
  const count = Math.min(time.length, values.length);
  const result: NexDailyPoint[] = [];

  for (let index = 0; index < count; index += 1) {
    const value = values[index];
    if (!isValid(value)) continue;

    const date = new Date(Date.UTC(1850, 0, 1) + time[index] * 86_400_000);
    if (Number.isNaN(date.getTime())) continue;

    result.push({
      month: date.getUTCMonth(),
      value: variable === 'pr' ? value * 86_400 : value - 273.15,
    });
  }

  if (result.length === 0) {
    throw new Error(`Sem dados válidos para ${variable} em ${year}.`);
  }

  return result;
}

/** Agrupa a saída NetCDF em médias mensais ao longo da janela. */
function aggregateNexSeries(
  yearlyData: NexYearlyPoint[],
  yearCount: number,
): MonthlySeries[] | null {
  const temp = Array.from({ length: 12 }, () => ({ sum: 0, count: 0 }));
  const rain = Array.from({ length: 12 }, () => ({ sum: 0, count: 0 }));

  yearlyData.forEach((dayData) => {
    dayData.temp.forEach(({ month, value }) => {
      temp[month].sum += value;
      temp[month].count += 1;
    });

    dayData.rain.forEach(({ month, value }) => {
      rain[month].sum += value;
      rain[month].count += 1;
    });
  });

  const months: MonthlySeries[] = [];

  for (let index = 0; index < 12; index += 1) {
    if (temp[index].count === 0 || rain[index].count === 0) return null;

    months.push({
      rainMm: round(rain[index].sum / yearCount, 0),
      tempC: round(temp[index].sum / temp[index].count, 1),
    });
  }

  return months;
}

/** Converte séries diárias mensais da NASA POWER em totais mensais. */
function aggregatePowerSeries(
  temp: ParameterSeries,
  rain: ParameterSeries,
): MonthlySeries[] | null {
  const tempBuckets = Array.from({ length: 12 }, () => ({ sum: 0, count: 0 }));
  const rainBuckets = Array.from({ length: 12 }, () => ({ sum: 0, count: 0 }));

  for (const [key, value] of Object.entries(temp)) {
    const month = monthFromKey(key);
    if (month < 0 || !isValid(value)) continue;
    tempBuckets[month].sum += value;
    tempBuckets[month].count += 1;
  }

  for (const [key, value] of Object.entries(rain)) {
    const month = monthFromKey(key);
    if (month < 0 || !isValid(value)) continue;
    rainBuckets[month].sum += value;
    rainBuckets[month].count += 1;
  }

  const months: MonthlySeries[] = [];

  for (let index = 0; index < 12; index += 1) {
    if (tempBuckets[index].count === 0 || rainBuckets[index].count === 0) return null;

    months.push({
      rainMm: round(
        (rainBuckets[index].sum / rainBuckets[index].count) * daysInMonth(index + 1),
        0,
      ),
      tempC: round(tempBuckets[index].sum / tempBuckets[index].count, 1),
    });
  }

  return months;
}

function monthFromKey(key: string) {
  const month = Number(key.slice(4, 6));
  if (!Number.isFinite(month) || month < 1 || month > 12) return -1;
  return month - 1;
}

function numericVariable(reader: NetCDFReader, name: string) {
  const values = reader.getDataVariable(name);
  return values.filter((value): value is number => typeof value === 'number');
}

function isSeries(value: unknown): value is ParameterSeries {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isNestedSeries(
  value: unknown,
): value is Record<string, ParameterSeries> {
  return isSeries(value);
}

function isValid(value: number) {
  return Number.isFinite(value) && value !== FILL_VALUE && Math.abs(value) < 1e19;
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

function round(value: number, digits: number) {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}
