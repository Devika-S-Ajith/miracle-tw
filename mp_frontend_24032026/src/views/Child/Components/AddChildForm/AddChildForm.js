import { useContext, useCallback, useRef, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import * as Yup from "yup";
import { Formik, Form, Field } from "formik";
import {
  Autocomplete,
  Box,
  Button,
  Card,
  Checkbox,
  Divider,
  Grid,
  TextField,
  Tooltip,
  Typography,
  useTheme,
} from "@mui/material";
import { styled } from '@mui/material/styles';
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import dayjs from "dayjs";
import moment from "moment";
import NumberFormat from "react-number-format";
import { debounce } from "lodash";
import { Trans, useTranslation } from "react-i18next";
import APIS from "../../../../common/hooks/UseApiCalls";
import { CommonDataContext } from "../../../../common/contexts/CommonDataContext";
import { CASEWORKER } from "../../../../helpers/constant";
import { DateFormat, DateFormatFromRegion } from "../../../../constants";
import { ModalService } from "../../../../components/Modal";
import AutoCompleteDropdown from "../../../../components/UserComponents/AutoCompleteDropdown";
import AutoCompleteDropdownMultiNames from "../../../../components/UserComponents/AutoCompleteDropdownMultiNames";
import CustomSwitch from "../../../../components/UserComponents/CustomSwitch";
import InformationCircleIcon from "../../../../assets/icons/InformationCircle";
import Loader from "../../../../components/UserComponents/Loader";
import UserIcon from "../../../../assets/icons/User";
import useAuthorization from "../../../../components/UserComponents/useAuthorization";
import useMounted from "../../../../common/hooks/UseMounted";
import { PhoneTextInput } from "../../../../components/PhoneTextInput/PhoneTextInput";
import {
  fileUpload,
  generateUniqueKeyForImage,
  getDistrictList,
  getSelectedCountryDetails,
  getStateList,
  validatePhoneNumber,
} from "../../../../helpers/helperFunction";
import "react-international-phone/style.css";
import "./AddChildForm.css";

const CustomCheckbox = styled(Checkbox)(({ theme }) => ({
  width: 24,
  height: 24,
  padding: 0,
  '& .MuiSvgIcon-root': {
    fontSize: 24,
  },
  '&.Mui-checked': {
    color: '#1D334B',
  },
  '& .MuiCheckbox-root': {
    background: 'rgba(255,255,255,0)',
  },
  '& .MuiTouchRipple-root': {
    display: 'none',
  },
}));

const AddChildForm = (props) => {
  const theme = useTheme();
  const {
    organizationList,
    childStatusList,
    childPlacementList,
    locationList,
    childCurrentPlacementList,
    childEducationList,
    signedinOrgType,
    signedinUserRoleHT,
    signedinUserRoleFS,
    htLanguagesList,
    familyList: contextFamilyList,
    getTsChildListData
  } = useContext(CommonDataContext);
  const {
    family,
    childId,
    isNewFromFamily = false,
    address1: propAddress1,
    address2: propAddress2,
    city: propCity,
    zip_code: propZipCode,
    state: propState,
    district: propDistrict,
    country: propCountry
  } = props;
  const { t } = useTranslation(["common"]);
  const navigate = useNavigate();
  const mounted = useMounted();
  const [loading, setLoading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [uploadedFileURL, setUploadedFileURL] = useState(null);
  const [users, setUsers] = useState(null);
  const [cciData, setCciData] = useState(null);
  const [childDetails, setChildDetails] = useState(null);
  const [disableCaseWorker, setDisableCaseWorker] = useState(false);
  const [currentFamily, setCurrentFamily] = useState(null);
  const [checked, setChecked] = useState(false);
  const allowedExtendions = new Set(["jpg", "jpeg", "gif", "png"]);
  const signedinOrgId = localStorage.getItem("orgId");
  const genderArray = ["Male", "Female", "Other", "Prefer not to disclose"];
  const phoneRef = useRef({});
  const [statusChangeReasons, setStatusChangeReasons] = useState([])
  const [familyList, setFamilyList] = useState([]);
  const [childIsPrimaryContact, setChildIsPrimaryContact] = useState(false);
  const [childCanDeactivate, setChildCanDecativate] = useState(false);

  const getStatusChangeReasons = async () => {
    const res = await APIS.GetDeleteDeactivateReason("CHILD_DEACTIVATION")
    setStatusChangeReasons( res.data.reasons)
  }

  const getChild = useCallback(async () => {
    try {
      setLoading(true)
      const data = await APIS.ChildDetails(childId);
      const response = data?.data?.data;
      setChildDetails(response);
      setChecked(response?.isActive);
      setLoading(false)
      setUploadedFileURL(response?.fileUrl);
      checkForPrimaryContact()
      checkCanDeactivateChild(response?.HTFamilyId)
    } catch (err) {
      setLoading(false)
      console.error(err);
    }
  }, [mounted]);


  useEffect(() => {
    if (childId) {
      getChild();
    }
    console.log("context", contextFamilyList);
    return () => { };
  }, [childId]);



  const getFamilyDetails = async (values, newValue, setFieldValue) => {
    try {
      if (childId && currentFamily) {
        setLoading(true);
        try {
          const primaryRes = await APIS.checkChildIsPrimaryContactOfFamily(childId);
          if (primaryRes.status === 200 && primaryRes?.data?.status === "OK") {
            const deactivationRes = await APIS.checkDeactivationAllowed(childId,currentFamily,"FAMILY");
            if (deactivationRes.status === 200 && deactivationRes?.data?.Message === "OK") {
              setLoading(false);
              confirmAndGetFamilyDetails(values, newValue, setFieldValue);
            } else {
              setFieldValue('family', currentFamily);
              setLoading(false);
              toast.error(
                "Changing of family not allowed due to pending assessments or progress reports."
              );
            }
          } else {
            setFieldValue('family', currentFamily);
            setLoading(false);
            toast.error(t("common:child.primaryContactConfirmation"));
          }
        } catch (err) {
          console.error(err);
          setFieldValue('family', currentFamily);
          setLoading(false);
          toast.error("An unexpected error occurred while validating the child.");
        }
      } else {
        confirmAndGetFamilyDetails(values, newValue, setFieldValue)
      }
    } catch (err) {
      console.log(err);
    }
  }

   const getFamilyList = useCallback(async () => {
      try {
        let getFamListpayload = {
          rowCount: "10000",
          pageNumber: "1",
          orderByField: [["familyName", "ASC"]],
          familyStatus:"Active"
        };
        const data = await APIS.FamilyList(getFamListpayload);
        if (data?.data?.familyDetails) {
          setFamilyList(data.data.familyDetails);
        }        
      } catch (err) {
        console.error(err);
      }
    }, []);


  const confirmAndGetFamilyDetails = useCallback(async (values, newValue, setFieldValue) => {
    if (newValue) {
      const caseWorkerId = familyList?.find((family) => family.id === newValue)?.caseworkerId;
      const currentCaseworker = users?.find((user) => user.id === values?.caseWorker)?.firstName + " " + users?.find((user) => user.id === values?.caseWorker)?.lastName;
      const familyCaseWorker = users?.find((user) => user.id === caseWorkerId)?.firstName + " " + users?.find((user) => user.id === caseWorkerId)?.lastName;
      if (caseWorkerId) {
        if (values?.caseWorker && caseWorkerId != values?.caseWorker) {
          ModalService.open(({ close }) => (
            <Box sx={{ padding: 2 }}>
              <Typography>{t("common:common.This child is currently assigned to Case Worker")} {currentCaseworker}. {t("common:common.By adding this child to this family, this child will automatically be reassigned to the family’s Case Worker")} {familyCaseWorker}.</Typography>
              <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2, marginTop: 2 }}>
                <Button variant="outlined"
                  onClick={() => { setFieldValue('family', currentFamily); close(); }}>{t("common:common.No")}</Button>
                <Button variant="contained"
                  onClick={() => {
                    setFieldValue("caseWorker", caseWorkerId);
                    setDisableCaseWorker(true);
                    close();
                    setCurrentFamily(newValue);
                  }}>{t("common:common.Yes,Update case worker")}</Button>
              </Box>
            </Box>
          ), {
            modalTitle: t("common:common.Update case worker"),
            width: "30%",
            hideModalFooter: true,
            enableClose: false,
          });
        } else {
          setCurrentFamily(newValue);
          setFieldValue("caseWorker", caseWorkerId);
          setDisableCaseWorker(true);
        }
      } else {
        setDisableCaseWorker(false);
      }
    } else {
      setDisableCaseWorker(false);
    }
  })

  useEffect(() => {
    if (childDetails?.HTFamilyId  && familyList?.length > 0) {
      setCurrentFamily(childDetails?.HTFamilyId)
      const caseWorkerId = familyList.find((family) => family.id === childDetails?.HTFamilyId)?.caseworkerId;
      if (caseWorkerId) {
        setDisableCaseWorker(true);
      } else {
        setDisableCaseWorker(false);
      }
    }
  }, [childDetails,familyList])

  const handleFamilyChildCaseReassign = async (familyId, caseworkerId) => {
    let payload = {
      id: familyId || null,
      TWUserId: caseworkerId || null,
    };
    try {
      await APIS.UpdateCaseWorker(payload).then((res) => {
        if (res && res.data && res.status === 200) {
        }
      });
    } catch (err) {
      toast.error(t("common:common.Something went wrong"));
    }

  };

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

  useAuthorization(signedinUserRoleHT, signedinUserRoleFS, signedinOrgType, "AddChild", true);

  const stringToDate = (dateString) => {
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
    const offset = yourDate.getTimezoneOffset();
    yourDate = new Date(yourDate.getTime() - offset * 60 * 1000);
    return yourDate.toISOString().split("T")[0];
  };

  const getDateFromObject = (dateToFormat = null) => {
    let yourDate;
    if (dateToFormat === null) {
      yourDate = new Date();
    } else {
      yourDate = new Date(dateToFormat);
    }
    let formatedDate = moment(yourDate).format("YYYY-MM-DD")
    return formatedDate;
  };

  const hiddenFileInput = useRef(null);

  const handleClick = (event) => {
    hiddenFileInput.current.click();
  };

  const handleChangeFile = (event) => {
    let filenames = event.target.files[0]?.name.split(".");
    if (filenames) {
      let extension = filenames[filenames.length - 1];
      if (allowedExtendions.has(extension.toLowerCase())) {
        const fileUploaded = URL.createObjectURL(event.target.files[0]);
        setUploadedFile(event.target.files[0]);
        setUploadedFileURL(fileUploaded);
      } else {
        toast.error("File format not supported");
      }
    }
  };

  const getSignedURL = async (profileImage, childId, existingKey) => {
    let key = generateUniqueKeyForImage(profileImage?.name);
    try {
      let payload = {
        key: childId + "/" + key,
        module: "HT_CHILD",
      };
      const data = await APIS.generateFileUploadURL(payload);
      if (data && data?.data && data?.data?.data) {
        const response = await fileUpload(profileImage, data?.data?.data);
        if (response.status === 200) {
            await updateImageOnDB(key, childId, profileImage);
        } else {
          console.log("something went wrong!");
        }
      } else {
        console.log("something went wrong!");
      }
    } catch (e) {
      console.log(e);
    }
  };

  const updateImageOnDB = useCallback(async (key, id, profileImage) => {
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
      const data = await APIS.AddChildDocument(finalPayload);
      if (data && data?.status === 200) {
        console.log("successfully updated!");
      } else {
        console.log("something went wrong!");
      }
    } catch (err) {
      console.error(err);
    }
  }, []);

  const getOrgDetails = useCallback(async (values, setFieldValue) => {
    setCciData(null);
    if (values.organization_name !== "") {
      if (values.childCurrentPlacement === "1") {
        setLoading(true);
        try {
          //values.country ='1'
          let data = await APIS.OrganisationDetails(values.organization_name);
          let orgData = data.data.data;
          if (orgData?.MPCountryId == localStorage.getItem("userRegion")) {
            setCciData(orgData);
            setFieldValue("country", orgData.MPCountryId);
            setFieldValue("state", orgData.MPStateId);
            setFieldValue("district", orgData.MPDistrictId);
            setFieldValue("city", orgData.city);
            setFieldValue("address1", orgData.addressLine1);
            setFieldValue("address2", orgData.addressLine2);
            setFieldValue("zip_code", orgData.zipCode);
            setFieldValue("sameAsFamilyAddress", false);
            values.address1 = orgData.addressLine1;
            values.address2 = orgData.addressLine2;
            values.city = orgData.city;
            values.zip_code = orgData.zipCode;
          }
          setLoading(false);
        } catch (err) {
          console.error(err);
          setLoading(false);
        }
      } else {
        setCciData(null);
      }
    }
  }, []);

  const onRemoveImage = () => {
    setUploadedFileURL(null);
    setUploadedFile(null);
  };

  const getUserList = useCallback(async () => {
    try {
      const payload = {
        rowCount: "10000",
        pageNumber: "1",
        orderByField: [["firstName", "ASC"]],
        globalSearchQuery: "",
        accountId: [signedinOrgId],
        HTUserRoleId: ["4", "5"],
        HTCountryId: localStorage.getItem("userRegion"),
      };
      payload.HTCountryId = localStorage.getItem("userRegion");
      const data = await APIS.ListUsers(payload);
      setUsers(data && data.data && data.data.data);
    } catch (err) {
      console.error(err);
    }
  }, [mounted]);

  useEffect(() => {
    getUserList();
    getFamilyList()
    getStatusChangeReasons()
  }, []);



  const handleCancel = () => {
    if (family && typeof family.onClose === 'function') {
      family.onClose();
    } else {
      navigate(-1);
    }
  };

  const addCase = useCallback(async (childID, caseWorkerId,needToRedirect = false) => {
    let payload = {
      TWUserId: caseWorkerId,
      HTChildId: childID,
    };
    setLoading(true);
    try {
      const res = await APIS.AddCase(payload);
      if (!(res?.data && (res.status === 200 || res.status === 201))) {
        toast.error(t("common:common.Something went wrong"));
      }
      setLoading(false);
      if (needToRedirect) {
        toast.success(t("common:child.Child Added Successfully"));
        navigate("/dashboard/children/")
      }
    } catch (err) {
      console.error(err);
      setLoading(false);
      toast.error(t("common:common.Something went wrong"));
    }
  });

  const editCase = useCallback(async (childID, caseId, caseWorkerId) => {
    let payload = {
      id: caseId,
      TWUserId: caseWorkerId,
      HTChildId: childID,
    };
    try {
      const res = await APIS.EditCase(payload);
      if (!(res?.data && res.status === 200)) {
        toast.error(t("common:common.Something went wrong"));
      }
    } catch (err) {
      console.error(err);
      toast.error(t("common:common.Something went wrong"));
    }
  });

  const removeUploadedProfileImage = useCallback(async (fileId,childId,accountId) => {
    try {
      let finalPayload = {
          "fileId":fileId,
          "childId":childId,
          "TWAccountId":accountId
      };
      await APIS.deleteChildDocument(finalPayload);
    } catch (err) {
      console.error("Error removing profile image:", err);
    }
  }, []);

  const checkDuplicateDebounced = useCallback(
    debounce(async (firstname, lastname, birthdate,setFieldError) => {
      if (firstname && birthdate) {
        const payload = {
          "id": childId || '',
          "firstName": firstname,
          "lastName": lastname,
          "birthDate": getDateFromObject(birthdate)
        }
        const { data } = await APIS.CheckDuplicateChild(payload);
        if (data == "CHILD_EXIST") {
          ChildExistPopUp(setFieldError)
        }
      }
    }, 800),
    []
  );

  const HandleChilExistPopupClose =(close,setFieldError)=>{
    close()
    setFieldError("firstname", t("common:warnings.childAlreadyExist"));
    const errorField = document.querySelector(".Mui-error, [data-error]");
    (errorField?.parentElement ?? errorField)?.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });
  }

  const ChildExistPopUp = (setFieldError) => {
    return (ModalService.open(({ close }) =>
      <Box>
        <Typography variant="body1" paragraph>
          <Trans
            i18nKey="common:child.ChildExistsMessage1"
            components={{ strong: <strong /> }}
          />
        </Typography>
        <Typography variant="body1" paragraph>
          {t("common:child.ChildExistsMessage2")}
        </Typography>
        <Typography variant="body1" paragraph>
          {t("common:child.ChildExistsMessage3")}
        </Typography>
        <Button
          variant="contained"
          color="primary"
          fullWidth
          sx={{ mt: 2 }}
          onClick={() => HandleChilExistPopupClose(close,setFieldError)}
        >
          {t("common:common.Close")}
        </Button>
      </Box>,
      {
        modalTitle: t("common:child.Child already exists"),
        width: "25%",
        hideModalFooter: true,
        enableClose: false,
      }))
    }


    const checkForPrimaryContact = async () => {
      setLoading(true)
      try {
          await APIS.checkChildIsPrimaryContactOfFamily(childId).then((res) => {
            if (res.status === 200 && res?.data?.status !== "OK") {
              setChildIsPrimaryContact(true);
               }
          })  
        setLoading(false)
      } catch (err) {
        toast.error(t("common:common.Something went wrong"));
        setLoading(false)
      }
    };

  const checkCanDeactivateChild = async (familyId) => {
    setLoading(true)
    try {
      await APIS.checkDeactivationAllowed(childId, familyId ?? "", "CHILD").then((res) => {
        if (res.status === 200 && res?.data?.Message !== "OK") {
          setChildCanDecativate(true);
        }
      })
      setLoading(false)
    } catch (err) {
      toast.error(t("common:common.Something went wrong"));
      setLoading(false)
    }
  };

  return (
    <Formik
      enableReinitialize={true}
      initialValues={{
        firstname: childDetails?.firstName || "",
        lastname: childDetails?.lastName || "",
        birthdate: childDetails?.birthDate ? getDate(childDetails.birthDate) : null,
        addedDate: childDetails?.dateOfEntry ? getDate(childDetails.dateOfEntry) : null,
        closedDate: childDetails?.dateOfExit ? getDate(childDetails.dateOfExit) : null,
        genderOption: childDetails
          ? (genderArray.includes(childDetails?.gender) ? childDetails?.gender : "Other")
          : "",
        gender: childDetails?.gender ?? "",
        phone: childDetails?.phoneNumber || "",
        email: childDetails?.email || "",
        language: childDetails?.HTLanguageId || "",
        organization_name: childDetails?.TWAccountId || localStorage.getItem("orgId"),
        childPlacement: childDetails?.HTChildPlacementStatusId || "",
        childStatus: childDetails?.HTChildStatusId || "",
        childEducation: childDetails?.HTChildEducationLevelId || "",
        childEducationSpecify: childDetails?.highestEducationLevel || "",
        childCurrentPlacement: childDetails?.HTChildCurrentPlacementStatusId || "",
        address1: propAddress1 || childDetails?.addressLine1 || "",
        address2: propAddress2 || childDetails?.addressLine2 || "",
        country: propCountry || childDetails?.HTCountryId || localStorage.getItem("userRegion"),
        state: propState || childDetails?.HTStateId || "",
        city: propCity || childDetails?.city || "",
        district: propDistrict || childDetails?.HTDistrictId || "",
        zip_code: propZipCode
          || (childDetails?.zipCode
            ? childDetails?.zipCode?.length > 6
              ? childDetails?.zipCode.slice(0, 5) + "-" + childDetails?.zipCode.slice(5)
              : childDetails?.zipCode
            : "")
        ,
        family: family?.familyId || childDetails?.HTFamilyId || "",
        caseWorker: childDetails?.TWUserId
          || family?.familyCaseWorker
          || ([CASEWORKER].includes(signedinUserRoleHT) && localStorage.getItem("username"))
          || null,
        sameAsFamilyAddress: (() => {
          if (childId && childDetails?.HTFamilyId) {
            const selectedFamily = familyList?.find(f => f.id === (childDetails?.HTFamilyId));
            if (selectedFamily) {
              return (
                (propAddress1 || childDetails?.addressLine1 || "") === (selectedFamily.addressLine1 || "") &&
                (propAddress2 || childDetails?.addressLine2 || "") === (selectedFamily.addressLine2 || "") &&
                (propCity || childDetails?.city || "") === (selectedFamily.city || "") &&
                (propZipCode || childDetails?.zipCode || "") === (selectedFamily.zipCode || "") &&
                (propState || childDetails?.HTStateId || "") === (selectedFamily.HTStateId || "") &&
                (propDistrict || childDetails?.HTDistrictId || "") === (selectedFamily.HTDistrictId || "")
              );
            }
          }
          return (propAddress1 || propAddress2 || propCity || propZipCode || propState || propDistrict || propCountry) ? true : false;
        })(),
        submit: null,
        isActive: childDetails?.isActive,
        checked: childDetails?.isActive,
        reasonId: null,
        otherReasonText: ""
      }}
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
        genderOption: Yup.string()
          .max(255)
          .required(t("common:warnings.Gender is required")),
        gender: Yup.string().max(255),
        language: Yup.string().max(255),
        family: Yup.string().max(255).nullable(),
        organization_name: Yup.string()
          .max(255)
          .required(t("common:warnings.Organization Name is required")),
        childPlacement: Yup.string().max(255),
        childStatus: Yup.string().max(255),
        childEducation: Yup.string().max(255),
        childEducationSpecify: Yup.string().max(255),
        childCurrentPlacement: Yup.string()
          .max(255)
          .when(["checked"], {
            is: (checked) => {
              // Add mode: always required
              if (!childId) return true;
              // Edit mode:
              if (checked) return true; // checked true: required
              // checked false: required only if original value exists
              return !!childDetails?.HTChildCurrentPlacementStatusId;
            },
            then: Yup.string().required(
              t("common:warnings.Current living condition is required")
            ),
            otherwise: Yup.string().nullable(),
          }),
        address1: Yup.string()
          .max(255)
          .required(t("common:warnings.Address Line 1 is required")),
        address2: Yup.string().max(255),
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
        state: Yup.string()
          .max(255)
          .required(t("common:warnings.State is required")),
        email: Yup.string()
          .email(t("common:warnings.Must be a valid email"))
          .max(255),
        phone: Yup.string()
          .test(
            "phone-format-validation",
            t("common:warnings.Invalid Phone number"),
            (value) => validatePhoneNumber(value, phoneRef)
          ),
        caseWorker: Yup.string()
          .max(255)
          .required(t("common:warnings.Case Worker is required"))
          .nullable(),
        reasonId: Yup.object()
        .when(
          ["checked", "isActive"],
          {
            is: (checked, isActive) =>!checked && isActive,
            then: Yup.object().required(t("common:warnings.Status change reason is required")).nullable(),
            otherwise: Yup.object().nullable(),
          }
        ),
        otherReasonText: Yup.string()
          .when(
            "reasonId",
            {
              is: (reasonId) => reasonId?.needAdditionalInfo,
              then: Yup.string().required(t("common:warnings.Status change reason is required")),
              otherwise: Yup.string().nullable(),
            }
          ),
      })}
      onSubmit={async (
        values,
        { resetForm, setErrors, setStatus, setSubmitting,setFieldError }
      ) => {
        let payload = {
          id: childId || "",
          firstName: values.firstname,
          lastName: values.lastname || "",
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
          phoneNumber: values.phone.length > 5 ? values.phone : null,
          email: values?.email || "",
          HTLanguageId: values.language || "",
          TWAccountId: values.organization_name,
          HTChildPlacementStatusId: values.childPlacement || "",
          HTChildStatusId: values.childStatus || null,
          HTChildCurrentPlacementStatusId: values.childCurrentPlacement || "",
          HTChildEducationLevelId: values.childEducation || null,
          highestEducationLevel: values.childEducation === "20" ? values.childEducationSpecify : null,
          addressLine1: values.address1,
          addressLine2: values?.address2 || null,
          zipCode: values?.zip_code,
          HTCountryId: values?.country,
          HTDistrictId: values.district || null,
          HTStateId: values?.state || null,
          city: values?.city,
          HTFamilyId: isNewFromFamily ? null : values?.family || null,
        };

        try {
          setLoading(true);
          if (childId) {
            await APIS.EditChild(payload).then(async(res) => {
              if (res && res.data && res.status === 200) {

                if(childDetails?.isActive !== checked) {
                  const statusPayload = {
                    "id": childId,
                    "isActive": checked,
                    "TWAccountId": `${childDetails.TWAccountId}`,
                    "type": "CHILD_DEACTIVATION",
                    "reason": values.reasonId?.id,
                    "otherReason": values?.otherReasonText
                  };
                  try {
                    await APIS.ChangeChildStatus(statusPayload).then((res) => {
                      if (res.status === 400 && res.body && res.body.Error) {
                        toast.error(res.body.Error);
                      }
                    })
                  } catch (err) {
                    toast.error(
                      t("common:common.Something went wrong")
                    );
                  }
                }
                setLoading(false);
                if (res.data === "CHILD_EXIST") {
                  ChildExistPopUp(setFieldError)
                } else {
                  toast.success(t("common:child.Child Updated Successfully"));
                  getTsChildListData();
                  if (uploadedFile) {
                    getSignedURL(uploadedFile, childDetails.id, childDetails.fileKey);
                  } else if (childDetails?.fileUrl && !uploadedFileURL) {
                    removeUploadedProfileImage(childDetails?.fileId,childDetails.id,childDetails?.TWAccountId);
                  }
                  if (family) {
                    family?.onClose?.()
                    family?.getChildDetails?.([{
                      firstName: payload?.firstName,
                      lastName: payload?.lastName,
                      birthDate: payload?.birthDate,
                      phoneNumber: payload?.phoneNumber,
                      gender: payload?.gender,
                      email: payload?.email,
                      id: childId,
                      isChild: true,
                      isActive: checked,
                    }]);
                  } else {
                    if (values.caseWorker != childDetails?.TWUserId) {
                      if (childDetails?.TWUserId) {
                        editCase(childDetails.id, childDetails.HTCaseId, values.caseWorker);
                      } else {
                        addCase(childDetails.id, values.caseWorker);
                      }
                    }
                    if (payload?.HTFamilyId && values.caseWorker && !disableCaseWorker) {
                      handleFamilyChildCaseReassign(payload?.HTFamilyId, values.caseWorker);
                    }
                    navigate("/dashboard/children/");
                  }
                  resetForm();
                  setStatus({ success: true });
                  setSubmitting(false);
                }
              } else {
                setLoading(false);
                if (res.status === 400) {
                  if (res.data.hasOwnProperty("Error")) {
                    let errorMessage = res.data.Error.split(":");
                    toast.error(errorMessage[errorMessage.length - 1]);
                  } else {
                    toast.error(t("common:common.Something went wrong"));
                  }
                } else {
                  toast.error(t("common:common.Something went wrong"));
                }
                setStatus({ success: false });
                setSubmitting(false);
              }
            });
          } else {
            await APIS.AddChild(payload).then((res) => {
              if (res && res.data && (res.status === 200 || res.status === 201)) {
                setLoading(false);
                getTsChildListData();
                if (res.data === "CHILD_EXIST") {
                  ChildExistPopUp(setFieldError)
                } else {
                  let savedChildId = res.data.childId;
                  !family && addCase(savedChildId, values.caseWorker,true);
                  uploadedFile && getSignedURL(uploadedFile, savedChildId, null);
                  if (family) {
                    toast.success(t("common:child.Child Added Successfully"));
                    family?.onClose?.()
                    family?.getChildDetails?.([{
                      firstName: payload?.firstName,
                      lastName: payload?.lastName,
                      birthDate: payload?.birthDate,
                      phoneNumber: payload?.phoneNumber,
                      email: payload?.email,
                      gender: payload?.gender,
                      id: savedChildId,
                      isChild: true,
                      isActive: true,
                      isExistingChild:false
                    }]);
                    family?.onCloseChildModal()
                  } else {
                    if (payload?.HTFamilyId && values.caseWorker && !disableCaseWorker) {
                      handleFamilyChildCaseReassign(payload?.HTFamilyId, values.caseWorker);
                    }
                  }
                  resetForm();
                  setStatus({ success: true });
                  setSubmitting(false);
                }
              } else {
                setLoading(false);
                if (res.status === 400) {
                  if (res.body.hasOwnProperty("Message")) {
                    toast.error(res.body.Message);
                  }
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
          setLoading(true);
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
        handleReset,
        isSubmitting,
        touched,
        values,
        setFieldValue,
        setFieldError,
        setValues
      }) => {
        if (isSubmitting) {
          const el = document.querySelector(".Mui-error, [data-error]");
          (el?.parentElement ?? el)?.scrollIntoView();
        }
        return (
          <>
            <Loader loading={loading} />
            <Form
              onSubmit={handleSubmit}
              id="add-child-form"
            >
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <Grid container spacing={3} pt={2}>
                  <Grid item md={8} xs={12}>
                    <Card>
                      <Box sx={{ m: 2, mt: 3 }}>
                      <fieldset disabled={!checked && childId} style={{ border: "none", padding: 0 }}>
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
                              onChange={(e) => { handleChange(e); checkDuplicateDebounced(e.target?.value, values?.lastname, values?.birthdate,setFieldError) }}
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
                              onChange={(e) => { handleChange(e); checkDuplicateDebounced(values?.firstname, e.target?.value, values?.birthdate,setFieldError) }}
                              value={values.lastname}
                              variant="outlined"
                              id="last-name"
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
                                id="other-gender"
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
                              disabled={true}
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
                          </Grid>
                          <Grid item md={6} xs={12}>
                            <DatePicker
                              label={t("common:common.Date of Birth")}
                              value={
                                values.birthdate
                                  ? dayjs(values.birthdate)
                                  : null
                              }
                              onChange={(newValue) => {
                                setFieldValue("birthdate", newValue);
                                checkDuplicateDebounced(values?.firstname, values?.lastname, newValue,setFieldError)
                              }}
                              sx={{ width: 1 }}
                              format={DateFormatFromRegion()}
                              maxDate={dayjs().endOf('day')}
                              required={true}
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
                                        {DateFormatFromRegion()}
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
                              error={Boolean(touched.language && errors.language)}
                              fullWidth
                              helperText={touched.language && errors.language}
                              name="language"
                              accessKey="language"
                              component={AutoCompleteDropdown}
                              required={false}
                              label="language"
                              options={htLanguagesList || []}
                              textFieldProps={{
                                fullWidth: true,
                                margin: "normal",
                                variant: "outlined",
                                label: t("common:common.Native Language"),
                              }}
                              id="language"
                            />
                          </Grid>
                          <Grid item md={12} xs={12}>
                            <PhoneTextInput
                              name={`phone`}
                              phoneRef={phoneRef}
                              onBlur={handleBlur}
                              error={Boolean(touched?.phone && errors?.phone)}
                              helperText={touched?.phone && errors?.phone}
                              value={values.phone}
                              onChange={(phone) => setFieldValue("phone", phone)}
                              id="phone"
                              defaultCountry={
                                locationList?.find(
                                  (obj) =>
                                    obj.id ==
                                    localStorage.getItem("userRegion")
                                )?.iso2Code
                              }
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
                                  : null
                              }
                              format={DateFormatFromRegion()}
                              onChange={(newValue) => {
                                setFieldValue("addedDate", newValue);
                              }}
                              sx={{ width: 1 }}
                              minDate={values.birthdate ? dayjs(values.birthdate) : null}
                              maxDate={dayjs().endOf('day')}
                              slotProps={{
                                textField: {
                                  id: "added-date",
                                  error:
                                    touched?.addedDate && Boolean(errors?.addedDate),
                                  helperText: (
                                    <>
                                      <Typography fontSize="0.75rem">
                                        {DateFormatFromRegion()}
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
                                  : null
                              }
                              format={DateFormatFromRegion()}
                              onChange={(newValue) => {
                                setFieldValue("closedDate", newValue);
                              }}
                              sx={{ width: 1 }}
                              minDate={values.addedDate ? dayjs(values.addedDate) : null}
                              slotProps={{
                                textField: {
                                  id: "closed-date",
                                  error:
                                    touched?.closedDate &&
                                    Boolean(errors?.closedDate),
                                  helperText: (
                                    <>
                                      <Typography fontSize="0.75rem">
                                        {DateFormatFromRegion()}
                                      </Typography>
                                      {touched?.closedDate && errors?.closedDate}
                                    </>
                                  ),
                                },
                              }}
                            />
                            </Grid>
                            <Grid item md={6} xs={12} sx={{ mt: -2 }}>
                              {(family?.familyId &&
                                contextFamilyList?.filter((family) => family.id === childDetails?.HTFamilyId)?.isActive)
                                || ((!(Boolean(family))) && !childId) || ((!(Boolean(family))) && childId &&
                                  (checked || contextFamilyList?.filter((family) => family.id === childDetails?.HTFamilyId)?.isActive)) ?
                                <Field
                                  error={Boolean(touched.family && errors.family)}
                                  fullWidth
                                  helperText={touched.family && errors.family}
                                  name="family"
                                  accessKey="familyName"
                                  component={AutoCompleteDropdown}
                                  getFamilyDetails={(neValue) => {
                                    getFamilyDetails(values, neValue, setFieldValue);
                                    // If checkbox is checked, update address fields to new family's address
                                    if (!neValue) {
                                      setValues({
                                        ...values,
                                        family: '',
                                        sameAsFamilyAddress: false,
                                        address1: '',
                                        address2: '',
                                        city: '',
                                        zip_code: '',
                                        state: '',
                                        district: '',
                                      });
                                    } else {
                                      // If checkbox is already checked, or this is the first selection (was unchecked), check and populate
                                      const selectedFamily = familyList.find(f => f.id === (neValue?.id || neValue));
                                      if (selectedFamily) {
                                        setValues({
                                          ...values,
                                          family: neValue,
                                          sameAsFamilyAddress: true,
                                          address1: selectedFamily.addressLine1 || '',
                                          address2: selectedFamily.addressLine2 || '',
                                          city: selectedFamily.city || '',
                                          zip_code: selectedFamily.zipCode || '',
                                          state: selectedFamily.HTStateId || '',
                                          district: selectedFamily.HTDistrictId || '',
                                          caseWorker:familyList?.find((family) => family.id === neValue)?.caseworkerId
                                        });
                                      }
                                    }
                                  }}
                                  label="family"
                                  disabled={family?.familyId ? true : false}
                                  options={familyList}
                                  textFieldProps={{
                                    fullWidth: true,
                                    margin: "normal",
                                    variant: "outlined",
                                    label: t("common:common.Choose Family"),
                                  }}
                                  id="family"
                                /> : <TextField
                                  fullWidth
                                  label={t("common:common.Choose Family")}
                                  name="family_name"
                                  onBlur={handleBlur}
                                  disabled={true}
                                  sx={{ mt: 2 }}
                                  value={family?.familyName || childDetails?.familyName || ""}
                                  variant="outlined"
                                  id="family_name"
                                />}
                            </Grid>

                          <Grid item md={6} xs={12} sx={{ mt: -2 }}>
                            <Field
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
                              getOrgDetails={() =>
                                getOrgDetails(values, setFieldValue)
                              }
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
                              id="organization-name"
                            />
                          </Grid>

                          <Grid item md={6} xs={12} sx={{ mt: -2 }}>
                            <Field
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
                              id="child-status"
                            />
                          </Grid>

                          <Grid item md={6} xs={12} sx={{ mt: -2 }}>
                            <Field
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
                              id="child-placement"
                            />
                          </Grid>

                          <Grid item md={6} xs={12} sx={{ mt: -2 }}>
                            <Field
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
                              getOrgDetails={() =>
                                getOrgDetails(values, setFieldValue)
                              }
                              component={AutoCompleteDropdown}
                              required={true}
                              label="childCurrentPlacement"
                              options={childCurrentPlacementList}
                              textFieldProps={{
                                fullWidth: true,
                                margin: "normal",
                                variant: "outlined",
                                label: t("common:common.Current Placement"),
                              }}
                              id="current-placement"
                            />
                          </Grid>
                          <Grid item md={6} xs={12} sx={{ mt: -2 }}>
                            <Field
                              error={Boolean(
                                touched.caseWorker && errors.caseWorker
                              )}
                              fullWidth
                              helperText={touched.caseWorker && errors.caseWorker}
                              name="caseWorker"
                              accessKey1="firstName"
                              accessKey2="lastName"
                              component={AutoCompleteDropdownMultiNames}
                              disabled={[CASEWORKER].includes(signedinUserRoleHT) || family || disableCaseWorker}
                              required={true}
                              label="caseWorker"
                              options={users || []}
                              textFieldProps={{
                                fullWidth: true,
                                margin: "normal",
                                variant: "outlined",
                                label: t("common:common.Case Worker"),
                              }}
                              id="case-worker"
                            />
                          </Grid>

                          <Grid item md={6} xs={12} sx={{ mt: -2 }}>
                            <Field
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
                              id="child-education"
                            />
                          </Grid>

                          <Grid item md={6} xs={12}>
                            {values.childEducation === "20" ? (
                              <TextField
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
                                id="child-education-other"
                              ></TextField>
                            ) : (
                              <></>
                            )}
                          </Grid>
                          <Divider />
                          <Grid item md={12} xs={12}>
                            <Typography color="textSecondary" variant="subtitle2">
                              {t("common:common.Address")}
                            </Typography>
                          </Grid>
                          <Grid item md={12} xs={12}>
                            <Box display="flex" alignItems="center" mb={1}>
                              <CustomCheckbox
                                id="sameAsFamilyAddress"
                                name="sameAsFamilyAddress"
                                checked={values.sameAsFamilyAddress || false}
                                disabled={!(values.family || propAddress1 || propAddress2 || propCity || propZipCode || propState || propDistrict || propCountry)}
                                onChange={e => {
                                  const checked = e.target.checked;
                                  setFieldValue('sameAsFamilyAddress', checked);
                                  if (checked) {
                                    // If checked, fill from selected family if available
                                    const selectedFamily = familyList.find(f => f.id === (values.family?.id || values.family));
                                    if (selectedFamily) {
                                      setValues({
                                        ...values,
                                        sameAsFamilyAddress: true,
                                        address1: selectedFamily.addressLine1 || '',
                                        address2: selectedFamily.addressLine2 || '',
                                        city: selectedFamily.city || '',
                                        zip_code: selectedFamily.zipCode || '',
                                        state: selectedFamily.HTStateId || '',
                                        district: selectedFamily.HTDistrictId || '',
                                      });
                                    } else if(propState || propCountry || propDistrict || propAddress1 || propAddress2 || propCity || propZipCode) {
                                      setValues({
                                        ...values,
                                        sameAsFamilyAddress: true,
                                        address1: propAddress1 || '',
                                        address2: propAddress2 || '',
                                        city: propCity || '',
                                        zip_code: propZipCode || '',
                                        state: propState || '',
                                        district: propDistrict || '',
                                      });
                                    } else {
                                      // If no family selected, just keep checkbox checked, don't fill fields
                                      setValues({
                                        ...values,
                                        sameAsFamilyAddress: true
                                      });
                                    }
                                  } else {
                                    // Always clear address fields if unchecked
                                    setValues({
                                      ...values,
                                      sameAsFamilyAddress: false,
                                      address1: '',
                                      address2: '',
                                      city: '',
                                      zip_code: '',
                                      state: '',
                                      district: '',
                                    });
                                  }
                                }}
                                style={{ marginRight: 8, cursor: 'pointer' }}
                              />
                              <label style={{ userSelect: 'none', fontWeight: 500 }}>
                                {t("common:common.Child's address is the same as family's address", "Child's address is the same as family's address")}
                              </label>
                            </Box>
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
                              options={
                                getStateList(locationList, values.country) || []
                              }
                              textFieldProps={{
                                fullWidth: true,
                                margin: "normal",
                                variant: "outlined",
                                label: t("common:common.State"),
                              }}
                              id="state"
                            />
                          </Grid>

                          {values.country &&
                            getSelectedCountryDetails(
                              locationList,
                              values.country
                            )?.districtRequired && (
                              <Grid item md={6} xs={12} sx={{ mt: -2 }}>
                                <Field
                                  error={Boolean(
                                    touched.district && errors.district
                                  )}
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
                                  id="region"
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
                              value={(!(values.family && values.sameAsFamilyAddress) && cciData?.city) ? cciData?.city : values.city}
                              variant="outlined"
                              id="city"
                            />
                          </Grid>
                          <Grid item md={6} xs={12}>
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
                              value={
                                (values.family && !values.sameAsFamilyAddress && cciData?.zipCode)
                                  ? cciData?.zipCode
                                  : values.zip_code
                              }
                              id="zip"
                            />
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
                              value={
                                (values.family && !values.sameAsFamilyAddress && cciData?.addressLine1)
                                  ? cciData?.addressLine1
                                  : values.address1
                              }
                              variant="outlined"
                              id="address1"
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
                              value={
                                (values.family && !values.sameAsFamilyAddress && cciData?.addressLine2)
                                  ? cciData?.addressLine2
                                  : values.address2
                              }
                              variant="outlined"
                              id="address2"
                            />
                          </Grid>
                        </Grid>
                        </fieldset>
                        {childDetails && <Grid item my={2}>
                          <Grid item md={6} xs={12}>
                            <Typography
                              color="textPrimary"
                              gutterBottom
                              variant="subtitle2"
                            >
                              {t("common:child.Child Status")}
                            </Typography>
                            <Box sx={{ display: "flex", flex: 1, alignItems: "center" }}>
                              <Box>
                                <CustomSwitch
                                  id="status"
                                  size="small"
                                  color="orange"
                                  checked={checked}
                                  disabled={(childIsPrimaryContact || childCanDeactivate) && childDetails?.isActive}
                                  onChange={() => {
                                    setFieldValue("reasonId", null);
                                    setFieldValue("otherReasonText", "")
                                    setFieldValue("checked", !checked);
                                    setChecked(!checked);                                    
                                  }}
                                />
                              </Box>
                              <Box>
                                <Typography
                                  color={checked ? "#43AA8B" : "#F94144"}
                                  variant="h6"
                                  sx={{ marginRight: 1 }}
                                >
                                  {checked
                                    ? `${t("common:common.ACTIVE")}`
                                    : `${t("common:common.INACTIVE")}`}
                                </Typography>
                              </Box>
                              {childIsPrimaryContact ? (
                                <Tooltip
                                  title={t("common:child.This child is the primary contact of a family")}
                                >
                                  <InformationCircleIcon
                                    sx={{ marginLeft: 0.5 }}
                                    fontSize="small"
                                  />
                                </Tooltip>
                              ) : childCanDeactivate && childDetails?.isActive ? (
                                <Tooltip
                                  title="Child cannot be deactivated as there are pending assessments or progress reports."
                                >
                                  <InformationCircleIcon
                                    sx={{ marginLeft: 0.5 }}
                                    fontSize="small"
                                  />
                                </Tooltip>
                              ) : null}
                            </Box>
                          </Grid>
                        </Grid>}
                        {childDetails?.isActive &&!checked && <Grid item container spacing={2}>
                          <Grid item md={12}>
                            <Autocomplete
                              id="deactivation-reason"
                              name="reasonId"
                              options={statusChangeReasons}
                              sx={{ width: 1 }}
                              isOptionEqualToValue={(option, value) =>
                                option.value === value
                              }
                              getOptionLabel={(option) => option.reason}
                              onChange={(_, newValue) =>
                                setFieldValue("reasonId", newValue || "")
                              }
                              renderInput={(params) => (
                                <TextField
                                  {...params}
                                  required
                                  label={t("common:common.Status change reason")}
                                  error={
                                    touched?.reasonId && Boolean(errors?.reasonId)
                                  }
                                  helperText={touched?.reasonId && errors?.reasonId}
                                />
                              )}
                            />
                          </Grid>
                          {values?.reasonId?.needAdditionalInfo &&<Grid item md={12}>
                            <TextField
                              error={Boolean(touched.otherReasonText && errors.otherReasonText)}
                              fullWidth
                              helperText={touched.otherReasonText && errors.otherReasonText}
                              label={t("common:common.Status change reason")}
                              name="otherReasonText"
                              onBlur={handleBlur}
                              onChange={handleChange}
                              value={ values.otherReasonText
                              }
                              variant="outlined"
                              id="otherReasonText"
                              required
                            />
                          </Grid>}
                        </Grid>}
                        <Box
                          sx={{
                            mt: 2,
                            display: "flex",
                            flexDirection: "row",
                            gap: 1.5,
                          }}
                        >
                          <Button
                            color="primary"
                            disabled={isSubmitting}
                            type="submit"
                            variant="contained"
                            onClick={handleSubmit}
                            id="submit"
                          >
                            {t("common:common.Save")}
                          </Button>

                          <Button
                            color="primary"
                            disabled={isSubmitting}
                            type="reset"
                            variant="outlined"
                            onClick={() => {
                              handleCancel();
                            }}
                            id="reset"
                          >
                            {t("common:common.Cancel")}
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
                                src={uploadedFileURL}
                                alt="Profile"
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
                        <fieldset disabled={!checked && childId} style={{ border: "none", padding: 0 }}>
                          <Grid item md={12} xs={12} sx={{ mt: 3 }}>
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                              }}
                            >
                              <Button
                                color="primary"
                                sx={{ height: 40, ml: uploadedFile ? 2 : 0 }}
                                type="button"
                                variant="contained"
                                onClick={handleClick}
                                style={{
                                  backgroundColor: theme.palette.button.primary,
                                  lineHeight: 1.5
                                }}
                                id="image-button"
                              >
                                {uploadedFile
                                  ? t("common:common.Change Image")
                                  : t("common:common.Select Image")}
                              </Button>
                              <input
                                type="file"
                                id="myfile"
                                name="myfile"
                                accept="image/png, image/gif, image/jpeg,image/jpg"
                                ref={hiddenFileInput}
                                onChange={handleChangeFile}
                                style={{ display: "none" }}
                              />
                              {(uploadedFile || uploadedFileURL) && (
                                <Button
                                  color="primary"
                                  sx={{ width: 150, height: 40, ml: 2 }}
                                  disabled={isSubmitting}
                                  type="button"
                                  variant="contained"
                                  onClick={onRemoveImage}
                                  style={{
                                    backgroundColor: theme.palette.button.primary,
                                    lineHeight: 1.5
                                  }}
                                  id="remove-image"
                                >
                                  {t("common:common.Remove Image")}
                                </Button>
                              )}
                            </div>
                          </Grid>
                        </fieldset>
                      </Box>
                    </Card>
                  </Grid>
                </Grid>
              </LocalizationProvider>
            </Form>
          </>
        );
      }}
    </Formik>
  );
};

export default AddChildForm;
