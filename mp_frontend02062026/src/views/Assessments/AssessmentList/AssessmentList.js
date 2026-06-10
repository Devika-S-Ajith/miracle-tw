import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Grid,
} from "@mui/material";
import { useTranslation } from "react-i18next";
import useAuthorization from "../../../components/UserComponents/useAuthorization";
import ConsolidatedAssessmentProgressReport from "../../../components/ConsolidatedAssessmentProgressReport";
import PageBreadcrumbs from "../../../components/PageBreadcrumbs/PageBreadcrumbs";
import { BreadcrumbsLinkThriveScale } from "../../../constants";
import PageLoader from "../../../components/UserComponents/PageLoader";

const AssessmentList = () => {
  const navigate = useNavigate();
  const { t } = useTranslation(["common"])   
  const { authStatus, checkAuth } = useAuthorization("Assessment");

   useEffect(() => {
    document.title = "Assessments | ThriveWell";
    checkAuth();
  }, []); // Only runs once on mount, or based on your specific logic

  if (authStatus === 'loading' || authStatus === 'idle') {
    return <PageLoader />;
  }

  if (authStatus === 'unauthorized') {
    return null; // Or a custom message
  }

  return (
    <>
      <Box
        sx={{
          backgroundColor: "background.default",
          minHeight: "100%",
          pt: 2,
        }}
      >
        <Grid container width={1}>
          <Grid item xs={12}>
            <PageBreadcrumbs
              data={[
                BreadcrumbsLinkThriveScale(t, navigate),
                {
                  label: t("common:common.Assessments & Progress Reports", "Assessments & Progress Reports"),
                },
              ]}
            />

            <Box mt={2} mr>
              <ConsolidatedAssessmentProgressReport pageType="ASSESSMENT" />
            </Box>
          </Grid>
        </Grid>
      </Box>
    </>
  );
};

export default AssessmentList;
