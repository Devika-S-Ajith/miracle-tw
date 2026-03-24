import React from "react";
import {
  Grid,
} from "@mui/material";
import SpiderChart from "../SpiderChart";

function AssessmentSummary({ score, domains}) {

  const getRadarChartScore = () => {
    // Use the order of the domains prop
    const radarScore = (domains || []).map(domain => {
      const item = score && score.questionDomains && score.questionDomains.find(item => String(item.HTQuestionDomainId) === String(domain.id));
      return item ? { axis: domain.domainName, value: item.totalScoreInPercentage } : { axis: domain.domainName, value: null };
    });
    return radarScore;
  }

  return (
    <Grid container spacing={2}  sx={{ justifyContent: "center", alignContent: "center" ,display: "flex" }}>
      <Grid
        item
        xl={7}
        lg={9}
        md={12}
        sm={12}
        xs={12}
      >
         <SpiderChart data={getRadarChartScore()} />
      </Grid>
    </Grid>
  );
}

export default AssessmentSummary;
