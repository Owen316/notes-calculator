import type { GradeScale } from './GradeScale';

/** Suma que deben tener los pesos (porcentajes) de un esquema. */
export const WEIGHT_TOTAL = 100;

/** Una evaluación que aporta a la nota final (corte, TCC, examen...). */
export interface EvaluationComponent {
  readonly id: string;
  readonly name: string;
  /** Porcentaje sobre la nota final, en (0, 100]. */
  readonly weight: number;
}

/** Cómo se calcula la nota final de una asignatura. */
export interface GradingScheme {
  readonly scale: GradeScale;
  readonly components: readonly EvaluationComponent[];
}

export const totalWeight = (scheme: GradingScheme): number =>
  scheme.components.reduce((sum, c) => sum + c.weight, 0);
