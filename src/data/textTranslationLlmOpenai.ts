import { zodTextFormat } from 'openai/helpers/zod';
import {
  TextTranslation,
  zTextTranslationResponse,
} from './textTranslationResponse';
import { openaiClient } from './openaiClient';
import * as ixa from 'ix/asynciterable';
import * as ixao from 'ix/asynciterable/operators';
import { TextTranslationLlm } from './textTranslationLlm';

export const jTextTranslationResponse = zodTextFormat(
  zTextTranslationResponse,
  'text_translation_response',
);

export const exampleResult: TextTranslation = {
  sentences: [
    {
      original: 'So stelle ich mir meine Traumkatze vor.',
      translated: 'Так я себе представляю мою кошку мечты.',
      words: [
        {
          word: 'So',
          parts: ['So'],
          normalized: 'so',
          translated: 'так',
        },
        {
          word: 'stelle',
          parts: ['stelle', 'vor'],
          normalized: 'vorstellen',
          translated: 'представляю',
        },
        {
          word: 'ich',
          parts: ['ich'],
          normalized: 'ich',
          translated: 'я',
        },
        {
          word: 'mir',
          parts: ['mir'],
          normalized: 'ich',
          translated: 'мне',
        },
        {
          word: 'meine',
          parts: ['meine'],
          normalized: 'mein',
          translated: 'мою',
        },
        {
          word: 'Traumkatze',
          parts: ['Traumkatze'],
          normalized: 'Traumkatze',
          translated: 'кошку мечты',
        },
        {
          word: 'vor',
          parts: ['stelle', 'vor'],
          normalized: 'vorstellen',
          translated: 'представляю',
        },
      ],
    },
    {
      original:
        '„Sie heißt Sternchen", teilte Jasmin ihrer besten Freundin Lara auf dem Nachhauseweg von der Schule mit.',
      translated:
        '«Её зовут Штернхен», - сообщила Жасмин своей лучшей подруге Ларе по дороге домой из школы.',
      words: [
        {
          word: 'Sie',
          parts: ['Sie'],
          normalized: 'sie',
          translated: 'её',
        },
        {
          word: 'heißt',
          parts: ['heißt'],
          normalized: 'heißen',
          translated: 'зовут',
        },
        {
          word: 'Sternchen',
          parts: ['Sternchen'],
          normalized: 'Sternchen',
          translated: 'Штернхен',
        },
        {

          word: 'teilte',
          parts: ['teilte', 'mit'],
          normalized: 'mitteilen',
          translated: 'сообщила',
        },
        {
          word: 'Jasmin',
          parts: ['Jasmin'],
          normalized: 'Jasmin',
          translated: 'Жасмин',
        },
        {
          word: 'ihrer',
          parts: ['ihrer'],
          normalized: 'ihr',
          translated: 'своей',
        },
        {
          word: 'besten',
          parts: ['besten'],
          normalized: 'beste',
          translated: 'лучшей',
        },
        {
          word: 'Freundin',
          parts: ['Freundin'],
          normalized: 'Freundin',
          translated: 'подруге',
        },
        {
          word: 'Lara',
          parts: ['Lara'],
          normalized: 'Lara',
          translated: 'Ларе',
        },
        {
          word: 'auf',
          parts: ['auf'],
          normalized: 'auf',
          translated: 'по',
        },
        {
          word: 'dem',
          parts: ['dem'],
          normalized: 'der',
          translated: 'дороге',
        },
        {
          word: 'Nachhauseweg',
          parts: ['Nachhauseweg'],
          normalized: 'Nachhauseweg',
          translated: 'домой',
        },
        {
          word: 'von',
          parts: ['von'],
          normalized: 'von',
          translated: 'из',
        },
        {
          word: 'der',
          parts: ['der'],
          normalized: 'die',
          translated: 'из',
        },
        {
          word: 'Schule',
          parts: ['Schule'],
          normalized: 'Schule',
          translated: 'школы',
        },
        {
          word: 'mit',
          parts: ['teilte', 'mit'],
          normalized: 'mitteilen',
          translated: 'сообщила',
        },
      ],
    },
  ],
};

export const textTranslationLlmOpenai: TextTranslationLlm = {
  streamTranslations: (
    text: string,
    targetLanguage: string,
    signal?: AbortSignal,
  ): AsyncIterable<string> => {
    const client = openaiClient.client();
    if (!client) {
      console.error('OpenAI client not initialized');
      return ixa.from([]);
    }

    const stream = client.responses.stream(
      {
        model: 'gpt-4.1-mini',
        input: [
          {
            role: 'system',
            content: `
                  You are a translator. Split the text into sentences, translate each sentence into language with ISO code "${targetLanguage}", and return them as a JSON list of objects. 
                  Each object should include the following fields:
                  - "original" - original sentence, 
                  - "translated" - translated sentence in the target language,
                  - "words" - array of all words in sentence. Each word is represented by an object with the following properties:
                    - "normalized" - normalized form of the word,
                    - "translated" - translation of the word in the context of this specific sentence,
                    - "parts" - an array of word parts in the original sentence. If a word has a separable prefix (e.g. German "rufe ... an" / "anrufen"), collect all parts together under a single word.
                  
                  Do not stop until all sentences are printed out.
                  
                  For example, if the target language is "ru" and the original sentences are:
                  \`So stelle ich mir meine Traumkatze vor.\`
                  \`„Sie heißt Sternchen", teilte Jasmin ihrer besten Freundin Lara auf dem Nachhauseweg von der Schule mit.\`
                  
                  The result would be:
                  \`\`\`${JSON.stringify(exampleResult)}\`\`\`
                  `,
          },
          {
            role: 'user',
            content: text,
          },
        ],
        text: { format: jTextTranslationResponse },
      },
      { signal },
    );

    return ixa.from(stream).pipe(
      ixao.filter((chunk) => chunk.type === 'response.output_text.delta'),
      ixao.map((chunk) => chunk.delta),
    );
  },
};
