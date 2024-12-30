import { FC, useEffect, useState } from 'react';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { firstBy } from 'thenby';
import { capitalizeFirstLetter } from '../utils/helpers';
import { CuratedSpeciesData, CuratedSpeciesArrayItem, Taxon } from '@imerss/inat-curated-species-list-common';
import { constants } from '@imerss/inat-curated-species-list-common';

const { INAT_OBSERVATIONS_URL } = constants;

interface DataTableProps {
  readonly data: CuratedSpeciesData;
  readonly taxons: Taxon[];
  readonly curatorUsernames: string[];
  readonly placeId: number;
  readonly showRowNumbers?: boolean;
  readonly showReviewerCount?: boolean;
  readonly allowedCols?: Taxon[];
  readonly allowDownload?: boolean;
}

/**
 * Renders the data table alone.
 */
export const DataTable: FC<DataTableProps> = ({
  data,
  taxons,
  curatorUsernames,
  placeId,
  showRowNumbers = true,
  showReviewerCount = false,
  // allowDownload = true,
}) => {
  const [sortedData, setSortedData] = useState<CuratedSpeciesArrayItem[]>([]);
  // const [downloadData, setDownloadData] = useState<string[][]>([]);
  const [taxonCols, setTaxonCols] = useState<Taxon[]>([]);

  useEffect(() => {
    setTaxonCols(taxons);

    const arr: CuratedSpeciesArrayItem[] = Object.keys(data).map((taxonId) => ({
      data: data[taxonId]!.data,
      count: data[taxonId]!.count,
      taxonId,
    }));

    let sorted: IThenBy<CuratedSpeciesArrayItem> | null = null;
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
  }, [data, taxonCols, taxons]);

  // this ensures correct sorting of the taxonomical levels in the table

  // const onChange = (cols: string[]) => {
  //   setTaxonCols(orderedCols.filter((col) => cols.indexOf(col) !== -1));
  // };

  if (!sortedData.length) {
    return null;
  }

  return (
    <table className="inat-curated-species-table" cellSpacing={0} cellPadding={2}>
      <thead>
        <tr key="header">
          {showRowNumbers && <th></th>}
          {taxonCols.map((rank) => (
            <th key={rank}>{rank}</th>
          ))}
          {showReviewerCount && <th></th>}
          <th></th>
        </tr>
      </thead>
      <tbody>
        {sortedData.map((row, index) => (
          <tr key={row.taxonId}>
            {showRowNumbers && (
              <td>
                <b>{index + 1}</b>
              </td>
            )}
            {taxonCols.map((currentRank) => (
              <td key={`${row.taxonId}-${currentRank}`}>{row.data[currentRank] ? row.data[currentRank] : ''}</td>
            ))}
            {showReviewerCount && <td>({row.count})</td>}
            <td style={{ display: 'flex' }}>
              <a
                href={`${INAT_OBSERVATIONS_URL}?ident_user_id=${curatorUsernames.join(',')}&place_id=${placeId}&taxon_id=${row.taxonId}&verifiable=any`}
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
