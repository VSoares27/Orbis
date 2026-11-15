/** Carrega a simulação climática para a localização atual do aparelho. */

import { useCallback, useEffect, useState } from 'react';

import { useDeviceLocation } from '@/context/device-location';
import { fetchNasaProjection } from '@/services/nasa-projection';
import type { ClimateProjection, ClimateScenario } from '@/types';

export function useNasaProjection(startYear: number, scenario: ClimateScenario) {
  const { location } = useDeviceLocation();
  const [projection, setProjection] = useState<ClimateProjection | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;

    if (!location) {
      setProjection(null);
      setError(null);
      setLoading(false);
      return;
    }

    setProjection(null);
    setError(null);
    setLoading(true);

    fetchNasaProjection(location, startYear, scenario)
      .then((result) => {
        if (!cancelled) setProjection(result);
      })
      .catch((cause: unknown) => {
        if (!cancelled) {
          setError(
            cause instanceof Error
              ? cause.message
              : 'Não foi possível calcular a simulação climática.',
          );
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [location, startYear, scenario, reloadKey]);

  const refresh = useCallback(() => {
    setReloadKey((current) => current + 1);
  }, []);

  return { projection, loading, error, refresh };
}
