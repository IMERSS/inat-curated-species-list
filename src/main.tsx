import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './components/App.tsx';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <div>
      <h1>iNat: Curated Species List</h1>
      <App />
    </div>
  </StrictMode>,
);
