import React, { useContext, useEffect, useState } from "react";
import InfoTile from "../../../components/InfoTile/InfoTile";
import { Box, Grid, Skeleton } from "@mui/material";
import CommonCard from "../../../components/CommonCard";
import APIS from "../../../common/hooks/UseApiCalls";
import { getNavbarFilterPayload } from "../../../constants";
import { CommonDataContext } from "../../../common/contexts/CommonDataContext";
import ErrorWithReload from "../GovtDashboardOverview/Components/ErrorWithReload";
import NoDataFoundText from "../GovtDashboardOverview/Components/NoDataFoundText";
import { useTranslation } from "react-i18next";

const TopInCrisis = () => {
  const { navbarFilterValues, linkedAccounts, signedinOrgType } = useContext(CommonDataContext);
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState(null);
  const [crisisData, setCrisisData] = useState([]);
  const {t} = useTranslation(["common"]);
  // API call function
  const getTopInCrisisData = async () => {
    setLoading(true);
    setApiError(null);

    const payload = {
      ...getNavbarFilterPayload(navbarFilterValues, linkedAccounts),
      ...(signedinOrgType !== "6" ? { accountFilter: [localStorage.getItem("orgId")] } : {}),
      type: "OVERALL",
    };
    if (payload.countryFilter === null) {
      return;
    }
    try {
      const response = await APIS?.GetTopInCrisis(payload);
      const allMilestoneListData = response.data.data;

      setCrisisData(allMilestoneListData);
      setApiError(null);
    } catch (error) {
      setApiError("Failed to fetch milestones data");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    if (localStorage.getItem("userRegion") && signedinOrgType) {
      getTopInCrisisData();
    }
  }, [navbarFilterValues, localStorage.getItem("userRegion"), signedinOrgType]);

  return (
    <CommonCard title="Top In Crisis">
      <Grid container pt px={2} spacing={2} justifyContent={"center"}>
        {apiError ? (
          <Grid item xs={12}>
            <Box
              display="flex"
              flexDirection="column"
              alignItems="center"
              justifyContent="center"
              minHeight={120}
            >
              <ErrorWithReload
                message="Oops, something went wrong on our end. Please try again"
                onReload={() => getTopInCrisisData()} // Pass the onReload function to handle reload
              />
            </Box>
          </Grid>
        ) : loading ? (
          Array.from({ length: 5 }).map((_, idx) => (
            <Grid item xs={12} sm={6} md={12 / (5 || 3)} key={idx}>
              <Skeleton
                variant="rectangular"
                height={80}
                sx={{ borderRadius: 2 }}
                role="presentation" // Added role="presentation"
              />
            </Grid>
          ))
        ) : crisisData?.length > 0 ? (
          crisisData?.map((item, idx) => (
            <Grid item xs={12} sm={6} md={4} lg={12 / 5} key={idx}>
              <InfoTile
                key={idx}
                title={item.activeInCrisisCases}
                subTitle={t("common:infoCard.Active cases")}
                description={item.milestone}
                preDescriptionIcon={
                  item.redFlag ? (
                    <img
                      src="/static/icons/redflag.svg"
                      style={{ width: 20, height: 20 }}
                    />
                  ) : null
                }
                bgcolor="#F7DFE6"
                height={1}
              />
            </Grid>
          ))
        ) : (
          <Box mt>
            <NoDataFoundText />
          </Box>
        )}
      </Grid>
    </CommonCard>
  );
};

export default TopInCrisis;
