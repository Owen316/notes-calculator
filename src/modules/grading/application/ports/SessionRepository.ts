import type { GradeRecord, GradingScheme } from '../../domain';

/** Lo que el estudiante tiene configurado y registrado. */
export interface GradingSession {
  readonly scheme: GradingScheme;
  readonly grades: GradeRecord;
  /** Meta personalizada (p. ej. 4.0). `null` = la nota aprobatoria. */
  readonly target: number | null;
}

/**
 * Puerto de persistencia. La aplicación no sabe si se guarda en el navegador,
 * en una API o en memoria: eso lo decide la infraestructura.
 */
export interface SessionRepository {
  load(): GradingSession | null;
  save(session: GradingSession): void;
  clear(): void;
}
