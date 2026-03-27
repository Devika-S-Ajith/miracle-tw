import { Stack } from "@mui/system";
import CommonCard from "../../../../components/CommonCard";
import { Chip, Divider, Grid, Typography } from "@mui/material";
import TrendingFlatIcon from "@mui/icons-material/TrendingFlat";
import { dateFormatter } from "../../../../constants";
import {
  formatAddressFromContactInfo,
  getDistrictList,
  getSelectedCountryDetails,
  getStateList,
} from "../../../../helpers/helperFunction";
import { useContext } from "react";
import { CommonDataContext } from "../../../../common/contexts/CommonDataContext";
import LabelValue from "../../../../components/LabelValue/LabelValue";

const FamilySummary = ({ t, family }) => {
  const {
    id,
    familyName,
    contactInformation,
    additionalInformation,
    phoneNumber,
    caseworker,
    isActive,
    thriveScaleScore,
    assessmentDate,
    firstAssessmentThriveScaleScore = null,
    firstAssessmentDateOfAssessment = null,
    percentageChangeFromFirst = null,
  } = family || {};

  const {
    addressLine1,
    addressLine2,
    city,
    TWDistrictId,
    TWStateId,
    TWCountryId,
  } = contactInformation || {};
  const { TWLanguageId, DateStartedasFP } = additionalInformation || {};

  const { locationList, htLanguagesList, familyDropdownLists } =
    useContext(CommonDataContext);
  const { familyRelations } = familyDropdownLists || {};
  const hasAssessment =
    thriveScaleScore !== null && thriveScaleScore !== undefined;
  const hasMultipleAssessment =
    percentageChangeFromFirst !== null &&
    percentageChangeFromFirst !== undefined;

  const statusLabel =
    family?.status ||
    (isActive
      ? t("common:common.Active", "Active")
      : t("common:common.Case closed", "Case closed"));

  return (
    <CommonCard
      title={t(`common:infoCard.${"Family summary"}`, "Family summary")}
      apiError={false}
      onReload={() => {}}
      flexibleHeight={false}
    >
      <Grid container direction="row" spacing={1}>
        <Grid item xs={6}>
          <LabelValue
            label="Family name"
            value={familyName}
            labelColor="#535F66"
            fontWeight={700}
          />
        </Grid>
        <Grid item xs={6}>
          <LabelValue
            label="Status"
            value={
              <Chip
                label={statusLabel}
                size="small"
                sx={{
                  backgroundColor:
                    statusLabel === "Active"
                      ? "#3DAA1D"
                      : statusLabel === "Case closed" ||
                          statusLabel === "Case Closed"
                        ? "#D6DBDE"
                        : "#b8e6e1",
                  color: statusLabel === "Active" ? "white" : "black",
                  fontSize: "0.75rem",
                  fontWeight: 600,
                  borderRadius: "20px",
                }}
              />
            }
            labelColor="#535F66"
            fontWeight={700}
          />
        </Grid>
        <Grid item xs={6}>
          <LabelValue
            label="Address"
            value={
              family?.contactInformation
                ? formatAddressFromContactInfo(
                    family?.contactInformation,
                    locationList,
                  )
                : "-"
            }
            labelColor="#535F66"
            fontWeight={700}
          />
        </Grid>
        <Grid item xs={6}>
          <LabelValue
            label="Phone number"
            value={phoneNumber?.trim().length ? phoneNumber : "-"}
            labelColor="#535F66"
            fontWeight={700}
          />
        </Grid>
        <Grid item xs={6}>
          <LabelValue
            label="Primary language"
            value={
              TWLanguageId &&
              `  ${
                htLanguagesList?.find((item) => item.id === TWLanguageId)
                  ?.language
              }`
            }
            labelColor="#535F66"
            fontWeight={700}
          />
        </Grid>
        <Grid item xs={6}>
          <LabelValue
            label="First fostered"
            value={DateStartedasFP || "-"}
            labelColor="#535F66"
            fontWeight={700}
          />
        </Grid>
        <Grid item xs={12}>
          <Divider sx={{ mt: 1, borderBottomWidth: 2, mb: 1 }} />
        </Grid>

        <Grid item xs={6}>
          <LabelValue
            label="Case worker"
            value={caseworker?.trim().length ? caseworker : "-"}
            labelColor="#535F66"
            fontWeight={700}
          />
        </Grid>
        <Grid item xs={6}>
          <LabelValue
            label="Case number"
            value={`FAM-${id}`}
            labelColor="#535F66"
            fontWeight={700}
          />
        </Grid>
        <Grid item xs={12}>
          <Divider sx={{ mt: 1, borderBottomWidth: 2, mb: 1 }} />
        </Grid>
      </Grid>
    </CommonCard>
  );
};

export default FamilySummary;
