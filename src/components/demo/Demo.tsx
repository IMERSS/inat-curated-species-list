/* eslint-disable @typescript-eslint/no-unused-vars */
import { FC, useState } from 'react';
import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import { StartPage, StartPageData } from './StartPage';
import { BuilderPage } from './BuilderPage';

/**
 * This isn't included in the exported components from this package. It's used as a test/demo page housed on github pages for the repo,
 * so potential users can feed in their values (taxon, place, curated) to get a sense of how the curated checklist table looks like for
 * them. It's also used for local development.
 *
 * It works by pinging the iNat API directly.
 * */
export const Demo: FC = () => {
  const [page, setPage] = useState(1);
  const [data, setData] = useState<StartPageData>();

  const onDataLoaded = (data: StartPageData) => {
    setData(data);
    setPage(1);
  };

  const getPage = () => {
    if (page === 0) {
      return <StartPage onDataLoaded={onDataLoaded} />;
    }

    return <BuilderPage data={data as StartPageData} />;
  };

  return (
    <>
      <Stepper activeStep={page} style={{ margin: '30px' }}>
        <Step key="step1">
          <StepLabel>Get started</StepLabel>
        </Step>
        <Step key="step2">
          <StepLabel>Build table</StepLabel>
        </Step>
        <Step key="step3">
          <StepLabel>Generate markup</StepLabel>
        </Step>
      </Stepper>

      {getPage()}
    </>
  );
};
