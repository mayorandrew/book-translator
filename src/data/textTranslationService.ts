import * as ixa from 'ix/asynciterable';
import * as ixao from 'ix/asynciterable/operators';
import { APIUserAbortError } from 'openai';
import { splitTextIntoBatches } from '../utils/splitTextIntoBatches';
import { jsonParse } from '../utils/jsonParse';
import { translationsStore } from './translationsStore';
import { createSignal } from 'solid-js';
import { zSentence } from './textTranslationResponse';
import { textTranslationLlmOpenai } from './textTranslationLlmOpenai';
import { textTranslationLlmDemo } from './textTranslationLlmDemo';
import { demoMode } from './demoMode';

const translateTextLlm = () =>
  demoMode().isDemo() ? textTranslationLlmDemo() : textTranslationLlmOpenai();

const translateText = async (
  text: string,
  targetLanguage: string,
  signal?: AbortSignal,
): Promise<void> => {
  const translationsStore1 = translationsStore();
  const translateTextLlmProvider1 = translateTextLlm();

  translationsStore1.setLoading(true);
  try {
    const batches = splitTextIntoBatches(text, 1000);
    console.log('Batches', batches);

    const translationsIterable = ixa.from(batches).pipe(
      ixao.concatMap((batch, iBatch, signal) => {
        console.log('Requesting batch', batch);

        const stream = translateTextLlmProvider1.streamTranslations(
          batch,
          targetLanguage,
          signal,
        );

        return ixa.from(stream).pipe(
          jsonParse(),
          ixao.filter(
            (item) =>
              item.stack.length === 2 && item.stack[1].key === 'sentences',
          ),
        );
      }),
      ixao.flatMap((item) => {
        const res = zSentence.safeParse(item.value);
        if (res.success) {
          return [res.data];
        } else {
          console.error('Invalid translation format:', res.error);
          return [];
        }
      }),
    );

    for await (const item of ixao.wrapWithAbort(translationsIterable, signal)) {
      console.log('Item', item);
      translationsStore1.add(item);
    }

    console.log(
      'Final result',
      JSON.stringify(translationsStore1.state.sentences),
    );
  } catch (error) {
    if (error instanceof APIUserAbortError) {
      return;
    }

    console.error('Translation fetching error:', error);
  } finally {
    translationsStore1.setLoading(false);
  }
};

export const [textTranslationService] = createSignal({
  translateText,
});
