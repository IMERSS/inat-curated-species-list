'use client';

import { FC } from 'react';
import { CuratedSpeciesTable } from '@imerss/inat-curated-species-list-ui';
import config from '../../dev-generator/config';

import './globals.css';

const RootLayout: FC = () => {
  return (
    <html lang="en">
      <body>
        <h1>Demo</h1>

        <CuratedSpeciesTable
          speciesDataUrl={`./${config.speciesDataFilename}`}
          curatorUsernames={config.curators}
          placeId={config.placeId}
          showRowNumbers={true}
          showReviewerCount={false}
          newAdditionsDataUrl={`./${config.newAdditionsFilename}`}
          showNewAdditions={config.trackNewAdditions || false}
          showLastGeneratedDate={config.showLastGeneratedDate}
        />
      </body>
    </html>
  );
};

export default RootLayout;
