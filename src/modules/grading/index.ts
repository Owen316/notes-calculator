/** API pública del módulo de calificaciones. El resto de la app importa solo desde aquí. */
export * from './domain';
export * from './application';
export { createDefaultScheme, createDefaultSession } from './config/defaultScheme';
export { LocalStorageSessionRepository } from './infrastructure/LocalStorageSessionRepository';
export { InMemorySessionRepository } from './infrastructure/InMemorySessionRepository';
