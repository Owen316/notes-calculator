export type { GradingSession, SessionRepository } from './ports/SessionRepository';
export { buildGradeReport, type GradeReport } from './useCases/buildGradeReport';
export { simulateScenario, type ComponentRequirement, type ScenarioResult } from './useCases/simulateScenario';
export { SessionService } from './useCases/SessionService';
