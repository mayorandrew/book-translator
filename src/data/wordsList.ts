import { createStore } from 'solid-js/store';
import { makePersisted } from '@solid-primitives/storage';
import { isDeepEqual, unique } from 'remeda';

export interface VocabularyWordExample {
  sentence: string;
  sentenceTranslated: string;
  wordParts: string[];
  wordTranslated: string;
}

export interface VocabularyWord {
  originalLanguage: string;
  targetLanguage: string;
  normalized: string;
  translations: string[];
  examples: VocabularyWordExample[];
}

const [list, setList] = makePersisted(createStore<VocabularyWord[]>([]), {
  name: 'words-list',
});

export const wordsList = {
  state: list,
  findWord: (normalized: string) => {
    return list.find((word) => word.normalized === normalized);
  },
  removeWord: (normalized: string) => {
    setList((prev) => prev.filter((word) => word.normalized !== normalized));
  },
  removeExample: (normalized: string, example: VocabularyWordExample) => {
    setList((prev) => {
      return prev
        .map((word) => {
          if (word.normalized === normalized) {
            return {
              ...word,
              examples: word.examples.filter((e) => !isDeepEqual(e, example)),
            };
          }
          return word;
        })
        .filter((word) => word.examples.length > 0);
    });
  },
  addExample: (normalized: string, example: VocabularyWordExample) => {
    setList((prev) => {
      return prev.map((word) => {
        if (word.normalized === normalized) {
          return {
            ...word,
            examples: [...word.examples, example],
          };
        }
        return word;
      });
    });
  },
  add: (word: VocabularyWord) => {
    setList((prev) => {
      const existing = prev.find((w) => w.normalized === word.normalized);
      if (existing) {
        return prev.map((w) => {
          if (w.normalized === word.normalized) {
            return {
              ...w,
              translations: unique([...w.translations, ...word.translations]),
              examples: [...w.examples, ...word.examples],
            };
          }
          return w;
        });
      }

      return [...prev, word];
    });
  },
  clear: () => {
    setList([]);
  },
};
