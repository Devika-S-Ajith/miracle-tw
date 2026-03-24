import React from "react";
import { Grid, Skeleton } from "@mui/material";
import CommonCard from "../../../components/CommonCard";

const TopInCrisisSkeleton = () => {
  return (
    <CommonCard title="Top In Crisis">
      <Grid container pt px={2} spacing={2}>
        {[...Array(5)].map((_, idx) => (
          <Grid item xs={12} sm={6} md={4} lg={12 / 5} key={idx}>
            <Skeleton variant="rectangular" height={150} />
          </Grid>
        ))}
      </Grid>
    </CommonCard>
  );
};

export default TopInCrisisSkeleton;