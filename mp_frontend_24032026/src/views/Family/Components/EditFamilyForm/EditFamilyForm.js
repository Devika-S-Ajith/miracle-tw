import React, { useState, useContext, useEffect } from "react";
// import PropTypes from 'prop-types';
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import * as Yup from "yup";
import { Formik, Field } from "formik";
import {
  Box,
  Button,
  Card,
  Grid,
  Switch,
  TextField,
  Typography,
  Divider,
  Tooltip,
} from "@mui/material";
import NumberFormat from "react-number-format";
import { useTranslation } from "react-i18next";
import APIS from "../../../../common/hooks/UseApiCalls";
import { CommonDataContext } from "../../../../common/contexts/CommonDataContext";
import InformationCircleIcon from "../../../../assets/icons/InformationCircle";
import AutoCompleteDropdown from "../../../../components/UserComponents/AutoCompleteDropdown";
import {
  getDistrictList,
  getSelectedCountryDetails,
  getStateList,
} from "../../../../helpers/helperFunction";
import "../../../Child/Components/AddChildForm/AddChildForm.css";
import "react-international-phone/style.css";
import { PhoneInput } from "react-international-phone";
import { PhoneNumberUtil } from "google-libphonenumber";
import { PhoneTextInput } from "../../../../components/PhoneTextInput/PhoneTextInput";
import WarningRoundedIcon from "@mui/icons-material/WarningRounded";

const phoneUtil = PhoneNumberUtil.getInstance();

