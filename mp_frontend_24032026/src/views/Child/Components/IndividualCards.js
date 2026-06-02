import React from 'react';
import {
  TableCell,
  TableRow,
  Typography
} from '@mui/material';


const IndividualCards = (props) => {
  const { name, value } = props
  return (
    <>
      <TableRow>
        <TableCell style={{ width: '30%' }}>
          <Typography
            color="textPrimary"
            variant="subtitle2"
          >
            {name}
          </Typography>
        </TableCell>
        <TableCell style={{ width: '30%' }}>
          <Typography
            color="textPrimary"
            variant="body2"
          >
            {value == ' undefined ' ? '' : value}
          </Typography>
        </TableCell>
      </TableRow>
    </>
  );
};

export default IndividualCards;
