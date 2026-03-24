import {
  Autocomplete,
  Box,
  Button,
  FormControlLabel,
  Grid,
  Switch,
  TextField,
  Typography,
} from "@mui/material";
import { useFormik } from "formik";
import React, { useContext, useEffect, useRef, useState } from "react";

import * as Yup from "yup";
import { CommonDataContext } from "../../../../common/contexts/CommonDataContext";
import NumberFormat from "react-number-format";
import APIS from "../../../../common/hooks/UseApiCalls";
import toast from "react-hot-toast";
import { useNavigate } from "react-router";
import { ModalService } from "../../../../components/Modal";
import DeactivateFamilyModal from "./DeactivateFamilyModal";
import ArrowRightIcon from "@mui/icons-material/ArrowRight";
import {
  getStateList,
} from "../../../../helpers/helperFunction";
import Loader from "../../../../components/UserComponents/Loader";
import dayjs from "dayjs";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";

const HouseholdAndAgencyDetailForm = ({
  setIsCareGiverInfo,
  setHouseholdAndAgencyInfo,
  householdAndAgencyInfo,
  setIsFamilyActive,
  isFamilyActive,
}) => {
  const [isLoading, setIsLoading] = useState();
  const { userRegion, signedinUserRoleFS, locationList, roleListFS } =
    useContext(CommonDataContext);
  const navigate = useNavigate();

  const validationSchema = Yup.object().shape({
    firstName: Yup.string()
      .max(255,"First name cannot exceed 255 characters")
      .required("First name is required")
      .nullable(),
    lastName: Yup.string()
      .max(255,"Last name cannot exceed 255 characters")
      .required("Last name is required")
      .nullable(),
    address: Yup.string()
      .max(255,"Street address cannot exceed 255 characters")
      .required("Street address is required")
      .nullable(),
    zipCode: Yup.string()
      .max(255)
      .required("ZIP code is required")
      .test(
        "zip-format-validation",
        "Please enter a valid ZIP code",
        (value) => {
          if (userRegion.toLowerCase() === "india") {
            return /^\d{6}$/.test(value);
          } else {
            return /^\d{5}$/.test(value);
          }
        }
      )
      .nullable(),
    city: Yup.string().max(255).required("City is required").nullable(),
    primaryLanguage: Yup.string()
      .required("A primary language is required")
      .nullable(),
    stateId: Yup.object().required("State is required").nullable(),
    DateStartedasFP: Yup.string()
      .required("Start date is required")
      .matches(
        /^(0[1-9]|1[0-2])\/\d{4}$/, // Regex to validate MM/YYYY format
        "Invalid start date format (MM/YYYY)"
      )
      .test({
        name: "not-in-future",
        message: "Date cannot be in the future",
        test: function (DateStartedasFP) {
          if (!DateStartedasFP) return true;

          const [entryMonth, entryYear] =
            DateStartedasFP.split("/").map(Number);
          const now = dayjs();

          const currentMonth = now.month() + 1; // 0-based
          const currentYear = now.year();

          return (
            entryYear < currentYear ||
            (entryYear === currentYear && entryMonth <= currentMonth)
          );
        },
      })
      .nullable(),
    licenceNumber: Yup.string()
      // .required(t("common:warnings.License Number is required"))
      .nullable(),
    casemanagerId: Yup.object()
      .required("A case manager must be assigned")
      .nullable(),
  });

  const initialValues = {
    firstName: "",
    lastName: "",
    casemanagerId: null,
    zipCode: "",
    city: "",
    stateId: null,
    primaryLanguage: null,
    licenceNumber: "",
    address: "",
    DateStartedasFP: null,
  };

  const formRef = useRef(null);

  const formik = useFormik({
    validationSchema: validationSchema,
    initialValues: initialValues,
    onSubmit: (values) => handleSubmitHandler(values),
    innerRef: formRef,
  });
  const {
    touched,
    errors,
    handleBlur,
    handleChange,
    values,
    handleSubmit,
    setFieldValue,
    isSubmitting,
  } = formik;

  useEffect(() => {
    if (householdAndAgencyInfo && locationList.length) {
      setFieldValue("firstName", householdAndAgencyInfo?.firstName);
      setFieldValue("lastName", householdAndAgencyInfo?.lastName);
      setFieldValue("casemanagerId", householdAndAgencyInfo?.casemanagerId);
      setFieldValue("zipCode", householdAndAgencyInfo?.zipCode);
      setFieldValue("city", householdAndAgencyInfo?.city);
      setFieldValue(
        "stateId",
        getStateList(locationList, localStorage.getItem("userRegion"))?.find(
          (obj) =>
            obj.id == householdAndAgencyInfo.stateId ||
            obj.id == householdAndAgencyInfo.stateId?.id
        )
      );
      setFieldValue(
        "primaryLanguage",
        householdAndAgencyInfo?.primaryLanguage === "ENGLISH"
          ? "English"
          : "Spanish"
      );
      setFieldValue("licenceNumber", householdAndAgencyInfo?.licenceNumber);
      setFieldValue("DateStartedasFP", householdAndAgencyInfo?.DateStartedasFP);
      setFieldValue("address", householdAndAgencyInfo?.address);
    }
  }, [householdAndAgencyInfo, locationList]);

  const [statesList, setStatesList] = useState([]);
  useEffect(() => {
    if (locationList.length)
      setStatesList(
        getStateList(locationList, localStorage.getItem("userRegion")) || []
      );
  }, [locationList]);

  const [caseWorkerOptions, setCaseWorkerOptions] = useState([]);

  useEffect(() => {
    const getCaseWorkerList = async () => {
      setIsLoading(true);
      if (roleListFS.length)
        try {
          const res = await APIS.ListUsers({
            pageNumber: 1,
            rowCount: 1000,
            FSUserRoleId: [
              roleListFS.find((role) => role.cognitoValue === "casemanager")
                ?.id,
              roleListFS.find(
                (role) => role.cognitoValue === "admin+casemanager"
              )?.id,
            ],
            accountId: [localStorage.getItem("orgId")],
            allCasemanagerList: true,
          });

          if (res.status === 200) {
            const updatedUsers = res.data.data
              .filter(
                (obj) =>
                  obj.accessType === "FOSTER_SHARE" || obj.accessType === "BOTH"
              )
              ?.map((obj) => ({
                id: obj.id,
                firstName: obj.firstName,
                lastName: obj.lastName,
                HTCountryId: obj?.HTCountryId,
              }));
            setCaseWorkerOptions(updatedUsers);
            if(signedinUserRoleFS === "casemanager"){
                setFieldValue("casemanagerId", updatedUsers.find(user => user.id === localStorage.getItem("username")) || null)
              }
          }
          setIsLoading(false);
        } catch (error) {
          setIsLoading(false);
        }
    };
    getCaseWorkerList();
  }, [roleListFS]);

  const handleSubmitHandler = (data) => {
    householdAndAgencyInfo?.id
      ? updateFamilyHandler(data)
      : createFamilyHandler(data);
  };

  // useEffect(() => {
  //   if (!formik.isValid && formik.submitCount !== 0 && formik.isSubmitting) {
  //     const firstErrorKey = getFirstErrorKey(formik.errors);
  //     if (global.window.document.getElementsByName(firstErrorKey).length) {
  //       global.window.document.getElementsByName(firstErrorKey)[0].focus();
  //     }
  //   }
  // }, [formik.submitCount, formik.isValid, formik.errors, formik.isSubmitting]);

  useEffect(() => {
    const el = document.querySelector(".Mui-error, [data-error]");
    (el?.parentElement ?? el)?.scrollIntoView();
    (el?.parentElement ?? el)?.focus();
  }, [isSubmitting]);

  const createFamilyHandler = async (data) => {
    setIsLoading(true);

    let params = {
      ...data,
      countryId: localStorage.getItem("userRegion"),
    };

    params.stateId = params.stateId.id;
    params.casemanagerId = params.casemanagerId.id;
    params.primaryLanguage =
      params?.primaryLanguage === "English" ? "ENGLISH" : "SPANISH";

    try {
      const res = await APIS.createFsFamily(params);
      if (res.status === 200) {
        // toast.success(res.data.message);
        setHouseholdAndAgencyInfo({ id: res.data.data.id, ...values });
        setIsCareGiverInfo(true);
      }
      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
    }
  };

  const updateFamilyHandler = async (data) => {
    setIsLoading(true);

    let params = {
      ...data,
      id: householdAndAgencyInfo?.id,
    };
    params.primaryLanguage =
      params?.primaryLanguage === "English" ? "ENGLISH" : "SPANISH";
    params.stateId = params.stateId.id;
    params.casemanagerId = params.casemanagerId.id;

    try {
      const res = await APIS.upateFsFamily(params);
      if (res.status === 200) {
        toast.success(res.data.message);
        setHouseholdAndAgencyInfo({ id: res.data.data.id, ...values });
        setIsCareGiverInfo(true);
      }
      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
    }
  };

  const deactivateFamilyHandler = async (
    deactivateReason = null,
    customDeactivateReason = null,
    mode = true
  ) => {
    let params = {
      id: householdAndAgencyInfo?.id,
      activationStatus: mode,
      disableReason:
        deactivateReason?.value == "Other"
          ? customDeactivateReason
          : deactivateReason?.value || "",
    };
    try {
      setIsLoading(true);
      const res = await APIS.updateFamilyStatus(params);
      if (res.status === 200) {
        setIsLoading(false);
        toast.success(res.data.message);
        return;
      }
      if (res?.response?.status === 409) {
        setIsFamilyActive(true);
        setIsLoading(false);
        ModalService.open(({ close }) => <></>, {
          modalTitle: "Deactivate family",
          width: "50%",
          modalDescription:
            "This family has children linked to them in the system. Before they can be deactivated, all children must be reassigned.",
          // hideModalFooter: true,
          cancelButtonText: "Ok",
          hideActionButton: true,
        });
      }
    } catch (error) {
      setIsLoading(false);
    }
  };

  const handleFamilyStatusChange = () => {
    setIsFamilyActive((prev) => !prev);

    // Get the updated state
    const newState = !isFamilyActive;

    if (!newState) {
      ModalService.open(
        ({ close }) => (
          <DeactivateFamilyModal
            // onSuccess={gridRef?.current?.getDataLoader()}
            close={close}
            deactivateFamilyHandler={deactivateFamilyHandler}
            setIsFamilyActive={setIsFamilyActive}
          />
        ),
        {
          modalTitle: "Deactivate family",
          width: "50%",
          modalDescription:
            "Once deactivated, this family will no longer have access to FosterShare.",
          hideModalFooter: true,
        }
      );
    } else {
      deactivateFamilyHandler(null, true);
    }
  };

  const cancelClickHandler = () => {
    ModalService.open(() => <></>, {
      modalTitle: "Unsaved Changes",
      width: "30%",
      modalDescription:
        "If you leave this page, any changes you have made will be lost",
      actionButtonText: "Leave page",
      onClick: () => navigate(-1),
    });
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Loader loading={isLoading} />

      {householdAndAgencyInfo?.id && (
        <Grid item xs={12}>
          <Typography
            id="household-status"
            color="textPrimary"
            fontSize={"1rem"}
            fontWeight={600}
          >
            Household status
          </Typography>

          <FormControlLabel
            control={
              <Switch
                checked={isFamilyActive}
                onChange={handleFamilyStatusChange}
              />
            }
            label={isFamilyActive ? "Active" : "Inactive"}
          />
        </Grid>
      )}
      <Grid item xs={12}>
        <Typography
          id="parent-info"
          color="textPrimary"
          // variant="subtitle2"
          fontSize={"1rem"}
          fontWeight={600}
        >
          Household information
        </Typography>
      </Grid>
      {!householdAndAgencyInfo?.id && (
        <>
          <Grid item xs={12} md={6}>
            <TextField
              id="first-name"
              error={Boolean(touched.firstName && errors.firstName)}
              fullWidth
              helperText={touched.firstName && errors.firstName}
              label="Primary Caregiver’s First Name"
              name="firstName"
              onBlur={handleBlur}
              onChange={handleChange}
              required
              value={values.firstName}
              variant="outlined"
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              id="last-name"
              error={Boolean(touched.lastName && errors.lastName)}
              fullWidth
              helperText={touched.lastName && errors.lastName}
              label="Primary Caregiver’s Last Name"
              name="lastName"
              onBlur={handleBlur}
              onChange={handleChange}
              required
              value={values.lastName}
              variant="outlined"
            />
          </Grid>
        </>
      )}
      <Grid item xs={12}>
        <TextField
          id="street-address"
          error={Boolean(touched?.address && errors?.address)}
          fullWidth
          helperText={touched?.address && errors?.address}
          label="Street address"
          name="address"
          onBlur={handleBlur}
          onChange={handleChange}
          required
          value={values?.address}
          variant="outlined"
        />
      </Grid>
      <Grid item xs={12} md={6}>
        <TextField
          id="city"
          error={Boolean(touched?.city && errors?.city)}
          fullWidth
          helperText={touched?.city && errors?.city}
          label="City"
          name="city"
          onBlur={handleBlur}
          onChange={handleChange}
          required
          value={values?.city}
          variant="outlined"
        />
      </Grid>
      <Grid item xs={12} md={6} my={0}>
        <Autocomplete
          id="state"
          name="stateId"
          value={values?.stateId}
          options={statesList}
          sx={{ width: 1 }}
          isOptionEqualToValue={(option, value) => {
            return Object.is(JSON.stringify(option), JSON.stringify(value));
          }}
          getOptionLabel={(option) => option.stateName}
          onChange={(_, newValue) => setFieldValue("stateId", newValue)}
          renderInput={(params) => (
            <TextField
              {...params}
              label="State"
              required
              error={touched?.stateId && Boolean(errors?.stateId)}
              helperText={touched?.stateId && errors?.stateId}
            />
          )}
        />
      </Grid>
      <Grid item xs={12} spacing={2} container>
        <Grid item xs={12} md={6}>
          <NumberFormat
            customInput={TextField}
            error={Boolean(touched?.zipCode && errors?.zipCode)}
            fullWidth
            helperText={touched?.zipCode && errors?.zipCode}
            //label={t('common:common.Phone Number')}
            placeholder={
              userRegion.toLowerCase() === "india" ? "888888" : "88888"
            }
            label="Zip code/Postal code"
            name="zipCode"
            format={userRegion.toLowerCase() === "india" ? "######" : "#####"}
            //prefix={'+'}
            type="text"
            required
            onBlur={handleBlur}
            onChange={(e) => {
              let zipCode = e.target.value.trim();
              setFieldValue("zipCode", zipCode);
            }}
            value={values?.zipCode}
            sx={{
              "& fieldset": { borderRadius: 0 },
            }}
          />
        </Grid>
      </Grid>

      <Grid item xs={12} md={6}>
        <Autocomplete
          id="state"
          name="primaryLanguage"
          value={values?.primaryLanguage}
          options={["Spanish", "English"]}
          sx={{ width: 1 }}
          isOptionEqualToValue={(option, value) => {
            return Object.is(JSON.stringify(option), JSON.stringify(value));
          }}
          // getOptionLabel={(option) => option.stateName}
          onChange={(_, newValue) => setFieldValue("primaryLanguage", newValue)}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Primary language"
              required
              error={
                touched?.primaryLanguage && Boolean(errors?.primaryLanguage)
              }
              helperText={touched?.primaryLanguage && errors?.primaryLanguage}
            />
          )}
        />
        {/* <TextField
          name="primaryLanguage"
          id="primary-language"
          error={Boolean(touched?.primaryLanguage && errors?.primaryLanguage)}
          fullWidth
          helperText={touched?.primaryLanguage && errors?.primaryLanguage}
          required
          variant="outlined"
          label={t("common:Primary Language")}
          select={true}
          value={values?.primaryLanguage}
          onChange={handleChange}
        >
          <MenuItem key="ENGLISH" value="ENGLISH">
            English
          </MenuItem>
          <MenuItem key="SPANISH" value="SPANISH">
            Spanish
          </MenuItem>
        </TextField> */}
      </Grid>

      <Grid item xs={12} md={6}>
        <TextField
          id="license-number"
          error={Boolean(touched?.licenceNumber && errors?.licenceNumber)}
          // required
          fullWidth
          helperText={touched?.licenceNumber && errors?.licenceNumber}
          label="License number"
          name="licenceNumber"
          onBlur={handleBlur}
          onChange={handleChange}
          value={values?.licenceNumber}
          variant="outlined"
        />
      </Grid>
      <Grid item xs={12}>
        <DatePicker
          id="DateStartedasFP"
          label="When did this family first start serving as a foster family for your organization or any other organization?"
          disabled={!!householdAndAgencyInfo?.DateStartedasFP}
          value={
            values.DateStartedasFP
              ? dayjs(values.DateStartedasFP, "MM/YYYY").isValid()
                ? dayjs(values.DateStartedasFP, "MM/YYYY")
                : undefined
              : undefined
          }
          onChange={(newValue) => {
            setFieldValue(
              "DateStartedasFP",
              newValue ? dayjs(newValue).format("MM/YYYY") : ""
            );
          }}
          slotProps={{
            textField: {
              required: true,
              error:
                touched?.DateStartedasFP && Boolean(errors?.DateStartedasFP),
              helperText: (
                <>{touched?.DateStartedasFP && errors?.DateStartedasFP}</>
              ),
            },
          }}
          views={["year", "month"]} // Restricts selection to month and year only
          format="MM/YYYY" // Displays the selected value in MM/YYYY format
          maxDate={dayjs()} // Limits selection to today or earlier
          sx={{ width: 1 }}
        />
      </Grid>

      <Grid item xs={12}>
        <Typography
          id="parent-info"
          color="textPrimary"
          variant="subtitle2"
          fontSize={"1rem"}
          fontWeight={600}
        >
          Agency details
        </Typography>
      </Grid>

      <Grid item xs={12} md={6} my={0}>
        <Autocomplete
          id="caseManager"
          name="casemanagerId"
          value={values?.casemanagerId}
          options={caseWorkerOptions}
          sx={{ width: 1 }}
          isOptionEqualToValue={(option, value) => {
            return Object.is(JSON.stringify(option), JSON.stringify(value));
          }}
          getOptionLabel={(option) => `${option.firstName} ${option.lastName}`}
          onChange={(_, newValue) => setFieldValue("casemanagerId", newValue)}
          disabled={signedinUserRoleFS === "casemanager"}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Case manager"
              required
              error={touched?.casemanagerId && Boolean(errors?.casemanagerId)}
              helperText={touched?.casemanagerId && errors?.casemanagerId}
            />
          )}
        />
      </Grid>

      <Grid item xs={12}>
        <Box
          mt={2}
          sx={{
            display: "flex",
            justifyContent: "end",
            gap: 2,
          }}
        >
          <Button
            sx={{ borderRadius: "4px" }}
            variant="outlined"
            onClick={cancelClickHandler}
          >
            Cancel
          </Button>
          <Button
            sx={{ borderRadius: "4px" }}
            variant="contained"
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            <Box display="flex">
              <Box>Next</Box>
              <ArrowRightIcon />
            </Box>
          </Button>
        </Box>
      </Grid>
    </LocalizationProvider>
  );
};

export default HouseholdAndAgencyDetailForm;
