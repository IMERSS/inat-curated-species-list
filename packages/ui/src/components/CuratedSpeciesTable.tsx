import { FC, useCallback, useState } from 'react';
import { SpeciesTab } from './SpeciesTab';
import { NewAdditionsTab } from './NewAdditionsTab';
import { formatDate } from '../utils/helpers';
import { CuratedSpeciesDataMinified } from '@imerss/inat-curated-species-list-common';

export interface CuratedSpeciesTableProps {
  readonly speciesDataUrl: string;
  readonly curatorUsernames: string[];
  readonly placeId: number;
  readonly showLastGeneratedDate: boolean;
  readonly showRowNumbers?: boolean;
  readonly showReviewerCount?: boolean;
  readonly showNewAdditions?: boolean;
  readonly newAdditionsDataUrl?: string;
}

export const CuratedSpeciesTable: FC<CuratedSpeciesTableProps> = ({
  speciesDataUrl,
  curatorUsernames,
  placeId,
  showLastGeneratedDate,
  showRowNumbers,
  showReviewerCount,
  showNewAdditions,
  newAdditionsDataUrl,
}) => {
  const [tabIndex, setTabIndex] = useState(0);
  const [lastGenerated, setLastGeneratedDate] = useState('');
  const hasNewAdditions = showNewAdditions && newAdditionsDataUrl;

  const onLoadSpeciesData = useCallback((data: CuratedSpeciesDataMinified) => {
    setLastGeneratedDate(formatDate(data.dateGenerated));
  }, []);

  const getTabs = () => {
    if (!hasNewAdditions) {
      return null;
    }

    const speciesTabClass = tabIndex === 0 ? 'icsl-tab-selected' : '';
    const newAdditionsTabClass = tabIndex === 1 ? 'icsl-tab-selected' : '';

    return (
      <div style={{ position: 'relative' }}>
        {showLastGeneratedDate && lastGenerated && (
          <div className="icsl-last-generated-date">
            Last generated: <span>{lastGenerated}</span>
          </div>
        )}
        <ul className="icsl-tabs">
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
