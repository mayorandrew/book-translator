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
  originalLanguage: 'de',
  sentences: [
    {
      original: 'So stelle ich mir meine Traumkatze vor.',
      translated: 'Так я представляю себе свою кошку мечты.',
      words: [
        {
          w: 'So',
          p: ['So'],
          n: 'so',
          t: 'так',
          tn: ['так', 'таким образом', 'столько'],
        },
        {
          w: 'stelle',
          p: ['stelle', 'vor'],
          n: 'vorstellen',
          t: 'представляю',
          tn: ['представлять'],
        },
        {
          w: 'ich',
          p: ['ich'],
          n: 'ich',
          t: 'я',
          tn: ['я'],
        },
        {
          w: 'mir',
          p: ['mir'],
          n: 'ich',
          t: 'себе',
          tn: ['мне', 'себе'],
        },
        {
          w: 'meine',
          p: ['meine'],
          n: 'mein',
          t: 'свою',
          tn: ['мой', 'моя', 'мое', 'мои'],
        },
        {
          w: 'Traumkatze',
          p: ['Traumkatze'],
          n: 'Traumkatze',
          t: 'кошку мечты',
          tn: ['кошка мечты', 'идеальная кошка'],
        },
        {
          w: 'vor',
          p: ['stelle', 'vor'],
          n: 'vorstellen',
          t: 'представляю',
          tn: ['представлять'],
        },
      ],
    },
    {
      original:
        '„Sie heißt Sternchen", teilte Jasmin ihrer besten Freundin Lara auf dem Nachhauseweg von der Schule mit.',
      translated:
        '«Её зовут Штернхен», — сообщила Жасмин своей лучшей подруге Ларе по дороге домой со школы.',
      words: [
        {
          w: 'Sie',
          p: ['Sie'],
          n: 'sie',
          t: 'она',
          tn: ['она', 'вы', 'они'],
        },
        {
          w: 'heißt',
          p: ['heißt'],
          n: 'heißen',
          t: 'зовут',
          tn: ['звать', 'называться'],
        },
        {
          w: 'Sternchen',
          p: ['Sternchen'],
          n: 'Sternchen',
          t: 'Штернхен',
          tn: ['Sternchen'],
        },
        {
          w: 'teilte',
          p: ['teilte', 'mit'],
          n: 'mitteilen',
          t: 'сообщила',
          tn: ['сообщать', 'передавать', 'уведомлять'],
        },
        {
          w: 'Jasmin',
          p: ['Jasmin'],
          n: 'Jasmin',
          t: 'Жасмин',
          tn: ['Jasmin'],
        },
        {
          w: 'ihrer',
          p: ['ihrer'],
          n: 'ihr',
          t: 'своей',
          tn: ['ее', 'свой'],
        },
        {
          w: 'besten',
          p: ['besten'],
          n: 'gut',
          t: 'лучшей',
          tn: ['хороший', 'лучший'],
        },
        {
          w: 'Freundin',
          p: ['Freundin'],
          n: 'Freundin',
          t: 'подруге',
          tn: ['подруга', 'приятельница'],
        },
        {
          w: 'Lara',
          p: ['Lara'],
          n: 'Lara',
          t: 'Ларе',
          tn: ['Lara'],
        },
        {
          w: 'auf',
          p: ['auf'],
          n: 'auf',
          t: 'по',
          tn: ['на', 'в', 'по'],
        },
        {
          w: 'dem',
          p: ['dem'],
          n: 'der',
          t: 'по (артикль дательного падежа)',
          tn: ['тот', 'этот'],
        },
        {
          w: 'Nachhauseweg',
          p: ['Nachhauseweg'],
          n: 'Nachhauseweg',
          t: 'дороге домой',
          tn: ['путь домой', 'дорога домой'],
        },
        {
          w: 'von',
          p: ['von'],
          n: 'von',
          t: 'со',
          tn: ['от', 'со'],
        },
        {
          w: 'der',
          p: ['der'],
          n: 'der',
          t: 'со (артикль рода женского)',
          tn: ['тот', 'этот'],
        },
        {
          w: 'Schule',
          p: ['Schule'],
          n: 'Schule',
          t: 'школы',
          tn: ['школа', 'училище'],
        },
        {
          w: 'mit',
          p: ['teilte', 'mit'],
          n: 'mitteilen',
          t: 'сообщила',
          tn: ['сообщать', 'передавать', 'уведомлять'],
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
            content:
              `
                  You are a translator.
                  Detect the original language of the text and split the text into sentences. 
                  Translate each sentence into language with ISO code "${targetLanguage}", and return them as a JSON list of objects. 
                  Each object should include the following fields:
                  - "original" - original sentence, 
                  - "translated" - translated sentence in the target language,
                  - "words" - array of all words in sentence. Each word is represented by an object with the following properties:
                    - "normalized" - normalized form of the word,
                    - "translated" - translation of the word in the context of this specific sentence,
                    - "parts" - an array of word parts in the original sentence. If a word has a separable prefix (e.g. German "rufe ... an" / "anrufen"), collect all parts together under a single word,
                    - "tn" - an array of possible translations of the normalized word in the target language.
                  
                  Do not stop until all sentences are printed out.
                  ` +
              `
                For example, if the target language is "ru" and the original sentences are:
                \`So stelle ich mir meine Traumkatze vor.\`
                \`„Sie heißt Sternchen", teilte Jasmin ihrer besten Freundin Lara auf dem Nachhauseweg von der Schule mit.\`

                The result would be:
                \`\`\`${JSON.stringify(exampleResult)}\`\`\``,
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
