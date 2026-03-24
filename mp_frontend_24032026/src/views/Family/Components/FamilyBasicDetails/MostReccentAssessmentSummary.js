import React from 'react';
import {
    Card,
    CardContent,
    Stack,
    Typography,
    Box,
    Button
} from '@mui/material';
import {Visibility } from '@mui/icons-material';
import CommonCard from '../../../../components/CommonCard/CommonCard';
import { getDomainIcon, getScoreChangeIcon } from '../../../Dashboard/GovtDashboardOverview/HelperFunctions/DashboardHelperFunction';
import { moodColorMapping, MoodImageMapping } from '../../../Dashboard/Components/StateGovDashboardComponents/MoodImageMapping';

// Main FamilySummaryCard component
const MostReccentAssessmentSummary
    = ({ apiError, reloadFunc, data, loading }) => {

        // Use data.milestoneData if available, else fallback to demo
        // Safely extract milestones, default to empty object if not present
        const milestones = (data && data.milestones && typeof data.milestones === 'object') ? data.milestones : {};

        // Filter out redFlagInCrisis and redFlagVulnerable from milestones, handle empty/invalid milestones
        const milestoneCombined = milestones && typeof milestones === 'object'
            ? (() => {
                // Create a new object with combined values
                const combined = {
                    inCrisis: (milestones.inCrisis || 0) + (milestones.redFlagInCrisis || 0),
                    vulnerable: (milestones.vulnerable || 0) + (milestones.redFlagVulnerable || 0),
                    safe: milestones.safe || 0,
                    thriving: milestones.thriving || 0
                };

                // Return keys from the combined object
                return combined;
            })()
            : [];

        // Prepare milestone keys and values for display
        const milestoneKeysToShow = {
            inCrisis: milestoneCombined.inCrisis || 0,
            vulnerable: milestoneCombined.vulnerable || 0,
            safe: milestoneCombined.safe || 0,
            thriving: milestoneCombined.thriving || 0
        };

        return (
            <CommonCard
            title={"Most recent assessment summary" + (data?.assessmentNumber ? ` (Assessment #${data?.assessmentNumber})` : "")}
            apiError={apiError}
            onReload={reloadFunc}
            >
            <Stack alignItems="center" spacing={1} sx={{ py: 1 }}>
                <Typography variant="h4" component="div" fontWeight="bold">
                {data?.thriveScaleScore}%
                </Typography>
                {data?.percentageChangeFromFirst &&
                <Stack direction="row" alignItems="center" spacing={0.5}>
                    <Typography variant="body2" color="text.secondary">
                    {data?.percentageChangeFromFirst}%
                    </Typography>
                    {getScoreChangeIcon(data?.percentageChangeFromFirst)}
                    <Typography variant="body2" color="text.secondary">
                    (since assessment #1)
                    </Typography>
                </Stack>}

            </Stack>
            <Typography variant="h6" component="h3" fontWeight="bold" my={0}>
                Domains
            </Typography>
            <Stack direction="row" justifyContent="space-between" sx={{ px: 1 }}>
                {data?.domainScores?.map((domain) => (
                <Stack
                    key={domain.id}
                    alignItems="center"
                    direction="row"
                    spacing={1}
                    sx={{ py: 1 }}
                >
                    <Box
                    sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        width: "100%",
                        height: "100%",
                    }}
                    >
                    {getDomainIcon(domain.id)}
                    </Box>
                    <Stack alignItems="left">
                    <Typography variant="body2" fontWeight="medium">
                        {domain.score}%
                    </Typography>
                    {domain?.percentageChange !== null && <Stack direction="row" alignItems="left" >
                        <Typography variant="caption" color="text.secondary">
                        {Math.round(domain.percentageChange * 100) / 100}%
                        </Typography>
                        {getScoreChangeIcon(domain.percentageChange)}
                    </Stack>}
                    </Stack>
                </Stack>
                ))}
            </Stack>

            <Typography variant="h6" component="h3" fontWeight="bold" my={1}>
                Milestones
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
                        <span
                        style={{ display: "flex", alignItems: "center", gap: 8 }}
                        >
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
                onClick={() => window.open(`/dashboard/assessments/${data?.assessmentId}/view`, '_blank', 'noopener,noreferrer')}
                startIcon={<Visibility />}
                sx={{
                marginTop: 2,
                paddingX: 2,
                paddingY: 1.25,
                backgroundColor: "white",
                borderColor: "#1D334B;",
                color: "#1D334B;",
                textTransform: "none",
                fontWeight: "normal",
                "&:hover": {
                    backgroundColor: "rgba(0, 0, 0, 0.04)",
                    borderColor: "#1D334B;",
                },
                }}
            >
                View assessment
            </Button>
            </CommonCard>
        );
    };

export default MostReccentAssessmentSummary;



