import {
  Autocomplete,
  Box,
  Button,
  Divider,
  Grid,
  TextField,
  Typography,
} from "@mui/material";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import dayjs from "dayjs";
import { useFormik } from "formik";
import * as Yup from "yup";

import React, { useContext, useEffect, useState } from "react";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { useNavigate } from "react-router";
import {
  DateFormatFromRegion,
  GenderList,
  convertUnderscoreToText,
} from "../../../../constants";
import toast from "react-hot-toast";
import APIS from "../../../../common/hooks/UseApiCalls";
import { CommonDataContext } from "../../../../common/contexts/CommonDataContext";
import { ModalService } from "../../../../components/Modal";
import ChildDischargeReasonsModal from "./ChildDischargeReasonsModal";
import Loader from "../../../../components/UserComponents/Loader";
import useAuthorization from "../../../../components/UserComponents/useAuthorization";

const dischargedFamily = {
  id: -1,
  firstName: "Discharged",
  lastName: "",
};

const ChildDetailForm = ({ close, childData, onSuccess, openForEdit }) => {
  const { fsChildPlacementList, roleListFS, signedinUserRoleFS } =
    useContext(CommonDataContext);
  const [isLoading, setIsLoading] = useState();
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (openForEdit) {
      setIsEditing(true);
    }
  }, [openForEdit]);

  useAuthorization(null, signedinUserRoleFS, null, "FSChild", false);

  const validationSchema = Yup.object().shape({
    firstName: Yup.string().max(255).required("First name is required"),
    lastName: Yup.string().max(255).required("Last name is required"),
    dateOfBirth: Yup.date()
      .required("Date of birth is required")
      .typeError("Date of birth is required")
      .nullable(),
    fosterCareStartDate: Yup.date()
      .required("Please enter the date when the child entered the agency")
      .typeError("Date format is invalid")
      .nullable()
      .when("dateOfBirth", (dateOfBirth, schema) => {
        return schema.test({
          name: "is-date-after-dob",
          exclusive: true,
          message:
            "Date child entered agency cannot be before child's date of birth",
          test: function (fosterCareStartDate) {
            // If either dateOfBirth or fosterCareStartDate is null, return true
            if (
              !dateOfBirth ||
              !dayjs(dateOfBirth).isValid() ||
              !fosterCareStartDate
            ) {
              return true;
            }

            // Compare the dates
            return fosterCareStartDate >= dateOfBirth;
          },
        });
      }),

    gender: Yup.string().required("Gender is required").nullable(),
    placementStatus: Yup.object()
      .required("The child's placement status is required")
      .nullable(),
    childDischargedDate: Yup.date()
      .typeError("Date format is invalid")
      .when("placementStatus", {
        is: (val) =>
          val ===
          fsChildPlacementList.find((status) => status.key === "DISCHARGED"),
        then: (schema) =>
          schema.required(
            // (t("common:warnings.Discharged date is required")),
            "Discharged date is required"
          ),
        otherwise: (schema) => schema.nullable(),
      })
      .when("dateOfBirth", (dateOfBirth, schema) => {
        return schema.test({
          name: "is-date-after-dob",
          exclusive: true,
          message: "Discharge date must be after Date of birth",
          test: function (childDischargedDate) {
            // If either dateOfBirth or childDischargedDate is null, return true
            if (!dateOfBirth || !childDischargedDate) {
              return true;
            }

            // Compare the dates
            return childDischargedDate >= dateOfBirth;
          },
        });
      }),
    familyId: Yup.object().required("A family is required").nullable(),
    userId: Yup.object().required("A case manager must be assigned").nullable(),
    dateOfCWSEntry: Yup.string()
      .required("This field is required")
      .matches(
        /^(0[1-9]|1[0-2])\/\d{4}$/, // MM/YYYY format
        "Invalid start date format (MM/YYYY)"
      )
      .test({
        name: "not-in-future",
        message: "Date cannot be in the future",
        test: function (dateOfCWSEntry) {
          if (!dateOfCWSEntry) return true;

          const [entryMonth, entryYear] = dateOfCWSEntry.split("/").map(Number);
          const now = dayjs();

          const currentMonth = now.month() + 1; // 0-based
          const currentYear = now.year();

          return (
            entryYear < currentYear ||
            (entryYear === currentYear && entryMonth <= currentMonth)
          );
        },
      })

      .when("fosterCareStartDate", (fosterCareStartDate, schema) => {
        return schema.test({
          name: "is-date-before-foster-care-start",
          exclusive: true,
          message:
            "Child Welfare Entry date cannot be after the child entered agency date",
          test: function (dateOfCWSEntry) {
            if (isEditing && childData?.hadPrevCM) return true;
            console.log(fosterCareStartDate, dateOfCWSEntry);

            if (!fosterCareStartDate || !dateOfCWSEntry) return true;

            const fosterCareMonth = dayjs(fosterCareStartDate).month() + 1;
            const fosterCareYear = dayjs(fosterCareStartDate).year();
            const [entryMonth, entryYear] = dateOfCWSEntry
              .split("/")
              .map(Number);

            return (
              entryYear < fosterCareYear ||
              (entryYear === fosterCareYear && entryMonth <= fosterCareMonth)
            );
          },
        });
      })
      .when("dateOfBirth", (dateOfBirth, schema) => {
        return schema.test({
          name: "is-date-after-dob",
          exclusive: true,
          message:
            "Child Welfare Entry date cannot be before the child's date of birth",
          test: function (dateOfCWSEntry) {
            if (isEditing && childData?.hadPrevCM) return true;
            console.log(dateOfBirth, dateOfCWSEntry);
            if (!dateOfBirth || !dateOfCWSEntry) return true;

            const dobMonth = dayjs(dateOfBirth).month() + 1;
            const dobYear = dayjs(dateOfBirth).year();
            const [entryMonth, entryYear] = dateOfCWSEntry
              .split("/")
              .map(Number);

            return (
              entryYear > dobYear ||
              (entryYear === dobYear && entryMonth >= dobMonth)
            );
          },
        });
      })
      .nullable(),
    hadPrevCM: Yup.string().required("This field is required").nullable(),
    hasPrevPlacements: Yup.string()
      .required("This field is required")
      .nullable(),
    numberOfPrevPlacements: Yup.number()
      .when("hasPrevPlacements", {
        is: "YES",
        then: (schema) =>
          schema
            .required("This field is required")
            .min(
              1,
              "Number of previous placements must be greater than or equal to 1"
            )
            .max(
              500,
              "Number of previous placements must be less than or equal to 500"
            ),
        otherwise: (schema) => schema.notRequired(),
      })
      .nullable(),
    ethnicity: Yup.string().required("Ethnicity is required").nullable(),
  });

  const initialValues = {
    firstName: childData?.firstName || "",
    lastName: childData?.lastName || "",
    dateOfBirth: childData?.dateOfBirth || null,
    fosterCareStartDate: childData?.fosterCareStartDate || null,
    gender: childData?.gender,
    medicaidNumber: childData?.medicaidNumber || null,
    level: childData?.level || "BASIC",
    allergy: childData?.allergy || null,
    placementStatus: null,
    familyId: null,
    userId: childData?.caseManager || null,
    placementId: childData?.placementId || null,
    notes: childData?.notes || null,
    childDischargeReason: null,
    otherReason: null,
    childDischargedDate: childData?.childDischargedDate || null,
    dateOfCWSEntry: childData?.dateOfCWSEntry || null,
    hasPrevPlacements: childData?.hasPrevPlacements || null,
    hadPrevCM: childData?.hadPrevCM || null,
    numberOfPrevPlacements: childData?.numberOfPrevPlacements || null,
    ethnicity: childData?.ethnicity || null,
  };

  const {
    touched,
    errors,
    handleBlur,
    handleChange,
    values,
    handleSubmit,
    setFieldValue,
    validateField,
    setFieldTouched,
    isSubmitting,
    setSubmitting,
  } = useFormik({
    validationSchema: validationSchema,
    initialValues: initialValues,
    onSubmit: (values) => handleSubmitHandler(values),
  });

  // useEffect(() => {
  //   if (!isValid && submitCount !== 0 && isSubmitting) {
  //     const firstErrorKey = getFirstErrorKey(errors);
  //     if (global.window.document.getElementsByName(firstErrorKey).length) {
  //       global.window.document.getElementsByName(firstErrorKey)[0].focus();
  //     }
  //   }
  // }, [submitCount, isValid, errors, isSubmitting]);

  useEffect(() => {
    const el = document.querySelector(".Mui-error, [data-error]");
    (el?.parentElement ?? el)?.scrollIntoView();
    (el?.parentElement ?? el)?.focus();
  }, [isSubmitting]);

  useEffect(() => {
    if (
      values.placementStatus ===
      fsChildPlacementList.find((status) => status.key === "DISCHARGED")
    ) {
      setFieldValue("familyId", dischargedFamily);
    } else {
      if (values?.familyId === dischargedFamily)
        setFieldValue("familyId", null);
        setFieldValue("childDischargedDate", childData?.childDischargedDate || dayjs());
    }
  }, [values.placementStatus]);

  useEffect(() => {
    if (fsChildPlacementList.length && childData?.placementStatus) {
      setFieldValue(
        "placementStatus",
        fsChildPlacementList.find(
          (obj) => obj.key === childData?.placementStatus
        )
      );
    } else {
      setFieldValue(
        "placementStatus",
        fsChildPlacementList.find((obj) => obj.key === "IN_FOSTER_PLACEMENT")
      );
    }
  }, [fsChildPlacementList]);

  DateFormatFromRegion();

  const handleSubmitHandler = (data) => {
    if (
      (data.placementStatus ===
        fsChildPlacementList.find(
          (status) =>
            status.key === "DISCHARGED" &&
            data?.placementStatus.key !== childData?.placementStatus
        ) ||
        (childData?.familyId && data?.familyId?.id !== childData?.familyId) ||
        (childData?.placementStatus &&
          data?.placementStatus.key !== childData?.placementStatus)) &&
      !values.childDischargeReason
    ) {
      setSubmitting(false);
      ModalService.open(
        ({ close: closeModal }) => (
          <ChildDischargeReasonsModal
            onSuccess={(reasons, otherReason) => {
              setFieldValue("childDischargeReason", reasons);
              setFieldValue("otherReason", otherReason);
            }}
            close={closeModal}
          />
        ),
        {
          modalTitle: "Update",
          width: "30%",
          hideModalFooter: true,
          modalDescription:
            "What was the reason for this placement status update?",
        }
      );
      return;
    }

    childData ? updateChildHandler(data) : createChildHandler(data);
  };

  const createChildHandler = async (data) => {
    setIsLoading(true);
    let params = {
      firstName: data.firstName,
      lastName: data.lastName,
      allergy: data.allergy,
      dateOfBirth: data.dateOfBirth,
      fosterCareStartDate: data.fosterCareStartDate,
      gender: data.gender,
      level: data.level,
      medicaidNumber: data.medicaidNumber,
      notes: data.notes || null,
      // accountId: localStorage.getItem("orgId"),
      ethnicity: data.ethnicity,
      placementDetails: {
        placementStatus: data.placementStatus.key,
        familyId: data.familyId?.id === -1 ? null : data.familyId?.id,
        userId: data.userId?.id,
        placementId: data.placementId,
        childDischargeReason: data.childDischargeReason || [],
        childDischargedDate: data.childDischargedDate,
        otherReason: data.otherReason,
      },

      dateOfCWSEntry: data.dateOfCWSEntry,
      hasPrevPlacements: data.hasPrevPlacements,
      hadPrevCM: data.hadPrevCM,
      numberOfPrevPlacements:
        data.hasPrevPlacements === "YES" ? data.numberOfPrevPlacements : 0,
    };
    // if (!params.level) delete params["level"];
    // console.log(params);
    try {
      const res = await APIS.createFsChild(params);
      if (res?.status === 200) {
        toast.success(res.data.message);
        onSuccess();
        close();
      } else {
        toast.error(res.message);
      }
      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
      toast.error(error.message);
    }
  };
  const updateChildHandler = async (data) => {
    setIsLoading(true);

    let params = {
      id: childData.id,
      firstName: data.firstName,
      lastName: data.lastName,
      allergy: data.allergy,
      dateOfBirth: data.dateOfBirth,
      fosterCareStartDate: data.fosterCareStartDate,
      gender: data.gender,
      level: data.level,
      medicaidNumber: data.medicaidNumber,
      notes: data.notes || null,
      // accountId: localStorage.getItem("orgId"),
      ethnicity: data.ethnicity,
      placementDetails: {
        placementStatus: data.placementStatus.key,
        familyId: data.familyId?.id === -1 ? null : data.familyId?.id,
        userId: data.userId?.id,
        placementId: data.placementId,
        childDischargeReason: data.childDischargeReason || [],
        childDischargedDate: data.childDischargedDate,
        otherReason: data.otherReason,
      },
      dateOfCWSEntry: data.dateOfCWSEntry,
      hasPrevPlacements: data.hasPrevPlacements,
      hadPrevCM: data.hadPrevCM,
      numberOfPrevPlacements:
        data.hasPrevPlacements === "YES" ? data.numberOfPrevPlacements : 0,
    };
    // if (!params.level) delete params["level"];
    try {
      const res = await APIS.updateFsChild(params);
      if (res?.status === 200) {
        toast.success(res.data.message);
        onSuccess();
        close();
      } else {
        toast.error(res.message);
      }
      setIsLoading(false);
    } catch (error) {
      toast.error(error.message);
      setIsLoading(false);
    }
  };
  const [caseWorkerOptions, setCaseWorkerOptions] = useState([]);
  useEffect(() => {
    const getCaseWorkerList = async () => {
      try {
          const res = await APIS.ListUsers({
            rowCount: 1000,
            FSUserRoleId: [
              roleListFS.find((role) => role.cognitoValue === "casemanager").id,
              roleListFS.find(
                (role) => role.cognitoValue === "admin+casemanager",
              )?.id,
            ],
            accountId: [localStorage.getItem("orgId")],
            allCasemanagerList: true,
          });

          if (res.status === 200) {
            const updatedUsers = res.data.data
              .filter(
                (obj) =>
                  obj.accessType === "FOSTER_SHARE" ||
                  obj.accessType === "BOTH",
              )
              ?.map((obj) => ({
                id: obj.id,
                firstName: obj.firstName,
                lastName: obj.lastName,
              }));
            setCaseWorkerOptions(updatedUsers);
            if(signedinUserRoleFS === "casemanager"){
              setFieldValue("userId", updatedUsers.find(user => user.id === localStorage.getItem("username")) || null)
            }
          }
      } catch (error) {}
    };
    getCaseWorkerList();
  }, []);

  const [familyList, setFamilyList] = useState([]);
  useEffect(() => {
    const getFamilyList = async () => {
      try {
        const res = await APIS.getFsFamilyListForDropdown({
          pageNumber: 1,
          rowCount: 10000,
          orderByField: [["primaryParentName", "ASC"]],
        });

        if (res.status === 200) {
          const updatedUsers = res.data.data.map((obj) => ({
            id: obj.id,
            firstName: obj.parentFirstName,
            lastName: obj.parentLastName,
          }));
          setFamilyList(updatedUsers);
        }
      } catch (error) {}
    };
    getFamilyList();
  }, []);

  useEffect(() => {
    if (familyList.length && childData?.familyId) {
      let family = familyList.find((obj) => obj.id === childData?.familyId);
      setFieldValue("familyId", family);
    }
  }, [familyList]);

  const cancelClickHandler = () => {
    ModalService.open(() => <></>, {
      modalTitle: "Unsaved Changes",
      width: "30%",
      modalDescription:
        "If you leave this page, any changes you have made will be lost",
      actionButtonText: "Leave Page",
      onClick: () => close(),
    });
  };
  const [ethnicityOptions, setEthnicityOptions] = useState([]);

  useEffect(() => {
    const getEthnicityOptions = async () => {
      try {
        const res = await APIS.ethnicityList();

        if (res.status === 200) {
          const updatedEthnicities = res.data.data.map((obj) => ({
            value: obj.value,
            label: obj.label,
          }));
          setEthnicityOptions(updatedEthnicities);
        }
      } catch (error) {
        console.error("Error fetching ethnicity options:", error);
      }
    };

    getEthnicityOptions();
  }, []);

  return (
    <>
      <Loader loading={isLoading} />
      <Box my mx={-2}>
        <Box
          sx={{
            overflowY: "auto", // 'auto' will add a scrollbar when needed
            maxHeight: "70vh", // Set a maximum height to limit the scrollable area
          }}
          p={2}
        >
          <form>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Typography
                    id="child-detail-label"
                    color="textPrimary"
                    variant="subtitle2"
                    fontSize={"1rem"}
                    fontWeight={500}
                  >
                    Child Information
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    id="first-name"
                    error={Boolean(touched?.firstName && errors?.firstName)}
                    fullWidth
                    helperText={touched?.firstName && errors?.firstName}
                    label="First name"
                    name="firstName"
                    onBlur={handleBlur}
                    onChange={handleChange}
                    required
                    value={values?.firstName}
                    variant="outlined"
                    // {...getFieldProps("firstName")}
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    id="last-name"
                    error={Boolean(touched?.lastName && errors?.lastName)}
                    fullWidth
                    helperText={touched?.lastName && errors?.lastName}
                    label="Last name"
                    name="lastName"
                    onBlur={handleBlur}
                    onChange={handleChange}
                    required
                    value={values?.lastName}
                    variant="outlined"
                    // {...getFieldProps("lastName")}
                  />
                </Grid>
                <Grid item xs={6}>
                  <DatePicker
                    id="birth-date"
                    label="Birth date"
                    // defaultValue={undefined}
                    value={
                      values.dateOfBirth ? dayjs(values.dateOfBirth) : undefined
                    }
                    onChange={(newValue) => {
                      setFieldValue("dateOfBirth", newValue);
                    }}
                    format={DateFormatFromRegion()}
                    maxDate={dayjs()}
                    sx={{ width: 1 }}
                    slotProps={{
                      textField: {
                        required: true,
                        error:
                          touched?.dateOfBirth && Boolean(errors?.dateOfBirth),
                        helperText: (
                          <>
                            <Typography fontSize="0.75rem">
                              {DateFormatFromRegion()}
                            </Typography>
                            {touched?.dateOfBirth && errors?.dateOfBirth}
                          </>
                        ),
                      },
                    }}
                  />
                </Grid>
                <Grid item xs={6}>
                  <DatePicker
                    id="entered-agency-date"
                    label="Date child entered agency"
                    value={
                      values.fosterCareStartDate
                        ? dayjs(values.fosterCareStartDate)
                        : undefined
                    }
                    onChange={(newValue) => {
                      setFieldValue("fosterCareStartDate", newValue);
                      validateField("fosterCareStartDate").then(() => {
                        setFieldTouched("fosterCareStartDate", true); // Mark field as touched
                        console.log(
                          "Errors after validation:",
                          errors.fosterCareStartDate
                        );
                      });
                    }}
                    // onBlur={(e) => handleBlur({ target: { name: "fosterCareStartDate" } })}
                    format={DateFormatFromRegion()}
                    // onBlur={handleBlur}
                    required
                    maxDate={dayjs()}
                    sx={{ width: 1 }}
                    slotProps={{
                      textField: {
                        required: true,
                        error:
                          touched?.fosterCareStartDate &&
                          Boolean(errors?.fosterCareStartDate),
                        helperText: (
                          <>
                            <Typography fontSize="0.75rem">
                              {DateFormatFromRegion()}
                            </Typography>
                            {touched?.fosterCareStartDate &&
                              errors?.fosterCareStartDate}
                          </>
                        ),
                      },
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        variant="standard"
                        margin="normal"
                        fullWidth
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={6} my={0}>
                  <Autocomplete
                    id="gender"
                    name="gender"
                    value={values?.gender}
                    required={true}
                    options={GenderList}
                    sx={{ width: 1 }}
                    isOptionEqualToValue={(option, value) => {
                      return Object.is(
                        JSON.stringify(option),
                        JSON.stringify(value)
                      );
                    }}
                    onChange={(_, newValue) =>
                      setFieldValue("gender", newValue)
                    }
                    getOptionLabel={(option) => convertUnderscoreToText(option)}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Gender"
                        required
                        error={touched?.gender && Boolean(errors?.gender)}
                        helperText={touched?.gender && errors?.gender}
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={6} my={0}>
                  {/* <Autocomplete
                    id="ethnicity"
                    name="ethnicity"
                    value={values?.ethnicity}
                    options={["BASIC", "MODERATE", "SPECIALIZED", "INTENSE"]}
                    sx={{ width: 1 }}
                    isOptionEqualToValue={(option, value) => {
                      return Object.is(
                        JSON.stringify(option),
                        JSON.stringify(value)
                      );
                    }}
                    disableClearable
                    getOptionLabel={(option) => convertUnderscoreToText(option)}
                    onChange={(_, newValue) =>
                      setFieldValue("ethnicity", newValue)
                    }
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        required
                        label="Ethnicity"
                        error={touched?.ethnicity && Boolean(errors?.ethnicity)}
                        helperText={touched?.ethnicity && errors?.ethnicity}
                      />
                    )}
                  /> */}

                  {
                    <Autocomplete
                      id="ethnicity"
                      name="ethnicity"
                      value={
                        ethnicityOptions.find(
                          (option) => option.value === values?.ethnicity
                        ) || null
                      }
                      options={ethnicityOptions}
                      sx={{ width: 1 }}
                      isOptionEqualToValue={(option, value) =>
                        option.value === value
                      }
                      disableClearable
                      getOptionLabel={(option) => option.label}
                      onChange={(_, newValue) =>
                        setFieldValue("ethnicity", newValue?.value || "")
                      }
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          required
                          label="Ethnicity"
                          error={
                            touched?.ethnicity && Boolean(errors?.ethnicity)
                          }
                          helperText={touched?.ethnicity && errors?.ethnicity}
                        />
                      )}
                    />
                  }
                </Grid>

                <Grid item xs={6} my={0}>
                  <Autocomplete
                    id="level"
                    name="level"
                    value={values?.level}
                    options={["BASIC", "MODERATE", "SPECIALIZED", "INTENSE"]}
                    sx={{ width: 1 }}
                    isOptionEqualToValue={(option, value) => {
                      return Object.is(
                        JSON.stringify(option),
                        JSON.stringify(value)
                      );
                    }}
                    disableClearable
                    getOptionLabel={(option) => convertUnderscoreToText(option)}
                    onChange={(_, newValue) => setFieldValue("level", newValue)}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Level of care"
                        error={touched?.level && Boolean(errors?.level)}
                        helperText={touched?.level && errors?.level}
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    id="allergy"
                    error={Boolean(touched?.allergy && errors?.allergy)}
                    fullWidth
                    helperText={touched?.allergy && errors?.allergy}
                    label="Allergy"
                    name="allergy"
                    onBlur={handleBlur}
                    onChange={handleChange}
                    value={values?.allergy}
                    variant="outlined"
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    id="medicaid-number"
                    error={Boolean(
                      touched?.medicaidNumber && errors?.medicaidNumber
                    )}
                    fullWidth
                    helperText={
                      touched?.medicaidNumber && errors?.medicaidNumber
                    }
                    label="Medicaid Number"
                    name="medicaidNumber"
                    onBlur={handleBlur}
                    onChange={handleChange}
                    value={values?.medicaidNumber}
                    variant="outlined"
                  />
                </Grid>
                <Grid item xs={12}>
                  <Divider sx={{ color: "black" }} />
                </Grid>
                <Grid item xs={12}>
                  <Typography
                    id="placement-info-label"
                    color="textPrimary"
                    variant="subtitle2"
                    fontSize={"1rem"}
                  >
                    Placement information
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Autocomplete
                    id="placementStatus"
                    name="placementStatus"
                    value={values.placementStatus}
                    options={fsChildPlacementList}
                    sx={{ width: 1 }}
                    getOptionLabel={(option) =>
                      convertUnderscoreToText(option.value)
                    }
                    isOptionEqualToValue={(option, value) => {
                      return Object.is(
                        JSON.stringify(option),
                        JSON.stringify(value)
                      );
                    }}
                    onChange={(_, newValue) =>
                      setFieldValue("placementStatus", newValue)
                    }
                    disableClearable
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Placement Status"
                        required
                        error={
                          touched?.placementStatus &&
                          Boolean(errors?.placementStatus)
                        }
                        helperText={
                          touched?.placementStatus && errors?.placementStatus
                        }
                      />
                    )}
                  />
                </Grid>
                {values.placementStatus ===
                  fsChildPlacementList.find(
                    (status) => status.key === "DISCHARGED"
                  ) && (
                  <Grid item container spacing={2} xs={12}>
                    <Grid item xs={6}>
                      
                      <DatePicker
                        id="discharge-date"
                        label="Discharge Date"
                        // defaultValue={undefined}
                        value={
                          values.childDischargedDate
                            ? dayjs(values.childDischargedDate)
                            : undefined
                        }
                        onChange={(newValue) => {
                          setFieldValue("childDischargedDate", newValue);
                        }}
                        disabled ={childData?.childDischargedDate}
                        format={DateFormatFromRegion()}
                        // onBlur={handleBlur}
                        maxDate={dayjs()}
                        sx={{ width: 1 }}
                        slotProps={{
                          textField: {
                            required: true,
                            error:
                              touched?.childDischargedDate &&
                              Boolean(errors?.childDischargedDate),
                            helperText: (
                              <>
                                <Typography fontSize="0.75rem">
                                  {DateFormatFromRegion()}
                                </Typography>
                                {touched?.childDischargedDate &&
                                  errors?.childDischargedDate}
                              </>
                            ),
                          },
                        }}
                      />
                    </Grid>
                  </Grid>
                )}
                <Grid item xs={6} my={0}>
                  <Autocomplete
                    id="caseManager"
                    name="userId"
                    value={values?.userId}
                    options={caseWorkerOptions}
                    sx={{ width: 1 }}
                    isOptionEqualToValue={(option, value) => {
                      return Object.is(
                        JSON.stringify(option),
                        JSON.stringify(value)
                      );
                    }}
                    getOptionLabel={(option) =>
                      `${option.firstName} ${option.lastName}`
                    }
                    onChange={(_, newValue) =>
                      setFieldValue("userId", newValue)
                    }
                    disabled={signedinUserRoleFS === "casemanager"}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Case Manager"
                        required
                        error={touched?.userId && Boolean(errors?.userId)}
                        helperText={touched?.userId && errors?.userId}
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    id="placement-id"
                    error={Boolean(touched?.placementId && errors?.placementId)}
                    fullWidth
                    helperText={touched?.placementId && errors?.placementId}
                    label="Placement Id"
                    name="placementId"
                    onBlur={handleBlur}
                    onChange={handleChange}
                    value={values?.placementId}
                    variant="outlined"
                  />
                </Grid>
                <Grid item xs={6} my={0}>
                  <Autocomplete
                    id="family"
                    name="familyId"
                    value={values?.familyId}
                    options={familyList}
                    sx={{ width: 1 }}
                    isOptionEqualToValue={(option, value) => {
                      return Object.is(
                        JSON.stringify(option),
                        JSON.stringify(value)
                      );
                    }}
                    onChange={(_, newValue) =>
                      setFieldValue("familyId", newValue)
                    }
                    getOptionLabel={(option) =>
                      `${option.firstName} ${option.lastName}`
                    }
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Family"
                        required
                        error={touched?.familyId && Boolean(errors?.familyId)}
                        helperText={touched?.familyId && errors?.familyId}
                      />
                    )}
                    disabled={
                      values.placementStatus ===
                      fsChildPlacementList.find(
                        (status) => status.key === "DISCHARGED"
                      )
                    }
                  />
                </Grid>
                <Grid item xs={12}>
                  <Divider sx={{ color: "black" }} />
                </Grid>
                <Grid item xs={12}>
                  <Typography
                    color="textPrimary"
                    variant="subtitle2"
                    fontSize={"1rem"}
                  >
                    Additional Information
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <DatePicker
                    id="child-entered-date"
                    label="First entered welfare system"
                    views={["year", "month"]} // Allow selection of year and month only
                    value={
                      values.dateOfCWSEntry
                        ? dayjs(values.dateOfCWSEntry, "MM/YYYY").isValid()
                          ? dayjs(values.dateOfCWSEntry, "MM/YYYY")
                          : undefined
                        : undefined
                    }
                    disabled={isEditing && childData?.dateOfCWSEntry}
                    onChange={(newValue) => {
                      setFieldValue(
                        "dateOfCWSEntry",
                        newValue ? dayjs(newValue).format("MM/YYYY") : ""
                      );
                      validateField("dateOfCWSEntry").then(() => {
                        setFieldTouched("dateOfCWSEntry", true); // Mark field as touched
                      });
                    }}
                    format="MM/YYYY" // Display format for month and year
                    maxDate={dayjs()}
                    sx={{ width: 1 }}
                    slotProps={{
                      textField: {
                        required: true,
                        error:
                          touched?.dateOfCWSEntry &&
                          Boolean(errors?.dateOfCWSEntry),
                        helperText: (
                          <>
                            <Typography fontSize="0.75rem" color="#778791">
                              When did the child FIRST enter the foster care
                              system? MM/YYYY
                              {/* Helper text */}
                            </Typography>
                            {touched?.dateOfCWSEntry && errors?.dateOfCWSEntry}
                          </>
                        ),
                      },
                    }}
                  />
                </Grid>

                <Grid item xs={6} my={0}>
                  <Autocomplete
                    id="hadPrevCM"
                    name="hadPrevCM"
                    value={values?.hadPrevCM}
                    options={["YES", "NO", "UNKNOWN"]}
                    sx={{ width: 1 }}
                    isOptionEqualToValue={(option, value) => option === value}
                    disableClearable
                    disabled={isEditing && childData?.hadPrevCM}
                    getOptionLabel={(option) => convertUnderscoreToText(option)}
                    onChange={(_, newValue) =>
                      setFieldValue("hadPrevCM", newValue?.toUpperCase() || "")
                    }
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        required
                        disabled={isEditing && childData?.hadPrevCM}
                        label="Other case managers"
                        error={touched?.hadPrevCM && Boolean(errors?.hadPrevCM)}
                        helperText={
                          <>
                            <Typography fontSize="0.75rem" color="#778791">
                              Has this child previously had another case
                              manager, at your organization or any other?
                            </Typography>
                            {touched?.hadPrevCM && errors?.hadPrevCM}
                          </>
                        }
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={6} my={0}>
                  <Autocomplete
                    id="hasPrevPlacements"
                    name="hasPrevPlacements"
                    value={values?.hasPrevPlacements}
                    options={["YES", "NO", "UNKNOWN"]}
                    sx={{ width: 1 }}
                    isOptionEqualToValue={(option, value) => option === value}
                    disableClearable
                    disabled={isEditing && childData?.hasPrevPlacements}
                    getOptionLabel={(option) => convertUnderscoreToText(option)}
                    onChange={(_, newValue) =>
                      setFieldValue(
                        "hasPrevPlacements",
                        newValue?.toUpperCase() || ""
                      )
                    }
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        required
                        label="Previous placements"
                        error={
                          touched?.hasPrevPlacements &&
                          Boolean(errors?.hasPrevPlacements)
                        }
                        helperText={
                          <>
                            <Typography fontSize="0.75rem" color="#778791">
                              Has this child ever had previous placements, at
                              your organization or any other, before their
                              current placement?
                            </Typography>
                            {touched?.hasPrevPlacements &&
                              errors?.hasPrevPlacements}
                          </>
                        }
                      />
                    )}
                  />
                </Grid>
                {values.hasPrevPlacements === "YES" && (
                  <Grid item xs={6}>
                    <TextField
                      id="numberOfPrevPlacements"
                      error={Boolean(
                        touched?.numberOfPrevPlacements &&
                          errors?.numberOfPrevPlacements
                      )}
                      required
                      fullWidth
                      helperText={
                        <>
                          <Typography fontSize="0.75rem" color="#778791">
                            Approximately, how many placements has this child
                            ever had since entering the child welfare system?
                            Please include any foster homes, group/residential
                            facility placements, as well as returns to family or
                            kin, in the total count.{" "}
                          </Typography>
                          {touched?.numberOfPrevPlacements &&
                            errors?.numberOfPrevPlacements}
                        </>
                      }
                      disabled={isEditing && childData?.numberOfPrevPlacements}
                      label="Number of previous placements"
                      name="numberOfPrevPlacements"
                      type="number"
                      onKeyDown={(evt) =>
                        ["e", "E", "+", "-", "."].includes(evt.key) &&
                        evt.preventDefault()
                      }
                      inputProps={{ min: 1, max: 500 }}
                      onBlur={handleBlur}
                      onChange={handleChange}
                      value={values?.numberOfPrevPlacements}
                      variant="outlined"
                    />
                  </Grid>
                )}
                <Grid item xs={12}>
                  <TextField
                    id="notes"
                    fullWidth
                    label="Notes"
                    name="notes"
                    onBlur={handleBlur}
                    onChange={handleChange}
                    value={values?.notes}
                    variant="outlined"
                    multiline
                    rows={3}
                  />
                </Grid>
              </Grid>
            </LocalizationProvider>
          </form>
        </Box>
        <Box mt={2} sx={{ display: "flex", justifyContent: "end", gap: 2 }}>
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
            onClick={() => handleSubmit(handleSubmitHandler)}
            disabled={isSubmitting}
          >
            Save
          </Button>
        </Box>
      </Box>
    </>
  );
};

export default ChildDetailForm;
