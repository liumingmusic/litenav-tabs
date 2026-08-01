import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import LandingPage from './LandingPage.tsx';
import './index.css';

const rootElement = document.getElementById('root')!;
const root = createRoot(rootElement);

const render = () => {
  const hash = window.location.hash;
  const isExtension = window.location.protocol === 'chrome-extension:' || window.location.protocol === 'ms-browser-extension:';
  
  // Show Landing Page if hash is empty (and not in extension), or explicitly #/promo
  if (hash === '#/promo' || (!isExtension && hash !== '#/app')) {
    root.render(
      <StrictMode>
        <LandingPage />
      </StrictMode>
    );
  } else {
    // Show App if it's an extension or explicitly #/app
    root.render(
      <StrictMode>
        <App />
      </StrictMode>
    );
  }
};

window.addEventListener('hashchange', render);
render();
