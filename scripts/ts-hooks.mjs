/** Hooks de resolução usados por `scripts/ts-register.mjs`. */

import { existsSync, readFileSync, statSync } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';

const SRC_DIR = fileURLToPath(new URL('../src/', import.meta.url));
const EXTENSIONS = ['.ts', '.tsx', '.js', '.mjs', '.json'];

function isFile(path) {
  return existsSync(path) && statSync(path).isFile();
}

function withExtension(path) {
  if (isFile(path)) return path;
  for (const extension of EXTENSIONS) {
    if (isFile(path + extension)) return path + extension;
  }
  for (const extension of EXTENSIONS) {
    const index = `${path}/index${extension}`;
    if (isFile(index)) return index;
  }
  return null;
}

export async function resolve(specifier, context, nextResolve) {
  let candidate = null;

  if (specifier.startsWith('@/')) {
    candidate = withExtension(SRC_DIR + specifier.slice(2));
  } else if ((specifier.startsWith('./') || specifier.startsWith('../')) && context.parentURL) {
    candidate = withExtension(fileURLToPath(new URL(specifier, context.parentURL)));
  }

  if (candidate) {
    return { url: pathToFileURL(candidate).href, shortCircuit: true };
  }
  return nextResolve(specifier, context);
}

export async function load(url, context, nextLoad) {
  if (url.startsWith('file:') && url.endsWith('.json')) {
    const source = readFileSync(fileURLToPath(url), 'utf8');
    return { format: 'module', source: `export default ${source};`, shortCircuit: true };
  }
  if (url.startsWith('file:') && (url.endsWith('.ts') || url.endsWith('.tsx'))) {
    // Os arquivos do app usam `import`/`export`: trata todos como ES module.
    return nextLoad(url, { ...context, format: 'module-typescript' });
  }
  return nextLoad(url, context);
}
