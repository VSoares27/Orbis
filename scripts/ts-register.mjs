/**
 * Permite rodar scripts TypeScript do repositório com o Node 24, sem instalar
 * nada: `node --import ./scripts/ts-register.mjs scripts/verificar-dados.ts`.
 *
 * O Node já remove os tipos dos arquivos .ts sozinho. Este registro só resolve
 * o que o Metro/TypeScript resolvem no app:
 * - o alias `@/` → `src/`;
 * - imports sem extensão (`./foo` → `./foo.ts`, `.tsx` ou `/index.ts`);
 * - imports de `.json` sem `with { type: 'json' }`.
 *
 * Usado só por scripts de verificação; não entra no bundle do app.
 */

import { register } from 'node:module';

register('./ts-hooks.mjs', import.meta.url);
