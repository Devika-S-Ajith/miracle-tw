import { Box, Grid, Typography } from "@mui/material";
import React from "react";
import { useNavigate } from "react-router";
import ChevronRightIcon from "../../../../assets/icons/ChevronRight";
import { useTranslation } from "react-i18next";
import ResourceDetails from "./ResourceDetails";

const ResourceDetailsContainer = () => {
    const { t } = useTranslation(["common"]);
  const navigate = useNavigate();
  return (
    <Box m={1}>
      <Grid item sx={{ display: "flex", flexDirection: "row" }} my={1}>
        <Typography
          color="textPrimary"
          variant="h5"
          onClick={() => navigate("/fostershare/dashboard")}
          sx={{ cursor: "pointer" }}
        >
          FosterShare
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
          sx={{ cursor: "pointer" }}
          onClick={() => navigate("/fostershare/resources")}
        >
          {"Resources"}
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
          {"Resource details"}
        </Typography>
      </Grid>
      <ResourceDetails />
    </Box>
  );
};

export default ResourceDetailsContainer;