const EditFamilyForm = (props) => {
  const { family, careGiver, ...other } = props;
  const navigate = useNavigate();
  const { t } = useTranslation(["common"]);
  const [checked, setChecked] = useState(family && family.isActive);
  const {
    locationList,
    getFamilyList,
    languageList,
    relationList,
    userRegion,
    htLanguagesList,
  } = useContext(CommonDataContext);
  // const dummyLanguageList = [
  //   { id: "1", language: "English", languageCode: "en" },
  //   { id: "2", language: "Hindi", languageCode: "hi" },
  //   { id: "3", language: "Tamil", languageCode: "ta" },
  // ];
  // let primaryCaregiver = careGiver;
  const [primaryCaregiver, setPrimaryCaregiver] = useState(careGiver);
  useEffect(() => {
    setPrimaryCaregiver(careGiver);
    return () => {};
  }, [careGiver]);

  const handleStatusChange = async (value) => {
    try {
      const statusPayload = {
        id: family && family.id,
        isDeleted:false,
        isActive: `${value}`,
      };

      await APIS.ChangeFamilyStatus(statusPayload).then((res) => {
        if (res.data.Message !== "Status Changed Successfully") {
          toast.error(t("common:family.Inactive Reassign"));
          // setChecked(checked);
        } else if (res.data.Message === "Status Changed Successfully") {
          toast.success(t("common:family.Family Status Updated Successfully"));
        } else {
          toast.error(t("common:common.Something went wrong"));
          // setStatus({ success: false });
        }
      });
    } catch (err) {
      toast.error(t("common:common.Something went wrong"));
      // setStatus({ success: false });
      // setErr/ors({ submit: err.message });
    }
  };

  return (
    <Formik
      enableReinitialize={true}
      initialValues={{
        member_id: (primaryCaregiver && primaryCaregiver.id) || "",
        member_type:
          (primaryCaregiver && primaryCaregiver.HTFamilyMemberId) || "",
        other_relation:
          (primaryCaregiver && primaryCaregiver.otherRelation) || "",
        first_name: (primaryCaregiver && primaryCaregiver.firstName) || "",
        last_name: (primaryCaregiver && primaryCaregiver.lastName) || "",
        phone: (primaryCaregiver && primaryCaregiver.phoneNumber) || "",
        email: (primaryCaregiver && primaryCaregiver.email) || "",
        is_primary:
          (primaryCaregiver && primaryCaregiver.isPrimaryCareGiver) || "",
        relation:
          (primaryCaregiver && primaryCaregiver.HTFamilyRelationId) || "",
        occupation: (primaryCaregiver && primaryCaregiver.occupation) || "",
        family_name: family.familyName || "",
        address1: family.addressLine1 || "",
        address2: family.addressLine2 || "",
        country: family.HTCountryId || "",
        state: family.HTStateId || "",
        district: family.HTDistrictId || "",
        language: family.HTLanguageId || "",
        city: family.city || "",
        zip_code: family?.zipCode
          ? family?.zipCode?.length > 6
            ? family?.zipCode.slice(0, 5) + "-" + family?.zipCode.slice(5)
            : family?.zipCode
          : "",
        submit: null,
      }}
      validationSchema={Yup.object().shape({
        family_name: Yup.string(),
        first_name: Yup.string()
          .max(255)
          .required(t("common:warnings.First name is required")),
        last_name: Yup.string()
          .max(255)
          .required(t("common:warnings.Last Name is required")),
        address1: Yup.string()
          .max(255)
          .required(t("common:warnings.Address 1 is required")),
        address2: Yup.string().max(255),
        country: Yup.string()
          .max(255)
          .required(t("common:warnings.Country is required")),
        city: Yup.string()
          .max(255)
          .required(t("common:warnings.City is required")),
        zip_code: Yup.string()
          .required(t("common:warnings.Zipcode is required"))
          .when("country", (country, schema) => {
            return schema.test({
              name: "zip-format-validation",
              exclusive: true,
              message: t("common:warnings.Invalid ZIP code format"),
              test: function (zip_code) {
                if (
                  locationList
                    .find((obj) => obj.id == country)
                    ?.isoCode?.toUpperCase() === "IND"
                ) {
                  return /^\d{6}$/.test(zip_code);
                } else {
                  return /^\d{5}$/.test(zip_code);
                }
              },
            });
          }),
        language: Yup.string()
          .max(255)
          .required(t("common:warnings.Language is required")),
        occupation: Yup.string().max(255),
        // .required(t("common:warnings.Occupation is required")),
        relation: Yup.string()
          .max(255)
          .required(t("common:warnings.Relation is required")),
        other_relation: Yup.string()
          .max(255)
          .when("relation", {
            is: (val) => val == 7,
            then: (schema) =>
              schema.required(t("common:warnings.Other relation is required")),
            otherwise: (schema) => schema.nullable(),
          }),
        phone: Yup.string()
          .required(t("common:warnings.Phone Number is required"))
          .test(
            "phone-format-validation",
            t("common:warnings.Invalid Phone number"),
            (value, context) => {
              try {
                const phoneNumber = phoneUtil.parseAndKeepRawInput(value);
                return phoneUtil.isValidNumber(phoneNumber);
              } catch (error) {
                return false; // Handle parsing errors
              }
            }
          ),
        state: Yup.string()
          .max(255)
          .required(t("common:warnings.State is required")),
        district: Yup.string()
          .when("country", {
            is: (value) =>
              value ==
              getSelectedCountryDetails(locationList, value)?.districtRequired,
            then: Yup.string().required(
              t("common:warnings.Region is required")
            ),
            otherwise: Yup.string().max(255),
          })
          .max(255),
        email: Yup.string()
          .email(t("common:warnings.Must be a valid email"))
          .max(255),
      })}
      onSubmit={async (
        values,
        { resetForm, setErrors, setStatus, setSubmitting }
      ) => {
        let payload = {
          id: family && family.id,
          HTFamilyMemberId: values.member_id,
          familyName: values.family_name,
          firstName: values.first_name,
          lastName: values.last_name,
          occupation: values.occupation,
          phoneNumber: values.phone,
          email: values.email,
          isPrimaryCareGiver: values.is_primary,
          addressLine1: values.address1,
          addressLine2: values.address2,
          zipCode: values.zip_code,
          city: values.city,
          HTLanguageId: values.language,
          HTCountryId: values.country,
          HTDistrictId: values.district || null,
          HTStateId: values.state,
          HTFamilyRelationId: values.relation,
          otherRelation: values.other_relation,
          HTFamilyMemberTypeId: family.HT_familyMembers.length
            ? family.HT_familyMembers.find((f) => f.isPrimaryCareGiver)
                .HTFamilyMemberTypeId
            : 1,
        };
        try {
          await APIS.EditFamily(payload).then((res) => {
            if (res && res.data && res.status === 200) {
              //resetForm();
              getFamilyList();
              setStatus({ success: true });
              setSubmitting(false);
              toast.success(t("common:family.Family Updated Successfully"));
              navigate("/dashboard/families");
            } else {
              toast.error(t("common:common.Something went wrong"));
              setStatus({ success: false });
              setSubmitting(false);
            }
          });
        } catch (err) {
          toast.error(t("common:common.Something went wrong"));
          setStatus({ success: false });
          setErrors({ submit: err.message });
          setSubmitting(false);
        }
      }}
    >
      {({
        errors,
        handleBlur,
        handleChange,
        handleReset,
        handleSubmit,
        isSubmitting,
        touched,
        values,
        setFieldValue,
        setFieldError,
      }) => (
        <form onSubmit={handleSubmit} {...other}>
          <Card>
            <Box sx={{ m: 2, mt: 3 }}>
              <Grid container spacing={3}>
                <Grid item md={12} xs={12}>
                  <Typography color="textSecondary" variant="subtitle2">
                    {/* Member {index + 1} */}
                    {t("common:common.General Information")}
                  </Typography>
                </Grid>

                <Grid
                  item
                  md={6}
                  xs={12}
                  style={{ display: "flex", alignItems: "center" }}
                >
                  <TextField
                    error={Boolean(touched.family_name && errors.family_name)}
                    fullWidth
                    autoFocus
                    helperText={touched.family_name && errors.family_name}
                    label={t("common:common.Family Name")}
                    name="family_name"
                    onBlur={handleBlur}
                    onChange={handleChange}
                    value={values.family_name}
                    variant="outlined"
                  />
                  <Tooltip
                    title={t(
                      "common:common.If not filled Primary Caregiver name will be used as the Family Name"
                    )}
                  >
                    <InformationCircleIcon fontSize="small" />
                  </Tooltip>
                </Grid>

                <Divider />

                <Grid item md={12} xs={12}>
                  <Typography color="textSecondary" variant="subtitle2">
                    {/* Member {index + 1} */}
                    {t("common:common.Household Information")}
                  </Typography>
                </Grid>

                <Grid item md={6} xs={12}>
                  <TextField
                    error={Boolean(touched.address1 && errors.address1)}
                    fullWidth
                    helperText={touched.address1 && errors.address1}
                    label={t("common:common.Address 1")}
                    name="address1"
                    required
                    onBlur={handleBlur}
                    onChange={handleChange}
                    value={values.address1}
                    variant="outlined"
                  />
                </Grid>

                <Grid item md={6} xs={12}>
                  <TextField
                    error={Boolean(touched.address2 && errors.address2)}
                    fullWidth
                    helperText={touched.address2 && errors.address2}
                    label={t("common:common.Address 2")}
                    name="address2"
                    onBlur={handleBlur}
                    onChange={handleChange}
                    value={values.address2}
                    variant="outlined"
                  />
                </Grid>

                <Grid item md={6} xs={12} sx={{ mt: -2 }}>
                  <Field
                    error={Boolean(touched.country && errors.country)}
                    fullWidth
                    helperText={touched.country && errors.country}
                    name="country"
                    accessKey="countryName"
                    component={AutoCompleteDropdown}
                    required={true}
                    label="country"
                    options={locationList}
                    textFieldProps={{
                      fullWidth: true,
                      margin: "normal",
                      variant: "outlined",
                      label: t("common:common.Country"),
                    }}
                    disabled={family.id ?? false}
                  />
                  {family?.id && (
                    <Typography
                      color="#778791"
                      fontSize="0.875rem"
                      display="flex"
                      alignItems="center"
                      gap={1}
                    >
                      <WarningRoundedIcon />
                      {t(
                        "common:warnings.Country cannot be changed once Family is created"
                      )}
                    </Typography>
                  )}
                </Grid>
                <Grid item md={6} xs={12} sx={{ mt: -2 }}>
                  <Field
                    error={Boolean(touched.state && errors.state)}
                    fullWidth
                    helperText={touched.state && errors.state}
                    name="state"
                    accessKey="stateName"
                    component={AutoCompleteDropdown}
                    required={true}
                    label="state"
                    options={getStateList(locationList, values.country) || []}
                    textFieldProps={{
                      fullWidth: true,
                      margin: "normal",
                      variant: "outlined",
                      label: t("common:common.State/Region"),
                    }}
                  />
                </Grid>
                {values.country &&
                  getSelectedCountryDetails(locationList, values.country)
                    ?.districtRequired && (
                    <Grid item md={6} xs={12} sx={{ mt: -2 }}>
                      <Field
                        error={Boolean(touched.district && errors.district)}
                        fullWidth
                        helperText={touched.district && errors.district}
                        name="district"
                        accessKey="districtName"
                        component={AutoCompleteDropdown}
                        required={true}
                        label="district"
                        options={
                          getDistrictList(
                            locationList,
                            values.country,
                            values.state
                          ) || []
                        }
                        textFieldProps={{
                          fullWidth: true,
                          margin: "normal",
                          variant: "outlined",
                          label: t("common:common.Region"),
                        }}
                      />
                    </Grid>
                  )}
                <Grid item md={6} xs={12}>
                  <TextField
                    error={Boolean(touched.city && errors.city)}
                    fullWidth
                    helperText={touched.city && errors.city}
                    label={t("common:common.City")}
                    name="city"
                    required
                    onBlur={handleBlur}
                    onChange={handleChange}
                    value={values.city}
                    variant="outlined"
                  />
                </Grid>
                <Grid item md={6} xs={12}>
                  {/* <TextField
                    error={Boolean(touched.zip_code && errors.zip_code)}
                    fullWidth
                    helperText={touched.zip_code && errors.zip_code}
                    label={t('common:common.Zipcode')}
                    name="zip_code"
                    required
                    onBlur={handleBlur}
                    onChange={(e)=>{
                      setFieldValue('zip_code',e.target.value.trim());
                    }}
                    value={values.zip_code}
                    variant="outlined"
                  /> */}
                  <NumberFormat
                    customInput={TextField}
                    error={Boolean(touched.zip_code && errors.zip_code)}
                    fullWidth
                    helperText={touched.zip_code && errors.zip_code}
                    placeholder={
                      locationList
                        .find((obj) => obj.id == values.country)
                        ?.isoCode?.toUpperCase() === "IND"
                        ? "888888"
                        : "88888"
                    }
                    // label={t('common:common.Zipcode')}
                    label={t("common:common.ZIP/postal Code")}
                    name="zip_code"
                    format={
                      locationList
                        .find((obj) => obj.id == values.country)
                        ?.isoCode?.toUpperCase() === "IND"
                        ? "######"
                        : "#####"
                    }
                    //prefix={'+'}
                    type="text"
                    required
                    onBlur={handleBlur}
                    onChange={(e) => {
                      let zipCode = e.target.value.trim();
                      // if (userRegion === "usa") {
                      //   // Allow only 5 or 9 digits for USA zip code
                      //   zipCode = zipCode.substring(0, 10);
                      //   // Remove the hyphen if the user deletes 4 characters
                      //   if (zipCode.length < 10) {
                      //     zipCode = zipCode.replace(/-/g, "");
                      //   }
                      // } else if (userRegion === "india") {
                      //   // Allow only 6 digits for India zip code
                      //   zipCode = zipCode.substring(0, 6);
                      // }
                      setFieldValue("zip_code", zipCode);
                    }}
                    value={values.zip_code}
                  />
                </Grid>

                <Grid item md={6} xs={12} sx={{ mt: -2 }}>
                  <Field
                    error={Boolean(touched.language && errors.language)}
                    fullWidth
                    helperText={touched.language && errors.language}
                    name="language"
                    accessKey="language"
                    component={AutoCompleteDropdown}
                    required={true}
                    label="language"
                    // options={languageList}
                    options={htLanguagesList}
                    textFieldProps={{
                      fullWidth: true,
                      margin: "normal",
                      variant: "outlined",
                      label: t("common:common.Native Language"),
                    }}
                  />
                </Grid>

                <Divider />

                <Grid item md={12} xs={12}>
                  <Typography color="textSecondary" variant="subtitle2">
                    {/* Member {index + 1} */}
                    {t("common:common.Primary Caregiver")}
                  </Typography>
                </Grid>

                {/* <Grid
                      container
                      spacing={3}
                      > */}

                <Grid item md={6} xs={12}>
                  <TextField
                    //error={Boolean(touched.first_name && errors.first_name)}
                    //error={Boolean(values.member[index] && touched.values.member[index].first_name && errors.values.member[index].first_name)}
                    fullWidth
                    helperText={touched.first_name && errors.first_name}
                    label={t("common:common.FirstName")}
                    name="first_name"
                    onBlur={handleBlur}
                    onChange={handleChange}
                    required
                    value={values.first_name}
                    variant="outlined"
                  />
                </Grid>

                <Grid item md={6} xs={12}>
                  <TextField
                    error={Boolean(touched.last_name && errors.last_name)}
                    fullWidth
                    helperText={touched.last_name && errors.last_name}
                    label={t("common:common.LastName")}
                    name="last_name"
                    onBlur={handleBlur}
                    onChange={handleChange}
                    required
                    value={values.last_name}
                    variant="outlined"
                  />
                </Grid>

                <Grid item md={6} xs={12}>
                  {/* <TextField
                              error={Boolean(touched.phone && errors.phone)}
                              fullWidth
                              helperText={touched.phone && errors.phone}
                              label="Phone"
                              name="phone"
                              onBlur={handleBlur}
                              onChange={handleChange}
                              required
                              // value={values.member[index] && values.member[index].phone}
                              variant="outlined"
                            /> */}
                  <PhoneTextInput
                    name={`phone`}
                    required
                    onBlur={handleBlur}
                    error={Boolean(touched?.phone && errors?.phone)}
                    helperText={touched?.phone && errors?.phone}
                    value={values.phone}
                    onChange={(phone) => setFieldValue("phone", phone)}
                  />
                  {/* <PhoneInput
                    //defaultCountry={values.country == '1' ? 'in' : 'us'}
                    name={`phone`}
                    //country={values.country == '1' ? 'in' : 'ua'}
                    containerStyle={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "stretch",
                      width: "100%",
                      border: `1px solid ${
                        touched?.phone && errors?.phone ? "red" : "#ccc"
                      }`,
                    }}
                    inputStyle={{
                      fontSize: "16px",
                      padding: "10px",
                      width: "100%",
                      height: "50px", // Adjust this value as needed
                    }}
                    required
                    onBlur={handleBlur}
                    error={Boolean(touched?.phone && errors?.phone)}
                    helperText={touched?.phone && errors?.phone}
                    value={values.phone}
                    onChange={(phone) => setFieldValue("phone", phone)}
                  />
                  <Typography
                    id="phone number error"
                    color="#f44336"
                    variant="subtitle2"
                    fontSize={"0.75rem"}
                    marginTop={"3px"}
                    marginLeft={"14px"}
                  >
                    {Boolean(touched?.phone && errors?.phone)
                      ? errors.phone
                      : ""}
                  </Typography> */}
                </Grid>

                <Grid item md={6} xs={12}>
                  <TextField
                    error={Boolean(touched.email && errors.email)}
                    fullWidth
                    helperText={touched.email && errors.email}
                    label={t("common:common.Email")}
                    name="email"
                    onBlur={handleBlur}
                    onChange={(e) => {
                      setFieldValue("email", e.target.value.trim());
                    }}
                    value={values.email}
                    variant="outlined"
                  />
                </Grid>

                <Grid item md={6} xs={12} sx={{ mt: -2 }}>
                  <Field
                    error={Boolean(touched.relation && errors.relation)}
                    fullWidth
                    helperText={touched.relation && errors.relation}
                    name="relation"
                    accessKey="relation"
                    component={AutoCompleteDropdown}
                    label="relation"
                    required={true}
                    options={relationList}
                    textFieldProps={{
                      fullWidth: true,
                      margin: "normal",
                      variant: "outlined",
                      label: t("common:common.Relationship to Child"),
                    }}
                  />
                </Grid>
                {values.relation === "7" && (
                  <Grid item md={6} xs={12}>
                    <TextField
                      error={Boolean(
                        touched.other_relation && errors.other_relation
                      )}
                      fullWidth
                      helperText={
                        touched.other_relation && errors.other_relation
                      }
                      required
                      label={t("common:common.Other Relation")}
                      name="other_relation"
                      onBlur={handleBlur}
                      onChange={handleChange}
                      value={values.other_relation}
                      variant="outlined"
                    />
                  </Grid>
                )}

                <Grid item md={6} xs={12}>
                  <TextField
                    error={Boolean(touched.occupation && errors.occupation)}
                    fullWidth
                    helperText={touched.occupation && errors.occupation}
                    label={t("common:common.Occupation")}
                    name="occupation"
                    onBlur={handleBlur}
                    onChange={handleChange}
                    value={values.occupation}
                    variant="outlined"
                  />
                </Grid>

                {/* </Grid> */}

                {/* </Box> */}
              </Grid>

              <Grid item>
                <Grid item md={6} xs={12}>
                  <Typography
                    color="textPrimary"
                    gutterBottom
                    variant="subtitle2"
                    sx={{ mt: 2 }}
                  >
                    {t("common:family.Family Status")}
                  </Typography>
                  <Box sx={{ display: "flex", flex: 1 }}>
                    <Box>
                      <Switch
                        size="small"
                        color="orange"
                        checked={checked}
                        onChange={() => {
                          setChecked(!checked);
                          handleStatusChange(!checked);
                        }}
                      />
                    </Box>
                    <Box>
                      <Typography
                        color={checked ? "#43AA8B" : "#F94144"}
                        variant="h6"
                        sx={{ marginRight: 2 }}
                      >
                        {checked
                          ? `${t("common:common.ACTIVE")}`
                          : `${t("common:common.INACTIVE")}`}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
              </Grid>

              <Box sx={{ mt: 2 }} display="flex" gap={1.5}>
                <Button
                  color="primary"
                  // sx={{ width: 200, ml: 21 }}
                  disabled={isSubmitting}
                  type="reset"
                  onClick={handleReset}
                  variant="contained"
                >
                  {t("common:common.Reset")}
                </Button>
                <Button
                  color="primary"
                  // sx={{ width: 200 }}
                  disabled={isSubmitting}
                  type="submit"
                  variant="contained"
                >
                  {t("common:family.Update Family")}
                </Button>
              </Box>
            </Box>
          </Card>
        </form>
      )}
    </Formik>
  );
};

EditFamilyForm.propTypes = {
  //family: PropTypes.object.isRequired
};

export default EditFamilyForm;
