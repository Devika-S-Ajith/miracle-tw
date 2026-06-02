import React from "react";
import CommonCard from "../../../../components/CommonCard/CommonCard";
import { Grid } from "@mui/material";
import InfoTile from "../../../../components/InfoTile/InfoTile";
import InterventionIcon from "../../../../assets/icons/InterventionIcon";

const InterventionsSummary = () => {
  return (
    <CommonCard title="Interventions summary">
      <Grid container spacing={2} pt>
        <Grid item xs={6}>
          <InfoTile
            bgcolor="#E2F4F7"
            title={4}
            description="Active interventions"
            icon={<InterventionIcon style={{ verticalAlign: "middle" }} />}
          />
        </Grid>
        <Grid item xs={6}>
          <InfoTile
            bgcolor="#F3F7E2"
            title={2}
            description="Resolved interventions"
            icon={<InterventionIcon style={{ verticalAlign: "middle" }} />}
          />
        </Grid>
      </Grid>
    </CommonCard>
  );
};

export default InterventionsSummary;
