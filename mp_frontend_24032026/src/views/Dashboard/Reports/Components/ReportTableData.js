import React from "react";
import { TableBody, TableCell, TableRow } from "@mui/material";

const ReportTableData = ({ item, columns }) => {
  return (
    <TableBody>
      <TableRow>
        {columns.map((column, index) => (
          <TableCell key={index}>
            {column.render ? column.render(item) : item[column.key]}
          </TableCell>
        ))}
      </TableRow>
    </TableBody>
  );
};

export default ReportTableData;
