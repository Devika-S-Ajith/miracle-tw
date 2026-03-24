import { Box, Typography, Divider, Button } from "@mui/material";
import { formatDateMonthDayYear } from "../../helpers/helperFunction";
import { getStatusIcon } from "../IndividualInterventions/IndividualInterventions";
import { convertUnderscoreToText, getMappedMessage, StatusMapping } from "../../constants";
import { ChildrenProfileStack } from "../ProfileStack/ChildrenProfileStack";
import StatusFrame from "../StatusFrame/StatusFrame";

 // Adjust import paths as needed

const InterventionViewContent = ({ row, familyMembers, familyName, close, t }) => (
    <Box sx={{ paddingY: 2 }}>
        <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" fontWeight="600" gutterBottom>
                Dates active
            </Typography>
            <Typography variant="body2">
                Started {formatDateMonthDayYear(row?.progressReportStartDate) || ""}
            </Typography>
            <Typography variant="body2">
                {row?.progressReportSubmitedDate ? `Completed ${formatDateMonthDayYear(row?.progressReportSubmitedDate)}` : ""}
            </Typography>
        </Box>

        {/* Intervention Notes Section */}
        <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" fontWeight="600" gutterBottom>
                Intervention notes
            </Typography>
            <Typography variant="body2" gutterBottom>
                May 1 2023
            </Typography>
            <Box
                sx={{
                    position: "relative",
                    maxWidth: "95%",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    display: "-webkit-box",
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: "vertical",
                    whiteSpace: "pre-line",
                    cursor: row?.interventionNotes?.length > 0 ? "pointer" : "default"
                }}
                title={row?.interventionNotes}
            >
                {row?.interventionNotes}
            </Box>
        </Box>
        <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" fontWeight="600" gutterBottom>
                This intervention applies to
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                <ChildrenProfileStack
                    familyMembers={familyMembers}
                    childrenAppliedTo={row.childrenApplied}
                    familyAppliedTo={row.familyApplied ? familyName : null}
                />
            </Box>
        </Box>

        {/* Intervention Status Section */}
        <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" fontWeight="600" gutterBottom>
                Intervention status
            </Typography>
            <StatusFrame
              type={row.intervention_status  === "Completed" ? "success" : "error"}
              icon={getStatusIcon(row.intervention_status  || "Not Started")}
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
            <Box
                sx={{
                    mt: 1,
                    position: "relative",
                    maxWidth: "95%",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    display: "-webkit-box",
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: "vertical",
                    whiteSpace: "pre-line",
                    cursor: row?.progressReportNotes?.length > 0 ? "pointer" : "default"
                }}
                title={row?.progressReportNotes}
            >
                {row?.progressReportNotes}
            </Box>
        </Box>
        <Divider my={0} />
        <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2, marginTop: 2 }}>
            <Button variant="contained" onClick={close}>
                {t("common:common.Close")}
            </Button>
        </Box>
    </Box>
);

export default InterventionViewContent;