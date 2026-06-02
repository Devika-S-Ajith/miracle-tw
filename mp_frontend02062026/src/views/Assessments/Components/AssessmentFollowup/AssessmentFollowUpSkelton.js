import React from "react";
import { Divider, Grid, Skeleton, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";

const AssessmentFollowUpSkelton = () => {
  const { t } = useTranslation(["common"]);
  return (
    <>
      <Skeleton
        variant="rectangular"
        width={200}
        height={30}
        sx={{ borderRadius: 1, mx: "auto" }}
      />

      <Typography color="textSecondary" variant="subtitle1" sx={{ mt: 1 }}>
        <Skeleton variant="text" width="45%" />
      </Typography>
      <Divider sx={{ my: 2 }} />
      <Typography color="textSecondary" variant="subtitle1" sx={{ mt: 1 }}>
        <Skeleton variant="text" width="60%" />
      </Typography>
      <Grid container spacing={2}>
        <Grid item lg={3} md={6} xs={12} sx={{ mt: 2 }}>
          <Skeleton variant="text" width="60" height={20} />
        </Grid>
        <Grid item lg={3} md={6} xs={12} sx={{ mt: 2 }}>
          <Skeleton variant="text" width="60" height={20} />
        </Grid>
        <Grid item lg={3} md={6} xs={12} sx={{ mt: 2 }}>
          <Skeleton variant="text" width="60" height={20} />
        </Grid>
        <Grid item lg={3} md={6} xs={12} sx={{ mt: 2 }}>
          <Skeleton variant="text" width="60" height={20} />
        </Grid>
      </Grid>
    </>
  );
};

export default AssessmentFollowUpSkelton;
