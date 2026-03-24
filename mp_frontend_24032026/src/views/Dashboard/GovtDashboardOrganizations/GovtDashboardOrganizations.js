
import { Box, Grid,Typography } from "@mui/material";
import { useNavigate } from "react-router";
import { useTranslation } from "react-i18next";
import ChevronRightIcon from "../../../assets/icons/ChevronRight";
import NavbarFilterChipArray from "../GovtDashboardOverview/NavbarFilterChipArray";
import OrganizationOverviewCard from "../Components/StateGovDashboardComponents/OrganizationOverviewCard";
import AllOrganizationListing from "./Components/AllOrganizationListing";
import { useCallback, useContext, useEffect, useState } from "react";
import { CommonDataContext } from "../../../common/contexts/CommonDataContext";
import APIS from "../../../common/hooks/UseApiCalls";
import { getNavbarFilterPayload } from "../../../constants";
import useAuthorization from "../../../components/UserComponents/useAuthorization";


const GovtDashboardOrganizations = () => {
    const navigate = useNavigate();
    const { t } = useTranslation(["common"]);
    const { navbarFilterValues, linkedAccounts,signedinOrgType,signedinUserRoleHT } = useContext(CommonDataContext);
    const [loadingOverviewCounts, setLoadingOverviewCounts] = useState(false);
    const [apiError, setApiError] = useState(false);
   
    useAuthorization(signedinUserRoleHT, null, signedinOrgType, 'GOVTDashboard', true)

    const [data, setData] = useState([
        {
          label: t("common:infoCard.Total # of active orgs"),
          value: 0,
        },
        {
          label: t("common:infoCard.Total # of active children"),
          value: 0,
        },
        {
          label: t("common:infoCard.New children (last 30 days)"),
          value: 0,
        },
        {
          label: t("common:infoCard.Total # of active families"),
          value: 0,
        },
        {
          label: t("common:infoCard.New families (last 30 days)"),
          value: 0,
        },
      ]);
    
      const fetchData = async () => {
        setLoadingOverviewCounts(true);
        setApiError(false);
        try {
          const payload = getNavbarFilterPayload(navbarFilterValues, linkedAccounts);
          const response = await APIS.GetGovtDashboardOrganizationOverview(payload);
          if (response.data && response.data.data) {
            const overviewData = response.data.data;
            setData([
              {
                label: t("common:infoCard.Total # of active orgs"),
                value: overviewData.total_active_org || 0,
              },
              {
                label: t("common:infoCard.Total # of active children"),
                value: overviewData.total_active_children || 0,
              },
              {
                label: t("common:infoCard.New children (last 30 days)"),
                value: overviewData.new_children_last_30 || 0,
              },
              {
                label: t("common:infoCard.Total # of active families"),
                value: overviewData.total_active_families || 0,
              },
              {
                label: t("common:infoCard.New families (last 30 days)"),
                value: overviewData.new_families_last_30 || 0,
              },
            ]);
          }
        } catch (error) {
            setApiError(true);
          console.error("Error fetching organizational overview data:", error);
        } finally {
          setLoadingOverviewCounts(false);
        }
      };
    
  useEffect(() => {
    document.title = "Organization | ThriveWell";
    UpdateDashboardDataViews()
    if (localStorage.getItem("userRegion")) {
      fetchData();
    }
  }, [navbarFilterValues, t, localStorage.getItem("userRegion")]);

     
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
            <Grid container width={1}>
                <Grid item xs={12} sx={{ mr: 1 }}>
                    <Grid container justifyContent="space-between" spacing={3}>
                        <Grid
                            item
                            sx={{
                                display: "flex",
                                flexDirection: "row",
                                mx: 2,
                                flexWrap: "wrap",
                            }}
                        >
                            <Typography
                                color="textPrimary"
                                variant="h5"
                                onClick={() => navigate("/governmentDashboardOverview")}
                                sx={{ cursor: "pointer" }}
                            >
                                {t("common:common.Thrive Scale")}
                            </Typography>
                            <Box
                                sx={{
                                    m: 0.75,
                                }}
                                style={{ cursor: "text" }}
                            >
                                <ChevronRightIcon color="disabled" fontSize="small" />
                            </Box>
                            <Typography color="textPrimary" variant="h5">
                                {t("common:common.Organizations")}
                            </Typography>
                        </Grid>
                    </Grid>
                </Grid>
            </Grid>
            <NavbarFilterChipArray />
            <Grid
                p={2}
                container
                spacing={2}
                alignItems="stretch"
                sx={{ minHeight: 1 }}
            >
                <Grid item xs={12} md={12} sx={{ display: "flex", flexDirection: "column" }}>
                    <Box sx={{ flex: 1, display: "flex", flexDirection: "column" }}>
                        <OrganizationOverviewCard data={data} loading={loadingOverviewCounts}
                            title={t("common:infoCard.All organization overview","All organization overview")} apiError={apiError} onReload={fetchData}/>
                    </Box>
                </Grid>
                {/* Spacer grid for margin on medium+ screens */}
                <Grid item xs={12} md={12} sx={{ display: "flex", flexDirection: "column" }}>
                    <Box sx={{ flex: 1, display: "flex", flexDirection: "column" }}>
                       <AllOrganizationListing />
                    </Box>
                </Grid>
            </Grid>
        </Box>
    );

};

export default GovtDashboardOrganizations;