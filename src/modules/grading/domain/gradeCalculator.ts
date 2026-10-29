import { getGrade, type GradeRecord } from './GradeRecord';
import { WEIGHT_TOTAL, type GradingScheme } from './GradingScheme';

/** Estado de la nota de una asignatura en un momento dado. */
export interface GradeSummary {
  /** Puntos ya asegurados sobre la nota final (p. ej. 2.3 de 5.0). */
  readonly accumulated: number;
  /** Porcentaje de la materia ya evaluado. */
  readonly evaluatedWeight: number;
  /** Porcentaje de la materia pendiente. */
  readonly pendingWeight: number;
  readonly pendingComponentIds: readonly string[];
  readonly isComplete: boolean;
  /** Nota definitiva; solo existe cuando no hay evaluaciones pendientes. */
  readonly finalGrade: number | null;
  /** Nota final si se saca la mínima en todo lo pendiente. */
  readonly minReachable: number;
  /** Nota final si se saca la máxima en todo lo pendiente. */
  readonly maxReachable: number;
}

/** Calcula la nota acumulada. Asume un esquema válido (ver `validateScheme`). */
export const summarize = (scheme: GradingScheme, grades: GradeRecord): GradeSummary => {
  let accumulated = 0;
  let evaluatedWeight = 0;
  let pendingWeight = 0;
  const pendingComponentIds: string[] = [];

  for (const component of scheme.components) {
    const grade = getGrade(grades, component.id);
    if (grade === null) {
      pendingWeight += component.weight;
      pendingComponentIds.push(component.id);
    } else {
      accumulated += (grade * component.weight) / WEIGHT_TOTAL;
      evaluatedWeight += component.weight;
    }
  }

  const isComplete = pendingComponentIds.length === 0;
  const pendingFraction = pendingWeight / WEIGHT_TOTAL;

  return {
    accumulated,
    evaluatedWeight,
    pendingWeight,
    pendingComponentIds,
    isComplete,
    finalGrade: isComplete ? accumulated : null,
    minReachable: accumulated + scheme.scale.min * pendingFraction,
    maxReachable: accumulated + scheme.scale.max * pendingFraction,
  };
};
