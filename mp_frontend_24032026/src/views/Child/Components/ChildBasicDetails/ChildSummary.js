import React, { useContext } from "react";
import CommonCard from "../../../../components/CommonCard/CommonCard";
import { Box, Chip, Divider, Grid, Stack } from "@mui/material";
import BodyText from "../../../../components/BodyText/BodyText";
import { convertUnderscoreToText, dateFormatter } from "../../../../constants";
import {
  getLanguageNameFromId,
  formatAddressFromContactInfo,
  calculateAge,
} from "../../../../helpers/helperFunction";
import LabelValue from "../../../../components/LabelValue/LabelValue";
import { CommonDataContext } from "../../../../common/contexts/CommonDataContext";
import { useTranslation } from "react-i18next";


const ChildSummary = ({ child }) => {
  const { t } = useTranslation(["common"]); 
  const { locationList } = useContext(CommonDataContext);
  return (
    <CommonCard title="Child Summary">
      <Grid container direction="row" spacing={1}>
        <Grid item xs={12} md={6}>
          <LabelValue
            label={t("common:infoCard.Full name", "Full name")}
            value={`${child?.firstName} ${child?.lastName ? child.lastName : ""}`}
            labelColor="#535F66"
            fontWeight={700}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <LabelValue
            label={t("common:infoCard.Status", "Status")}
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
            tooltip={false}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <LabelValue
            label={t("common:infoCard.Date of Birth / Age", "Date of Birth / Age")}
            value={
              child?.dateOfBirth &&
              `${dateFormatter(child?.dateOfBirth, "short")} (${calculateAge(dateFormatter(child?.dateOfBirth), t)})`
            }
            labelColor="#535F66"
            fontWeight={700}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <LabelValue
            label={t("common:common.Gender", "Gender")}
            value={` ${convertUnderscoreToText(child?.gender)}`}
            labelColor="#535F66"
            fontWeight={700}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <LabelValue
            label={t("common:common.Address", "Address")}
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
            label={t("common:common.Phone number", "Phone number")}
            value={child?.profileInformation?.phoneNumber || "-"}
            labelColor="#535F66"
            fontWeight={700}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <LabelValue
            label={t("common:infoCard.Family associated with", "Family associated with")}
            value={child?.familyName}
            labelColor="#535F66"
            fontWeight={700}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <LabelValue
            label={t("common:infoCard.Living situation", "Living situation")}
            // check living situation
            value={child?.livingSituation || "-"}
            labelColor="#535F66"
            fontWeight={700}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <LabelValue
            label={t("common:common.Primary language", "Primary language")}
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
            label={t("common:common.Allergies", "Allergies")}
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
            label={t("common:common.Case worker", "Case worker")}
            value={`${child?.caseWorkerFirstName} ${child?.caseWorkerLastName ? child.caseWorkerLastName : ""}`}
            labelColor="#535F66"
            fontWeight={700}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <LabelValue
            label={t("common:common.Case number", "Case number")}
            // check whether case no is placement id
            value={`CHLD-${child?.childCode}`}
            labelColor="#535F66"
            fontWeight={700}
          />
        </Grid>
      </Grid>


      {/* <Stack
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
      </Stack> */}
    </CommonCard>
  );
};

export default ChildSummary;