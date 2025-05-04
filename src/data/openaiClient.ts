import { createSignal } from 'solid-js';
import OpenAI from 'openai';
import { makePersisted } from '@solid-primitives/storage';

const [apiKey, setApiKey] = makePersisted(createSignal<string | null>(null), {
  name: 'openai-api-key',
});

const client = () => {
  const key = apiKey();
  if (!key) {
    return null;
  }

  return new OpenAI({
    apiKey: key,
    dangerouslyAllowBrowser: true,
  });
};

export const openaiClient = { setApiKey, client };
