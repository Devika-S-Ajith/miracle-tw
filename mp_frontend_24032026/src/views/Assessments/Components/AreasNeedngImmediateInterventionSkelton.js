import { Box, Skeleton, Stack } from "@mui/material";
import React from "react";

const AreasNeedngImmediateInterventionSkelton = () => {
  return (
    <Stack direction="column" width={1} spacing={2} my={1} justifyContent="center">
      <Skeleton
        variant="rectangular"
        width={200}
        height={30}
        sx={{ borderRadius: 1, alignSelf: "center" }}
      />

      <Skeleton variant="rectangular" height={30} sx={{ borderRadius: 1 }} />
      <Skeleton variant="rectangular" height={50} sx={{ borderRadius: 1 }} />
    </Stack>
  );
};

export default AreasNeedngImmediateInterventionSkelton;
