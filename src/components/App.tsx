import { useRef, useState } from 'react';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import LoadingButton from '@mui/lab/LoadingButton';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';

import * as C from '../constants';
import { resetData, downloadDataByPacket } from '../utils/shared'; // minifyNewAdditionsData
import styles from './App.module.css';
import { Logger, LoggerHandle } from './Logger';
import { DataTable } from './DataTable';
import NewAdditions from './NewAdditions';

const App = () => {
  const [curatorUsernames, setCuratorUsernames] = useState(() => C.CURATOR_INAT_USERNAMES.join(', '));
  const [placeId, setPlaceId] = useState(C.PLACE_ID);
  const [taxonId, setTaxonId] = useState(C.TAXON_ID);
  const [loading, setLoading] = useState(false);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [curatedSpeciesData, setCuratedSpeciesData] = useState(null);
  // const [newAdditionsData, setNewAdditionsData] = useState(null);
  const [tabIndex, setTabIndex] = useState(0);
  const loggerRef = useRef<LoggerHandle>(null);

  const onChangeTab = (_e: React.ChangeEvent<HTMLButtonElement>, newValue: number) => {
    setTabIndex(newValue);
  };

  const onStart = () => {
    setLoading(true);
    resetData();

    loggerRef.current!.clear();
    loggerRef.current!.addLogRow('Pinging iNat for observation data.', 'info');

    const cleanUsernames = curatorUsernames.split(',').map((username) => username.trim());

    downloadDataByPacket(
      {
        ident_user_id: curatorUsernames,
        place_id: placeId,
        taxon_id: taxonId,
        verifiable: 'any',
        taxons: C.VISIBLE_TAXONS,
      },
      cleanUsernames,
      1,
      loggerRef,
      (curatedSpeciesData, newAdditionsData) => {
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
        return <DataTable data={curatedSpeciesData} curatorUsernames={curatorUsernames} placeId={placeId} />;
      }

      return <NewAdditions data={newAdditionsData} />;
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
    <div className={styles.app}>
      <h1>iNat: Curated Species List</h1>

      <p style={{ marginBottom: 30 }}>
        This tool queries iNat for all observations made by one or more users in a specific taxon and place. It derives
        a curated list of all <i>unique species</i> and displays it along with the option to download the data.
      </p>

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
          onClick={onStart}
          loading={loading}
        >
          Start
        </LoadingButton>
      </Box>

      <Box sx={{ display: 'flex', visibility: showLogs, height: logsHeight }}>
        <Logger ref={loggerRef} />
      </Box>

      {getTabs()}
    </div>
  );
};

export default App;
