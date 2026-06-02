import { Typography, Stack } from "@mui/material";
import ReusableTrendTable from "../../../Dashboard/GovtDashboardOverview/Components/ReusableTrendTable";
import { useEffect, useState } from "react";
import APIS from "../../../../common/hooks/UseApiCalls";
import { formatDate, getOrdinal } from "../../../../helpers/helperFunction";
import { getScoreChangeIcon } from "../../../Dashboard/GovtDashboardOverview/HelperFunctions/DashboardHelperFunction";
import AssessmentWebIcon from "../../../../assets/icons/AssessmentWebIcon";
import InCrisisFlag from "../../../../assets/icons/InCrisisFlag";
import VulnerableFlags from "../../../../assets/icons/VulnerableFlags";
import InterventionIcon from "../../../../assets/icons/InterventionIcon";
import EmptyHourGlassIcon from "../../../../assets/icons/EmptyHourGlassIcon";
import FilledHourGlassIcon from "../../../../assets/icons/FilledHourGlassIcon";
import HalfFilledHourGlassIcon from "../../../../assets/icons/HalfFilledHourGlassIcon";

const columnDefinition = [
    {
        label: "Action",
        id: "action",
        render: (row) => (
            <Typography variant="body2" fontWeight="medium">
                {getOrdinal(parseInt(row.seqNo, 10))} family {row.type?.toLowerCase()}
            </Typography>
        ),
    },
    {
        label: "Date",
        id: "date",
        minWidth: 120,

        render: (row) => {
            // Match month day, year (e.g., Jul 14, 2025)
             const formattedDate = row.type === "ASSESSMENT" ? formatDate(row.dateOfAssessment) : formatDate(row?.submissionDate);
             const dateOnly = formattedDate.match(/([A-Za-z]+ \d{1,2}, \d{4})/)?.[1] || formattedDate;
            return (
                <Stack spacing={0.5}>
                    <Typography variant="body2">
                        {dateOnly}
                    </Typography>
                </Stack>
            );
        },
    },
    {
        label: "Summary",
        id: "summary",
        render: (row) => (
            <Typography variant="body2">{renderSummary(row)} </Typography>
        ),
    },
];

const trendValues = {
    up: 1,
    down: -1,
    same: 0
};


const renderSummary = (summary) => {
    if (!summary) return "No summary available";
    return (
        <Stack direction="row" alignItems="flex-start" flexWrap="wrap" spacing={1}>
            {summary.totalScore !== null && summary.type === "ASSESSMENT" && (
                <>
                    <AssessmentWebIcon style={{ marginLeft: 1, verticalAlign: "middle" }} />
                    <Typography variant="body2" sx={{ ml: 1, display: "flex", alignItems: "center" }}>
                        {summary.totalScore}
                    </Typography>
                    {summary.trend && (
                        <span style={{ marginLeft: 1, mt:1, display: "flex", alignItems: "center" }}>
                            {getScoreChangeIcon(trendValues[summary.trend])}
                        </span>
                    )}
                </>
            )}

            {summary.inCrisisCount !== null && (
                <>
                    <InCrisisFlag style={{ marginLeft: 8, verticalAlign: "middle" }} />
                    <Typography variant="body2" sx={{ ml: 1, display: "flex", alignItems: "center" }}>
                        {summary.inCrisisCount}
                    </Typography>
                </>
            )}
            {summary.vulnerableCount !== null && (
                <>
                    <VulnerableFlags style={{ marginLeft: 8, verticalAlign: "middle" }} />
                    <Typography variant="body2" sx={{ ml: 1, display: "flex", alignItems: "center" }}>
                        {summary.vulnerableCount}
                    </Typography>
                </>
            )}
            {summary.interventionCount !== null && (
                <>
                    <InterventionIcon style={{ marginLeft: 8, verticalAlign: "middle" }} />
                    <Typography variant="body2" sx={{ ml: 1, display: "flex", alignItems: "center" }}>
                        {summary.interventionCount}
                    </Typography>
                </>
            )}
            {summary?.notStarted !== null && (
                <>
                    <EmptyHourGlassIcon style={{ marginLeft: 8, verticalAlign: "middle" }} />
                    <Typography variant="body2" sx={{ ml: 1, display: "flex", alignItems: "center" }}>
                        {summary.notStarted}
                    </Typography>
                </>
            )}
            {summary?.inProgress !== null && (
                <>
                    <HalfFilledHourGlassIcon style={{ marginLeft: 8, verticalAlign: "middle" }} />
                    <Typography variant="body2" sx={{ ml: 1, display: "flex", alignItems: "center" }}>
                        {summary.inProgress}
                    </Typography>
                </>
            )}
            {summary?.completed !== null && (
                <>
                    <FilledHourGlassIcon style={{ verticalAlign: "middle" }} />
                    <Typography variant="body2" sx={{ ml: 1, display: "flex", alignItems: "center" }}>
                        {summary.completed}
                    </Typography>
                </>
            )}
        </Stack>
    )
};

const FamilyHistory = ({ t, HTFamilyId }) => {

    const [familyHistoryData, setFamilyHistoryData] = useState([]);
    const [loadingFamilyHistory, setLoadingFamilyHistory] = useState(false);
    const [apiError, setApiError] = useState(false);

    useEffect(() => {
        getFamilyHistory()
        return () => { };
    }, []);

    const getFamilyHistory = async ({ page = 1, rowCount = 10 } = {}) => {
        setLoadingFamilyHistory(true);
        setApiError(false);

        
        const payload = {
            "HTFamilyId": HTFamilyId,
            "pageNumber": page,
            "rowCount": rowCount,
            "orderByField": [
                [
                    "submissionDate",
                    "DESC"
                ]
            ]
        };
            
        try {

            const response = await APIS.GetFamilyHistoryList(payload);
            if (response?.data) {
                const familyHistoryList = response.data;
                setFamilyHistoryData(
                    familyHistoryList
                );
            }
        } catch (error) {
            setApiError(true);
            console.error("Error fetching family history data:", error);
        } finally {
            setLoadingFamilyHistory(false);
        }
    };

    return (
        <ReusableTrendTable
            columns={columnDefinition}
            title={t(`common:family.History`, `History`)}
            subheader={null}
            tableData={familyHistoryData?.data || []}
            loading={loadingFamilyHistory}
            skeltonRowcount={2}
            apiError={apiError}
            onReload={getFamilyHistory}
            enablePagination={true}
            totalPageCount={familyHistoryData?.pageCount || 0}
            totalItems={familyHistoryData?.totalCount || 0}
            t={t}
        />

    );
};

export default FamilyHistory;