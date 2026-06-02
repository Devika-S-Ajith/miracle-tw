import React from "react";
import { Box, Pagination } from "@mui/material";
import ListPaging from "../../../../components/UserComponents/ListPaging";

const ReportPagination = ({
  rowCount,
  page,
  pageCount,
  handleRowCountChange,
  handlePageChange,
}) => {
  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "end",
        alignItems: "center",
      }}
      p={1}
      m={1}
    >
      <ListPaging
        rowCount={rowCount}
        handleRowCountChange={handleRowCountChange}
      ></ListPaging>

      <Pagination
        onChange={handlePageChange}
        page={page}
        count={pageCount}
        shape="rounded"
      />
    </Box>
  );
};

export default ReportPagination;
