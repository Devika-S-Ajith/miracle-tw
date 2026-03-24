import { useState, useEffect, useCallback, useContext } from "react";
import InfoCard from "../../../components/InfoCard";
import APIS from "../../../common/hooks/UseApiCalls";
import { getNavbarFilterPayload } from "../../../constants";
import { CommonDataContext } from "../../../common/contexts/CommonDataContext";
import { useParams } from "react-router";

const RedflagOverview = ({ isGeneralDashboard = false }) => {
  const { navbarFilterValues, linkedAccounts } = useContext(CommonDataContext);
  const { id } = useParams();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);
  const [apiError, setApiError] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setApiError(false);
    try {
      const payload = getNavbarFilterPayload(navbarFilterValues, linkedAccounts);
      if (id) {
        payload.accountFilter = [id]; 
      }
      if (isGeneralDashboard) {
        payload.accountFilter = [localStorage.getItem("orgId")];
      }
      const response = await APIS.GetGovtDashboardRedflagOverview(payload);
      if (response?.data?.data?.[0]) {
        const overviewData = response.data.data?.[0];
        setData([
          {
            label: "Families with active  “In crisis” red flags", 
            value: `${overviewData?.familiesWithIncrisisRedflagMilestone} / ${overviewData?.totalFamily}` || 0,
          },
          {
            label:"Families with active  “Vulnerable” red flags",
            value: `${overviewData?.familiesWithVulnerableRedflagMilestone} / ${overviewData?.totalFamily}` || 0,
          },
          {
            label: "Children with active  “In crisis” red flags",
            value: `${overviewData?.childrenWithIncrisisRedflagMilestone} / ${overviewData?.totalChildren}` || 0,
          },
          {
            label: "Children with active  “Vulnerable” red flags",
            value: `${overviewData?.childrenWithVulnerableRedflagMilestone} / ${overviewData?.totalChildren}` || 0,
          },
          {
            label:"Active red flag interventions",
            value: overviewData?.activeRedflagInterventions || 0,
          },
          {
            label: "Completed red flag interventions",
            value: overviewData?.completedRedflagInterventions || 0,
          },
        ]);
      }
    } catch (error) {
      console.error("Error fetching organizational overview data:", error);
      setApiError(true);
    } finally {
      setLoading(false);
    }
  },[navbarFilterValues, linkedAccounts, id]);

  useEffect(() => {
    if (localStorage.getItem("userRegion")) {
      fetchData();
    }
  }, [navbarFilterValues, id, localStorage.getItem("userRegion")]);

  return (
    <InfoCard title="Red Flags Overview" data={data} loading={loading} apiError={apiError} onReload={fetchData} />
  );
};

export default RedflagOverview;
