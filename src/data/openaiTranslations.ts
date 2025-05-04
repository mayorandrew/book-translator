import * as ixa from 'ix/asynciterable';
import * as ixao from 'ix/asynciterable/operators';
import { z } from 'zod';
import { APIUserAbortError } from 'openai';
import { zodTextFormat } from 'openai/helpers/zod';
import { splitTextIntoBatches } from '../utils/splitTextIntoBatches';
import { jsonParse } from '../utils/jsonParse';
import { openaiClient } from './openai';
import { translations } from './translations';

const zInt = z.number().int();

const zLocation = z.object({
  start: zInt.describe(
    'The start index of the location in the original sentence',
  ),
  end: zInt.describe('The end index of the location in the original sentence'),
});

const zWordPart = z.object({
  text: z
    .string()
    .describe('The part of the word as it appears in the original sentence'),
  location: zLocation.describe(
    'The location of the word part in the original sentence',
  ),
});

const zWord = z
  .object({
    parts: z
      .array(zWordPart)
      .describe('List of all word parts from the original sentence'),
    normalized: z
      .string()
      .describe(
        'The normalized form of the word (e.g. singular nominative for nouns or infinitive for verbs)',
      ),
    translated: z
      .string()
      .describe(
        'Translation of the word into the target language corresponding to its meaning in this sentence',
      ),
  })
  .describe(
    'Information about a single word. If a word consists of multiple parts in different places of the sentence, all parts are included.',
  );

const zTranslation = z.object({
  original: z.string().describe('The original sentence in the source language'),
  translated: z.string().describe('The translated sentence'),
  words: z
    .array(zWord)
    .describe(
      'Array of all the words in a sequence from the original sentence',
    ),
});

type Translation = z.infer<typeof zTranslation>;

const zTranslations = z.object({
  translations: z.array(zTranslation),
});

const jTranslations = zodTextFormat(zTranslations, 'translations_response');

export const translateText = async (
  text: string,
  targetLanguage: string,
  signal?: AbortSignal,
): Promise<void> => {
  const client = openaiClient();
  if (!client) {
    console.error('OpenAI client not initialized');
    return;
  }

  translations.setLoading(true);
  try {
    const batches = splitTextIntoBatches(text, 10000);

    const translationsIterable = ixa.from(batches).pipe(
      ixao.concatMap((batch, iBatch, signal) => {
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
                  
                  For example, if the target language is "ru" and the original sentence is:
                  "So stelle ich mir meine Traumkatze vor."
                  
                  The the result would be:
                  ${JSON.stringify({
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
                  } satisfies Translation)}
                  `,
              },
              {
                role: 'user',
                content: batch,
              },
            ],
            text: { format: jTranslations },
          },
          { signal },
        );

        return ixa.from(stream);
      }),
      ixao.filter((chunk) => chunk.type === 'response.output_text.delta'),
      ixao.map((chunk) => chunk.delta),
      jsonParse(),
      ixao.filter((item) => {
        return item.stack.length === 2 && item.stack[1].key === 'translations';
      }),
      ixao.flatMap((item) => {
        const res = zTranslation.safeParse(item.value);
        if (res.success) {
          return [res.data];
        } else {
          console.error('Invalid translation format:', res.error);
          return [];
        }
      }),
    );

    for await (const item of ixao.wrapWithAbort(translationsIterable, signal)) {
      console.log(item);
      translations.add(item);
    }

    console.log(translations.value.sentences);
  } catch (error) {
    if (error instanceof APIUserAbortError) {
      return;
    }

    console.error('Translation fetching error:', error);
  } finally {
    translations.setLoading(false);
  }
};
