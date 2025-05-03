import * as ixa from 'ix/asynciterable';
import * as ixao from 'ix/asynciterable/operators';
import { z } from 'zod';
import { APIUserAbortError } from 'openai';
import { zodTextFormat } from 'openai/helpers/zod';
import { splitTextIntoBatches } from '../utils/splitTextIntoBatches';
import { jsonParse } from '../utils/jsonParse';
import { openaiClient } from './openai';
import { translations } from './translations';

const zTranslation = z.object({
  original: z.string().describe('The original sentence in the source language'),
  translated: z.string().describe('The translated sentence'),
});

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
                content: `You are a translator. Split the text into sentences, translate each sentence into language with ISO code "${targetLanguage}", and return them as a JSON list of objects. Each object should have "original" and "translated" fields.`,
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
      translations.add(item);
    }
  } catch (error) {
    if (error instanceof APIUserAbortError) {
      return;
    }

    console.error('Translation fetching error:', error);
  } finally {
    translations.setLoading(false);
  }
};
