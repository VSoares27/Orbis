/**
 * Dados de demonstração.
 *
 * As lavouras abaixo são usadas como seed do SQLite local na primeira execução.
 * O clima é o fallback exibido quando a NASA POWER não pode ser consultada.
 * Todos os formatos seguem os tipos em `src/types`.
 *
 * IMPORTANTE: os dados de clima abaixo são apenas um fallback. Quando há
 * internet, o hook `useNasaClimate` busca os dados reais da NASA POWER.
 */

import type {
  ClimateSnapshot,
  Crop,
  DailyClimate,
  FarmLocation,
  MarketItem,
  WeatherCondition,
} from '@/types';

function toIsoDate(date: Date) {
  return date.toISOString().slice(0, 10);
}

function isoDaysAgo(days: number) {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return toIsoDate(date);
}

function isoDaysFromNow(days: number) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return toIsoDate(date);
}

export const mockCrops: Crop[] = [
  {
    id: 'crop-milho',
    name: 'Milho',
    variety: 'AG 1051',
    areaHectares: 1.2,
    plantedAt: isoDaysAgo(62),
    harvestForecast: isoDaysFromNow(38),
    status: 'saudavel',
    progress: 62,
    icon: 'corn',
    irrigation: { needMm: 28, recommendedMm: 24 },
    nextAction: 'Adubação de cobertura',
    notes:
      'Boa umidade no solo após as chuvas da semana. Acompanhar aparecimento de lagarta-do-cartucho.',
  },
  {
    id: 'crop-feijao',
    name: 'Feijão',
    variety: 'Carioca',
    areaHectares: 0.8,
    plantedAt: isoDaysAgo(41),
    harvestForecast: isoDaysFromNow(24),
    status: 'atencao',
    progress: 71,
    icon: 'sprout',
    irrigation: { needMm: 32, recommendedMm: 18 },
    nextAction: 'Verificar irrigação',
    notes:
      'Solo com déficit hídrico leve. Priorize o turno da manhã para reduzir perdas por evaporação.',
  },
  {
    id: 'crop-cenoura',
    name: 'Cenoura',
    variety: 'Brasília',
    areaHectares: 0.5,
    plantedAt: isoDaysAgo(55),
    harvestForecast: isoDaysFromNow(12),
    status: 'colheita',
    progress: 91,
    icon: 'carrot',
    irrigation: { needMm: 14, recommendedMm: 14 },
    nextAction: 'Programar colheita',
    notes: 'Ciclo próximo do fim. Separe os lotes por tamanho para melhor preço no mercado.',
  },
  {
    id: 'crop-pimentao',
    name: 'Pimentão',
    variety: 'Magali',
    areaHectares: 0.35,
    plantedAt: isoDaysAgo(28),
    harvestForecast: isoDaysFromNow(48),
    status: 'saudavel',
    progress: 38,
    icon: 'chili-mild',
    irrigation: { needMm: 22, recommendedMm: 20 },
    nextAction: 'Monitorar pragas',
    notes: 'Plantas vigorosas. Faça a inspeção semanal de ácaros e trips nas folhas novas.',
  },
];

export const mockMarket: MarketItem[] = [
  {
    id: 'market-1',
    product: 'Tomate italiano',
    category: 'verduras',
    price: 4.5,
    unit: 'kg',
    quantity: '120 kg disponíveis',
    producer: 'Maria Aparecida',
    location: 'Patrocínio, MG',
    distanceKm: 6.2,
    rating: 4.9,
    icon: 'food-apple',
    trend: 8.4,
  },
  {
    id: 'market-2',
    product: 'Milho verde',
    category: 'graos',
    price: 2.8,
    unit: 'kg',
    quantity: '200 kg disponíveis',
    producer: 'João Batista',
    location: 'Coromandel, MG',
    distanceKm: 21.5,
    rating: 4.7,
    icon: 'corn',
    trend: -2.1,
  },
  {
    id: 'market-3',
    product: 'Queijo minas frescal',
    category: 'laticinios',
    price: 32,
    unit: 'kg',
    quantity: '18 kg disponíveis',
    producer: 'Sítio Boa Vista',
    location: 'Patrocínio, MG',
    distanceKm: 9.8,
    rating: 5,
    icon: 'cheese',
    trend: 3.2,
  },
  {
    id: 'market-4',
    product: 'Cenoura',
    category: 'verduras',
    price: 3.2,
    unit: 'kg',
    quantity: '80 kg disponíveis',
    producer: 'Antônio Carlos',
    location: 'Monte Carmelo, MG',
    distanceKm: 34.1,
    rating: 4.6,
    icon: 'carrot',
    trend: 1.5,
  },
  {
    id: 'market-5',
    product: 'Mamão papaia',
    category: 'frutas',
    price: 5.9,
    unit: 'kg',
    quantity: '60 kg disponíveis',
    producer: 'Luciana Alves',
    location: 'Patrocínio, MG',
    distanceKm: 4.4,
    rating: 4.8,
    icon: 'fruit-cherries',
    trend: -4.3,
  },
  {
    id: 'market-6',
    product: 'Ovos caipiras',
    category: 'laticinios',
    price: 14,
    unit: 'dúzia',
    quantity: '25 dúzias disponíveis',
    producer: 'Chácara Esperança',
    location: 'Serra do Salitre, MG',
    distanceKm: 28.7,
    rating: 4.9,
    icon: 'egg',
    trend: 0,
  },
];

