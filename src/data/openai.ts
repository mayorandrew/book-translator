import { createSignal, createEffect } from 'solid-js';
import OpenAI from 'openai';
import { makePersisted } from '@solid-primitives/storage';

const [openaiApiKey, setOpenaiApiKey] = makePersisted(
  createSignal<string | null>(null),
  { name: 'openai-api-key' },
);

const [openaiClient, setOpenaiClient] = createSignal<OpenAI | null>(null);

createEffect(() => {
  const key = openaiApiKey();
  if (key) {
    const client = new OpenAI({
      apiKey: key,
      dangerouslyAllowBrowser: true,
    });
    setOpenaiClient(client);
  } else {
    setOpenaiClient(null);
  }
});

export { setOpenaiApiKey, openaiClient };
