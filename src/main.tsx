import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { DemoTable } from './components/DemoTable';
import { DEMO_MAX_OBSERVATIONS } from './constants';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <div>
      <h1>iNat: Curated Species List</h1>
      <p>
        This a live, demoable version of the <code>@imerss/inat-curated-species-list</code> package to let you get a
        sense of how the table will look for your scenario. Note: it deliberately limits the results to{' '}
        <b>{DEMO_MAX_OBSERVATIONS}</b> observation records from iNaturalist. The second (optionally shown) tab for New
        Additions has a few hardcoded values for illustration purpose only.
      </p>
      <DemoTable />
    </div>
  </StrictMode>,
);
