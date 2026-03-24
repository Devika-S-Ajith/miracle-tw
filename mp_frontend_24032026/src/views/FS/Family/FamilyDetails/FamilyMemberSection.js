import { Box, Card, CardContent, Chip, Divider, Grid, Stack, Typography } from "@mui/material";
import LabelValue from "../../../../components/LabelValue";
import { convertUnderscoreToText, dateFormatter } from "../../../../constants";

export const FamilyMembersSection = ({childData,parentData,primaryParent}) => {

    const mergedFamilyMembers = [
          ...(primaryParent || []).map(parent => ({
            ...parent,
            isParent: true,
            isPrimary: true,
            backgroundColor: "#e0f7fa",
        })),
        ...(parentData || []).map(parent => ({
            ...parent,
            isParent: true,
            isPrimary: false,
            backgroundColor: "#e0f7fa",
        })),
        // Add isParent: false to all children
        ...(childData || []).map(child => ({
            ...child,
            isParent: false,
            backgroundColor: "#ffcc80",
        }))
       
    ];

    return (
        <Card sx={{ borderRadius: 2 / 8 }}>
            <CardContent>
                <Typography color="textPrimary" fontWeight={700} fontSize="1.25rem">
                    Caregivers and Family Members
                </Typography>
                {mergedFamilyMembers.map((member, index) => (
                    <Box key={index}>
                        <Divider sx={{ borderColor: "#d6dbde", my: 1 }} />

                        <Stack direction="row" alignItems="center" mb={1}>
                            <Typography
                                variant="h6"
                                sx={{
                                    fontWeight: 600,
                                    color: "#000000",
                                    fontSize: "1.125rem",
                                }}
                            >
                                {member.firstName} {member.lastName}
                            </Typography>
                            <Chip
                                label={
                                    member.isPrimary
                                        ? "Primary Caregiver"
                                        : member.isParent
                                            ? "Secondary Caregiver"
                                            : "Child"
                                }
                                sx={{
                                    backgroundColor: member.backgroundColor,
                                    color: member.roleColor,
                                    fontSize: "0.75rem",
                                    fontWeight: 600,
                                    height: "auto",
                                    mx:0.5,
                                    px: 1.5,
                                    py: 0.5,
                                    borderRadius: "20px",
                                    "& .MuiChip-label": {
                                        px: 0,
                                    },
                                }}
                            />
                        </Stack>

                        <Grid container sx={{ height: "55px" }}>
                            <Grid item xs={6}>
                                <LabelValue label={member.isParent ? "Phone" : "Date of birth"} value={member.isParent ? member.phoneNumber : dateFormatter(member?.dateOfBirth)} />
                            </Grid>
                            <Grid item xs={6}>
                                <LabelValue label={member.isParent ? "Email" : "Gender"} value={member.isParent ? member.email : convertUnderscoreToText(member.gender)} />
                            </Grid>
                        </Grid>
                        {member.isParent && <Grid container sx={{ height: "55px" }}>
                            <Grid item xs={6}>
                                <LabelValue label="Occupation" value={member.occupation} />
                            </Grid>
                        </Grid>}
                    </Box>
                ))}
            </CardContent>
        </Card>
    );
};
