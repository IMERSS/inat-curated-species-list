import * as React from 'react';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import { INAT_SPECIES_URL } from '../../constants';
import ClearIcon from '@mui/icons-material/Clear';
import classes from './baseline.module.css';
import { BaselineSpeciesInatData } from '../../types';

type DataTableProps = {
  data: BaselineSpeciesInatData[];
  onDeleteRow: (taxonId: number) => void;
};

export const DataTable = ({ data, onDeleteRow }: DataTableProps) => {
  const rows = data.map((row) => (
    <tr key={row.id}>
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
            <th style={{ width: 100 }}>Taxon ID</th>
            <th>Species</th>
            <th>Research Grade</th>
            <th>Curator reviews</th>
            <th></th>
          </tr>
        </thead>
        <tbody>{rows}</tbody>
      </table>
    </Box>
  );
};
