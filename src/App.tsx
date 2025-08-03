import { Component, createEffect, JSX } from 'solid-js';
import { openaiClient } from './data/openaiClient';
import { translationsStore } from './data/translationsStore';
import { wordsList } from './data/wordsList';
import ApiKeyForm from './components/ApiKeyForm';
import BookTextForm from './components/BookTextForm';
import TranslationResults from './components/TranslationResults';
import WordList from './components/WordList';
import { textTranslationService } from './data/textTranslationService';
import { ThemeProvider } from './utils/ThemeContext';
import { demoMode } from './data/demoMode';
import { Route, Router, useNavigate } from '@solidjs/router';
import Navigation from './components/Navigation';

const Home: Component = () => {
  const navigate = useNavigate();

  if (!textTranslationService.ready()) {
    navigate('/api-key', { replace: true });
  } else if (translationsStore.state.sentences.length > 0) {
    navigate('/text/translated', { replace: true });
  } else {
    navigate('/text/new', { replace: true });
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

  return (
    <BookTextForm
      loading={translationsStore.state.loading}
      onTranslate={(text, targetLanguage) =>
        textTranslationService.translateText(text, targetLanguage, () => {
          navigate('/text/translated');
        })
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

  return (
    <TranslationResults
      originalLanguage={translationsStore.state.originalLanguage}
      targetLanguage={translationsStore.state.targetLanguage}
      results={translationsStore.state.sentences}
      loading={translationsStore.state.loading}
    />
  );
};

const PageWordList: Component = () => {
  return <WordList words={wordsList.state} />;
};

interface LayoutProps {
  children?: JSX.Element;
}

const Layout: Component<LayoutProps> = (props) => {
  return (
    <>
      <Navigation />
      {props.children}
    </>
  );
};

const App: Component = () => {
  return (
    <ThemeProvider>
      <Router base={import.meta.env.VITE_BASE_URL || '/'} root={Layout}>
        <Route path="/" component={Home} />
        <Route path="/api-key" component={PageApiKey} />
        <Route path="/text/new" component={PageNewText} />
        <Route path="/text/translated" component={PageTranslationResults} />
        <Route path="/words" component={PageWordList} />
      </Router>
    </ThemeProvider>
  );
};

export default App;
