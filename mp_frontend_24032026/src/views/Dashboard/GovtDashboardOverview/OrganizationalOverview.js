import { useState, useEffect, useCallback, useContext } from "react";
import InfoCard from "../../../components/InfoCard";
import APIS from "../../../common/hooks/UseApiCalls";
import { getNavbarFilterPayload } from "../../../constants";
import { CommonDataContext } from "../../../common/contexts/CommonDataContext";
import { useParams } from "react-router";
import OrganizationOverviewCard from "../Components/StateGovDashboardComponents/OrganizationOverviewCard";

const OrganizationalOverview = ({ isGeneralDashboard = false , isSuperAdmin = false }) => {
  const { navbarFilterValues, linkedAccounts } =
    useContext(CommonDataContext);
  const { id } = useParams();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);
  const [apiError, setApiError] = useState(false);

  const fetchData = useCallback(
    async () => {
      setLoading(true);
      setApiError(false);
      try {
        const payload = getNavbarFilterPayload(
          navbarFilterValues,
          linkedAccounts,
        );
        if (payload.countryFilter === null) {
          return;
        }
        if (id) {
          payload.accountFilter = [id];
        }
        if (isGeneralDashboard) {
          payload.accountFilter = [localStorage.getItem("orgId")];
        }
        if (isSuperAdmin) {
          payload.accountFilter = null; // Super Admin should see data across all orgs
        }
        const response =
          await APIS.GetGovtDashboardOrganizationOverview(payload);
        if (response.data && response.data.data) {
          const overviewData = response.data.data;

          const overviewItems = [
            {
              label: "New children (last 30 days)",
              superLabel: "Children added in last 30 days",
              value: overviewData.new_children_last_30 || 0,
              access: true,
              allowInSuperAdminOverview: true,
              subtitle: "New children",
            },
            {
              label: "Total # of active children",
              superLabel: "Children who have been part of atleast one assessment or log",
              value: overviewData.total_active_children || 0,
              access: true,
              allowInSuperAdminOverview: true,
              subtitle: "# of active children",
            },
            {
              label: "New families (last 30 days)",
              superLabel: "Families added in the last 30 days",
              value: overviewData.new_families_last_30 || 0,
              access: true,
              allowInSuperAdminOverview: true,
              subtitle: "New families",
            },
            {
              label: "Total # of active families",
              superLabel: "Families who have been part of atleast one assessment or completed at least one log",
              value: overviewData.total_active_families || 0,
              access: true,
              allowInSuperAdminOverview: true,
              subtitle: "# of active families",
            },
            {
              label: "Total active interventions",
              superLabel: "All interventions that are not completed",
              value: overviewData.intervention_in_progress || 0,
              access: true,
              allowInSuperAdminOverview: true,
              subtitle: "# of active interventions",
            },
            {
              label: "Total interventions completed",
              superLabel: "All completed interventions, all time",
              value: overviewData?.intervention_completed,
              access: !!id,
              allowInSuperAdminOverview: true,
              subtitle: "Interventions completed",
            },
            {
              label: " Average # of active cases per case manger",
              superLabel: "Average number of active cases across all caseworkers",
              value: overviewData?.avg_cases_per_casemanagers,
              access: !!id,
              allowInSuperAdminOverview: true,
              subtitle: "Average active cases per caseworker",
            },
            {
              label: "# of active case managers",
              superLabel: "All active caseworkers in ThriveWell",
              value: overviewData?.no_of_active_casemanagers,
              access: !!id,
              allowInSuperAdminOverview: true,
              subtitle: "Total active caseworkers",
            },
            {
              label: "Total # of active orgs",
              superLabel: "Total active orgs",
              value: overviewData.total_active_org || 0,
              access: id ? false : true,
              allowInSuperAdminOverview: false,
            },
            {
              label: "Total number of active cases (families + children)",
              superLabel: "Total active cases",
              value: overviewData.total_active_cases || 0,
              access: true,
              allowInSuperAdminOverview: false,
            },
          ];

          setData(
            overviewItems.map((item) => ({
              ...item,
              value: item.value === null || item.value === undefined ? "-" : item.value,
              label: isSuperAdmin ? item.superLabel || item.label : item.label,
              subtitle: isSuperAdmin ? item.subtitle : undefined,
            })),
          );
        }
      } catch (error) {
        console.error("Error fetching organizational overview data:", error);
        setApiError(true);
      } finally {
        setLoading(false);
      }
    },
    [
      navbarFilterValues,
      linkedAccounts,
      id,
      localStorage.getItem("userRegion"),
    ],
    localStorage.getItem("orgId"),
  );

  useEffect(
    () => {
      if (localStorage.getItem("userRegion")) {
        console.log("Fetching", localStorage.getItem("orgId"));
        fetchData();
      }
    },
    [navbarFilterValues, id, localStorage.getItem("userRegion")],
    localStorage.getItem("orgId"),
  );

  return (
    isSuperAdmin === true ? (
       <OrganizationOverviewCard
        data={data.filter((item) => item.allowInSuperAdminOverview)}
        title="Organizational Overview"
        apiError={apiError}
        onReload={fetchData}
        colSize={3}   
    />
    ) : (
      <InfoCard
        title="Organizational overview"
        data={data}
        loading={loading}
        apiError={apiError}
        onReload={fetchData}
      />
    )
  );
};

export default OrganizationalOverview;