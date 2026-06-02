import React, { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Typography, Box, IconButton, Stack, CircularProgress } from "@mui/material";
import { GridExpandMoreIcon } from "@mui/x-data-grid";
import ChevronRight from "@mui/icons-material/ChevronRight";
import RemoveRedEyeIcon from "@mui/icons-material/RemoveRedEye";
import EmptyHourGlassIcon from "../../assets/icons/EmptyHourGlassIcon.js";
import FilledHourGlassIcon from "../../assets/icons/FilledHourGlassIcon.js";
import Loader from "../UserComponents/Loader";
import ReusableTrendTable from "../../views/Dashboard/GovtDashboardOverview/Components/ReusableTrendTable";
import { longMonthDayYear } from "../../helpers/helperFunction";
import { getDomainIcon } from "../../views/Dashboard/GovtDashboardOverview/HelperFunctions/DashboardHelperFunction.js";
import CommonCard from "../CommonCard/CommonCard.js";
import { moodColorMapping, MoodImageMapping } from "../../views/Dashboard/Components/StateGovDashboardComponents/MoodImageMapping.js";
import StatusFrame from "../StatusFrame/StatusFrame.js";
import { getStatusIcon } from "../IndividualInterventions/IndividualInterventions.js";
import { convertUnderscoreToText, getMappedMessage, StatusMapping } from "../../constants.js";
import { ModalService } from "../Modal/ModalRoot.js";
import InterventionViewContent from "./InterventionViewContent.js";


