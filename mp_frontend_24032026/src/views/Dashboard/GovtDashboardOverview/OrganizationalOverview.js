import { useState, useEffect, useCallback, useContext } from "react";
import InfoCard from "../../../components/InfoCard";
import APIS from "../../../common/hooks/UseApiCalls";
import { getNavbarFilterPayload } from "../../../constants";
import { CommonDataContext } from "../../../common/contexts/CommonDataContext";
import { useParams } from "react-router";

const OrganizationalOverview = ({ isGeneralDashboard = false }) => {
  const { navbarFilterValues, linkedAccounts } = useContext(CommonDataContext);
  const { id } = useParams();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);
  const [apiError, setApiError] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setApiError(false);
    try {
      const payload = getNavbarFilterPayload(
        navbarFilterValues,
        linkedAccounts
      );
      if (payload.countryFilter === null) {
        return
      }
      if (id) {
        payload.accountFilter = [id];
      }
      if (isGeneralDashboard) {
         payload.accountFilter =[localStorage.getItem("orgId")] ;
      }
      const response = await APIS.GetGovtDashboardOrganizationOverview(payload);
      if (response.data && response.data.data) {
        const overviewData = response.data.data;

        setData([
          {
            label: "Total # of active orgs",
            value: overviewData.total_active_org || 0,
            access: id ? false : true,
          },
          {
            label: "Total # of active children",
            value: overviewData.total_active_children || 0,
            access: true,
          },
          {
            label: "Total # of active families",
            value: overviewData.total_active_families || 0,
            access: true,
          },
          {
            label: "New children (last 30 days)",
            value: overviewData.new_children_last_30 || 0,
            access: true,
          },
          {
            label: "New families (last 30 days)",
            value: overviewData.new_families_last_30 || 0,
            access: true,
          },
          {
            label: "Total number of active cases (families + children)",
            value: overviewData.total_active_cases || 0,
            access: true,
          },
          {
            label: "Total active interventions",
            value: overviewData.intervention_in_progress || 0,
            access: true,
          },
          {
            label: "Total interventions completed",
            value: overviewData?.intervention_completed,
            access: !!id,
          },
          {
            label: " Average # of active cases per case manger",
            value: overviewData?.avg_cases_per_casemanagers,
            access: !!id,
          },
          {
            label: "# of active case managers",
            value: overviewData?.no_of_active_casemanagers,
            access: !!id,
          },
        ]);
      }
    } catch (error) {
      console.error("Error fetching organizational overview data:", error);
      setApiError(true);
    } finally {
      setLoading(false);
    }
  }, [navbarFilterValues, linkedAccounts, id, localStorage.getItem('userRegion')],localStorage.getItem("orgId"));

  useEffect(() => {
    if (localStorage.getItem('userRegion')) {
      console.log("Fetching", localStorage.getItem("orgId"));
      fetchData();
    }
  }, [navbarFilterValues, id, localStorage.getItem('userRegion')],localStorage.getItem("orgId"));

  return (
    <InfoCard
      title="Organizational overview"
      data={data}
      loading={loading}
      apiError={apiError}
      onReload={fetchData}
    />
  );
};

export default OrganizationalOverview;
