import { Component } from 'solid-js';
import { useTheme } from '../utils/ThemeContext';
import styles from './ThemeToggle.module.css';
import { Button } from './ui/Button';

const ThemeToggle: Component = () => {
  const { theme, setTheme } = useTheme()!;

  return (
    <Button
      class={styles.themeToggle}
      onClick={() => setTheme(theme() === 'light' ? 'dark' : 'light')}
      title={`Switch to ${theme() === 'light' ? 'dark' : 'light'} mode`}
      ariaLabel={`Switch to ${theme() === 'light' ? 'dark' : 'light'} mode`}
    >
      {theme() === 'light' ? '🌙' : '☀️'}
    </Button>
  );
};

export default ThemeToggle;
