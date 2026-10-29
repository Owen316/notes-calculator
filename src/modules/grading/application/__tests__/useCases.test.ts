import { describe, expect, it } from 'vitest';
import { createDefaultScheme, createDefaultSession } from '../../config/defaultScheme';
import { InMemorySessionRepository } from '../../infrastructure/InMemorySessionRepository';
import { LocalStorageSessionRepository } from '../../infrastructure/LocalStorageSessionRepository';
import { buildGradeReport } from '../useCases/buildGradeReport';
import { SessionService } from '../useCases/SessionService';
import { simulateScenario } from '../useCases/simulateScenario';

const scheme = createDefaultScheme();

describe('buildGradeReport', () => {
  it('devuelve resumen y requerimiento con datos válidos', () => {
    const report = buildGradeReport(scheme, { 'corte-1': 4, 'corte-2': 3.5, tcc: 4 });
    expect(report.summary?.accumulated).toBeCloseTo(2.3);
    expect(report.requirement?.requiredGrade).toBe(1.75);
  });

  it('no calcula si el esquema es inválido', () => {
    const bad = { ...scheme, components: scheme.components.slice(0, 3) };
    const report = buildGradeReport(bad, {});
    expect(report.summary).toBeNull();
    expect(report.schemeIssues.map((i) => i.code)).toContain('WEIGHTS_NOT_100');
  });
});

describe('simulateScenario', () => {
  it('calcula el examen necesario según la nota simulada del TCC', () => {
    const result = simulateScenario(scheme, { 'corte-1': 3, 'corte-2': 3 }, { tcc: 4 });
    const exam = result?.perComponent.find((p) => p.componentId === 'examen-final');
    // 0.6 + 0.6 + 0.8 = 2.0 → (3 - 2) / 0.4 = 2.5
    expect(exam?.requirement.requiredGrade).toBe(2.5);
  });

  it('proyecta la nota final con todas las notas simuladas', () => {
    const result = simulateScenario(scheme, { 'corte-1': 3, 'corte-2': 3 }, { tcc: 4, 'examen-final': 2 });
    expect(result?.summary.finalGrade).toBeCloseTo(2.8);
    expect(result?.requirement.status).toBe('failed');
  });

  it('las notas reales prevalecen sobre las simuladas', () => {
    const result = simulateScenario(scheme, { 'corte-1': 5 }, { 'corte-1': 0 });
    expect(result?.grades['corte-1']).toBe(5);
    expect(result?.perComponent.map((p) => p.componentId)).not.toContain('corte-1');
  });
});

describe('SessionService', () => {
  it('usa la sesión por defecto si no hay nada guardado y luego la recupera', () => {
    const service = new SessionService(new InMemorySessionRepository(), createDefaultSession);
    expect(service.restore()).toEqual(createDefaultSession());
    const session = { ...createDefaultSession(), grades: { tcc: 4 } };
    service.persist(session);
    expect(service.restore()).toEqual(session);
    expect(service.reset()).toEqual(createDefaultSession());
    expect(service.restore()).toEqual(createDefaultSession());
  });
});

describe('LocalStorageSessionRepository', () => {
  const fakeStorage = () => {
    const data = new Map<string, string>();
    return {
      getItem: (k: string) => data.get(k) ?? null,
      setItem: (k: string, v: string) => void data.set(k, v),
      removeItem: (k: string) => void data.delete(k),
      raw: data,
    };
  };

  it('guarda y recupera la sesión', () => {
    const storage = fakeStorage();
    const repo = new LocalStorageSessionRepository(() => storage as unknown as Storage);
    const session = { ...createDefaultSession(), grades: { tcc: 3.5 }, target: 4 };
    repo.save(session);
    expect(repo.load()).toEqual(session);
  });

  it('ignora datos corruptos', () => {
    const storage = fakeStorage();
    const repo = new LocalStorageSessionRepository(() => storage as unknown as Storage);
    storage.setItem('calculadora-notas:session:v1', '{"scheme": 1}');
    expect(repo.load()).toBeNull();
    storage.setItem('calculadora-notas:session:v1', 'no es json');
    expect(repo.load()).toBeNull();
  });

  it('no falla si el almacenamiento no está disponible', () => {
    const repo = new LocalStorageSessionRepository(() => {
      throw new Error('bloqueado');
    });
    expect(repo.load()).toBeNull();
    expect(() => repo.save(createDefaultSession())).not.toThrow();
  });
});
