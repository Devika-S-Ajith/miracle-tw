import React, {
  useEffect,
  useState,
  useContext,
  useRef,
  useCallback,
} from "react";
import { useNavigate } from "react-router-dom";
import PropTypes from "prop-types";
import toast from "react-hot-toast";
import * as Yup from "yup";
import { Formik, Field } from "formik";
import {
  Box,
  Button,
  Card,
  Divider,
  Grid,
  Switch,
  TextField,
  Typography,
  useTheme,
} from "@mui/material";
import APIS from "../../../../common/hooks/UseApiCalls";
import { CommonDataContext } from "../../../../common/contexts/CommonDataContext";
import NumberFormat from "react-number-format";
import { useTranslation } from "react-i18next";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import dayjs from "dayjs";
import UserIcon from "../../../../assets/icons/User";
import AutoCompleteDropdown from "../../../../components/UserComponents/AutoCompleteDropdown";
import AutoCompleteDropdownMultiNames from "../../../../components/UserComponents/AutoCompleteDropdownMultiNames";
import useMounted from "../../../../common/hooks/UseMounted";
import {
  fileUpload,
  generateUniqueKeyForImage,
  getDistrictList,
  getSelectedCountryDetails,
  getStateList,
} from "../../../../helpers/helperFunction";
import "react-international-phone/style.css";
import "../AddChildForm/AddChildForm.css";
import { PhoneNumberUtil } from "google-libphonenumber";
import { PhoneTextInput } from "../../../../components/PhoneTextInput/PhoneTextInput";
import WarningRoundedIcon from "@mui/icons-material/WarningRounded";
import { DateFormat } from "../../../../constants";
import { ADMIN_CASEWORKER, CASEWORKER } from "../../../../helpers/constant";

const phoneUtil = PhoneNumberUtil.getInstance();

