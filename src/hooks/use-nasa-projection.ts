/** Carrega a simulação climática para a localização atual do aparelho. */

import { useCallback, useEffect, useState } from 'react';

import { useDeviceLocation } from '@/context/device-location';
import { fetchNasaProjection } from '@/services/nasa-projection';
import type { ClimateProjection, ClimateScenario } from '@/types';

type QueryResult = {
  key: string;
  projection: ClimateProjection | null;
  error: string | null;
};

export function useNasaProjection(startYear: number, scenario: ClimateScenario) {
  const { location } = useDeviceLocation();
  const [result, setResult] = useState<QueryResult | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  // Cada combinação de local, cenário e recarga tem sua própria chave. Enquanto o
  // resultado guardado não é da chave atual, a tela vê "carregando" (sem setState
  // síncrono dentro do efeito).
  const key = location
    ? `${location.latitude},${location.longitude}:${startYear}:${scenario}:${reloadKey}`
    : null;

  useEffect(() => {
    if (!location || !key) return;

    let cancelled = false;

    fetchNasaProjection(location, startYear, scenario)
      .then((projection) => {
        if (!cancelled) setResult({ key, projection, error: null });
      })
      .catch((cause: unknown) => {
        if (!cancelled) {
          setResult({
            key,
            projection: null,
            error:
              cause instanceof Error
                ? cause.message
                : 'Não foi possível calcular a simulação climática.',
          });
        }
      });

    return () => {
      cancelled = true;
    };
  }, [key, location, startYear, scenario]);

  const refresh = useCallback(() => {
    setReloadKey((current) => current + 1);
  }, []);

  const current = key !== null && result?.key === key ? result : null;

  return {
    projection: current?.projection ?? null,
    loading: key !== null && current === null,
    error: current?.error ?? null,
    refresh,
  };
}
