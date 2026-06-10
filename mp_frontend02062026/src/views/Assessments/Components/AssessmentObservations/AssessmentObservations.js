import React from "react";
import { useTranslation } from "react-i18next";
import { Typography, Grid } from "@mui/material";
import { ObservationTextField } from "./ObservationTextField";

function AssessmentObservations({
  observationData,
  CustomTextField,
  observationValues,
  handleBlur,
  handleChange,
}) {
  const { t } = useTranslation(["common"]);

  return (
    <>
      <Typography color="black" variant="h6" textAlign="center">
        {t("common:assessment.Observations")}
      </Typography>
      <Typography color="textSecondary" variant="subtitle1">
        {t("common:assessment.The following observations have been made")}
      </Typography>

      <hr style={{ width: "100%", borderTop: "1px solid #ccc" }} />

      <Grid item md={12} xs={12} sx={{ mt: 2 }}>
        <ObservationTextField
          label={t("common:assessment.Case worker’s thoughts and observations")}
          name="caseworker_thought"
          value={observationValues.caseworker_thought}
          required
          CustomTextField={CustomTextField}
          handleBlur={handleBlur}
          handleChange={handleChange}
        />
        <ObservationTextField
          label={t("common:assessment.Caregiver’s thoughts")}
          name="caregiver_thought"
          value={observationValues.caregiver_thought}
          required
          CustomTextField={CustomTextField}
          handleBlur={handleBlur}
          handleChange={handleChange}
        />
        <ObservationTextField
          label={t("common:assessment.Child’s thoughts")}
          name="child_thought"
          value={observationValues.child_thought}
          required
          CustomTextField={CustomTextField}
          handleBlur={handleBlur}
          handleChange={handleChange}
        />
        <ObservationTextField
          label={t("common:assessment.Placement recommendations (optional)")}
          name="placement_recommendations"
          value={observationValues.placement_recommendations}
          CustomTextField={CustomTextField}
          handleBlur={handleBlur}
          handleChange={handleChange}
        />
      </Grid>
    </>
  );
}

export default AssessmentObservations;
