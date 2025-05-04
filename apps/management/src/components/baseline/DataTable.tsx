import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import { INAT_SPECIES_URL } from '../../constants';
import ClearIcon from '@mui/icons-material/Clear';
import classes from './baseline.module.css';
import { BaselineSpeciesInatData } from '../../types';
import { IconButton } from '@mui/material';
import { SortCol, SortDir } from './BaselineData.types';

type DataTableProps = {
  data: BaselineSpeciesInatData[];
  sortCol: SortCol;
  sortDir: SortDir;
  onSort: (sortCol: SortCol, sortDir: SortDir) => void;
  onDeleteRow: (taxonId: number) => void;
};

type SortButtonProps = {
  sortCol: SortCol;
  currentSortCol: SortCol;
  currentSortDir: SortDir;
  onSort: (sortCol: SortCol, sortDir: SortDir) => void;
};

const SortButton = ({ sortCol, currentSortCol, currentSortDir, onSort }: SortButtonProps) => {
  let SortDirComponent = ArrowDropUpIcon;
  const style: any = {
    marginLeft: 5,
  };
  if (sortCol !== currentSortCol) {
    style.visibility = 'hidden';
  }

  return (
    <IconButton size="small" style={style} onClick={() => onSort(sortCol, 'asc')}>
      <SortDirComponent />
    </IconButton>
  );
};

export const DataTable = ({ data, onDeleteRow, sortCol, sortDir, onSort }: DataTableProps) => {
  const rows = data.map((row, rowNum) => (
    <tr key={row.id}>
      <td className={classes.rowNum}>{rowNum + 1}</td>
      <td>{row.id}</td>
      <td>
        <a href={`${INAT_SPECIES_URL}/${row.id}`} target="_blank">
          {row.name}
        </a>
      </td>
      <td>
        <Chip label={row.researchGradeReviewCount || 0} size="small" />
      </td>
      <td></td>
      <td width={30} className={classes.deleteRow}>
        <ClearIcon onClick={() => onDeleteRow(row.id)} />
      </td>
    </tr>
  ));
  return (
    <Box>
      <table cellSpacing={0} cellPadding={0} className={classes.baselineTable}>
        <thead>
          <tr>
            <th></th>
            <th style={{ width: 100 }}>
              Taxon ID
              <SortButton sortCol="id" currentSortCol={sortCol} currentSortDir={sortDir} onSort={onSort} />
            </th>
            <th>
              Species
              <SortButton sortCol="name" currentSortCol={sortCol} currentSortDir={sortDir} onSort={onSort} />
            </th>
            <th>
              Research Grade
              <SortButton
                sortCol="researchGradeReviewCount"
                currentSortCol={sortCol}
                currentSortDir={sortDir}
                onSort={onSort}
              />
            </th>
            <th>
              Curator reviews
              <SortButton
                sortCol="researchGradeReviewCount"
                currentSortCol={sortCol}
                currentSortDir={sortDir}
                onSort={onSort}
              />
            </th>
            <th></th>
          </tr>
        </thead>
        <tbody>{rows}</tbody>
      </table>
    </Box>
  );
};
