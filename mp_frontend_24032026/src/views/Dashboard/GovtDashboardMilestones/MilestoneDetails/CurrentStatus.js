import React, { useContext, useEffect, useState } from "react";
import { Grid } from "@mui/material";
import { useTranslation } from "react-i18next";
import CommonCard from "../../../../components/CommonCard";
import InfoTile from "../../../../components/InfoTile/InfoTile";
import CurrentStatusSkelton from "./CurrentStatusSkelton";
import { MoodImageMapping } from "../../Components/StateGovDashboardComponents/MoodImageMapping";
import { getNavbarFilterPayload } from "../../../../constants";
import { CommonDataContext } from "../../../../common/contexts/CommonDataContext";
import { useParams } from "react-router";
import APIS from "../../../../common/hooks/UseApiCalls";

// const CurrentStatus = () => { // Use this during API integration
const CurrentStatus = ({ initialLoading = false }) => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState(null);
  const [childStatus, setChildStatus] = useState([]);
  const { navbarFilterValues, linkedAccounts, signedinOrgType } = useContext(CommonDataContext);
  const { id } = useParams();
  // Example decryption function (replace with your actual logic)
  const decryptId = (encryptedId) => {
    try {
      return decodeURIComponent(atob(encryptedId));
    } catch (e) {
      return "";
    }
  };
  const decryptedId = decryptId(id);

  const getCurrentStatusData = async (params = {}) => {
    setLoading(true);
    setApiError(null);

    const payload = {
      ...getNavbarFilterPayload(navbarFilterValues, linkedAccounts),
      ...(signedinOrgType !== "6" ? { accountFilter: [localStorage.getItem("orgId")] } : {}),
      milestoneNameFilter: decryptedId,
    };
    if (payload.countryFilter === null) {
      return;
    }
    try {
      const response = await APIS?.GetCurrentStatus(payload);
      let data = response.data?.data?.[0];

      setChildStatus([
        {
          title: data.activeCasesInCrisis || 0,
          key: "inCrisis",
          description: t("common:assessment.In-crisis"),
          bgcolor: "#F7DFE6",
        },
        {
          title: data.activeCasesInVulnerable || 0,
          key: "vulnerable",
          description: t("common:assessment.Vulnerable"),
          bgcolor: "#FFE7C6",
        },
        {
          title: data.activeCasesSafe || 0,
          key: "safe",
          description: t("common:assessment.Safe"),
          bgcolor: "#F3F7E2",
        },
        {
          title: data.activeCasesThriving || 0,
          description: t("common:assessment.Thriving"),
          key: "thriving",
          bgcolor: "#E2F4F7",
        },
      ]);

      setApiError(null);
    } catch (err) {
      setApiError("Failed to fetch data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (localStorage.getItem("userRegion") && signedinOrgType) getCurrentStatusData();
  }, [localStorage.getItem("userRegion"), signedinOrgType]);

  return (
    <CommonCard
      title={t(
        "common:common.Current status (most recent assessment)",
        "Current status (most recent assessment)"
      )}
      apiError={apiError}
      onReload={getCurrentStatusData}
    >
      {loading ? (
        <CurrentStatusSkelton />
      ) : (
        <Grid
          container
          spacing={2}
          justifyContent="center"
          sx={{
            px: { xs: 2, sm: 3, md: 5, lg: 10 },
          }}
          pt
        >
          {childStatus.map((status, idx) => (
            <Grid item xs={12} sm={6} md={3} key={idx}>
              <InfoTile
                bgcolor={status.bgcolor}
                title={
                  <span
                    style={{ display: "flex", alignItems: "center", gap: 8 }}
                  >
                    <img
                      src={MoodImageMapping[status.key.toUpperCase()]}
                      alt={status.key}
                      width={30}
                      height={30}
                      style={{ objectFit: "contain" }}
                    />
                    <span>{status.title}</span>
                  </span>
                }
                subTitle={t("common:infoCard.Active cases")}
                description={status.description}
                height={1}
              />
            </Grid>
          ))}
        </Grid>
      )}
    </CommonCard>
  );
};

export default CurrentStatus;
