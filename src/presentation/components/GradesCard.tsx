import { getGrade, isGradeInScale, type GradeRecord, type GradingScheme } from '@/modules/grading';
import { formatGrade, formatPercent } from '../utils/format';
import { NumberField } from './NumberField';

interface GradesCardProps {
  readonly scheme: GradingScheme;
  readonly grades: GradeRecord;
  readonly onGradeChange: (id: string, value: number | null) => void;
  readonly onClear: () => void;
}

export function GradesCard({ scheme, grades, onGradeChange, onClear }: GradesCardProps) {
  const { scale } = scheme;
  const hasGrades = scheme.components.some((c) => getGrade(grades, c.id) !== null);

  return (
    <section className="card" aria-labelledby="grades-title">
      <header className="card__header">
        <div>
          <h2 id="grades-title">Tus notas</h2>
          <p className="muted">Deja vacío lo que aún no te han calificado.</p>
        </div>
        <button type="button" className="btn btn--ghost" onClick={onClear} disabled={!hasGrades}>
          Limpiar
        </button>
      </header>

      <ul className="grade-list">
        {scheme.components.map((component) => {
          const grade = getGrade(grades, component.id);
          const invalid = grade !== null && !isGradeInScale(scale, grade);
          const inputId = `grade-${component.id}`;
          return (
            <li key={component.id} className="grade-row">
              <label htmlFor={inputId} className="grade-row__label">
                <span className="grade-row__name">{component.name || 'Sin nombre'}</span>
                <span className="chip">{formatPercent(component.weight)}</span>
              </label>
              <NumberField
                id={inputId}
                value={grade}
                onChange={(v) => onGradeChange(component.id, v)}
                placeholder="Pendiente"
                invalid={invalid}
                className="grade-row__input"
              />
              {invalid && (
                <span className="field-error" role="alert">
                  Entre {formatGrade(scale.min)} y {formatGrade(scale.max)}
                </span>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
