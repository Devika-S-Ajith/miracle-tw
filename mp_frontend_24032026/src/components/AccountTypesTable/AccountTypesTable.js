import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  Typography,
} from "@mui/material";
import { Box } from "@mui/system";
import React from "react";
import SubHeading from "../SubHeading/SubHeading";
import BodyText from "../BodyText/BodyText";

const AccountTypesTable = ({ typeList = [], title, description }) => {
  return (
    <>
    <SubHeading value={title} />
    <Box my mx={-2}>
      <Box
        sx={{
          overflowY: "auto", // 'auto' will add a scrollbar when needed
          maxHeight: "70vh", // Set a maximum height to limit the scrollable area
        }}
        p={2}
      >
        <BodyText value={description} />
        <TableContainer sx={{ borderRadius: 2 / 8, marginY: 2 }}>
          <Table sx={{ border: " 1px solid #C6C4BE" }}>
            <TableBody>
              {typeList.map((obj) => (
                <TableRow key={obj?.name} sx={{ border: " 1px solid #C6C4BE" }}>
                  <TableCell
                    sx={{ border: " 1px solid #C6C4BE", minWidth: 175 }}
                  >
                    <Typography
                      id="type-name"
                      color="textPrimary"
                      variant="subtitle2"
                      fontSize={"1rem"}
                      fontWeight={600}
                    >
                      {obj?.name}
                    </Typography>
                  </TableCell>
                  <TableCell>{obj?.description}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </Box>
    </>
  );
};

export default AccountTypesTable;
