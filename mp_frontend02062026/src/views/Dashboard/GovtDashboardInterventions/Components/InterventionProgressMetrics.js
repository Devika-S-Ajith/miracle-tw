import { useState, useEffect, useContext } from "react";
import { useLocation, useParams } from "react-router";

import { Box } from "@mui/material";

import { CommonDataContext } from "../../../../common/contexts/CommonDataContext";
import { DecryptId, getNavbarFilterPayload } from "../../../../constants";
import APIS from "../../../../common/hooks/UseApiCalls";
import InfoCard from "../../../../components/InfoCard";
import RatingWithValue from "./RatingWithValue";

const InterventionProgressMetrics = () => {
  const { navbarFilterValues, linkedAccounts, signedinOrgType } = useContext(CommonDataContext);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);
  const [apiError, setApiError] = useState(null);

  const { id } = useParams();

  const decryptedId = DecryptId(id);

  const { state: milestoneData } = useLocation();
  const milestone = milestoneData?.milestone;

  const fetchData = async () => {
    setLoading(true);
    setApiError(false);
    const payload = {
      ...getNavbarFilterPayload(navbarFilterValues, linkedAccounts),
      ...(signedinOrgType !== "6" ? { accountFilter: [localStorage.getItem("orgId")] } : {}),
      milestoneNameFilter: milestone,
      interventionNameFilter: decryptedId,
    };
    if (payload.countryFilter === null) {
      setLoading(false);
      return;
    }
    try {
      const response = await APIS.GetInterventionProgressMetrics(payload);
      if (response?.data?.data?.[0]) {
        const metricsData = response.data.data[0];
        const interventionSummary = [
          {
            status: "Completed - Improved",
            rating: 5,
            interventionCount: metricsData.completedImproved || 0,
          },
          {
            status: "Completed - No impact",
            rating: 3,
            interventionCount: metricsData.completedNoImpact || 0,
          },
          {
            status: "Completed - Worse",
            rating: 1,
            interventionCount: metricsData.completedWorse || 0,
          },
          {
            status: "In progress - Continued",
            rating: null,
            interventionCount: metricsData.inProgressContinued || 0,
          },
          {
            status: "In progress - Discontinued",
            rating: null,
            interventionCount: metricsData.inProgressDiscontinued || 0,
          },
          {
            status: "Not started - Continued",
            rating: null,
            interventionCount: metricsData.notStartedContinued || 0,
          },
          {
            status: "Not started - Discontinued",
            rating: null,
            interventionCount: metricsData.notStartedDiscontinued || 0,
          },
          {
            status:
              "No longer relevant - Another intervention has been selected",
            rating: null,
            interventionCount:
              metricsData.noLongerRelevantAnotherInterventionHasBeenSelected ||
              0,
          },
          {
            status:
              "No longer relevant - Another intervention will be selected",
            rating: null,
            interventionCount:
              metricsData.noLongerRelevantAnotherInterventionWillBeSelected ||
              0,
          },
          {
            status:
              "No longer relevant - Another intervention has not been selected",
            rating: null,
            interventionCount:
              metricsData.noLongerRelevantAnotherInterventionHasNotBeenSelected ||
              0,
          },
        ];

        // Calculate sum of all interventionCounts
        const totalSum = interventionSummary.reduce(
          (sum, item) => sum + parseInt(item.interventionCount),
          0
        );
        // You can use totalSum as needed, e.g. log or add to data
        setData([
          ...interventionSummary.map((item) => ({
            label: item.status,
            value:
              item.rating !== null ? (
                <Box sx={{ justifyItems: "end" }}>
                  <RatingWithValue
                    rating={item.rating}
                    interventionCount={item.interventionCount}
                  />
                </Box>
              ) : (
                item.interventionCount
              ),
          })),
          {
            label: "Total times intervention was selected",
            value: totalSum,
          },
        ]);
      }
    } catch (error) {
      setApiError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (localStorage.getItem("userRegion") && signedinOrgType) {
      fetchData();
    }
  }, [navbarFilterValues, id, localStorage.getItem("userRegion"), signedinOrgType]);

  return (
    <InfoCard
      title="Intervention progress metrics"
      data={data}
      loading={loading}
      apiError={apiError}
      onReload={fetchData}
    />
  );
};

export default InterventionProgressMetrics;
