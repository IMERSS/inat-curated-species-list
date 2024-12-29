'use client';

import { FC } from 'react';
import { DataTable } from '@imerss/inat-curated-species-list-ui';
import { CuratedSpeciesDataMinified } from '@imerss/inat-curated-species-list-common';

// TODO document + automate.
import generatedCuratedSpeciesData from '../public/data.json';
import './globals.css';

const RootLayout: FC = () => {
  return (
    <html lang="en">
      <body>
        <DataTable
          data={generatedCuratedSpeciesData as unknown as CuratedSpeciesDataMinified}
          curatorUsernames="benkeen"
          placeId={123}
        />
      </body>
    </html>
  );
};

export default RootLayout;
