/**
 * Idioma da interface (português ou inglês).
 *
 * O app foi escrito em português. Para a banca do Space Apps explorar em
 * inglês, a tradução acontece na hora de desenhar o texto: `AppText`, `Input`
 * e o `Alert` da web passam cada texto por `t()`. Assim nenhuma tela precisa
 * ser reescrita e os textos montados em tempo de execução (recomendações,
 * datas, alertas) também são traduzidos, por padrões em `i18n-en.ts`.
 *
 * - A escolha fica salva no navegador (`localStorage`) quando possível.
 * - `?lang=en` ou `?lang=pt` no link escolhe o idioma ao abrir.
 * - Em inglês, textos sem tradução ficam em `window.__orbisMissingI18n`
 *   (só para conferência durante os testes).
 */

import { useSyncExternalStore } from 'react';

import { EN_EXACT, EN_PATTERNS } from './i18n-en';

export type Language = 'pt' | 'en';

const STORAGE_KEY = 'orbis.language';

function readInitialLanguage(): Language {
  if (typeof window === 'undefined') return 'pt';
  try {
    const fromUrl = new URLSearchParams(window.location.search).get('lang');
    if (fromUrl === 'en' || fromUrl === 'pt') return fromUrl;
  } catch {
    // Sem URL (ex.: nativo): segue para o armazenamento.
  }
  try {
    const stored = window.localStorage?.getItem(STORAGE_KEY);
    if (stored === 'en' || stored === 'pt') return stored;
  } catch {
    // Armazenamento bloqueado (janela anônima, etc.): usa português.
  }
  return 'pt';
}

let current: Language = readInitialLanguage();
const listeners = new Set<() => void>();
const missing = new Set<string>();

syncDocumentLanguage();

export function getLanguage(): Language {
  return current;
}

export function setLanguage(language: Language) {
  if (language === current) return;
  current = language;
  try {
    window.localStorage?.setItem(STORAGE_KEY, language);
  } catch {
    // Sem armazenamento: o idioma vale até recarregar a página.
  }
  syncDocumentLanguage();
  listeners.forEach((listener) => listener());
}

export function toggleLanguage() {
  setLanguage(current === 'pt' ? 'en' : 'pt');
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/** Idioma atual; o componente redesenha quando ele muda. */
export function useLanguage(): Language {
  return useSyncExternalStore(subscribe, getLanguage, getLanguage);
}

function syncDocumentLanguage() {
  if (typeof document === 'undefined') return;
  document.documentElement.lang = current === 'en' ? 'en' : 'pt-BR';
}

/** Tradução de um texto inteiro, ou `null` se não houver. */
export function lookup(text: string): string | null {
  const key = text.trim();
  if (key.length === 0) return text;
  const exact = EN_EXACT[key];
  if (exact !== undefined) return keepSpaces(text, exact);
  for (const [pattern, replace] of EN_PATTERNS) {
    const match = key.match(pattern);
    if (match) return keepSpaces(text, replace(match, t));
  }
  return null;
}

/** Traduz para o idioma atual (em português devolve o próprio texto). */
export function t(text: string): string {
  if (current === 'pt') return text;
  // Número solto com vírgula decimal ("2,85") vira ponto em inglês.
  if (/^\s*-?\d+,\d+\s*$/.test(text)) return text.replace(',', '.');
  if (!/[A-Za-zÀ-ú]/.test(text)) return text;
  const translated = lookup(text);
  if (translated !== null) return translated;
  recordMissing(text);
  return text;
}

function keepSpaces(original: string, translated: string) {
  const lead = original.match(/^\s*/)?.[0] ?? '';
  const trail = original.match(/\s*$/)?.[0] ?? '';
  return `${lead}${translated}${trail}`;
}

function recordMissing(text: string) {
  const key = text.trim();
  if (missing.has(key)) return;
  missing.add(key);
  if (typeof window !== 'undefined') {
    (window as unknown as { __orbisMissingI18n?: string[] }).__orbisMissingI18n = [...missing];
  }
}
