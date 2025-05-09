import * as ixa from 'ix/asynciterable';
import * as ixao from 'ix/asynciterable/operators';
import { APIUserAbortError } from 'openai';
import { splitTextIntoBatches } from '../utils/splitTextIntoBatches';
import { jsonParse } from '../utils/jsonParse';
import { translationsStore } from './translationsStore';
import { zSentence } from './textTranslationResponse';
import { textTranslationLlmOpenai } from './textTranslationLlmOpenai';
import { textTranslationLlmDemo } from './textTranslationLlmDemo';
import { demoMode } from './demoMode';
import { TextTranslationLlm } from './textTranslationLlm';

const translateTextLlm = (): TextTranslationLlm =>
  demoMode.isDemo() ? textTranslationLlmDemo : textTranslationLlmOpenai;

const translateText = async (
  text: string,
  targetLanguage: string,
  signal?: AbortSignal,
): Promise<void> => {
  const llm = translateTextLlm();

  translationsStore.setLoading(true);
  try {
    const batches = splitTextIntoBatches(text, 1000);
    console.log('Batches', batches);

    const translationsIterable = ixa.from(batches).pipe(
      ixao.concatMap((batch, iBatch, signal) => {
        console.log('Requesting batch', batch);

        const stream = llm.streamTranslations(batch, targetLanguage, signal);

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
      translationsStore.add(item);
    }

    console.log(
      'Final result',
      JSON.stringify(translationsStore.state.sentences),
    );
  } catch (error) {
    if (error instanceof APIUserAbortError) {
      return;
    }

    console.error('Translation fetching error:', error);
  } finally {
    translationsStore.setLoading(false);
  }
};

export const textTranslationService = {
  translateText,
};
