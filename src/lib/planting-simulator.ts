import safrasData from '@/data/serra-talhada-safras.json';
import { MONTH_LABELS } from '@/lib/projection';
import { isNearSerraTalhada } from '@/lib/serra-talhada';
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
  const { day: selectedDay, month: selectedMonth } = parsePlantingDayMonth(plantingDateInput);

  const evaluated = Array.from({ length: 12 }, (_, idx) =>
    evaluateMonthWindow(projection.months, crop, idx + 1),
  );
  const baseSelected =
    evaluated.find((w) => w.startMonth === selectedMonth) ?? evaluated[0];

  // Resultado real das safras de Serra Talhada (só na região e para culturas
  // com dado): frases nas recomendações e, fora do cenário "Mais chuva", um teto
  // na nota quando faltou chuva na maioria das últimas 10 safras.
  const regional = regionalHarvestOptions(projection, cropId);
  const harvestTexts = harvestRecommendations(projection, cropId, selectedDay, selectedMonth);
  const capScores = regional !== null && projection.scenario !== 'ssp126';

  const allWindows = evaluated.map((w) => {
    let next = w;
    if (capScores && regional) {
      const record =
        w === baseSelected
          ? nearestOption(regional, selectedDay, selectedMonth)
          : fewestShortInMonth(regional, w.startMonth);
      next = capByHarvestRecord(next, record);
    }
    if (w === baseSelected && harvestTexts.length > 0) {
      next = { ...next, recommendations: [...next.recommendations, ...harvestTexts] };
    }
    return next;
  });

  const selectedWindow =
    allWindows.find((w) => w.startMonth === baseSelected.startMonth) ?? allWindows[0];

  // Na região de Serra Talhada, a melhor época é buscada só nos meses que a
  // análise cobre (janeiro a março, a época de plantio da região). Cada mês é
  // avaliado pela sua melhor data, inclusive o mês escolhido: assim o aviso de
  // "melhor época" não aponta outro mês quando a melhor data está no mesmo mês
  // (ex.: feijão em 11/02, melhor data 21/02).
  const regionMonths = (w: WindowEvaluation) =>
    regional !== null && regional.some((o) => plantingMonth(o.planting) === w.startMonth);
  const candidates =
    regional === null
      ? allWindows
      : capScores
        ? evaluated
            .filter(regionMonths)
            .map((w) => capByHarvestRecord(w, fewestShortInMonth(regional, w.startMonth)))
        : allWindows.filter(regionMonths);
  const bestWindow = [...(candidates.length > 0 ? candidates : allWindows)].sort(
    (a, b) => b.score - a.score,
  )[0];

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

  const status = statusFromScore(score);

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

function statusFromScore(score: number): WindowEvaluation['status'] {
  return score >= 75 ? 'ideal' : score >= 50 ? 'moderado' : 'risco';
}

export function parsePlantingMonth(input: string): number {
  return parsePlantingDayMonth(input).month;
}

/**
 * Lê dia e mês de "AAAA-MM-DD" ou "DD/MM[/AAAA]".
 * Sem data válida, usa o dia de hoje (mesmo comportamento de antes para o mês).
 */
export function parsePlantingDayMonth(input: string): { day: number; month: number } {
  const clean = input.trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(clean)) {
    const m = Number(clean.slice(5, 7));
    const d = Number(clean.slice(8, 10));
    if (m >= 1 && m <= 12) return { day: isDay(d) ? d : 1, month: m };
  }
  if (/^\d{1,2}\/\d{1,2}/.test(clean)) {
    const parts = clean.split('/');
    const d = Number(parts[0]);
    const m = Number(parts[1]);
    if (m >= 1 && m <= 12) return { day: isDay(d) ? d : 1, month: m };
  }
  const today = new Date();
  return { day: today.getDate(), month: today.getMonth() + 1 };
}

function isDay(value: number) {
  return Number.isInteger(value) && value >= 1 && value <= 31;
}

// ---------------------------------------------------------------------------
// Análise das 40 safras de Serra Talhada (src/data/serra-talhada-safras.json)
// ---------------------------------------------------------------------------

type HarvestCounts = {
  suficiente: number;
  apertado: number;
  insuficiente: number;
  total: number;
  from: number;
  to: number;
};

type HarvestOption = {
  variant: string;
  variantLabel: string;
  /** "MM-DD". */
  planting: string;
  last10: HarvestCounts;
};

type HarvestCrop = {
  label: string;
  best: HarvestOption;
  options: HarvestOption[];
};

/** Culturas do simulador que têm resultado na análise. Soja não tem. */
const HARVEST_CROPS: Partial<Record<CropPresetId, HarvestCrop>> = {
  milho: safrasData.crops.milho,
  feijao: safrasData.crops.feijao,
  mandioca: safrasData.crops.mandioca,
};

/** Variantes de ciclo normal (o ciclo precoce do milho fica de fora). */
const NORMAL_VARIANTS = new Set(['normal', 'padrao']);

/**
 * Teto da nota pelo histórico real (suposição do time, documentada no README):
 * faltou chuva em 6 ou mais das últimas 10 safras → no máximo 49 ("Risco alto");
 * em 4 ou 5 → no máximo 74 ("Atenção"). Abaixo disso a nota não muda.
 */
const RECORD_CAPS = [
  { minShortShare: 0.6, maxScore: 49 },
  { minShortShare: 0.4, maxScore: 74 },
] as const;

