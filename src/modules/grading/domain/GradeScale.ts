/** Escala de calificación (p. ej. 0.0 a 5.0, aprobando con 3.0). */
export interface GradeScale {
  readonly min: number;
  readonly max: number;
  readonly passing: number;
}

export const isGradeInScale = (scale: GradeScale, value: number): boolean =>
  Number.isFinite(value) && value >= scale.min && value <= scale.max;

export const clampToScale = (scale: GradeScale, value: number): number =>
  Math.min(scale.max, Math.max(scale.min, value));
