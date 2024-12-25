import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
// import { Demo } from './components/demo/Demo';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <div>
      <h1>iNat: Curated Species List</h1>
      {/* <Demo /> */}
    </div>
  </StrictMode>,
);
