import { Divider, Skeleton, Stack } from "@mui/material";
import React from "react";

const ObservationsSkelton = () => {
  return (
    <Stack direction="column" spacing={2} my={1} mt={2}>
      <Skeleton
        variant="rectangular"
        width={200}
        height={30}
        sx={{ borderRadius: 1, mx: "auto", alignSelf: "center" }}
      />
      <Skeleton
        variant="rectangular"
        width="40%"
        height={25}
        sx={{ borderRadius: 1, mx: "auto" }}
      />
      <Divider />
      <Skeleton variant="rectangular" height={50} sx={{ borderRadius: 1 }} />
      <Skeleton variant="rectangular" height={50} sx={{ borderRadius: 1 }} />
    </Stack>
  );
};

export default ObservationsSkelton;
