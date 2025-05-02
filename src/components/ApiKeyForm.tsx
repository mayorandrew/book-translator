import { Component } from 'solid-js';
import { setOpenaiApiKey } from '../data/openai';
import s from './ApiKeyForm.module.css';
import Button from './ui/Button';

const ApiKeyForm: Component = () => {
  const handleSubmit = (e: Event) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    const apiKey = formData.get('apiKey') as string;
    setOpenaiApiKey(apiKey);
  };

  return (
    <div class={s.container}>
      <div class={s.formWrapper}>
        <h1>Welcome to Book Translator</h1>
        <p>Please enter your OpenAI API key to continue</p>
        <form onSubmit={handleSubmit} class={s.form}>
          <div class={s.inputGroup}>
            <label for="apiKey">OpenAI API Key</label>
            <input
              type="password"
              id="apiKey"
              name="apiKey"
              required
              placeholder="sk-..."
              class={s.input}
            />
          </div>
          <Button type="submit">
            Save API Key
          </Button>
        </form>
        <p class={s.note}>
          Your API key is stored locally in your browser and never sent to our
          servers.
        </p>
      </div>
    </div>
  );
};

export default ApiKeyForm;
