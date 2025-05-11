import { createStore } from 'solid-js/store';
import { makePersisted } from '@solid-primitives/storage';

export interface VocabularyWordExample {
  sentence: string;
  sentenceTranslated: string;
  wordParts: string[];
  wordTranslated: string;
}

export interface VocabularyWord {
  normalized: string;
  translated: string;
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
  add: (...words: VocabularyWord[]) => {
    setList((prev) => [...prev, ...words]);
  },
  clear: () => {
    setList([]);
  },
};
