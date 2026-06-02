import { Box, Grid, Typography } from "@mui/material";
import React from "react";
import { useNavigate } from "react-router";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import ChevronRightIcon from "../../../../assets/icons/ChevronRight";
import SupportServiceDetails from "./SupportServiceDetails";

const SupportServiceDetailsContainer = () => {
  const navigate = useNavigate();
  return (
    <Box m={2}>
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
          color="textPrimary"
          variant="h5"
          sx={{ cursor: "pointer" }}
          onClick={() => navigate("/fostershare/support-services")}
        >
          {"Support services"}
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
          color="textPrimary"
          variant="h5"
          sx={{ pointerEvents: "none" }}
        >
          {"Support service details"}
        </Typography>
      </Grid>

      <Grid container spacing={2}>
        <Grid xs={12} sm={12} md={5} item>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
            <SupportServiceDetails />
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default SupportServiceDetailsContainer;
