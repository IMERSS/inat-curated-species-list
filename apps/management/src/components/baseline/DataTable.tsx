import * as React from 'react';
import Box from '@mui/material/Box';
import { INAT_SPECIES_URL } from '../../constants';

export const DataTable = ({ data }) => {
  const rows = data.map((row) => (
    <tr key={row.id}>
      <td>{row.id}</td>
      <td>
        <a href={`${INAT_SPECIES_URL}/${row.id}`} target="_blank">
          {row.name}
        </a>
      </td>
      <td></td>
      <td>
        <input type="checkbox" />
      </td>
    </tr>
  ));
  return (
    <Box>
      <table style={{ width: '100%' }} cellSpacing={0} cellPadding={0}>
        <thead>
          <tr>
            <th>Taxon ID</th>
            <th>Species</th>
            <th># curator reviews</th>
            <th>DEL</th>
          </tr>
        </thead>
        <tbody>{rows}</tbody>
      </table>
    </Box>
  );
};
