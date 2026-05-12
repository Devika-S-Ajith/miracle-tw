import React from 'react';
import {
    Card,
    CardContent,
    Stack,
    Typography,
    Box,
    Button,
    Skeleton
} from '@mui/material';
import { Visibility, AssignmentOutlined } from '@mui/icons-material';
import CommonCard from '../../../../components/CommonCard/CommonCard';
import { getDomainIcon, getScoreChangeIcon } from '../../../Dashboard/GovtDashboardOverview/HelperFunctions/DashboardHelperFunction';
import { moodColorMapping, MoodImageMapping } from '../../../Dashboard/Components/StateGovDashboardComponents/MoodImageMapping';

// Skeleton loader subcomponent
const AssessmentSkeleton = () => (
    <Stack spacing={2} sx={{ py: 1 }}>
        {/* Score */}
        <Stack alignItems="center" spacing={1}>
            <Skeleton variant="text" width={80} height={48} />
            <Skeleton variant="text" width={160} height={24} />
        </Stack>

        {/* Domains heading */}
        <Skeleton variant="text" width={80} height={28} />

        {/* Domain rows */}
        <Stack direction="row" flexWrap="wrap" gap={1} sx={{ px: 1 }}>
            {[...Array(4)].map((_, i) => (
                <Stack key={i} direction="row" alignItems="center" spacing={1}
                    sx={{ minWidth: { xs: '45%', sm: 'auto' }, flex: { xs: '0 0 45%', sm: '1 1 auto' } }}
                >
                    <Skeleton variant="circular" width={32} height={32} />
                    <Stack>
                        <Skeleton variant="text" width={40} height={20} />
                        <Skeleton variant="text" width={55} height={16} />
                    </Stack>
                </Stack>
            ))}
        </Stack>

        {/* Milestones heading */}
        <Skeleton variant="text" width={90} height={28} />

        {/* Milestone cards */}
        <Stack direction="row" spacing={1}>
            {[...Array(4)].map((_, i) => (
                <Skeleton key={i} variant="rounded" sx={{ flex: 1, height: 60 }} />
            ))}
        </Stack>

        {/* Button */}
        <Skeleton variant="rounded" height={44} />
    </Stack>
);

// Empty state subcomponent
const NoAssessmentState = ({ t }) => (
    <Stack alignItems="center" justifyContent="center" spacing={1.5} sx={{ py: 4 }}>
        <Box
            sx={{
                width: 56,
                height: 56,
                borderRadius: '50%',
                bgcolor: 'action.hover',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
            }}
        >
            <AssignmentOutlined sx={{ fontSize: 28, color: 'text.secondary' }} />
        </Box>
        <Typography variant="body1" fontWeight="medium" color="text.primary">
        {t("common:family.no_assessment_done_yet", "No assessment done yet")}
        </Typography>
        <Typography variant="body2" color="text.secondary" textAlign="center">
           {t("common:family.assessment_results","Assessment results will appear here once the first assessment is completed.")} 
        </Typography>
    </Stack>
);

