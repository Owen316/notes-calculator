import type { GradeIssue, GradingScheme, SchemeIssue } from '@/modules/grading';
import { formatGrade, formatPercent } from './format';

const componentName = (scheme: GradingScheme, id: string): string =>
  scheme.components.find((c) => c.id === id)?.name.trim() || 'Una evaluación';

/** Traduce los códigos del dominio a mensajes para el estudiante. */
export const schemeIssueMessage = (issue: SchemeIssue, scheme: GradingScheme): string => {
  switch (issue.code) {
    case 'NO_COMPONENTS':
      return 'Agrega al menos una evaluación.';
    case 'INVALID_SCALE':
      return 'La nota máxima debe ser mayor que la mínima.';
    case 'PASSING_OUT_OF_SCALE':
      return `La nota para ganar debe estar entre ${formatGrade(scheme.scale.min)} y ${formatGrade(scheme.scale.max)}.`;
    case 'WEIGHTS_NOT_100':
      return `Los porcentajes suman ${formatPercent(issue.total)}; deben sumar 100%.`;
    case 'INVALID_WEIGHT':
      return `${componentName(scheme, issue.componentId)}: el porcentaje debe ser mayor que 0 y máximo 100.`;
    case 'EMPTY_NAME':
      return 'Hay una evaluación sin nombre.';
    case 'DUPLICATE_ID':
      return 'Hay evaluaciones duplicadas.';
  }
};

export const gradeIssueMessage = (issue: GradeIssue, scheme: GradingScheme): string =>
  `${componentName(scheme, issue.componentId)}: la nota debe estar entre ${formatGrade(scheme.scale.min)} y ${formatGrade(scheme.scale.max)}.`;
