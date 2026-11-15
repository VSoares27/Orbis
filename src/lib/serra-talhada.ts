/**
 * Serra Talhada (PE): região de referência da análise das 40 safras.
 *
 * Os arquivos em `src/data/serra-talhada-*.json` foram calculados a partir dos
 * dados diários da NASA POWER (1985–2024) para esta coordenada. Eles só valem
 * para a região, por isso todo uso passa por `isNearSerraTalhada`.
 */

import climateData from '@/data/serra-talhada-clima.json';

export const SERRA_TALHADA = { latitude: -7.988, longitude: -38.2963 } as const;

/** Distância máxima (em graus) para considerar um ponto "região de Serra Talhada". */
export const SERRA_TALHADA_RADIUS_DEG = 0.75;

/** Data em que os dados embutidos foram baixados da NASA POWER. */
export const SERRA_TALHADA_ACCESSED_PT = '14/11/2026';

/** Um mês de um ano real: chuva total (mm) e temperatura média (°C). */
export type MonthValues = { rainMm: number; tempC: number };

/** Um ano civil real, no mesmo formato de `serra-talhada-clima.json`. */
export type YearSeries = {
  year: number;
  /** Chuva total do ano civil (soma dos 12 meses), em mm. */
  rainMm: number;
  months: MonthValues[];
};

export function isNearSerraTalhada(latitude: number, longitude: number) {
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return false;
  const dLat = latitude - SERRA_TALHADA.latitude;
  const dLon = longitude - SERRA_TALHADA.longitude;
  return Math.hypot(dLat, dLon) <= SERRA_TALHADA_RADIUS_DEG;
}

/** Histórico ano a ano embutido no app (cópia de 14/11/2026 da NASA POWER). */
export function embeddedSerraTalhadaYears(): YearSeries[] {
  return climateData.years.map((year) => ({
    year: year.year,
    rainMm: year.rainMm,
    months: year.months.map((month) => ({ rainMm: month.rainMm, tempC: month.tempC })),
  }));
}
