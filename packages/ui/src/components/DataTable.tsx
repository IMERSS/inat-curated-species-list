import { FC, useEffect, useState } from 'react';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { firstBy } from 'thenby';
import { capitalizeFirstLetter } from '../utils/helpers';
// import styles from './DataTable.module.css';
import {
  unminifySpeciesData,
  CuratedSpeciesData,
  CuratedSpeciesTaxon,
  Taxon,
  CuratedSpeciesDataMinified,
} from '@imerss/inat-curated-species-list-common';
import { constants } from '@imerss/inat-curated-species-list-common';

const { INAT_OBSERVATIONS_URL } = constants;

interface DataTableProps {
  readonly data: CuratedSpeciesDataMinified;
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
  // allowedCols = [
  //   'kingdom',
  //   'phylum',
  //   'subphylum',
  //   'class',
  //   'subclass',
  //   'order',
  //   'superfamily',
  //   'family',
  //   'subfamily',
  //   'tribe',
  //   'subtribe',
  //   'genus',
  //   'subgenus',
  //   'species',
  // ],
  showCount = true,
  // allowDownload = true,
  // hideControls = false,
}) => {
  const [sortedData, setSortedData] = useState<CuratedSpeciesTaxon[]>([]);
  // const [downloadData, setDownloadData] = useState<string[][]>([]);
  const [taxonCols, setTaxonCols] = useState<Taxon[]>([]);

  useEffect(() => {
    if (!data) {
      return;
    }

    setTaxonCols(data.taxons);
    const unminifiedData = unminifySpeciesData(data);

    console.log(unminifiedData);

    const arr: CuratedSpeciesData[] = Object.keys(unminifiedData).map((taxonId) => ({
      ...unminifiedData[taxonId],
      taxonId,
    }));

    let sorted: IThenBy<CuratedSpeciesTaxon> | null = null;
    const csvData = [];
    taxonCols.forEach((taxon) => {
      if (!sorted) {
        sorted = firstBy((a) => a.data[taxon] || 'Zzzzz', {
          direction: 'asc',
        });
      } else {
        sorted = sorted.thenBy((a) => a.data[taxon] || 'Zzzzz', {
          direction: 'asc',
        });
      }
    });

    if (sorted) {
      arr.sort(sorted);
      setSortedData(arr);

      const titleRow: string[] = [];
      taxonCols.forEach((col) => {
        titleRow.push(capitalizeFirstLetter(col));
      });
      csvData.push(titleRow);

      arr.forEach((a) => {
        const row: string[] = [];
        taxonCols.forEach((col) => {
          row.push(a.data[col] ? a.data[col] : '');
        });
        csvData.push(row);
      });

      // setDownloadData(csvData);
    }
  }, [data, taxonCols]);

  // this ensures correct sorting of the taxonomical levels in the table

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  // const onChange = (cols: string[]) => {
  //   setVisibleCols(orderedCols.filter((col) => cols.indexOf(col) !== -1));
  // };

  if (!sortedData.length) {
    return null;
  }

  // const orderedCols = allowedCols;

  /*
  .table th {
    text-transform: capitalize;
    text-align: left;
    font-size: 12px;
  }
  */
  return (
    <table
      className="inat-curated-species-table"
      cellSpacing={0}
      cellPadding={2}
      style={{ width: '100%', marginTop: 20, flex: 1, lineHeight: '25px', fontSize: 12 }}
    >
      <thead>
        <tr key="header">
          <th></th>
          {taxonCols.map((rank) => (
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
            {taxonCols.map((currentRank) => (
              <td key={`${row.taxonId}-${currentRank}`}>{row.data[currentRank] ? row.data[currentRank] : ''}</td>
            ))}
            {showCount && <td>({row.count})</td>}
            <td style={{ display: 'flex' }}>
              <a
                href={`${INAT_OBSERVATIONS_URL}?ident_user_id=${curatorUsernames}&place_id=${placeId}&taxon_id=${row.taxonId}&verifiable=any`}
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
