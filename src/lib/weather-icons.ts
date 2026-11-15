import type { IconName, WeatherCondition } from '@/types';

/** Ícone e cor de cada condição do tempo. */
export const weatherIconMap: Record<WeatherCondition, { icon: IconName; accent: string }> = {
  sol: { icon: 'weather-sunny', accent: '#D97706' },
  nublado: { icon: 'weather-partly-cloudy', accent: '#0284C7' },
  chuva: { icon: 'weather-rainy', accent: '#0284C7' },
  tempestade: { icon: 'weather-lightning-rainy', accent: '#164734' },
  seco: { icon: 'weather-sunny-alert', accent: '#D97706' },
};
