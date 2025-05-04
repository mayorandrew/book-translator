import { createStore } from 'solid-js/store';

export interface Word {
  word: string;
  parts: string[];
  normalized: string;
  translated: string;
}

export interface Sentence {
  original: string;
  translated: string;
  words: Word[];
}

export interface TranslationsState {
  loading: boolean;
  sentences: Sentence[];
}

const [store, setStore] = createStore<TranslationsState>({
  loading: false,
  sentences: [],
});

export const translationsStore = {
  state: store,
  add: (...translation: Sentence[]) => {
    setStore('sentences', (prev) => [...prev, ...translation]);
  },
  clear: () => {
    setStore({
      loading: false,
      sentences: [],
    });
  },
  setLoading: (loading: boolean) => {
    setStore('loading', loading);
  },
};
