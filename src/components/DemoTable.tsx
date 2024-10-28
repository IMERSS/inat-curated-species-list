/* eslint-disable @typescript-eslint/no-unused-vars */
import { FC, useRef, useState } from 'react';
import * as C from '../constants';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import LoadingButton from '@mui/lab/LoadingButton';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import { Logger } from './Logger';
import { downloadDataByPacket, resetData } from '../utils/request';
import { DataTable } from './DataTable';
// import { NewAdditions } from './NewAdditions';
import { CuratedSpeciesData, LoggerHandle } from '../types';
import styles from './DemoTable.module.css';

/**
 * This isn't included in the exported components from this package. It's used as a test/demo page housed on github pages for the repo,
 * so potential users can feed in their values (taxon, place, curated) to get a sense of how the curated checklist table looks like for
 * them. It's also used for local development.
 *
 * It works by pinging the iNat API directly and convering the .
 * */
export const DemoTable: FC = () => {
  const [curatorUsernames, setCuratorUsernames] = useState(() => C.DEMO_DEFAULT_CURATOR_INAT_USERNAMES.join(','));
  const [placeId, setPlaceId] = useState<number | ''>(C.DEMO_DEFAULT_PLACE_ID);
  const [taxonId, setTaxonId] = useState<number | ''>(C.DEMO_DEFAULT_TAXON_ID);
  const [loading, setLoading] = useState(false);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [curatedSpeciesData, setCuratedSpeciesData] = useState<CuratedSpeciesData | null>(null);
  //   const [newAdditionsData, setNewAdditionsData] = useState(null);
  const [tabIndex, setTabIndex] = useState(0);
  const loggerRef = useRef<LoggerHandle>(null);

  const onChangeTab = (_e: React.SyntheticEvent, newValue: number) => {
    setTabIndex(newValue);
  };

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

      console.log('on success', curatedSpeciesData);

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
      visibleTaxons: C.VISIBLE_TAXONS, // TODO allow option via UI to configure?
      maxResults: 1000,
      packetNum: 1,
      logger: loggerRef,
      onSuccess,
      onError,
    });

    // const d = require('./test-data.json');
    // setNewAdditionsData(minifyNewAdditionsData(d));
  };

  const getTabs = () => {
    if (!curatedSpeciesData) {
      return;
    }

    const getTab = () => {
      if (tabIndex === 0) {
        return <DataTable data={curatedSpeciesData} curatorUsernames={curatorUsernames} placeId={placeId} />;
      }
      //   return <NewAdditions data={newAdditionsData} />;
    };

    return (
      <>
        <Tabs value={tabIndex} onChange={onChangeTab}>
          <Tab label="Curated Species" />
          <Tab label="Latest Additions" />
        </Tabs>
        {getTab()}
      </>
    );
  };

  const showLogs = loading || dataLoaded ? 'visible' : 'hidden';
  const logsHeight = loading || dataLoaded ? 'auto' : 2;

  return (
    <>
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

      <div className={styles.app}>{getTabs()}</div>
    </>
  );
};
