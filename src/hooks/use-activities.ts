import { useSQLiteContext } from 'expo-sqlite';
import { useCallback, useEffect, useState } from 'react';

import {
  deleteActivity,
  insertActivity,
  listActivities,
  type NewActivityInput,
} from '@/db/repository';
import type { FieldActivity } from '@/types';

/** Carrega e grava os registros da caderneta no SQLite local. */
export function useActivities() {
  const db = useSQLiteContext();
  const [activities, setActivities] = useState<FieldActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    listActivities(db)
      .then((rows) => {
        if (!active) return;
        setActivities(rows);
        setError(null);
      })
      .catch((cause: unknown) => {
        if (!active) return;
        setError(
          cause instanceof Error ? cause.message : 'Não foi possível ler a caderneta.',
        );
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
      const rows = await listActivities(db);
      setActivities(rows);
      setError(null);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Não foi possível ler a caderneta.');
    }
  }, [db]);

  const addActivity = useCallback(
    async (input: NewActivityInput) => {
      await insertActivity(db, input);
      await reload();
    },
    [db, reload],
  );

  const removeActivity = useCallback(
    async (id: string) => {
      await deleteActivity(db, id);
      await reload();
    },
    [db, reload],
  );

  return { activities, loading, error, reload, addActivity, removeActivity };
}
