import type { GradeScale } from '@/modules/grading';
import { formatGrade } from '../utils/format';

interface GradeMeterProps {
  readonly scale: GradeScale;
  /** Nota asegurada. */
  readonly secured: number;
  /** Máximo alcanzable (igual a `secured` si no queda nada pendiente). */
  readonly reachable: number;
  readonly target: number;
}

/** Barra de la escala: lo asegurado, lo que aún se puede ganar y la meta. */
export function GradeMeter({ scale, secured, reachable, target }: GradeMeterProps) {
  const span = scale.max - scale.min;
  const pct = (v: number) => `${Math.max(0, Math.min(100, ((v - scale.min) / span) * 100))}%`;

  return (
    <div className="meter" role="img" aria-label={`Asegurado ${formatGrade(secured)}, máximo posible ${formatGrade(reachable)}, meta ${formatGrade(target)}`}>
      <div className="meter__track">
        <div className="meter__reachable" style={{ width: pct(reachable) }} />
        <div className="meter__secured" style={{ width: pct(secured) }} />
        <div className="meter__target" style={{ left: pct(target) }}>
          <span>Meta {formatGrade(target)}</span>
        </div>
      </div>
      <div className="meter__scale">
        <span>{formatGrade(scale.min)}</span>
        <span>{formatGrade(scale.max)}</span>
      </div>
    </div>
  );
}
