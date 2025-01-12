import { FC, useCallback, useState } from 'react';
import { SpeciesTab } from './SpeciesTab';
import { NewAdditionsTab } from './NewAdditionsTab';
import { CuratedSpeciesDataMinified } from '@imerss/inat-curated-species-list-common';

export interface AppProps {
  readonly speciesDataUrl: string;
  readonly curatorUsernames: string[];
  readonly placeId: number;
  readonly showLastGeneratedDate: boolean;
  readonly showRowNumbers?: boolean;
  readonly showReviewerCount?: boolean;
  readonly newAdditionsDataUrl?: string;
  readonly showNewAdditions?: boolean;
  readonly showTaxonChanges?: boolean;
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
  showLastGeneratedDate,
}) => {
  const [tabIndex, setTabIndex] = useState(0);
  const [lastGenerated, setLastGeneratedDate] = useState('');
  const hasNewAdditions = showNewAdditions && newAdditionsDataUrl;

  const onLoadSpeciesData = useCallback((data: CuratedSpeciesDataMinified) => {
    setLastGeneratedDate(new Date(data.dateGenerated).toISOString().split('T')[0] as string);
  }, []);

  const getTabs = () => {
    if (!hasNewAdditions) {
      return null;
    }

    const speciesTabClass = tabIndex === 0 ? 'inat-curated-species-list-tab-selected' : '';
    const newAdditionsTabClass = tabIndex === 1 ? 'inat-curated-species-list-tab-selected' : '';

    return (
      <div style={{ position: 'relative' }}>
        {showLastGeneratedDate && lastGenerated && (
          <div className="inat-curated-species-list-last-generated-date">
            Last generated: <span>{lastGenerated}</span>
          </div>
        )}
        <ul className="inat-curated-species-list-tabs">
          <li className={speciesTabClass} onClick={() => setTabIndex(0)}>
            <button>Species</button>
          </li>
          <li className={newAdditionsTabClass} onClick={() => setTabIndex(1)}>
            <button>New Additions</button>
          </li>
        </ul>
      </div>
    );
  };

  return (
    <>
      {getTabs()}
      <div style={{ display: tabIndex === 0 ? 'block' : 'none' }}>
        <SpeciesTab
          dataUrl={speciesDataUrl}
          onLoad={onLoadSpeciesData}
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
    </>
  );
};
