import { Component, createEffect } from 'solid-js';
import { openaiClient } from './data/openaiClient';
import { translationsStore } from './data/translationsStore';
import { wordsList } from './data/wordsList';
import ApiKeyForm from './components/ApiKeyForm';
import BookTextForm from './components/BookTextForm';
import TranslationResults from './components/TranslationResults';
import WordList from './components/WordList';
import { textTranslationService } from './data/textTranslationService';
import ThemeToggle from './components/ThemeToggle';
import { ThemeProvider } from './utils/ThemeContext';
import { demoMode } from './data/demoMode';
import { Route, Router, useNavigate } from '@solidjs/router';

const Home: Component = () => {
  const navigate = useNavigate();

  if (!textTranslationService.ready()) {
    navigate('/api-key', { replace: true });
  } else if (translationsStore.state.sentences.length > 0) {
    navigate('/translation-results', { replace: true });
  } else {
    navigate('/new-text', { replace: true });
  }

  return null;
};

const PageApiKey: Component = () => {
  const navigate = useNavigate();

  return (
    <ApiKeyForm
      onSetApiKey={(apiKey) => {
        openaiClient.setApiKey(apiKey);
        navigate('/');
      }}
      onChooseDemoMode={() => {
        demoMode.setIsDemo(true);
        navigate('/');
      }}
    />
  );
};

const PageNewText: Component = () => {
  const navigate = useNavigate();

  createEffect(() => {
    if (!textTranslationService.ready()) {
      navigate('/', { replace: true });
    }
  });

  createEffect(() => {
    if (translationsStore.state.sentences.length > 0) {
      navigate('/translation-results');
    }
  });

  return (
    <BookTextForm
      loading={translationsStore.state.loading}
      onTranslate={(text, targetLanguage) =>
        textTranslationService.translateText(text, targetLanguage)
      }
    />
  );
};

const PageTranslationResults: Component = () => {
  const navigate = useNavigate();

  createEffect(() => {
    if (translationsStore.state.sentences.length === 0) {
      navigate('/', { replace: true });
    }
  });

  const handleNewText = () => {
    textTranslationService.abort();
    translationsStore.clear();
    navigate('/new-text');
  };

  const handleWordList = () => {
    navigate('/word-list');
  };

  return (
    <TranslationResults
      results={translationsStore.state.sentences}
      loading={translationsStore.state.loading}
      onNewText={handleNewText}
      onWordList={handleWordList}
    />
  );
};

const PageWordList: Component = () => {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate('/translation-results');
  };

  return (
    <WordList words={wordsList.state} onBack={handleBack} />
  );
};

const App: Component = () => {
  return (
    <ThemeProvider>
      <ThemeToggle />
      <Router base={import.meta.env.VITE_BASE_URL || '/'}>
        <Route path="/" component={Home} />
        <Route path="/api-key" component={PageApiKey} />
        <Route path="/new-text" component={PageNewText} />
        <Route path="/translation-results" component={PageTranslationResults} />
        <Route path="/word-list" component={PageWordList} />
      </Router>
    </ThemeProvider>
  );
};

export default App;
