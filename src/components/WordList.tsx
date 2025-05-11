import type { Component } from 'solid-js';
import { For, Show } from 'solid-js';
import { Button } from './ui/Button';
import { VocabularyWord, VocabularyWordExample } from '../data/wordsList';
import s from './WordList.module.css';

interface WordListProps {
  words: VocabularyWord[];
  onBack?: () => void;
}

const WordList: Component<WordListProps> = (props) => {
  return (
    <div class={s.container}>
      <div class={s.tableContainer}>
        <table class={s.table}>
          <thead>
            <tr>
              <th class={s.headerCell}>Original Word</th>
              <th class={s.headerCell}>Translation</th>
              <th class={s.headerCell}>Examples</th>
            </tr>
          </thead>
          <tbody>
            <For each={props.words}>
              {(word: VocabularyWord) => (
                <tr class={s.row}>
                  <td class={s.cell}>{word.normalized}</td>
                  <td class={s.cell}>{word.translated}</td>
                  <td class={s.cell}>
                    <For each={word.examples}>
                      {(example: VocabularyWordExample) => (
                        <div class={s.example}>
                          <p class={s.exampleSentence}>{example.sentence}</p>
                          <p class={s.exampleTranslation}>
                            {example.sentenceTranslated}
                          </p>
                          <p class={s.exampleTranslation}>
                            {example.wordParts.join('…')} —{' '}
                            {example.wordTranslated}
                          </p>
                        </div>
                      )}
                    </For>
                  </td>
                </tr>
              )}
            </For>
            <Show when={props.words.length === 0}>
              <tr class={s.row}>
                <td class={s.cell} colspan="3" style="text-align: center">
                  No words saved yet.
                </td>
              </tr>
            </Show>
          </tbody>
        </table>
      </div>
      <div class={s.buttonContainer}>
        <Button onClick={() => props.onBack?.()}>Back to Translation</Button>
      </div>
    </div>
  );
};

export default WordList;
