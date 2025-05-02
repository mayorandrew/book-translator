import type { Component } from 'solid-js';
import { For, Show } from 'solid-js';
import s from './TranslationResults.module.css';
import Button from './ui/Button';

interface TranslationResult {
  original: string;
  translated: string;
}

interface TranslationResultsProps {
  results: TranslationResult[];
  loading?: boolean;
  onNewText?: () => void;
}

const TranslationResults: Component<TranslationResultsProps> = (props) => {
  return (
    <div class={s.container}>
      <div class={s.tableContainer}>
      <table class={s.table}>
        <thead>
          <tr>
            <th class={s.headerCell}>Original Text</th>
            <th class={s.headerCell}>Translated Text</th>
          </tr>
        </thead>
        <tbody>
          <For each={props.results}>
            {(result: TranslationResult) => (
              <tr class={s.row}>
                <td class={s.cell}>{result.original}</td>
                <td class={s.cell}>{result.translated}</td>
              </tr>
            )}
          </For>
          <Show when={props.loading}>
            <tr class={s.row}>
              <td class={s.cell} colspan="2" style="text-align: center">
                Loading more translations...
              </td>
            </tr>
          </Show>
        </tbody>
      </table>
      </div>
      <div class={s.buttonContainer}>
        <Button onClick={() => props.onNewText?.()}>
          New Text
        </Button>
      </div>
    </div>
  );
};

export default TranslationResults;
