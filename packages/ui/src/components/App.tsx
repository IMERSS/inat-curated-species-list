import { FC, useState } from 'react';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import { SpeciesTab } from './SpeciesTab';
import { NewAdditionsTab } from './NewAdditionsTab';

export interface AppProps {
  readonly speciesDataUrl: string;
  readonly curatorUsernames: string[];
  readonly placeId: number;
  readonly showRowNumbers?: boolean;
  readonly showReviewerCount?: boolean;
  readonly newAdditionsDataUrl: string;
  readonly showNewAdditions?: boolean;
  readonly lang?: any;
}

export const App: FC<AppProps> = ({
  speciesDataUrl,
  curatorUsernames,
  placeId,
  showRowNumbers,
  showReviewerCount,
  newAdditionsDataUrl,
  showNewAdditions,
}) => {
  const [tabIndex, setTabIndex] = useState(0);

  const onChangeTab = (_e: React.SyntheticEvent, newValue: number) => {
    setTabIndex(newValue);
  };

  const getTabs = () => {
    if (!showNewAdditions) {
      return null;
    }

    return (
      <Tabs value={tabIndex} onChange={onChangeTab}>
        <Tab label="Species" />
        <Tab label="New Additions" />
      </Tabs>
    );
  };

  return (
    <>
      {getTabs()}
      <div style={{ display: tabIndex === 0 ? 'block' : 'none' }}>
        <SpeciesTab
          dataUrl={speciesDataUrl}
          curatorUsernames={curatorUsernames}
          placeId={placeId}
          showRowNumbers={showRowNumbers}
          showReviewerCount={showReviewerCount}
        />
      </div>

      <div style={{ display: tabIndex === 1 ? 'block' : 'none' }}>
        <NewAdditionsTab
          dataUrl={newAdditionsDataUrl}
          curatorUsernames={curatorUsernames}
          placeId={placeId}
          showRowNumbers={showRowNumbers}
          showReviewerCount={showReviewerCount}
        />
      </div>
    </>
  );
};
