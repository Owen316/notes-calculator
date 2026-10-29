const gradeFormatter = new Intl.NumberFormat('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 2 });
const percentFormatter = new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 });
const listFormatter = new Intl.ListFormat('es', { style: 'long', type: 'conjunction' });

export const formatGrade = (value: number): string => gradeFormatter.format(value + 0);

export const formatPercent = (value: number): string => `${percentFormatter.format(value)}%`;

export const formatList = (items: readonly string[]): string => listFormatter.format(items);

/** Acepta "3.5" y "3,5". Devuelve `null` si está vacío o no es un número. */
export const parseDecimal = (text: string): number | null => {
  const normalized = text.trim().replace(',', '.');
  if (normalized === '' || normalized === '.') return null;
  const value = Number(normalized);
  return Number.isFinite(value) ? value : null;
};

/** Texto parcial permitido mientras se escribe un decimal positivo. */
export const DECIMAL_INPUT_PATTERN = /^\d*([.,]\d*)?$/;
