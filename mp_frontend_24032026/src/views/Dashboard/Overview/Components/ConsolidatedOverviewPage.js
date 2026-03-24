import OrganizationalOverview from '../../GovtDashboardOverview/OrganizationalOverview';
import PageBreadcrumbs from '../../../../components/PageBreadcrumbs/PageBreadcrumbs';
import { Box } from '@mui/system';
import { Card, Grid, CardContent } from '@mui/material';
import { useTranslation } from 'react-i18next';
import AverageThriveScaleScores from '../../GovtDashboardOverview/AverageThriveScaleScores';
import TableWithTrendLines from '../../GovtDashboardOverview/DomainScoreByAssessment';
import RedflagOverview from '../../GovtDashboardOverview/RedflagOverview';
import LogOverviewList from '../../../FS/Components/LogOverviewList';
import { ADMIN, ADMIN_CASEWORKER, GOVT_CCI, GOVT_ORG, MIRACLE, NGO_PARTNER, PRIVATE_CCI, SUPER_ADMIN } from '../../../../helpers/constant';
import ReportsPieChart from './ReportsPieChart';
import { useContext } from 'react';
import { CommonDataContext } from '../../../../common/contexts/CommonDataContext';


const ConsolidatedOverviewPage = () => {
    const { t } = useTranslation(["common"]);
    const { signedinUserRoleHT, signedinOrgType } = useContext(CommonDataContext);

    const tileData = {
        childPlacement: [
            {
                "Foster care": "88",
                "Semi-independent living": "62",
                "Parents/step parents": "35",
                "Other": "9",
                "Independent living": "1",
                "Kinship": "30",
                "CCI": "21",
                "After care": "116",
                "Group living": "5"
            }
        ]
    };

    const canViewReport =
        [MIRACLE, GOVT_CCI, GOVT_ORG, PRIVATE_CCI, NGO_PARTNER].includes(signedinOrgType) &&
        [SUPER_ADMIN, ADMIN, ADMIN_CASEWORKER].includes(signedinUserRoleHT);

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

    return (
        <Box sx={{ mt: 2 }}>
            <Box px={2}>
                <PageBreadcrumbs
                    data={[{ label: t("common:common.Overview", "Overview") }]}
                />
            </Box>

            <Grid
                p={2}
                container
                spacing={2}
                alignItems="stretch"
                sx={{ minHeight: 1, height: "100%" }}
            >
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
                    <Box>
                        <OrganizationalOverview isGeneralDashboard={true} />
                    </Box>

                    <Box>
                        <ReportsPieChart {...pieChartProps} />
                    </Box>

                    <Box>
                        <ReportsPieChart {...pieChartProps} />
                    </Box>

                    <Box>
                        <RedflagOverview isGeneralDashboard={true} />
                    </Box>

                    <Box>
                        <ReportsPieChart {...pieChartProps} />
                        
                    </Box>
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
                    {/* Behaviour Log */}
                    <Box>
                        <Card>
                            <CardContent>
                                <LogOverviewList module="dashboard" listData={null} />
                            </CardContent>
                        </Card>
                    </Box>

                    {/* Average Thrive Scale Scores by Assessment */}
                    <Box>
                        <AverageThriveScaleScores isGeneralDashboard={true} />
                    </Box>

                    {/* Domain Score / Table with Trend Lines */}
                    <Box>
                        <TableWithTrendLines isGeneralDashboard={true} />
                    </Box>
                </Grid>
            </Grid>
        </Box>
    );
};

export default ConsolidatedOverviewPage;