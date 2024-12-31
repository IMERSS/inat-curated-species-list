'use client';

import { FC } from 'react';
import { App } from '@imerss/inat-curated-species-list-ui';
import config from '../../dev-generator/config';

import './globals.css';

const RootLayout: FC = () => {
  return (
    <html lang="en">
      <body>
        <h1>Demo</h1>

        <App
          speciesDataUrl={`./${config.speciesDataFilename}`}
          curatorUsernames={config.curators}
          placeId={config.placeId}
          showRowNumbers={false}
          showReviewerCount={true}
          newAdditionsDataUrl={`./${config.newAdditionsFilename}`}
          showNewAdditions={config.trackNewAdditions || false}
        />
      </body>
    </html>
  );
};

export default RootLayout;
