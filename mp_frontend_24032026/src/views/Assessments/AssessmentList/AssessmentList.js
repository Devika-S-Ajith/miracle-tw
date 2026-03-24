import { useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Grid,
} from "@mui/material";
import { useTranslation } from "react-i18next";
import { CommonDataContext } from "../../../common/contexts/CommonDataContext";
import useAuthorization from "../../../components/UserComponents/useAuthorization";
import ConsolidatedAssessmentProgressReport from "../../../components/ConsolidatedAssessmentProgressReport";
import PageBreadcrumbs from "../../../components/PageBreadcrumbs/PageBreadcrumbs";
import { BreadcrumbsLinkThriveScale } from "../../../constants";

const AssessmentList = () => {
  const navigate = useNavigate();
  const { t } = useTranslation(["common"])
  
  const { signedinUserRoleHT, signedinOrgType } =
    useContext(CommonDataContext);
      
  useAuthorization(
    signedinUserRoleHT,
    null,
    signedinOrgType,
    "ManageFamily",
    true
  );

  useEffect(() => {
    document.title = "Assessments | ThriveWell";
  }, []);

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
