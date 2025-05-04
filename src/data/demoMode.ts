import { createSignal } from 'solid-js';

const [isDemo, setIsDemo] = createSignal(false);

export const demoMode = {
  isDemo,
  setIsDemo,
};
