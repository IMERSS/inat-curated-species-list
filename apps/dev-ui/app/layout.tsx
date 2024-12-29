'use client';

import { FC } from 'react';
import { CuratedSpeciesTable } from '@imerss/inat-curated-species-list-ui';
import config from '../../dev-generator/config';

import './globals.css';

const RootLayout: FC = () => {
  return (
    <html lang="en">
      <body>
        <CuratedSpeciesTable dataUrl="./data.json" curatorUsernames={config.curators} placeId={config.placeId} />
      </body>
    </html>
  );
};

export default RootLayout;
