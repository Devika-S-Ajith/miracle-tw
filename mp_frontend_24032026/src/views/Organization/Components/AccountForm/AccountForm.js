import React, { useState, useContext, useEffect } from "react";
import PropTypes from "prop-types";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import * as Yup from "yup";
import { Formik, Field } from "formik";
import {
  Box,
  Button,
  Card,
  CardHeader,
  FormControl,
  FormControlLabel,
  FormGroup,
  Grid,
  TextField,
  Typography,
  Checkbox,
  CircularProgress,
} from "@mui/material";
import WarningRoundedIcon from "@mui/icons-material/WarningRounded";
import { useTranslation } from "react-i18next";
import NumberFormat from "react-number-format";
import APIS from "../../../../common/hooks/UseApiCalls";

import { CommonDataContext } from "../../../../common/contexts/CommonDataContext";
import {
  getDistrictList,
  getSelectedCountryDetails,
  getStateList,
  handleCloseFormsWarning,
} from "../../../../helpers/helperFunction";
import AutoCompleteDropdown from "../../../../components/UserComponents/AutoCompleteDropdown";
import { ModalService } from "../../../../components/Modal";
import AccountTypesTable from "../../../../components/AccountTypesTable";
import {
  ADMIN,
  ADMIN_CASEWORKER,
  INDIA,
  INDIA_DB,
  SUPER_ADMIN,
  USA,
} from "../../../../helpers/constant";
import CustomSwitch from "../../../../components/UserComponents/CustomSwitch";


