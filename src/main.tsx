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
  
  // Show Landing Page only at the intro route (/introduce, #/introduce, or legacy #/promo).
  // Everything else (empty hash, #/app, or an extension) shows the App directly.
  const isIntro = path.includes('/introduce') || hash === '#/introduce' || hash === '#/promo';
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
