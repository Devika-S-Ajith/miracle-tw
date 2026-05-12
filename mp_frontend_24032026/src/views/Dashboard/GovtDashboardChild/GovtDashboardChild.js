import { Box, Grid } from "@mui/material";
import { useNavigate } from "react-router";
import { useTranslation } from "react-i18next";
import NavbarFilterChipArray from "../GovtDashboardOverview/NavbarFilterChipArray";
import { useContext } from "react";
import { CommonDataContext } from "../../../common/contexts/CommonDataContext";
import useAuthorization from "../../../components/UserComponents/useAuthorization";
import PageBreadcrumbs from "../../../components/PageBreadcrumbs/PageBreadcrumbs";
import { BreadcrumbsLinkThriveScaleGovtDashboard } from "../../../constants";
import AllChildrenSixMonths from "./Components/AllChildrenSixMonths";
import IncrisisAndVulnerableMilestonesChildren from "./Components/IncrisisAndVulnerableMilestoneChildren";
import CurrentLivingConditionOverview from "./Components/CurrentLivingConditionOverview";



const GovtDashboardFamily = () => {
    const navigate = useNavigate();
    const { t } = useTranslation(["common"]);
    const {
        navbarFilterValues,
        linkedAccounts,
        signedinOrgType,
        signedinUserRoleHT,
    } = useContext(CommonDataContext);

    useAuthorization(
        signedinUserRoleHT,
        null,
        signedinOrgType,
        "GOVTDashboard",
        true
    );



    //   useEffect(() => {
    //     UpdateDashboardDataViews()
    //   }, [navbarFilterValues, t, localStorage.getItem("userRegion")]);

    //   const UpdateDashboardDataViews = useCallback(async () => {
    //     try {
    //       await APIS.UpdateDashboardDataViews();
    //     } catch (error) {
    //       console.error("UpdateDashboardDataViews error:", error);
    //     }
    //   }, []);

    return (
        <Box
            sx={{
                mt: 2,
            }}
        >
            <Box px>
                <PageBreadcrumbs
                    data={[
                        {
                            label: t("common:common.Children", "Children"),
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
                    lg={6}
                    sx={{ display: "flex", flexDirection: "column" }}
                >
                    <Box sx={{ flex: 1, display: "flex", flexDirection: "column" }}>
                       <AllChildrenSixMonths />
                    </Box>
                </Grid>
                <Grid
                    item
                    xs={12}
                    md={12}
                    lg={6}
                    sx={{ display: "flex", flexDirection: "column" }}
                >
                    <Box sx={{ flex: 1, display: "flex", flexDirection: "column" }}>
                      <IncrisisAndVulnerableMilestonesChildren />
                    </Box>
                </Grid>
                <Grid
                    item
                    xs={12}
                    md={12}
                    sx={{ display: "flex", flexDirection: "column" }}
                >
                    <Box sx={{ flex: 1, display: "flex", flexDirection: "column" }}>
                        <CurrentLivingConditionOverview />
                    </Box>
                </Grid>
            </Grid>
        </Box>
    );
};

export default GovtDashboardFamily;
