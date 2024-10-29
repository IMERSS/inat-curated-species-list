import React, { useState } from 'react';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';

export const Builder = () => {
  const [tabIndex, setTabIndex] = useState(0);

  const onChangeTab = (_e: React.SyntheticEvent, newValue: number) => {
    setTabIndex(newValue);
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
