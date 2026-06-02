import { useState, useEffect, useContext } from "react";
import PropTypes from "prop-types";
import {
  Card,
  CardHeader,
  CardContent,
  Divider,
  Grid,
  Typography,
  Chip,
} from "@mui/material";
import { customerApi } from "../../../../__fakeApi__/customerApi";
import { CommonDataContext } from "../../../../common/contexts/CommonDataContext";
import { useTranslation } from "react-i18next";
import LabelValue from "../../../../components/LabelValue";
import {
  calculateAgeReverseOrder,
  formattedDate,
  getDistrictList,
  getStateList,
} from "../../../../helpers/helperFunction";
import FamilyMembers from "../../../Family/Components/FamilyMembers/FamilyMembers";
import { useNavigate } from "react-router";


const ChildContactDetails = (props) => {
  const {
    id,
    name,
    country,
    gender,
    birthdate,
    isVerified,
    caseManager,
    caregiver,
    organization,
    email,
    phone,
    language,
    state,
    city,
    district,
    zip,
    address1,
    address2,
    education,
    status,
    addDate,
    closedDate,
    educationSpecific,
    profileImage,
    childStatus,
    placementStatus,
    currentPlacement,
    familyName,
    caseworkerName,
    familyMembers,
    HTChildStatusId,
    getMembersUnderFamily,
    familyId,
    getChildren,
    isActiveFamily,
    ...other
  } = props;
  const [typesData, setTypesData] = useState([]);
  const {
    childStatusList,
    childPlacementList,
    locationList,
    htLanguagesList,
    childEducationList,
    childCurrentPlacementList,
  } = useContext(CommonDataContext);
  const { t } = useTranslation(["common"]);
  const [stateData, setStateData] = useState([]);
  const navigate = useNavigate()


  useEffect(() => {
    getTypesFromAPI();
    getLocationsFromAPI();
    return () => {};
  }, []);

  const getLocationsFromAPI = async () => {
    try {
      const data = await customerApi.getLocations();
      setStateData([...data.states]);
    } catch (err) {
      console.error(err);
    }
  };

  const stringToDate = (dateString) => {
    console.log(dateString);
    const [day, month, year] = dateString.split("/");
    return new Date([month, day, year].join("/"));
  };

  const getDate = (dateToFormat = null) => {
    let yourDate;
    if (dateToFormat === null) {
      yourDate = new Date();
    } else {
      yourDate = new Date(stringToDate(dateToFormat));
    }
    // yourDate.toISOString().split('T')[0];
    const offset = yourDate.getTimezoneOffset();
    yourDate = new Date(yourDate.getTime() - offset * 60 * 1000);
    return yourDate.toISOString().split("T")[0];
  };

  const getAge = (datestring) => {
    let startDate = new Date(stringToDate(datestring));
    let endDate = new Date();
    let diffYear = (startDate.getTime() - endDate.getTime()) / 1000;
    diffYear /= 60 * 60 * 24;
    return Math.abs(Math.round(diffYear / 365.25));
  };

  const getTypesFromAPI = async () => {
    try {
      const data = await customerApi.getOrganizationType();
      setTypesData([...data.organisationTypes]);
    } catch (err) {
      console.error(err);
    }
  };
  return typesData.length && stateData?.length ? (
    <>
      <Grid container spacing={2}>
        <Grid item md={5.5} xs={6}>
          <Card {...other}>
            <CardHeader title={t("common:child.Child Details")} />
            <Divider sx={{ mx: 2 }} />
            <CardContent>
              <Grid container width={1} spacing={2}>
                <Grid item xs={6}>
                  <LabelValue label={t("common:common.Name")} value={name} />
                </Grid>
                <Grid item xs={6}>
                  <LabelValue
                    label={t("common:common.Child Status")}
                    tooltip={false}
                    value={
                      <Chip
                        color="primary"
                        label={
                          childStatus
                            ? `${t("common:common.Active")}`
                            : `${t("common:common.Inactive")}`
                        }
                        size="small"
                        sx={{
                          backgroundColor: childStatus ? "#4caf50" : "#f44336",
                        }}
                      />
                    }
                  />
                </Grid>
                <Grid item xs={6}>
                  <LabelValue
                    label={t("common:common.Family")}
                    value={familyName}
                    onClick={
                      familyId
                        ? () => {
                            navigate(`/dashboard/families/${familyId}/view`);
                          }
                        : undefined
                    }
                  />
                </Grid>
                <Grid item xs={6}>
                  <LabelValue
                    label={t("common:common.Gender")}
                    value={gender}
                  />
                </Grid>
                <Grid item xs={6}>
                  <LabelValue
                    label={t("common:common.Date of Birth")}
                    value={formattedDate(birthdate)}
                  />
                </Grid>
                <Grid item xs={6}>
                  <LabelValue
                    label={t("common:common.Age")}
                    value={`${calculateAgeReverseOrder(birthdate)}`}
                  />
                </Grid>
                <Grid item xs={6}>
                  <LabelValue
                    label={t("common:common.Native Language")}
                    value={
                      htLanguagesList?.find((item) => item.id === language)
                        ?.language
                    }
                  />
                </Grid>
              </Grid>
              <Divider sx={{ my: 2 }} />
              <Typography variant="h6" sx={{ mb: 2 }}>
                {t("common:family.Contact information")}
              </Typography>
              <Grid container width={1} spacing={2}>
                <Grid item xs={6}>
                  <LabelValue
                    label={t("common:common.Address 1")}
                    value={address1}
                    wrap
                  />
                </Grid>
                <Grid item xs={6}>
                  <LabelValue
                    label={t("common:common.Address 2")}
                    value={address2}
                    wrap
                  />
                </Grid>
                <Grid item xs={6}>
                  <LabelValue label={t("common:common.City")} value={city} />
                </Grid>
                <Grid item xs={6}>
                  <LabelValue
                    label={t("common:common.State/Region")}
                    value={
                      getStateList(locationList, country)?.find(
                        (item) => item.id === state
                      )?.stateName
                    }
                  />
                </Grid>
                <Grid item xs={6}>
                  <LabelValue
                    label={t("common:common.ZIP/postal Code")}
                    value={zip}
                  />
                </Grid>
                {country != "2" &&
                  <Grid item xs={6}>
                    <LabelValue
                      label={t("common:common.District/County")}
                      value={
                        getDistrictList(locationList, country, state)?.find(
                          (item) => item.id === district
                        )?.districtName || ""  
                      }
                    />               
                  </Grid>
                }
                <Grid item xs={6}>
                  <LabelValue
                    label={t("common:common.Country")}
                    value={
                      locationList?.find((item) => item.id === country)
                        ?.countryName
                    }
                  />
                </Grid>
                <Grid item xs={6}>
                  <LabelValue
                    label={t("common:common.Phone Number")}
                    value={phone}
                  />
                </Grid>
                <Grid item xs={6}>
                  <LabelValue label={t("common:common.Email")} value={email} />
                </Grid>
              </Grid>
              <Divider sx={{ my: 2 }} />
              <Typography variant="h6" sx={{ mb: 2 }}>
                {t("common:child.Additional Information")}
              </Typography>
              <Grid container width={1} spacing={2}>
                <Grid item xs={6}>
                  <LabelValue
                    label={t("common:common.Added Date")}
                    value={addDate ? formattedDate(addDate) : ""}
                  />
                </Grid>
                <Grid item xs={6}>
                  <LabelValue
                    label={t("common:common.Closed Date")}
                    value={closedDate ? formattedDate(closedDate) : ""}
                  />
                </Grid>
                <Grid item xs={6}>
                  <LabelValue
                    label={t("common:common.Child Status")}
                    value={
                      status &&
                      childStatusList &&
                      childStatusList.length &&
                      `${
                        childStatusList.find((item) => item.id === status)
                          .status
                      }`
                    }
                  />
                </Grid>
                <Grid item xs={6}>
                  <LabelValue
                    label={t("common:child.Child Placement Status")}
                    value={
                      placementStatus &&
                      childPlacementList &&
                      childPlacementList.length &&
                      `${
                        childPlacementList.find(
                          (item) => item.id === placementStatus
                        ).placementStatus
                      }`
                    }
                  />
                </Grid>
                <Grid item xs={6}>
                  <LabelValue
                    label={t("common:common.Current Placement")}
                    value={
                      currentPlacement &&
                      childCurrentPlacementList &&
                      childCurrentPlacementList.length &&
                      `${
                        childCurrentPlacementList.find(
                          (item) => item.id === currentPlacement
                        ).currentPlacementStatus
                      }`
                    }
                  />
                </Grid>
                <Grid item xs={6}>
                  <LabelValue
                    label={t("common:common.Social Worker")}
                    value={ caseManager}
                  />
                </Grid>
                <Grid item xs={6}>
                  <LabelValue
                    label={t("common:child.Child Education")}
                    value={
                      education === "20"
                        ? t("common:child.Discontinued Education")
                        : childEducationList &&
                          childEducationList.length &&
                          (
                            childEducationList.find(
                              (item) => item.id === education
                            ) || {}
                          )?.educationLevel
                    }
                  />
                </Grid>

                {education === "20" && (
                  <Grid item xs={6}>
                    <LabelValue
                      label={t("common:child.Highest Education")}
                      value={educationSpecific}
                    />
                  </Grid>
                )}
                <Grid item xs={6}>
                  <LabelValue label={t("common:common.Child ID")} value={`CHILD-${id}`} />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
        {familyMembers?.length > 0 && <Grid item md={5.5} xs={6}>
          <FamilyMembers
            familyMembers={familyMembers}
            caseworkerName={caseworkerName}
            familyId={familyId}
            familyName={familyName}
            getFamilyMembers={getMembersUnderFamily}
            getChildren={getChildren}
            isActiveFamily={isActiveFamily}
          />
        </Grid>}
      </Grid>
    </>
    ):
    <></>
};

ChildContactDetails.propTypes = {
  name: PropTypes.string,
  address2: PropTypes.string,
  country: PropTypes.string,
  email: PropTypes.string.isRequired,
  isVerified: PropTypes.bool.isRequired,
  phone: PropTypes.string,
  state: PropTypes.string,
};

export default ChildContactDetails;
