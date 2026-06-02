import { Box, Grid } from "@mui/material";
import { useLocation, useNavigate, useParams } from "react-router";
import { useTranslation } from "react-i18next";
import { useContext, useEffect, useState } from "react";
import RatingComponent from "../../../../components/RatingComponent/RatingComponent";
import useAuthorization from "../../../../components/UserComponents/useAuthorization";
import { CommonDataContext } from "../../../../common/contexts/CommonDataContext";
import OrganizationOverviewCard from "../../Components/StateGovDashboardComponents/OrganizationOverviewCard";
import MoodImprovement from "./MoodImprovement";
import InterventionProgressMetrics from "./InterventionProgressMetrics";
import {
  BreadcrumbsLinkThriveScale,
  BreadcrumbsLinkThriveScaleGovtDashboard,
  DecryptId,
  getNavbarFilterPayload,
} from "../../../../constants";
import APIS from "../../../../common/hooks/UseApiCalls";
import PageBreadcrumbs from "../../../../components/PageBreadcrumbs/PageBreadcrumbs";

const InterventionDetailPage = () => {
  const navigate = useNavigate();
  const { t } = useTranslation(["common"]);
  const {
    navbarFilterValues,
    linkedAccounts,
    signedinOrgType,
    signedinUserRoleHT,
  } = useContext(CommonDataContext);
  const [loadingOverviewCounts, setLoadingOverviewCounts] = useState(false);
  const [apiError, setApiError] = useState(false);
  const { id } = useParams();

  const decryptedId = DecryptId(id);

  const { state: milestoneData } = useLocation();
  const milestone = milestoneData?.milestone;
  useAuthorization(
    signedinUserRoleHT,
    null,
    signedinOrgType,
    "GOVTDashboardInterventions",
    true
  );
  useEffect(() => {
    document.title = "Interventions | ThriveWell";
  }, []);

  const [data, setData] = useState([]);

  const fetchData = async () => {
    setLoadingOverviewCounts(true);
    setApiError(false);
    try {
      const payload = {
        ...getNavbarFilterPayload(navbarFilterValues, linkedAccounts),
        ...(signedinOrgType !== "6" ? { accountFilter: [localStorage.getItem("orgId")] } : {}),
        milestoneNameFilter: milestone,
        interventionNameFilter: decryptedId,
      };
      if (payload.countryFilter === null) {
        return;
      }
      const response = await APIS.GetInterventionSummary(payload);
      if (response.data && response.data.data) {
        const overviewData = response.data.data;
        const dataArr = [
          {
            label: (
              <RatingComponent
                rating={
                  overviewData?.overallRatingData?.overallRatingScore || 0
                }
                readOnly={true}
              />
            ),
            value: t("common:infoCard.Overall rating", "Overall rating"),
            subtitle: `${
              overviewData?.overallRatingData?.overallRatingScore || 0
            }/5, ${overviewData?.overallRatingData?.completionScore}% ${t(
              "common:infoCard.completed",
              "completed"
            )}`,
          },
          // Only add improvement if both modes are not UNKNOWN
          ...(overviewData?.averageImprovementData?.firstMode?.toUpperCase() !==
            "UNKNOWN" &&
          overviewData?.averageImprovementData?.lastMode?.toUpperCase() !==
            "UNKNOWN"
            ? [
                {
                  label: generateModeChangeLabel(
                    overviewData?.averageImprovementData?.firstMode?.toUpperCase(),
                    overviewData?.averageImprovementData?.lastMode?.toUpperCase()
                  ),
                  value: (
                    <MoodImprovement
                      fromEmoji={overviewData?.averageImprovementData?.firstMode?.toUpperCase()}
                      toEmoji={
                        overviewData?.averageImprovementData?.lastMode?.toUpperCase() !==
                        "UNKNOWN"
                          ? "UNKNOWN"
                          : overviewData?.averageImprovementData?.lastMode?.toUpperCase()
                      }
                    />
                  ),
                  subtitle: t(
                    "common:infoCard.Average improvement",
                    "Average improvement"
                  ),
                },
              ]
            : []),
          {
            label: t(
              "common:infoCard.This intervention is assigned to {{count}}% of all cases",
              {
                count: overviewData?.assignedCasesData,
                defaultValue:
                  "This intervention is assigned to {{count}}% of all cases",
              }
            ),
            value: `${overviewData?.assignedCasesData}%`,
            subtitle: t("common:infoCard.Assigned cases", "Assigned cases"),
          },
        ];
        setData(dataArr);
      }
    } catch (error) {
      setApiError(true);
      console.error("Error fetching organizational overview data:", error);
    } finally {
      setLoadingOverviewCounts(false);
    }
  };

  const defaultCategories = [
    {
      label: "Incrisis",
      key: "inCrisisPercent",
      //   color: colorMap["In crisis"],
    },
    {
      label: "Vulnerable",
      key: "vulnerablePercent",
      // color: colorMap["Vulnerable"],
    },
    {
      label: "Safe",
      key: "safePercent",
      // color: colorMap["Safe"],
    },
    {
      label: "Thriving",
      key: "thrivingPercent",
      //   color: colorMap["Thriving"],
    },
  ];

  const generateModeChangeLabel = (firstMode, lastMode) => {
    if (firstMode && lastMode) {
      const startMode = firstMode;
      const endMode = lastMode;

      if (lastMode === "UNKNOWN")
        return t(
          "common:infoCard.There are not enough completed assessments to determine improvement. Check back later!",
          "There are not enough completed assessments to determine improvement. Check back later!."
        );

      const startIndex = defaultCategories.findIndex(
        (cat) => cat.label.toUpperCase() === startMode?.toUpperCase()
      );
      const endIndex = defaultCategories.findIndex(
        (cat) => cat.label.toUpperCase() === endMode?.toUpperCase()
      );
      if (startIndex === -1 || endIndex === -1) return "";

      const ratingDifference = endIndex - startIndex;
      if (ratingDifference > 0) {
        return t(
          "common:infoCard.This intervention improves milestones an average of {{count}} rating level(s)",
          {
            count: ratingDifference,
            defaultValue:
              "This intervention improves milestones an average of {{count}} rating level(s)",
          }
        );
      } else if (ratingDifference === 0) {
        return t(
          "common:infoCard.This intervention has no effect on the average milestone rating level",
          "This intervention has no effect on the average milestone rating level."
        );
      } else {
        return t(
          "common:infoCard.This intervention does not improve the average milestone rating level.",
          "This intervention does not improve the average milestone rating level."
        );
      }
    }
  };

  useEffect(() => {
    document.title = "Interventions | ThriveWell";
  }, []);

  useEffect(() => {
    if (localStorage.getItem("userRegion") && signedinOrgType) {
      fetchData();
    }
  }, [localStorage.getItem("userRegion"), localStorage.getItem("language"), signedinOrgType]);

  

  return (
    <Box
      sx={{
        m: 3,
      }}
    >
      <PageBreadcrumbs
        data={[
          signedinOrgType === "6" ? BreadcrumbsLinkThriveScaleGovtDashboard(t, navigate) : BreadcrumbsLinkThriveScale(t, navigate),
          {
            label: t("common:common.Interventions"),
            onClick: () => navigate("/governmentDashboardInterventions"),
          },
          {
            label: decryptedId,
          },
        ]}
      />
      <Grid
        mt={2}
        container
        spacing={2}
        alignItems="stretch"
        sx={{ minHeight: 1 }}
      >
        <Grid
          item
          xs={12}
          md={12}
          sx={{ display: "flex", flexDirection: "column" }}
        >
          <Box sx={{ flex: 1, display: "flex", flexDirection: "column" }}>
            <OrganizationOverviewCard
              data={data}
              loading={loadingOverviewCounts}
              title={t("common:infoCard.Summary", "Summary")}
              apiError={apiError}
              onReload={() => {fetchData()}}
            />
          </Box>
        </Grid>
        <Grid
          item
          xs={12}
          md={6}
          sx={{ display: "flex", flexDirection: "column" }}
        >
          <Box sx={{ flex: 1, display: "flex", flexDirection: "column" }}>
            <InterventionProgressMetrics />
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default InterventionDetailPage;
