import OrganizationalOverview from "../../GovtDashboardOverview/OrganizationalOverview";
import PageBreadcrumbs from "../../../../components/PageBreadcrumbs/PageBreadcrumbs";
import { Box } from "@mui/system";
import { Card, Grid, CardContent } from "@mui/material";
import { useTranslation } from "react-i18next";
import AverageThriveScaleScores from "../../GovtDashboardOverview/AverageThriveScaleScores";
import TableWithTrendLines from "../../GovtDashboardOverview/DomainScoreByAssessment";
import RedflagOverview from "../../GovtDashboardOverview/RedflagOverview";
import LogOverviewList from "../../../FS/Components/LogOverviewList";
import {
  ADMIN,
  ADMIN_CASEWORKER,
  CASEWORKER,
  GOVT_CCI,
  GOVT_ORG,
  MIRACLE,
  NGO_PARTNER,
  PRIVATE_CCI,
  SUPER_ADMIN,
  VIEW_ONLY,
} from "../../../../helpers/constant";
import { useContext, useState, useEffect, useMemo, useCallback } from "react";
import { CommonDataContext } from "../../../../common/contexts/CommonDataContext";
import ReportsPieChart from "./ReportsPieChart";
import DashboardCountWidgets from "./DashboardCountWidgets";
import APIS from "../../../../common/hooks/UseApiCalls";

const DASHBOARD_ITEMS = [
  {
    title: "OrganizationalOverview",
    key: "orgOverview",
    sequence: 0,
    column: "left",
    Allowed_Roles_HT: [SUPER_ADMIN, ADMIN, CASEWORKER, ADMIN_CASEWORKER, VIEW_ONLY],
    Allowed_Roles_FS: [SUPER_ADMIN, ADMIN, CASEWORKER, ADMIN_CASEWORKER, VIEW_ONLY],
    Allowed_Acc_Type: [MIRACLE, GOVT_CCI, GOVT_ORG, NGO_PARTNER, PRIVATE_CCI],
  },
  {
    title: "Current living condition",
    key: "currentLivingCondition",
    sequence: 1,
    column: "left",
    Allowed_Roles_HT: [ADMIN, CASEWORKER, ADMIN_CASEWORKER, VIEW_ONLY],
    Allowed_Roles_FS: [ADMIN, CASEWORKER, ADMIN_CASEWORKER, VIEW_ONLY],
    Allowed_Acc_Type: [GOVT_CCI, GOVT_ORG, NGO_PARTNER, PRIVATE_CCI],
  },
  {
    title: "Family situation",
    key: "familySituation",
    sequence: 2,
    column: "left",
    Allowed_Roles_HT: [ADMIN, CASEWORKER, ADMIN_CASEWORKER, VIEW_ONLY],
    Allowed_Roles_FS: [ADMIN, CASEWORKER, ADMIN_CASEWORKER, VIEW_ONLY],
    Allowed_Acc_Type: [GOVT_CCI, GOVT_ORG, NGO_PARTNER, PRIVATE_CCI],
  },
  {
    title: "All overdue assessments",
    key: "overallOverdue",
    sequence: 3,
    column: "left",
    Allowed_Roles_HT: [ADMIN, CASEWORKER, ADMIN_CASEWORKER, VIEW_ONLY],
    Allowed_Roles_FS: [],
    Allowed_Acc_Type: [GOVT_CCI, GOVT_ORG, NGO_PARTNER, PRIVATE_CCI],
  },
  {
    title: "RedflagOverview",
    key: "redflagOverview",
    sequence: 4,
    column: "left",
    Allowed_Roles_HT: [ADMIN, CASEWORKER, ADMIN_CASEWORKER, VIEW_ONLY],
    Allowed_Roles_FS: [],
    Allowed_Acc_Type: [GOVT_CCI, GOVT_ORG, NGO_PARTNER, PRIVATE_CCI],
  },
  {
    title: "Closed case",
    key: "closedCases",
    sequence: 5,
    column: "left",
    Allowed_Roles_HT: [ADMIN, CASEWORKER, ADMIN_CASEWORKER],
    Allowed_Roles_FS: [ADMIN, CASEWORKER, ADMIN_CASEWORKER],
    Allowed_Acc_Type: [GOVT_CCI, GOVT_ORG, NGO_PARTNER, PRIVATE_CCI],
  },
  {
    title: "BehaviourLog",
    key: "behaviourLog",
    sequence: 6,
    column: "right",
    Allowed_Roles_HT: [],
    Allowed_Roles_FS: [ADMIN, CASEWORKER, ADMIN_CASEWORKER, VIEW_ONLY],
    Allowed_Acc_Type: [],
  },
  {
    title: "AverageThriveScaleScores",
    key: "avgThriveScores",
    sequence: 7,
    column: "right",
    Allowed_Roles_HT: [ADMIN, CASEWORKER, ADMIN_CASEWORKER, VIEW_ONLY],
    Allowed_Roles_FS: [],
    Allowed_Acc_Type: [GOVT_CCI, GOVT_ORG, NGO_PARTNER, PRIVATE_CCI],
  },
  {
    title: "TableWithTrendLines",
    key: "domainScoreTable",
    sequence: 8,
    column: "right",
    Allowed_Roles_HT: [ADMIN, CASEWORKER, ADMIN_CASEWORKER, VIEW_ONLY],
    Allowed_Roles_FS: [],
    Allowed_Acc_Type: [GOVT_CCI, GOVT_ORG, NGO_PARTNER, PRIVATE_CCI],
  },
];

