import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import App from './App.tsx';
import TransformacaoHome from './pages/TransformacaoHome';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/transformacao" element={<TransformacaoHome />} />
        <Route path="*" element={<App />} />
      </Routes>
    </BrowserRouter>
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
