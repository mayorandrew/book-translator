import { Component, createMemo, JSX } from 'solid-js';
import { Popover } from '@kobalte/core/popover';
import type { Sentence, Word } from '../data/translationsStore';
import s from './TranslatedSentence.module.css';
import { Button, ButtonVariant } from './ui/Button';
import { wordsList } from '../data/wordsList';
import { isDeepEqual } from 'remeda';

interface WordProps {
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
    return hasWord()?.examples.some((e) => isDeepEqual(newExample, e));
  };

  return (
    <Popover gutter={-8}>
      <Popover.Trigger class={s.Word}>{props.word.word}</Popover.Trigger>
      <Popover.Portal>
        <Popover.Content class={s.__tooltipContent}>
          <Popover.Arrow />
          <div>{`${props.word.parts.join('…')} (${props.word.normalized}) — ${props.word.translated}`}</div>
          {hasWord() ? (
            <>
              {!hasExample() && (
                <Button
                  class={s.__tooltipButton}
                  title="Add example"
                  onClick={() =>
                    wordsList.addExample(props.word.normalized, example())
                  }
                >
                  +
                </Button>
              )}
              <Button
                variant={ButtonVariant.Secondary}
                class={s.__tooltipButton}
                title="Remove from vocabulary"
                onClick={() => wordsList.removeWord(props.word.normalized)}
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
                  normalized: props.word.normalized,
                  translated: props.word.translated,
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
        <Word word={nextWord} sentence={props.sentence} index={iWord} />,
      );

      index = wordStart + nextWord.word.length;
      iWord++;
    }

    return result;
  };

  return <div class={s.translatedSentence}>{renderWithTranslations()}</div>;
};

export default TranslatedSentence;
