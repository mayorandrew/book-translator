import {
  createContext,
  createSignal,
  createEffect,
  useContext,
  JSX,
} from 'solid-js';
import { makePersisted } from '@solid-primitives/storage';

export type Theme = 'light' | 'dark';

export interface ThemeContextType {
  theme: () => Theme;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType>();

export function ThemeProvider(props: { children: JSX.Element }) {
  const [theme, setTheme] = makePersisted(
    createSignal<Theme>(getInitialTheme()),
    { name: 'theme' },
  );

  createEffect(() => {
    document.documentElement.setAttribute('data-theme', theme());
  });

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {props.children}
    </ThemeContext.Provider>
  );
}

function getInitialTheme(): Theme {
  if (
    window.matchMedia &&
    window.matchMedia('(prefers-color-scheme: dark)').matches
  ) {
    return 'dark';
  }

  return 'light';
}

export function useTheme() {
  return useContext(ThemeContext);
}
