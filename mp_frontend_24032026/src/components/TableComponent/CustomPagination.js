import React from "react";
import { PaginationItem, Pagination, Box } from "@mui/material";

const PAGINATION_SIBLING_COUNT = 2;
const CustomPagination = ({
  page,
  onPageChange,
  count,
  className,
  rowsPerPage,
}) => {
  return (
    <Pagination
      id="table-pagination"
      shape="rounded"
      color="primary"
      className={className}
      page={page+1}
      count={Math.ceil(count / rowsPerPage < 0 ? 1 : count / rowsPerPage)}
      siblingCount={PAGINATION_SIBLING_COUNT}
      onChange={(event, newPage) => {
        onPageChange(event, newPage - 1);
      }}
      renderItem={(item) => (
        <PaginationItem
          slots={{
            type: "start-ellipsis",
            previous: () => (
              <Box variant="contained" color="primary">
                Previous
              </Box>
            ),
            next: () => (
              <Box variant="contained" color="primary">
                Next
              </Box>
            ),
          }}
          {...item}
        />
      )}
    />
  );
};

export default CustomPagination;
