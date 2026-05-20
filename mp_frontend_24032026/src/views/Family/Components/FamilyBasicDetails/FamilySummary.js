import CommonCard from "../../../../components/CommonCard";
import { Chip, Divider, Grid } from "@mui/material";
import {
  formatAddressFromContactInfo,
} from "../../../../helpers/helperFunction";
import { useContext } from "react";
import { CommonDataContext } from "../../../../common/contexts/CommonDataContext";
import LabelValue from "../../../../components/LabelValue/LabelValue";
import { Stack } from "@mui/system";
import BodyText from "../../../../components/BodyText/BodyText";
import { MonthDayYearFormatter } from "../../../../constants";


const FamilySummary = ({ t, family, mostRecentAssesmentSummary }) => {
  const {
    familyCode,
    familyName,
    contactInformation,
    additionalInformation,
    phoneNumber,
    caseworker,
    isActive,
   
  } = family || {};
  const {
    thriveScaleScore,
    firstAssessmentDateOfAssessment,
    firstAssessmentThriveScaleScore,
    assessmentDate,
    percentageChangeFromFirst = null
  } = mostRecentAssesmentSummary || {};
  const { TWLanguageId, DateStartedasFP } = additionalInformation || {};


  const { locationList, htLanguagesList, familyDropdownLists } =
    useContext(CommonDataContext);
  const { familyRelations } = familyDropdownLists || {};
  const hasAssessment =
    thriveScaleScore !== null && thriveScaleScore !== undefined;
  const hasMultipleAssessment =
    percentageChangeFromFirst !== null &&
    percentageChangeFromFirst !== undefined;

    let familyStatus = family?.status ||
    (isActive
      ? t("common:common.Active", "Active")
      : t("common:common.Case closed", "Case closed"));
  let statusLabel = familyStatus;
  if (family?.deactivationReason && family.deactivationReason.trim().length > 0) {
    statusLabel = `${statusLabel} - ${family.deactivationReason}`;
  }


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
            label={t("common:common.Family name", "Family name")}
            value={familyName}
            labelColor="#535F66"
            fontWeight={700}
          />
        </Grid>
        <Grid item xs={6}>
          <LabelValue
            label={t("common:common.Status", "Status")}
            value={
              <Chip
                label={statusLabel}
                size="small"
                sx={{
                  backgroundColor:
                    familyStatus === "Active"
                      ? "#3DAA1D"
                      : familyStatus === "Case closed" ||
                          familyStatus === "Case Closed"
                        ? "#D6DBDE"
                        : "#b8e6e1",
                  color: familyStatus === "Active" ? "white" : "black",
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
            label={t("common:common.Address", "Address")}
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
            label={t("common:common.Phone number", "Phone number")}
            value={phoneNumber?.trim().length ? phoneNumber : "-"}
            labelColor="#535F66"
            fontWeight={700}
          />
        </Grid>
        <Grid item xs={6}>
          <LabelValue
            label={t("common:common.Primary language", "Primary language")}
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
            label={t("common:common.First fostered", "First fostered")}
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
            label= {t("common:common.Case worker","Case worker")}
            value={caseworker?.trim().length ? caseworker : "-"}
            labelColor="#535F66"
            fontWeight={700}
          />
        </Grid>
        <Grid item xs={6}>
          <LabelValue
            label="Case number"
            value={`FAM-${familyCode}`}
            labelColor="#535F66"
            fontWeight={700}
          />
        </Grid>
        <Grid item xs={12}>
          <Divider sx={{ mt: 1, borderBottomWidth: 2, mb: 1 }} />
        </Grid>
      </Grid>
      {firstAssessmentThriveScaleScore && <Stack
        justifyContent="center"
        alignItems="center"
        direction="row"
        spacing={2}
        mt={1}
      >
        <Stack>
          <BodyText value={firstAssessmentThriveScaleScore} fontWeight={600} />
          <BodyText value={MonthDayYearFormatter(firstAssessmentDateOfAssessment,"short")} />
        </Stack>
        <img
          // key={index}
          src="/static/icons/rightArrow.png"
          style={{ width: 25, height: 25 }}
        />
        {thriveScaleScore &&<Stack>
          <BodyText value={thriveScaleScore} fontWeight={600} />
          <BodyText value={MonthDayYearFormatter(assessmentDate,"short")} />
        </Stack>}
      </Stack>}
    </CommonCard>
  );
};


export default FamilySummary;