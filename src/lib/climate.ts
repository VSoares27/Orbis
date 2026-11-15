/** Agregações e leituras rápidas da série de clima. */

import type { ClimateSnapshot, DailyClimate } from '@/types';

export function latestDay(snapshot: ClimateSnapshot): DailyClimate | undefined {
  const days = snapshot?.days ?? [];
  return days[days.length - 1];
}

export function lastNDays(snapshot: ClimateSnapshot, count: number): DailyClimate[] {
  const days = snapshot?.days ?? [];
  return count > 0 ? days.slice(-count) : [];
}

export function totalRain(days: DailyClimate[]) {
  return round(days.reduce((total, day) => total + day.rainMm, 0), 1);
}

export function average(days: DailyClimate[], pick: (day: DailyClimate) => number) {
  if (days.length === 0) return 0;
  return round(days.reduce((total, day) => total + pick(day), 0) / days.length, 1);
}

export function temperatureRange(days: DailyClimate[]) {
  if (days.length === 0) return { min: 0, max: 0 };
  return {
    min: Math.min(...days.map((day) => day.tempMin)),
    max: Math.max(...days.map((day) => day.tempMax)),
  };
}

/**
 * Recomendação simples de irrigação a partir da evapotranspiração.
 * Regra de bolso: repor a lâmina evapotranspirada e descontar a chuva do dia.
 * Em produção, combine com sensores de solo e coeficiente da cultura (Kc).
 */
export function irrigationAdvice(day?: DailyClimate) {
  if (!day) {
    return {
      level: 'ok' as const,
      title: 'Sem dados de clima',
      description: 'Aguardando a leitura de clima para gerar a recomendação.',
      deficitMm: 0,
    };
  }

  const deficit = Math.max(0, day.evapotranspirationMm - day.rainMm);
  if (deficit <= 0.5) {
    return {
      level: 'ok' as const,
      title: 'Sem necessidade de irrigação hoje',
      description: 'A chuva recente cobre a perda de água do solo.',
      deficitMm: 0,
    };
  }
  if (deficit < 3) {
    return {
      level: 'moderada' as const,
      title: 'Irrigação leve recomendada',
      description: `Reponha cerca de ${round(deficit, 1)} mm, preferencialmente no início da manhã.`,
      deficitMm: round(deficit, 1),
    };
  }
  return {
    level: 'alta' as const,
    title: 'Atenção à irrigação',
    description: `Déficit estimado de ${round(deficit, 1)} mm. Priorize as lavouras mais sensíveis.`,
    deficitMm: round(deficit, 1),
  };
}

function round(value: number, digits: number) {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}