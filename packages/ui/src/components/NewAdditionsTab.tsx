import React, { FC, useCallback, useEffect, useState } from 'react';
import { DataTable } from './DataTable';
import debounce from 'debounce';
import { Loader } from './Loader';
import {
  unminifySpeciesData,
  CuratedSpeciesData,
  CuratedSpeciesDataMinified,
  Taxon,
  TaxonomyMap,
} from '@imerss/inat-curated-species-list-common';

export interface NewAdditionsTabProps {
  readonly dataUrl: string;
  readonly curatorUsernames: string[];
  readonly placeId: number;
  readonly showRowNumbers?: boolean;
  readonly showReviewerCount?: boolean;
}

export const NewAdditionsTab: FC<NewAdditionsTabProps> = ({
  dataUrl,
  curatorUsernames,
  placeId,
  showRowNumbers,
  showReviewerCount,
}) => {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  const [data, setData] = useState<CuratedSpeciesData | undefined>();

  useEffect(() => {
    fetch(dataUrl, {
      headers: {
        Accept: 'application/json',
      },
    })
      .then((resp) => resp.json())
      .then((data) => {
        setData(data);
        setLoaded(true);
      })
      .catch(() => setError(true));
  }, [dataUrl]);

  if ((!loaded || !data) && !error) {
    return (
      <div className="inat-curated-species-standalone-loader">
        <Loader />
      </div>
    );
  }

  if (error) {
    return <p>Sorry, there was an error loading the data.</p>;
  }

  console.log(data);

  return <div>...</div>;
};
