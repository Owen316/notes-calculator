import { useEffect, useState, type ChangeEvent } from 'react';
import { DECIMAL_INPUT_PATTERN, parseDecimal } from '../utils/format';

interface NumberFieldProps {
  readonly id: string;
  readonly value: number | null;
  readonly onChange: (value: number | null) => void;
  readonly ariaLabel?: string;
  readonly placeholder?: string;
  readonly invalid?: boolean;
  readonly suffix?: string;
  readonly className?: string;
}

const toText = (value: number | null): string => (value === null ? '' : String(value));

/** Campo numérico que acepta coma o punto decimal y permite dejarlo vacío. */
export function NumberField({ id, value, onChange, ariaLabel, placeholder, invalid, suffix, className }: NumberFieldProps) {
  const [text, setText] = useState(() => toText(value));

  // Sincroniza si el valor cambia desde fuera (p. ej. al reiniciar).
  useEffect(() => {
    setText((current) => (parseDecimal(current) === value ? current : toText(value)));
  }, [value]);

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const next = event.target.value;
    if (!DECIMAL_INPUT_PATTERN.test(next)) return;
    setText(next);
    onChange(parseDecimal(next));
  };

  return (
    <span className={`number-field ${invalid ? 'is-invalid' : ''} ${className ?? ''}`}>
      <input
        id={id}
        type="text"
        inputMode="decimal"
        autoComplete="off"
        value={text}
        placeholder={placeholder}
        aria-label={ariaLabel}
        aria-invalid={invalid || undefined}
        onChange={handleChange}
      />
      {suffix && <span className="number-field__suffix">{suffix}</span>}
    </span>
  );
}
