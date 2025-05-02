import { Component, createSignal } from 'solid-js';
import { openaiClient } from './data/openai';
import { translations } from './data/translations';
import ApiKeyForm from './components/ApiKeyForm';
import BookTextForm from './components/BookTextForm';
import TranslationResults from './components/TranslationResults';
import { translateText } from './data/openaiTranslations';
import ThemeToggle from './components/ThemeToggle';
import { ThemeProvider } from './utils/ThemeContext';

const BookTranslator: Component = () => {
  const data = translations.value;
  const [abortController, setAbortController] =
    createSignal<AbortController | null>(null);

  const handleTranslate = (text: string, targetLanguage: string) => {
    const controller = new AbortController();
    setAbortController((prev) => {
      if (prev && !prev.signal.aborted) {
        prev.abort();
      }
      return controller;
    });

    return translateText(text, targetLanguage, controller.signal);
  };

  const handleNewText = () => {
    if (abortController()) {
      abortController()?.abort();
      setAbortController(null);
    }

    translations.clear();
  };

  return (
    <>
      {!openaiClient() ? (
        <ApiKeyForm />
      ) : data.translations.length > 0 ? (
        <TranslationResults
          results={data.translations}
          loading={data.loading}
          onNewText={handleNewText}
        />
      ) : (
        <BookTextForm loading={data.loading} onTranslate={handleTranslate} />
      )}
    </>
  );
};

const App: Component = () => {
  return (
    <ThemeProvider>
      <ThemeToggle />
      <BookTranslator />
    </ThemeProvider>
  );
};

export default App;
