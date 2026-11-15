/** Rótulos e ícones dos registros da caderneta. */

import type { FieldActivityType, IconName } from '@/types';

export const activityTypes: FieldActivityType[] = [
  'irrigacao',
  'adubacao',
  'pulverizacao',
  'colheita',
  'plantio',
  'outro',
];

export const activityTypeLabels: Record<FieldActivityType, string> = {
  irrigacao: 'Irrigação',
  adubacao: 'Adubação',
  pulverizacao: 'Pulverização',
  colheita: 'Colheita',
  plantio: 'Plantio',
  outro: 'Outro manejo',
};

export const activityTypeIcons: Record<FieldActivityType, IconName> = {
  irrigacao: 'water-outline',
  adubacao: 'leaf',
  pulverizacao: 'spray',
  colheita: 'basket-outline',
  plantio: 'sprout',
  outro: 'clipboard-text-outline',
};

export const activityTypeTones: Record<
  FieldActivityType,
  'green' | 'amber' | 'sky' | 'neutral'
> = {
  irrigacao: 'sky',
  adubacao: 'green',
  pulverizacao: 'amber',
  colheita: 'green',
  plantio: 'green',
  outro: 'neutral',
};
