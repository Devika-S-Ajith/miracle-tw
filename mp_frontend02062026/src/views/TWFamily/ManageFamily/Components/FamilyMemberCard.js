import { useContext, useState } from "react";
import {
    Box,
    Card,
    CardContent,
    Avatar,
    Typography,
    Chip,
    Divider,
    Grid,
    Stack,
    Paper,
} from "@mui/material";
import { CommonDataContext } from "../../../../common/contexts/CommonDataContext";
import LabelValue from "../../../../components/LabelValue";
import { useTranslation } from "react-i18next";

const SAMPLE_DATA = {
    member_id: "mem_00123",
    firstName: "John",
    lastName: "Doe",
    TWFamilyRelationId: "TWF_04",
    isMajor: true,
    occupation: "Software Engineer",
    phoneNumber: "+1 (555) 867-5309",
    appAccessEnabled: true,
    email: "john.doe@email.com",
    note: "Preferred contact for family communications. Available weekdays after 5pm.",
    isActive: true,
};

function getInitials(firstName, lastName) {
    return `${firstName?.[0] ?? ""}${lastName?.[0] ?? ""}`.toUpperCase();
}

function FieldRow({ icon, label, value, valueColor }) {
    return (
        <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1.5, py: 1 }}>
            <Box
                sx={{
                    mt: 0.25,
                    //color: "text.disabled",
                    display: "flex",
                    flexShrink: 0,
                }}
            >
                {icon}
            </Box>
            <Box sx={{ minWidth: 0, flex: 1 }}>
                <LabelValue
                    label={label}
                    value={value}
                    labelColor="#535F66"
                    fontWeight={700}
                />

            </Box>
        </Box>
    );
}

export default function FamilyMemberCard({ data = SAMPLE_DATA }) {
    const { familyDropdownLists } = useContext(CommonDataContext);
    const {
        firstName,
        lastName,
        TWFamilyRelationId,
        isMinor,
        profileInformation,
        isActive,
    } = data;
    const { t } = useTranslation(["common"]);
    const { phoneNumber, occupation, notes, appAccessEnabled, email } = profileInformation || {};

    const fullName = [firstName, lastName].filter(Boolean).join(" ");

    return (
        <Box sx={{ p: 0, maxWidth: 560, mx: "auto" }}>
            <Card
                elevation={0}
                sx={{
                    //border: "1px solid",
                    borderColor: "divider",
                    borderRadius: 1,
                    overflow: "visible",
                }}
            >
                {/* Header strip */}
                <Box
                    sx={{
                        height: 2,
                        borderRadius: "4px 4px 0 0",
                    }}
                />

                <CardContent sx={{ pt: 1, pb: 2, px: 1 }}>
                    {/* Top: avatar + name + badges */}
                    <Box sx={{ display: "flex", gap: 2, alignItems: "flex-start", mb: 1.5 }}>
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap mt={0}>
                                <Typography
                                    variant="h6"
                                    sx={{ fontWeight: 600, fontSize: "1.05rem", lineHeight: 1.3 }}
                                >
                                    {fullName?.toUpperCase() || "Unnamed Member"}
                                </Typography>
                                <Chip
                                    size="small"
                                    label={isActive ? "Active" : "Inactive"}
                                    color={isActive ? "success" : "default"}
                                    sx={{ height: 22, fontSize: "0.7rem", fontWeight: 600 }}
                                />
                            </Stack>
                            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap mt={0.25}>
                                <Typography
                                    variant="body2"
                                >
                                    {isMinor ? "Minor" : "Major"}
                                </Typography>
                                <Divider
                                    orientation="vertical"
                                    flexItem
                                    sx={{
                                        alignSelf: "center",
                                        height: 14,
                                        borderColor: "text.disabled",
                                        borderRightWidth: 3,
                                    }}
                                />
                                <Typography
                                    variant="body2"
                                >
                                    {appAccessEnabled ? "App Access Enabled" : "App Access Disabled"}
                                </Typography>
                            </Stack>
                        </Box>
                    </Box>

                    <Divider sx={{ mb: 2 }} />

                    {/* Fields */}
                    <Grid container columnSpacing={3}>
                        <Grid item xs={12} sm={6}>
                            <FieldRow

                                label={t("common:common.First name", "First name")}
                                value={firstName}
                            />
                            <FieldRow

                                label={t("common:common.Occupation", "Occupation")}
                                value={occupation}
                            />
                            <FieldRow

                                label={t("common:common.Email", "Email")}
                                value={email}
                                valueColor="primary.main"
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <FieldRow

                                label={t("common:common.Last name", "Last name")}
                                value={lastName}
                            />
                            <FieldRow

                                label={t("common:common.Phone", "Phone")}
                                value={phoneNumber}
                            />
                            <FieldRow

                                label={t("common:common.Relation", "Relation")}
                                value={familyDropdownLists?.familyRelations?.find(item => item.id === TWFamilyRelationId)?.value || TWFamilyRelationId}
                            />
                        </Grid>
                    </Grid>

                    {/* Note */}
                    {notes && (
                        <>
                            <Divider sx={{ my: 2 }} />
                            <Typography
                                variant="body1"
                                sx={{
                                    //color: "text.disabled",
                                    textTransform: "sentencecase",
                                    letterSpacing: "0.06em",
                                    fontWeight: 500,
                                    fontSize: "0.875rem",
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 0.5,
                                    mb: 1,
                                }}
                            >
                                Notes
                            </Typography>
                            <Paper
                                variant="outlined"
                                sx={{
                                    p: 1.5,
                                    bgcolor: "action.hover",
                                    borderRadius: 1,
                                    borderColor: "divider",
                                    maxWidth: "100%",
                                    overflow: "hidden",
                                }}
                            >
                                <Typography
                                    variant="body2"
                                    sx={{
                                        lineHeight: 1.65,
                                        fontSize: "0.82rem",
                                        whiteSpace: "pre-wrap",
                                        overflowWrap: "anywhere",
                                        wordBreak: "break-word",
                                    }}
                                >
                                    {notes}
                                </Typography>
                            </Paper>
                        </>
                    )}
                </CardContent>
            </Card>
        </Box>
    );
}