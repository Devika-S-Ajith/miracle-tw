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

const ConsolidatedOverviewPage = () => {
  const { t } = useTranslation(["common"]);
  const { signedinUserRoleHT, signedinOrgType } = useContext(CommonDataContext);
  const [filteredItems, setFilteredItems] = useState([]);
  const isSuperAdmin = signedinUserRoleHT === SUPER_ADMIN;
  const tileData = {
    childPlacement: [
      {
        "Foster care": "88",
        "Semi-independent living": "62",
        "Parents/step parents": "35",
        Other: "9",
        "Independent living": "1",
        Kinship: "30",
        CCI: "21",
        "After care": "116",
        "Group living": "5",
      },
    ],
  };

  const canViewReport =
    [MIRACLE, GOVT_CCI, GOVT_ORG, PRIVATE_CCI, NGO_PARTNER].includes(
      signedinOrgType,
    ) && [SUPER_ADMIN, ADMIN, ADMIN_CASEWORKER].includes(signedinUserRoleHT);

  const pieChartProps = {
    data: 3,
    canViewReport,
    reportLink: "/dashboard/reportsCurrentPlacement",
    title: t("common:common.Current Placement"),
    res: tileData?.childPlacement ? tileData?.childPlacement[0] : [],
    labels: [
      "Foster care",
      "Semi- independent living",
      "Parents/step parents",
      "Other",
      "Independent living",
      "Kinship",
      "CCI",
      "After care",
      "Group living",
    ],
  };

  const items = [
    {
      title: "OrganizationalOverview",
      key: "orgOverview",
      sequence: 0,
      column: "left",
      Allowed_Roles: [
        SUPER_ADMIN,
        ADMIN,
        CASEWORKER,
        ADMIN_CASEWORKER,
        VIEW_ONLY,
      ],
      Allowed_Acc_Type: [MIRACLE, GOVT_CCI, GOVT_ORG, NGO_PARTNER, PRIVATE_CCI],
      component: () => <OrganizationalOverview isGeneralDashboard={true} />,
    },
    {
      title: "ReportsPieChart1",
      key: "pieChart1",
      sequence: 1,
      column: "left",
      Allowed_Roles: [ADMIN, ADMIN_CASEWORKER],
      Allowed_Acc_Type: [MIRACLE, GOVT_CCI, GOVT_ORG, NGO_PARTNER, PRIVATE_CCI],
      component: () => <ReportsPieChart {...pieChartProps} />,
    },
    {
      title: "ReportsPieChart2",
      key: "pieChart2",
      sequence: 2,
      column: "left",
      Allowed_Roles: [ADMIN, ADMIN_CASEWORKER],
      Allowed_Acc_Type: [MIRACLE, GOVT_CCI, GOVT_ORG, NGO_PARTNER, PRIVATE_CCI],
      component: () => <ReportsPieChart {...pieChartProps} />,
    },
    {
      title: "RedflagOverview",
      key: "redflagOverview",
      sequence: 3,
      column: "left",
      Allowed_Roles: [ADMIN, CASEWORKER, ADMIN_CASEWORKER, VIEW_ONLY],
      Allowed_Acc_Type: [MIRACLE, GOVT_CCI, GOVT_ORG, NGO_PARTNER, PRIVATE_CCI],
      component: () => <RedflagOverview isGeneralDashboard={true} />,
    },
    {
      title: "ReportsPieChart3",
      key: "pieChart3",
      sequence: 4,
      column: "left",
      Allowed_Roles: [ADMIN, ADMIN_CASEWORKER],
      Allowed_Acc_Type: [MIRACLE, GOVT_CCI, GOVT_ORG, NGO_PARTNER, PRIVATE_CCI],
      component: () => <ReportsPieChart {...pieChartProps} />,
    },
    {
      title: "BehaviourLog",
      key: "behaviourLog",
      sequence: 5,
      column: "right",
      Allowed_Roles: [ADMIN, CASEWORKER, ADMIN_CASEWORKER, VIEW_ONLY],
      Allowed_Acc_Type: [MIRACLE, GOVT_CCI, GOVT_ORG, NGO_PARTNER, PRIVATE_CCI],
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
      sequence: 6,
      column: "right",
      Allowed_Roles: [ADMIN, CASEWORKER, ADMIN_CASEWORKER, VIEW_ONLY],
      Allowed_Acc_Type: [MIRACLE, GOVT_CCI, GOVT_ORG, NGO_PARTNER, PRIVATE_CCI],
      component: () => <AverageThriveScaleScores isGeneralDashboard={true} />,
    },
    {
      title: "TableWithTrendLines",
      key: "domainScoreTable",
      sequence: 7,
      column: "right",
      Allowed_Roles: [ADMIN, CASEWORKER, ADMIN_CASEWORKER, VIEW_ONLY],
      Allowed_Acc_Type: [MIRACLE, GOVT_CCI, GOVT_ORG, NGO_PARTNER, PRIVATE_CCI],
      component: () => <TableWithTrendLines isGeneralDashboard={true} />,
    },
  ];

  useEffect(() => {
    const filtered = items.filter(
      (item) =>
        item.Allowed_Roles?.includes(signedinUserRoleHT) &&
        item.Allowed_Acc_Type?.includes(signedinOrgType),
    );
    setFilteredItems(filtered);
  }, [signedinUserRoleHT, signedinOrgType]);

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
      {/* Org Overview - full width ONLY for super admin */}
      {isSuperAdmin && (
        <Box sx={{ px: 2, pt: 2 }}>
          {filteredItems.find((i) => i.key === "orgOverview")?.component()}
        </Box>
      )}

      <Grid p={2} container spacing={2} alignItems="stretch">
        {/* ══════════════════════════════════════
            LEFT COLUMN  (xs=12 → stacks on mobile, md=5 on desktop)
            Contains: OrganizationalOverview · 3× PieChart · RedflagOverview
        ══════════════════════════════════════ */}
        <Grid
          item
          xs={12}
          md={5}
          sx={{ display: "flex", flexDirection: "column", gap: 2 }}
        >
          {leftItems
            .filter(i => isSuperAdmin ? i.key !== "orgOverview" : true)
            .map((item) => (
                <Box key={item.key}>{item.component()}</Box>
            ))}
        </Grid>

        {/* ══════════════════════════════════════
            RIGHT COLUMN  (xs=12 → stacks on mobile, md=7 on desktop)
            Contains: Behaviour Log · AverageThriveScaleScores · DomainScore/TableWithTrendLines
        ══════════════════════════════════════ */}
        <Grid
          item
          xs={12}
          md={7}
          sx={{ display: "flex", flexDirection: "column", gap: 2 }}
        >
          {rightItems.map((item) => (
            <Box key={item.key}>{item.component()}</Box>
          ))}
        </Grid>
      </Grid>
    </Box>
  );
};

export default ConsolidatedOverviewPage;
