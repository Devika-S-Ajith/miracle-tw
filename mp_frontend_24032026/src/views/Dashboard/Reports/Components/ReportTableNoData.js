import React from "react";
import { useTranslation } from "react-i18next";
import { Box, Grid, Typography } from "@mui/material";

const ReportTableNoData = () => {
  const { t } = useTranslation(["common"]);
  return (
    <Box sx={{ width: "100%", ml: "40%", mt: 5, mb: 1 }}>
      <Box>
        <Grid container spacing={3}>
          <Grid
            item
            md={3} //6
            xs={6} //12
          >
            <Typography>{t("common:common.No match")}</Typography>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

export default ReportTableNoData;
