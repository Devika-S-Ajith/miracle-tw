import { Box, Grid, Typography } from "@mui/material";
import React from "react";
import { useNavigate } from "react-router";
import SupportServiceDetails from "./ResourceDetails";
import ChevronRightIcon from "../../../../assets/icons/ChevronRight";
import { useTranslation } from "react-i18next";

const ResourceDetailsContainer = () => {
  const navigate = useNavigate();
  const { t } = useTranslation(["common"]);
  return (
    <Box m={1}>
      <Grid item sx={{ display: "flex", flexDirection: "row" }} my={1}>
        <Typography
          id="support services-table-label"
          color="textPrimary"
          variant="h5"
          sx={{ cursor: "pointer" }}
          onClick={() => navigate("/fostershare/resources")}
        >
          {t("common:common.Resources", "Resources")}
        </Typography>
        <Box
          sx={{
            m: 0.75,
          }}
          style={{ cursor: "text" }}
        >
          <ChevronRightIcon color="disabled" fontSize="small" />
        </Box>
        <Typography
          id="support services-table-label"
          color="textPrimary"
          variant="h5"
        >
          {t("common:resources.Resource details", "Resource details")}
        </Typography>
      </Grid>

      <SupportServiceDetails />
    </Box>
  );
};

export default ResourceDetailsContainer;
