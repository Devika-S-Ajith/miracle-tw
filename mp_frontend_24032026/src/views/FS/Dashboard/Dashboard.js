import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Grid,
  Typography,
  Card,
  CardContent,
} from "@mui/material";
import APIS from "../../../common/hooks/UseApiCalls";
import { CommonDataContext } from "../../../common/contexts/CommonDataContext";
import {
  ADMIN,
  ADMIN_CASEMANAGER,
  CASEMANAGER,
  SUPER_ADMIN,
} from "../../../helpers/constant";
import ChevronRightIcon from "../../../assets/icons/ChevronRight";

import LogOverviewList from "../Components/LogOverviewList";
import CountWidgets from "./CountWidgets";
import UpComingVisits from "./UpComingVisits";
import NotificationCountWidget from "./NotificationCountWidget";
import OrganizationListAndCounts from "./OrganisationLIstAndCount";
import useAuthorization from "../../../components/UserComponents/useAuthorization";

const Dashboard = () => {
  const { signedinUserRoleFS, locationList } = useContext(CommonDataContext);
  const navigate = useNavigate();
  const accountId = localStorage.getItem("orgId");
  const [loading, setLoading] = useState(false);
  const [tileData, setTileData] = useState(null);
  const [multiProgressBarData, setMultiProgressBarData] = useState([]);

  useEffect(() => {
    document.title = "Dashboard | ThriveWell";
    //getUserTokens();
  }, []);

  useEffect(async () => {
    getFosterShareCounts();
  }, []);

  useAuthorization(null, signedinUserRoleFS, null, "FSDashboard", false);

  const colorCollection = {
    averageLogs: { label: "Okay", color: "#FEE661" },
    goodLogs: { label: "Good", color: "#CFEE8C" },
    greatLogs: { label: "Great", color: "#89E096" },
    hardDayLogs: { label: "Bad", color: "#ff0000" },
    sosoLogs: { label: "Poor", color: "#FFA44A" },
    incompleteLogs: { label: "Incomplete", color: "#DBE2E7" },
  };

  const getFosterShareCounts = async () => {
    const payload = {
      TWAccountId: [SUPER_ADMIN].includes(signedinUserRoleFS) ? "" : accountId,
      FSCountryId: "2",
      FSUserId: "",
      FSStateId: "",
      FSDistrictId: "",
    };
    try {
      setLoading(true);
      const response = await APIS.DashboardTileDataFS(payload);
      if (response && response.status === 200) {
        setTileData(response?.data?.data);
        setLoading(false);
      }
      const values = Object.entries(
        response?.data?.data?.weeklyLogsSummary
      ).map(([key, value]) => ({
        label: colorCollection[key].label,
        count: value,
        color: colorCollection[key].color,
      }));

      setMultiProgressBarData(values);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  return (
    <>
      <Box
        sx={{
          backgroundColor: "background.default",
          minHeight: "100%",
          mt: 2,
        }}
      >
        <Grid
          item
          sx={{ display: "flex", flexDirection: "row", flexWrap: "wrap" }}
          mx={2}
        >
          <Typography color="textPrimary" variant="h5">
            FosterShare
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
            Dashboard{" "}
          </Typography>
        </Grid>
        <Grid container width={1}>
          <Grid item xs={12}>
            <Grid
              container
              rowSpacing={1}
              columnSpacing={{ xs: 2, sm: 2, md: 2 }}
              sx={{ p: 2 }}
            >
              <Grid
                container
                spacing={2}
                sx={{ p: 2, alignItems: "flex-start" }}
              >
                <Grid
                  item
                  xl={12}
                  md={12}
                  lg={12}
                  xs={12}
                  sm={12}
                  container
                  spacing={2}
                >
                  {[ADMIN_CASEMANAGER, ADMIN].includes(signedinUserRoleFS) && (
                    <Grid item xl={4} lg={4} md={6} xs={12} sm={12} spacing={2}>
                      <CountWidgets
                        icon="/static/icons/user-no-size.svg"
                        title="Number of Case Managers"
                        label="Case Managers"
                        data={tileData?.caseworkerServed}
                      />
                    </Grid>
                  )}
                  {[ADMIN_CASEMANAGER, ADMIN, SUPER_ADMIN].includes(
                    signedinUserRoleFS
                  ) && (
                    <>
                      <Grid
                        item
                        xl={[SUPER_ADMIN].includes(signedinUserRoleFS) ? 6 : 4}
                        lg={[SUPER_ADMIN].includes(signedinUserRoleFS) ? 6 : 4}
                        md={[SUPER_ADMIN].includes(signedinUserRoleFS) ? 6 : 4}
                        xs={12}
                        sm={12}
                        spacing={2}
                      >
                        <CountWidgets
                          title="Number of Families"
                          icon="/static/icons/family-no-size.svg"
                          label="Families"
                          data={tileData?.familyServed}
                          logsCompleted={tileData?.weeklyLogsPercentage || 0}
                          needToShowBar={[SUPER_ADMIN].includes(
                            signedinUserRoleFS
                          )}
                        />
                      </Grid>
                      <Grid
                        item
                        xl={[SUPER_ADMIN].includes(signedinUserRoleFS) ? 6 : 4}
                        lg={[SUPER_ADMIN].includes(signedinUserRoleFS) ? 6 : 4}
                        md={[SUPER_ADMIN].includes(signedinUserRoleFS) ? 6 : 4}
                        xs={12}
                        sm={12}
                        spacing={2}
                      >
                        <CountWidgets
                          title="Number of Children"
                          icon="/static/icons/children-no-size.svg"
                          label="Children"
                          data={tileData?.childrenServed}
                          logSplitData={multiProgressBarData}
                          needToShowMultiBar={[SUPER_ADMIN].includes(
                            signedinUserRoleFS
                          )}
                        />
                      </Grid>
                    </>
                  )}
                  {signedinUserRoleFS === SUPER_ADMIN && (
                    <Grid
                      item
                      xl={12}
                      lg={12}
                      md={12}
                      xs={12}
                      sm={12}
                      spacing={2}
                    >
                      <CountWidgets
                        icon="/static/icons/Agencies@2x.svg"
                        title="Number of Agencies"
                        label="Agencies"
                        data={tileData?.accountsServed}
                      />
                    </Grid>
                  )}
                </Grid>
                {signedinUserRoleFS !== SUPER_ADMIN ? (
                  <Grid
                    item
                    xl={12}
                    md={12}
                    lg={12}
                    xs={12}
                    sm={12}
                    container
                    spacing={2}
                  >
                    <Grid item xl={6} lg={6} md={6} xs={12} sm={12} spacing={2}>
                      {[ADMIN_CASEMANAGER, CASEMANAGER].includes(
                        signedinUserRoleFS
                      ) && (
                        <Grid
                          item
                          xl={12}
                          lg={12}
                          md={12}
                          xs={12}
                          sm={12}
                          spacing={2}
                          sx={{ mb: 2 }}
                        >
                          <NotificationCountWidget data={25} />
                        </Grid>
                      )}
                      <Grid
                        item
                        xl={12}
                        lg={12}
                        md={12}
                        xs={12}
                        sm={12}
                        spacing={2}
                        // mt={2}
                      >
                        <UpComingVisits />
                      </Grid>
                    </Grid>
                    <Grid item xl={6} lg={6} md={8} xs={12} sm={12} spacing={2}>
                      <Card
                      // sx={{
                      //   mt: [CASEMANAGER].includes(signedinUserRoleFS)
                      //     ? 0
                      //     : 2,
                      // }}
                      >
                        <CardContent>
                          <LogOverviewList module="dashboard" listData={null} />
                        </CardContent>
                      </Card>
                    </Grid>
                  </Grid>
                ) : (
                  <Grid
                    item
                    xl={12}
                    lg={12}
                    md={12}
                    xs={12}
                    sm={12}
                    spacing={2}
                  >
                    <OrganizationListAndCounts />
                  </Grid>
                )}
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Box>
    </>
  );
};

export default Dashboard;
