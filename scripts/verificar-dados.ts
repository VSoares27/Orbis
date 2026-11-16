/**
 * Verificação automática da camada de dados (sem rede).
 *
 * Rodar com um destes comandos:
 *   npx tsx scripts/verificar-dados.ts
 *   node --import ./scripts/ts-register.mjs scripts/verificar-dados.ts   (Node 24, sem instalar nada)
 *
 * Usa só o histórico embutido de Serra Talhada (src/data/serra-talhada-clima.json).
 * O `fetch` é substituído por uma função que sempre falha, então nenhuma
 * chamada sai para a internet. Sai com código 1 se qualquer verificação falhar.
 */

import { simulatePlanting } from '../src/lib/planting-simulator';
import { embeddedSerraTalhadaYears } from '../src/lib/serra-talhada';
import {
  buildProjectionFromYears,
  fetchNasaProjection,
  OFFLINE_FALLBACK_NOTE,
  PROJECTION_ERROR_MESSAGE,
  scenarioYears,
} from '../src/services/nasa-projection';
import type { ClimateScenario, FarmLocation } from '../src/types';

(globalThis as { __DEV__?: boolean }).__DEV__ = false;

// Bloqueia a rede: qualquer fetch falha como se a NASA estivesse fora do ar.
globalThis.fetch = (async () => {
  throw new TypeError('rede bloqueada pelo script de verificação');
}) as typeof fetch;

const SERRA_TALHADA: FarmLocation = {
  label: 'Local padrão',
  city: 'Serra Talhada',
  state: 'PE',
  latitude: -7.988,
  longitude: -38.2963,
};
const RECIFE: FarmLocation = {
  label: 'Teste',
  city: 'Recife',
  state: 'PE',
  latitude: -8.05,
  longitude: -34.9,
};

const EXPECTED_RAIN: Record<ClimateScenario, number> = {
  ssp126: 948,
  ssp245: 648,
  ssp370: 382,
};
const NAMES: Record<ClimateScenario, string> = {
  ssp126: 'Mais chuva',
  ssp245: 'Normal',
  ssp370: 'Mais seco',
};

let failures = 0;

function check(ok: boolean, label: string, detail = '') {
  console.log(`${ok ? '  OK  ' : ' FALHA'} ${label}${detail ? ` — ${detail}` : ''}`);
  if (!ok) failures += 1;
}

