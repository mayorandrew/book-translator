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
          parts: [
            {
              text: 'So',
              location: {
                start: 0,
                end: 2,
              },
            },
          ],
          normalized: 'so',
          translated: 'так',
        },
        {
          parts: [
            {
              text: 'stelle',
              location: {
                start: 3,
                end: 8,
              },
            },
            {
              text: 'vor',
              location: {
                start: 35,
                end: 38,
              },
            },
          ],
          normalized: 'vorstellen',
          translated: 'представляю',
        },
        {
          parts: [
            {
              text: 'ich',
              location: {
                start: 10,
                end: 13,
              },
            },
          ],
          normalized: 'ich',
          translated: 'я',
        },
        {
          parts: [
            {
              text: 'mir',
              location: {
                start: 14,
                end: 17,
              },
            },
          ],
          normalized: 'ich',
          translated: 'мне',
        },
        {
          parts: [
            {
              text: 'meine',
              location: {
                start: 18,
                end: 23,
              },
            },
          ],
          normalized: 'mein',
          translated: 'мою',
        },
        {
          parts: [
            {
              text: 'Traumkatze',
              location: {
                start: 24,
                end: 34,
              },
            },
          ],
          normalized: 'Traumkatze',
          translated: 'кошку мечты',
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
                  You are a translator. Split the text into sentences, translate each sentence into language with ISO code "${targetLanguage}", and return them as a JSON list of objects. Each object should have "original" and "translated" fields.
                  Also include all of the words of the original sentence along with their translations and locations in the "words" fields. 
                  If a word has a separable prefix, collect all parts together under a single word. 
                  The location indexes should be relative to the sentence, not the entire text.
                  Do not stop until all sentences are printed out.
                  
                  For example, if the target language is "ru" and the original sentence is:
                  "So stelle ich mir meine Traumkatze vor."
                  The the result would be:
                  ${JSON.stringify(exampleResult)}
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
