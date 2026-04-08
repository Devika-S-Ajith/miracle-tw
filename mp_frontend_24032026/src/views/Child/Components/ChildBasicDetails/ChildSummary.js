import React, { useContext } from "react";
import CommonCard from "../../../../components/CommonCard/CommonCard";
import { Box, Chip, Divider, Grid, Stack } from "@mui/material";
import BodyText from "../../../../components/BodyText/BodyText";
import { convertUnderscoreToText, dateFormatter } from "../../../../constants";
import {
  calculateAgeReverseOrder,
  getLanguageNameFromId,
  formatAddressFromContactInfo,
} from "../../../../helpers/helperFunction";
import LabelValue from "../../../../components/LabelValue/LabelValue";
import { CommonDataContext } from "../../../../common/contexts/CommonDataContext";


const ChildSummary = ({ child }) => {
  const { locationList } = useContext(CommonDataContext);
  return (
    <CommonCard title="Child Summary">
      <Grid container direction="row" spacing={1}>
        <Grid item xs={12} md={6}>
          <LabelValue
            label="Full name"
            value={`${child?.firstName} ${child?.lastName}`}
            labelColor="#535F66"
            fontWeight={700}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <LabelValue
            label="Status"
            value={
              <Chip
                label={child?.status}
                size="small"
                sx={{
                  backgroundColor:
                    child?.status === "Active"
                      ? "#3DAA1D"
                      : child?.status === "Case Closed"
                        ? "#D6DBDE"
                        : "#71C5D4",
                  color: child?.status === "Active" ? "white" : "black",
                  fontSize: "0.75rem",
                  fontWeight: 600,
                  borderRadius: "20px",
                }}
              />
            }
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <LabelValue
            label="Date of Birth / Age"
            value={
              child?.dateOfBirth &&
              `${dateFormatter(child?.dateOfBirth, "short")} (${calculateAgeReverseOrder(dateFormatter(child?.dateOfBirth))})`
            }
            labelColor="#535F66"
            fontWeight={700}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <LabelValue
            label="Gender"
            value={` ${convertUnderscoreToText(child?.gender)}`}
            labelColor="#535F66"
            fontWeight={700}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <LabelValue
            label="Address"
            value={
              child?.contactInformation
                ? formatAddressFromContactInfo(
                    child?.contactInformation,
                    locationList,
                  )
                : "-"
            }
            labelColor="#535F66"
            fontWeight={700}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <LabelValue
            label="Phone number"
            value={child?.profileInformation?.phoneNumber || "-"}
            labelColor="#535F66"
            fontWeight={700}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <LabelValue
            label="Family associated with"
            value={child?.familyName}
            labelColor="#535F66"
            fontWeight={700}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <LabelValue
            label="Living situation"
            // check living situation
            value={child?.livingSituation || "-"}
            labelColor="#535F66"
            fontWeight={700}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <LabelValue
            label="Primary language"
            value={
              getLanguageNameFromId(child?.profileInformation?.TWLanguageId) ||
              "-"
            }
            labelColor="#535F66"
            fontWeight={700}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <LabelValue
            label="Allergies"
            value={`${child?.profileInformation?.allergy || "-"}`}
            labelColor="#535F66"
            fontWeight={700}
          />
        </Grid>
        <Grid item xs={12}>
          <Divider sx={{ mt: 1, borderBottomWidth: 2, mb: 1 }} />
        </Grid>


        <Grid item xs={12} md={6}>
          <LabelValue
            label="Case worker"
            value={`${child?.caseWorkerFirstName} ${child?.caseWorkerLastName ? child.caseWorkerLastName : ""}`}
            labelColor="#535F66"
            fontWeight={700}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <LabelValue
            label="Case number"
            // check whether case no is placement id
            value={`CHLD-${child?.id}`}
            labelColor="#535F66"
            fontWeight={700}
          />
        </Grid>
        <Grid item xs={12}>
          <Divider sx={{ mt: 1, borderBottomWidth: 2, mb: 1 }} />
        </Grid>
      </Grid>


      <Stack
        justifyContent="center"
        alignItems="center"
        direction="row"
        spacing={2}
        mt={1}
      >
        <Stack>
          <BodyText value={"55.7%"} fontWeight={600} />
          <BodyText value={"Jan 1 2024"} />
        </Stack>
        <img
          // key={index}
          src="/static/icons/rightArrow.png"
          style={{ width: 25, height: 25 }}
        />
        <Stack>
          <BodyText value={"55.7%"} fontWeight={600} />
          <BodyText value={"Jan 1 2024"} />
        </Stack>
      </Stack>
    </CommonCard>
  );
};

export default ChildSummary;