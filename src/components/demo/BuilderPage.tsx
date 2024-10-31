import React, { FC, useState } from 'react';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import { StartPageData } from './StartPage';
import { DataTable } from '../DataTable';

type BuildPageProps = {
  data: StartPageData;
};

export const BuilderPage: FC<BuildPageProps> = ({ data }) => {
  const [tabIndex, setTabIndex] = useState(0);

  const onChangeTab = (_e: React.SyntheticEvent, newValue: number) => {
    setTabIndex(newValue);
  };

  const getTab = () => {
    if (tabIndex === 0) {
      return <DataTable data={data.curatedSpeciesData} curatorUsernames={data.curators} placeId={data.placeId} />;
    }
  };

  return (
    <>
      <p>This page lets you construct how your table should look, and what options you want to provide.</p>
      <Tabs value={tabIndex} onChange={onChangeTab}>
        <Tab label="Curated Species" />
        <Tab label="Latest Additions" />
      </Tabs>
      {getTab()};
    </>
  );
};