const EditChildForm = (props) => {
  const { t } = useTranslation(["common"]);
  const navigate = useNavigate();
  const [checked, setChecked] = useState(props.user.isActive);
  const [loading, setLoading] = useState(false);
  const theme = useTheme();
  const { user, ...other } = props;
  const {
    organizationList,
    familyList,
    languageList,
    childStatusList,
    childPlacementList,
    locationList,
    childCurrentPlacementList,
    childEducationList,
    getChildFamilyList,
    signedinOrgType,
    signedinUserRoleHT,
    roleList,
    dbRegion,
    htLanguagesList,
  } = useContext(CommonDataContext);
  // const dummyLanguageList = [
  //   { id: "1", language: "English", languageCode: "en" },
  //   { id: "2", language: "Hindi", languageCode: "hi" },
  //   { id: "3", language: "Tamil", languageCode: "ta" },
  // ];
  let genderArray = ["Male", "Female", "Other", "Prefer not to disclose"];
  const [uploadedFile, setUploadedFile] = useState(null);
  const [uploadedFileURL, setUploadedFileURL] = useState(user.fileUrl || null);
  const [imageChanged, setImageChanged] = useState(false);
  const [currentOrganization, setCurrentOrganization] = useState("");
  const [caseWorkers, setCaseWorkers] = useState(null);
  const caseWorkerRoleId = roleList?.find((r) => r.role == "Case Worker")?.id;
  const mounted = useMounted();
  const signedinOrgId = localStorage.getItem("orgId");
  const GenderList = [
    {
      id: "Female",
      gender: t("common:common.Female"),
    },
    {
      id: "Male",
      gender: t("common:common.Male"),
    },
    {
      id: "Other",
      gender: t("common:common.Other"),
    },
    {
      id: "Prefer not to disclose",
      gender: t("common:common.Prefer not to disclose"),
    },
  ];

  const stringToDate = (dateString) => {
    const [day, month, year] = dateString.split("/");
    return new Date([month, day, year].join("/"));
  };

  const stringToDateFromObject = (dateString) => {
    const formatYmd = (date) => date.toISOString().slice(0, 10);
    const formattedDateString = formatYmd(new Date(dateString));
    const [year, month, day] = formattedDateString.split("-");
    return new Date([month, day, year].join("/"));
  };

  const getDate = (dateToFormat = null) => {
    let yourDate;
    if (dateToFormat === null) {
      yourDate = new Date();
    } else {
      yourDate = new Date(stringToDate(dateToFormat));
    }
    const offset = yourDate.getTimezoneOffset();
    yourDate = new Date(yourDate.getTime() - offset * 60 * 1000);
    return yourDate.toISOString().split("T")[0];
  };

  const getDateFromObject = (dateToFormat = null) => {
    if (!dateToFormat) {
        return new Date().toISOString().split("T")[0];
    }
    const yourDate = dayjs(dateToFormat).startOf("day"); // Ensure the time is set to the beginning of the day
    return yourDate.format("YYYY-MM-DD"); // Format correctly without additional timezone shifts
};

  const getOrgDetails = useCallback(async (values) => {
    setLoading(true);
    if (values.organization_name !== "") {
      try {
        let data = await APIS.OrganisationDetails(values.organization_name);
        let orgData = data.data.organizationDetails;
        values.address1 = orgData.addressLine1;
        values.address2 = orgData.addressLine2;
        values.country = orgData.HTCountryId;
        values.state = orgData.HTStateId;
        values.city = orgData.city;
        values.district = orgData.HTDistrictId;
        values.zip_code = orgData.zipCode;
        setLoading(false);
      } catch (err) {
        console.error(err);
        setLoading(false);
      }
    }
  }, []);

  const hiddenFileInput = useRef(null);

  const handleClick = (event) => {
    hiddenFileInput.current.click();
  };

  const handleChangePicture = (event) => {
    if (event.target.files[0]) {
      const fileUploadedURL = URL.createObjectURL(event.target.files[0]);
      console.log(
        "getUpdatedSignedURL",
        event.target.files[0],
        fileUploadedURL
      );
      setUploadedFile(event.target.files[0]);
      setUploadedFileURL(fileUploadedURL);
      setImageChanged(true);
    }
  };

  const removePicture = () => {
    setUploadedFile(null);
    setUploadedFileURL(null);
    setImageChanged(true);
  };

  // const fileUpload = useCallback(async (selectedFile, signedURL) => {
  //   let config = {
  //     transformRequest: [
  //       (data, headers) => {
  //         delete headers.common.Authorization;
  //         return data;
  //       },
  //     ],
  //   };
  //   config.headers = {
  //     "Content-Type": "image/png",
  //   };
  //   config.method = "PUT";
  //   config.url = signedURL;
  //   config.data = selectedFile;
  //   const res = await axios(config);
  // });

  // const getSignedURL = useCallback(async (value, id) => {
  //   setLoading(true);
  //   try {
  //     let finalPayload = {
  //       moduleType: "child",
  //       documentType: "profile-image",
  //       fileName: `${value.name}`,
  //       moduleId: `${id}`,
  //       fileSize: `${value.size / 1024}`,
  //       description: "profile picture",
  //     };
  //     const data = await APIS.UploadFile(finalPayload);
  //     if (data.status === 200) {
  //       fileUpload(value, data.data.signedUrl);
  //     } else {
  //       console.log("An Error occurred");
  //     }
  //   } catch (err) {
  //     console.error(err);
  //   }
  // }, []);

  const getSignedURL = async (profileImage, childId, existingKey) => {
    console.log("getUpdatedSignedURL", existingKey, profileImage);
    let key;
    if (!existingKey || existingKey === null) {
      key = generateUniqueKeyForImage(profileImage?.name);
    } else {
      key = existingKey;
    }
    try {
      let payload = {
        key: childId + "/" + key,
        module: "HT_CHILD",
      };
      const data = await APIS.generateFileUploadURL(payload);
      console.log("fileUploadToS3", data?.data);
      if (data && data?.data && data?.data?.data) {
        const response = await fileUpload(profileImage, data?.data?.data);
        console.log("fileUploadToS3", response, profileImage);
        if (response.status === 200) {
          if (!existingKey || existingKey === null) {
            await updateImageOnDB(key, childId, profileImage);
          } else {
            //setShowToaster(true);
            //setInfoMsg(t('Profile:message:imageUploadSuccess'));
            console.log("successfully updated!");
          }
        } else {
          //setShowToaster(true);
          //setInfoMsg(t('Profile:message:somethingWrong'));
          console.log("something went wrong!");
        }
      } else {
        //setShowToaster(true);
        //setInfoMsg(t('Profile:message:somethingWrong'));
        console.log("something went wrong!");
      }
    } catch (e) {
      // setShowToaster(true);
      /// setInfoMsg(t('Profile:message:somethingWrong'));
      console.log(e);
    }
  };

  const removeUploadedProfileImage = useCallback(async (id) => {
    setLoading(true);
    try {
      let finalPayload = {
        // moduleType: "child",
        // documentType: "profile-image",
        // moduleId: `${id}`,
        id: id,
      };
      const data = await APIS.deleteChildDocument(finalPayload);
    } catch (err) {
      console.error(err);
    }
  }, []);

  const updateImageOnDB = useCallback(async (key, id, profileImage) => {
    // New Function
    try {
      let finalPayload = {
        documentType: "profile-image",
        fileStatus: `Created`,
        key: `${key}`,
        fileSize: `${profileImage.size / 1024}`,
        description: "profile picture",
        childId: id,
        TWAccountId: localStorage.getItem("orgId"),
      };
      console.log("updateImageOnDB", finalPayload);
      const data = await APIS.AddChildDocument(finalPayload);
      console.log("updateImageOnDBAPI", data);
      if (data && data?.status === 200) {
        //setShowToaster(true);
        // setInfoMsg(t('Profile:message:imageUploadSuccess'));
        console.log("successfully updated!");
      } else {
        // setShowToaster(true);
        //setInfoMsg(t('Profile:message:somethingWrong'));
        console.log("something went wrong!");
      }
    } catch (err) {
      //setShowToaster(true);
      // setInfoMsg(t('Profile:message:somethingWrong'));
      console.error(err);
    }
  }, []);

  const handleStatusChange = async () => {
    try {
      const statusPayload = {
        id: user.id,
        isActive: !checked,
        isDeleted: false,
        TWAccountId: `${user.TWAccountId}`,
      };
      await APIS.ChangeChildStatus(statusPayload).then((res) => {
        if (res) {
          toast.success(t("common:child.Child Status Updated Successfully"));
        } else {
          toast.error(t("common:common.Something went wrong"));
        }
      });
    } catch (err) {
      toast.error(t("common:common.Something went wrong"));
    }
  };

  useEffect(() => {
    getUserList();
    // if (signedinOrgType !== null && signedinUserRole !== null) {
    //   if ((signedinOrgType == 3 || signedinOrgType == 4) && (signedinUserRole === 'admin' || signedinUserRole === 'caseworker')) {
    //     if (currentOrganization !== signedinOrgId) {
    //       setCurrentOrganization(signedinOrgId)
    //     }
    //   } else {
    //     navigate('/Unauthorized');
    //   }
    // }
    return () => {};
  }, []);

  const getUserList = useCallback(async () => {
    let caseWorkerRoleId = null;
    try {
      const roleLists = await APIS.UserRoleListHT();
      if (roleLists && roleLists.data && roleLists.data.data) {
        caseWorkerRoleId = roleLists.data.data?.find(
          (r) => r.role == "Social Worker"
        )?.id;
      }
      const payload = {
        rowCount: "10000",
        pageNumber: "1",
        orderByField: [["firstName", "ASC"]],
        globalSearchQuery: "",
        accountId: [signedinOrgId],
        HTLanguageId: "",
        HTChildPlacementStatusId: "",
        HTChildStatusId: "",
        // needFullData: "true",
        // "HTUserRoleId": caseWorkerRoleId,
        HTUserRoleId: ["4", "5"],
        HTCountryId: localStorage.getItem("userRegion"),
        // todo - handle the HTUserRoleId dynamically
      };
      const data = await APIS.ListUsers(payload);
      setCaseWorkers(data && data.data && data.data.data);
    } catch (err) {
      console.error(err);
    }
  }, [mounted]);

  const editCase = useCallback(async (childID, caseId, caseWorkerId) => {
    let payload = {
      id: caseId,
      TWUserId: caseWorkerId,
      HTChildId: childID,
    };

    try {
      await APIS.EditCase(payload).then((res) => {
        if (res && res.data && res.status === 200) {
        } else {
          toast.error(t("common:common.Something went wrong"));
        }
      });
    } catch (err) {
      toast.error(t("common:common.Something went wrong"));
    }
  });

  return (
    <Formik
      initialValues={{
        firstname: user.firstName,
        lastname: user.lastName || "",
        birthdate: getDate(user.birthDate),
        addedDate:
          user.dateOfEntry !== "" && user.dateOfEntry !== null
            ? getDate(user?.dateOfEntry)
            : null,
        closedDate:
          user.dateOfExit !== "" && user.dateOfExit !== null
            ? getDate(user?.dateOfExit)
            : null,
        genderOption:
          (genderArray.includes(user.gender) && user.gender) || "Other",
        gender: user.gender,
        phone: user.phoneNumber || "",
        email: user.email || "",
        language: user.HTLanguageId || "",
        family: user.HTFamilyId || "",
        organization_name: user.TWAccountId || "",
        childPlacement: user.HTChildPlacementStatusId || "",
        childStatus: user.HTChildStatusId || "",
        childEducation: user.HTChildEducationLevelId || "",
        childEducationSpecify: user.highestEducationLevel || "",
        childCurrentPlacement: user.HTChildCurrentPlacementStatusId || "",
        address1: user.addressLine1 || "",
        address2: user.addressLine2 || "",
        country: user.HTCountryId || "",
        state: user.HTStateId || "",
        city: user.city || "",
        district: user.HTDistrictId || "",
        zip_code: user?.zipCode
          ? user?.zipCode?.length > 6
            ? user?.zipCode.slice(0, 5) + "-" + user?.zipCode.slice(5)
            : user?.zipCode
          : "",
        caseWorker: user.TWUserId || "",
      }}
      //enableReinitialize={true}
      validationSchema={Yup.object().shape({
        firstname: Yup.string()
          .max(255)
          .required(t("common:warnings.First Name is required")),
        lastname: Yup.string().max(255),
        birthdate: Yup.date()
          .typeError(t("common:warnings.Date of Birth is required"))
          .required(t("common:warnings.Date of Birth is required")),
        addedDate: Yup.date()
          .typeError(t("common:warnings.Invalid Date"))
          .nullable(),
        closedDate: Yup.date()
          .typeError(t("common:warnings.Invalid Date"))
          .nullable(),
        //addedDate: Yup.string().max(255).required('Added Date is required'),
        genderOption: Yup.string()
          .max(255)
          .required(t("common:warnings.Gender is required")),
        gender: Yup.string().max(255),
        language: Yup.string().max(255),
        family: Yup.string().max(255),
        childPlacement: Yup.string().max(255),
        childStatus: Yup.string().max(255),
        childEducation: Yup.string().max(255),
        childEducationSpecify: Yup.string().max(255),
        childCurrentPlacement: Yup.string().max(255),
        address1: Yup.string()
          .max(255)
          .required(t("common:warnings.Address Line 1 is required")),
        address2: Yup.string().max(255),
        country: Yup.string()
          .max(255)
          .required(t("common:warnings.Country is required")),
        district: Yup.string()
          .when("country", {
            is: (value) =>
              value ==
              getSelectedCountryDetails(locationList, value)?.districtRequired,
            then: Yup.string().required(
              t("common:warnings.Region is required")
            ),
            otherwise: Yup.string().max(255).nullable(),
          })
          .max(255),
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
        state: Yup.string()
          .max(255)
          .required(t("common:warnings.State is required")),
        email: Yup.string()
          .email(t("common:warnings.Must be a valid email"))
          .max(255),
        organization_name: Yup.string()
          .max(255)
          .required(t("common:warnings.Organization Name is required")),
        phone: Yup.string()
          .required(t("common:warnings.Phone Number is required"))
          .test(
            "phone-format-validation",
            t("common:warnings.Invalid Phone number"),
            (value) => {
              try {
                const phoneNumber = phoneUtil.parseAndKeepRawInput(value);
                return phoneUtil.isValidNumber(phoneNumber);
              } catch (error) {
                return false; // Handle parsing errors
              }
            }
          ),
        caseWorker: Yup.string()
          .max(255)
          .required(t("common:warnings.Case Worker is required")),
      })}
      onSubmit={async (
        values,
        { resetForm, setErrors, setStatus, setSubmitting }
      ) => {
        let payload = {
          id: user && user.id,
          firstName: values.firstname,
          lastName: values.lastname,
          birthDate: getDateFromObject(values.birthdate),
          dateOfEntry:
            values.addedDate !== "" && values.addedDate !== null
              ? getDateFromObject(values.addedDate)
              : null,
          dateOfExit:
            values.closedDate !== "" && values.closedDate !== null
              ? getDateFromObject(values.closedDate)
              : null,
          gender:
            values.genderOption === "Other"
              ? values.gender
              : values.genderOption,
          phoneNumber: values.phone,
          email: values.email,
          HTLanguageId: values.language || "",
          TWAccountId: values.organization_name,
          HTChildPlacementStatusId: values.childPlacement || "",
          HTChildStatusId: values.childStatus ? values.childStatus : null,
          HTChildCurrentPlacementStatusId: values.childCurrentPlacement
            ? values.childCurrentPlacement
            : null,
          HTChildEducationLevelId: values.childEducation
            ? values.childEducation
            : null,
          highestEducationLevel: values.childEducationSpecify,
          addressLine1: values.address1,
          addressLine2: values.address2,
          zipCode: values.zip_code,
          HTCountryId: values.country,
          HTDistrictId: values.district || null,
          HTStateId: values.state,
          city: values.city,
          HTFamilyId: values.family ? values.family : null,
        };
        try {
          await APIS.EditChild(payload).then((res) => {
            if (res && res.data && res.status === 200) {
              resetForm();
              setStatus({ success: true });
              setSubmitting(false);
              editCase(user.id, user.HTCaseId, values.caseWorker);
              if (uploadedFile) {
                getSignedURL(uploadedFile, user.id, user.fileKey);
              } else if (user.fileUrl && !uploadedFile) {
                removeUploadedProfileImage(user.fileKey);
              }
              toast.success(t("common:child.Child Updated Successfully"));
              getChildFamilyList();
              navigate("/dashboard/children/");
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
      }) => {
        if (isSubmitting) {
          const el = document.querySelector(".Mui-error, [data-error]");
          (el?.parentElement ?? el)?.scrollIntoView();
          // (el?.parentElement ?? el)?.focus();
        }
        return (
          <form onSubmit={handleSubmit} {...other}>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <Grid container spacing={3}>
                <Grid item md={8} xs={12}>
                  <Card>
                    <Box sx={{ m: 2, mt: 3 }}>
                      <Grid container spacing={3}>
                        <Grid item md={6} xs={12}>
                          <TextField
                            error={Boolean(
                              touched.firstname && errors.firstname
                            )}
                            fullWidth
                            helperText={touched.firstname && errors.firstname}
                            label={t("common:common.Child's first name")}
                            name="firstname"
                            onBlur={handleBlur}
                            onChange={handleChange}
                            required
                            value={values.firstname}
                            variant="outlined"
                            id="first-name"
                          />
                        </Grid>
                        <Grid item md={6} xs={12}>
                          <TextField
                            error={Boolean(touched.lastname && errors.lastname)}
                            fullWidth
                            helperText={touched.lastname && errors.lastname}
                            label={t("common:common.Child's last name")}
                            name="lastname"
                            onBlur={handleBlur}
                            onChange={handleChange}
                            value={values.lastname}
                            variant="outlined"
                            id="second-name"
                          ></TextField>
                        </Grid>
                        <Grid item md={6} xs={12} sx={{ mt: -2 }}>
                          <Field
                            error={Boolean(
                              touched.genderOption && errors.genderOption
                            )}
                            fullWidth
                            helperText={
                              touched.genderOption && errors.genderOption
                            }
                            name="genderOption"
                            accessKey="gender"
                            component={AutoCompleteDropdown}
                            required={true}
                            label="genderOption"
                            options={GenderList}
                            textFieldProps={{
                              fullWidth: true,
                              margin: "normal",
                              variant: "outlined",
                              label: t("common:common.Gender"),
                            }}
                            id="gender"
                          />
                        </Grid>
                        <Grid item md={6} xs={12}>
                          {values.genderOption === "Other" ? (
                            <TextField
                              error={Boolean(touched.gender && errors.gender)}
                              fullWidth
                              helperText={touched.gender && errors.gender}
                              label={t("common:child.Specify Gender ")}
                              name="gender"
                              onBlur={handleBlur}
                              onChange={handleChange}
                              required
                              value={values.gender}
                              variant="outlined"
                              id="gender-other"
                            ></TextField>
                          ) : (
                            <></>
                          )}
                        </Grid>
                        <Grid item md={6} xs={12} sx={{ mt: -2 }}>
                          <Field
                            error={Boolean(touched.country && errors.country)}
                            fullWidth
                            helperText={touched.country && errors.country}
                            name="country"
                            accessKey="countryName"
                            component={AutoCompleteDropdown}
                            disabled={
                              Boolean(values.childCurrentPlacement === "1") ||
                              user?.id
                            }
                            required={true}
                            label="country"
                            options={locationList}
                            textFieldProps={{
                              fullWidth: true,
                              margin: "normal",
                              variant: "outlined",
                              label: t("common:common.Country"),
                            }}
                            id="country"
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
                                "common:warnings.Country cannot be changed once Child is created"
                              )}
                            </Typography>
                          )}
                        </Grid>
                        <Grid item md={6} xs={12}>
                          <DatePicker
                            label={t("common:common.Date of Birth")}
                            value={
                              values.birthdate
                                ? dayjs(values.birthdate)
                                : undefined
                            }
                            sx={{ width: 1 }}
                            maxDate={dayjs()}
                            format={DateFormat}
                            required={true}
                            onChange={(newValue) => {
                              setFieldValue("birthdate", newValue);
                            }}
                            slotProps={{
                              textField: {
                                id: "birth-date",
                                required: true,
                                error:
                                  touched?.birthdate &&
                                  Boolean(errors?.birthdate),
                                helperText: (
                                  <>
                                    <Typography fontSize="0.75rem">
                                      {DateFormat}
                                    </Typography>
                                    {touched?.birthdate && errors?.birthdate}
                                  </>
                                ),
                              },
                            }}
                          />
                        </Grid>
                        <Grid item md={6} xs={12} sx={{ mt: -2 }}>
                          <Field
                            id="language"
                            error={Boolean(touched.language && errors.language)}
                            fullWidth
                            helperText={touched.language && errors.language}
                            name="language"
                            accessKey="language"
                            component={AutoCompleteDropdown}
                            required={false}
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
                        {/* Todo - handle phone number input */}
                        <Grid item md={6} xs={12}>
                          <PhoneTextInput
                            name={`phone`}
                            required
                            onBlur={handleBlur}
                            error={Boolean(touched?.phone && errors?.phone)}
                            helperText={touched?.phone && errors?.phone}
                            value={values.phone}
                            onChange={(phone) => setFieldValue("phone", phone)}
                            id="phone"
                          />
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
                            id="email"
                          />
                        </Grid>
                        <Grid item md={6} xs={12}>
                          <DatePicker
                            label={t("common:common.Added Date")}
                            value={
                              values.addedDate
                                ? dayjs(values.addedDate)
                                : undefined
                            }
                            sx={{ width: 1 }}
                            format={DateFormat}
                            onChange={(newValue) => {
                              setFieldValue("addedDate", newValue);
                            }}
                            slotProps={{
                              textField: {
                                id: "added-date",
                                error:
                                  touched?.addedDate &&
                                  Boolean(errors?.addedDate),
                                helperText: (
                                  <>
                                    <Typography fontSize="0.75rem">
                                      {DateFormat}
                                    </Typography>
                                    {touched?.addedDate && errors?.addedDate}
                                  </>
                                ),
                              },
                            }}
                          />
                        </Grid>
                        <Grid item md={6} xs={12}>
                          <DatePicker
                            label={t("common:common.Closed Date")}
                            value={
                              values.closedDate
                                ? dayjs(values.closedDate)
                                : undefined
                            }
                            format={DateFormat}
                            onChange={(newValue) => {
                              setFieldValue("closedDate", newValue);
                            }}
                            sx={{ width: 1 }}
                            slotProps={{
                              textField: {
                                id: "closed-date",
                                error:
                                  touched?.closedDate &&
                                  Boolean(errors?.closedDate),
                                helperText: (
                                  <>
                                    <Typography fontSize="0.75rem">
                                      {DateFormat}
                                    </Typography>
                                    {touched?.closedDate && errors?.closedDate}
                                  </>
                                ),
                              },
                            }}
                          />
                        </Grid>
                        <Grid item md={6} xs={12} sx={{ mt: -2 }}>
                          <Field
                            id="family"
                            error={Boolean(touched.family && errors.family)}
                            fullWidth
                            helperText={touched.family && errors.family}
                            name="family"
                            accessKey="familyName"
                            component={AutoCompleteDropdown}
                            //required={true}
                            label="family"
                            options={familyList}
                            textFieldProps={{
                              fullWidth: true,
                              margin: "normal",
                              variant: "outlined",
                              label: t("common:common.Choose Family"),
                            }}
                          />
                        </Grid>

                        <Grid item md={6} xs={12} sx={{ mt: -2 }}>
                          <Field
                            id="organization-name"
                            error={Boolean(
                              touched.organization_name &&
                                errors.organization_name
                            )}
                            fullWidth
                            helperText={
                              touched.organization_name &&
                              errors.organization_name
                            }
                            name="organization_name"
                            accessKey="accountName"
                            component={AutoCompleteDropdown}
                            getOrgDetails={() => getOrgDetails(values)}
                            required={true}
                            label="organization_name"
                            options={organizationList}
                            disabled={true}
                            textFieldProps={{
                              fullWidth: true,
                              margin: "normal",
                              variant: "outlined",
                              label: t("common:organization.Organization Name"),
                            }}
                          />
                        </Grid>
                        <Grid item md={6} xs={12} sx={{ mt: -2 }}>
                          <Field
                            id="child-status"
                            error={Boolean(
                              touched.childStatus && errors.childStatus
                            )}
                            fullWidth
                            helperText={
                              touched.childStatus && errors.childStatus
                            }
                            name="childStatus"
                            accessKey="status"
                            component={AutoCompleteDropdown}
                            label="childStatus"
                            options={childStatusList}
                            textFieldProps={{
                              fullWidth: true,
                              margin: "normal",
                              variant: "outlined",
                              label: t("common:child.Child Status"),
                            }}
                          />
                        </Grid>
                        <Grid item md={6} xs={12} sx={{ mt: -2 }}>
                          <Field
                            id="child-placement"
                            error={Boolean(
                              touched.childPlacement && errors.childPlacement
                            )}
                            fullWidth
                            helperText={
                              touched.childPlacement && errors.childPlacement
                            }
                            name="childPlacement"
                            accessKey="placementStatus"
                            component={AutoCompleteDropdown}
                            label="childPlacement"
                            options={childPlacementList}
                            textFieldProps={{
                              fullWidth: true,
                              margin: "normal",
                              variant: "outlined",
                              label: t("common:child.Child Placement Status"),
                            }}
                          />
                        </Grid>
                        <Grid item md={6} xs={12} sx={{ mt: -2 }}>
                          <Field
                            id="currrent-placement"
                            error={Boolean(
                              touched.childCurrentPlacement &&
                                errors.childCurrentPlacement
                            )}
                            fullWidth
                            helperText={
                              touched.childCurrentPlacement &&
                              errors.childCurrentPlacement
                            }
                            name="childCurrentPlacement"
                            accessKey="currentPlacementStatus"
                            getOrgDetails={() => getOrgDetails(values)}
                            component={AutoCompleteDropdown}
                            required={false}
                            label="childCurrentPlacement"
                            options={childCurrentPlacementList}
                            textFieldProps={{
                              fullWidth: true,
                              margin: "normal",
                              variant: "outlined",
                              label: t("common:common.Current Placement"),
                            }}
                          />
                        </Grid>
                        <Grid item md={6} xs={12} sx={{ mt: -2 }}>
                          <Field
                            error={Boolean(
                              touched.caseWorker && errors.caseWorker
                            )}
                            id="case-worker"
                            fullWidth
                            helperText={touched.caseWorker && errors.caseWorker}
                            name="caseWorker"
                            accessKey1="firstName"
                            accessKey2="lastName"
                            component={AutoCompleteDropdownMultiNames}
                            disabled={[CASEWORKER].includes(signedinUserRoleHT)}
                            required={true}
                            label="caseWorker"
                            options={caseWorkers || []}
                            textFieldProps={{
                              fullWidth: true,
                              margin: "normal",
                              variant: "outlined",
                              label: t("common:common.Case Worker"),
                            }}
                          />
                        </Grid>
                        <Grid item md={6} xs={12} sx={{ mt: -2 }}>
                          <Field
                            id="child-education"
                            error={Boolean(
                              touched.childEducation && errors.childEducation
                            )}
                            fullWidth
                            helperText={
                              touched.childEducation && errors.childEducation
                            }
                            name="childEducation"
                            accessKey="educationLevel"
                            component={AutoCompleteDropdown}
                            label="childEducation"
                            options={childEducationList}
                            textFieldProps={{
                              fullWidth: true,
                              margin: "normal",
                              variant: "outlined",
                              label: t("common:child.Child Education"),
                            }}
                          />
                        </Grid>
                        <Grid item md={6} xs={12}>
                          {values.childEducation === "20" ? (
                            <TextField
                              id="child-education-other"
                              error={Boolean(
                                touched.childEducationSpecify &&
                                  errors.childEducationSpecify
                              )}
                              fullWidth
                              helperText={
                                touched.childEducationSpecify &&
                                errors.childEducationSpecify
                              }
                              label={t("common:child.Child Education")}
                              name="childEducationSpecify"
                              onBlur={handleBlur}
                              onChange={handleChange}
                              required
                              value={values.childEducationSpecify}
                              variant="outlined"
                            ></TextField>
                          ) : (
                            <></>
                          )}
                        </Grid>
                        <Divider />
                        <Grid item md={12} xs={12}>
                          <Typography color="textSecondary" variant="subtitle2">
                            {/* Member {index + 1} */}
                            {t("common:common.Address")}
                          </Typography>
                        </Grid>

                        {/* <>{values.organization_name? Trial(values): null}</> */}

                        <Grid item md={6} xs={12} sx={{ mt: -2 }}>
                          <Field
                            id="state"
                            error={Boolean(touched.state && errors.state)}
                            fullWidth
                            helperText={touched.state && errors.state}
                            name="state"
                            accessKey="stateName"
                            component={AutoCompleteDropdown}
                            disabled={Boolean(
                              values.childCurrentPlacement === "1"
                            )}
                            required={true}
                            label="state"
                            options={
                              getStateList(locationList, values.country) || []
                            }
                            textFieldProps={{
                              fullWidth: true,
                              margin: "normal",
                              variant: "outlined",
                              label: t("common:common.State/Region"),
                            }}
                          />
                        </Grid>

                        {values.country &&
                          getSelectedCountryDetails(
                            locationList,
                            values.country
                          )?.districtRequired && (
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
                            id="city"
                            error={Boolean(touched.city && errors.city)}
                            fullWidth
                            helperText={touched.city && errors.city}
                            label={t("common:common.City")}
                            name="city"
                            required
                            disabled={Boolean(
                              values.childCurrentPlacement === "1"
                            )}
                            onBlur={handleBlur}
                            onChange={handleChange}
                            value={values.city}
                            variant="outlined"
                          />
                        </Grid>
                        <Grid item md={6} xs={12}>
                          <NumberFormat
                            id="zip"
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
                            disabled={Boolean(
                              values.childCurrentPlacement === "1"
                            )}
                            onBlur={handleBlur}
                            onChange={(e) => {
                              let zipCode = e.target.value.trim();
                              setFieldValue("zip_code", zipCode);
                            }}
                            value={values.zip_code}
                          />
                        </Grid>
                        <Grid item md={6} xs={12}>
                          <TextField
                            id="address1"
                            error={Boolean(touched.address1 && errors.address1)}
                            fullWidth
                            helperText={touched.address1 && errors.address1}
                            label={t("common:common.Address 1")}
                            name="address1"
                            required
                            disabled={Boolean(
                              values.childCurrentPlacement === "1"
                            )}
                            onBlur={handleBlur}
                            onChange={handleChange}
                            value={values.address1}
                            variant="outlined"
                          />
                        </Grid>
                        <Grid item md={6} xs={12}>
                          <TextField
                            id="address2"
                            error={Boolean(touched.address2 && errors.address2)}
                            fullWidth
                            helperText={touched.address2 && errors.address2}
                            label={t("common:common.Address 2")}
                            name="address2"
                            // required
                            disabled={Boolean(
                              values.childCurrentPlacement === "1"
                            )}
                            onBlur={handleBlur}
                            onChange={handleChange}
                            value={values.address2}
                            variant="outlined"
                          />
                        </Grid>

                        <Grid />
                      </Grid>
                      <Grid item>
                        <Grid item md={6} xs={12}>
                          <Typography
                            color="textPrimary"
                            gutterBottom
                            variant="subtitle2"
                          >
                            {t("common:child.Child Status")}
                          </Typography>
                          <Box sx={{ display: "flex", flex: 1 }}>
                            <Box>
                              <Switch
                                id="status"
                                size="small"
                                color="orange"
                                checked={checked}
                                onChange={() => {
                                  setChecked(!checked);
                                  handleStatusChange();
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
                      <Box sx={{ mt: 2 }}>
                        <Button
                          color="primary"
                          sx={{ width: 200 }}
                          disabled={isSubmitting}
                          type="submit"
                          variant="contained"
                          id="update"
                        >
                          {t("common:child.Update Child")}
                        </Button>
                        <Button
                          id="reset"
                          type="reset"
                          color="primary"
                          sx={{ width: 200, ml: 21 }}
                          variant="contained"
                          onClick={() => {
                            handleReset();
                            values.birthdate = getDate(user.birthDate);
                            values.addedDate = user.dateOfEntry
                              ? getDate(user.dateOfEntry)
                              : null;
                            values.closedDate = user.dateOfExit
                              ? getDate(user.dateOfExit)
                              : null;
                          }}
                          style={{
                            backgroundColor: theme.palette.button.primary,
                          }}
                        >
                          {t("common:common.Reset")}
                        </Button>
                      </Box>
                    </Box>
                  </Card>
                </Grid>
                <Grid item md={4} xs={12}>
                  <Card>
                    <Box sx={{ m: 2, mt: 3 }}>
                      <Grid item md={12} xs={12}>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          {uploadedFileURL ? (
                            <img
                              // for="photo-upload"
                              src={uploadedFileURL}
                              // type="image"
                              style={{
                                width: 120,
                                height: 120,
                                borderRadius: "60px",
                              }}
                            />
                          ) : (
                            <UserIcon
                              fontSize="large"
                              style={{
                                width: 120,
                                height: 120,
                                borderRadius: "60px",
                                border: "2px solid #172b4d",
                              }}
                            />
                          )}
                        </div>
                      </Grid>
                      <Grid item md={12} xs={12} sx={{ mt: 3 }}>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <Button
                            id="logo-button"
                            color="primary"
                            sx={{ height: 40, ml: 2 }}
                            disabled={isSubmitting}
                            type="button"
                            variant="contained"
                            onClick={handleClick}
                            style={{
                              backgroundColor: theme.palette.button.primary,
                            }}
                          >
                            {uploadedFileURL
                              ? t("common:common.Change Image")
                              : t("common:common.Select Image")}
                          </Button>
                          <input
                            type="file"
                            id="myfile"
                            name="myfile"
                            ref={hiddenFileInput}
                            onChange={handleChangePicture}
                            style={{ display: "none" }}
                          />
                          {uploadedFileURL ? (
                            <Button
                              id="remove-logo"
                              color="primary"
                              sx={{ width: 150, height: 40, ml: 2 }}
                              disabled={isSubmitting}
                              type="button"
                              variant="contained"
                              onClick={() => removePicture()}
                              style={{
                                backgroundColor: theme.palette.button.primary,
                              }}
                            >
                              {t("common:common.Remove Image")}
                            </Button>
                          ) : (
                            <></>
                          )}
                        </div>
                      </Grid>
                      <Grid item md={12} xs={12}>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "12px",
                            color: "#f44336",
                          }}
                        >
                          {imageChanged && (
                            <p>
                              {t(
                                "common:common.Please make sure to save before exiting"
                              )}
                            </p>
                          )}
                        </div>
                      </Grid>
                    </Box>
                  </Card>
                </Grid>
              </Grid>
            </LocalizationProvider>
          </form>
        );
      }}
    </Formik>
  );
};

EditChildForm.propTypes = {
  user: PropTypes.object.isRequired,
};

export default EditChildForm;
