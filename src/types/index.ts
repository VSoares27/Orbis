/**
 * Tipos compartilhados do frontend.
 *
 * Eles descrevem o formato que o backend (ou o serviço NASA POWER) deve
 * devolver para as telas. Ao ligar a API real, basta preencher esses tipos.
 */

import type { ComponentProps } from 'react';
import type MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

/** Nome válido de ícone do MaterialCommunityIcons, para autocomplete. */
export type IconName = ComponentProps<typeof MaterialCommunityIcons>['name'];

export type FarmLocation = {
  label: string;
  city: string;
  state: string;
  latitude: number;
  longitude: number;
};

export type CropStatus = 'saudavel' | 'atencao' | 'colheita';

export type Crop = {
  id: string;
  name: string;
  variety: string;
  areaHectares: number;
  plantedAt: string;
  harvestForecast: string;
  status: CropStatus;
  /** 0 a 100 — progresso do ciclo da cultura. */
  progress: number;
  icon: IconName;
  /** Necessidade hídrica estimada a partir dos dados de clima. */
  irrigation: {
    needMm: number;
    recommendedMm: number;
  };
  nextAction: string;
  notes: string;
};

export type FieldActivityType =
  | 'irrigacao'
  | 'adubacao'
  | 'pulverizacao'
  | 'colheita'
  | 'plantio'
  | 'outro';

/** Registro do caderno de campo, persistido no SQLite local. */
export type FieldActivity = {
  id: string;
  cropId: string;
  cropName: string;
  cropIcon: IconName;
  type: FieldActivityType;
  notes: string;
  occurredAt: string;
  createdAt: string;
};

export type AlertSeverity = 'info' | 'atencao' | 'critico';

export type FarmAlert = {
  id: string;
  severity: AlertSeverity;
  title: string;
  message: string;
  /** Rota interna sugerida para o botão do alerta. */
  href?: string;
  actionLabel: string;
};

export type MarketCategory = 'frutas' | 'verduras' | 'graos' | 'laticinios';

export type MarketItem = {
  id: string;
  product: string;
  category: MarketCategory;
  price: number;
  unit: string;
  quantity: string;
  producer: string;
  location: string;
  distanceKm: number;
  rating: number;
  icon: IconName;
  /** Variação percentual do preço na semana. */
  trend: number;
};

export type WeatherCondition = 'sol' | 'nublado' | 'chuva' | 'tempestade' | 'seco';

/** Um dia de clima já normalizado a partir da resposta da NASA POWER. */
export type DailyClimate = {
  /** Data no formato ISO (YYYY-MM-DD). */
  date: string;
  tempMax: number;
  tempMin: number;
  tempAvg: number;
  /** Precipitação corrigida em mm. */
  rainMm: number;
  humidityAvg: number;
  windAvg: number;
  /** Radiação solar de superfície em kWh/m²/dia. */
  solarKwh: number;
  /** Evapotranspiração de referência em mm/dia (uso agrícola). */
  evapotranspirationMm: number;
  condition: WeatherCondition;
};

export type ClimateSource = 'nasa' | 'demo';

export type ClimateSnapshot = {
  location: FarmLocation;
  /** ISO string de quando os dados foram obtidos. */
  updatedAt: string;
  source: ClimateSource;
  days: DailyClimate[];
};

export type ClimateScenario = 'ssp126' | 'ssp245' | 'ssp370';

export type ProjectionSource = 'nasa-power' | 'nex-gddp';

/** Um mês do ano, comparando o clima observado com a projeção. */
export type MonthlyProjection = {
  /** 1 a 12. */
  month: number;
  /** Rótulo curto em português (Jan, Fev...). */
  label: string;
  baselineRainMm: number;
  projectedRainMm: number;
  baselineTempC: number;
  projectedTempC: number;
};

export type ProjectionAnnual = {
  baselineRainMm: number;
  projectedRainMm: number;
  baselineTempC: number;
  projectedTempC: number;
};

/**
 * Comparação entre a climatologia recente e um cenário futuro do CMIP6.
 * A janela tem cinco anos para suavizar a variabilidade ano a ano.
 */
export type ClimateProjection = {
  location: FarmLocation;
  scenario: ClimateScenario;
  startYear: number;
  endYear: number;
  source: ProjectionSource;
  /** Nome legível do conjunto de modelos usado. */
  model: string;
  updatedAt: string;
  months: MonthlyProjection[];
  annual: ProjectionAnnual;
  notes: string[];
};
