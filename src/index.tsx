/* @refresh reload */
import './utils/normalize.css';
import './index.css';
import 'ix/asynciterable/todomstream';
import { render } from 'solid-js/web';
import App from './App';

// Set initial theme based on saved preference or system preference
const getInitialTheme = () => {
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme === 'light' || savedTheme === 'dark') {
    return savedTheme;
  }
  
  // Check system preference
  if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    return 'dark';
  }
  
  return 'light';
};

// Apply theme to document before rendering to prevent flash
document.documentElement.setAttribute('data-theme', getInitialTheme());

const root = document.getElementById('root');

if (!root) {
  throw new Error('Root element not found.');
}

if (import.meta.env.DEV && !(root instanceof HTMLElement)) {
  throw new Error(
    'Root element not found. Did you forget to add it to your index.html? Or maybe the id attribute got misspelled?',
  );
}

render(() => <App />, root);
