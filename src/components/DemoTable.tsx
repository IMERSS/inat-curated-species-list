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
import styles from './App.module.css'; // TODO

/**
 * This isn't included in the exported components from this package. It's used as a test/demo page housed on github pages for the repo,
 * so potential users can feed in their values (taxon, place, curated) to get a sense of how the curated checklist table looks like for
 * them. It's also used for local development.
 *
 * It works by pinging the iNat API directly and convering the .
 * */
export const DemoTable: FC = () => {
  const [curatorUsernames, setCuratorUsernames] = useState(() => C.DEMO_DEFAULT_CURATOR_INAT_USERNAMES.join(','));
  const [placeId, setPlaceId] = useState(C.DEMO_DEFAULT_PLACE_ID);
  const [taxonId, setTaxonId] = useState(C.DEMO_DEFAULT_TAXON_ID);
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
    if (!loggerRef) {
      return;
    }

    setLoading(true);
    resetData();

    loggerRef.current!.clear();
    loggerRef.current!.addLogRow('Pinging iNat for observation data.', 'info');

    const cleanUsernames = curatorUsernames.split(',').map((username) => username.trim());

    downloadDataByPacket(
      {
        curators: curatorUsernames,
        placeId: parseInt(placeId) || 0,
        taxonId: parseInt(taxonId) || 0,
        visibleTaxons: C.VISIBLE_TAXONS, // TODO allow option via UI to configure?
      },
      cleanUsernames,
      1,
      loggerRef.current!,
      (
        curatedSpeciesData, // newAdditionsData
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
      },
      () => {
        loggerRef.current!.addLogRow('Error pinging the iNat API.', 'error');
        setLoading(false);
      },
    );

    // const d = require('./test-data.json');
    // setNewAdditionsData(minifyNewAdditionsData(d));
  };

  const getTabs = () => {
    if (!curatedSpeciesData) {
      return;
    }

    const getTab = () => {
      if (tabIndex === 0) {
        return (
          <DataTable data={curatedSpeciesData} curatorUsernames={curatorUsernames} placeId={parseInt(placeId) || 0} />
        );
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
  const logsHeight = loading || dataLoaded ? 'auto' : 0;

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
          value={placeId}
          disabled={loading}
          onChange={(e) => setPlaceId(e.target.value)}
        />
        <TextField
          label="Taxon ID"
          variant="outlined"
          value={taxonId}
          disabled={loading}
          onChange={(e) => setTaxonId(e.target.value)}
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
