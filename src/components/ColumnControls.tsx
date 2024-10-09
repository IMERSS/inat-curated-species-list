import { FC } from 'react';
import Box from '@mui/material/Box';
import DownloadForOfflineIcon from '@mui/icons-material/DownloadForOffline';
import styles from './ColumnControls.module.css';

interface ColumnControlsProps {
  cols: [];
}

export const ColumnControls: FC<ColumnControlsProps> = ({
  cols,
  visibleCols,
  onChange,
  downloadData,
  allowDownload,
}) => (
  <Box className={`${styles.controls} inat-curated-species-table-controls`}>
    <div>
      <h4>Visible Ranks</h4>

      {cols.map((col) => (
        <div key={`col-${col}`} style={{ display: 'inline-block' }}>
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
      ))}
    </div>
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
);

const getCsvContent = (rows) => {
  const csvContent = 'data:text/csv;charset=utf-8,' + rows.map((e) => e.join(',')).join('\n');

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', 'taxon-data.csv');
  document.body.appendChild(link);

  link.click();
};
