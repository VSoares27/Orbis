/**
 * Criação e evolução do banco local do Orbis.
 *
 * O `SQLiteProvider` chama esta função ao abrir o app. Na primeira execução
 * criamos as tabelas e semeamos as lavouras de demonstração. Depois disso, os
 * dados passam a ser persistidos no aparelho.
 */

import type { SQLiteDatabase } from 'expo-sqlite';

import { insertActivity, insertCrop } from './repository';

import { mockCrops } from '@/data/mock';
import type { FieldActivityType } from '@/types';

const DATABASE_VERSION = 1;

function isoDaysAgo(days: number, hour = 9) {
  const date = new Date();
  date.setDate(date.getDate() - days);
  date.setHours(hour, 30, 0, 0);
  return date.toISOString();
}

const seedActivities: {
  cropId: string;
  type: FieldActivityType;
  notes: string;
  daysAgo: number;
}[] = [
  {
    cropId: 'crop-feijao',
    type: 'irrigacao',
    notes: 'Irrigação de 20 mm no início da manhã para reduzir evaporação.',
    daysAgo: 1,
  },
  {
    cropId: 'crop-milho',
    type: 'adubacao',
    notes: 'Adubação de cobertura com 120 kg/ha de ureia.',
    daysAgo: 3,
  },
  {
    cropId: 'crop-pimentao',
    type: 'pulverizacao',
    notes: 'Pulverização preventiva contra tripes nas folhas novas.',
    daysAgo: 4,
  },
  {
    cropId: 'crop-cenoura',
    type: 'colheita',
    notes: 'Amostragem de raízes para avaliar o ponto de colheita.',
    daysAgo: 6,
  },
  {
    cropId: 'crop-milho',
    type: 'plantio',
    notes: 'Plantio concluído com espaçamento de 0,80 m entre linhas.',
    daysAgo: 62,
  },
];

async function seedDatabase(db: SQLiteDatabase) {
  const now = Date.now();

  for (const [index, crop] of mockCrops.entries()) {
    await insertCrop(db, crop, new Date(now - index * 1000).toISOString());
  }

  for (const activity of seedActivities) {
    await insertActivity(db, {
      cropId: activity.cropId,
      type: activity.type,
      notes: activity.notes,
      occurredAt: isoDaysAgo(activity.daysAgo),
    });
  }
}

export async function migrateDbIfNeeded(db: SQLiteDatabase) {
  await db.execAsync(`
    PRAGMA journal_mode = WAL;
    PRAGMA foreign_keys = ON;
  `);

  const result = await db.getFirstAsync<{ user_version: number }>('PRAGMA user_version');
  const currentVersion = result?.user_version ?? 0;

  if (currentVersion >= DATABASE_VERSION) {
    return;
  }

  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS crops (
      id TEXT PRIMARY KEY NOT NULL,
      name TEXT NOT NULL,
      variety TEXT NOT NULL,
      area_hectares REAL NOT NULL,
      planted_at TEXT NOT NULL,
      harvest_forecast TEXT NOT NULL,
      status TEXT NOT NULL CHECK (status IN ('saudavel', 'atencao', 'colheita')),
      progress INTEGER NOT NULL DEFAULT 0,
      icon TEXT NOT NULL,
      irrigation_need_mm REAL NOT NULL,
      irrigation_recommended_mm REAL NOT NULL,
      next_action TEXT NOT NULL,
      notes TEXT NOT NULL DEFAULT '',
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS activities (
      id TEXT PRIMARY KEY NOT NULL,
      crop_id TEXT NOT NULL,
      type TEXT NOT NULL CHECK (
        type IN ('irrigacao', 'adubacao', 'pulverizacao', 'colheita', 'plantio', 'outro')
      ),
      notes TEXT NOT NULL DEFAULT '',
      occurred_at TEXT NOT NULL,
      created_at TEXT NOT NULL,
      FOREIGN KEY (crop_id) REFERENCES crops (id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_activities_crop_id ON activities (crop_id);
    CREATE INDEX IF NOT EXISTS idx_activities_occurred_at ON activities (occurred_at);
  `);

  const cropCount = await db.getFirstAsync<{ count: number }>(
    'SELECT COUNT(*) AS count FROM crops',
  );

  if ((cropCount?.count ?? 0) === 0) {
    await seedDatabase(db);
  }

  await db.execAsync(`PRAGMA user_version = ${DATABASE_VERSION}`);
}
