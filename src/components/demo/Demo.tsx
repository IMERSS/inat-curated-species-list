/* eslint-disable @typescript-eslint/no-unused-vars */
import { FC, useRef, useState } from 'react';
import * as C from '../../constants';
import Box from '@mui/material/Box';
import { Button } from '@mui/material';
import TextField from '@mui/material/TextField';
import LoadingButton from '@mui/lab/LoadingButton';
import { Logger } from '../Logger';
import { downloadDataByPacket, resetData } from '../../utils/request';
// import { DataTable } from '../DataTable';
// import { NewAdditions } from './NewAdditions';
import { CuratedSpeciesData, LoggerHandle } from '../../types';
import styles from './Demo.module.css';
import { DEMO_MAX_OBSERVATIONS } from '../../constants';

/**
 * This isn't included in the exported components from this package. It's used as a test/demo page housed on github pages for the repo,
 * so potential users can feed in their values (taxon, place, curated) to get a sense of how the curated checklist table looks like for
 * them. It's also used for local development.
 *
 * It works by pinging the iNat API directly.
 * */
export const Demo: FC = () => {
  const [curatorUsernames, setCuratorUsernames] = useState(() => C.DEMO_DEFAULT_CURATOR_INAT_USERNAMES.join(','));
  const [placeId, setPlaceId] = useState<number | ''>(C.DEMO_DEFAULT_PLACE_ID);
  const [taxonId, setTaxonId] = useState<number | ''>(C.DEMO_DEFAULT_TAXON_ID);
  const [loading, setLoading] = useState(false);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [curatedSpeciesData, setCuratedSpeciesData] = useState<CuratedSpeciesData | null>(null);
  const loggerRef = useRef<LoggerHandle>(null);

  const downloadData = () => {
    if (!loggerRef || !placeId || !taxonId) {
      return;
    }

    // clear out any old data and start the new requests
    resetData();
    setLoading(true);

    loggerRef.current!.clear();
    loggerRef.current!.addLogRow('Pinging iNat for observation data.', 'info');

    const onSuccess = (
      curatedSpeciesData: any, // newAdditionsData
    ) => {
      setLoading(false);
      setDataLoaded(true);

      loggerRef.current!.addLogRows([
        ['Observation data all returned.', 'info'],
        ['Parsing data.', 'info'],
        [`Found <b>${Object.keys(curatedSpeciesData).length}</b> unique species in observation results.`, 'success'],
      ]);

      setCuratedSpeciesData(curatedSpeciesData);
      // setNewAdditionsData(minifyNewAdditionsData(newAdditionsData, C.NEW_ADDITIONS_IGNORE_SPECIES_OBSERVED_BY));
    };

    const onError = () => {
      loggerRef.current!.addLogRow('Error pinging the iNat API.', 'error');
      setLoading(false);
    };

    downloadDataByPacket({
      curators: curatorUsernames,
      placeId,
      taxonId,
      visibleTaxons: C.ALL_TAXONS,
      maxResults: 1000,
      packetNum: 1,
      logger: loggerRef,
      logFormat: 'html',
      onSuccess,
      onError,
    });
  };

  const getContinueButton = () => {
    if (!curatedSpeciesData) {
      return;
    }

    return (
      <Button variant="outlined" style={{ marginTop: 15 }}>
        Continue &raquo;
      </Button>
    );
  };

  const showLogs = loading || dataLoaded ? 'visible' : 'hidden';
  const logsHeight = loading || dataLoaded ? 'auto' : 2;

  return (
    <>
      <p style={{ lineHeight: '25px' }}>
        This a live, demoable version of the <code>@imerss/inat-curated-species-list</code> package to let you get a
        sense of how the curated table will look for your data. This script limits the results to{' '}
        <b>{DEMO_MAX_OBSERVATIONS}</b> observations from iNaturalist. The second (optionally shown) tab for New
        Additions has a few hardcoded values for illustration purpose only. In addition to showing the curated species
        table, it also lets you customize the available settings and generate the React or plain-vanilla JS code,
        depending on{' '}
        <a href="https://github.com/IMERSS/inat-curated-species-list/blob/main/USAGE.md">
          how you intend to add the section to your site
        </a>
        .
      </p>

      <p style={{ lineHeight: '25px' }}>
        To get started, fill in the fields below and click Start. You can find these values by browsing the iNaturalist
        website: look at the query string on the searches to locate the place and taxon IDs.
      </p>

      <br />

      <Box className={styles.fieldsRow}>
        <TextField
          label="iNat usernames (comma-delimited)"
          variant="outlined"
          className={styles.usernames}
          value={curatorUsernames}
          disabled={loading}
          onChange={(e) => setCuratorUsernames(e.target.value)}
        />
        <TextField
          label="Place ID"
          variant="outlined"
          type="number"
          value={placeId}
          disabled={loading}
          onChange={(e) => setPlaceId(e.target.value ? parseInt(e.target.value) : '')}
        />
        <TextField
          label="Taxon ID"
          variant="outlined"
          type="number"
          value={taxonId}
          disabled={loading}
          onChange={(e) => setTaxonId(e.target.value ? parseInt(e.target.value) : '')}
        />
        <LoadingButton
          variant="contained"
          disabled={!curatorUsernames || !placeId || !taxonId}
          onClick={downloadData}
          loading={loading}
        >
          Start
        </LoadingButton>
      </Box>

      <Box sx={{ display: 'flex', visibility: showLogs, height: logsHeight }}>
        <Logger ref={loggerRef} />
      </Box>

      {getContinueButton()}
    </>
  );
};