const AccountForm = (props) => {
  const [activeForms, setActiveForms] = useState([]);
  const [loadingActiveForms, setLoadingActiveForms] = useState(false);
  const navigate = useNavigate();
  const { t } = useTranslation(["common"]);
  const { organization, ...other } = props;
  const [isFosterShareChecked, setIsFosterShareChecked] = useState(
    Boolean(["BOTH", "FOSTER_SHARE"].includes(props.organization?.accessType))
  );
  const [orgOptions, setOrgOptions] = useState([])
  const [isThriveScaleChecked, setIsThriveScaleChecked] = useState(
    props.organization?.accessType
      ? Boolean(
          ["BOTH", "THRIVE_SCALE"].includes(props.organization?.accessType)
        )
      : false || true
  );
 const isEditMode = !!props.organization?.id;

const [consentChecked, setConsentChecked] = useState(
    isEditMode ? props.organization?.consentRequired : true
);
  const [gotoAddUserPage, setGotoAddUserPage] = useState(false);
  const {
    locationList,
    typeList,
    getOrganizationList,
    accountTypesList,
    signedinUserRoleHT,
    organizationList
  } = useContext(CommonDataContext);
  const webRegExp =
    /((https?):\/\/)?(www.)?[a-z0-9]+(\.[a-z]{2,}){1,3}(#?\/?[a-zA-Z0-9#]+)*\/?(\?[a-zA-Z0-9-_]+=[a-zA-Z0-9-%]+&?)?$/;
  const isDCPUList = [
    {
      id: "false",
      value: t("common:common.No"),
    },
    {
      id: "true",
      value: t("common:common.Yes"),
    },
  ];

  const ParentOrganizationPermissionList = [
    {
      id: "OVERVIEW",
      value: t("common:common.Overview", "Overview"),
    },
    {
      id: "DETAILED",
      value: t("common:common.Detailed","Detailed"),
      disabled:true
    },
  ];

  const fetchActiveForms = async (country) => {
    setLoadingActiveForms(true);
    try {
      const countryDetails = getSelectedCountryDetails(locationList, country);
      const countryId = locationList.find(
        (loc) =>
          loc.countryName ===
          (countryDetails.countryName === "India" ? "India" : "US"),
      )?.id;
      const params = { id: countryId };
      const res = await APIS.getActiveForms(params);
      if (res && res.data?.data) {
        setActiveForms(res.data?.data);
      }
    } catch (error) {
      // Optionally handle error
    } finally {
      setLoadingActiveForms(false);
    }
  };
  
  useEffect(() => {
    if(organization?.MPCountryId) {
      fetchActiveForms(organization?.MPCountryId);
    }
  }, [organization?.MPCountryId]);
  
  const changeThriveScaleAccess = () => {
    setIsThriveScaleChecked(!isThriveScaleChecked);
    if (isThriveScaleChecked && !isFosterShareChecked) {
      setIsFosterShareChecked(true);
    }
  
  };

  const changeFosterShareAccess = () => {
    setIsFosterShareChecked(!isFosterShareChecked);
    if (isFosterShareChecked && !isThriveScaleChecked) {
      setIsThriveScaleChecked(true);
    }
  };

  const getAccessType = () =>
    isFosterShareChecked && isThriveScaleChecked
      ? "BOTH"
      : isFosterShareChecked
      ? "FOSTER_SHARE"
      : isThriveScaleChecked
      ? "THRIVE_SCALE"
      : null;

  const debouncedHandleCheckNameExistence = async (id, value) => {
    const res = await APIS.checkOrganizationName(id, value);
    if (res?.data?.message === "ACCOUNT_NAME_EXIST") {
      return Promise.resolve(false);
    } else {
      return Promise.resolve(true);
    }
  };

  return (
    <Formik
      initialValues={{
        address1: organization?.addressLine1 || "",
        address2: organization?.addressLine2 || "",
        country: organization?.MPCountryId || "",
        email: organization?.email || "",
        organization_name: organization?.accountName || "",
        phone: organization?.phoneNumber || "",
        state: organization?.MPStateId || "",
        submit: null,
        website: organization?.website || "",
        organization_type: organization?.MPAccountTypeId || "",
        city: organization?.city || "",
        zip_code: organization?.zipCode
          ? organization?.zipCode?.length > 6
            ? organization?.zipCode.slice(0, 5) +
              "-" +
              organization?.zipCode.slice(5)
            : organization?.zipCode
          : "",
        district: organization?.MPDistrictId || "",
        isDCPU:
          organization?.isDCPUOrg === true
            ? "true"
            : organization?.isDCPUOrg === false
            ? "false"
            : "",
        firstName: organization?.primaryContact?.firstName || "",
        lastName: organization?.primaryContact?.lastName || "",
        parentOrgPermission: organization?.permissions || "",
        selectedItems:organization?.linkedAccounts?.map(account => account.id) || [],
        caseMangerCount:organization?.caseManagerCount || "",
        childrenServedCount:organization?.childCount || "",
        familyServedCount:organization?.familyCount || "",
        defaultLanguage: organization ? organization["MP_forms.MP_formAccountMapping.MPFormId"] : ""
      }}
      validationSchema={Yup.object().shape({
        address1: Yup.string()
          .max(255)
          .required(t("common:warnings.Address Line 1 is required")),

        address2: Yup.string().max(255),

        country: Yup.string()
          .max(255)
          .required(t("common:warnings.Country is required")),

        defaultLanguage: Yup.string()
          .nullable()
          .max(255)
          .when("organization_type", {
            is: (val) => val && val !== "6",
            then: (schema) => schema.required(t("common:warnings.Default assessment language is required")),
            otherwise: (schema) => schema,
          }),

        website: Yup.string().matches(
          webRegExp,
          t("common:warnings.Enter correct url")
        ),

        city: Yup.string()
          .max(255)
          .required(t("common:warnings.City is required")),

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

        organization_type: isThriveScaleChecked
          ? Yup.string()
              .max(255)
              .required(t("common:warnings.Organization Type is required"))
          : Yup.string().max(255),

        // isDCPU: Yup.string().when("organization_type", {
        //   is: (val) => val === "2",
        //   then: Yup.string().required(
        //     t("common:warnings.This field is required")
        //   ),
        //   otherwise: Yup.string().max(255),
        // }),

        email: Yup.string()
          .email(t("common:warnings.Must be a valid email"))
          .max(255),

        organization_name: Yup.string()
          .max(255)
          .required(t("common:warnings.Organization Name is required")),

        state: Yup.string()
          .max(255)
          .required(t("common:warnings.State is required")),
        selectedItems: Yup.array()
          .when("organization_type", {
            is: (val) => val === "6",
            then: Yup.array()
              .min(1, t("common:At least one organization must be selected")),
            otherwise: Yup.array(),
          }),
        caseMangerCount: Yup.string()
          .max(4 , t("common:warnings.Case manager count must be 4 digits", "Case manager count must be 4 digits"))
          .when([], {
            is: () => organization && organization.id &&  organization.permissions === "SELF_ORGANIZATION_LEVEL",
            then: (schema) => schema.required(t("common:warnings.Case manager count is required", "Case manager count is required")),
            otherwise: (schema) => schema
          }),
        childrenServedCount: Yup.string()
          .max(4 , t("common:warnings.Children served count max value is 9999", "Children served count max value is 9999"))
          .when([], {
            is: () => organization && organization.id &&  organization.permissions === "SELF_ORGANIZATION_LEVEL",
            then: (schema) => schema.required(t("common:warnings.Children served count is required", "Children served count is required")),
            otherwise: (schema) => schema
          }),
        familyServedCount: Yup.string()
          .max(4 , t("common:warnings.Family served count max value is 9999", "Family served count max value is 9999"))
          .when([], {
            is: () => organization && organization.id &&  organization.permissions === "SELF_ORGANIZATION_LEVEL",
            then: (schema) => schema.required(t("common:warnings.Family served count is required", "Family served count is required")),
            otherwise: (schema) => schema
          }),
          parentOrgPermission: Yup.string()
          .when("organization_type", {
            is: (val) => val === "6",
            then: Yup.string()
              .required(t("common:Parent Organization permission is required")),
           // otherwise: Yup.string(),
          }),
      })}
      onSubmit={async (
        values,
        { resetForm, setErrors, setStatus, setSubmitting }
      ) => {
        try {
          if (organization) {
            let payload = {
              id: organization && organization.id,
              accountName: values.organization_name,
              addressLine1: values.address1,
              addressLine2: values.address2,
              zipCode: values.zip_code,
              MPAccountTypeId: isThriveScaleChecked
                ? values.organization_type
                : null,
              MPCountryId: values.country,
              MPDistrictId: values.district ? values.district : null,
              MPStateId: values.state,
              city: values.city,
              // isDCPUOrg: "",
              dbRegion: INDIA_DB.includes(values.country) ? INDIA : USA,
              accessType: values.organization_type === "6"? "THRIVE_SCALE" :getAccessType(),
              consentRequired: consentChecked,
              primaryContact: null,
              permissions:values.organization_type === "6" ? values.parentOrgPermission : "SELF_ORGANIZATION_LEVEL",
              linkedAccountIds:values.selectedItems.length > 0 ? values.selectedItems : null,
              caseManagerCount:values.caseMangerCount || null,
              childCount: values.childrenServedCount || null,
              familyCount: values.familyServedCount || null,
              MPFormId: values.organization_type !== "6" ? values.defaultLanguage || null : null
            };
            await APIS.EditOrganization(payload).then((res) => {
              if (res && res.data && res.status === 200) {
                getOrganizationList();
                setStatus({ success: true });
                setSubmitting(false);
                toast.success(
                  t("common:warnings.Organization Updated Successfully")
                );
                navigate("/dashboard/organizations");
              } else {
                toast.error(t("common:common.Something went wrong"));
                setStatus({ success: false });
                setSubmitting(false);
              }
            });
          } else {
            const payload = {
              accountName: values.organization_name,
              addressLine1: values.address1,
              addressLine2: values.address2,
              zipCode: values.zip_code,
              MPAccountTypeId: isThriveScaleChecked
                ? values.organization_type
                : null,
              MPCountryId: values.country,
              MPDistrictId: values.district ? values.district : null,
              MPStateId: values.state,
              city: values.city,
              // isDCPUOrg: "",
              dbRegion: INDIA_DB.includes(values.country) ? INDIA : USA,
              accessType: getAccessType(),
              consentRequired: true,
              primaryContact: null,
              permissions:values.organization_type === "6" ? values.parentOrgPermission : "SELF_ORGANIZATION_LEVEL",
              linkedAccountIds:values.selectedItems.length > 0 ? values.selectedItems : [],
              MPFormId: values.organization_type !== "6" ? values.defaultLanguage || null : null
            };
            await APIS.AddOrganization(payload).then((res) => {
              if (res && res.data && res.status === 200) {
                resetForm();
                getOrganizationList();
                setStatus({ success: true });
                setSubmitting(false);
                toast.success(
                  t("common:warnings.Organization Added Successfully")
                );
                if (!gotoAddUserPage) {
                  navigate("/dashboard/organizations");
                } else {
                  const savedOrgid = res.data?.data;
                  navigate("/dashboard/team/add", {
                    state: { fromOrg: savedOrgid },
                  });
                }
              } else {
                if (res.status === 400) {
                  let errorMessage = res.body.Error.split(":");
                  toast.error(errorMessage[errorMessage.length - 1]);
                } else {
                  toast.error(t("common:common.Something went wrong"));
                }
                setStatus({ success: false });
                setSubmitting(false);
              }
            });
          }
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
        handleSubmit,
        isSubmitting,
        touched,
        values,
        initialValues,
        setFieldValue,
        dirty,
      }) => {
        // Check to reset isDCPU if organization_type is not "2"
        // if (values.organization_type !== "2" && values.isDCPU !== "") {
        //   setFieldValue("isDCPU", "");
        // }

        if (isSubmitting) {
          const el = document.querySelector(".Mui-error, [data-error]");
          (el?.parentElement ?? el)?.scrollIntoView();
        }
        return (
          <form onSubmit={handleSubmit} {...other}>
            <Grid container spacing={3}>
              <Grid item md={7} xs={12}>
                <Card sx={{ width: "100%", borderRadius: "4px", p: 2 }}>
                  {/* Todo - Change the title with translation */}
                  <CardHeader
                    title={t("common:organization.Organization Details")}
                    sx={{ pb: "0px" }}
                  />
                  <Box sx={{ m: 2, mt: 3 }}>
                    <Grid container spacing={3}>
                      <Grid item xs={12}>
                        <TextField
                          error={Boolean(
                            touched.organization_name &&
                              errors.organization_name
                          )}
                          fullWidth
                          autoFocus
                          helperText={
                            touched.organization_name &&
                            errors.organization_name
                          }
                          label={t("common:organization.Organization Name")}
                          name="organization_name"
                          id="account_name_input"
                          onBlur={async (e) => {
                            handleBlur(e);
                            // Only check uniqueness if value changed and not empty
                            if (
                              e.target?.value?.length &&
                              organization?.accountName?.toLowerCase() !==
                                e.target?.value?.toLowerCase()
                            ) {
                              try {
                                const debounceResponse =
                                  await debouncedHandleCheckNameExistence(
                                    organization?.id,
                                    e.target?.value
                                  );
                                if (!debounceResponse) {
                                  // Set error for Formik
                                  setFieldValue(
                                    'organization_name',
                                    e.target.value,
                                    false
                                  );
                                  setTimeout(() => {
                                    setFieldValue(
                                      'organization_name',
                                      e.target.value,
                                      true
                                    );
                                  }, 0);
                                  toast.error(
                                    t("common:warnings.Organization Name is not unique")
                                  );
                                }
                              } catch (error) {}
                            }
                          }}
                          onChange={handleChange}
                          required
                          value={values.organization_name}
                          variant="outlined"
                          sx={{
                            "& fieldset": { borderRadius: "4px" },
                          }}
                        />
                      </Grid>
                      <Grid container item spacing={2} xs={12}>
                        <Grid item md={6} xs={12} sx={{ mt: -2 }}>
                          <Field
                            error={Boolean(touched.country && errors.country)}
                            fullWidth
                            helperText={touched.country && errors.country}
                            name="country"
                            accessKey="countryName"
                            component={AutoCompleteDropdown}
                            onOrgTypeChange={(value) => {
                              setFieldValue("selectedItems", []);
                              if (value) {
                                fetchActiveForms(value);
                              } else {
                                setFieldValue("defaultLanguage", "", true);
                              }
                            }}
                            required={true}
                            id="country"
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
                            disabled={organization?.id ?? false}
                            sx={{
                              "& fieldset": { borderRadius: "4px" },
                            }}
                          />
                          {organization?.id && (
                            <Typography
                              color="#778791"
                              fontSize="0.875rem"
                              display="flex"
                              alignItems="center"
                              gap={1}
                            >
                              <WarningRoundedIcon />
                              {t(
                                "common:warnings.Country cannot be changed once Organization is created"
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
                            id="state"
                            label="state"
                            options={
                              getStateList(locationList, values.country) || []
                            }
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
                      </Grid>

                      {values.country &&
                        getSelectedCountryDetails(locationList, values.country)
                          ?.districtRequired && (
                          <Grid item md={6} xs={12} sx={{ mt: -2 }}>
                            <Field
                              id="district"
                              error={Boolean(
                                touched.district && errors.district
                              )}
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
                          id="city"
                          name="city"
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
                        <NumberFormat
                          id="zip-code"
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
                          label={t("common:common.ZIP/postal Code")}
                          name="zip_code"
                          format={
                            locationList
                              .find((obj) => obj.id == values.country)
                              ?.isoCode?.toUpperCase() === "IND"
                              ? "######"
                              : "#####"
                          }
                          type="text"
                          required
                          onBlur={handleBlur}
                          onChange={(e) => {
                            let zipCode = e.target.value.trim();
                            setFieldValue("zip_code", zipCode);
                          }}
                          value={values.zip_code}
                          disabled={!values.country}
                          sx={{
                            "& fieldset": { borderRadius: "4px" },
                          }}
                        />
                      </Grid>

                      <Grid item xs={12}>
                        <TextField
                          error={Boolean(touched.address1 && errors.address1)}
                          fullWidth
                          helperText={touched.address1 && errors.address1}
                          label={t("common:common.Street Address 1")}
                          id="address1"
                          name="address1"
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
                      <Grid item xs={12}>
                        <TextField
                          error={Boolean(touched.address2 && errors.address2)}
                          fullWidth
                          helperText={touched.address2 && errors.address2}
                          label={t("common:common.Street Address 2")}
                          id="address2"
                          name="address2"
                          onBlur={handleBlur}
                          onChange={handleChange}
                          value={values.address2}
                          variant="outlined"
                          sx={{
                            "& fieldset": { borderRadius: "4px" },
                          }}
                        />
                      </Grid>
                      {organization &&
                        organization.id &&
                        organization.permissions === "SELF_ORGANIZATION_LEVEL" && (
                          <>
                          <Grid item spacing={2} md={12} xs={12}>
                            <Box sx={{ width: '50%' }}>
                              <NumberFormat
                                id="caseMangerCount"
                                customInput={TextField}
                                error={Boolean(touched.caseMangerCount && errors.caseMangerCount)}
                                fullWidth
                                helperText={touched.caseMangerCount && errors.caseMangerCount}
                                label={t("common:common.# of case managers in your organization", "# of case managers in your organization")}
                                name="caseMangerCount"
                                type="text"
                                onChange={handleChange}
                                onBlur={handleBlur}
                                value={values.caseMangerCount}
                                sx={{
                                  "& fieldset": { borderRadius: "4px" },
                                }}
                                allowNegative={false}
                                decimalScale={0}
                                // Maximum 4 digits
                                isAllowed={(values) => {
                                  const { floatValue } = values;
                                  return floatValue === undefined || floatValue <= 9999;
                                }}
                                // Only allow digits
                                allowLeadingZeros={false}
                              />
                            </Box>
                          </Grid>
                          <Grid item spacing={2} md={12} xs={12}>
                            <Box sx={{ width: '50%' }}>
                              <NumberFormat
                                id="familyServedCount"
                                customInput={TextField}
                                error={Boolean(touched.familyServedCount && errors.familyServedCount)}
                                fullWidth
                                helperText={touched.familyServedCount && errors.familyServedCount}
                                label={t("common:common.# of families served by your organization", "# of families served by your organization")}
                                name="familyServedCount"
                                type="text"
                                onChange={handleChange}
                                onBlur={handleBlur}
                                value={values.familyServedCount}
                                sx={{
                                  "& fieldset": { borderRadius: "4px" },
                                }}
                                 allowNegative={false}
                                decimalScale={0}
                                // Maximum 4 digits
                                isAllowed={(values) => {
                                  const { floatValue } = values;
                                  return floatValue === undefined || floatValue <= 9999;
                                }}
                                // Only allow digits
                                allowLeadingZeros={false}
                              />
                            </Box>
                          </Grid>
                          <Grid item spacing={2} md={12} xs={12}>
                            <Box sx={{ width: '50%' }}>
                              <NumberFormat
                                id="childrenServedCount"
                                customInput={TextField}
                                error={Boolean(touched.childrenServedCount && errors.childrenServedCount)}
                                fullWidth
                                helperText={touched.childrenServedCount && errors.childrenServedCount}
                                label={t("common:common.# of children served by your organization", "# of children served by your organization")}
                                name="childrenServedCount"
                                type="text"
                                onChange={handleChange}
                                onBlur={handleBlur}
                                value={values.childrenServedCount}
                                sx={{
                                  "& fieldset": { borderRadius: "4px" },
                                }}
                                allowNegative={false}
                                decimalScale={0}
                                // Maximum 4 digits
                                isAllowed={(values) => {
                                  const { floatValue } = values;
                                  return floatValue === undefined || floatValue <= 9999;
                                }}
                                // Only allow digits
                                allowLeadingZeros={false}
                              />
                            </Box>
                          </Grid>
                        </>)
                      }

                      <Grid container item spacing={2} md={12} xs={12}>
                        <CardHeader
                          title={t("common:common.Access")}
                          sx={{ pb: "0px" }}
                        />
                      </Grid>

                      <Grid item spacing={2} md={12} xs={12}>
                        <Box sx={{ display: "flex", flex: 1 }}>
                          <CustomSwitch
                            size="small"
                            color="orange"
                            disabled={
                              ![SUPER_ADMIN].includes(signedinUserRoleHT) || values.organization_type === "6"
                            }
                            id="fostershare_access"
                            checked={isFosterShareChecked}
                            onChange={() => changeFosterShareAccess()}
                          />
                          <Typography
                            variant="subtitle2"
                            inline
                            fontSize="1rem"
                          >
                            {t("common:common.FosterShare")}
                          </Typography>
                        </Box>
                      </Grid>

                      <Grid
                        item
                        spacing={2}
                        md={12}
                        xs={12}
                        style={{ paddingTop: "16px" }}
                      >
                        <Box sx={{ display: "flex", flex: 1 }}>
                          <CustomSwitch
                            size="small"
                            color="orange"
                            disabled={
                              ![SUPER_ADMIN].includes(signedinUserRoleHT)
                            }
                            id="thrivescale_access"
                            checked={isThriveScaleChecked}
                            onChange={() => {changeThriveScaleAccess(); 
                              setFieldValue("selectedItems", []);
                              setFieldValue("organization_type", "")}}
                          />
                          <Typography
                            variant="subtitle2"
                            inline
                            fontSize="1rem"
                          >
                            {t("common:common.Thrive Scale")}
                          </Typography>
                        </Box>
                      </Grid>

                      {isThriveScaleChecked && (
                        <Grid container item spacing={2} xs={12} sx={{ ml: 4 }}>
                          <Grid item md={6} xs={12} sx={{ mt: -2 }}>
                            <Field
                              error={Boolean(
                                touched.organization_type &&
                                  errors.organization_type
                              )}
                              fullWidth
                              helperText={
                                touched.organization_type &&
                                errors.organization_type
                              }
                              name="organization_type"
                              accessKey="name"
                              disabled={
                                ![SUPER_ADMIN].includes(signedinUserRoleHT)
                              }
                              onOrgTypeChange={(value) => {
                                setFieldValue("selectedItems", []);
                                value == 6 && setIsFosterShareChecked(false);
                              }}
                              component={AutoCompleteDropdown}
                              required={isThriveScaleChecked ? true : false}
                              id="account_type"
                              label="organization_type"
                              options={typeList.filter(item => {
                                // When organization is not valid, exclude only id 1
                                if (!organization) return item.id != 1;

                                // When organization type is 6, include only id 6
                                if (initialValues?.organization_type == 6) return item.id == 6;

                                // Default case: exclude ids 1 and 6
                                return item.id != 1 && item.id != 6;
                              })}
                              textFieldProps={{
                                fullWidth: true,
                                margin: "normal",
                                variant: "outlined",
                                label: t("common:common.Type"),
                              }}
                              sx={{
                                "& fieldset": { borderRadius: "4px" },
                              }}
                            />
                          </Grid>
                          <Grid item md={12} xs={12} sx={{ mt: -2 }}>
                              <Typography
                                color="primary"
                                variant="subtitle2"
                                sx={{ cursor: "pointer" , display: "inline-block"  }}
                                onClick={() => {
                                  ModalService.open(
                                    () => (
                                      <AccountTypesTable
                                        typeList={accountTypesList}
                                      />
                                    ),
                                    {
                                      modalTitle: t(
                                        "common:common.ThriveScale account types"
                                      ),
                                      modalDescription: t(
                                        "common:common.Please select an Organization type that best describes the organization"
                                      ),
                                      cancelButtonText: t("common:common.Close"),
                                      hideActionButton: true,
                                      width: "40%",
                                      hideBackdrop: false,
                                    }
                                  );
                                }}
                                fontWeight={500}
                              >
                                {t(
                                  "common:common.What organization type do I select"
                                )}
                              </Typography>
                          </Grid>
                          {values.organization_type === "6" && (
                            <>
                            <Grid item md={6} xs={12} sx={{ mt: -2 }}>
                              <Field
                                error={Boolean(touched.parentOrgPermission && errors.parentOrgPermission)}
                                fullWidth
                                helperText={touched.parentOrgPermission && errors.parentOrgPermission}
                                name="parentOrgPermission"
                                accessKey="value"
                                disabled={
                                  ![SUPER_ADMIN].includes(signedinUserRoleHT)
                                }
                                component={AutoCompleteDropdown}
                                required={true}
                                id="parentOrgPermission"
                                label="parentOrgPermission"
                                options={ParentOrganizationPermissionList}
                                textFieldProps={{
                                  fullWidth: true,
                                  margin: "normal",
                                  variant: "outlined",
                                  label: t("common:common.Parent organization permission"),
                                }}
                                sx={{
                                  "& fieldset": { borderRadius: "4px" },
                                }}
                              />
                            </Grid>
                            <Grid item md={12} xs={12} sx={{ mt: 2 }}>
                              <Typography
                                sx={{
                                  color: "var(--Midnight-Midnight, #1D334B)",
                                  fontSize: "18px",
                                  fontStyle: "normal",
                                  fontWeight: 700,
                                  lineHeight: "125%",
                                }}>
                                {t("common:account.Organizations to include")}
                              </Typography>
                              <Typography
                                sx={{
                                  color: "var(--Midnight-Midnight, #1D334B)",
                                  lineHeight: "125%",
                                  fontWeight: 500,
                                  fontSize: "14px",
                                  my:1
                                }}>
                                {t("common:account.These organization should be subidiaries or children of the parent organization, as the parent organization will be able to see all the data for the selected organizations")}
                              </Typography>
                              <Box
                                sx={{
                                  minWidth: { xs: '100%', md: '100%' },
                                  width: { xs: '100%', md: 'auto' },
                                  height:"196px",
                                  border: '1px solid #e0e0e0',
                                  p: 2,
                                  display: 'inline-block',
                                  overflowY: 'auto',
                                  overflowX: 'auto',
                                }}
                              >
                                  <FormControl disabled={
                                    ![SUPER_ADMIN].includes(signedinUserRoleHT)
                                    } component="fieldset" variant="standard">
                                    <FormGroup >
                                      <Grid container direction="column" >

                                        {!values.country ? (
                                          <Typography align="center" variant='h6'>
                                            {t("common:Select country to continue")}
                                          </Typography>
                                        ) : (
                                          <>
                                            {organizationList?.filter(
                                              (org) =>
                                                org?.permissions === "SELF_ORGANIZATION_LEVEL" &&
                                                ["THRIVE_SCALE", "BOTH"].includes(org?.accessType) &&
                                                org.MPCountryId == values.country &&
                                                org.isActive 
                                            ).length === 0 ? (
                                              <Typography sx={{ color: "text.secondary", my: 2 }}>
                                                {t("common:account.No accounts to select")}
                                              </Typography>
                                            ) : (
                                              organizationList
                                                ?.filter(
                                                  (org) =>
                                                    org?.permissions === "SELF_ORGANIZATION_LEVEL" &&
                                                    ["THRIVE_SCALE", "BOTH"].includes(org?.accessType) &&
                                                    org.MPCountryId == values.country &&
                                                    org.isActive
                                                )
                                                .map((item) => (
                                                  <Grid item xs={12} key={item.id}>
                                                    <FormControlLabel
                                                      control={
                                                        <Checkbox
                                                          checked={values?.selectedItems?.includes(item.id)}
                                                          onChange={() => {
                                                            const current = values.selectedItems;
                                                            const updated = current.includes(item.id)
                                                              ? current.filter((id) => id !== item.id)
                                                              : [...current, item.id];
                                                            setFieldValue("selectedItems", updated);
                                                          }}
                                                          border="primary"
                                                        />
                                                      }
                                                      label={
                                                        <span
                                                          style={{
                                                            color: "var(--Midnight-Midnight-Shade-1, #0C1825)",
                                                            fontSize: "16px",
                                                            fontStyle: "normal",
                                                            fontWeight: 400,
                                                          }}
                                                        >
                                                          {item.accountName}
                                                        </span>
                                                      }
                                                    />
                                                  </Grid>
                                                ))
                                            )}
                                          </>
                                        )}
                                    </Grid>
                                  </FormGroup>
                                
                                </FormControl>
                              </Box>
                              {touched.selectedItems && errors.selectedItems && (
                                <Typography color="error" variant="body2" sx={{ mt: 1 }}>
                                  {errors.selectedItems}
                                </Typography>
                              )}
                               <Typography
                                sx={{
                                  color: "var(--Midnight-Midnight, #1D334B)",
                                  lineHeight: "125%",
                                  fontWeight: 500,
                                  fontSize: "14px",
                                  my:1
                                }}>
                                {values?.selectedItems?.length} organizations selected
                              </Typography>
                            </Grid>
                            </>
                          )}
                          {values.organization_type !== "6" &&
                           isEditMode &&
                           ![SUPER_ADMIN].includes(signedinUserRoleHT) && (
                            <Grid item md={12} xs={12}>
                            <Box sx={{ display: "flex", flex: 1 }}>
                              <CustomSwitch
                                size="small"
                                color="orange"
                                disabled={
                                  ![
                                    ADMIN_CASEWORKER,
                                    ADMIN,
                                  ].includes(signedinUserRoleHT) 
                                  || props.organization?.consentRequired === true
                                }
                                checked={consentChecked}
                                id="consent_toggle_button"
                                onChange={() =>
                                  setConsentChecked(!consentChecked)
                                }
                              />
                              <Typography
                                color="textPrimary"
                                gutterBottom
                                variant="subtitle2"
                                inline
                                id="consent_value_text"
                              >
                                {t("common:common.Consent enabled")}
                              </Typography>
                            </Box>
                            <Box>
                              <Typography
                                color="#778791"
                                variant="subtitle2"
                                sx={{ ml: 5, mt: -1, fontSize: "12px" }}
                                inline
                              >
                                {t(
                                  "common:common.When a family is added to Thrive Scale, a signed consent form will be required"
                                )}
                              </Typography>
                            </Box>
                          </Grid>)}
                        </Grid>
                      )}
                      <Grid />
                      
                      {values.country && values.organization_type && values.organization_type != "6" &&
                      <>
                        <Grid container item spacing={2} md={12} xs={12}>
                          <CardHeader
                            title="Defaults"
                            sx={{ pb: "0px" }}
                          />
                        </Grid>

                        <Grid item md={6} xs={12} sx={{ mt: -2 }}>
                          {loadingActiveForms ? (
                            <Box sx={{ display: 'flex', alignItems: 'center', minHeight: 56 }}>
                              <CircularProgress size={24} />
                              <Typography sx={{ ml: 2 }}>Loading forms...</Typography>
                            </Box>
                          ) : (
                            <Field
                              key={values.defaultLanguage || 'no-defaultLanguage'}
                              error={Boolean(touched.defaultLanguage && errors.defaultLanguage)}
                              fullWidth
                              helperText={touched.defaultLanguage && errors.defaultLanguage}
                              name="defaultLanguage"
                              accessKey="name"
                              component={AutoCompleteDropdown}
                              required={(values.organization_type && values.organization_type != "6") ? true : false}
                              id="defaultLanguage"
                              label="defaultLanguage"
                              options={activeForms}
                              value={values.country ? values.defaultLanguage : null}
                              textFieldProps={{
                                fullWidth: true,
                                margin: "normal",
                                variant: "outlined",
                                label: "Default assessment language",
                              }}
                              disabled={!values.country || !values.organization_type || values.organization_type === "6"}
                              sx={{
                                "& fieldset": { borderRadius: "4px" },
                              }}
                            />
                          )}
                          <Typography
                            sx={{
                              color: "#778791",
                              fontSize: "14px",
                              fontFamily: "Mulish",
                              fontWeight: 500,
                              lineHeight: "17.5px",
                              wordWrap: "break-word",
                              // mt: 1
                            }}
                          >
                            All assessments will appear in this language
                          </Typography>
                        </Grid>
                      </>}
                    </Grid>
                    <Box
                      sx={{
                        mt: 2,
                        display: "flex",
                        justifyContent: "flex-end",
                      }}
                    >
                      <Button
                        color="primary"
                        id="cancel_button"
                        sx={{ height: 46, borderRadius: "4px" }}
                        disabled={isSubmitting}
                        onClick={() => {
                          handleCloseFormsWarning(t, dirty, navigate);
                        }}
                        variant="text"
                      >
                        {t("common:common.Cancel")}
                      </Button>
                      
                      {organization ? (
                        <Button
                          color="primary"
                          id="save_button"
                          sx={{
                            //width: 97,
                            height: 44,
                            ml: 2,
                            borderRadius: "4px",
                          }}
                          variant="contained"
                          type="submit"
                          disabled={isSubmitting}
                        >
                          {t("common:organization.Update Organization")}
                        </Button>
                      ) : (
                        <Button
                          color="primary"
                          id="add_user_button"
                          sx={{
                            height: 46,
                            ml: 2,
                            borderRadius: "4px",
                          }}
                          variant="outlined"
                          disabled={isSubmitting}
                          onClick={() => {
                            setGotoAddUserPage(true);
                            handleSubmit();
                          }}
                        >
                          {t("common:account.Next Add team member")}
                        </Button>
                      )}
                      {!organization && (
                        <Button
                          color="primary"
                          id="save_account_button"
                          disabled={isSubmitting}
                          sx={{
                            //width: 170,
                            height: 46,
                            ml: 2,
                            borderRadius: "4px",
                          }}
                          variant="contained"
                          onClick={handleSubmit}
                        >
                          {t("common:organization.Save Organization")}
                        </Button>
                      )}
                    </Box>
                  </Box>
                </Card>
              </Grid>
            </Grid>
          </form>
        );
      }}
    </Formik>
  );
};

AccountForm.propTypes = {
  organization: PropTypes.object.isRequired,
};

export default AccountForm;
