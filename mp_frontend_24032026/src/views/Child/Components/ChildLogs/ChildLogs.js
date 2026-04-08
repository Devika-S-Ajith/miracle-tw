import React from "react";
import { Grid } from "@mui/material";
import ConsolidatedLogsList from "./ConsolidatedLogsList";

const ChildLogs = ({ module, showForChild }) => {
  return (
    <Grid container spacing={2}>
      <Grid xs={12} item>
        <ConsolidatedLogsList module={module} showForChild={showForChild} />
      </Grid>
    </Grid>
  );
};

export default ChildLogs;
