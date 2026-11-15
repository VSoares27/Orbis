import { MONTH_LABELS } from '@/lib/projection';
import type { ClimateProjection, MonthlyProjection } from '@/types';

export type CropPresetId = 'milho' | 'feijao' | 'soja' | 'mandioca';

export type CropPreset = {
  id: CropPresetId;
  name: string;
  cycleMonths: number;
  idealRainMmCycle: { min: number; max: number };
  idealTempC: { min: number; max: number };
  maxTempStressC: number;
  notes: string;
};

export const CROP_PRESETS: Record<CropPresetId, CropPreset> = {
  milho: {
    id: 'milho',
    name: 'Milho',
    cycleMonths: 4,
    idealRainMmCycle: { min: 450, max: 700 },
    idealTempC: { min: 20, max: 30 },
    maxTempStressC: 34,
    notes: 'Precisa de bastante chuva quando solta o pendão e enche a espiga (2º e 3º mês).',
  },
  feijao: {
    id: 'feijao',
    name: 'Feijão',
    cycleMonths: 3,
    idealRainMmCycle: { min: 300, max: 450 },
    idealTempC: { min: 18, max: 28 },
    maxTempStressC: 32,
    notes: 'Não gosta de terra encharcada na colheita nem de calor forte na florada.',
  },
  soja: {
    id: 'soja',
    name: 'Soja',
    cycleMonths: 4,
    idealRainMmCycle: { min: 450, max: 650 },
    idealTempC: { min: 20, max: 30 },
    maxTempStressC: 35,
    notes: 'Precisa de terra úmida para nascer bem e formar as vagens.',
  },
  mandioca: {
    id: 'mandioca',
    name: 'Mandioca',
    cycleMonths: 8,
    idealRainMmCycle: { min: 750, max: 1200 },
    idealTempC: { min: 22, max: 32 },
    maxTempStressC: 37,
    notes: 'Aguenta bem a seca depois de pegar, mas precisa de chuva nos primeiros 3 meses.',
  },
};

export type WindowEvaluation = {
  startMonth: number;
  startMonthLabel: string;
  harvestMonthLabel: string;
  score: number;
  status: 'ideal' | 'moderado' | 'risco';
  baselineRainTotal: number;
  projectedRainTotal: number;
  baselineTempAvg: number;
  projectedTempAvg: number;
  rainDeltaPercent: number;
  tempDeltaC: number;
  cycleMonths: MonthlyProjection[];
  recommendations: string[];
};

export type PlantingSimulationResult = {
  crop: CropPreset;
  selectedWindow: WindowEvaluation;
  bestWindow: WindowEvaluation;
  allWindows: WindowEvaluation[];
};

export function simulatePlanting(
  projection: ClimateProjection,
  cropId: CropPresetId,
  plantingDateInput: string,
): PlantingSimulationResult {
  const crop = CROP_PRESETS[cropId];
  const selectedMonth = parsePlantingMonth(plantingDateInput);

  const allWindows = Array.from({ length: 12 }, (_, idx) =>
    evaluateMonthWindow(projection.months, crop, idx + 1),
  );

  const selectedWindow =
    allWindows.find((w) => w.startMonth === selectedMonth) ?? allWindows[0];

  const bestWindow = [...allWindows].sort((a, b) => b.score - a.score)[0];

  return {
    crop,
    selectedWindow,
    bestWindow,
    allWindows,
  };
}

