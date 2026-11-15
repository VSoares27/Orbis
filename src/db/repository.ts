/**
 * Repositório de lavouras e registros da caderneta.
 *
 * Toda leitura/escrita do app passa por aqui. As consultas usam parâmetros
 * nomeados para evitar SQL injection e manter os tipos previsíveis.
 */

import type { SQLiteDatabase } from 'expo-sqlite';

import type {
  Crop,
  CropStatus,
  FieldActivity,
  FieldActivityType,
  IconName,
} from '@/types';

type CropRow = {
  id: string;
  name: string;
  variety: string;
  area_hectares: number;
  planted_at: string;
  harvest_forecast: string;
  status: string;
  progress: number;
  icon: string;
  irrigation_need_mm: number;
  irrigation_recommended_mm: number;
  next_action: string;
  notes: string;
  created_at: string;
};

type ActivityRow = {
  id: string;
  crop_id: string;
  crop_name: string | null;
  crop_icon: string | null;
  type: string;
  notes: string;
  occurred_at: string;
  created_at: string;
};

export type NewActivityInput = {
  cropId: string;
  type: FieldActivityType;
  notes?: string;
  occurredAt?: string;
};

function createId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function rowToCrop(row: CropRow): Crop {
  return {
    id: row.id,
    name: row.name,
    variety: row.variety,
    areaHectares: row.area_hectares,
    plantedAt: row.planted_at,
    harvestForecast: row.harvest_forecast,
    status: row.status as CropStatus,
    progress: row.progress,
    icon: row.icon as IconName,
    irrigation: {
      needMm: row.irrigation_need_mm,
      recommendedMm: row.irrigation_recommended_mm,
    },
    nextAction: row.next_action,
    notes: row.notes,
  };
}

function rowToActivity(row: ActivityRow): FieldActivity {
  return {
    id: row.id,
    cropId: row.crop_id,
    cropName: row.crop_name ?? 'Lavoura removida',
    cropIcon: (row.crop_icon ?? 'sprout') as IconName,
    type: row.type as FieldActivityType,
    notes: row.notes,
    occurredAt: row.occurred_at,
    createdAt: row.created_at,
  };
}

export async function listCrops(db: SQLiteDatabase) {
  const rows = await db.getAllAsync<CropRow>(
    `SELECT * FROM crops ORDER BY created_at DESC`,
  );
  return rows.map(rowToCrop);
}

export async function insertCrop(
  db: SQLiteDatabase,
  crop: Crop,
  createdAt = new Date().toISOString(),
) {
  await db.runAsync(
    `INSERT INTO crops (
      id, name, variety, area_hectares, planted_at, harvest_forecast,
      status, progress, icon, irrigation_need_mm, irrigation_recommended_mm,
      next_action, notes, created_at
    ) VALUES (
      $id, $name, $variety, $areaHectares, $plantedAt, $harvestForecast,
      $status, $progress, $icon, $needMm, $recommendedMm,
      $nextAction, $notes, $createdAt
    )`,
    {
      $id: crop.id,
      $name: crop.name,
      $variety: crop.variety,
      $areaHectares: crop.areaHectares,
      $plantedAt: crop.plantedAt,
      $harvestForecast: crop.harvestForecast,
      $status: crop.status,
      $progress: crop.progress,
      $icon: crop.icon,
      $needMm: crop.irrigation.needMm,
      $recommendedMm: crop.irrigation.recommendedMm,
      $nextAction: crop.nextAction,
      $notes: crop.notes,
      $createdAt: createdAt,
    },
  );
}

export async function listActivities(db: SQLiteDatabase) {
  const rows = await db.getAllAsync<ActivityRow>(
    `SELECT
      a.id,
      a.crop_id,
      c.name AS crop_name,
      c.icon AS crop_icon,
      a.type,
      a.notes,
      a.occurred_at,
      a.created_at
    FROM activities a
    LEFT JOIN crops c ON c.id = a.crop_id
    ORDER BY a.occurred_at DESC, a.created_at DESC`,
  );
  return rows.map(rowToActivity);
}

export async function insertActivity(
  db: SQLiteDatabase,
  input: NewActivityInput,
) {
  const id = createId('activity');
  const occurredAt = input.occurredAt ?? new Date().toISOString();

  await db.runAsync(
    `INSERT INTO activities (id, crop_id, type, notes, occurred_at, created_at)
     VALUES ($id, $cropId, $type, $notes, $occurredAt, $createdAt)`,
    {
      $id: id,
      $cropId: input.cropId,
      $type: input.type,
      $notes: input.notes?.trim() ?? '',
      $occurredAt: occurredAt,
      $createdAt: new Date().toISOString(),
    },
  );

  return id;
}

export async function deleteActivity(db: SQLiteDatabase, id: string) {
  await db.runAsync('DELETE FROM activities WHERE id = $id', { $id: id });
}
