import React from "react";
import {
  Box,
  Card,
  CardContent,
  Divider,
  Grid,
  Typography,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
// import ParentsDetails from "./ParentsDetails";
import LabelValue from "../../../../components/LabelValue";
import { ModalService } from "../../../../components/Modal";
import {
  convertUnderscoreToText,
  dateFormatter,
} from "../../../../constants";
import ChildDetailForm from "../../Components/ChildDetailForm";

function calculateAge(timestamp) {
  const birthDate = new Date(timestamp);
  const currentDate = new Date();

  // Calculate the difference in years
  let age = currentDate.getFullYear() - birthDate.getFullYear();

  // Adjust the age if the birthdate hasn't occurred yet this year
  if (
    currentDate.getMonth() < birthDate.getMonth() ||
    (currentDate.getMonth() === birthDate.getMonth() &&
      currentDate.getDate() < birthDate.getDate())
  ) {
    age--;
  }

  return age;
}

const ChildDetails = ({ childData, onSuccess }) => {
  return (
    <>
      <Card sx={{ borderRadius: 2 / 8 }}>
        <CardContent>
          <Box
            sx={{
              display: "flex",
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Typography
              color="textPrimary"
              // variant="subtitle2"
              fontWeight={700}
              fontSize="1.25rem"
            >
              Child details
            </Typography>
            <EditIcon
              sx={{ cursor: "pointer" }}
              onClick={() => {
                ModalService.open(
                  ({ close }) => (
                    <ChildDetailForm
                      close={close}
                      childData={childData}
                      onSuccess={onSuccess}
                      openForEdit
                    />
                  ),
                  {
                    modalTitle: "Update Child",
                    width: "50%",
                    hideModalFooter: true,
                  }
                );
              }}
            />
          </Box>

          <Box my>
            <LabelValue
              label="Name"
              value={
                childData
                  ? `${childData?.firstName} ${childData?.lastName}`
                  : undefined
              }
            />
          </Box>

          {/* Parent details */}
          {/* <ParentsDetails /> */}

          {/* Family Details */}
          <Grid container rowSpacing={1.5} my>
            <Grid item xs={6}>
              <LabelValue
                label="Date of Birth"
                value={
                  childData
                    ? `${dateFormatter(childData?.dateOfBirth)} (${calculateAge(
                        childData?.dateOfBirth
                      )} years old)`
                    : undefined
                }
              />
            </Grid>
            <Grid item xs={6}>
              <LabelValue
                label="Date child entered agency"
                value={dateFormatter(childData?.fosterCareStartDate)}
              />
            </Grid>
            <Grid item xs={6}>
              <LabelValue
                label="Gender"
                value={convertUnderscoreToText(childData?.gender)}
              />
            </Grid>
            <Grid item xs={6}>
              <LabelValue
                label="Ethnicity"
                value={convertUnderscoreToText(childData?.ethnicity)}
              />
            </Grid>
            <Grid item xs={6}>
              <LabelValue
                label="Level of care"
                value={convertUnderscoreToText(childData?.level)}
              />
            </Grid>
            <Grid item xs={6}>
              <LabelValue label="Allergy" value={childData?.allergy} />
            </Grid>
            <Grid item xs={6}>
              <LabelValue
                label="Child medicaid number"
                value={childData?.medicaidNumber}
              />
            </Grid>
          </Grid>
          <Divider my />
          <Box my>
            <Typography
              color="textPrimary"
              // variant="subtitle2"
              fontWeight={700}
              fontSize="1.25rem"
            >
              Placement information
            </Typography>
          </Box>
          <Grid container rowSpacing={1.5} my>
            <Grid item xs={6}>
              <LabelValue
                label="Placement status"
                value={convertUnderscoreToText(childData?.placementStatus)}
              />
            </Grid>
            <Grid item xs={6}>
              <LabelValue
                label="Family"
                value={
                  childData?.familyDetails
                    ? childData?.familyDetails?.members.map((member) => (
                        <Box>
                          {member?.firstName} {member?.lastName}
                        </Box>
                      ))
                    : // .join(", ")
                      "-"
                }
              />
            </Grid>
            <Grid item xs={6}>
              <LabelValue
                label="Case manager"
                value={
                  childData?.caseManager
                    ? `${childData?.caseManager?.firstName} ${childData?.caseManager?.lastName}`
                    : undefined
                }
              />
            </Grid>
            <Grid item xs={6}>
              <LabelValue label="Placement Id" value={childData?.placementId} />
            </Grid>
          </Grid>
          <Divider my />

          <Box my>
            <Typography
              color="textPrimary"
              // variant="subtitle2"
              fontWeight={700}
              fontSize="1.25rem"
            >
              Additional Information
            </Typography>
          </Box>
          <Grid container rowSpacing={1.5} my>
            <Grid item xs={6}>
              <LabelValue
                label="First entered welfare system"
                value={childData?.dateOfCWSEntry}
              />
            </Grid>
            <Grid item xs={6}>
              <LabelValue
                label="Other case managers"
                value={convertUnderscoreToText(childData?.hadPrevCM)}
              />
            </Grid>
            <Grid item xs={6}>
              <LabelValue
                label="Previous placements"
                value={convertUnderscoreToText(childData?.hasPrevPlacements)}
              />
            </Grid>

            {childData?.hasPrevPlacements === "YES" && (
              <Grid item xs={6}>
                <LabelValue
                  label="Number of previous placements"
                  value={childData?.numberOfPrevPlacements}
                />
              </Grid>
            )}
            <Grid item xs={12}>
              <LabelValue label="Notes" value={childData?.notes} />
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </>
  );
};

export default ChildDetails;
