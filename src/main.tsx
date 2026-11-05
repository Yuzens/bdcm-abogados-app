import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { registerSW } from 'virtual:pwa-register';

// Registrar Service Worker para PWA (cache fuera de línea y funcionamiento autónomo)
registerSW({ immediate: true });

createRoot(document.getElementById('root')!).render(<App />);
