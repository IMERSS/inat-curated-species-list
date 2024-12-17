import React, { FC, useState } from 'react';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import { StartPageData } from './StartPage';
import { DataTable } from '../DataTable';
import { BuilderOptions } from './BuilderOptions';
import { ALL_TAXONS, DEFAULT_VISIBLE_TAXONS } from '../../constants';

type BuildPageProps = {
  data: StartPageData;
};

export const BuilderPage: FC<BuildPageProps> = ({ data }) => {
  const [tabIndex, setTabIndex] = useState(1);
  const [orderedCols, setOrderedCols] = useState(ALL_TAXONS);
  const [visibleCols, setVisibleCols] = useState(DEFAULT_VISIBLE_TAXONS);
  const [downloadData, setDownloadData] = useState(false);
  const [allowDownload, setAllowDownload] = useState(false);

  const onChangeOptions = () => {};

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
      <BuilderOptions orderedCols={orderedCols} allowDownload={allowDownload} visibleCols={visibleCols} />
      <Tabs value={tabIndex} onChange={onChangeTab}>
        <Tab label="Curated Species" />
        <Tab label="Latest Additions" />
      </Tabs>
      {getTab()};
    </>
  );
};
