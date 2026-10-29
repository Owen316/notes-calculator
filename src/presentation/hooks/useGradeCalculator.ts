import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  buildGradeReport,
  clampToScale,
  getGrade,
  simulateScenario,
  type EvaluationComponent,
  type Grade,
  type GradeRecord,
  type GradeScale,
  type GradingSession,
  type SessionService,
} from '@/modules/grading';

const newComponentId = (): string =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `c-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

/**
 * Adaptador entre React y los casos de uso. Los componentes solo leen estado
 * derivado y llaman acciones; ningún cálculo vive en la UI.
 */
export function useGradeCalculator(sessionService: SessionService) {
  const [session, setSession] = useState<GradingSession>(() => sessionService.restore());
  const [hypothetical, setHypothetical] = useState<GradeRecord>({});

  useEffect(() => sessionService.persist(session), [sessionService, session]);

  const { scheme, grades } = session;
  const target = session.target ?? scheme.scale.passing;

  const report = useMemo(() => buildGradeReport(scheme, grades, target), [scheme, grades, target]);

  /** Valor inicial de los deslizadores: la nota requerida (o la de aprobar). */
  const simulationDefault = useMemo(() => {
    const required = report.requirement?.requiredGrade ?? (report.requirement?.status === 'impossible' ? scheme.scale.max : scheme.scale.passing);
    return clampToScale(scheme.scale, required);
  }, [report.requirement, scheme.scale]);

  const simulatedGrades = useMemo(() => {
    const pending = report.summary?.pendingComponentIds ?? [];
    return Object.fromEntries(pending.map((id) => [id, getGrade(hypothetical, id) ?? simulationDefault])) as GradeRecord;
  }, [report.summary, hypothetical, simulationDefault]);

  const scenario = useMemo(
    () => (report.summary && !report.summary.isComplete ? simulateScenario(scheme, grades, simulatedGrades, target) : null),
    [report.summary, scheme, grades, simulatedGrades, target],
  );

  const update = useCallback((fn: (s: GradingSession) => GradingSession) => setSession(fn), []);

  const actions = useMemo(
    () => ({
      setGrade: (id: string, value: Grade) => update((s) => ({ ...s, grades: { ...s.grades, [id]: value } })),

      clearGrades: () => {
        update((s) => ({ ...s, grades: {} }));
        setHypothetical({});
      },

      setTarget: (value: number | null) => update((s) => ({ ...s, target: value })),

      updateScale: (patch: Partial<GradeScale>) =>
        update((s) => ({ ...s, scheme: { ...s.scheme, scale: { ...s.scheme.scale, ...patch } } })),

      updateComponent: (id: string, patch: Partial<Omit<EvaluationComponent, 'id'>>) =>
        update((s) => ({
          ...s,
          scheme: { ...s.scheme, components: s.scheme.components.map((c) => (c.id === id ? { ...c, ...patch } : c)) },
        })),

      addComponent: () =>
        update((s) => ({
          ...s,
          scheme: {
            ...s.scheme,
            components: [...s.scheme.components, { id: newComponentId(), name: `Evaluación ${s.scheme.components.length + 1}`, weight: 0 }],
          },
        })),

      removeComponent: (id: string) =>
        update((s) => {
          const { [id]: _removed, ...rest } = s.grades;
          return { ...s, grades: rest, scheme: { ...s.scheme, components: s.scheme.components.filter((c) => c.id !== id) } };
        }),

      resetAll: () => {
        setSession(sessionService.reset());
        setHypothetical({});
      },

      setSimulatedGrade: (id: string, value: number) => setHypothetical((h) => ({ ...h, [id]: value })),

      resetSimulation: () => setHypothetical({}),
    }),
    [update, sessionService],
  );

  return { scheme, grades, target, report, scenario, simulatedGrades, actions };
}

export type GradeCalculator = ReturnType<typeof useGradeCalculator>;
