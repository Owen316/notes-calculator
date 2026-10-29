import type { GradingSession, SessionRepository } from '../application';
import type { EvaluationComponent, Grade, GradingScheme } from '../domain';

const STORAGE_KEY = 'calculadora-notas:session:v1';

type StorageProvider = () => Storage | null;

const isNumber = (v: unknown): v is number => typeof v === 'number' && Number.isFinite(v);
const isObject = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null;

const isComponent = (v: unknown): v is EvaluationComponent =>
  isObject(v) && typeof v.id === 'string' && typeof v.name === 'string' && isNumber(v.weight);

const isScheme = (v: unknown): v is GradingScheme =>
  isObject(v) &&
  isObject(v.scale) &&
  isNumber(v.scale.min) &&
  isNumber(v.scale.max) &&
  isNumber(v.scale.passing) &&
  Array.isArray(v.components) &&
  v.components.every(isComponent);

const isGradeMap = (v: unknown): v is Record<string, Grade> =>
  isObject(v) && Object.values(v).every((g) => g === null || isNumber(g));

const isSession = (v: unknown): v is GradingSession =>
  isObject(v) && isScheme(v.scheme) && isGradeMap(v.grades) && (v.target === null || isNumber(v.target));

/**
 * Adaptador que guarda la sesión en el navegador. Si el almacenamiento no está
 * disponible (modo incógnito, bloqueado...) la app sigue funcionando sin guardar.
 */
export class LocalStorageSessionRepository implements SessionRepository {
  constructor(private readonly storage: StorageProvider = defaultStorage) {}

  load(): GradingSession | null {
    try {
      const raw = this.storage()?.getItem(STORAGE_KEY);
      if (!raw) return null;
      const parsed: unknown = JSON.parse(raw);
      return isSession(parsed) ? parsed : null;
    } catch {
      return null;
    }
  }

  save(session: GradingSession): void {
    try {
      this.storage()?.setItem(STORAGE_KEY, JSON.stringify(session));
    } catch {
      // Sin almacenamiento disponible: se ignora.
    }
  }

  clear(): void {
    try {
      this.storage()?.removeItem(STORAGE_KEY);
    } catch {
      // Sin almacenamiento disponible: se ignora.
    }
  }
}

function defaultStorage(): Storage | null {
  try {
    return typeof window === 'undefined' ? null : window.localStorage;
  } catch {
    return null;
  }
}
