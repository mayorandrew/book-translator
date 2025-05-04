import { Component, createSignal } from 'solid-js';
import { openaiClient } from './data/openaiClient';
import { translationsStore } from './data/translationsStore';
import ApiKeyForm from './components/ApiKeyForm';
import BookTextForm from './components/BookTextForm';
import TranslationResults from './components/TranslationResults';
import { textTranslationService } from './data/textTranslationService';
import ThemeToggle from './components/ThemeToggle';
import { ThemeProvider } from './utils/ThemeContext';
import { demoMode } from './data/demoMode';

const BookTranslator: Component = () => {
  const data = translationsStore().state;
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

    return textTranslationService().translateText(
      text,
      targetLanguage,
      controller.signal,
    );
  };

  const handleNewText = () => {
    if (abortController()) {
      abortController()?.abort();
      setAbortController(null);
    }

    translationsStore().clear();
  };

  return (
    <>
      {!openaiClient().client() && !demoMode().isDemo() ? (
        <ApiKeyForm
          onSetApiKey={(apiKey) => openaiClient().setApiKey(apiKey)}
          onChooseDemoMode={() => demoMode().setIsDemo(true)}
        />
      ) : data.sentences.length > 0 ? (
        <TranslationResults
          results={data.sentences}
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
