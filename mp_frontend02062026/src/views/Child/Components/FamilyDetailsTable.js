import React from 'react';
import {
  TableCell,
  TableRow,
  Typography
} from '@mui/material';


const FamilyDetailsTable = (props) => {
  const { name, value } = props
  return (
    <>
      <TableRow>
        <TableCell style={{ width: '30%', verticalAlign: 'top' }}>
          <Typography
            color="textPrimary"
            variant="subtitle2"
          >
            {name}
          </Typography>
        </TableCell>
        <TableCell style={{ width: '65%', verticalAlign: 'top' }}>
          <Typography
            color="textPrimary"
            variant="subtitle2"
            style={{ fontWeight: 'bold' }}
          >
            {value == ' undefined ' ? '' : value}
          </Typography>
        </TableCell>
      </TableRow>
    </>
  );
};

export default FamilyDetailsTable;
