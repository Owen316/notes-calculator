import {
  computeRequirement,
  summarize,
  validateGrades,
  validateScheme,
  type GradeIssue,
  type GradeRecord,
  type GradeSummary,
  type GradingScheme,
  type Requirement,
  type SchemeIssue,
} from '../../domain';

export interface GradeReport {
  readonly schemeIssues: readonly SchemeIssue[];
  readonly gradeIssues: readonly GradeIssue[];
  /** `null` cuando el esquema o las notas tienen errores. */
  readonly summary: GradeSummary | null;
  readonly requirement: Requirement | null;
}

/** Caso de uso: ¿cómo voy y cuánto necesito para llegar a la meta? */
export const buildGradeReport = (
  scheme: GradingScheme,
  grades: GradeRecord,
  target: number = scheme.scale.passing,
): GradeReport => {
  const schemeIssues = validateScheme(scheme);
  const gradeIssues = schemeIssues.length === 0 ? validateGrades(scheme, grades) : [];

  if (schemeIssues.length > 0 || gradeIssues.length > 0) {
    return { schemeIssues, gradeIssues, summary: null, requirement: null };
  }

  return {
    schemeIssues,
    gradeIssues,
    summary: summarize(scheme, grades),
    requirement: computeRequirement(scheme, grades, target),
  };
};
