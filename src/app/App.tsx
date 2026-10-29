import { GradesCard } from '@/presentation/components/GradesCard';
import { ResultCard } from '@/presentation/components/ResultCard';
import { SchemeEditor } from '@/presentation/components/SchemeEditor';
import { SimulatorCard } from '@/presentation/components/SimulatorCard';
import { ThemeToggle } from '@/presentation/components/ThemeToggle';
import { useGradeCalculator } from '@/presentation/hooks/useGradeCalculator';
import { useTheme } from '@/presentation/theme/useTheme';
import type { Container } from './container';

interface AppProps {
  readonly container: Container;
}

export function App({ container }: AppProps) {
  const { scheme, grades, target, report, scenario, simulatedGrades, actions } = useGradeCalculator(container.sessionService);
  const { theme, toggle: toggleTheme } = useTheme();
  const customTarget = target !== scheme.scale.passing;

  return (
    <div className="app">
      <header className="app__header">
        <div>
          <h1>Calculadora de notas</h1>
          <p>Tu nota final, lo que necesitas para ganar y qué pasaría si…</p>
        </div>
        <ThemeToggle theme={theme} onToggle={toggleTheme} />
      </header>

      <main className="app__grid">
        <div className="app__col">
          <GradesCard scheme={scheme} grades={grades} onGradeChange={actions.setGrade} onClear={actions.clearGrades} />
          <SchemeEditor
            scheme={scheme}
            issues={report.schemeIssues}
            onComponentChange={actions.updateComponent}
            onAddComponent={actions.addComponent}
            onRemoveComponent={actions.removeComponent}
            onScaleChange={actions.updateScale}
            onReset={actions.resetAll}
          />
        </div>
        <div className="app__col">
          <ResultCard scheme={scheme} report={report} target={target} customTarget={customTarget} onTargetChange={actions.setTarget} />
          {scenario && (
            <SimulatorCard
              scheme={scheme}
              scenario={scenario}
              simulatedGrades={simulatedGrades}
              target={target}
              onSimulatedChange={actions.setSimulatedGrade}
              onReset={actions.resetSimulation}
            />
          )}
        </div>
      </main>

      <footer className="app__footer">
        Los cálculos no aplican redondeo: confirma con tu profesor cómo redondea la nota definitiva. Tus datos se guardan solo en este
        navegador.
      </footer>
    </div>
  );
}
