import { createDefaultSession, LocalStorageSessionRepository, SessionService } from '@/modules/grading';

/**
 * Raíz de composición: el único lugar donde se eligen las implementaciones
 * concretas. Para guardar en una API en lugar del navegador, basta con cambiar
 * el repositorio aquí.
 */
export const container = {
  sessionService: new SessionService(new LocalStorageSessionRepository(), createDefaultSession),
} as const;

export type Container = typeof container;
