import { FC, useEffect, useState } from 'react';
import { Loader } from './Loader';
import { constants } from '@imerss/inat-curated-species-list-common';
import { YearDropdown } from './YearDropdown';
import { formatDate, getCurrentYear } from '../utils/helpers';
import { ViewIcon } from './ViewIcon';
import { TaxonChangeType } from '@imerss/inat-curated-species-list-tools';

const { INAT_TAXON_CHANGES_URL, INAT_TAXON_URL } = constants;

export interface TaxonChangesTabProps {
  readonly dataUrl: string;
  readonly showRowNumbers: boolean;
  readonly tabText?: string | JSX.Element;
}

const ChangeTypePill = ({ type }: { type: TaxonChangeType }) => {
  const getPill = (type: TaxonChangeType) => {
    if (type === 'TaxonMerge') {
      return { label: 'Taxon Merge', className: 'icsl-pill-taxon-change icsl-pill-taxon-merge' };
    } else if (type === 'TaxonSplit') {
      return { label: 'Taxon Split', className: 'icsl-pill-taxon-change icsl-pill-taxon-split' };
    }
    return { label: 'Taxon Swap', className: 'icsl-pill-taxon-change icsl-pill-taxon-swap' };
  };

  const { label, className } = getPill(type);

  return <span className={className}>{label}</span>;
};

export const TaxonChangesTab: FC<TaxonChangesTabProps> = ({ dataUrl, showRowNumbers, tabText }) => {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  const [data, setData] = useState<any>();
  const [years, setYears] = useState<string[]>([]);
  const [currentYear, setCurrentYear] = useState<string>(() => getCurrentYear().toString());
  const onChangeYear = (year: string) => setCurrentYear(year);

  useEffect(() => {
    fetch(dataUrl, {
      headers: {
        Accept: 'application/json',
      },
    })
      .then((resp) => resp.json())
      .then((data) => {
        setCurrentYear(currentYear);
        setYears(Object.keys(data));
        setData(data);
        setLoaded(true);
      })
      .catch(() => setError(true));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dataUrl]);

  if (error) {
    return <p>Sorry, there was an error loading the data.</p>;
  }

  if (!loaded || !data || !currentYear) {
    return (
      <div className="icsl-loader">
        <Loader />
      </div>
    );
  }

  const records = data[currentYear];

  let dataContent = (
    <p className="icsl-empty-tab icsl-taxon-changes-none">There are no new taxon changes for this year.</p>
  );
  const tabTextHtml = tabText ? <div className="icsl-tab-text" dangerouslySetInnerHTML={{ __html: tabText }} /> : null;

  if (records.length) {
    dataContent = (
      <table className="icsl-table" cellSpacing={0} cellPadding={2}>
        <thead>
          <tr>
            {showRowNumbers && <th></th>}
            <th>Date</th>
            <th>Previous Name</th>
            <th>New Name</th>
            <th>Change Type</th>
            <th>View Details</th>
          </tr>
        </thead>
        <tbody>
          {Object.keys(records).map((species, index) => {
            const taxonChange = records[species];
            return (
              <tr key={species}>
                {showRowNumbers && (
                  <th>
                    <b>{index + 1}</b>
                  </th>
                )}
                <td>{formatDate(taxonChange.taxonChangeObsCreatedAt)}</td>
                <td className="icsl-species-name">{taxonChange.previousSpeciesName}</td>
                <td className="icsl-species-name">
                  <a href={`${INAT_TAXON_URL}/${taxonChange.newSpeciesTaxonId}`} target="_blank" rel="noreferrer">
                    {taxonChange.newSpeciesName}
                  </a>
                </td>
                <td>
                  <ChangeTypePill type={taxonChange.taxonChangeType} />
                </td>
                <td>
                  <a href={`${INAT_TAXON_CHANGES_URL}/${taxonChange.taxonChangeId}`}>
                    <ViewIcon />
                  </a>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    );
  }

  return (
    <>
      {tabTextHtml}
      <div className="icsl-new-additions-year-filter">
        <label>View by year:</label> <YearDropdown years={years} onChange={onChangeYear} />
      </div>
      {dataContent}
    </>
  );
};