const ConsolidatedOverviewPage = () => {
  const { t } = useTranslation(["common"]);
  const { signedinUserRoleHT, signedinUserRoleFS, signedinOrgType } =
    useContext(CommonDataContext);

  const [tileData, setTileData] = useState({});
  const [loading, setLoading] = useState({});
  const [errors, setErrors] = useState({});

  const isSuperAdmin = useMemo(
    () => signedinUserRoleHT === SUPER_ADMIN || signedinUserRoleFS === SUPER_ADMIN,
    [signedinUserRoleHT, signedinUserRoleFS]
  );

  const filteredItems = useMemo(() => {
    return DASHBOARD_ITEMS.filter(
      (item) =>
        (item.Allowed_Roles_HT?.includes(signedinUserRoleHT) &&
          item.Allowed_Acc_Type?.includes(signedinOrgType)) ||
        item.Allowed_Roles_FS?.includes(signedinUserRoleFS)
    );
  }, [signedinUserRoleHT, signedinUserRoleFS, signedinOrgType]);

  const leftItems = useMemo(
    () =>
      filteredItems
        .filter((item) => item.column === "left")
        .sort((a, b) => a.sequence - b.sequence),
    [filteredItems]
  );

  const rightItems = useMemo(
    () =>
      filteredItems
        .filter((item) => item.column === "right")
        .sort((a, b) => a.sequence - b.sequence),
    [filteredItems]
  );

  // ─── Granular fetchers ────────────────────────────────────────────────────

  const fetchTileData = useCallback(async (signal) => {
    try {
      setErrors((prev) => ({
        ...prev,
        overallOverdue: false,
        currentLivingCondition: false,
      }));
      setLoading((prev) => ({
        ...prev,
        overallOverdue: true,
        currentLivingCondition: true,
      }));

      const payload = { TWCountryId: localStorage.getItem("userRegion") || "" };
      const res = await APIS.DashboardTileData(payload, { signal });

      setTileData((prev) => ({
        ...prev,
        overallOverdue: res?.data?.message?.data?.overallOverdue ?? 0,
        currentLivingCondition:
          res?.data?.message?.data?.childPlacement?.[0] ?? [],
      }));
    } catch (err) {
      if (err?.name !== "AbortError" && err?.code !== "ERR_CANCELED") {
        console.error("DashboardTileData failed:", err);
        setErrors((prev) => ({
          ...prev,
          overallOverdue: true,
          currentLivingCondition: true,
        }));
      }
    } finally {
      setLoading((prev) => ({
        ...prev,
        overallOverdue: false,
        currentLivingCondition: false,
      }));
    }
  }, []);

  const fetchFamilySituation = useCallback(async (signal) => {
    try {
      setErrors((prev) => ({ ...prev, familySituation: false }));
      setLoading((prev) => ({ ...prev, familySituation: true }));

      const payload = { TWCountryId: localStorage.getItem("userRegion") || "" };
      const res = await APIS.GetFamilySituatiionCounts(payload, { signal });

      setTileData((prev) => ({
        ...prev,
        familySituation: res?.data?.message ?? [],
      }));
    } catch (err) {
      if (err?.name !== "AbortError" && err?.code !== "ERR_CANCELED") {
        console.error("GetFamilySituatiionCounts failed:", err);
        setErrors((prev) => ({ ...prev, familySituation: true }));
      }
    } finally {
      setLoading((prev) => ({ ...prev, familySituation: false }));
    }
  }, []);

  const fetchClosedCases = useCallback(async (signal) => {
    try {
      setErrors((prev) => ({ ...prev, closedCases: false }));
      setLoading((prev) => ({ ...prev, closedCases: true }));

      const payload = { TWCountryId: localStorage.getItem("userRegion") || "" };
      const res = await APIS.GetFamilyClosedCases(payload, { signal });

      setTileData((prev) => ({
        ...prev,
        closedCases: res?.data?.message ?? [],
      }));
    } catch (err) {
      if (err?.name !== "AbortError" && err?.code !== "ERR_CANCELED") {
        console.error("GetFamilyClosedCases failed:", err);
        setErrors((prev) => ({ ...prev, closedCases: true }));
      }
    } finally {
      setLoading((prev) => ({ ...prev, closedCases: false }));
    }
  }, []);

  // ─── Initial fetch ────────────────────────────────────────────────────────

  useEffect(() => {
    if (isSuperAdmin) return;

    const controller = new AbortController();

    fetchTileData(controller.signal);
    fetchFamilySituation(controller.signal);
    fetchClosedCases(controller.signal);

    return () => controller.abort();
  }, [isSuperAdmin, fetchTileData, fetchFamilySituation, fetchClosedCases]);

  // ─── Render ───────────────────────────────────────────────────────────────

  const renderItem = useCallback(
    (item) => {
      switch (item.key) {
        case "orgOverview":
          return (
            <OrganizationalOverview
              isGeneralDashboard
              isSuperAdmin={isSuperAdmin}
            />
          );

        case "currentLivingCondition":
          return (
            <ReportsPieChart
              title="Current living condition"
              res={tileData.currentLivingCondition}
              loading={loading.currentLivingCondition}
              canViewReport={false}
              hasError={errors.currentLivingCondition}
              handleReload={() => fetchTileData()}
            />
          );

        case "familySituation":
          return (
            <ReportsPieChart
              title="Family situation"
              res={tileData.familySituation}
              loading={loading.familySituation}
              reportLink="/dashboard/reportsFamilySituation"
              canViewReport={false}
              hasError={errors.familySituation}
              handleReload={() => fetchFamilySituation()}
            />
          );

        case "overallOverdue":
          return (
            <DashboardCountWidgets
              title="All overdue assessments"
              data={tileData.overallOverdue}
              isloading={loading.overallOverdue}
              linkAddress="/dashboard/reportsChildrenOverdue"
              canViewReport={false}
              hasError={errors.overallOverdue}
              handleReload={() => fetchTileData()}
            />
          );

        case "redflagOverview":
          return <RedflagOverview isGeneralDashboard />;

        case "closedCases":
          return (
            <ReportsPieChart
              title="Closed case"
              res={tileData.closedCases}
              loading={loading.closedCases}
              reportLink="/dashboard/families"
              canViewReport
              hasError={errors.closedCases}
              handleReload={() => fetchClosedCases()}
            />
          );

        case "behaviourLog":
          return (
            <Card>
              <CardContent>
                <LogOverviewList module="dashboard" listData={null} />
              </CardContent>
            </Card>
          );

        case "avgThriveScores":
          return <AverageThriveScaleScores isGeneralDashboard />;

        case "domainScoreTable":
          return <TableWithTrendLines isGeneralDashboard />;

        default:
          return null;
      }
    },
    [
      isSuperAdmin,
      tileData,
      loading,
      errors,
      fetchTileData,
      fetchFamilySituation,
      fetchClosedCases,
    ]
  );

  return (
    <Box sx={{ mt: 2 }}>
      <Box px={2}>
        <PageBreadcrumbs
          data={[{ label: t("common:common.Overview", "Overview") }]}
        />
      </Box>

      {isSuperAdmin && (
        <Box sx={{ px: 2, pt: 2 }}>
          <OrganizationalOverview isGeneralDashboard isSuperAdmin />
        </Box>
      )}

      <Grid p={2} container spacing={2} alignItems="stretch">
        <Grid
          item
          xs={12}
          md={5}
          sx={{ display: "flex", flexDirection: "column", gap: 2 }}
        >
          {leftItems
            .filter((i) => (isSuperAdmin ? i.key !== "orgOverview" : true))
            .map((item) => (
              <Box key={item.key}>{renderItem(item)}</Box>
            ))}
        </Grid>
        <Grid
          item
          xs={12}
          md={7}
          sx={{ display: "flex", flexDirection: "column", gap: 2 }}
        >
          {rightItems.map((item) => (
            <Box key={item.key}>{renderItem(item)}</Box>
          ))}
        </Grid>
      </Grid>
    </Box>
  );
};

export default ConsolidatedOverviewPage;