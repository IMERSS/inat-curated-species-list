import { FC, useEffect, useState } from 'react';
import { Loader } from './Loader';
import { constants } from '@imerss/inat-curated-species-list-common';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { YearDropdown } from './YearDropdown';
import { TaxonChangeData } from '@imerss/inat-curated-species-list-tools';
import { NewAdditionsByYear } from '../ui.types';

const { INAT_TAXON_CHANGES_URL } = constants;

export interface TaxonChangesTabProps {
  readonly dataUrl: string;
}

export const TaxonChangesTab: FC<TaxonChangesTabProps> = ({ dataUrl }) => {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  const [data, setData] = useState<NewAdditionsByYear>();
  const [years, setYears] = useState<string[]>([]);
  const [currentYear, setCurrentYear] = useState<string>();

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
        setYears(Object.keys(years));
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
      <div className="inat-curated-species-standalone-loader">
        <Loader />
      </div>
    );
  }

  const records = data[currentYear];

  let dataContent = <p>There are no new records for this year</p>;

  if (records) {
    dataContent = (
      <table cellSpacing={0} cellPadding={2}>
        <thead>
          <tr>
            <th>Taxon Change</th>
            <th>View Details</th>
          </tr>
        </thead>
        <tbody>
          {(records as unknown as TaxonChangeData[]).map(
            ({ id, previousSpeciesName, newSpeciesName, taxonChangeId }) => {
              return (
                <tr key={taxonChangeId}>
                  <td>
                    {previousSpeciesName} &raquo; {newSpeciesName}
                  </td>
                  <td>
                    <a href={`${INAT_TAXON_CHANGES_URL}/${taxonChangeId}`}>
                      <VisibilityIcon />
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
      <YearDropdown years={years} onChange={onChangeYear} />
      {dataContent}
    </>
  );
};
