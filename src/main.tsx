import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import LandingPage from './LandingPage.tsx';
import './index.css';

const rootElement = document.getElementById('root')!;
const root = createRoot(rootElement);

const render = () => {
  const hash = window.location.hash;
  const path = window.location.pathname;
  const isExtension = window.location.protocol === 'chrome-extension:' || window.location.protocol === 'ms-browser-extension:';
  
  // Show Landing Page at the intro route (/introduce/, #/introduce, or legacy #/promo).
  // An explicit #/app hash always wins (so "enter app" works even under /introduce/).
  // Everything else (empty hash, #/app, or an extension) shows the App directly.
  const isIntro =
    hash === '#/introduce' || hash === '#/promo' ||
    (hash !== '#/app' && path.includes('/introduce'));
  if (isIntro) {
    root.render(
      <StrictMode>
        <LandingPage />
      </StrictMode>
    );
  } else {
    root.render(
      <StrictMode>
        <App />
      </StrictMode>
    );
  }
};

window.addEventListener('hashchange', render);
render();
