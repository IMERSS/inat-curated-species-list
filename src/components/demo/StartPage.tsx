import { FC, useRef, useState } from 'react';
import Box from '@mui/material/Box';
import { Button } from '@mui/material';
import TextField from '@mui/material/TextField';
import LoadingButton from '@mui/lab/LoadingButton';
import { Logger } from '../Logger';
import { downloadDataByPacket, resetData } from '../../utils/request';
import { CuratedSpeciesData, LoggerHandle } from '../../types';
import styles from './Demo.module.css';
import * as C from '../../constants';

export type StartPageData = {
  curators: string;
  placeId: number;
  taxonId: number;
  curatedSpeciesData: CuratedSpeciesData;
};

type StartPageProps = {
  onDataLoaded: ({ curators, placeId, taxonId, curatedSpeciesData }: StartPageData) => void;
};

export const StartPage: FC<StartPageProps> = ({ onDataLoaded }) => {
  const loggerRef = useRef<LoggerHandle>(null);
  const [curatorUsernames, setCuratorUsernames] = useState(() => C.DEMO_DEFAULT_CURATOR_INAT_USERNAMES.join(','));
  const [placeId, setPlaceId] = useState<number | ''>(C.DEMO_DEFAULT_PLACE_ID);
  const [taxonId, setTaxonId] = useState<number | ''>(C.DEMO_DEFAULT_TAXON_ID);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [curatedSpeciesData, setCuratedSpeciesData] = useState<CuratedSpeciesData | null>(null);
  const [loading, setLoading] = useState(false);
  const [maxResults, setMaxResults] = useState(1000);

  const downloadData = () => {
    if (!loggerRef || !placeId || !taxonId) {
      return;
    }

    // clear out any old data and start the new requests
    resetData();
    setLoading(true);

    loggerRef.current!.clear();
    loggerRef.current!.addLogRow('Pinging iNat for observation data.', 'info');

    const onSuccess = (curatedSpeciesData: CuratedSpeciesData) => {
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
      maxResults,
      packetNum: 1,
      logger: loggerRef,
      logFormat: 'html',
      onSuccess,
      onError,
    });
  };

  const getContinueButton = () => {
    if (!curatedSpeciesData || !placeId || !taxonId) {
      return;
    }

    return (
      <Button
        variant="outlined"
        style={{ marginTop: 15 }}
        onClick={() =>
          onDataLoaded({
            curators: curatorUsernames,
            placeId,
            taxonId,
            curatedSpeciesData,
          })
        }
      >
        Continue &raquo;
      </Button>
    );
  };

  const showLogs = loading || dataLoaded ? 'visible' : 'hidden';
  const logsHeight = loading || dataLoaded ? 'auto' : 2;

  return (
    <>
      <p>
        This a live, demoable version of the <code>@imerss/inat-curated-species-list</code> package to let you get a
        sense of how the curated table will look for your data. This script limits the results to{' '}
        <b>{C.DEMO_MAX_OBSERVATIONS}</b> observations from iNaturalist. The second (optionally shown) tab for New
        Additions has a few hardcoded values for illustration purpose only. In addition to showing the curated species
        table, it also lets you customize the available settings and generate the React or plain-vanilla JS code,
        depending on{' '}
        <a href="https://github.com/IMERSS/inat-curated-species-list/blob/main/USAGE.md">
          how you intend to add the section to your site
        </a>
        .
      </p>

      <p>
        <TextField
          style={{ float: 'right', marginLeft: 20 }}
          label="Limit results"
          variant="outlined"
          className={styles.usernames}
          value={maxResults}
          disabled={loading}
          onChange={(e) => setMaxResults(parseInt(e.target.value, 10))}
        />
        To get started, fill in the fields below and click Start. You can find these values by browsing the iNaturalist
        website: look at the query string on the searches to locate the place and taxon IDs.
      </p>

      <br />

      <Box className={styles.fieldsRow}>
        <TextField
          label="Curators (comma-delimited iNat usernames)"
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
