import React from "react";
import { useTranslation } from "react-i18next";
import { Grid, Box, Typography } from "@mui/material";

function PreAssessmentDetails({ preAssessmentData, reIntegrationTypeList, visitTypeList }) {
  const { t } = useTranslation(["common"]);
  const ASSESSMENT_TYPE = preAssessmentData?.type;
  const isFamily = ASSESSMENT_TYPE === "FAMILY" || false;
  const isChild = ASSESSMENT_TYPE === "CHILD" || false;

  return (
    <>
      <Grid container spacing={2}>
        {isChild && <Grid item xl={3} lg={6} md={6} sm={12} xs={12}>
          <Box sx={{ backgroundColor: "#f0f0f0", borderRadius: 2, padding: 2 }}>
            <Typography color="textPrimary" variant="subtitle2">
              {t("common:assessment.Did you meet the child")}
            </Typography>
            <Typography variant="h6">{preAssessmentData?.question || "--"}</Typography>
          </Box>
        </Grid>}
        <Grid item xl={3} lg={6} md={6} sm={12} xs={12}>
          <Box sx={{ backgroundColor: "#f0f0f0", borderRadius: 2, padding: 2 }}>
            <Typography color="textPrimary" variant="subtitle2">
              {t("common:assessment.Date of Assessment")}
            </Typography>
            <Typography variant="h6">
              {preAssessmentData?.date_of_assessment || "--"}
            </Typography>
          </Box>
        </Grid>
        {isFamily && <Grid item xl={3} lg={6} md={6} sm={12} xs={12}>
          <Box sx={{ backgroundColor: "#f0f0f0", borderRadius: 2, padding: 2 }}>
            <Typography color="textPrimary" variant="subtitle2">
              {t("common:assessment.FamilyMembersPresent")}
            </Typography>
            <Typography variant="h6">
              {preAssessmentData?.membersPresent || "--"}
            </Typography>
          </Box>
        </Grid>}
        {isChild && <>
          <Grid item xl={3} lg={6} md={6} sm={12} xs={12}>
            <Box sx={{ backgroundColor: "#f0f0f0", borderRadius: 2, padding: 2 }}>
              <Typography color="textPrimary" variant="subtitle2">
                {t("common:assessment.Type of Reintegration")}
              </Typography>
              <Typography variant="h6">
                {(() => {
                  const selectedType = reIntegrationTypeList?.find(
                    (item) => item.id === preAssessmentData?.reintegration_type
                  )?.reIntegrationType;

                  if (selectedType === "Other") {
                    return `${selectedType} - ${preAssessmentData?.other_value}`;
                  }

                  return selectedType || "--";
                })()}
              </Typography>
            </Box>
          </Grid>
          <Grid item xl={3} lg={6} md={6} sm={12} xs={12}>
            <Box sx={{ backgroundColor: "#f0f0f0", borderRadius: 2, padding: 2 }}>
              <Typography color="textPrimary" variant="subtitle2">
                {t("common:assessment.Type of Visit")}
              </Typography>
              <Typography variant="h6">
                {visitTypeList.find(
                  (visitType) => visitType?.id == preAssessmentData?.visit_type
                )?.visitType || "--"}
              </Typography>
            </Box>
          </Grid>
        </>}
        <Grid item md={12} xs={12}>
          <Box sx={{ backgroundColor: "#f0f0f0", borderRadius: 2, padding: 2, maxHeight:"150px", overflow:'auto'  }}>
            <Typography color="textPrimary" variant="subtitle2">
              {t(
                "common:assessment.First notes about the household (optional)"
              )}
            </Typography>
            <Typography variant="h6" sx={{
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
              overflowWrap: "break-word",
            }}>
              {preAssessmentData?.first_notes_household || "--"}
            </Typography>
          </Box>
        </Grid>
      </Grid>
    </>
  );
}

export default PreAssessmentDetails;
