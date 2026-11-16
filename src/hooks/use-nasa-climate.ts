/**
 * Hook que centraliza a consulta de clima.
 *
 * 1. Lê a localização real do aparelho (`DeviceLocationProvider`).
 * 2. Enquanto o GPS não responde, mostra a série demonstrativa (a tela nunca fica vazia).
 * 3. Com as coordenadas, busca a NASA POWER; se falhar, mantém a série demo
 *    já vinculada à localização e preenche `error`.
 */

import { useCallback, useEffect, useMemo, useState } from 'react';

import { createMockClimate } from '@/data/mock';
import { useDeviceLocation } from '@/context/device-location';
import { fetchNasaClimate } from '@/services/nasa-power';
import type { ClimateSnapshot, FarmLocation } from '@/types';

const PENDING_LOCATION: FarmLocation = {
  label: 'Localização atual',
  city: 'Obtendo localização...',
  state: 'Aguardando GPS',
  latitude: 0,
  longitude: 0,
};

const NASA_ERROR = 'Não foi possível consultar a NASA POWER. Exibindo dados demonstrativos.';

type QueryResult = {
  key: string;
  snapshot: ClimateSnapshot;
  error: string | null;
};

function keyOf(location: FarmLocation) {
  return `${location.latitude},${location.longitude}`;
}

async function query(location: FarmLocation): Promise<QueryResult> {
  const key = keyOf(location);
  try {
    const result = await fetchNasaClimate(location);
    if (result && Array.isArray(result.days) && result.days.length > 0) {
      return { key, snapshot: result, error: null };
    }
  } catch {
    // cai no fallback abaixo
  }
  return { key, snapshot: createMockClimate(location), error: NASA_ERROR };
}

export function useNasaClimate() {
  const {
    location,
    loading: locating,
    error: locationError,
    refreshLocation,
  } = useDeviceLocation();

  const [result, setResult] = useState<QueryResult | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  // Busca automática sempre que as coordenadas reais mudam.
  useEffect(() => {
    if (!location) return;

    let cancelled = false;
    void query(location).then((next) => {
      if (!cancelled) setResult(next);
    });

    return () => {
      cancelled = true;
    };
  }, [location]);

  const isCurrent = !!location && result?.key === keyOf(location);

  // Série demo exibida enquanto a consulta não termina.
  const placeholder = useMemo(
    () => createMockClimate(location ?? PENDING_LOCATION),
    [location],
  );

  const snapshot = isCurrent && result ? result.snapshot : placeholder;
  // Com uma localização já em uso (real ou o local padrão), o GPS ainda procurando
  // não deixa a tela em "atualizando": só a consulta à NASA conta.
  const loading = (locating && !location) || refreshing || (!!location && !isCurrent);
  const error = isCurrent && result ? result.error : location ? null : locationError;

  /** Usado pelo pull-to-refresh e pelos botões de atualizar. */
  const refresh = useCallback(async () => {
    if (!location) {
      await refreshLocation();
      return;
    }
    setRefreshing(true);
    try {
      setResult(await query(location));
    } finally {
      setRefreshing(false);
    }
  }, [location, refreshLocation]);

  return { snapshot, loading, error, refresh };
}