/** Opções de ciclo normal da cultura, só se a projeção estiver na região. */
function regionalHarvestOptions(
  projection: ClimateProjection,
  cropId: CropPresetId,
): HarvestOption[] | null {
  const crop = HARVEST_CROPS[cropId];
  if (!crop) return null;
  const { latitude, longitude } = projection.location;
  if (!isNearSerraTalhada(latitude, longitude)) return null;
  return crop.options.filter((option) => NORMAL_VARIANTS.has(option.variant));
}

/** Opção do mesmo mês com o dia mais próximo; em empate, a data mais cedo. */
function nearestOption(options: HarvestOption[], day: number, month: number) {
  const sameMonth = options.filter((option) => plantingMonth(option.planting) === month);
  if (sameMonth.length === 0) return undefined;
  return sameMonth.reduce((closest, option) =>
    Math.abs(plantingDay(option.planting) - day) < Math.abs(plantingDay(closest.planting) - day)
      ? option
      : closest,
  );
}

/** Opção do mês com menos safras de falta de chuva (a mais favorável do mês). */
function fewestShortInMonth(options: HarvestOption[], month: number) {
  const sameMonth = options.filter((option) => plantingMonth(option.planting) === month);
  if (sameMonth.length === 0) return undefined;
  return sameMonth.reduce((best, option) =>
    option.last10.insuficiente < best.last10.insuficiente ? option : best,
  );
}

function capByHarvestRecord(
  window: WindowEvaluation,
  record: HarvestOption | undefined,
): WindowEvaluation {
  if (!record || record.last10.total <= 0) return window;
  const shortShare = record.last10.insuficiente / record.last10.total;
  const cap = RECORD_CAPS.find((rule) => shortShare >= rule.minShortShare);
  if (!cap || window.score <= cap.maxScore) return window;
  return { ...window, score: cap.maxScore, status: statusFromScore(cap.maxScore) };
}

/**
 * Frases com o resultado real das safras para a data escolhida.
 * Todos os números vêm do JSON; nada é calculado a partir da projeção.
 */
export function harvestRecommendations(
  projection: ClimateProjection,
  cropId: CropPresetId,
  day: number,
  month: number,
): string[] {
  const crop = HARVEST_CROPS[cropId];
  const options = regionalHarvestOptions(projection, cropId);
  if (!crop || !options || options.length === 0) return [];
  // Só o milho tem mais de uma variante (normal e precoce): aí o rótulo entra no texto.
  const hasSeveralVariants = new Set(crop.options.map((option) => option.variant)).size > 1;
  // Datas com menos safras de falta de chuva nos últimos 10 anos. Pode haver
  // empate (ex.: mandioca); nesse caso todas são citadas. O `best` do JSON
  // desempata pelos últimos 20 anos, número que não está no arquivo.
  const fewestShort = Math.min(...options.map((option) => option.last10.insuficiente));
  const bestOptions = options
    .filter((option) => option.last10.insuficiente === fewestShort)
    .sort((a, b) => a.planting.localeCompare(b.planting));
  const bestTotal = bestOptions[0].last10.total;
  const bestDates = joinPt(bestOptions.map((option) => formatPlanting(option.planting)));
  const bestVariant = hasSeveralVariants ? ` (${variantText(bestOptions[0].variantLabel)})` : '';
  const bestClause =
    bestOptions.length === 1
      ? `a data com menos falta de chuva foi ${bestDates}${bestVariant}: faltou em ${fewestShort} das últimas ${bestTotal} safras.`
      : `as datas com menos falta de chuva foram ${bestDates}${bestVariant}: faltou em ${fewestShort} das últimas ${bestTotal} safras em cada uma.`;

  const chosen = nearestOption(options, day, month);

  if (!chosen) {
    return [`Na época de plantio da região (janeiro a março), ${bestClause}`];
  }

  const { insuficiente, apertado, suficiente, total, from, to } = chosen.last10;
  const texts = [
    `Em Serra Talhada, quem plantou ${crop.label.toLowerCase()} perto de ${formatPlanting(chosen.planting)} nos últimos ${total} anos: faltou chuva em ${insuficiente} ${insuficiente === 1 ? 'safra' : 'safras'}, ficou apertado em ${apertado} e choveu o bastante em ${suficiente} (NASA POWER, ${from}–${to}).`,
  ];

  if (!bestOptions.includes(chosen)) {
    texts.push(bestClause.charAt(0).toUpperCase() + bestClause.slice(1));
  }

  return texts;
}

/** ["a", "b", "c"] → "a, b e c". */
function joinPt(items: string[]) {
  if (items.length <= 1) return items.join('');
  return `${items.slice(0, -1).join(', ')} e ${items[items.length - 1]}`;
}

function plantingMonth(planting: string) {
  return Number(planting.slice(0, 2));
}

function plantingDay(planting: string) {
  return Number(planting.slice(3, 5));
}

/** "02-11" → "11/02". */
function formatPlanting(planting: string) {
  return `${planting.slice(3, 5)}/${planting.slice(0, 2)}`;
}

/** "Ciclo normal (cerca de 140 dias)" → "ciclo normal, cerca de 140 dias". */
function variantText(label: string) {
  const flat = label.replace(/\s*\(([^)]*)\)\s*$/, ', $1');
  return flat.charAt(0).toLowerCase() + flat.slice(1);
}

function round1(value: number) {
  return Math.round(value * 10) / 10;
}