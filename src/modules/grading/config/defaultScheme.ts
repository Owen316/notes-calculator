import type { GradingSession } from '../application';
import type { GradingScheme } from '../domain';

/** Esquema por defecto: 1er corte 20%, 2do corte 20%, TCC 20%, examen final 40%. */
export const createDefaultScheme = (): GradingScheme => ({
  scale: { min: 0, max: 5, passing: 3 },
  components: [
    { id: 'corte-1', name: 'Primer corte', weight: 20 },
    { id: 'corte-2', name: 'Segundo corte', weight: 20 },
    { id: 'tcc', name: 'TCC', weight: 20 },
    { id: 'examen-final', name: 'Examen final', weight: 40 },
  ],
});

export const createDefaultSession = (): GradingSession => ({
  scheme: createDefaultScheme(),
  grades: {},
  target: null,
});
