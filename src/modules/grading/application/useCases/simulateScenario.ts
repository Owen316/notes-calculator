import {
  computeRequirement,
  fillPending,
  summarize,
  validateGrades,
  validateScheme,
  type GradeRecord,
  type GradeSummary,
  type GradingScheme,
  type Requirement,
} from '../../domain';

export interface ComponentRequirement {
  readonly componentId: string;
  /** Lo que se necesita en este componente si en los demás pendientes se saca lo simulado. */
  readonly requirement: Requirement;
}

export interface ScenarioResult {
  /** Notas reales completadas con las hipotéticas. */
  readonly grades: GradeRecord;
  readonly summary: GradeSummary;
  readonly requirement: Requirement;
  readonly perComponent: readonly ComponentRequirement[];
}

/**
 * Caso de uso: "¿y si saco X en el TCC y Y en el examen?".
 * Las notas reales nunca se sobrescriben; las hipotéticas solo llenan lo pendiente.
 */
export const simulateScenario = (
  scheme: GradingScheme,
  realGrades: GradeRecord,
  hypothetical: GradeRecord,
  target: number = scheme.scale.passing,
): ScenarioResult | null => {
  const grades = fillPending(realGrades, hypothetical);
  if (validateScheme(scheme).length > 0 || validateGrades(scheme, grades).length > 0) return null;

  const pendingIds = summarize(scheme, realGrades).pendingComponentIds;
  const perComponent = pendingIds.map((componentId) => ({
    componentId,
    requirement: computeRequirement(scheme, { ...grades, [componentId]: null }, target),
  }));

  return {
    grades,
    summary: summarize(scheme, grades),
    requirement: computeRequirement(scheme, grades, target),
    perComponent,
  };
};
