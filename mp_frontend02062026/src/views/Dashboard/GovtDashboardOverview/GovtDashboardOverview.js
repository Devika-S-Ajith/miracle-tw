import { Box, Grid } from "@mui/material";
import React, { useCallback, useContext, useEffect } from "react";
import { useNavigate, useParams} from "react-router";
import { useTranslation } from "react-i18next";
import OrganizationalOverview from "./OrganizationalOverview";
import AverageThriveScaleScores from "./AverageThriveScaleScores";
import NavbarFilterChipArray from "./NavbarFilterChipArray";
import DomainScoreByAssessment from "./DomainScoreByAssessment";
import RedflagOverview from "./RedflagOverview";
import { CommonDataContext } from "../../../common/contexts/CommonDataContext";
import useAuthorization from "../../../components/UserComponents/useAuthorization";
import PageBreadcrumbs from "../../../components/PageBreadcrumbs/PageBreadcrumbs";
import {
  BreadcrumbsLinkThriveScaleGovtDashboard,
} from "../../../constants";
import APIS from "../../../common/hooks/UseApiCalls";
import { useLocation } from "react-router-dom";

const GovtDashboardOverview = () => {
  const navigate = useNavigate();
  const { t } = useTranslation(["common"]);
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const { id } = useParams();
  const accountName = params.has("accountName") ? params.get("accountName") : null;
  const { signedinUserRoleHT, signedinOrgType } = useContext(CommonDataContext);
  // Authorization check
  useAuthorization(signedinUserRoleHT, null, signedinOrgType, "GOVTOverview", true);
    
  const UpdateDashboardDataViews = useCallback(async () => {
    try {
      await APIS.UpdateDashboardDataViews();
    } catch (error) {
      console.error("UpdateDashboardDataViews error:", error);
    }
  }, []);

  useEffect(() => {
    document.title = "Dashboard | ThriveWell";
    UpdateDashboardDataViews()
  }, []);

  return (
    <Box
      sx={{
        mt: 2,
      }}
    >
      <Box px={2}>
        <PageBreadcrumbs
          data={[
            BreadcrumbsLinkThriveScaleGovtDashboard(t, navigate),
            {
              label: id ? t("common:common.Organizations", "Organizations") : t("common:common.Overview", "Overview"),
            },
            ...(accountName ? [{ label: accountName }] : [])
          ]}
        />
      </Box>

      <NavbarFilterChipArray />
      <Grid
        p={2}
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
            <OrganizationalOverview />
          </Box>
        </Grid>
        {/* Spacer grid for margin on medium+ screens */}
        <Grid
          item
          xs={12}
          md={7}
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
            {/* Content for second grid */}
            <AverageThriveScaleScores />
          </Box>
        </Grid>
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
            <RedflagOverview />
          </Box>
        </Grid>
        <Grid
          item
          xs={12}
          md={7}
          sx={{ display: "flex", flexDirection: "column" }}
        >
          <Box sx={{ flex: 1, display: "flex", flexDirection: "column" }}>
            {/* Content for second grid */}
            <DomainScoreByAssessment />
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default GovtDashboardOverview;
