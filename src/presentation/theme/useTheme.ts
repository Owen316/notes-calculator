import { useCallback, useEffect, useState } from 'react';
import { applyTheme, loadThemePreference, saveThemePreference, systemTheme, watchSystemTheme, type Theme } from './themeStorage';

/**
 * Tema actual. Sigue al sistema hasta que el usuario elige uno con `toggle`;
 * desde entonces se recuerda esa elección.
 */
export function useTheme() {
  const [preference, setPreference] = useState<Theme | null>(loadThemePreference);
  const [system, setSystem] = useState<Theme>(systemTheme);
  const theme = preference ?? system;

  useEffect(() => watchSystemTheme(setSystem), []);
  useEffect(() => applyTheme(theme), [theme]);

  const toggle = useCallback(() => {
    const next: Theme = theme === 'dark' ? 'light' : 'dark';
    saveThemePreference(next);
    setPreference(next);
  }, [theme]);

  return { theme, toggle };
}
