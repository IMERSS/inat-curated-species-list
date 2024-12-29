import React, { FC } from 'react';
import { createRoot } from 'react-dom/client';
import a from '@imerss/inat-curated-species-list-ui';
// import './globals.css';

const DemoApp: FC = () => {
  console.log(a);
  return <p>I hate this shit.</p>;
};
const container = document.createElement('div');
container.id = 'root';
document.body.appendChild(container);

const root = createRoot(container);
root.render(<DemoApp />);
