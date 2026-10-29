import { describe, expect, it } from 'vitest';
import { createDefaultScheme } from '../../config/defaultScheme';
import { computeRequirement } from '../requirementCalculator';
import { summarize } from '../gradeCalculator';
import { validateGrades, validateScheme } from '../validation';
import { fillPending } from '../GradeRecord';
import type { GradingScheme } from '../GradingScheme';

const scheme = createDefaultScheme();
const grades = (c1: number | null, c2: number | null, tcc: number | null, exam: number | null) => ({
  'corte-1': c1,
  'corte-2': c2,
  tcc,
  'examen-final': exam,
});

describe('summarize', () => {
  it('calcula la nota final 20/20/20/40', () => {
    const s = summarize(scheme, grades(4, 3.5, 4, 3));
    expect(s.isComplete).toBe(true);
    expect(s.finalGrade).toBeCloseTo(0.8 + 0.7 + 0.8 + 1.2);
  });

  it('reporta acumulado y rango alcanzable cuando falta el examen', () => {
    const s = summarize(scheme, grades(4, 3.5, 4, null));
    expect(s.accumulated).toBeCloseTo(2.3);
    expect(s.evaluatedWeight).toBe(60);
    expect(s.pendingWeight).toBe(40);
    expect(s.pendingComponentIds).toEqual(['examen-final']);
    expect(s.finalGrade).toBeNull();
    expect(s.minReachable).toBeCloseTo(2.3);
    expect(s.maxReachable).toBeCloseTo(4.3);
  });

  it('respeta pesos personalizados', () => {
    const custom: GradingScheme = {
      ...scheme,
      components: [
        { id: 'a', name: 'A', weight: 30 },
        { id: 'b', name: 'B', weight: 70 },
      ],
    };
    expect(summarize(custom, { a: 5, b: 2 }).finalGrade).toBeCloseTo(1.5 + 1.4);
  });
});

describe('computeRequirement', () => {
  it('calcula lo que se necesita en el examen', () => {
    const r = computeRequirement(scheme, grades(4, 3.5, 4, null));
    expect(r.status).toBe('achievable');
    expect(r.requiredGrade).toBe(1.75);
  });

  it('reparte el requerimiento entre TCC y examen', () => {
    const r = computeRequirement(scheme, grades(3, 3, null, null));
    expect(r.status).toBe('achievable');
    expect(r.requiredGrade).toBe(3);
    expect(r.pendingComponentIds).toEqual(['tcc', 'examen-final']);
  });

  it('redondea hacia arriba para no quedarse corto', () => {
    // acumulado 2.2 → (3 - 2.2) / 0.4 = 2.0 exacto, sin ruido de punto flotante
    expect(computeRequirement(scheme, grades(3.7, 3.6, 3.7, null)).requiredGrade).toBe(2);
    // acumulado 0.6 + 0.6 + 0.62 = 1.82 → 1.18 / 0.4 = 2.95
    expect(computeRequirement(scheme, grades(3, 3, 3.1, null)).requiredGrade).toBe(2.95);
    // 1.2 + 0.66 = 1.86 → 1.14 / 0.4 = 2.85
    expect(computeRequirement(scheme, grades(3, 3, 3.3, null)).requiredGrade).toBe(2.85);
    // acumulado 1.2 + 0.2*3.33 = 1.866 → 1.134 / 0.4 = 2.835 → 2.84
    expect(computeRequirement(scheme, grades(3, 3, 3.33, null)).requiredGrade).toBe(2.84);
  });

  it('detecta cuando ya se ganó la materia', () => {
    const r = computeRequirement(scheme, grades(5, 5, 5, null));
    expect(r.status).toBe('secured');
    expect(r.requiredGrade).toBe(0);
  });

  it('detecta cuando ya no es posible ganar', () => {
    const r = computeRequirement(scheme, grades(1, 1, 1, null));
    expect(r.status).toBe('impossible');
    expect(r.requiredGrade).toBeNull();
  });

  it('acepta una meta personalizada', () => {
    // acumulado 2.4 → (4.4 - 2.4) / 0.4 = 5
    const r = computeRequirement(scheme, grades(4, 4, 4, null), 4.4);
    expect(r.requiredGrade).toBe(5);
    expect(computeRequirement(scheme, grades(4, 4, 4, null), 4.5).status).toBe('impossible');
  });

  it('da el resultado definitivo cuando no queda nada pendiente', () => {
    expect(computeRequirement(scheme, grades(3, 3, 3, 3)).status).toBe('passed');
    expect(computeRequirement(scheme, grades(3, 3, 3, 2.9)).status).toBe('failed');
  });
});

describe('validación', () => {
  it('acepta el esquema por defecto', () => {
    expect(validateScheme(scheme)).toEqual([]);
  });

  it('exige que los pesos sumen 100', () => {
    const bad: GradingScheme = {
      ...scheme,
      components: scheme.components.map((c) => (c.id === 'tcc' ? { ...c, weight: 10 } : c)),
    };
    expect(validateScheme(bad)).toContainEqual({ code: 'WEIGHTS_NOT_100', total: 90 });
  });

  it('rechaza nombres vacíos, pesos inválidos y escalas inválidas', () => {
    const bad: GradingScheme = {
      scale: { min: 5, max: 0, passing: 3 },
      components: [
        { id: 'a', name: ' ', weight: 0 },
        { id: 'a', name: 'B', weight: 100 },
      ],
    };
    const codes = validateScheme(bad).map((i) => i.code);
    expect(codes).toEqual(expect.arrayContaining(['INVALID_SCALE', 'EMPTY_NAME', 'INVALID_WEIGHT', 'DUPLICATE_ID']));
  });

  it('detecta notas fuera de la escala', () => {
    expect(validateGrades(scheme, grades(5.5, 3, null, null))).toEqual([
      { code: 'GRADE_OUT_OF_SCALE', componentId: 'corte-1' },
    ]);
  });
});

describe('fillPending', () => {
  it('no sobrescribe notas reales', () => {
    expect(fillPending({ a: 4, b: null }, { a: 1, b: 2 })).toEqual({ a: 4, b: 2 });
  });
});
