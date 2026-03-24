import { Stack } from "@mui/system";
import CommonCard from "../../../../components/CommonCard";
import { Chip, Divider, Grid, Typography } from "@mui/material";
import TrendingFlatIcon from '@mui/icons-material/TrendingFlat';
import { dateFormatter } from "../../../../constants";
import { getDistrictList, getSelectedCountryDetails, getStateList } from "../../../../helpers/helperFunction";
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
    percentageChangeFromFirst = null
  } = family || {};

  const { addressLine1, addressLine2, city, TWDistrictId, TWStateId, TWCountryId } = contactInformation || {};
  const { TWLanguageId , DateStartedasFP } = additionalInformation || {};

  const { locationList, htLanguagesList, familyDropdownLists } = useContext(CommonDataContext);
  const { familyRelations } = familyDropdownLists || {};
  const hasAssessment = thriveScaleScore !== null && thriveScaleScore !== undefined;
  const hasMultipleAssessment = percentageChangeFromFirst !== null && percentageChangeFromFirst !== undefined;

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
            valueComponent={
              <Chip
                label={
                  isActive
                    ? t("common:common.Active", "Active")
                    : t("common:common.Case closed", "Case closed")
                }
                size="small"
                sx={{
                  backgroundColor: "#b8e6e1",
                  color: "black",
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
            value={`             ${addressLine1}
              ${addressLine2 && `,${addressLine2}`}
              ${city && `, ${city}`}
              ${
                TWDistrictId &&
                `, ${
                  getDistrictList(locationList, TWCountryId, TWStateId)?.find(
                    (item) => item.id == TWDistrictId,
                  )?.districtName
                }`
              }
              ${
                TWStateId &&
                `, ${
                  getStateList(locationList, TWCountryId)?.find(
                    (item) => item.id == TWStateId,
                  )?.stateName
                }`
              }
              ${
                TWCountryId &&
                `, ${
                  getSelectedCountryDetails(locationList, TWCountryId)
                    ?.countryName
                }`
              }
            `}
            labelColor="#535F66"
            fontWeight={700}
          />
        </Grid>
        <Grid item xs={6}>
          <LabelValue
            label="Phone number"
            value={phoneNumber}
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
            // check living situation
            value={dateFormatter(DateStartedasFP, "short") || "-"}
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
            value={caseworker || "-"}
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

