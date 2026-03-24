import { Box, Grid } from "@mui/material";
import ActiveRedFlagMilestones from "../GovtDashboardOverview/ActiveRedFlagMilestones";
import RedFlagMilestonesByDomain from "../GovtDashboardOverview/RedFlagMilestonesByDomain";

const AverageDomainScores = () => {
  return (
    <Grid
      container
      spacing={2}
      alignItems="stretch"
      sx={{ minHeight: 1, height: "100%" }}
    >
      <Grid
        item
        xs={12}
        md={4}
        sx={{ display: "flex", flexDirection: "column" }}
      >
        <Box
          sx={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            height: "100%",
          }}
        >
          <ActiveRedFlagMilestones />
        </Box>
      </Grid>
      <Grid
        item
        xs={12}
        md={8}
        sx={{ display: "flex", flexDirection: "column" }}
      >
        <Box sx={{ flex: 1, display: "flex", flexDirection: "column" }}>
          <RedFlagMilestonesByDomain />
        </Box>
      </Grid>
    </Grid>
  );
};

export default AverageDomainScores;
