import { Component, createSignal } from 'solid-js';
import ISO6391 from 'iso-639-1';
import s from './BookTextForm.module.css';
import { Button } from './ui/Button';
import { makePersisted } from '@solid-primitives/storage';
import { Textarea } from './ui/Textarea';

export interface BookTextFormProps {
  onTranslate: (text: string, language: string) => void;
  loading: boolean;
}

const languages = ISO6391.getLanguages(ISO6391.getAllCodes());

const getBrowserLanguage = () => {
  return navigator.language.split('-')[0] || 'en';
};

const BookTextForm: Component<BookTextFormProps> = (props) => {
  const browserLanguage = getBrowserLanguage();
  const hasBrowserLanguage = languages.some((l) => l.code === browserLanguage);
  const [selectedLanguage, setSelectedLanguage] = makePersisted(
    createSignal(browserLanguage),
    { name: 'target-language' },
  );

  const handleSubmit = async (e: Event) => {
    e.preventDefault();

    if (props.loading) {
      return;
    }

    const form = e.currentTarget as HTMLFormElement;
    const formData = new FormData(form);
    const text = formData.get('text') as string;

    props.onTranslate(text, selectedLanguage());
  };

  return (
    <form class={s.form} onSubmit={handleSubmit}>
      <Textarea
        name="text"
        class={s.textarea}
        placeholder="Paste your book text here..."
        autofocus
        disabled={props.loading}
      />
      <div class={s.formControls}>
        <div class={s.languageSelector}>
          <label for="language-select">Translate to:</label>
          <select
            id="language-select"
            name="language"
            value={selectedLanguage()}
            onInput={(e) => setSelectedLanguage(e.currentTarget.value)}
            disabled={props.loading}
          >
            {languages.map((lang) => (
              <option value={lang.code}>
                {lang.name} &mdash; {lang.nativeName}
              </option>
            ))}
            {!hasBrowserLanguage && (
              <option value={browserLanguage}>{browserLanguage}</option>
            )}
          </select>
        </div>
        <Button
          type="submit"
          class={s.translateButton}
          disabled={props.loading}
          loading={props.loading}
          loadingChildren="Translating..."
        >
          Translate
        </Button>
      </div>
    </form>
  );
};

export default BookTextForm;
