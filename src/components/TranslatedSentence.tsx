import type { Component, JSX } from 'solid-js';
import type { Sentence } from '../data/translationsStore';
import s from './TranslatedSentence.module.css';

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
        <span
          class={s.translatedWord}
          title={`${nextWord.parts.join('…')} (${nextWord.normalized}) — ${nextWord.translated}`}
        >
          {nextWord.word}
        </span>,
      );

      index = wordStart + nextWord.word.length;
      iWord++;
    }

    return result;
  };

  return <div class={s.translatedSentence}>{renderWithTranslations()}</div>;
};

export default TranslatedSentence;
