import type { GradingSession, SessionRepository } from '../application';

/** Adaptador en memoria; útil para pruebas o para entornos sin almacenamiento. */
export class InMemorySessionRepository implements SessionRepository {
  private session: GradingSession | null = null;

  load(): GradingSession | null {
    return this.session;
  }

  save(session: GradingSession): void {
    this.session = session;
  }

  clear(): void {
    this.session = null;
  }
}
