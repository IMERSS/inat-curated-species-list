import React, { FC, useCallback, useEffect, useState } from 'react';
import { Loader } from './Loader';
import { constants } from '@imerss/inat-curated-species-list-common';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { NewAdditions } from '@imerss/inat-curated-species-list-tools';
import { YearDropdown } from './YearDropdown';
import { groupByYear } from '../utils/helpers';
import { NewAdditionsByYear } from '../ui.types';

const { INAT_OBSERVATIONS_URL } = constants;

export interface NewAdditionsTabProps {
  readonly dataUrl: string;
  readonly curatorUsernames: string[];
  readonly placeId: number;
  readonly showRowNumbers?: boolean;
  readonly showReviewerCount?: boolean;
}

export const NewAdditionsTab: FC<NewAdditionsTabProps> = ({
  dataUrl,
  curatorUsernames,
  placeId,
  showRowNumbers,
  showReviewerCount,
}) => {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  const [data, setData] = useState<NewAdditionsByYear[]>();
  const [years, setYears] = useState<string[]>([]);
  const [currentYear, setCurrentYear] = useState<string[]>([]);

  const onChangeYear = () => {};

  useEffect(() => {
    fetch(dataUrl, {
      headers: {
        Accept: 'application/json',
      },
    })
      .then((resp) => resp.json())
      .then((data) => {
        const dataGroupedByYear = groupByYear(data);
        setYears(Object.keys(dataGroupedByYear));
        setData(data);
        setLoaded(true);
      })
      .catch(() => setError(true));
  }, [dataUrl]);

  if ((!loaded || !data) && !error) {
    return (
      <div className="inat-curated-species-standalone-loader">
        <Loader />
      </div>
    );
  }

  if (error) {
    return <p>Sorry, there was an error loading the data.</p>;
  }

  return (
    <>
      <YearDropdown years={years} onChange={onChangeYear} />
      <table className="inat-curated-species-table" cellSpacing={0} cellPadding={2}>
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
          {data!.map(({ speciesName, taxonId, observationId, curator, dateObserved, confirmationDate, observer }) => {
            return (
              <tr key={taxonId}>
                <td>
                  <a href={`${INAT_OBSERVATIONS_URL}/${observationId}`}>
                    <i>{speciesName}</i>
                  </a>
                </td>
                <td>{observer.username}</td>
                <td>{dateObserved}</td>
                <td>{confirmationDate}</td>
                <td>{curator}</td>
                <td>
                  <VisibilityIcon />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </>
  );
};
