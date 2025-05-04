import { z } from 'zod';

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

export const zSentence = z.object({
  original: z.string().describe('The original sentence in the source language'),
  translated: z.string().describe('The translated sentence'),
  words: z
    .array(zWord)
    .describe(
      'Array of all the words in a sequence from the original sentence',
    ),
});

export const zTextTranslationResponse = z.object({
  sentences: z.array(zSentence),
});

export type TextTranslation = z.infer<typeof zTextTranslationResponse>;
