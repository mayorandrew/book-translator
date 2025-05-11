import { createStore } from 'solid-js/store';

export interface Word {
  word: string;
  parts: string[];
  translated: string;
  normalized: string;
  normalizedTranslations: string[];
}

export interface Sentence {
  original: string;
  translated: string;
  words: Word[];
}

export interface TranslationsState {
  loading: boolean;
  originalLanguage: string;
  targetLanguage: string;
  sentences: Sentence[];
}

const [store, setStore] = createStore<TranslationsState>({
  loading: false,
  originalLanguage: 'de',
  targetLanguage: 'en',
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
  setOriginalLanguage: (language: string) => {
    setStore('originalLanguage', language);
  },
  setTargetLanguage: (language: string) => {
    setStore('targetLanguage', language);
  },
};
