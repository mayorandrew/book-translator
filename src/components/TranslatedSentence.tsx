import { Component, createMemo, JSX } from 'solid-js';
import { Popover } from '@kobalte/core/popover';
import type { Sentence, Word } from '../data/translationsStore';
import s from './TranslatedSentence.module.css';
import { Button, ButtonVariant } from './ui/Button';
import { wordsList } from '../data/wordsList';
import { isDeepEqual } from 'remeda';

interface WordProps {
  originalLanguage: string;
  targetLanguage: string;
  word: Word;
  sentence: Sentence;
  index: number;
}

const Word: Component<WordProps> = (props) => {
  const hasWord = () => wordsList.findWord(props.word.normalized);

  const example = createMemo(() => ({
    sentence: props.sentence.original,
    sentenceTranslated: props.sentence.translated,
    wordTranslated: props.word.translated,
    wordParts: props.word.parts,
  }));

  const hasExample = () => {
    const newExample = example();
    return hasWord()?.examples.some((e) => isDeepEqual(newExample, e)) || false;
  };

  return (
    <Popover gutter={-8}>
      <Popover.Trigger class={s.Word}>{props.word.word}</Popover.Trigger>
      <Popover.Portal>
        <Popover.Content class={s.__tooltipContent}>
          <Popover.Arrow />
          <div>
            {props.word.parts.join('…')} — {props.word.translated}
            <br />
            {props.word.normalized} —{' '}
            {props.word.normalizedTranslations.join(', ')}
          </div>
          {hasExample() ? (
            <>
              <Button
                variant={ButtonVariant.Secondary}
                class={s.__tooltipButton}
                title="Remove example from vocabulary"
                onClick={() =>
                  wordsList.removeExample(props.word.normalized, example())
                }
              >
                -
              </Button>
            </>
          ) : (
            <Button
              class={s.__tooltipButton}
              title="Add to vocabulary"
              onClick={() =>
                wordsList.add({
                  originalLanguage: props.originalLanguage,
                  targetLanguage: props.targetLanguage,
                  normalized: props.word.normalized,
                  translations: props.word.normalizedTranslations,
                  examples: [example()],
                })
              }
            >
              +
            </Button>
          )}
        </Popover.Content>
      </Popover.Portal>
    </Popover>
  );
};

interface TranslatedSentenceProps {
  sentence: Sentence;
  originalLanguage: string;
  targetLanguage: string;
}

const TranslatedSentence: Component<TranslatedSentenceProps> = (props) => {
  const textGet = () => props.sentence.original;

  const renderWithTranslations = () => {
    const result: JSX.Element[] = [];
    const words = props.sentence.words;
    const text = textGet();

    if (!words || words.length === 0) {
      return text;
    }

    let index = 0;
    let iWord = 0;

    while (index < text.length) {
      const nextWord = words.at(iWord);

      if (!nextWord) {
        result.push(text.substring(index));
        break;
      }

      const wordStart = text.indexOf(nextWord.word, index);

      if (wordStart === -1) {
        iWord++;
        continue;
      }

      if (wordStart > index) {
        result.push(text.substring(index, wordStart));
      }

      result.push(
        <Word
          word={nextWord}
          sentence={props.sentence}
          index={iWord}
          originalLanguage={props.originalLanguage}
          targetLanguage={props.targetLanguage}
        />,
      );

      index = wordStart + nextWord.word.length;
      iWord++;
    }

    return result;
  };

  return <div class={s.translatedSentence}>{renderWithTranslations()}</div>;
};

export default TranslatedSentence;
