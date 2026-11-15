import { useSQLiteContext } from 'expo-sqlite';
import { useCallback, useEffect, useState } from 'react';

import { insertCrop, listCrops } from '@/db/repository';
import type { Crop } from '@/types';

/** Carrega e atualiza as lavouras persistidas no SQLite local. */
export function useCrops() {
  const db = useSQLiteContext();
  const [crops, setCrops] = useState<Crop[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    listCrops(db)
      .then((rows) => {
        if (!active) return;
        setCrops(rows);
        setError(null);
      })
      .catch((cause: unknown) => {
        if (!active) return;
        setError(cause instanceof Error ? cause.message : 'Não foi possível ler as lavouras.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [db]);

  const reload = useCallback(async () => {
    try {
      const rows = await listCrops(db);
      setCrops(rows);
      setError(null);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Não foi possível ler as lavouras.');
    }
  }, [db]);

  const addCrop = useCallback(
    async (crop: Crop) => {
      await insertCrop(db, crop);
      await reload();
    },
    [db, reload],
  );

  return { crops, loading, error, reload, addCrop };
}
