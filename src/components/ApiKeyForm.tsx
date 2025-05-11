import { Component } from 'solid-js';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import s from './ApiKeyForm.module.css';

export interface ApiKeyFormProps {
  onSetApiKey: (apiKey: string) => void;
  onChooseDemoMode: () => void;
}

const ApiKeyForm: Component<ApiKeyFormProps> = (props) => {
  const handleSubmit = (e: Event) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    const apiKey = formData.get('apiKey') as string;
    props.onSetApiKey(apiKey);
  };

  return (
    <div class={s.container}>
      <div class={s.formWrapper}>
        <h1>Welcome to Book Translator</h1>
        <p>Please enter your OpenAI API key to continue</p>
        <form onSubmit={handleSubmit} class={s.form}>
          <div class={s.inputGroup}>
            <label for="apiKey">OpenAI API Key</label>
            <Input
              type="password"
              id="apiKey"
              name="apiKey"
              required
              placeholder="sk-..."
              fullWidth
            />
          </div>
          <div class={s.buttons}>
            <Button variant="secondary" type="button" onClick={props.onChooseDemoMode}>Demo mode</Button>
            <Button type="submit">Save API Key</Button>
          </div>
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
