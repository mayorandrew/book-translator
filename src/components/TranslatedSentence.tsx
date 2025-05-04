import type { Component, JSX } from 'solid-js';
import type { Sentence } from '../data/translations';
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

    const locations = words
      .flatMap((word, iWord) =>
        word.parts.map((p) => ({
          ...p.location,
          text: p.text,
          word,
          iWord,
          combined: word.parts.map((p) => p.text).join(' ... '),
        })),
      )
      .sort((a, b) => a.start - b.start);

    let index = 0;
    let iLocation = 0;

    while (index < text.length) {
      const nextLoc = locations.at(iLocation);

      if (!nextLoc) {
        result.push(text.substring(index));
        break;
      }

      if (nextLoc.start > index) {
        result.push(text.substring(index, nextLoc.start));
      }

      const start = Math.max(index, nextLoc.start);

      result.push(
        <span
          class={s.translatedWord}
          title={`${nextLoc.combined} (${nextLoc.word.normalized}) — ${nextLoc.word.translated}`}
        >
          {text.substring(start, nextLoc.end + 1)}
        </span>,
      );

      index = nextLoc.end + 1;
      iLocation++;
    }

    return result;
  };

  return <div class={s.translatedSentence}>{renderWithTranslations()}</div>;
};

export default TranslatedSentence;
