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
    Tooltip,
} from "@mui/material";
import PersonIcon from "@mui/icons-material/Person";
import PhoneIcon from "@mui/icons-material/Phone";
import EmailIcon from "@mui/icons-material/Email";
import WorkIcon from "@mui/icons-material/Work";
import NoteIcon from "@mui/icons-material/StickyNote2";
import BadgeIcon from "@mui/icons-material/Badge";
import FamilyRestroomIcon from "@mui/icons-material/FamilyRestroom";
import PhoneAndroidIcon from "@mui/icons-material/PhoneAndroid";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import { CommonDataContext } from "../../../../common/contexts/CommonDataContext";
import LabelValue from "../../../../components/LabelValue";

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

    const { phoneNumber, occupation, notes, appAccessEnabled, email } = profileInformation || {};

    const initials = getInitials(firstName, lastName);
    const fullName = [firstName, lastName].filter(Boolean).join(" ");

    return (
        <Box sx={{ p: 1, maxWidth: 560, mx: "auto" }}>
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
                        height: 6,
                        borderRadius: "4px 4px 0 0",
                    }}
                />

                <CardContent sx={{ pl: 3 }}>
                    {/* Top: avatar + name + badges */}
                    <Box sx={{ display: "flex", gap: 2, alignItems: "flex-start", mb: 2.5 }}>
                        <Avatar
                            sx={{
                                width: 54,
                                height: 54,
                                bgcolor: isActive ? "primary.main" : "grey.400",
                                fontSize: "1.1rem",
                                fontWeight: 600,
                                flexShrink: 0,
                            }}
                        >
                            {initials || <PersonIcon />}
                        </Avatar>

                        <Box sx={{ flex: 1, minWidth: 0 }}>
                            <Typography
                                variant="h6"
                                sx={{ fontWeight: 600, fontSize: "1.05rem", lineHeight: 1.3 }}
                            >
                                {fullName || "Unnamed Member"}
                            </Typography>

                            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap mt={0.5}>
                                <Chip
                                    size="small"
                                    label={isActive ? "Active" : "Inactive"}
                                    color={isActive ? "success" : "default"}
                                    sx={{ height: 22, fontSize: "0.7rem", fontWeight: 600 }}
                                />
                                
                                    <Chip
                                        size="small"
                                        //icon={<AdminPanelSettingsIcon sx={{ fontSize: "0.85rem !important" }} />}
                                        label={isMinor ? "Minor":"Major"}
                                        color="info"
                                        variant="outlined"
                                        sx={{ height: 22, fontSize: "0.7rem" }}
                                    />
                            
                                {appAccessEnabled && (
                                    <Chip
                                        size="small"
                                        icon={<PhoneAndroidIcon sx={{ fontSize: "0.85rem !important" }} />}
                                        label="App access enabled"
                                        color="primary"
                                        variant="outlined"
                                        sx={{ height: 22, fontSize: "0.7rem" }}
                                    />
                                )}
                            </Stack>
                        </Box>
                    </Box>

                    <Divider sx={{ mb: 2 }} />

                    {/* Fields */}
                    <Grid container columnSpacing={3}>
                        <Grid item xs={12} sm={6}>
                            <FieldRow
                                icon={<PersonIcon fontSize="small" />}
                                label="First name"
                                value={firstName}
                            />
                            <FieldRow
                                icon={<WorkIcon fontSize="small" />}
                                label="Occupation"
                                value={occupation}
                            />
                            <FieldRow
                                icon={<EmailIcon fontSize="small" />}
                                label="Email"
                                value={email}
                                valueColor="primary.main"
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <FieldRow
                                icon={<PersonIcon fontSize="small" />}
                                label="Last name"
                                value={lastName}
                            />
                            <FieldRow
                                icon={<PhoneIcon fontSize="small" />}
                                label="Phone"
                                value={phoneNumber}
                            />
                            <FieldRow
                                icon={<FamilyRestroomIcon fontSize="small" />}
                                label="Relation"
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
                                <NoteIcon sx={{ fontSize: "0.9rem" }} />
                                Notes
                            </Typography>
                            <Paper
                                variant="outlined"
                                sx={{
                                    p: 1.5,
                                    bgcolor: "action.hover",
                                    borderRadius: 1,
                                    borderColor: "divider",
                                }}
                            >
                                <Typography
                                    variant="body2"
                                    sx={{ lineHeight: 1.65, fontSize: "0.82rem" }}
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