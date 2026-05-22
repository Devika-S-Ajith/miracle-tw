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
import { useContext, useState, useEffect } from "react";
import { CommonDataContext } from "../../../../common/contexts/CommonDataContext";
import ReportsPieChart from "./ReportsPieChart";
import DashboardCountWidgets from "./DashboardCountWidgets";
import { getNavbarFilterPayload } from "../../../../constants";
import APIS from "../../../../common/hooks/UseApiCalls";




const ConsolidatedOverviewPage = () => {
  const { t } = useTranslation(["common"]);
  const { signedinUserRoleHT, signedinUserRoleFS, signedinOrgType } = useContext(CommonDataContext);
  const [filteredItems, setFilteredItems] = useState([]);
  const [tileData, setTileData] = useState({});
  const [loading, setLoading] = useState(false);

  // Always calculate isSuperAdmin safely at the top level
  const isSuperAdmin = Boolean(
    (signedinUserRoleHT === SUPER_ADMIN || signedinUserRoleFS === SUPER_ADMIN)
  );

  const items = [
    {
      title: "OrganizationalOverview",
      key: "orgOverview",
      sequence: 0,
      column: "left",
      Allowed_Roles_HT: [SUPER_ADMIN, ADMIN, CASEWORKER, ADMIN_CASEWORKER, VIEW_ONLY],
      Allowed_Roles_FS: [SUPER_ADMIN, ADMIN, CASEWORKER, ADMIN_CASEWORKER, VIEW_ONLY],
      Allowed_Acc_Type: [MIRACLE, GOVT_CCI, GOVT_ORG, NGO_PARTNER, PRIVATE_CCI],
      component: () => <OrganizationalOverview isGeneralDashboard={true} isSuperAdmin={isSuperAdmin} />,
    },
    {
      title: "Current living condition",
      key: "currentLivingCondition",
      sequence: 1,
      column: "left",
      Allowed_Roles_HT: [ADMIN, CASEWORKER, ADMIN_CASEWORKER, VIEW_ONLY],
      Allowed_Roles_FS: [ADMIN, CASEWORKER, ADMIN_CASEWORKER, VIEW_ONLY],
      Allowed_Acc_Type: [GOVT_CCI, GOVT_ORG, NGO_PARTNER, PRIVATE_CCI],
      component: (data) => (
        <ReportsPieChart
          title="Current living condition"
          res={data}
          loading={loading}
          canViewReport={false}
        />
      ),
    },
    {
      title: "Family situation",
      key: "familySituation",
      sequence: 2,
      column: "left",
      Allowed_Roles_HT: [ADMIN, CASEWORKER, ADMIN_CASEWORKER, VIEW_ONLY],
      Allowed_Roles_FS: [ADMIN, CASEWORKER, ADMIN_CASEWORKER, VIEW_ONLY],
      Allowed_Acc_Type: [GOVT_CCI, GOVT_ORG, NGO_PARTNER, PRIVATE_CCI],
      component: (data) => (
        <ReportsPieChart
          title="Family situation"
          res={data}
          loading={loading}
          reportLink="/dashboard/reportsFamilySituation"
          canViewReport={false}
        />
      ),
    },
    {
      title: "All overdue assessments",
      key: "overallOverdue",
      sequence: 3,
      column: "left",
      Allowed_Roles_HT: [ADMIN, CASEWORKER, ADMIN_CASEWORKER, VIEW_ONLY],
      Allowed_Roles_FS: [],
      Allowed_Acc_Type: [GOVT_CCI, GOVT_ORG, NGO_PARTNER, PRIVATE_CCI],
      component: (data) => (
        <DashboardCountWidgets
          title="All overdue assessments"
          data={data}
          isloading={loading}
          linkAddress="/dashboard/reportsChildrenOverdue"
          canViewReport={false}
        />
      ),
    },
    {
      title: "RedflagOverview",
      key: "redflagOverview",
      sequence: 4,
      column: "left",
      Allowed_Roles_HT: [ADMIN, CASEWORKER, ADMIN_CASEWORKER, VIEW_ONLY],
      Allowed_Roles_FS: [],
      Allowed_Acc_Type: [GOVT_CCI, GOVT_ORG, NGO_PARTNER, PRIVATE_CCI],
      component: () => <RedflagOverview isGeneralDashboard={true} />,
    },
    {
      title: "Closed case",
      key: "closedCases",
      sequence: 5,
      column: "left",
      Allowed_Roles_HT: [ADMIN, CASEWORKER, ADMIN_CASEWORKER],
      Allowed_Roles_FS: [ADMIN, CASEWORKER, ADMIN_CASEWORKER],
      Allowed_Acc_Type: [GOVT_CCI, GOVT_ORG, NGO_PARTNER, PRIVATE_CCI],
      component: (data) => (
        <ReportsPieChart
          title="Closed case"
          res={data}
          loading={loading}
          reportLink="/dashboard/families"
          canViewReport={true}
        />
      ),
    },
    {
      title: "BehaviourLog",
      key: "behaviourLog",
      sequence: 6,
      column: "right",
      Allowed_Roles_HT: [],
      Allowed_Roles_FS: [ADMIN, CASEWORKER, ADMIN_CASEWORKER, VIEW_ONLY],
      Allowed_Acc_Type: [],
      component: () => (
        <Card>
          <CardContent>
            <LogOverviewList module="dashboard" listData={null} />
          </CardContent>
        </Card>
      ),
    },
    {
      title: "AverageThriveScaleScores",
      key: "avgThriveScores",
      sequence: 7,
      column: "right",
      Allowed_Roles_HT: [ADMIN, CASEWORKER, ADMIN_CASEWORKER, VIEW_ONLY],
      Allowed_Roles_FS: [],
      Allowed_Acc_Type: [GOVT_CCI, GOVT_ORG, NGO_PARTNER, PRIVATE_CCI],
      component: () => <AverageThriveScaleScores isGeneralDashboard={true} />,
    },
    {
      title: "TableWithTrendLines",
      key: "domainScoreTable",
      sequence: 8,
      column: "right",
      Allowed_Roles_HT: [ADMIN, CASEWORKER, ADMIN_CASEWORKER, VIEW_ONLY],
      Allowed_Roles_FS: [],
      Allowed_Acc_Type: [GOVT_CCI, GOVT_ORG, NGO_PARTNER, PRIVATE_CCI],
      component: () => <TableWithTrendLines isGeneralDashboard={true} />,
    },
  ];


  // Always call hooks at the top level, never conditionally
  useEffect(() => {
    const filtered = items.filter(
      (item) =>
        ((item.Allowed_Roles_HT?.includes(signedinUserRoleHT) &&
        item.Allowed_Acc_Type?.includes(signedinOrgType)) || item.Allowed_Roles_FS?.includes(signedinUserRoleFS)),
    );
    setFilteredItems(filtered);
  }, [signedinUserRoleHT, signedinUserRoleFS, signedinOrgType]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        let payload = {
          TWCountryId: localStorage.getItem("userRegion") || "",         
        };
        const response = await APIS.DashboardTileData(payload);
        const familySituationResponse = await APIS.GetFamilySituatiionCounts(payload);
        const closedCasesResponse = await APIS.GetFamilyClosedCases(payload);
        let data = {
          overallOverdue: response?.data?.message?.data?.overallOverdue || 0,
          familySituation: familySituationResponse?.data?.message || [],
          closedCases: closedCasesResponse?.data?.message || [],
          currentLivingCondition: response?.data?.message?.data?.childPlacement?.[0] || [],
        };
        setTileData({ ...data });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    if(!isSuperAdmin){
      fetchData();
    }
  }, [isSuperAdmin]);

  const leftItems = filteredItems
    .filter((item) => item.column === "left")
    .sort((a, b) => a.sequence - b.sequence);

  const rightItems = filteredItems
    .filter((item) => item.column === "right")
    .sort((a, b) => a.sequence - b.sequence);



  return (
    <Box sx={{ mt: 2 }}>
      <Box px={2}>
        <PageBreadcrumbs
          data={[{ label: t("common:common.Overview", "Overview") }]}
        />
      </Box>
       

      {isSuperAdmin && (
        <Box sx={{ px: 2, pt: 2 }}>
          {filteredItems.find((i) => i.key === "orgOverview")?.component()}
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
              <Box key={item.key}>{item.component(tileData[item.key])}</Box>
            ))}
        </Grid>
        <Grid
          item
          xs={12}
          md={7}
          sx={{ display: "flex", flexDirection: "column", gap: 2 }}
        >
          {rightItems.map((item) => (
            <Box key={item.key}>{item.component(tileData[item.key])}</Box>
          ))}
        </Grid>
      </Grid>
    </Box>
  );
};

export default ConsolidatedOverviewPage;