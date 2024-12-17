import { FC } from 'react';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import { Taxon } from '../../types';
import { ALL_TAXONS } from '../../constants';

interface BuilderOptionsProps {
  visibleCols: Taxon[];
  downloadData: boolean;
  allowDownload: boolean;
  showFilterResults: boolean;
  showLatestAdditions: boolean;
}

const Rank = ({ label, visibleCols }) => (
  <div>
    <FormControlLabel
      control={
        <Checkbox
          size="small"
          id={`control-${label}`}
          checked={visibleCols.indexOf(label) !== -1}
          // onChange={(e) => {
          //   if (e.target.checked) {
          //     onChange([...visibleCols, col]);
          //   } else {
          //     onChange(visibleCols.filter((a) => a !== col));
          //   }
          // }}
        />
      }
      label={label}
    />
  </div>
);

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
      <table>
        <tr>
          <td>
            <Rank label="kingdom" visibleCols={visibleCols} />
            <Rank label="phylum" visibleCols={visibleCols} />
            <Rank label="subphylum" visibleCols={visibleCols} />
            <Rank label="class" visibleCols={visibleCols} />
            <Rank label="subclass" visibleCols={visibleCols} />
          </td>
          <td valign="top">
            <Rank label="order" visibleCols={visibleCols} />
            <Rank label="superfamily" visibleCols={visibleCols} />
            <Rank label="family" visibleCols={visibleCols} />
            <Rank label="subfamily" visibleCols={visibleCols} />
          </td>
          <td valign="top">
            <Rank label="tribe" visibleCols={visibleCols} />
            <Rank label="subtribe" visibleCols={visibleCols} />
            <Rank label="genus" visibleCols={visibleCols} />
            <Rank label="species" visibleCols={visibleCols} />
          </td>
        </tr>
      </table>

      <div>
        <FormControlLabel control={<Checkbox defaultChecked />} label="Include species count" />
        <FormControlLabel control={<Checkbox defaultChecked />} label="Allow download data" />
        <FormControlLabel control={<Checkbox defaultChecked />} label="Include Latest additions tab" />
        <FormControlLabel control={<Checkbox defaultChecked />} label="Include Filter results field" />
      </div>
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
