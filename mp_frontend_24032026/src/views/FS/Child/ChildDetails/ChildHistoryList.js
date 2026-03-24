import React, { useEffect, useState } from "react";
import TablePagination from "@mui/material/TablePagination";
import { Card, CardContent, Typography, Box } from "@mui/material";
import ChildHistory from "../../Components/ChildHistory";
import { useParams } from "react-router";

const ChildHistoryList = ({ getChildHistoryData, childHistoryData }) => {
  const [page, setPage] = useState(0); // Start from the first page
  const [totalCount, setTotalCount] = useState();
  const { id } = useParams();

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  useEffect(() => {
    getChildHistoryDataHandler();
  }, [page]);

  const getChildHistoryDataHandler = async () => {
    const res = await getChildHistoryData(page);
    setTotalCount(res);
  };
  return (
    <Card sx={{ borderRadius: 2 / 8 }}>
      <CardContent>
        <Typography color="textPrimary" fontWeight={700} fontSize="1.25rem">
          History
        </Typography>
        {childHistoryData.map((history) => (
          <Box key={history.id} my>
            <ChildHistory date={history.createdAt} value={history.html} />
          </Box>
        ))}
        <TablePagination
          component="div"
          count={totalCount}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={10}
          // onRowsPerPageChange={handleChangeRowsPerPage}
          rowsPerPageOptions={[]}
        />
      </CardContent>
    </Card>
  );
};

export default ChildHistoryList;
