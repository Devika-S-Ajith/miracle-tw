import React from "react";
import { TableCell, TableHead, TableRow } from "@mui/material";

const ReportTableHeader = ({ tableHead }) => {
  return (
    <TableHead>
      <TableRow>
        {tableHead.map((item, index) => {
          return (
            <TableCell sx={{ fontWeight: "bold" }} key={index}>
              {item.name}
            </TableCell>
          );
        })}
      </TableRow>
    </TableHead>
  );
};

export default ReportTableHeader;
