import { Box, Grid } from "@mui/material";
import React, { useContext, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import PageBreadcrumbs from "../../../../components/PageBreadcrumbs/PageBreadcrumbs";
import { BreadcrumbsLinkThriveScale, BreadcrumbsLinkThriveScaleGovtDashboard } from "../../../../constants";
import { useTranslation } from "react-i18next";
import CurrentStatus from "./CurrentStatus";
import MilestoneSummary from "./MilestoneSummary";
import MilestoneRatingsTrendByAssessment from "./MilestoneRatingsTrendByAssessment";
import MilestoneInterventions from "./MilestoneInterventions";
import OrganizationsApplied from "./OrganizationsApplied";
import { CommonDataContext } from "../../../../common/contexts/CommonDataContext";
import useAuthorization from "../../../../components/UserComponents/useAuthorization";

const MilestoneDetails = () => {
  const { id } = useParams();
  // Example decryption function (replace with your actual logic)
  const decryptId = (encryptedId) => {
    try {
      return decodeURIComponent(atob(encryptedId));
    } catch (e) {
      return "";
    }
  };
    const { signedinOrgType, signedinUserRoleHT } = useContext(CommonDataContext);
    useEffect(() => {
      document.title = "Milestones | ThriveWell";
    }, []);
  
    useAuthorization(
      signedinUserRoleHT,
      null,
      signedinOrgType,
      "GOVTDashboardMilestones",
      true
    );

  const [summaryMilestones, setSummaryMilestones] = useState([]);

  const decryptedId = decryptId(id);
  const navigate = useNavigate();
  const { t } = useTranslation(["common"]);

  useEffect(() => {
    document.title = "Milestones | ThriveWell";
  }, []);

  return (
    <Box
      sx={{
        m: 3, // Increased margin slightly
      }}
    >
      <PageBreadcrumbs
        data={[
          signedinOrgType === "6" ? BreadcrumbsLinkThriveScaleGovtDashboard(t, navigate) : BreadcrumbsLinkThriveScale(t, navigate),
          {
            label: t("common:common.Milestones", "Milestones"),
            onClick: () => navigate("/governmentDashboardMilestones"),
          },
          {
            label: decryptedId,
          },
        ]}
      />
      <Box display="flex" flexDirection="column" gap={2} mt={2}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <CurrentStatus />
          </Grid>
          <Grid item xs={12} sm={4} md={3}>
            <MilestoneSummary summaryMilestones={summaryMilestones} />
          </Grid>
          <Grid item xs={12} sm={8} md={9}>
            <MilestoneRatingsTrendByAssessment setSummaryMilestones={setSummaryMilestones} />
          </Grid>
          <Grid item xs={12} md={6}>
            <MilestoneInterventions />
          </Grid>
          <Grid item xs={12} md={6}>
            <OrganizationsApplied />
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

export default MilestoneDetails;