const MilestonesTable = ({
    entityId,
    getMilestonesApi,
    getInterventionsApi,
    title = "All milestones",
    type ="FAMILY_MILESTONE",
    familyMembers = [],
    familyName = ""
}) => {
    const { t } = useTranslation(["common"]);
    const [loading, setLoading] = useState(false);
    const [milestones, setMilestones] = useState([]);
    const [interventionLoadingMilestone, setInterventionLoadingMilestone] = useState(null);
    const [apiError, setApiError] = useState(false);
    const [totalPageCount, setTotalPageCount] = useState(0);
    const [totalCount, setTotalCount] = useState(0);

    const handleAccordionToggle = async (row, value, expanded, setExpanded) => {

        setExpanded((prev) => !prev);
        // Only fetch interventions when expanding
        if (!expanded) {
            setInterventionLoadingMilestone(row.name);
            try {
                const res = await getInterventionsApi(row.name);
                setMilestones((prevMilestones) =>
                    prevMilestones.map((milestone) =>
                        milestone.name === row.name
                            ? { ...milestone, expandedContent: generateInterventionTable(res.data.data) }
                            : milestone
                    )
                );
            } catch (err) {
                console.error("Error fetching interventions:", err);

            } finally {
                setInterventionLoadingMilestone(null);
            }
        }
    };

   const generateInterventionTable = (interventions) => {
    return (
        <CommonCard title="Interventions">
            <Box sx={{ width: "100%", mt: 2 }}>
                {interventionLoadingMilestone ? (
                    <Loader loading={true} />
                ) : (
                    <Box>
                        {interventions && interventions.length > 0 ? (
                            <Box sx={{ overflowX: "auto" }}>
                                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                                    <thead>
                                        <tr>
                                            {interventionColumnDefinition.map((col) => (
                                                <th
                                                    key={col.id}
                                                    style={{
                                                        textAlign: "left",
                                                        padding: "8px",
                                                        borderBottom: "1px solid #eee",
                                                        fontWeight: 600,
                                                        width: col.width, // Apply custom width
                                                    }}
                                                >
                                                    {col.label}
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {interventions.map((row, idx) => (
                                            <tr key={idx}>
                                                {interventionColumnDefinition.map((col) => (
                                                    <td
                                                        key={col.id}
                                                        style={{
                                                            padding: "8px",
                                                            borderBottom: "1px solid #eee",
                                                            width: col.width, // Apply custom width
                                                        }}
                                                    >
                                                        {col.render(row)}
                                                    </td>
                                                ))}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </Box>
                        ) : (
                            <Typography variant="body2" sx={{ p: 2, color: "text.secondary" }}>
                                No interventions found for this milestone.
                            </Typography>
                        )}
                    </Box>
                )}
            </Box>
        </CommonCard>
    );
};

    const getMilestones = useCallback(
        async ({ page = 1, rowCount = 10 } = {}) => {
            setLoading(true);
            setApiError(false);
            try {
                const data = await getMilestonesApi(page, rowCount);
                // Map API data
                const mapped = (data.data.data || []).map((item) => ({
                    id: item.id,
                    name: item.milestone_name || item.name,
                    redFlag: item.redFlag,
                    domain_id: item.domain_id,
                    domainImage: getDomainIcon(item.HTQuestionDomainId),
                    active_interventions: item.active_interventions || 0,
                    resolved_interventions: item.resolved_interventions || 0,
                    assessment_modes: item.assessment_modes || [],
                    expand: true,
                    from: item.type,
                    family: familyName
                }));
                setTotalPageCount(data?.data?.pageCount || 0);
                setTotalCount(data?.data?.totalCount || 0);
                setMilestones(mapped);
            } catch (err) {
                console.error("Error fetching milestones:", err);
                setApiError(true);
            } finally {
                setLoading(false);
            }
        },
        [entityId, getMilestonesApi]
    );

    const handleViewClick = (row) => {
        ModalService.open(({ close }) => (
           <InterventionViewContent row={row} familyMembers={familyMembers} familyName={familyName} close={close} t={t} />
        ), {
            modalTitle: t("common:common.Intervention", "intervention") + ": " + row.intervention,
            width: "30%",
            hideModalFooter: true,
            enableClose: false,
        });
    }

    useEffect(() => {
        getMilestones();
    }, []);

    // Column definitions for interventions inner table
    const interventionColumnDefinition = [
        {
            label: "Status",
            id: "status",
            width: "20%", // Customizable width
            render: (row) => (
                <StatusFrame
                    type={row.intervention_status === "Completed" ? "success" : "error"}
                    icon={getStatusIcon(row.intervention_status || "Not Started")}
                    label={
                        row.intervention_status
                            ? getMappedMessage(
                                convertUnderscoreToText(row.intervention_status),
                                row?.followupType
                            )
                            : "Not Started"
                    }
                    statusType={row?.followupType}
                    bgColor={StatusMapping[row?.followupType]?.color || "#BC104133"}
                    borderColor={
                        StatusMapping[row?.followupType]?.borderColor || "#BC1041"
                    }
                />
            ),
        },
        {
            label: "Intervention",
            id: "intervention",
            width: "55%", // More width for intervention
            render: (row) => (
                <Stack spacing={0.5}>
                    <Typography variant="body2"
                        sx={{
                            wordBreak: "break-word",
                            whiteSpace: "pre-line",
                            maxWidth: "100%", // Use full available width
                        }}>{row.intervention}</Typography>
                </Stack>
            ),
        },
        {
            label: "Dates active",
            id: "dates",
            width: "15%", // Customizable width
            render: (row) => (
                <Typography variant="body2">
                    {(row.progressReportStartDate || row.progressReportSubmitedDate) ? (
                        <>
                            {row.progressReportStartDate ? longMonthDayYear(row.progressReportStartDate) : ""}
                            {row.progressReportSubmitedDate ? ` - ${longMonthDayYear(row.progressReportSubmitedDate)}` : ""}
                        </>
                    ) : (
                        ""
                    )}
                </Typography>
            ),
        },
        {
            label: "Actions",
            id: "actions",
            width: "10%", // Customizable width
            render: (row) => (
                <RemoveRedEyeIcon id="view-icon" sx={{ cursor: "pointer" }} onClick={() => handleViewClick(row)} />
            ),
        },
    ];

    // Column definitions for main milestones table
    const columnDefinition = [
        {
            label: "Milestone",
            id: "milestone",
            render: (row, value, expanded, setExpanded) => {
                return (
                    <>
                        <Box display="flex" alignItems="center">
                            <IconButton
                                onClick={() => handleAccordionToggle(row, value, expanded, setExpanded)}
                                size="small"
                                disabled={interventionLoadingMilestone === row.name}
                            >
                                {interventionLoadingMilestone === row.name
                                    ? (
                                        <CircularProgress size={18} />
                                    )
                                    : (
                                        row?.expand && (expanded ? <GridExpandMoreIcon /> : <ChevronRight />)
                                    )
                                }
                            </IconButton>
                            {row.redFlag && (
                                <img
                                    src="/static/icons/redFlag.svg"
                                    alt="Red Flag"
                                    width={18}
                                    height={18}
                                    style={{ marginRight: 6 }}
                                />
                            )}
                            <Typography variant="body2">{row.name}</Typography>
                        </Box>
                    </>
                );
            },
        },
        {
            label: "Domain",
            id: "domain",
            render: (row) => (
                row.domainImage
            ),
        },
        {
            label: "Active and resolved interventions",
            id: "interventions",
            render: (row) => (
                <Stack direction="row" alignItems="center" spacing={1}>
                    <EmptyHourGlassIcon />
                    <Typography variant="body2" fontWeight="bold">
                        {row.active_interventions}
                    </Typography>
                    <Typography variant="body2">|</Typography>
                    <FilledHourGlassIcon />
                    <Typography variant="body2">
                        {row.resolved_interventions}
                    </Typography>
                </Stack>
            ),
        },
        ...(type === "CHILD_MILESTONE"
            ? [{
                label: "From",
                id: "from",
                render: (row) => (
                    <Typography variant="body2" >
                        {row.from == "CHILD" ? "Child assessment" : "Family assessment-" + row.family}
                    </Typography>
                ),
            }]
            : []
        ),
        {
            label: "Rating by assessment",
            id: "rating",
            render: (row) => (
                <Box sx={{ display: "flex", gap: 0 }}>
                    {row.assessment_modes.map((assessment, idx, arr) => {
                        let borderRadius = 0;
                        if (idx === 0 && arr.length === 1) {
                            borderRadius = "6px";
                        } else if (idx === 0) {
                            borderRadius = "6px 0 0 6px";
                        } else if (idx === arr.length - 1) {
                            borderRadius = "0 6px 6px 0";
                        }

                        // Determine which image to show
                        const imageSrc = (row.redFlag && idx === 0)
                            ? "/static/icons/redflag.svg"
                            : MoodImageMapping[assessment.mode];

                        // Get background color from mapping
                        const backgroundColor = moodColorMapping[assessment.mode] || "#fbb";

                        return (
                            <span
                                key={idx}
                                style={{
                                    background: backgroundColor,
                                    padding: "4px 8px",
                                    borderRadius,
                                    display: "inline-flex",
                                    alignItems: "center",
                                    gap: "4px",
                                }}
                            >
                                {imageSrc && (
                                    <img
                                        src={imageSrc}
                                        alt={row.redFlag && idx === 0 ? "Red Flag" : "Mood"}
                                        width={14}
                                        height={14}
                                    />
                                )}
                                <Typography variant="body2" component="span">
                                    A{assessment.assessmentNo}
                                </Typography>
                            </span>
                        );
                    })}
                </Box>
            ),
        },
    ];

    return (
        <ReusableTrendTable
            columns={columnDefinition}
            title={t(title)}
            subheader={null}
            tableData={milestones}
            loading={loading}
            skeltonRowcount={5}
            apiError={apiError}
            onReload={getMilestones}
            t={t}
            isExpandable={true}
            enablePagination={true}
            totalPageCount={totalPageCount || 0}
            totalItems={totalCount || 0}
        />
    );
};

export default MilestonesTable;