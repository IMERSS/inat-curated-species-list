import { FC, useState } from 'react';
// import Box from '@mui/material/Box';
// import TextField from '@mui/material/TextField';
// import LoadingButton from '@mui/lab/LoadingButton';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';

// import * as C from '../constants';
// import { resetData, downloadDataByPacket } from '../utils/shared'; // minifyNewAdditionsData
import styles from './App.module.css';
// import { Logger, LoggerHandle } from './Logger';
// import { DataTable } from './DataTable';
// import { NewAdditions } from './NewAdditions';
import type { AppProps } from '../types';

const App: FC<AppProps> = () => {
  // { placeId, taxonId, curatorUsernames, dataUrl }

  // const [curatorUsernames, setCuratorUsernames] = useState(() => C.CURATOR_INAT_USERNAMES.join(','));
  // const [placeId, setPlaceId] = useState(C.PLACE_ID);
  // const [taxonId, setTaxonId] = useState(C.TAXON_ID);
  // const [loading, setLoading] = useState(false);
  // const [dataLoaded, setDataLoaded] = useState(false);
  // const [curatedSpeciesData, setCuratedSpeciesData] = useState(null);
  // const [newAdditionsData, setNewAdditionsData] = useState(null);
  const [tabIndex, setTabIndex] = useState(0);
  // const loggerRef = useRef<LoggerHandle>(null);

  const onChangeTab = (_e: React.SyntheticEvent, newValue: number) => {
    setTabIndex(newValue);
  };

  // const onStart = () => {
  //   setLoading(true);
  //   resetData();
  //   loggerRef.current!.clear();
  //   loggerRef.current!.addLogRow('Pinging iNat for observation data.', 'info');
  //   const cleanUsernames = curatorUsernames.split(',').map((username) => username.trim());
  //   // const d = require('./test-data.json');
  //   // setNewAdditionsData(minifyNewAdditionsData(d));
  // };

  const getTabs = () => {
    //   if (!dataUrl) {
    //     return;
    //   }

    //   const getTab = () => {
    //     if (tabIndex === 0) {
    //       return <DataTable data={data} curatorUsernames={curatorUsernames} placeId={placeId} />;
    //     }

    //     return <NewAdditions data={newAdditionsData} />;
    //   };

    return (
      <>
        <Tabs value={tabIndex} onChange={onChangeTab}>
          <Tab label="Curated Species" />
          <Tab label="Latest Additions" />
        </Tabs>
        {/* {getTab()} */}
      </>
    );
  };

  return <div className={styles.app}>{getTabs()}</div>;
};

export default App;
