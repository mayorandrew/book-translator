import type { Component } from 'solid-js';
import { For, Show } from 'solid-js';
import { VocabularyWord, VocabularyWordExample } from '../data/wordsList';
import { stringify } from 'csv-stringify/browser/esm/sync';
import { Button } from './ui/Button';
import s from './WordList.module.css';

interface WordListProps {
  words: VocabularyWord[];
}

const WordList: Component<WordListProps> = (props) => {
  const exportToCSV = () => {
    // Prepare data for CSV
    const csvData = props.words.map(word => {
      // Get the first example if available
      const firstExample = word.examples[0] || null;

      return {
        Original: word.normalized,
        Translated: word.translations?.join(', ') || '',
        OriginalExample: firstExample ? firstExample.sentence : '',
        TranslatedExample: firstExample ? firstExample.sentenceTranslated : ''
      };
    });

    // Generate CSV
    const csvString = stringify(csvData, {
      header: true,
      columns: ['Original', 'Translated', 'OriginalExample', 'TranslatedExample']
    });

    // Create download link
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'vocabulary.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div class={s.container}>
      <div class={s.exportButtonContainer}>
        <Button onClick={exportToCSV}>
          Export to CSV
        </Button>
      </div>
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
                  <td class={s.cell}>{word.translations?.join(', ')}</td>
                  <td class={s.cell}>
                    <For each={word.examples}>
                      {(example: VocabularyWordExample) => (
                        <div class={s.example}>
                          <p class={s.exampleTranslation}>
                            {example.wordParts.join('…')} —{' '}
                            {example.wordTranslated}
                          </p>
                          <p class={s.exampleSentence}>{example.sentence}</p>
                          <p class={s.exampleTranslation}>
                            {example.sentenceTranslated}
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
    </div>
  );
};

export default WordList;
