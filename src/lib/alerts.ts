/** Alertas da Home gerados a partir da série de clima (sem dados fixos). */

import { irrigationAdvice, average, lastNDays, latestDay } from '@/lib/climate';
import type { ClimateSnapshot, FarmAlert } from '@/types';

export function buildAlerts(snapshot: ClimateSnapshot): FarmAlert[] {
  const today = latestDay(snapshot);
  if (!today) return [];

  const week = lastNDays(snapshot, 7);
  const advice = irrigationAdvice(today);
  const avgWind = average(week, (day) => day.windAvg);
  const avgHumidity = average(week, (day) => day.humidityAvg);
  const alerts: FarmAlert[] = [];

  if (today.rainMm >= 15) {
    alerts.push({
      id: 'rain-heavy',
      severity: 'atencao',
      title: 'Chuva forte registrada',
      message: `${today.rainMm} mm na última leitura. Verifique drenagem e áreas sujeitas a encharcamento.`,
      href: '/clima',
      actionLabel: 'Ver clima',
    });
  }

  if (advice.level !== 'ok') {
    alerts.push({
      id: 'irrigation',
      severity: advice.level === 'alta' ? 'atencao' : 'info',
      title: advice.title,
      message: advice.description,
      href: '/lavouras',
      actionLabel: 'Ver lavouras',
    });
  }

  if (avgHumidity >= 80) {
    alerts.push({
      id: 'fungal-risk',
      severity: 'atencao',
      title: 'Atenção a doenças fúngicas',
      message: `Umidade média de ${avgHumidity}% na semana favorece fungos. Vistorie as folhas baixas.`,
      href: '/clima',
      actionLabel: 'Ver detalhes',
    });
  }

  if (avgWind > 10) {
    alerts.push({
      id: 'wind',
      severity: 'info',
      title: 'Evite pulverização',
      message: `Vento médio de ${avgWind} km/h pode causar deriva do produto.`,
      href: '/clima',
      actionLabel: 'Ver clima',
    });
  }

  if (alerts.length === 0) {
    alerts.push({
      id: 'stable',
      severity: 'info',
      title: 'Condições estáveis',
      message: 'Sem alertas de clima para a sua região nesta semana.',
      href: '/clima',
      actionLabel: 'Ver clima',
    });
  }

  return alerts;
}