const MostRecentAssessmentSummary = ({ apiError, reloadFunc, data, loading, t }) => {

    const milestones = (data && data.milestones && typeof data.milestones === 'object') ? data.milestones : {};

    const milestoneCombined = milestones && typeof milestones === 'object'
        ? {
            inCrisis: (milestones.inCrisis || 0) + (milestones.redFlagInCrisis || 0),
            vulnerable: (milestones.vulnerable || 0) + (milestones.redFlagVulnerable || 0),
            safe: milestones.safe || 0,
            thriving: milestones.thriving || 0
        }
        : {};

    const milestoneKeysToShow = {
        inCrisis: milestoneCombined.inCrisis || 0,
        vulnerable: milestoneCombined.vulnerable || 0,
        safe: milestoneCombined.safe || 0,
        thriving: milestoneCombined.thriving || 0
    };

    const hasData = !loading && data && data.assessmentId;

    return (
        <CommonCard
        title={
            t("common:family.most_recent_assessment_summary", "Most recent assessment summary") +
            (data?.assessmentNumber
              ? ` (${t("common:family.assessment_number", "Assessment #{{number}}", { number: data?.assessmentNumber })})`
              : "")
          }
            apiError={apiError}
            onReload={reloadFunc}
        >
            {loading ? (
                <AssessmentSkeleton />
            ) : !hasData ? (
                <NoAssessmentState t={t} />
            ) : (
                <>
                    <Stack alignItems="center" spacing={1} sx={{ py: 1 }}>
                        <Typography variant="h4" component="div" fontWeight="bold">
                            {data?.thriveScaleScore}%
                        </Typography>
                        {data?.percentageChangeFromFirst && (
                            <Stack direction="row" alignItems="center" spacing={0.5}>
                                <Typography variant="body2" color="text.secondary">
                                    {data?.percentageChangeFromFirst}%
                                </Typography>
                                {getScoreChangeIcon(data?.percentageChangeFromFirst)}
                                <Typography variant="body2" color="text.secondary">
                                {t("common:family.since_assessment_1", "(since assessment #1)")}
                                </Typography>
                            </Stack>
                        )}
                    </Stack>

                    <Typography variant="h6" component="h3" fontWeight="bold" my={0}> 
                    {t("common:family.Domains", "Domains")}
                    </Typography>
                    <Stack
                        direction="row"
                        justifyContent="space-around"
                        sx={{ px: 1, flexWrap: 'wrap', gap: 1 }}
                    >
                        {data?.domainScores?.map((domain) => (
                            <Stack
                                key={domain.id}
                                alignItems="center"
                                direction="row"
                                spacing={1}
                                sx={{
                                    py: 1,
                                    minWidth: { xs: '45%', sm: 'auto' },
                                    flex: { xs: '0 0 45%', sm: '1 1 auto' }
                                }}
                            >
                                <Box
                                    sx={{
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        width: { xs: 24, sm: 32 },
                                        height: { xs: 24, sm: 32 },
                                        flexShrink: 0
                                    }}
                                >
                                    {getDomainIcon(domain.id)}
                                </Box>
                                <Stack alignItems="left">
                                    <Typography variant="body2" fontWeight="medium">
                                        {domain.score}%
                                    </Typography>
                                    {domain?.percentageChange !== null && (
                                        <Stack direction="row" alignItems="center">
                                            <Typography variant="caption" color="text.secondary">
                                                {Math.round(domain.percentageChange * 100) / 100}%
                                            </Typography>
                                            {getScoreChangeIcon(domain.percentageChange)}
                                        </Stack>
                                    )}
                                </Stack>
                            </Stack>
                        ))}
                    </Stack>

                    <Typography variant="h6" component="h3" fontWeight="bold" my={1}>
                    {t("common:common.Milestones", "Milestones")}
                    </Typography>
                    <Stack direction="row" spacing={1}>
                        {Object.entries(milestoneKeysToShow).map(([key, value]) => (
                            <Card
                                key={key}
                                sx={{
                                    flex: 1,
                                    bgcolor: moodColorMapping[key.toUpperCase()] || "#fbb",
                                    minHeight: 60,
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center"
                                }}
                            >
                                <CardContent sx={{ p: 1, "&:last-child": { pb: 1 }, width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                    <Stack
                                        direction="row"
                                        alignItems="center"
                                        justifyContent="center"
                                        spacing={1}
                                        sx={{ width: "100%" }}
                                    >
                                        <Typography variant="body1" fontWeight="bold">
                                            {value}
                                        </Typography>
                                        <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                            <img
                                                src={MoodImageMapping[key.toUpperCase()]}
                                                alt={key}
                                                width={25}
                                                height={25}
                                                style={{ objectFit: "contain" }}
                                            />
                                        </span>
                                    </Stack>
                                </CardContent>
                            </Card>
                        ))}
                    </Stack>

                    <Button
                        variant="outlined"
                        fullWidth
                        component="a"
                        href={`/dashboard/assessments/${data?.assessmentId}/view`}
                        target="_blank"
                        rel="noopener noreferrer"
                        startIcon={<Visibility />}
                        sx={{
                            marginTop: 2,
                            paddingX: 2,
                            paddingY: 1.25,
                            backgroundColor: "white",
                            borderColor: "#1D334B",
                            color: "#1D334B",
                            textTransform: "none",
                            fontWeight: "normal",
                            "&:hover": {
                                backgroundColor: "rgba(0, 0, 0, 0.04)",
                                borderColor: "#1D334B",
                            },
                        }}
                    >
                        {t("common:family.View assessment", "View assessment")}
                    </Button>
                </>
            )}
        </CommonCard>
    );
};

export default MostRecentAssessmentSummary;