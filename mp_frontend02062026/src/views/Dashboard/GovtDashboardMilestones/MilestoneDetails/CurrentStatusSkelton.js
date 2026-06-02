import { Grid, Skeleton } from "@mui/material";
import React from "react";

const CurrentStatusSkelton = () => {
  return (
    <Grid
      container
      spacing={2}
      alignItems="stretch"
      sx={{
        px: { xs: 2, sm: 3, md: 5, lg: 10 }, // Increased padding
        pt: 1,
      }}
    >
      {[1, 2, 3, 4].map((item) => (
        <Grid item xs={12} sm={6} md={3} key={item} style={{ display: "flex" }}>
          <Skeleton
            variant="rectangular"
            width={"100%"}
            height={150}
            sx={{ borderRadius: 2 }}
          />
        </Grid>
      ))}
    </Grid>
  );
};

export default CurrentStatusSkelton;
