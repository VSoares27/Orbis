/** Funções de formatação em pt-BR usadas nas telas. */

/**
 * Date → "AAAA-MM-DD" no fuso do aparelho. Usar no lugar de
 * `toISOString().slice(0, 10)`, que usa UTC e, à noite no Brasil, já devolve
 * o dia seguinte.
 */
export function toLocalIsoDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function formatCurrency(value: number) {
  return value.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
  });
}

export function formatNumber(value: number, digits = 0) {
  return value.toLocaleString('pt-BR', {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });
}

/** Aceita "2026-11-12" ou "20261112" e devolve uma Date ao meio-dia (evita virar o dia por fuso). */
function parseDay(value: string) {
  const compact = /^\d{8}$/.test(value);
  const iso = compact ? `${value.slice(0, 4)}-${value.slice(4, 6)}-${value.slice(6, 8)}` : value;
  return new Date(`${iso}T12:00:00`);
}

/** "2026-11-12" → "qui" (dia da semana curto). */
export function formatWeekday(isoDate: string) {
  const date = parseDay(isoDate);
  return date
    .toLocaleDateString('pt-BR', { weekday: 'short' })
    .replace('.', '')
    .slice(0, 3);
}

/** "2026-11-12" → "12 nov". */
export function formatDayMonth(isoDate: string) {
  const date = parseDay(isoDate);
  return date
    .toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })
    .replace(' de ', ' ')
    .replace('.', '');
}

/** ISO completo → "15 nov 2026". */
export function formatActivityDate(isoDate: string) {
  const date = new Date(isoDate);
  return date
    .toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })
    .replaceAll('.', '');
}

/** ISO completo → "15/11 às 08:30". */
export function formatUpdatedAt(isoDate: string) {
  const date = new Date(isoDate);
  const day = date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
  const time = date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  return `${day} às ${time}`;
}

export function formatSignedPercent(value: number) {
  const sign = value > 0 ? '+' : '';
  return `${sign}${formatNumber(value, 1)}%`;
}