function evaluateMonthWindow(
  months: MonthlyProjection[],
  crop: CropPreset,
  startMonth: number,
): WindowEvaluation {
  const cycleMonths: MonthlyProjection[] = [];
  for (let offset = 0; offset < crop.cycleMonths; offset += 1) {
    const index = (startMonth - 1 + offset) % 12;
    if (months[index]) cycleMonths.push(months[index]);
  }

  const baselineRainTotal = Math.round(
    cycleMonths.reduce((acc, m) => acc + m.baselineRainMm, 0),
  );
  const projectedRainTotal = Math.round(
    cycleMonths.reduce((acc, m) => acc + m.projectedRainMm, 0),
  );

  const baselineTempAvg = round1(
    cycleMonths.reduce((acc, m) => acc + m.baselineTempC, 0) / Math.max(cycleMonths.length, 1),
  );
  const projectedTempAvg = round1(
    cycleMonths.reduce((acc, m) => acc + m.projectedTempC, 0) / Math.max(cycleMonths.length, 1),
  );

  const rainDeltaPercent =
    baselineRainTotal > 0
      ? round1(((projectedRainTotal - baselineRainTotal) / baselineRainTotal) * 100)
      : 0;
  const tempDeltaC = round1(projectedTempAvg - baselineTempAvg);

  let score = 100;

  if (projectedRainTotal < crop.idealRainMmCycle.min) {
    const deficitRatio =
      (crop.idealRainMmCycle.min - projectedRainTotal) / crop.idealRainMmCycle.min;
    score -= Math.min(55, Math.round(deficitRatio * 85));
  } else if (projectedRainTotal > crop.idealRainMmCycle.max) {
    const excessRatio =
      (projectedRainTotal - crop.idealRainMmCycle.max) / crop.idealRainMmCycle.max;
    score -= Math.min(35, Math.round(excessRatio * 55));
  }

  if (projectedTempAvg > crop.idealTempC.max) {
    const heatExcess = projectedTempAvg - crop.idealTempC.max;
    score -= Math.min(35, Math.round(heatExcess * 7));
  } else if (projectedTempAvg < crop.idealTempC.min) {
    const coldExcess = crop.idealTempC.min - projectedTempAvg;
    score -= Math.min(30, Math.round(coldExcess * 6));
  }

  score = Math.max(12, Math.min(98, score));

  const status: WindowEvaluation['status'] =
    score >= 75 ? 'ideal' : score >= 50 ? 'moderado' : 'risco';

  const recommendations: string[] = [];

  if (projectedRainTotal < crop.idealRainMmCycle.min) {
    const deficit = crop.idealRainMmCycle.min - projectedRainTotal;
    recommendations.push(
      `Pode faltar cerca de ${deficit} mm de chuva até a colheita. Vale preparar irrigação ou plantar semente de ciclo mais rápido.`,
    );
  } else if (projectedRainTotal > crop.idealRainMmCycle.max) {
    recommendations.push(
      `Deve chover bastante (${projectedRainTotal} mm). Cuide do escoamento da água para não apodrecer a raiz.`,
    );
  } else {
    recommendations.push(
      `Quantidade de chuva esperada (${projectedRainTotal} mm) na medida certa para o ${crop.name.toLowerCase()}.`,
    );
  }

  if (projectedTempAvg > crop.idealTempC.max) {
    recommendations.push(
      `Vai fazer calor acima do ideal (${projectedTempAvg}°C). Deixe palhada na terra para segurar a umidade.`,
    );
  } else {
    recommendations.push(
      `Temperatura agradável (${projectedTempAvg}°C) para a planta crescer forte e dar boa colheita.`,
    );
  }

  const harvestIndex = (startMonth - 1 + crop.cycleMonths) % 12;

  return {
    startMonth,
    startMonthLabel: MONTH_LABELS[startMonth - 1],
    harvestMonthLabel: MONTH_LABELS[harvestIndex],
    score,
    status,
    baselineRainTotal,
    projectedRainTotal,
    baselineTempAvg,
    projectedTempAvg,
    rainDeltaPercent,
    tempDeltaC,
    cycleMonths,
    recommendations,
  };
}

function parsePlantingMonth(input: string): number {
  const clean = input.trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(clean)) {
    const m = Number(clean.slice(5, 7));
    if (m >= 1 && m <= 12) return m;
  }
  if (/^\d{1,2}\/\d{1,2}/.test(clean)) {
    const parts = clean.split('/');
    const m = Number(parts[1]);
    if (m >= 1 && m <= 12) return m;
  }
  return new Date().getMonth() + 1;
}

function round1(value: number) {
  return Math.round(value * 10) / 10;
}