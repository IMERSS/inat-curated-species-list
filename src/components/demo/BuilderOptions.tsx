import { FC } from 'react';
import Grid from '@mui/material/Grid';
import { Taxon } from '../../types';
import { ALL_TAXONS } from '../../constants';

interface BuilderOptionsProps {
  visibleCols: Taxon[];
  downloadData: boolean;
  allowDownload: boolean;
  showFilterResults: boolean;
  showLatestAdditions: boolean;
}

export const BuilderOptions: FC<BuilderOptionsProps> = ({
  visibleCols,
  downloadData,
  allowDownload,
  showFilterResults,
  showLatestAdditions,
}) => {
  const onChange = () => null;

  return (
    <>
      <h4>Visible Ranks</h4>
      <Grid container rowSpacing={1} columnSpacing={{ xs: 1, sm: 2, md: 3 }}>
        {ALL_TAXONS.map((col) => (
          <Grid size={6} key={`col-${col}`}>
            <div>
              <input
                type="checkbox"
                id={`control-${col}`}
                checked={visibleCols.indexOf(col) !== -1}
                onChange={(e) => {
                  if (e.target.checked) {
                    onChange([...visibleCols, col]);
                  } else {
                    onChange(visibleCols.filter((a) => a !== col));
                  }
                }}
              />
              <label htmlFor={`control-${col}`}>{col}</label>
            </div>
          </Grid>
        ))}
      </Grid>

      <label>Include species count</label>
      <label>Allow download data</label>

      <label>Include Latest additions tab</label>
      <label>Include Filter results field</label>
    </>
  );
};

/*
<Box className={`${styles.controls} inat-curated-species-table-controls`}>

    {allowDownload && (
      <a
        href="#"
        title="Download data"
        onClick={(e) => {
          e.preventDefault();
          getCsvContent(downloadData);
        }}
      >
        <DownloadForOfflineIcon fontSize="large" />
      </a>
    )}
  </Box>
*/

const getCsvContent = (rows: string[][]) => {
  const csvContent = 'data:text/csv;charset=utf-8,' + rows.map((e) => e.join(',')).join('\n');

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', 'taxon-data.csv');
  document.body.appendChild(link);

  link.click();
};