/** Série de demonstração usada quando a NASA POWER não pode ser consultada. */
const demoDays: Omit<DailyClimate, 'date'>[] = [
  {
    tempMax: 29,
    tempMin: 18,
    tempAvg: 23.4,
    rainMm: 0,
    humidityAvg: 62,
    windAvg: 9,
    solarKwh: 5.8,
    evapotranspirationMm: 4.6,
    condition: 'sol',
  },
  {
    tempMax: 29,
    tempMin: 19,
    tempAvg: 23.8,
    rainMm: 2.4,
    humidityAvg: 65,
    windAvg: 8,
    solarKwh: 5.2,
    evapotranspirationMm: 4.2,
    condition: 'nublado',
  },
  {
    tempMax: 27,
    tempMin: 18,
    tempAvg: 22.1,
    rainMm: 12.6,
    humidityAvg: 78,
    windAvg: 11,
    solarKwh: 3.9,
    evapotranspirationMm: 3.1,
    condition: 'chuva',
  },
  {
    tempMax: 26,
    tempMin: 17,
    tempAvg: 21.3,
    rainMm: 18.2,
    humidityAvg: 85,
    windAvg: 12,
    solarKwh: 3.1,
    evapotranspirationMm: 2.6,
    condition: 'tempestade',
  },
  {
    tempMax: 28,
    tempMin: 18,
    tempAvg: 22.7,
    rainMm: 4.1,
    humidityAvg: 72,
    windAvg: 9,
    solarKwh: 4.8,
    evapotranspirationMm: 3.8,
    condition: 'chuva',
  },
  {
    tempMax: 30,
    tempMin: 19,
    tempAvg: 24.5,
    rainMm: 0,
    humidityAvg: 60,
    windAvg: 7,
    solarKwh: 5.9,
    evapotranspirationMm: 4.9,
    condition: 'sol',
  },
  {
    tempMax: 31,
    tempMin: 20,
    tempAvg: 25.2,
    rainMm: 0,
    humidityAvg: 58,
    windAvg: 8,
    solarKwh: 6.1,
    evapotranspirationMm: 5.2,
    condition: 'seco',
  },
];

/**
 * Série demonstrativa vinculada à localização do aparelho.
 * É usada somente quando a NASA POWER não responde.
 */
export function createMockClimate(location: FarmLocation): ClimateSnapshot {
  return {
    location,
    updatedAt: new Date().toISOString(),
    source: 'demo',
    days: demoDays.map((day, index) => ({
      ...day,
      date: isoDaysAgo(demoDays.length - 1 - index),
    })),
  };
}

/** Rótulos amigáveis usados em várias telas. */
export const conditionLabels: Record<WeatherCondition, string> = {
  sol: 'Céu aberto',
  nublado: 'Parcialmente nublado',
  chuva: 'Chuva',
  tempestade: 'Tempestade',
  seco: 'Tempo seco',
};

export const cropStatusLabels = {
  saudavel: 'Saudável',
  atencao: 'Atenção',
  colheita: 'Pronto para colheita',
} as const;

export const categoryLabels = {
  frutas: 'Frutas',
  verduras: 'Verduras',
  graos: 'Grãos',
  laticinios: 'Laticínios',
} as const;
