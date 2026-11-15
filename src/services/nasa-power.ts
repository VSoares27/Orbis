/**
 * Integração com a API pública da NASA POWER.
 *
 * Documentação: https://power.larc.nasa.gov/docs/services/api/
 * A NASA POWER não exige chave de API. Usamos a comunidade AG (agroclimatologia)
 * e a granularidade diária por ponto (latitude/longitude).
 *
 * O backend não é necessário para esta proposta: o app consulta a API
 * diretamente. Quando o backend existir, mova esta chamada para ele e mantenha
 * o mesmo formato de `ClimateSnapshot` para não alterar as telas.
 *
 * No navegador (web), a NASA POWER pode bloquear a requisição por CORS.
 * Nesse caso o app cai automaticamente nos dados de demonstração; em produção,
 * use o backend como proxy para evitar essa limitação.
 */

import type { ClimateSnapshot, DailyClimate, FarmLocation, WeatherCondition } from '@/types';

const API_BASE = 'https://power.larc.nasa.gov/api/temporal/daily/point';

/** Parâmetros agrícolas usados na tela de clima. */
const PARAMETERS = [
  'T2M', // temperatura média a 2 m (°C)
  'T2M_MAX', // temperatura máxima a 2 m (°C)
  'T2M_MIN', // temperatura mínima a 2 m (°C)
  'PRECTOTCORR', // precipitação corrigida (mm/dia)
  'RH2M', // umidade relativa a 2 m (%)
  'WS2M', // velocidade do vento a 2 m (m/s)
  'ALLSKY_SFC_SW_DWN', // radiação solar de superfície (MJ/m²/dia)
  'EVLAND', // evapotranspiração sobre o solo (mm/dia)
].join(',');

/** Valor usado pela NASA POWER quando não há medição. */
const FILL_VALUE = -999;

export const NASA_POWER_DOCS_URL = 'https://power.larc.nasa.gov/';

type NasaRawResponse = {
  properties?: {
    parameter?: Record<string, Record<string, number>>;
  };
};

function toIsoDate(date: Date) {
  return date.toISOString().slice(0, 10);
}

function toApiDate(iso: string) {
  return iso.replaceAll('-', '');
}

/** "20261112" (formato da NASA) → "2026-11-12" (ISO usado nas telas). */
function fromApiDate(compact: string) {
  return `${compact.slice(0, 4)}-${compact.slice(4, 6)}-${compact.slice(6, 8)}`;
}

function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function isValid(value: number | undefined | null): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value !== FILL_VALUE;
}

/**
 * A NASA POWER tem latência de alguns dias. Para garantir que o último dia da
 * série esteja preenchido, terminamos a consulta 3 dias atrás.
 */
function buildDateRange(days: number) {
  const end = addDays(new Date(), -3);
  const start = addDays(end, -(days - 1));
  return { start: toIsoDate(start), end: toIsoDate(end) };
}

function deriveCondition(
  day: Omit<DailyClimate, 'date' | 'condition'>,
  hasSolarReading: boolean,
): WeatherCondition {
  if (day.rainMm >= 15) return 'tempestade';
  if (day.rainMm >= 2) return 'chuva';
  if (day.humidityAvg < 55 && day.rainMm === 0) return 'seco';
  // Só usa a radiação para inferir céu nublado quando ela realmente existe.
  if (day.humidityAvg > 78 || (hasSolarReading && day.solarKwh < 3.4)) return 'nublado';
  return 'sol';
}

/**
 * Busca os últimos `days` dias de clima para uma propriedade.
 * Retorna `null` quando a API não responde ou não há dados válidos.
 */
export async function fetchNasaClimate(
  location: FarmLocation,
  days = 14,
): Promise<ClimateSnapshot | null> {
  const { start, end } = buildDateRange(days);

  const url =
    `${API_BASE}?parameters=${PARAMETERS}` +
    `&community=AG` +
    `&longitude=${location.longitude}` +
    `&latitude=${location.latitude}` +
    `&start=${toApiDate(start)}` +
    `&end=${toApiDate(end)}` +
    `&format=JSON` +
    `&units=metric`;

  // Timeout manual: o fetch do React Native não aceita `timeout` em todas as versões.
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: { Accept: 'application/json' },
    });

    if (!response.ok) {
      throw new Error(`NASA POWER respondeu ${response.status}`);
    }

    const payload = (await response.json()) as NasaRawResponse;
    const parameter = payload.properties?.parameter;

    if (!parameter?.T2M) {
      return null;
    }

    const dates = Object.keys(parameter.T2M).sort();

    const parsed: DailyClimate[] = [];

    for (const date of dates) {
      const tempAvg = parameter.T2M?.[date];
      if (!isValid(tempAvg)) continue;

      const tempMax = parameter.T2M_MAX?.[date];
      const tempMin = parameter.T2M_MIN?.[date];
      const rain = parameter.PRECTOTCORR?.[date];
      const humidity = parameter.RH2M?.[date];
      const wind = parameter.WS2M?.[date];
      const solar = parameter.ALLSKY_SFC_SW_DWN?.[date];
      const evapotranspiration = parameter.EVLAND?.[date];
      const hasSolarReading = isValid(solar);

      const base = {
        tempMax: isValid(tempMax) ? round(tempMax, 1) : round(tempAvg, 1),
        tempMin: isValid(tempMin) ? round(tempMin, 1) : round(tempAvg, 1),
        tempAvg: round(tempAvg, 1),
        rainMm: isValid(rain) ? round(rain, 1) : 0,
        humidityAvg: isValid(humidity) ? round(humidity, 0) : 0,
        // A API devolve o vento em m/s; convertemos para km/h para o produtor.
        windAvg: isValid(wind) ? round(wind * 3.6, 1) : 0,
        // Radiação vem em MJ/m²/dia; 1 kWh = 3,6 MJ.
        solarKwh: isValid(solar) ? round(solar / 3.6, 1) : 0,
        evapotranspirationMm: isValid(evapotranspiration) ? round(evapotranspiration, 1) : 0,
      };

      parsed.push({
        ...base,
        date: fromApiDate(date),
        condition: deriveCondition(base, hasSolarReading),
      });
    }

    if (parsed.length === 0) return null;

    return {
      location,
      updatedAt: new Date().toISOString(),
      source: 'nasa',
      days: parsed,
    };
  } catch (error) {
    // Silencioso de propósito: o hook faz fallback para os dados demo.
    if (__DEV__) {
      console.warn('[NASA POWER] não foi possível buscar o clima:', error);
    }
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

function round(value: number, digits: number) {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}
