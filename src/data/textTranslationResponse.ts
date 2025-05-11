import { z } from 'zod';

const zWord = z
  .object({
    w: z
      .string()
      .describe('The word as it appears in the original sentence.'),
    p: z
      .array(z.string())
      .describe(
        'List of all parts related to the same word from the original sentence',
      ),
    n: z
      .string()
      .describe(
        'The normalized form of the word (e.g. singular nominative for nouns or infinitive for verbs)',
      ),
    t: z
      .string()
      .describe(
        'Translation or explanation of the word into the target language in the context of this sentence',
      ),
    tn: z
      .array(z.string())
      .describe(
        'List of possible translations of the normalized word in the target language',
      ),
  })
  .describe(
    'Information about a single word. If a word consists of multiple parts in different places of the sentence, all parts are included.',
  );

export const zSentence = z.object({
  original: z
    .string()
    .describe(
      'The original sentence in the source language, annotated to highlight words',
    ),
  translated: z.string().describe('The translated sentence'),
  words: z
    .array(zWord)
    .describe(
      'Array of all the words in a sequence from the original sentence',
    ),
});

export const zTextTranslationResponse = z.object({
  originalLanguage: z.string().describe('The 2-letter ISO code of the source language'),
  sentences: z.array(zSentence),
});

export type TextTranslation = z.infer<typeof zTextTranslationResponse>;
