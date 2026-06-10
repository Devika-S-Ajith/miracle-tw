import React, { useContext } from "react";
import CommonCard from "../../../../components/CommonCard/CommonCard";
import { Chip, Divider, Grid } from "@mui/material";
import { convertUnderscoreToText, dateFormatter } from "../../../../constants";
import {
  getLanguageNameFromId,
  formatAddressFromContactInfo,
  calculateAge,
  splitCountryCodeAndPhoneNumber,
} from "../../../../helpers/helperFunction";
import LabelValue from "../../../../components/LabelValue/LabelValue";
import { CommonDataContext } from "../../../../common/contexts/CommonDataContext";
import { useTranslation } from "react-i18next";


const ChildSummary = ({ child }) => {
  const { t } = useTranslation(["common"]); 
  const { locationList, childDropdownLists } = useContext(CommonDataContext);
  const phoneNumber = splitCountryCodeAndPhoneNumber(child?.profileInformation?.phoneNumber)
  const getStatusLabel = (status, caseCloseReason) => {
    let statusLabel = t(`common:common.${status}`, status);
    if (status === "Case Closed" && caseCloseReason && caseCloseReason.trim().length > 0) {
      statusLabel = `${statusLabel} - ${caseCloseReason}`;
    }
    return statusLabel;
  };

  let statusBackgroundColor = "#71C5D4";
  if (child?.status === "Active") {
    statusBackgroundColor = "#3DAA1D";
  } else if (child?.status === "Case Closed") {
    statusBackgroundColor = "#D6DBDE";
  }

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
                label={getStatusLabel(child?.status, child?.caseCloseReason)}
                size="small"
                sx={{
                  backgroundColor: statusBackgroundColor,
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
            value={child?.profileInformation?.phoneNumber ? `${phoneNumber.countryCode} ${phoneNumber.phoneNumber}` : "-"}
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
            value={childDropdownLists?.currentPlacementStatus?.find(status => status.id === child?.TWChildCurrentPlacementStatusId)?.value || "-"}
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
            value={`${child?.caseWorkerFirstName || ""} ${child?.caseWorkerLastName || ""}`.trim() || "-"}
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
    </CommonCard>
  );
};

export default ChildSummary;