export type Theme = 'light' | 'dark';

/** Debe coincidir con la clave que lee el script de index.html para evitar parpadeos. */
export const THEME_STORAGE_KEY = 'calculadora-notas:theme';

const DARK_QUERY = '(prefers-color-scheme: dark)';

const isTheme = (value: unknown): value is Theme => value === 'light' || value === 'dark';

/** Tema elegido explícitamente por el usuario, o `null` si sigue al sistema. */
export const loadThemePreference = (): Theme | null => {
  try {
    const value = window.localStorage.getItem(THEME_STORAGE_KEY);
    return isTheme(value) ? value : null;
  } catch {
    return null;
  }
};

export const saveThemePreference = (theme: Theme): void => {
  try {
    window.localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    // Sin almacenamiento: el tema dura solo esta visita.
  }
};

export const systemTheme = (): Theme => (window.matchMedia?.(DARK_QUERY).matches ? 'dark' : 'light');

export const watchSystemTheme = (onChange: (theme: Theme) => void): (() => void) => {
  const query = window.matchMedia?.(DARK_QUERY);
  if (!query) return () => {};
  const listener = (e: MediaQueryListEvent) => onChange(e.matches ? 'dark' : 'light');
  query.addEventListener('change', listener);
  return () => query.removeEventListener('change', listener);
};

export const applyTheme = (theme: Theme): void => {
  document.documentElement.dataset.theme = theme;
};
