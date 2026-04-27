import React, { useState, useEffect, useContext, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useLocation } from "react-router";
import PropTypes from "prop-types";
import toast from "react-hot-toast";
import * as Yup from "yup";
import { Formik, Field } from "formik";
import {
  Box,
  Button,
  Card,
  Grid,
  TextField,
  Typography,
  FormControl,
  FormHelperText,
  Dialog,
  DialogTitle,
  DialogContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  Paper,
  CircularProgress,
} from "@mui/material";
import APIS from "../../../../common/hooks/UseApiCalls";
import { CommonDataContext } from "../../../../common/contexts/CommonDataContext";
import {
  getDistrictList,
  getSelectedCountryDetails,
  getStateList,
  handleCloseFormsWarning,
  validatePhoneNumber,
} from "../../../../helpers/helperFunction";
import NumberFormat from "react-number-format";
import "react-international-phone/style.css";
import { useTranslation } from "react-i18next";
import AutoCompleteDropdown from "../../../../components/UserComponents/AutoCompleteDropdown";
import {
  ADMIN,
  ADMIN_CASEWORKER,
  CASEWORKER,
  COUNTRY_ID_INDIA,
  COUNTRY_ID_UGANDA,
  INDIA,
  INDIA_DB,
  SUPER_ADMIN,
  USA,
  VIEW_ONLY,
} from "../../../../helpers/constant";
import "./ManageUserForm.css";
import { PhoneNumberUtil } from "google-libphonenumber";
import { PhoneTextInput } from "../../../../components/PhoneTextInput/PhoneTextInput";
import WarningRoundedIcon from "@mui/icons-material/WarningRounded";
import useAuthorization from "../../../../components/UserComponents/useAuthorization";
import { isUndefined } from "lodash";

const phoneUtil = PhoneNumberUtil.getInstance();

export const countryName = {
  india: { label: "india" },
  us: { label: "usa" },
  usa: { label: "usa" },
  uganda: { label: "uganda" },
};

