/** Tolerancia para comparar números de punto flotante. */
export const EPSILON = 1e-9;

/** Redondea hacia arriba a `decimals` decimales, ignorando ruido de punto flotante. */
export const ceilTo = (value: number, decimals: number): number => {
  const factor = 10 ** decimals;
  return Math.ceil(value * factor - EPSILON * factor) / factor;
};

export const isAtLeast = (value: number, threshold: number): boolean => value + EPSILON >= threshold;
