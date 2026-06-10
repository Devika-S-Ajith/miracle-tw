import React from "react";
import { useTranslation } from "react-i18next";
import { Grid, Box, Typography } from "@mui/material";
import { calculateAge } from "../../../../helpers/helperFunction";

function AssessmentChildDetails({ caseDetails }) {
  
  const { t } = useTranslation(["common"]);
  const ASSESSMENT_TYPE = caseDetails?.type;
  const isFamily = ASSESSMENT_TYPE === "FAMILY" || false;
  const isChild = ASSESSMENT_TYPE === "CHILD" || false;

  const getCaseData = (type) => {
    let options = {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    };
    if (caseDetails && Object.keys(caseDetails).length !== 0) {
      switch (type) {
        case "id": {
          return caseDetails?.type+"-"+caseDetails?.Id;
        }
        case "familyCode": {
          return caseDetails?.type+"-"+caseDetails?.familyCode;
        }
        case "age": {
          return calculateAge(caseDetails?.childbirthDate,t);
        }
        case "gender": {
          return caseDetails?.childGender;
        }
        case "name": {
          return isFamily ? caseDetails?.familyName : caseDetails?.childName;
        }
        case "caseWorkerName": {
          return caseDetails?.caseworkerName;
        }
        case "lastDate": {
          return caseDetails?.lastAsessmentDate.toLocaleDateString(
            "en-US",
            options
          );
        }
        case "HouseholdType": {
          return caseDetails?.familyType || '-';
        }
        case "HOH": {
          return caseDetails?.primaryContact;
        }
        default: {
          return "--";
        }
      }
    }
  };

  return (
    <>
      {caseDetails?.Id &&
        caseDetails &&
        Object.keys(caseDetails).length !== 0 && (
          <Grid container spacing={2}>
            <Grid item lg={6} md={6} sm={12} xs={12}>
              <Box
                sx={{ backgroundColor: "#f0f0f0", borderRadius: 2, padding: 2 }}
              >
                <Typography color="textPrimary" variant="subtitle2">
                {isFamily ? t("common:common.Family ID"):t("common:common.Child ID")}
                </Typography>
                <Typography variant="h6">{getCaseData(isFamily ? "familyCode" : "id")}</Typography>
              </Box>
            </Grid>
            <Grid item lg={6} md={6} sm={12} xs={12}>
              <Box
                sx={{ backgroundColor: "#f0f0f0", borderRadius: 2, padding: 2 }}
              >
                <Typography color="textPrimary" variant="subtitle2">
                 {isFamily ? t("common:common.Family Name") : t("common:assessment.Child Name")  }
                </Typography>
                <Typography variant="h6">{getCaseData("name")}</Typography>
              </Box>
            </Grid>
          {
            isChild && <>
              <Grid item lg={6} md={6} sm={12} xs={12}>
                <Box
                  sx={{ backgroundColor: "#f0f0f0", borderRadius: 2, padding: 2 }}
                >
                  <Typography color="textPrimary" variant="subtitle2">
                    {t("common:common.Age")}
                  </Typography>
                  <Typography variant="h6">{getCaseData("age")}</Typography>
                </Box>
              </Grid>
              <Grid item lg={6} md={6} sm={12} xs={12}>
                <Box
                  sx={{ backgroundColor: "#f0f0f0", borderRadius: 2, padding: 2 }}
                >
                  <Typography color="textPrimary" variant="subtitle2">
                    {t("common:common.Gender")}
                  </Typography>
                  <Typography variant="h6">{getCaseData("gender")}</Typography>
                </Box>
              </Grid>
            </>
          }
          {
            isFamily && <>
              <Grid item lg={6} md={6} sm={12} xs={12}>
                <Box
                  sx={{ backgroundColor: "#f0f0f0", borderRadius: 2, padding: 2 }}
                >
                  <Typography color="textPrimary" variant="subtitle2">
                    {t("common:family.Family type")}
                  </Typography>
                  <Typography variant="h6">{getCaseData("HouseholdType")}</Typography>
                </Box>
              </Grid>
              <Grid item lg={6} md={6} sm={12} xs={12}>
                <Box
                  sx={{ backgroundColor: "#f0f0f0", borderRadius: 2, padding: 2 }}
                >
                  <Typography color="textPrimary" variant="subtitle2">
                    {t("common:common.Primary contact")}
                  </Typography>
                  <Typography variant="h6">{getCaseData("HOH")}</Typography>
                </Box>
              </Grid>
            </>
          }
            <Grid item lg={6} md={6} sm={12} xs={12}>
              <Box
                sx={{ backgroundColor: "#f0f0f0", borderRadius: 2, padding: 2 }}
              >
                <Typography color="textPrimary" variant="subtitle2">
                  {t("common:common.Case Worker")}
                </Typography>
                <Typography variant="h6">
                  {getCaseData("caseWorkerName")}
                </Typography>
              </Box>
            </Grid>
            {caseDetails.is_complete && 
              <Grid item lg={6} md={6} sm={12} xs={12}>
                <Box
                  sx={{
                    backgroundColor: "#f0f0f0",
                    borderRadius: 2,
                    padding: 2,
                  }}
                >
                  <Typography color="textPrimary" variant="subtitle2">
                    {t("common:assessment.Assessment Submission Date")}
                  </Typography>
                  <Typography variant="h6">
                    {caseDetails.is_complete ? caseDetails.updatedAt : ""}
                  </Typography>
                </Box>
              </Grid>}
          </Grid>
        )}
    </>
  );
}

export default AssessmentChildDetails;
