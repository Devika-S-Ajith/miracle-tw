import React, { useContext, useEffect } from "react";
import { Box } from "@mui/material";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router";
import AverageDomainScores from "./AverageDomainScores";
import AllMilestones from "./AllMilestones";
import TopInCrisis from "./TopInCrisis";
import { BreadcrumbsLinkThriveScale, BreadcrumbsLinkThriveScaleGovtDashboard } from "../../../constants";
import PageBreadcrumbs from "../../../components/PageBreadcrumbs/PageBreadcrumbs";
import NavbarFilterChipArray from "../GovtDashboardOverview/NavbarFilterChipArray";
import { CommonDataContext } from "../../../common/contexts/CommonDataContext";
import useAuthorization from "../../../components/UserComponents/useAuthorization";

const GovtDashboardMilestones = () => {
  const navigate = useNavigate();
  const { t } = useTranslation(["common"]);
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
  return (
    <Box
      sx={{
        mt: 2,
      }}
    >
      <Box px>
        <PageBreadcrumbs
          data={[
          signedinOrgType === "6" ? BreadcrumbsLinkThriveScaleGovtDashboard(t, navigate) : BreadcrumbsLinkThriveScale(t, navigate),
            {
              label: t("common:common.Milestones", "Milestones"),
            },
          ]}
        />
      </Box>
      <NavbarFilterChipArray />
      <Box display="flex" flexDirection="column" gap={2} sx={{ p: 2 }}>
        <TopInCrisis />
        <AverageDomainScores />
        <AllMilestones />
      </Box>

      {/* Add more components or content here as needed */}
    </Box>
  );
};
export default GovtDashboardMilestones;
