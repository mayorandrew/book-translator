import { createStore } from 'solid-js/store';

export interface Translation {
  original: string;
  translated: string;
}

export interface TranslationsState {
  loading: boolean;
  translations: Translation[];
}

const [store, setStore] = createStore<TranslationsState>({
  loading: false,
  translations: [],
});

export const translations = {
  value: store,
  add: (...translation: Translation[]) => {
    setStore('translations', (prev) => [...prev, ...translation]);
  },
  clear: () => {
    setStore({
      loading: false,
      translations: [],
    });
  },
  setLoading: (loading: boolean) => {
    setStore('loading', loading);
  },
};
