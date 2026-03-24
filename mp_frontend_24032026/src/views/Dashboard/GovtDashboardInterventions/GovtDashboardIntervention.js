import { Box, Grid } from "@mui/material";
import { useNavigate } from "react-router";
import { useTranslation } from "react-i18next";
import NavbarFilterChipArray from "../GovtDashboardOverview/NavbarFilterChipArray";
import OrganizationOverviewCard from "../Components/StateGovDashboardComponents/OrganizationOverviewCard";
import { useCallback, useContext, useEffect, useState } from "react";
import { CommonDataContext } from "../../../common/contexts/CommonDataContext";
import APIS from "../../../common/hooks/UseApiCalls";
import {
  BreadcrumbsLinkThriveScale,
  BreadcrumbsLinkThriveScaleGovtDashboard,
  getNavbarFilterPayload,
} from "../../../constants";
import useAuthorization from "../../../components/UserComponents/useAuthorization";
import RatingComponent from "../../../components/RatingComponent/RatingComponent";
import AllInterventions from "./Components/AllInterventions";
import PageBreadcrumbs from "../../../components/PageBreadcrumbs/PageBreadcrumbs";

const GovtDashboardMilestones = () => {
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

  useAuthorization(
    signedinUserRoleHT,
    null,
    signedinOrgType,
    "GOVTDashboardInterventions",
    true
  );

  const [data, setData] = useState([]);

  const fetchData = async () => {
    setLoadingOverviewCounts(true);
    setApiError(false);
    try {
      const payload = {
        ...getNavbarFilterPayload(navbarFilterValues, linkedAccounts),
        ...(signedinOrgType !== "6" ? { accountFilter: [localStorage.getItem("orgId")] } : {}),
      };
      //Adding null check for countryFilter
      if (payload.countryFilter === null) {
        setLoadingOverviewCounts(false);
        return;  // Early return
      }

      const response = await APIS.GetBestAndWorstInterventions(payload);
      if (response.data && response.data.data) {
        const overviewData = response.data.data;
        if (overviewData) {
          setData(
            overviewData.map((item) => {
              return {
                value: (
                  <RatingComponent
                    rating={item.average_rating}
                    readOnly={true}
                  />
                ),
                label: item.intervention,
              };
            })
          );
        }
      }
    } catch (error) {
      setApiError(true);
      console.error("Error fetching organizational overview data:", error);
    } finally {
      setLoadingOverviewCounts(false);
    }
  };

  useEffect(() => {
    UpdateDashboardDataViews();
    if (localStorage.getItem("userRegion") && signedinOrgType) {
      fetchData();
    }
  }, [navbarFilterValues, t, localStorage.getItem("userRegion"), signedinOrgType]);

  const UpdateDashboardDataViews = useCallback(async () => {
    try {
      await APIS.UpdateDashboardDataViews();
    } catch (error) {
      console.error("UpdateDashboardDataViews error:", error);
    }
  }, []);

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
              label: t("common:common.Interventions", "Interventions"),
            },
          ]}
        />
      </Box>
      <NavbarFilterChipArray />
      <Grid
        py={2}
        px={1}
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
              title={t(
                "common:infoCard.Best and worst interventions",
                "Best and worst interventions"
              )}
              apiError={apiError}
              onReload={fetchData}
            />
          </Box>
        </Grid>
        <Grid
          item
          xs={12}
          md={12}
          sx={{ display: "flex", flexDirection: "column" }}
        >
          <Box sx={{ flex: 1, display: "flex", flexDirection: "column" }}>
            <AllInterventions />
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default GovtDashboardMilestones;
