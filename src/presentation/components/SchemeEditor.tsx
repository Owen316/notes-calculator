import { totalWeight, type EvaluationComponent, type GradeScale, type GradingScheme, type SchemeIssue } from '@/modules/grading';
import { formatPercent } from '../utils/format';
import { schemeIssueMessage } from '../utils/messages';
import { NumberField } from './NumberField';

interface SchemeEditorProps {
  readonly scheme: GradingScheme;
  readonly issues: readonly SchemeIssue[];
  readonly onComponentChange: (id: string, patch: Partial<Omit<EvaluationComponent, 'id'>>) => void;
  readonly onAddComponent: () => void;
  readonly onRemoveComponent: (id: string) => void;
  readonly onScaleChange: (patch: Partial<GradeScale>) => void;
  readonly onReset: () => void;
}

export function SchemeEditor({
  scheme,
  issues,
  onComponentChange,
  onAddComponent,
  onRemoveComponent,
  onScaleChange,
  onReset,
}: SchemeEditorProps) {
  const total = totalWeight(scheme);
  const totalOk = Math.abs(total - 100) < 0.001;

  return (
    <details className="card card--collapsible" open={issues.length > 0}>
      <summary className="card__summary">
        <div>
          <h2>Configuración del profesor</h2>
          <p className="muted">
            {scheme.components.map((c) => formatPercent(c.weight)).join(' · ')} — gana con {scheme.scale.passing}
          </p>
        </div>
        <span className="chevron" aria-hidden="true" />
      </summary>

      <div className="card__body">
        <div className="weights-table" role="table" aria-label="Porcentajes de cada evaluación">
          <div className="weights-table__head" role="row">
            <span role="columnheader">Evaluación</span>
            <span role="columnheader">Porcentaje</span>
            <span role="columnheader" className="sr-only">
              Acciones
            </span>
          </div>
          {scheme.components.map((c) => (
            <div key={c.id} className="weights-table__row" role="row">
              <input
                type="text"
                role="cell"
                className="text-input"
                value={c.name}
                aria-label="Nombre de la evaluación"
                onChange={(e) => onComponentChange(c.id, { name: e.target.value })}
              />
              <NumberField
                id={`weight-${c.id}`}
                value={c.weight}
                ariaLabel={`Porcentaje de ${c.name}`}
                suffix="%"
                onChange={(v) => onComponentChange(c.id, { weight: v ?? 0 })}
              />
              <button
                type="button"
                className="btn btn--icon"
                aria-label={`Quitar ${c.name}`}
                title="Quitar"
                onClick={() => onRemoveComponent(c.id)}
                disabled={scheme.components.length <= 1}
              >
                ×
              </button>
            </div>
          ))}
          <div className="weights-table__foot">
            <button type="button" className="btn btn--ghost" onClick={onAddComponent}>
              + Agregar evaluación
            </button>
            <span className={`total ${totalOk ? 'total--ok' : 'total--bad'}`}>Total: {formatPercent(total)}</span>
          </div>
        </div>

        <div className="scale-grid">
          <label>
            <span>Nota mínima</span>
            <NumberField id="scale-min" value={scheme.scale.min} onChange={(v) => onScaleChange({ min: v ?? 0 })} />
          </label>
          <label>
            <span>Nota máxima</span>
            <NumberField id="scale-max" value={scheme.scale.max} onChange={(v) => onScaleChange({ max: v ?? 0 })} />
          </label>
          <label>
            <span>Nota para ganar</span>
            <NumberField id="scale-passing" value={scheme.scale.passing} onChange={(v) => onScaleChange({ passing: v ?? 0 })} />
          </label>
        </div>

        {issues.length > 0 && (
          <ul className="issues" role="alert">
            {issues.map((issue, i) => (
              <li key={i}>{schemeIssueMessage(issue, scheme)}</li>
            ))}
          </ul>
        )}

        <button type="button" className="btn btn--ghost btn--danger" onClick={onReset}>
          Restablecer todo (20/20/20/40)
        </button>
      </div>
    </details>
  );
}
