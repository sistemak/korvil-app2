import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);

if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js').catch(() => {});
  });
}

// Retira a tela de abertura assim que o React assumir a tela.
const splash = document.getElementById('korvil-splash');
if (splash) {
  splash.style.transition = 'opacity 0.4s ease';
  splash.style.opacity = '0';
  setTimeout(() => splash.remove(), 400);
}
