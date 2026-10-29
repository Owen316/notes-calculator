import { getGrade, type GradeRecord } from './GradeRecord';
import { isGradeInScale } from './GradeScale';
import { totalWeight, WEIGHT_TOTAL, type GradingScheme } from './GradingScheme';

const WEIGHT_TOLERANCE = 0.001;

/** Problemas de configuración. El dominio expone códigos; la UI decide el mensaje. */
export type SchemeIssue =
  | { readonly code: 'NO_COMPONENTS' }
  | { readonly code: 'INVALID_SCALE' }
  | { readonly code: 'PASSING_OUT_OF_SCALE' }
  | { readonly code: 'WEIGHTS_NOT_100'; readonly total: number }
  | { readonly code: 'INVALID_WEIGHT'; readonly componentId: string }
  | { readonly code: 'EMPTY_NAME'; readonly componentId: string }
  | { readonly code: 'DUPLICATE_ID'; readonly componentId: string };

export type GradeIssue = { readonly code: 'GRADE_OUT_OF_SCALE'; readonly componentId: string };

export const validateScheme = (scheme: GradingScheme): SchemeIssue[] => {
  const issues: SchemeIssue[] = [];
  const { scale, components } = scheme;

  if (!(Number.isFinite(scale.min) && Number.isFinite(scale.max) && scale.min < scale.max)) {
    issues.push({ code: 'INVALID_SCALE' });
  } else if (!isGradeInScale(scale, scale.passing)) {
    issues.push({ code: 'PASSING_OUT_OF_SCALE' });
  }

  if (components.length === 0) {
    issues.push({ code: 'NO_COMPONENTS' });
    return issues;
  }

  const seen = new Set<string>();
  for (const c of components) {
    if (seen.has(c.id)) issues.push({ code: 'DUPLICATE_ID', componentId: c.id });
    seen.add(c.id);
    if (c.name.trim() === '') issues.push({ code: 'EMPTY_NAME', componentId: c.id });
    if (!(Number.isFinite(c.weight) && c.weight > 0 && c.weight <= WEIGHT_TOTAL)) {
      issues.push({ code: 'INVALID_WEIGHT', componentId: c.id });
    }
  }

  const total = totalWeight(scheme);
  if (Math.abs(total - WEIGHT_TOTAL) > WEIGHT_TOLERANCE) {
    issues.push({ code: 'WEIGHTS_NOT_100', total });
  }

  return issues;
};

export const validateGrades = (scheme: GradingScheme, grades: GradeRecord): GradeIssue[] =>
  scheme.components
    .filter((c) => {
      const g = getGrade(grades, c.id);
      return g !== null && !isGradeInScale(scheme.scale, g);
    })
    .map((c) => ({ code: 'GRADE_OUT_OF_SCALE', componentId: c.id }));
