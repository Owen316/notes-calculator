import type { GradingSession, SessionRepository } from '../ports/SessionRepository';

/** Caso de uso: recuperar, guardar y reiniciar la sesión del estudiante. */
export class SessionService {
  constructor(
    private readonly repository: SessionRepository,
    private readonly createDefault: () => GradingSession,
  ) {}

  restore(): GradingSession {
    return this.repository.load() ?? this.createDefault();
  }

  persist(session: GradingSession): void {
    this.repository.save(session);
  }

  reset(): GradingSession {
    this.repository.clear();
    return this.createDefault();
  }
}
