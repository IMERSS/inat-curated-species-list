import { FC, useEffect, useState } from 'react';
import { Loader } from './Loader';
import { constants } from '@imerss/inat-curated-species-list-common';
// import VisibilityIcon from '@mui/icons-material/Visibility';
import { YearDropdown } from './YearDropdown';
import { getNewAdditionDataForUI, formatDate } from '../utils/helpers';
import { NewAddition } from '@imerss/inat-curated-species-list-tools';
import { NewAdditionsByYear } from '../ui.types';

const { INAT_OBSERVATIONS_URL } = constants;

export interface NewAdditionsTabProps {
  readonly dataUrl: string;
}

export const NewAdditionsTab: FC<NewAdditionsTabProps> = ({ dataUrl }) => {
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
        const { currentYear, years, groupedByYear } = getNewAdditionDataForUI(data);
        setCurrentYear(currentYear);
        setYears(years);
        setData(groupedByYear);
        setLoaded(true);
      })
      .catch(() => setError(true));
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

  const newYearRecords = data[currentYear];

  let dataContent = <p>There are no new records for this year</p>;

  if (newYearRecords) {
    dataContent = (
      <table className="icsl-table" cellSpacing={0} cellPadding={2}>
        <thead>
          <tr>
            <th>Species</th>
            <th>Observer</th>
            <th>Date observed</th>
            <th>Date confirmed</th>
            <th>Curator</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {(newYearRecords as unknown as NewAddition[]).map(
            ({ speciesName, taxonId, observationId, curator, dateObserved, confirmationDate, observer }) => {
              return (
                <tr key={taxonId}>
                  <td>
                    <a href={`${INAT_OBSERVATIONS_URL}/${observationId}`} target="_blank" rel="noreferrer">
                      <i>{speciesName}</i>
                    </a>
                  </td>
                  <td>{observer.username}</td>
                  <td>{formatDate(dateObserved)}</td>
                  <td>{formatDate(confirmationDate)}</td>
                  <td>{curator}</td>
                  <td>
                    <a href={`${INAT_OBSERVATIONS_URL}/${observationId}`}>
                      <span>icon</span>
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
      <div className="icsl-new-additions-year-filter">
        <label>Filter by year:</label> <YearDropdown years={years} onChange={onChangeYear} />
      </div>
      {dataContent}
    </>
  );
};
