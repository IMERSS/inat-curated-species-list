import { FC, useState } from 'react';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import { SpeciesTab } from './SpeciesTab';
import { NewAdditionsTab } from './NewAdditionsTab';
import { TaxonChangesTab } from './TaxonChangesTab';

export interface AppProps {
  readonly speciesDataUrl: string;
  readonly curatorUsernames: string[];
  readonly placeId: number;
  readonly showRowNumbers?: boolean;
  readonly showReviewerCount?: boolean;
  readonly newAdditionsDataUrl?: string;
  readonly showNewAdditions?: boolean;
  readonly showTaxonChanges?: boolean;
  readonly taxonChangesDataUrl?: string;
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
  showTaxonChanges,
  taxonChangesDataUrl,
}) => {
  const [tabIndex, setTabIndex] = useState(0);

  const onChangeTab = (_e: React.SyntheticEvent | null, newValue: number) => {
    setTabIndex(newValue);
  };

  const hasNewAdditions = showNewAdditions && newAdditionsDataUrl;
  const hasTaxonChanges = showTaxonChanges && taxonChangesDataUrl;

  const getTabs = () => {
    if (!hasNewAdditions && !hasTaxonChanges) {
      return null;
    }

    return (
      <Tabs value={tabIndex} onChange={onChangeTab} className="inat-curated-species-list-tabs">
        <Tab label="Species" disableRipple />
        {hasNewAdditions && <Tab label="New Additions" disableRipple />}
        {hasTaxonChanges && <Tab label="Taxon Changes" disableRipple />}
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

      {hasNewAdditions && (
        <div style={{ display: tabIndex === 1 ? 'block' : 'none' }}>
          <NewAdditionsTab dataUrl={newAdditionsDataUrl} />
        </div>
      )}

      {hasTaxonChanges && (
        <div style={{ display: tabIndex === 2 ? 'block' : 'none' }}>
          <TaxonChangesTab dataUrl={taxonChangesDataUrl} />
        </div>
      )}
    </>
  );
};
