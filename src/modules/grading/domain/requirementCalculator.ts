import { summarize } from './gradeCalculator';
import type { GradeRecord } from './GradeRecord';
import { WEIGHT_TOTAL, type GradingScheme } from './GradingScheme';
import { ceilTo, isAtLeast } from './math';

/**
 * - `secured`: ya se alcanzó la meta, aunque saque la mínima en lo pendiente.
 * - `achievable`: se puede alcanzar con `requiredGrade` en lo pendiente.
 * - `impossible`: ni con la máxima en lo pendiente se alcanza.
 * - `passed` / `failed`: no queda nada pendiente; resultado definitivo.
 */
export type RequirementStatus = 'secured' | 'achievable' | 'impossible' | 'passed' | 'failed';

export interface Requirement {
  readonly status: RequirementStatus;
  readonly target: number;
  /** Nota mínima (la misma en cada evaluación pendiente) para alcanzar la meta. */
  readonly requiredGrade: number | null;
  readonly pendingComponentIds: readonly string[];
}

/** Decimales con los que se reporta la nota requerida (redondeada hacia arriba). */
export const REQUIRED_GRADE_DECIMALS = 2;

/**
 * Calcula qué nota (la misma en cada evaluación pendiente) se necesita para
 * llegar a `target`. Por defecto la meta es la nota aprobatoria.
 */
export const computeRequirement = (
  scheme: GradingScheme,
  grades: GradeRecord,
  target: number = scheme.scale.passing,
): Requirement => {
  const summary = summarize(scheme, grades);
  const base = { target, pendingComponentIds: summary.pendingComponentIds };

  if (summary.isComplete) {
    const status = isAtLeast(summary.accumulated, target) ? 'passed' : 'failed';
    return { ...base, status, requiredGrade: null };
  }

  const needed = (target - summary.accumulated) / (summary.pendingWeight / WEIGHT_TOTAL);
  const requiredGrade = ceilTo(needed, REQUIRED_GRADE_DECIMALS);

  if (requiredGrade <= scheme.scale.min) return { ...base, status: 'secured', requiredGrade: scheme.scale.min };
  if (requiredGrade > scheme.scale.max) return { ...base, status: 'impossible', requiredGrade: null };
  return { ...base, status: 'achievable', requiredGrade };
};
