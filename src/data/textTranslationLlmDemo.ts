import { createSignal } from 'solid-js';
import example from './textTranslationLlmDemoResponse.json';
import * as ixao from 'ix/asynciterable/operators';

export const [textTranslationLlmDemo] = createSignal({
  streamTranslations: (
    text: string,
    targetLanguage: string,
    signal?: AbortSignal,
  ): AsyncIterable<string> => {
    const exampleStr = JSON.stringify(example);

    async function* fetchDemo() {
      const size = 100;
      for (let i = 0; i < exampleStr.length; i += size) {
        const chunk = exampleStr.slice(i, i + size);
        yield chunk;
        await new Promise((resolve) => setTimeout(resolve, 100));
      }
    }

    return ixao.wrapWithAbort(fetchDemo(), signal);
  },
});
