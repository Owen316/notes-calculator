import type { CSSProperties } from 'react';
import { getGrade, type GradeRecord, type GradingScheme, type Requirement, type ScenarioResult } from '@/modules/grading';
import { formatGrade } from '../utils/format';

interface SimulatorCardProps {
  readonly scheme: GradingScheme;
  readonly scenario: ScenarioResult;
  readonly simulatedGrades: GradeRecord;
  readonly target: number;
  readonly onSimulatedChange: (id: string, value: number) => void;
  readonly onReset: () => void;
}

const SLIDER_STEP = 0.1;

/** El deslizador arranca en el valor exacto requerido, pero al moverlo avanza de 0.1 en 0.1. */
const snapToStep = (value: number): number => Number((Math.round(value / SLIDER_STEP) * SLIDER_STEP).toFixed(1));

const requirementHint = (r: Requirement, scheme: GradingScheme): { text: string; tone: string } => {
  switch (r.status) {
    case 'achievable':
      return { text: `Necesitas mínimo ${formatGrade(r.requiredGrade!)} aquí`, tone: 'info' };
    case 'secured':
      return { text: `Llegas aunque saques ${formatGrade(scheme.scale.min)} aquí`, tone: 'success' };
    case 'impossible':
      return { text: `No alcanza ni con ${formatGrade(scheme.scale.max)} aquí`, tone: 'danger' };
    default:
      return { text: '', tone: 'info' };
  }
};

export function SimulatorCard({ scheme, scenario, simulatedGrades, target, onSimulatedChange, onReset }: SimulatorCardProps) {
  const { scale } = scheme;
  const projected = scenario.summary.accumulated;
  const reaches = scenario.requirement.status === 'passed';
  const showPerComponent = scenario.perComponent.length > 1;

  return (
    <section className="card" aria-labelledby="sim-title">
      <header className="card__header">
        <div>
          <h2 id="sim-title">Simulador</h2>
          <p className="muted">Mueve las notas pendientes y mira qué pasaría.</p>
        </div>
        <button type="button" className="btn btn--ghost" onClick={onReset}>
          Reiniciar
        </button>
      </header>

      <ul className="sim-list">
        {scenario.perComponent.map(({ componentId, requirement }) => {
          const component = scheme.components.find((c) => c.id === componentId);
          if (!component) return null;
          const value = getGrade(simulatedGrades, componentId) ?? scale.passing;
          const hint = requirementHint(requirement, scheme);
          const sliderId = `sim-${componentId}`;
          return (
            <li key={componentId} className="sim-row">
              <div className="sim-row__top">
                <label htmlFor={sliderId}>{component.name}</label>
                <output htmlFor={sliderId} className="sim-row__value">
                  {formatGrade(value)}
                </output>
              </div>
              <input
                id={sliderId}
                type="range"
                min={scale.min}
                max={scale.max}
                step="any"
                value={value}
                style={{ '--fill': `${((value - scale.min) / (scale.max - scale.min)) * 100}%` } as CSSProperties}
                onChange={(e) => onSimulatedChange(componentId, snapToStep(Number(e.target.value)))}
              />
              {showPerComponent && <span className={`hint hint--${hint.tone}`}>{hint.text} (con lo simulado en las demás)</span>}
            </li>
          );
        })}
      </ul>

      <div className={`projection ${reaches ? 'projection--ok' : 'projection--bad'}`}>
        <span>Con estas notas terminarías con</span>
        <strong>{formatGrade(projected)}</strong>
        <span>{reaches ? `✓ alcanzas ${formatGrade(target)}` : `✗ te faltan ${formatGrade(target - projected)}`}</span>
      </div>
    </section>
  );
}
