/** Una nota registrada, o `null` si la evaluación aún está pendiente. */
export type Grade = number | null;

/** Notas indexadas por id de componente. */
export type GradeRecord = Readonly<Record<string, Grade>>;

export const getGrade = (record: GradeRecord, componentId: string): Grade => {
  const value = record[componentId];
  return typeof value === 'number' && Number.isFinite(value) ? value : null;
};

/**
 * Completa las notas pendientes de `base` con las de `fill`.
 * Las notas reales siempre tienen prioridad sobre las hipotéticas.
 */
export const fillPending = (base: GradeRecord, fill: GradeRecord): GradeRecord => {
  const result: Record<string, Grade> = { ...base };
  for (const [id, value] of Object.entries(fill)) {
    if (getGrade(base, id) === null && value !== null) result[id] = value;
  }
  return result;
};
