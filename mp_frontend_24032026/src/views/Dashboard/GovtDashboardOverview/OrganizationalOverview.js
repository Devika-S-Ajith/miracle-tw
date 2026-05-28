import { useState, useEffect, useCallback, useContext } from "react";
import InfoCard from "../../../components/InfoCard";
import APIS from "../../../common/hooks/UseApiCalls";
import { getNavbarFilterPayload } from "../../../constants";
import { CommonDataContext } from "../../../common/contexts/CommonDataContext";
import { useParams } from "react-router";
import OrganizationOverviewCard from "../Components/StateGovDashboardComponents/OrganizationOverviewCard";
import { useTranslation } from "react-i18next";

const OrganizationalOverview = ({ isGeneralDashboard = false , isSuperAdmin = false }) => {
  const { navbarFilterValues, linkedAccounts } =
    useContext(CommonDataContext);
  const { id } = useParams();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);
  const [apiError, setApiError] = useState(false);
  const { t } = useTranslation(["common"]);
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
              label: t("common:infoCard.New children (last 30 days)", "New children (last 30 days)"),
              superLabel: t("common:infoCard.Children added in last 30 days", "Children added in last 30 days"),
              value: overviewData.new_children_last_30 || 0,
              access: true,
              allowInSuperAdminOverview: true,
              subtitle: t("common:common.New children", "New children"),
            },
            {
              label: t("common:infoCard.Total # of active children", "Total # of active children"),
              superLabel: t("common:infoCard.Total # of active children", "Total # of active children"),
              value: overviewData.total_active_children || 0,
              access: true,
              allowInSuperAdminOverview: true,
              subtitle: t("common:infoCard.# of active children", "# of active children"),
            },
            {
              label: t("common:infoCard.New families (last 30 days)", "New families (last 30 days)"),
              superLabel: t("common:infoCard.Families added in the last 30 days", "Families added in the last 30 days"),
              value: overviewData.new_families_last_30 || 0,
              access: true,
              allowInSuperAdminOverview: true,
              subtitle: t("common:infoCard.New families", "New families"),
            },
            {
              label: t("common:infoCard.Total # of active families", "Total # of active families"),
              superLabel: t("common:infoCard.Total # of active families", "Total # of active families"),
              value: overviewData.total_active_families || 0,
              access: true,
              allowInSuperAdminOverview: true,
              subtitle: t("common:infoCard.# of active families", "# of active families"),
            },
            {
              label: t("common:infoCard.Total active interventions", "Total active interventions"),
              superLabel: t("common:infoCard.All interventions that are not completed", "All interventions that are not completed"),
              value: overviewData.intervention_in_progress || 0,
              access: true,
              allowInSuperAdminOverview: true,
              subtitle: t("common:infoCard.# of active interventions", "# of active interventions"),
            },
            {
              label: t("common:infoCard.Total interventions completed", "Total interventions completed"),
              superLabel: t("common:infoCard.All completed interventions, all time", "All completed interventions, all time"),
              value: overviewData?.intervention_completed,
              access: !!id || isGeneralDashboard,
              allowInSuperAdminOverview: true,
              subtitle: t("common:infoCard.Interventions completed", "Interventions completed"),
            },
            {
              label: t("common:infoCard.Average # of active cases per case manager", "Average # of active cases per case manager"),
              superLabel: t("common:infoCard.Average number of active cases across all caseworkers", "Average number of active cases across all caseworkers"),
              value: overviewData?.avg_cases_per_casemanagers,
              access: !!id || isGeneralDashboard,
              allowInSuperAdminOverview: true,
              subtitle: t("common:infoCard.Average active cases per caseworker", "Average active cases per caseworker"),
            },
            {
              label: t("common:infoCard.# of active case managers", "# of active case managers"),
              superLabel: t("common:infoCard.All active caseworkers in ThriveWell", "All active caseworkers in ThriveWell"),
              value: overviewData?.no_of_active_casemanagers,
              access: !!id || isGeneralDashboard,
              allowInSuperAdminOverview: true,
              subtitle: t("common:infoCard.Total active caseworkers", "Total active caseworkers"),
            },
            {
              label: t("common:infoCard.Total # of active orgs", "Total # of active orgs"),
              superLabel: t("common:infoCard.Total active orgs", "Total active orgs"),
              value: overviewData.total_active_org || 0,
              access: id || (isGeneralDashboard && !isSuperAdmin)  ? false : true,
              allowInSuperAdminOverview: false,
            },
            {
              label: t("common:infoCard.Total number of active cases (families + children)", "Total number of active cases (families + children)"),
              superLabel: t("common:infoCard.Total active cases", "Total active cases"),
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
        loading={loading}
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