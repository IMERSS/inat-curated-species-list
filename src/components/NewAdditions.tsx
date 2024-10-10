import { FC, useState } from 'react';
import { YearDropdown } from './YearDropdown';
import VisibilityIcon from '@mui/icons-material/Visibility';
import styles from './NewAdditions.module.css';

interface NewAdditionsProps {
  readonly data: object;
}

export const NewAdditions: FC<NewAdditionsProps> = ({ data }) => {
  const years = Object.keys(data);
  const [selectedYear, setSelectedYear] = useState(years.length ? years[years.length - 1] : null);
  const [selectedYearData, setSelectedYearData] = useState(data[selectedYear]);

  if (!years.length) {
    return null;
  }

  const onChangeYear = (year: string) => {
    setSelectedYear(year);
    setSelectedYearData(data[year]);
  };

  return (
    <>
      <div style={{ float: 'right' }}>
        <YearDropdown years={Object.keys(data)} onChange={onChangeYear} />
      </div>

      <table className={styles.table}>
        <thead>
          <tr>
            <th></th>
            <th>Species</th>
            <th>Observer</th>
            <th>Observation date</th>
            <th>Confirmation date</th>
            <td></td>
          </tr>
        </thead>
        <tbody>
          {selectedYearData.map((obs, index) => (
            <tr>
              <td>
                <b>{index + 1}</b>
              </td>
              <td>{obs.species}</td>
              <td>{obs.observerUsername}</td>
              <td>{obs.obsDate.toString()}</td>
              <td>{obs.curatorConfirmationDate.toString()}</td>
              <td>
                <a href={obs.url} target="_blank" rel="noreferrer">
                  <VisibilityIcon />
                </a>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
};
