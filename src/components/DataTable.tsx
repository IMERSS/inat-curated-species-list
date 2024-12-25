import { FC, useEffect, useState } from 'react';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { firstBy } from 'thenby';
import { capitalizeFirstLetter } from '../utils/helpers';
import styles from './DataTable.module.css';
import { INAT_BASE_URL } from '../constants';
import { CuratedSpeciesData, CuratedSpeciesTaxon, Taxon } from '../../types/internal';

interface DataTableProps {
  readonly data: CuratedSpeciesData;
  readonly curatorUsernames: string;
  readonly placeId: number;
  readonly allowedCols?: Taxon[];
  readonly defaultVisibleCols?: Taxon[];
  readonly showCount?: boolean;
  readonly allowDownload?: boolean;
  readonly hideControls?: boolean;
}

export const DataTable: FC<DataTableProps> = ({
  data,
  curatorUsernames,
  placeId,
  allowedCols = [
    'kingdom',
    'phylum',
    'subphylum',
    'class',
    'subclass',
    'order',
    'superfamily',
    'family',
    'subfamily',
    'tribe',
    'subtribe',
    'genus',
    'subgenus',
    'species',
  ],
  defaultVisibleCols = ['superfamily', 'family', 'subfamily', 'tribe', 'subtribe', 'genus', 'subgenus', 'species'],
  showCount = true,
  // allowDownload = true,
  // hideControls = false,
}) => {
  const [sortedData, setSortedData] = useState<CuratedSpeciesTaxon[]>([]);
  // const [downloadData, setDownloadData] = useState<string[][]>([]);
  const [visibleCols] = useState(defaultVisibleCols); // setVisibleCols

  useEffect(() => {
    if (!data) {
      return;
    }

    const arr: CuratedSpeciesTaxon[] = Object.keys(data).map((taxonId) => ({
      ...data[taxonId],
      taxonId,
    }));

    let sorted: IThenBy<CuratedSpeciesTaxon> | null = null;
    const csvData = [];
    visibleCols.forEach((visibleCol) => {
      if (!sorted) {
        sorted = firstBy((a) => a.data[visibleCol] || 'Zzzzz', {
          direction: 'asc',
        });
      } else {
        sorted = sorted.thenBy((a) => a.data[visibleCol] || 'Zzzzz', {
          direction: 'asc',
        });
      }
    });

    if (sorted) {
      arr.sort(sorted);
      setSortedData(arr);

      const titleRow: string[] = [];
      visibleCols.forEach((col) => {
        titleRow.push(capitalizeFirstLetter(col));
      });
      csvData.push(titleRow);

      arr.forEach((a) => {
        const row: string[] = [];
        visibleCols.forEach((col) => {
          row.push(a.data[col] ? a.data[col] : '');
        });
        csvData.push(row);
      });

      // setDownloadData(csvData);
    }
  }, [data, visibleCols]);

  // this ensures correct sorting of the taxonomical levels in the table

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  // const onChange = (cols: string[]) => {
  //   setVisibleCols(orderedCols.filter((col) => cols.indexOf(col) !== -1));
  // };

  if (!sortedData.length) {
    return null;
  }

  console.log(allowedCols);
  // const orderedCols = allowedCols;

  return (
    <table className={`${styles.table} inat-curated-species-table`} cellSpacing={0} cellPadding={2}>
      <thead>
        <tr key="header">
          <th></th>
          {visibleCols.map((rank) => (
            <th key={rank}>{rank}</th>
          ))}
          {showCount && <th></th>}
          <th></th>
        </tr>
      </thead>
      <tbody>
        {sortedData.map((row, index) => (
          <tr key={row.taxonId}>
            <td>
              <b>{index + 1}</b>
            </td>
            {visibleCols.map((currentRank) => (
              <td key={`${row.taxonId}-${currentRank}`}>{row.data[currentRank] ? row.data[currentRank] : ''}</td>
            ))}
            {showCount && <td>({row.count})</td>}
            <td style={{ display: 'flex' }}>
              <a
                href={`${INAT_BASE_URL}?ident_user_id=${curatorUsernames}&place_id=${placeId}&taxon_id=${row.taxonId}&verifiable=any`}
                target="_blank"
                rel="noreferrer"
              >
                <VisibilityIcon />
              </a>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};