async function main() {
  const years = embeddedSerraTalhadaYears();
  console.log(`Histórico embutido: ${years.length} anos (${years[0].year}–${years[years.length - 1].year})\n`);

  // 1. Três cenários e chuva anual
  console.log('1. Chuva anual por cenário (Serra Talhada)');
  const annual = {} as Record<ClimateScenario, number>;
  for (const scenario of ['ssp126', 'ssp245', 'ssp370'] as const) {
    const projection = buildProjectionFromYears(SERRA_TALHADA, years, scenario);
    annual[scenario] = projection.annual.projectedRainMm;
    const group = scenarioYears(years, scenario).map((year) => year.year);
    const expected = EXPECTED_RAIN[scenario];
    const diff = Math.abs(annual[scenario] - expected) / expected;
    check(
      diff <= 0.1,
      `${NAMES[scenario].padEnd(10)} ${String(annual[scenario]).padStart(4)} mm`,
      `esperado ~${expected} mm (±10%); ${group.length} anos: ${group.join(', ')}`,
    );
    console.log(`         nota: ${projection.notes[0]}`);
  }
  check(
    annual.ssp245 >= 600 && annual.ssp245 <= 700,
    'Normal entre 600 e 700 mm',
    `${annual.ssp245} mm`,
  );

  // 2. Ordem dos cenários
  console.log('\n2. Ordem dos cenários');
  check(
    annual.ssp126 > annual.ssp245 && annual.ssp245 > annual.ssp370,
    'Mais chuva > Normal > Mais seco',
    `${annual.ssp126} > ${annual.ssp245} > ${annual.ssp370}`,
  );

  const normal = buildProjectionFromYears(SERRA_TALHADA, years, 'ssp245');
  const normalSim = simulatePlanting(normal, 'milho', '21/01/2027');
  check(
    normalSim.selectedWindow.rainDeltaPercent === 0 && normalSim.selectedWindow.tempDeltaC === 0,
    'No Normal, rainDeltaPercent e tempDeltaC são 0',
    `${normalSim.selectedWindow.rainDeltaPercent}% / ${normalSim.selectedWindow.tempDeltaC} °C`,
  );
  check(
    normal.source === 'nasa-power' && !/ACCESS|NEX|alibrad/i.test(`${normal.model} ${normal.notes.join(' ')}`),
    'Fonte e modelo honestos',
    `source=${normal.source}; model="${normal.model}"`,
  );

  // 3. Milho em 21/01/2027 no Normal
  console.log('\n3. simulatePlanting — milho, 21/01/2027, Normal');
  console.log(`   nota ${normalSim.selectedWindow.score} (${normalSim.selectedWindow.status})`);
  for (const text of normalSim.selectedWindow.recommendations) console.log(`   - ${text}`);
  const milhoTexts = normalSim.selectedWindow.recommendations.join('\n');
  check(
    milhoTexts.includes(
      'faltou chuva em 8 safras, ficou apertado em 1 e choveu o bastante em 1',
    ),
    'Frase da safra com 8/1/1',
  );
  check(
    /A data com menos falta de chuva foi 11\/02.*faltou em 5 das últimas 10 safras/.test(milhoTexts),
    'Melhor data 11/02 (faltou em 5)',
  );

  // Nota segue o histórico real (Serra Talhada, fora do cenário Mais chuva)
  check(
    normalSim.selectedWindow.score <= 49 && normalSim.selectedWindow.status === 'risco',
    'Milho 21/01 (8 de 10 com falta de chuva): nota até 49 e "risco"',
    `nota ${normalSim.selectedWindow.score} (${normalSim.selectedWindow.status})`,
  );
  check(
    normalSim.bestWindow.startMonth === 2 && normalSim.bestWindow.score <= 74,
    'Melhor época do milho em fevereiro, com nota até 74',
    `${normalSim.bestWindow.startMonthLabel} ${normalSim.bestWindow.score}`,
  );
  const wetSim = simulatePlanting(
    buildProjectionFromYears(SERRA_TALHADA, years, 'ssp126'),
    'milho',
    '21/01/2027',
  );
  const wetRecife = simulatePlanting(
    buildProjectionFromYears(RECIFE, years, 'ssp126'),
    'milho',
    '21/01/2027',
  );
  check(
    wetSim.selectedWindow.score === wetRecife.selectedWindow.score,
    'No cenário Mais chuva a nota não recebe teto do histórico',
    `nota ${wetSim.selectedWindow.score}`,
  );

  // 4. Soja não tem dado de safra
  console.log('\n4. simulatePlanting — soja, 21/01/2027, Normal');
  const sojaTexts = simulatePlanting(normal, 'soja', '21/01/2027').selectedWindow.recommendations;
  for (const text of sojaTexts) console.log(`   - ${text}`);
  check(
    !sojaTexts.some((text) => text.includes('Serra Talhada') || text.includes('falta de chuva')),
    'Soja sem frase de safra',
  );

  // Extra: fora de Serra Talhada nada muda
  console.log('\n5. Extras');
  const recife = buildProjectionFromYears(RECIFE, years, 'ssp245');
  const recifeSim = simulatePlanting(recife, 'milho', '21/01/2027');
  const recifeTexts = recifeSim.selectedWindow.recommendations;
  check(
    !recifeTexts.some((text) => text.includes('Serra Talhada')),
    'Fora de Serra Talhada (Recife) sem frase de safra',
  );
  check(
    recifeSim.selectedWindow.score > 49,
    'Fora de Serra Talhada a nota segue a regra original',
    `nota ${recifeSim.selectedWindow.score}`,
  );
  const sojaSim = simulatePlanting(normal, 'soja', '21/01/2027');
  check(
    sojaSim.selectedWindow.score === recifeSim.selectedWindow.score,
    'Soja (sem dado de safra) não recebe teto em Serra Talhada',
    `nota ${sojaSim.selectedWindow.score}`,
  );

  // Extra: T2 — rede bloqueada
  const offline = await fetchNasaProjection(SERRA_TALHADA, 2027, 'ssp370');
  check(
    offline.notes.includes(OFFLINE_FALLBACK_NOTE) && offline.annual.projectedRainMm === annual.ssp370,
    'Rede bloqueada em Serra Talhada usa dados embutidos',
    `${offline.annual.projectedRainMm} mm`,
  );
  let recifeError = '';
  try {
    await fetchNasaProjection(RECIFE, 2027, 'ssp245');
  } catch (error) {
    recifeError = error instanceof Error ? error.message : String(error);
  }
  check(
    recifeError === PROJECTION_ERROR_MESSAGE,
    'Rede bloqueada fora de Serra Talhada mostra o erro de sempre',
    recifeError || 'não lançou erro',
  );

  console.log(failures === 0 ? '\nTudo certo.' : `\n${failures} verificação(ões) falharam.`);
  process.exit(failures === 0 ? 0 : 1);
}

main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
