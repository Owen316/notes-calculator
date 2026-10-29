import type { GradeReport, GradingScheme } from '@/modules/grading';
import { formatGrade, formatList, formatPercent } from '../utils/format';
import { gradeIssueMessage } from '../utils/messages';
import { GradeMeter } from './GradeMeter';
import { NumberField } from './NumberField';

interface ResultCardProps {
  readonly scheme: GradingScheme;
  readonly report: GradeReport;
  readonly target: number;
  readonly customTarget: boolean;
  readonly onTargetChange: (value: number | null) => void;
}

type Tone = 'success' | 'warning' | 'danger' | 'info';

export function ResultCard({ scheme, report, target, customTarget, onTargetChange }: ResultCardProps) {
  const { summary, requirement } = report;

  if (!summary || !requirement) {
    return (
      <section className="card result" aria-live="polite">
        <h2>Resultado</h2>
        <ul className="issues">
          {report.schemeIssues.length > 0 && <li>Corrige la configuración del profesor para ver tu resultado.</li>}
          {report.gradeIssues.map((issue, i) => (
            <li key={`g${i}`}>{gradeIssueMessage(issue, scheme)}</li>
          ))}
        </ul>
      </section>
    );
  }

  const names = (ids: readonly string[]) => scheme.components.filter((c) => ids.includes(c.id)).map((c) => c.name);
  const pendingNames = names(requirement.pendingComponentIds);
  const goal = customTarget ? `llegar a ${formatGrade(target)}` : 'ganar la materia';

  const verdict = ((): { tone: Tone; title: string; detail: string } => {
    switch (requirement.status) {
      case 'achievable':
        return {
          tone: requirement.requiredGrade! > scheme.scale.passing ? 'warning' : 'info',
          title: `Necesitas ${formatGrade(requirement.requiredGrade!)}`,
          detail:
            pendingNames.length > 1
              ? `en cada una de: ${formatList(pendingNames)} para ${goal}. Usa el simulador para probar otras combinaciones.`
              : `en ${pendingNames[0]} para ${goal}.`,
        };
      case 'secured':
        return {
          tone: 'success',
          title: customTarget ? '¡Ya tienes tu meta asegurada!' : '¡Ya ganaste la materia!',
          detail: `Aunque saques ${formatGrade(scheme.scale.min)} en lo que falta, terminas con ${formatGrade(summary.minReachable)}.`,
        };
      case 'impossible':
        return {
          tone: 'danger',
          title: customTarget ? 'Esa meta ya no es alcanzable' : 'Ya no alcanza para ganar',
          detail: `Aun sacando ${formatGrade(scheme.scale.max)} en ${formatList(pendingNames)}, lo máximo posible es ${formatGrade(summary.maxReachable)}.`,
        };
      case 'passed':
        return {
          tone: 'success',
          title: customTarget ? '¡Alcanzaste tu meta!' : '¡Ganaste la materia!',
          detail: `Tu nota final es ${formatGrade(summary.accumulated)}.`,
        };
      case 'failed':
        return {
          tone: 'danger',
          title: customTarget ? 'No alcanzaste tu meta' : 'No alcanzó para ganar',
          detail: `Tu nota final es ${formatGrade(summary.accumulated)}; faltaron ${formatGrade(target - summary.accumulated)} puntos.`,
        };
    }
  })();

  return (
    <section className="card result" aria-labelledby="result-title" aria-live="polite">
      <header className="card__header">
        <h2 id="result-title">{summary.isComplete ? 'Nota final' : 'Cómo vas'}</h2>
        <label className="target-field">
          <span>Meta</span>
          <NumberField
            id="target"
            value={customTarget ? target : null}
            placeholder={formatGrade(scheme.scale.passing)}
            ariaLabel="Nota que quieres alcanzar"
            onChange={onTargetChange}
          />
        </label>
      </header>

      <div className="result__figures">
        <div className="figure figure--main">
          <span className="figure__value">{formatGrade(summary.accumulated)}</span>
          <span className="figure__label">{summary.isComplete ? 'Definitiva' : 'Acumulado'}</span>
        </div>
        {!summary.isComplete && (
          <>
            <div className="figure">
              <span className="figure__value">{formatGrade(summary.maxReachable)}</span>
              <span className="figure__label">Máximo posible</span>
            </div>
            <div className="figure">
              <span className="figure__value">{formatPercent(summary.evaluatedWeight)}</span>
              <span className="figure__label">Evaluado</span>
            </div>
          </>
        )}
      </div>

      <GradeMeter scale={scheme.scale} secured={summary.accumulated} reachable={summary.maxReachable} target={target} />

      <div className={`verdict verdict--${verdict.tone}`}>
        <strong>{verdict.title}</strong>
        <p>{verdict.detail}</p>
      </div>
    </section>
  );
}
