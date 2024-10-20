import React from 'react';
import * as C from '../constants';

/**
 * This isn't included in the exported components from this package. It's used for two things:
 *   1. A test/demo page housed on github pages for the repo, so potential users can feed in their values (taxon, place, curated )
 *      to get a sense of how the curated checklist table looks like for them.
 *   2. For local development.
 *
 * It works by pinging the iNat API directly and convering the .
 *
 *
 */
export const DemoTable = () => {
  const [curatorUsernames, setCuratorUsernames] = useState(() => C.DEMO_DEFAULT_CURATOR_INAT_USERNAMES.join(','));
  const [placeId, setPlaceId] = useState(C.DEMO_DEFAULT_PLACE_ID);
  const [taxonId, setTaxonId] = useState(C.DEMO_DEFAULT_TAXON_ID);
  const [loading, setLoading] = useState(false);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [curatedSpeciesData, setCuratedSpeciesData] = useState(null);
  const [newAdditionsData, setNewAdditionsData] = useState(null);
};
