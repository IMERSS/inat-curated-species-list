import { FC, useEffect, useState } from 'react';
import { Loader } from './Loader';
import { constants } from '@imerss/inat-curated-species-list-common';
import { YearDropdown } from './YearDropdown';
import { TaxonChangeData } from '@imerss/inat-curated-species-list-tools';
import { getCurrentYear } from '../utils/helpers';
import { NewAdditionsByYear } from '../ui.types';
import { ViewIcon } from './ViewIcon';

const { INAT_TAXON_CHANGES_URL } = constants;

export interface TaxonChangesTabProps {
  readonly dataUrl: string;
  readonly showRowNumbers: boolean;
  readonly tabText?: any;
}

export const TaxonChangesTab: FC<TaxonChangesTabProps> = ({ dataUrl, showRowNumbers, tabText }) => {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  const [data, setData] = useState<NewAdditionsByYear>();
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

  if (records) {
    dataContent = (
      <table cellSpacing={0} cellPadding={2}>
        <thead>
          <tr>
            {showRowNumbers && <th></th>}
            <th>Date</th>
            <th>Taxon Change</th>
            <th>View Details</th>
          </tr>
        </thead>
        <tbody>
          {(records as unknown as TaxonChangeData[]).map(
            ({ previousSpeciesName, newSpeciesName, taxonChangeId }, index) => {
              return (
                <tr key={taxonChangeId}>
                  {showRowNumbers && (
                    <th>
                      <b>{index + 1}</b>
                    </th>
                  )}
                  <td>...</td>
                  <td>
                    {previousSpeciesName} &raquo; {newSpeciesName}
                  </td>
                  <td>
                    <a href={`${INAT_TAXON_CHANGES_URL}/${taxonChangeId}`}>
                      <ViewIcon />
                    </a>
                  </td>
                </tr>
              );
            },
          )}
        </tbody>
      </table>
    );
  }

  return (
    <>
      {tabTextHtml}
      <YearDropdown years={years} onChange={onChangeYear} />
      {dataContent}
    </>
  );
};
