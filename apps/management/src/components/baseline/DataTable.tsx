import * as React from 'react';
import Box from '@mui/material/Box';

export const DataTable = ({ data }) => {
  const rows = data.map((row) => (
    <tr>
      <td>{row.id}</td>
      <td>{row.name}</td>
      <td></td>
      <td></td>
    </tr>
  ));
  return (
    <Box>
      <table>
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