const ManageUserForm = (props) => {
  const navigate = useNavigate();
  const { isAddForm, userID, orgId, ...other } = props;
  const location = useLocation();
  const accIdFromAccountCreation = location && location?.state?.fromOrg;
  const {
    locationList,
    roleListHT,
    roleListFS,
    signedinUserRoleHT,
    signedinUserRoleFS,
    organizationList,
    signedinOrgType,
    setFirstName,
    setLastName,
  } = useContext(CommonDataContext);
  const { t } = useTranslation(["common"]);
  const [user, setUser] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [isEmailAlreadyExist, setIsEmailAlreadyExist] = useState(false);
  const [value, setValue] = useState("");
  const [orgTypeId, setOrgTypeId] = useState(value || null);
  const [selectedRoleList, setSelectedRoleList] = useState([]);
  const [isThriveScaleChecked, setIsThriveScaleChecked] = useState(false);
  const [isFosterShareChecked, setIsFosterShareChecked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingFSRoleChange, setLoadingFSRoleChange] = useState(false);
  const [filteredOrgList, setFilteredOrgList] = useState(organizationList);
  const [initialCountry, setInitialCountry] = useState("");
  const signedinOrgId = localStorage.getItem("orgId");
  const signedInUserID = localStorage.getItem("username");
  const phoneRef = useRef({});

  useAuthorization(signedinUserRoleHT, signedinUserRoleFS,signedinOrgType, "ManageUser", [ADMIN,CASEWORKER,ADMIN_CASEWORKER,SUPER_ADMIN,VIEW_ONLY].includes(signedinUserRoleHT));

  const getOrgTypeForRoleList = (id) => {
    setOrgTypeId(id);
    setIsThriveScaleChecked(false);
    setIsFosterShareChecked(false);
  };

  const getUsers = useCallback(async () => {
    try {
      if (userID) {
        const data = await APIS.UserDetails(userID);
        setUser(data.data.data);
        const accessType = data?.data?.data?.accessType;
        if (accessType == "BOTH") {
          setIsThriveScaleChecked(true);
          setIsFosterShareChecked(true);
        } else if (accessType == "THRIVE_SCALE") {
          setIsThriveScaleChecked(true);
          setIsFosterShareChecked(false);
        } else if (accessType == "FOSTER_SHARE") {
          setIsThriveScaleChecked(false);
          setIsFosterShareChecked(true);
        }
      }
    } catch (err) {
      console.error(err);
    }
  }, []);

  useEffect(() => {
    if (!isAddForm) {
      getUsers();
    }
  }, [userID]);

  useEffect(() => {
    setFilteredOrgList(organizationList);
    setInitialCountry(
      organizationList.find((i) => i.id == accIdFromAccountCreation)
        ?.HTCountryId
    );
    //setOrgTypeId(organizationList.filter((item) => item.id == user?.HTOrganizationId)[0]?.HTOrganizationTypeId)
  }, [organizationList]);

  const handleEmailBlur = async (event, setErrors, initialEmail) => {
    if (
      event.target.value !== "" &&
      initialEmail.trim() !== event.target.value
    ) {
      try {
        const data = await APIS.CheckUserEmailExists(
          event.target.value.toLowerCase()
        );
        if (data?.status === 200 && data?.data?.message === "EMAIL_EXIST") {
          toast.error(t("common:common.Email already in Use!"), {
            duration: 8000,
          });
          setErrors({ email: t("common:common.Email already in Use!") });
          setIsEmailAlreadyExist(true);
        } else {
          setIsEmailAlreadyExist(false);
          toast.dismiss();
        }
        // setUsers(data && data.data && data.data.users);
        // setpageCount(data && data.data && data.data.pageCount);
        // setLoading(false);
        // return true;
        //}
      } catch (err) {
        console.error(err);
        // setLoading(false)
        toast.dismiss();
        toast.error("Error Validating Email!");
        // return false;
      }
    } else {
      if (isEmailAlreadyExist) {
        setIsEmailAlreadyExist(false);
      }
    }
  };

  const handleClickHelperText = (roleList) => {
    setSelectedRoleList(roleList);
    setOpenDialog(true);
  };

  const getAccessType = () =>
    isFosterShareChecked && isThriveScaleChecked
      ? "BOTH"
      : isFosterShareChecked
      ? "FOSTER_SHARE"
      : isThriveScaleChecked
      ? "THRIVE_SCALE"
      : null;

  const getRoleAccess = (name, id, setFieldValue, setErrors) => {
    if (name == "FSRole") {
      if (user?.id) {
        setLoadingFSRoleChange(true);
        CheckIsRoleChangeIsAllowed(
          name,
          user?.FSUserRoleId,
          id,
          setFieldValue,
          setErrors
        );
      }
      if (!isUndefined(id) && id !== "9") {
        setIsFosterShareChecked(true);
      } else {
        setIsFosterShareChecked(false);
      }
    } else {
      if (user?.id) {
        setLoading(true);
        CheckIsRoleChangeIsAllowed(
          name,
          user?.HTUserRoleId,
          id,
          setFieldValue,
          setErrors
        );
      }
      if (!isUndefined(id) && id !== "9") {
        setIsThriveScaleChecked(true);
      } else {
        setIsThriveScaleChecked(false);
      }
    }
  };

  const CheckIsRoleChangeIsAllowed = async (
    name,
    oldRole,
    newRole,
    setFieldValue,
    setErrors
  ) => {
    try {
      const payload = {
        country: countryName[user?.countryInfo.toLowerCase()].label,
      };

        payload.TWUserId = user?.id;
        payload.TWAccountId = user?.TWAccountId;
        payload.TWRoleFrom = oldRole;
        payload.TWRoleTo = newRole;
      

      await APIS.validateRoleChange(payload, name).then((res) => {
        if (res.status == 200) {
          if (res?.data?.message === "NOT OK") {
            toast.error(res?.data?.data);
            if (name == "HTRole") {
              setLoading(false);
              setFieldValue("HTRole", oldRole);
              if (!isUndefined(oldRole) && oldRole !== "9") {
                setIsThriveScaleChecked(true);
              } else {
                setIsThriveScaleChecked(false);
              }
            } else {
              setLoadingFSRoleChange(false);
              setFieldValue("FSRole", oldRole);
              if (!isUndefined(oldRole) && oldRole !== "9") {
                setIsFosterShareChecked(true);
              } else {
                setIsFosterShareChecked(false);
              }
            }
          } else {
            if (name == "HTRole") {
              setLoading(false);
            } else {
              setLoadingFSRoleChange(false);
            }
          }
        }
      });
    } catch (err) {
      toast.error(t("common:common.Something went wrong"));

      if (name == "HTRole") {
        setFieldValue("HTRole", oldRole);
        setLoading(false);
      } else {
        setFieldValue("FSRole", oldRole);
        setLoadingFSRoleChange(false);
      }
    }

    {
    }
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const changeCountryValue = (id) => {
    setFilteredOrgList(organizationList);
  };

  const getFilteredHTOrgTypes = (orgIdValue) => {
    const selectedOrgType = filteredOrgList.find(
      (item) => item.id === orgIdValue
    )?.MPAccountTypeId;
    if (selectedOrgType == 6) {
      // Only allow roles with id 2,7 and 9 for org type 6
      return roleListHT.filter((item) => item.id == 2 || item.id == 7 || item.id == 9);
    } else if (selectedOrgType != 1) {
      const filteredData = roleListHT.filter((item) => item.id != 1);
      return filteredData;
    } else {
      return roleListHT;
    }
  };

  const getFilteredFSOrgTypes = (orgIdValue) => {
    const selectedOrgType = filteredOrgList.find(
      (item) => item.id === orgIdValue
    )?.MPAccountTypeId;
    if (selectedOrgType != 1) {
      const filteredData = roleListFS.filter(
        (item) => item.id != 1 && item.id != 8
      );
      return filteredData;
    } else {
      return roleListFS.filter((item) => item.id != 8);
    }
  };

  return (
    <Formik
      initialValues={{
        address1: user?.addressLine1 || "",
        country: accIdFromAccountCreation
          ? initialCountry
          : user?.TWCountryId || "",
        email: user?.email || "",
        //organization_name: user.related_org || '',
        //name: user?.name,
        firstname: user?.firstName || "",
        lastname: user?.lastName || "",
        organizationName: [SUPER_ADMIN].includes(signedinUserRoleHT)
          ? accIdFromAccountCreation
            ? accIdFromAccountCreation
            : user?.TWAccountId || ""
          : user?.TWAccountId || signedinOrgId,
        HTRole: user?.HTUserRoleId || "9",
        FSRole: user?.FSUserRoleId || "9",
        // HTRole: null,
        // FSRole: null,

        address2: user?.addressLine2 || "",
        district: user?.TWDistrictId || "",
        zipCode: user?.zipCode
          ? user?.zipCode?.length > 6
            ? user?.zipCode.slice(0, 5) + "-" + user?.zipCode.slice(5)
            : user?.zipCode
          : "",
        phone: accIdFromAccountCreation
          ? locationList?.find(
              (individualCountry) => individualCountry.id == initialCountry
            )?.countryCode
          : user?.phoneNumber || "+1",
        state: user?.TWStateId || "",
        submit: null,
        city: user?.city || "",
      }}
      enableReinitialize={true}
      validationSchema={Yup.object().shape({
        address1: Yup.string()
          .max(255)
          .required(t("common:warnings.Address Line 1 is required")),
        country: Yup.string()
          .max(255)
          .required(t("common:warnings.Country is required")),
        city: Yup.string()
          .max(255)
          .required(t("common:warnings.City is required")),
        email: Yup.string()
          .email(t("common:warnings.Must be a valid email"))
          .max(255)
          .required(t("common:warnings.Email is required")),
        firstname: Yup.string()
          .max(255)
          .required(t("common:warnings.First Name is required")),
        lastname: Yup.string()
          .max(255)
          .required(t("common:warnings.Last Name is required")),
        organizationName: Yup.string()
          .max(255)
          .required(t("common:warnings.Organization  is required")),
        FSRole: Yup.string()
          .max(255)
          .when(["isFosterShareChecked", "isThriveScaleChecked"], {
            is: (isFosterShareChecked, isThriveScaleChecked) =>
              !isFosterShareChecked && !isThriveScaleChecked,
            then: Yup.string()
              .required(t("common:warnings.Role is required"))
              .nullable(),
          }),
        HTRole: Yup.string()
          .max(255)
          .when(["isFosterShareChecked", "isThriveScaleChecked"], {
            is: (isFosterShareChecked, isThriveScaleChecked) =>
              !isFosterShareChecked && !isThriveScaleChecked,
            then: Yup.string()
              .required(t("common:warnings.Role is required"))
              .nullable(),
          }),
        address2: Yup.string().max(255),
        //district: Yup.string().max(255).required(t('common:warnings.District is required')),
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
        zipCode: Yup.string()
          .required(t("common:warnings.Zipcode is required"))
          .when("country", (country, schema) => {
            return schema.test({
              name: "zip-format-validation",
              exclusive: true,
              message: t("common:warnings.Invalid ZIP code format"),
              test: function (zipCode) {
                if (
                  locationList
                    .find((obj) => obj.id == country)
                    ?.isoCode?.toUpperCase() === "IND"
                ) {
                  return /^\d{6}$/.test(zipCode);
                } else {
                  return /^\d{5}$/.test(zipCode);
                }
              },
            });
          }),
        phone: Yup.string()
          .required(t("common:warnings.Phone Number is required"))
          .test(
            "phone-format-validation",
            t("common:warnings.Invalid Phone number"),
            (value) => validatePhoneNumber(value, phoneRef),
          ),
        state: Yup.string()
          .max(255)
          .required(t("common:warnings.State is required")),
      })}
      onSubmit={async (
        values,
        { resetForm, setErrors, setStatus, setSubmitting }
      ) => {
        let payload = {
          id: user && user.id,
          firstName: values.firstname.trim(),
          lastName: values.lastname.trim(),
          addressLine1: values.address1.trim(),
          addressLine2: values.address2.trim(),
          zipCode: values.zipCode.trim(),
          phoneNumber: values.phone.trim(),
          email: values.email.trim(),
          TWAccountId: values.organizationName,
          TWCountryId: values.country,
          TWDistrictId: values.district ? values.district : null,
          TWStateId: values.state,
          city: values.city.trim(),
          MPLanguageId: "1",
          accessType: getAccessType(),
          HTUserRoleId: values.HTRole,
          FSUserRoleId: values.FSRole,
          dbRegion: INDIA_DB.includes(values.country) ? INDIA : USA,
        };
        if (
          payload?.phoneNumber &&
          "+" + phoneRef.current.dialCode ===
            payload?.phoneNumber
        ) {
          payload.phoneNumber = null;
        }
        try {
          isAddForm
            ? await APIS.AddUser(payload).then((res) => {
                if (res && res.data && res.status == 200) {
                  setStatus({ success: true });
                  setSubmitting(false);
                  toast.success(t("common:user.User Added Successfully"));
                  navigate("/dashboard/team/");
                } else {
                  toast.error(t("common:common.Something went wrong"));
                  setStatus({ success: false });
                  setSubmitting(false);
                }
              })
            : await APIS.EditUser(payload).then((res) => {
                if (res && res.data && res.status == 200) {
                  setStatus({ success: true });
                  setSubmitting(false);
                  toast.success(t("common:user.User Updated Successfully"));
                  if (localStorage.getItem("username") === user.id) {
                    if (payload.firstName !== user.firstName) {
                      setFirstName(payload.firstName);
                    }
                    if (payload.lastName !== user.lastName) {
                      setLastName(payload.lastName);
                    }
                  }
                  navigate("/dashboard/team/");
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
        initialValues,
        handleBlur,
        handleChange,
        handleReset,
        handleSubmit,
        isSubmitting,
        touched,
        values,
        setFieldValue,
        setFieldError,
        setErrors,
        dirty,
      }) => {
        if (isSubmitting) {
          const el = document.querySelector(".Mui-error, [data-error]");
          (el?.parentElement ?? el)?.scrollIntoView();
          // (el?.parentElement ?? el)?.focus();
        }
        return (
          <form onSubmit={handleSubmit} {...other}>
            <Card sx={{ borderRadius: "4px", width: "60%" }}>
              <Box sx={{ m: 2, mt: 3 }}>
                <Grid container spacing={3}>
                  <Grid item md={12} xs={12}>
                    <Typography sx={{ color: "#3C4449" }} variant="h6">
                      {t("common:common.User details")}
                    </Typography>
                  </Grid>
                  <Grid item md={6} xs={12}>
                    <TextField
                      error={Boolean(touched.firstname && errors.firstname)}
                      fullWidth
                      helperText={touched.firstname && errors.firstname}
                      label={t("common:common.FirstName")}
                      name="firstname"
                      id="firstname"
                      onBlur={handleBlur}
                      onChange={(e) => {
                        setFieldValue("firstname", e.target.value);
                      }}
                      required
                      value={values.firstname}
                      variant="outlined"
                      sx={{
                        "& fieldset": { borderRadius: "4px" },
                      }}
                    />
                  </Grid>
                  <Grid item md={6} xs={12}>
                    <TextField
                      error={Boolean(touched.lastname && errors.lastname)}
                      fullWidth
                      helperText={touched.lastname && errors.lastname}
                      label={t("common:common.LastName")}
                      name="lastname"
                      id="lastname"
                      onBlur={handleBlur}
                      onChange={(e) => {
                        setFieldValue("lastname", e.target.value);
                      }}
                      required
                      value={values.lastname}
                      variant="outlined"
                      sx={{
                        "& fieldset": { borderRadius: "4px" },
                      }}
                    />
                  </Grid>
                  <Grid item md={12} xs={12}>
                    <TextField
                      error={Boolean(touched.email && errors.email)}
                      fullWidth
                      helperText={touched.email && errors.email}
                      label={t("common:common.Email Address")}
                      name="email"
                      id="email"
                      onBlur={(e) => {
                        handleEmailBlur(e, setErrors, initialValues.email);
                        handleBlur(e);
                      }}
                      onChange={(e) => {
                        setFieldValue("email", e.target.value.trim());
                      }}
                      disabled={user.id == signedInUserID}
                      required
                      value={values.email}
                      variant="outlined"
                      sx={{
                        "& fieldset": { borderRadius: "4px" },
                      }}
                    />
                  </Grid>
                  <Grid item md={6} xs={12} sx={{ mt: -2 }}>
                    <Field
                      error={Boolean(touched.country && errors.country)}
                      fullWidth
                      helperText={touched.country && errors.country}
                      name="country"
                      id="country"
                      accessKey="countryName"
                      disabled={user?.id}
                      component={AutoCompleteDropdown}
                      required={true}
                      label="country"
                      options={locationList.filter((locItem) =>
                        localStorage.getItem("userRegion") === "1"
                          ? locItem.id === "1"  // If userRegion is "1", show only item with id "1"
                          : locItem.id !== "1"  // Otherwise, show items with id "2" and "3" (exclude "1")
                      )}
                      textFieldProps={{
                        fullWidth: true,
                        margin: "normal",
                        variant: "outlined",
                        label: t("common:common.Country"),
                      }}
                      sx={{
                        "& fieldset": { borderRadius: "4px" },
                      }}
                      handleValueChange={(id) => {
                        changeCountryValue(id);
                        setFieldValue("zipCode", "");
                      }}
                    />
                    {user?.id && (
                      <Typography
                        color="#778791"
                        fontSize="0.875rem"
                        display="flex"
                        alignItems="center"
                        gap={1}
                      >
                        <WarningRoundedIcon />
                        {t(
                          "common:warnings.Country cannot be changed once Team Member is created"
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
                      id="state"
                      accessKey="stateName"
                      component={AutoCompleteDropdown}
                      required={true}
                      label="state"
                      options={getStateList(locationList, values.country) || []}
                      textFieldProps={{
                        fullWidth: true,
                        margin: "normal",
                        variant: "outlined",
                        label: t("common:common.State"),
                      }}
                      sx={{
                        "& fieldset": { borderRadius: "4px" },
                      }}
                    />
                  </Grid>
                  {values.country &&
                    getSelectedCountryDetails(locationList, values.country)
                      ?.districtRequired && (
                      <Grid item md={6} xs={12} sx={{ mt: -2 }}>
                        <Field
                          id="region"
                          error={Boolean(touched.district && errors.district)}
                          fullWidth
                          helperText={touched.district && errors.district}
                          name="district"
                          accessKey="districtName"
                          component={AutoCompleteDropdown}
                          disabled={Boolean(
                            values.childCurrentPlacement === "1"
                          )}
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
                      id="city"
                      required
                      onBlur={handleBlur}
                      onChange={handleChange}
                      value={values.city}
                      variant="outlined"
                      sx={{
                        "& fieldset": { borderRadius: "4px" },
                      }}
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
                      error={Boolean(touched.zipCode && errors.zipCode)}
                      fullWidth
                      helperText={touched.zipCode && errors.zipCode}
                      // label={t('common:common.Phone Number')}
                      placeholder={
                        locationList
                          .find((obj) => obj.id == values.country)
                          ?.isoCode?.toUpperCase() === "IND"
                          ? "888888"
                          : "88888"
                      }
                      // label={t("common:common.Zipcode")}
                      label={t("common:common.ZIP/postal Code")}
                      name="zipCode"
                      id="zipCode"
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
                        setFieldValue("zipCode", zipCode);
                      }}
                      value={values.zipCode}
                      disabled={!values.country}
                      sx={{
                        "& fieldset": { borderRadius: "4px" },
                      }}
                    />
                  </Grid>
                  <Grid item md={6} xs={12}>
                    <TextField
                      error={Boolean(touched.address1 && errors.address1)}
                      fullWidth
                      helperText={touched.address1 && errors.address1}
                      label={t("common:common.Address 1")}
                      name="address1"
                      id="address1"
                      required
                      onBlur={handleBlur}
                      onChange={handleChange}
                      value={values.address1}
                      variant="outlined"
                      sx={{
                        "& fieldset": { borderRadius: "4px" },
                      }}
                    />
                  </Grid>
                  <Grid item md={6} xs={12}>
                    <TextField
                      error={Boolean(touched.address2 && errors.address2)}
                      fullWidth
                      helperText={touched.address2 && errors.address2}
                      label={t("common:common.Address 2")}
                      name="address2"
                      id="address2"
                      onBlur={handleBlur}
                      onChange={handleChange}
                      value={values.address2}
                      variant="outlined"
                      sx={{
                        "& fieldset": { borderRadius: "4px" },
                      }}
                    />
                  </Grid>
                  <Grid item md={6} xs={12}>
                    <PhoneTextInput
                      id="phone"
                      name={`phone`}
                      required
                      onBlur={handleBlur}
                      error={Boolean(touched?.phone && errors?.phone)}
                      helperText={touched?.phone && errors?.phone}
                      value={values.phone}
                      phoneRef={phoneRef}
                      onChange={(phone) => setFieldValue("phone", phone)}
                      defaultCountry={
                        locationList?.find(
                            (obj) =>
                                obj.id ==
                                localStorage.getItem("userRegion")
                        )?.iso2Code
                      }
                    />
                  </Grid>
                  <Grid item xs={12} sx={{ mt: 2 }}>
                    <Typography sx={{ color: "#3C4449" }} variant="h6">
                      {t("common:common.Organization")}
                    </Typography>
                  </Grid>
                  <Grid item md={6} xs={12} paddingTop={"0px !important"}>
                    <Field
                      error={Boolean(
                        touched.organizationName && errors.organizationName
                      )}
                      // style={{ width: "50%" }}
                      helperText={
                        touched.organizationName && errors.organizationName
                      }
                      name="organizationName"
                      id="organizationName"
                      accessKey="accountName"
                      disabled={
                        [SUPER_ADMIN].includes(signedinUserRoleHT)
                          ? accIdFromAccountCreation
                            ? true
                            : false
                          : true
                      }
                      component={AutoCompleteDropdown}
                      required={true}
                      label=""
                      options={organizationList?.filter((org) => org?.isActive)}
                      getOrgTypeForRoleList={getOrgTypeForRoleList}
                      // disabled={signedinUserRole === 'superadmin' ? false : currentOrganization && true}
                      textFieldProps={{
                        fullWidth: true,
                        margin: "normal",
                        variant: "outlined",
                        label: t("common:common.Organization"),
                      }}
                      sx={{
                        "& fieldset": { borderRadius: "4px" },
                        width: 1,
                      }}
                    />
                  </Grid>
                  {values?.organizationName && (
                    <Grid item md={12} xs={12} sx={{ mt: 1, mb: -4 }}>
                      <Typography sx={{ color: "#3C4449" }} variant="h6">
                        {t("common:common.Roles & Permission")}
                      </Typography>
                    </Grid>
                  )}
                  {["FOSTER_SHARE", "BOTH"].includes(
                    organizationList.filter(
                      (item) => item.id == values.organizationName
                    )[0]?.accessType
                  ) && (
                    <Grid item container xs={12} spacing={3} sx={{ mb: -4 }}>
                      <Grid item md={6} xs={12}>
                        <FormControl
                          fullWidth
                          margin="normal"
                          variant="outlined"
                        >
                          <Typography
                            sx={{ mb: -1, color: "#3C4449" }}
                            variant="body1"
                          >
                            {t("common:common.FosterShare")}
                          </Typography>
                          <Field
                            error={
                              Boolean(
                                !isFosterShareChecked && !isThriveScaleChecked
                              ) || Boolean(touched.FSRole && errors.FSRole)
                            }
                            // style={{ width: '50%' }}
                            helperText={
                              (!isFosterShareChecked &&
                                !isThriveScaleChecked) ||
                              (touched.FSRole && errors.FSRole)
                            }
                            name="FSRole"
                            id="FSRole"
                            disabled={
                              ![SUPER_ADMIN, ADMIN, ADMIN_CASEWORKER].includes(
                                signedinUserRoleFS
                              ) ||
                              user.id == signedInUserID
                            }
                            getRoleAccess={getRoleAccess}
                            accessKey="role"
                            component={AutoCompleteDropdown}
                            required={!isThriveScaleChecked}
                            label="role"
                            options={getFilteredFSOrgTypes(
                              values?.organizationName
                            )}
                            //disabled={fromOrg}
                            textFieldProps={{
                              fullWidth: true,
                              margin: "normal",
                              variant: "outlined",
                              label: t("common:common.Role"),
                            }}
                            sx={{
                              "& fieldset": { borderRadius: "4px" },
                            }}
                          />

                          <FormHelperText
                            sx={{ color: "#F37123", cursor: "pointer", mt: -1 }}
                            id="selectFSRole"
                            onClick={() =>
                              handleClickHelperText(
                                roleListFS?.filter(
                                  (role) => role.cognitoValue !== "superadmin"
                                )
                              )
                            }
                          >
                            {t(
                              "common:common.What FosterShare role do I select?"
                            )}
                          </FormHelperText>
                        </FormControl>
                      </Grid>
                      <Grid item sx={{ mt: 8 }} md={6} xs={12}>
                        {loadingFSRoleChange && (
                          <CircularProgress size={25}></CircularProgress>
                        )}
                      </Grid>
                    </Grid>
                  )}

                  {["THRIVE_SCALE", "BOTH"].includes(
                    organizationList.filter(
                      (item) => item.id == values.organizationName
                    )[0]?.accessType
                  ) && (
                    <Grid item container xs={12} spacing={3}>
                      <Grid item md={6} xs={12}>
                        <FormControl
                          fullWidth
                          margin="normal"
                          variant="outlined"
                        >
                          <Typography
                            sx={{ mb: -1, color: "#3C4449" }}
                            variant="body1"
                          >
                            {t("common:common:ThriveScale")}
                          </Typography>

                          <Field
                            error={Boolean(
                              !isFosterShareChecked && !isThriveScaleChecked
                            )}
                            // style={{ width: '50%' }}
                            helperText={touched?.HTRole && errors?.HTRole}
                            name="HTRole"
                            id="HTRole"
                            accessKey="role"
                            getRoleAccess={getRoleAccess}
                            component={AutoCompleteDropdown}
                            required={!isFosterShareChecked}
                            label="role"
                            options={getFilteredHTOrgTypes(
                              values?.organizationName
                            )}
                            disabled={
                              user.id == signedInUserID ||
                              ![SUPER_ADMIN, ADMIN, ADMIN_CASEWORKER].includes(
                                signedinUserRoleHT
                              )
                            }
                            textFieldProps={{
                              fullWidth: true,
                              margin: "normal",
                              variant: "outlined",
                              label: t("common:common.Role"),
                            }}
                            sx={{
                              "& fieldset": { borderRadius: "4px" },
                            }}
                          />

                          <FormHelperText
                            sx={{ color: "#F37123", cursor: "pointer", mt: -1 }}
                            id="selectHTRole"
                            onClick={() =>
                              handleClickHelperText(
                                roleListHT?.filter(
                                  (role) => role.cognitoValue !== "superadmin"
                                )
                              )
                            }
                          >
                            {t(
                              "common:common.What ThriveScale role do I select?"
                            )}
                          </FormHelperText>
                        </FormControl>
                      </Grid>
                      <Grid item sx={{ mt: 8 }} md={6} xs={12}>
                        {loading && (
                          <CircularProgress size={25}></CircularProgress>
                        )}
                      </Grid>
                    </Grid>
                  )}
                  <Dialog
                    maxWidth="sm"
                    open={openDialog}
                    onClose={handleCloseDialog}
                  >
                    <DialogTitle>
                      {t("common:common.Role Information")}
                    </DialogTitle>
                    <DialogContent>
                      {/* <Typography variant="subtitle1">
                      Short Description:
                    </Typography>
                    <Typography paragraph>
                      Provide a short description of the role selection here.
                    </Typography> */}

                      {/* 2 Column Table */}
                      <TableContainer
                        component={Paper}
                        sx={{ borderRadius: "4px", mt: 1 / 4 }}
                      >
                        <Table>
                          <TableBody sx={{ mt: 1 }}>
                            {/* Map through your roleList to create rows */}
                            {selectedRoleList
                              ?.filter(
                                (obj) => obj.cognitoValue !== "superadmin"
                              )
                              ?.map((role) => (
                                <TableRow key={role.id}>
                                  <TableCell
                                    sx={{ borderRight: "1px solid #C6C4BE" }}
                                  >
                                    {t(`common:common.${role.role}`)}
                                  </TableCell>
                                  <TableCell>{role.description}</TableCell>
                                </TableRow>
                              ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                      <Button
                        variant="contained"
                        id="closeButton"
                        fullWidth
                        sx={{ marginTop: 2, borderRadius: "4px" }}
                        onClick={handleCloseDialog}
                      >
                        {t("common:common.Close")}
                      </Button>
                    </DialogContent>
                  </Dialog>
                </Grid>
                <Box
                  sx={{
                    flex: 1,
                    display: "flex",
                    flexDirection: "row",
                    justifyContent: "flex-end",
                  }}
                >
                  <Button
                    color="primary"
                    disabled={isSubmitting}
                    onClick={() => {
                      handleCloseFormsWarning(t,dirty, navigate);
                    }}
                    type="reset"
                    variant="text"
                    id="closeButton"
                    style={{ borderRadius: 4, marginRight: 2 }} // Set border radius
                  >
                    {t("common:common.Close")}
                  </Button>
                  <Button
                    color="primary"
                    disabled={
                      isSubmitting ||
                      isEmailAlreadyExist ||
                      ![isThriveScaleChecked, isFosterShareChecked].includes(
                        true
                      ) ||
                      loading
                    }
                    variant="contained"
                    id="saveButton"
                    onClick={handleSubmit}
                    sx={{ mr: 1, borderRadius: "4px" }}
                  >
                    {isAddForm
                      ? t("common:user.Add User")
                      : t("common:user.Update User")}
                  </Button>
                </Box>
              </Box>
            </Card>
          </form>
        );
      }}
    </Formik>
  );
};

ManageUserForm.propTypes = {
  user: PropTypes.object.isRequired,
};

export default ManageUserForm;
