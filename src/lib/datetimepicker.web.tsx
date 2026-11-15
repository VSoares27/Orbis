/**
 * `@react-native-community/datetimepicker` para a web.
 *
 * O pacote não tem implementação para navegador: na web o seletor de data do
 * simulador não aparecia e a data ficava presa no valor inicial. Este arquivo é
 * usado no lugar do pacote só quando o Metro empacota para web (veja
 * `metro.config.js`). Ele mostra o campo de data do próprio navegador
 * (`<input type="date">`), que abre o calendário nativo do aparelho.
 *
 * Suporta o que o app usa: `value`, `mode="date"`, `minimumDate`,
 * `maximumDate`, `onValueChange`, `onChange` e `onDismiss`.
 */

import { useEffect, useRef, type CSSProperties } from 'react';

import { Brand } from '@/constants/theme';

type PickerEvent = {
  type: 'set' | 'dismissed';
  nativeEvent: { timestamp: number; utcOffset: number };
};

type WebDateTimePickerProps = {
  value: Date;
  mode?: string;
  minimumDate?: Date;
  maximumDate?: Date;
  onValueChange?: (event: PickerEvent, date: Date) => void;
  onChange?: (event: PickerEvent, date?: Date) => void;
  onDismiss?: () => void;
  [key: string]: unknown;
};

/** Date → "AAAA-MM-DD" no fuso local. */
function toInputValue(date: Date | undefined) {
  if (!date || Number.isNaN(date.getTime())) return undefined;
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/** "AAAA-MM-DD" → Date ao meio-dia local (evita pular de dia por fuso). */
function fromInputValue(text: string) {
  const [year, month, day] = text.split('-').map(Number);
  if (!year || !month || !day) return null;
  return new Date(year, month - 1, day, 12);
}

const inputStyle: CSSProperties = {
  width: '100%',
  boxSizing: 'border-box',
  padding: '10px 12px',
  fontSize: 16,
  fontFamily: 'inherit',
  color: Brand.text,
  backgroundColor: Brand.surface,
  border: `1px solid ${Brand.border}`,
  borderRadius: 12,
};

export default function WebDateTimePicker({
  value,
  minimumDate,
  maximumDate,
  onValueChange,
  onChange,
  onDismiss,
}: WebDateTimePickerProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);

  // Abre o calendário do navegador logo que o campo aparece (o toque no botão
  // de data do simulador ainda conta como ação do usuário).
  useEffect(() => {
    const input = inputRef.current;
    if (!input) return;
    input.focus();
    try {
      input.showPicker?.();
    } catch {
      // Alguns navegadores não deixam abrir sozinho; o campo continua clicável.
    }
  }, []);

  function handleChange(event: { target: { value: string } }) {
    const date = fromInputValue(event.target.value);
    if (!date) return;
    const pickerEvent: PickerEvent = {
      type: 'set',
      nativeEvent: { timestamp: date.getTime(), utcOffset: -date.getTimezoneOffset() },
    };
    onValueChange?.(pickerEvent, date);
    onChange?.(pickerEvent, date);
  }

  function handleKeyDown(event: { key: string }) {
    if (event.key === 'Escape') onDismiss?.();
  }

  return (
    <input
      ref={inputRef}
      type="date"
      aria-label="Data de plantio"
      value={toInputValue(value) ?? ''}
      min={toInputValue(minimumDate)}
      max={toInputValue(maximumDate)}
      onChange={handleChange}
      onKeyDown={handleKeyDown}
      style={inputStyle}
    />
  );
}

/** Na web não existe a API imperativa do Android; mantém o nome exportado. */
export const DateTimePickerAndroid = {
  open: () => {},
  dismiss: () => Promise.resolve(false),
};
