import { Component } from 'solid-js';
import ThemeToggle from './ThemeToggle';
import styles from './Navigation.module.css';
import { ButtonLink } from './ui/Button';

const Navigation: Component = () => {
  return (
    <nav class={styles.navigation}>
      <div class={styles.leftButtons}>
        <ButtonLink href="/text/new" variant="secondary" class={styles.navLink}>
          New Text
        </ButtonLink>
        <ButtonLink
          href="/text/translated"
          variant="secondary"
          class={styles.navLink}
        >
          Text
        </ButtonLink>
        <ButtonLink href="/words" variant="secondary" class={styles.navLink}>
          Words
        </ButtonLink>
      </div>
      <div class={styles.rightButtons}>
        <ThemeToggle />
      </div>
    </nav>
  );
};

export default Navigation;
