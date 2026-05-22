import React, {
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react"; // Added missing hooks
import { Formik, Form } from "formik"; // Corrected Formik imports
import * as Yup from "yup"; // Added Yup import
import { Trans, useTranslation } from "react-i18next";
import { Box, Button, Grid, Stack, Typography } from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";

// Components
import DynamicForm from "../../../../TWFamily/ManageFamily/Components/DynamicForm";
import SubHeading from "../../../../../components/SubHeading/SubHeading";
import CommonAccordion from "../../../../../components/CommonAccordion/CommonAccordion";
import ChildFormFooter from "./ChildFormFooter";

// Configs
import {
  CaseManagementDetails,
  ChildAdditionalDetails,
  ChildAddressConditionalFields,
  ChildBasicDetails,
  ChildContactDetails,
} from "./ChildFormConfig";
import { CommonDataContext } from "../../../../../common/contexts/CommonDataContext";
import APIS from "../../../../../common/hooks/UseApiCalls";
import useMounted from "../../../../../common/hooks/UseMounted";
import { dateFormatter, MonthDayYearFormatter } from "../../../../../constants";
import dayjs from "dayjs";
import { useDebouncedCallback } from "use-debounce";
import { ModalService } from "../../../../../components/Modal";
import DeleteChild from "./DeleteChild";
import Heading from "../../../../../components/Heading";
import CloseIcon from "@mui/icons-material/Close";
import FamilyChangeModal from "./FamilyChangeModal";
import toast from "react-hot-toast";
import Loader from "../../../../../components/UserComponents/Loader";
import { PhoneNumberUtil } from "google-libphonenumber";
import { validatePhoneNumber } from "../../../../../helpers/helperFunction";
import _, { first } from "lodash";

const userRegion = localStorage.getItem("userRegion");
const phoneUtil = PhoneNumberUtil.getInstance();

const ManageChildForm = ({
  handleChildModalOpen,
  setHideChildModal,
  id,
  openForEdit,
  onCaseChange,
  getMemberDetails = null,
  childInfo,
  isFromFamily = false,
  refreshTable,
  refreshData,
  hideChildModal
}) => {
  const { t } = useTranslation(["common"]);
  const [isLoading, setIsLoading] = useState(false); // Defined missing state
  const mounted = useMounted();
  // Refs for tracking form state (used in your scroll/dirty logic)
  const initialValuesRef = useRef({});
  const valuesRef = useRef({});
  const isFormDirtyRef = useRef(false);
  const { childDropdownLists, locationList, htLanguagesList, fsLanguagesList } =
    useContext(CommonDataContext);
  const [users, setUsers] = useState([]);
  const [familyList, setFamilyList] = useState([]);
  const [childDetails, setChildDetails] = useState(null);
  const StateList =
    locationList?.find((loc) => loc.id == userRegion)?.states || [];
  const [isEditing, setIsEditing] = useState(false);
  const [isUniqueChild, setIsuniqueChild] = useState(true);
  const phoneRef = useRef({});

  useEffect(() => {
    if (id) {
      getChildDetails();
    }
    if (isFromFamily && childInfo && !id) {
      setChildDetails(childInfo);
    }
  }, [id, isFromFamily, childInfo]);

  const handleResponse = useCallback(
    (payload) => {
      getMemberDetails?.(payload);
      handleChildModalOpen();
    },
    [getMemberDetails, handleChildModalOpen],
  );

  useEffect(() => {
    if (openForEdit) {
      setIsEditing(true);
    }
  }, [openForEdit]);

  const getChildDetails = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await APIS.GetChildDetails(id);
      setChildDetails(res.data?.data); // Assuming API returns child details in res.data
      // Map API response to form values and set them (not implemented here)
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  const getUserList = useCallback(async () => {
    try {
      setIsLoading(true);
      const payload = {
        rowCount: "10000",
        pageNumber: "1",
        orderByField: [["firstName", "ASC"]],
        globalSearchQuery: "",
        accountId: [localStorage.getItem("orgId")],
        HTUserRoleId: ["4", "5"],
        FSUserRoleId: ["4", "5"],
        TWCountryId: localStorage.getItem("userRegion"),
      };
      const data = await APIS.ListUsers(payload);
      setUsers(data && data.data && data.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [mounted]);

  const getFamilyList = useCallback(async () => {
    try {
      setIsLoading(true);
      let getFamListpayload = {
        rowCount: 10000,
        listType: "MEDIUM",
        pageNumber: 1,
        // filters: {
        //   caseworkerId: "0070aefc-6cba-4afe-a855-22e563d7b6f7",
        //   isActive: true,
        // },
        globalSearchQuery: "",
        orderByField: [["noOfChildren", "DESC"]],
      };
      const res = await APIS.GetFamilyList(getFamListpayload);
      setFamilyList(
        res.data?.data.map((family) => ({
          id: family.id,
          value: family.familyName,
          caseWorkerId: family.caseworkerId,
        })) || [],
      ); // Assuming API returns family list in res.data.data
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleSameAddressChange = async ({
    checked,
    values,
    setFieldValue,
  }) => {
    // If the checkbox is checked, clear the address fields
    if (checked) {
      try {
        setIsLoading(true);
        const res = await APIS.GetFamilyDetails({
          id: values.TWFamilyId,
          listType: "DETAILED",
        });
        const familyData = res.data?.data?.contactInformation;
        if (familyData) {
          setFieldValue(
            "contactInformation.addressLine1",
            familyData.addressLine1 || "",
          );
          setFieldValue(
            "contactInformation.addressLine2",
            familyData.addressLine2 || "",
          );
          setFieldValue("contactInformation.city", familyData.city || "");
          setFieldValue(
            "contactInformation.TWStateId",
            familyData.TWStateId || "",
          );
          setFieldValue("contactInformation.zipCode", familyData.zipCode || "");
        }
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
      // Clear address fields logic here
    } else {
      setFieldValue("contactInformation.addressLine1", null);
      setFieldValue("contactInformation.addressLine2", null);
      setFieldValue("contactInformation.city", null);
      setFieldValue("contactInformation.TWStateId", null);
      setFieldValue("contactInformation.zipCode", null);
    }
  };

  useEffect(() => {
    getUserList();
    getFamilyList();
    // getStatusChangeReasons()
  }, []);

  const handleFamilyChange = async ({ data, setFieldValue }) => {
    if (
      childDetails?.TWFamilyId &&
      childDetails.TWFamilyId !== data?.TWFamilyId
    ) {
      setHideChildModal(true);
      ModalService.open(
        ({ close }) => (
          <FamilyChangeModal
            close={close}
            onFamilyChangeConfirm={onFamilyChangeConfirm}
            onFamilyChangeCancel={onFamilyChangeCancel}
            setFieldValue={setFieldValue}
            setHideChildModal={setHideChildModal}
            // closeEditForm={closeEditForm}
            // onCaseClose={onCaseChange}
            // childId={childId}
          />
        ),
        {
          modalTitle: t(
            "common:common.Change family assignment?",
            "Change family assignment?",
          ),
          width: "40%",
          hideModalFooter: true,
          enableClose: true,
          height: "95%",
        },
      );
    }
    setFieldValue("caseWorkerId", data?.caseWorkerId);
  };

  const onFamilyChangeConfirm = ({ setFieldValue, familyChangeValues }) => {
    setFieldValue(
      "familyChangeDetails.childDischargedDate",
      new Date(
        familyChangeValues?.familyChangeDetails?.childDischargedDate,
      ).toISOString(),
    );
    setFieldValue(
      "familyChangeDetails.childDischargeReason",
      familyChangeValues?.familyChangeDetails?.childDischargeReason,
    );
    setFieldValue(
      "familyChangeDetails.otherReason",
      familyChangeValues?.familyChangeDetails?.otherReason,
    );
    setFieldValue("familyChangeDetails.previousFamilyCutoffDaysCount", 0);
    handleSameAddressChange({
      checked: valuesRef.current?.isSameAsFamilyAddress,
      values: valuesRef.current,
      setFieldValue,
    });
    setHideChildModal(false);
  };

  const onFamilyChangeCancel = (setFieldValue) => {
    setFieldValue("TWFamilyId", childDetails?.TWFamilyId);
    setFieldValue("familyChangeDetails", null);
  };

  const uniqueCheckHandler = useDebouncedCallback(
    async ({ key, value, values, setFieldError }) => {
      // Only check if all required fields are present
      if (values?.firstName && values.gender && values.dateOfBirth) {
        try {
          // Handle key logic for all relevant fields
          let firstName = values.firstName;
          let lastName = values.lastName;
          let birthDate = values.dateOfBirth;
          let gender = values.gender;
          if (key === "firstName") firstName = value;
          else if (key === "lastName") lastName = value;
          else if (key === "dateOfBirth") birthDate = value;
          // else if (key === "gender") gender = value;

          const res = await APIS.CheckUniqueChild({
            id: id || null,
            firstName,
            lastName,
            birthDate,
            gender
          });
          const isUnique = res.data?.data?.isUnique;
          if (!isUnique) {
            ChildExistPopUp(setFieldError);
          }
        } catch (error) {
          console.error("Unique check error:", error);
        }
      }
    },
    800,
  );

  const ChildExistPopUp = (setFieldError) => {
    return ModalService.open(
      ({ close }) => (
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
            onClick={() => HandleChilExistPopupClose(close, setFieldError)}
          >
            {t("common:common.Close")}
          </Button>
        </Box>
      ),
      {
        modalTitle: t("common:child.Child already exists"),
        width: "25%",
        hideModalFooter: true,
        enableClose: false,
      },
    );
  };

  const HandleChilExistPopupClose = (close, setFieldError) => {
    close();
    setFieldError("firstName", t("common:warnings.childAlreadyExist"));
    const errorField = document.querySelector(".Mui-error, [data-error]");
    (errorField?.parentElement ?? errorField)?.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });
  };

  const deleteChildClickHandler = () => {
    ModalService.open(({ close }) => <DeleteChild close={close} />, {
      modalTitle: t("common:infoCard.Delete this child?", "Delete this child?"),
      width: "35%",
      hideModalFooter: true,
      enableClose: false,
    });
  };

  const getChangedValues = (values, initialValues) => {
    const changedValues = {};
    let hasChange = false;

    Object.keys(values).forEach((key) => {
      const value = values[key];
      const initialValue = initialValues[key];

      if (
        value !== null &&
        typeof value === "object" &&
        !Array.isArray(value)
      ) {
        // Deep compare for nested objects
        const nestedChanged = getChangedValues(value, initialValue || {});
        if (Object.keys(nestedChanged).length > 0) {
          changedValues[key] = nestedChanged;
          hasChange = true;
        }
      } else {
        const newValue = value === "" ? null : value;
        const oldValue = initialValue === "" ? null : initialValue;
        if (newValue !== oldValue) {
          changedValues[key] = newValue;
          hasChange = true;
        }
      }
    });

    // Only return changedValues if there is any change
    return hasChange ? changedValues : {};
  };

  const reOpenCaseHandler = async () => {
    try {
      const res = await APIS.ReOpenChidCase({ childId: id });
      if (res?.status === 200) {
        handleChildModalOpen(); // Close the current form/modal
        if (refreshTable) refreshTable(); // Callback to parent to refresh data or update UI
        if (refreshData) refreshData(); // Refresh child details if callback provided
        ModalService.open(() => null, {
          width: "30%",
          modalDescription: (
            <SubHeading
              value={t(
                "common:common.This child’s case has been re-opened",
                "This child’s case has been re-opened",
              )}
            />
          ),
          hideActionButton: true,
          cancelButtonText: t("common:common.ok", "Ok"),
        });
      }
    } catch (error) {
      console.error("Error re-opening case:", error);
    } finally {
    }
  };

  const onCloseCaseHandler = () => {
    if (refreshTable) refreshTable(); // Callback to parent to refresh data or update UI
    if (refreshData) refreshData(); // Refresh child details if callback provided
  };

  return (
    <Formik
      enableReinitialize={true}
      validateOnChange={true}
      validateOnBlur={true}
      initialValues={{
        // Basic Details
        firstName: childDetails?.firstName || null,
        lastName: childDetails?.lastName || null,
        gender: childDetails?.gender || null,
        dateOfBirth: childDetails?.dateOfBirth || null,
        TWFamilyId: childDetails?.TWFamilyId || null,
        TWChildCurrentPlacementStatusId:
          childDetails?.TWChildCurrentPlacementStatusId || null,
        caseWorkerId: childDetails?.caseWorkerId || null,
        childHasDisability: childDetails?.childHasDisability || false,
        isSameAsFamilyAddress: childDetails?.isSameAsFamilyAddress || false,
        isNewFamily: childInfo?.isNewFamily || false,
        // Contact Details
        contactInformation: {
          TWCountryId:
            childDetails?.contactInformation?.TWCountryId ||
            localStorage.getItem("userRegion"),
          TWStateId: childDetails?.contactInformation?.TWStateId || null, // From commented dropdown
          TWDistrictId: childDetails?.contactInformation?.TWDistrictId || null,
          addressLine1: childDetails?.contactInformation?.addressLine1 || null,
          addressLine2: childDetails?.contactInformation?.addressLine2 || null,
          city: childDetails?.contactInformation?.city || null,
          zipCode: childDetails?.contactInformation?.zipCode || null,
        },
        // Additional Details
        profileInformation: {
          phoneNumber: childDetails?.profileInformation?.phoneNumber || "", // From commented PhoneNumber
          email: childDetails?.profileInformation?.email || null,
          TWLanguageId: childDetails?.profileInformation?.TWLanguageId || null, // From commented dropdown
          ethnicity: childDetails?.profileInformation?.ethnicity || null,
          TWChildEducationLevelId:
            childDetails?.profileInformation?.TWChildEducationLevelId || null, // From commented dropdown
          highestEducationLevel:
            childDetails?.profileInformation?.highestEducationLevel || null,
          allergy: childDetails?.profileInformation?.allergy || null,
          notes: childDetails?.profileInformation?.notes || null,
        },
        // Case Management
        caseManagementInformation: {
          dateOfEntry:
            childDetails?.caseManagementInformation?.dateOfEntry || null,
          dateOfCWSEntry:
            childDetails?.caseManagementInformation?.dateOfCWSEntry || null, // From commented Date of CWS entry
          TWChildPlacementStatusId:
            childDetails?.caseManagementInformation?.TWChildPlacementStatusId || null, // From commented dropdown
          level: childDetails?.caseManagementInformation?.level || null,
          medicaidNumber:
            childDetails?.caseManagementInformation?.medicaidNumber || null,
          placementId:
            childDetails?.caseManagementInformation?.placementId || null,
          previousPlacementsCount:
            childDetails?.caseManagementInformation?.previousPlacementsCount ||
            null, // From commented # of previous placements
        },
        familyChangeDetails: {
          childDischargedDate: null,
          childDischargeReason: null,
          otherReason: null,
        },
      }}
      validationSchema={Yup.object().shape({
        // Basic Details
        firstName: Yup.string()
          .required(
            t(
              "common:warnings.First Name is required",
              "First Name is required",
            ),
          )
          .max(255)
          .nullable(),
        lastName: Yup.string().max(255).nullable(),
        gender: Yup.string()
          .required(
            t("common:warnings.Gender is required", "Gender is required"),
          )
          .nullable(),
        dateOfBirth: Yup.string()
          .required(
            t(
              "common:warnings.Date of birth is required",
              "Date of birth is required",
            ),
          )
          .typeError("Invalid date")
          .test(
            "is-not-future-date",
            t(
              "common:warnings.Date of birth cannot be in the future",
              "Date of birth cannot be in the future"
            ),
            (value) => {
              if (!value) return true; // Allow empty values to be handled by required
              return dayjs(value).isBefore(dayjs(), "day");
            }
          )
          .nullable(),
        TWFamilyId: Yup.string().nullable(),
        caseWorkerId: Yup.string()
          .required(
            t(
              "common:warnings.Case worker is required",
              "Case worker is required",
            ),
          )
          .nullable(),
        childHasDisability: Yup.boolean(),

        // Contact Details
        isSameAsFamilyAddress: Yup.boolean(),
        contactInformation: Yup.object().shape({
          addressLine1: Yup.string().max(255).nullable(),
          addressLine2: Yup.string().max(255).nullable(),
          TWStateId: Yup.string().max(255).nullable(),
          city: Yup.string().max(255).nullable(),
          zipCode: Yup.string()
            .test(
              "zip-format-validation",
              "Please enter a valid ZIP code",
              (value) => {
                if (!value) return true; // Only validate if there is a value
                if (userRegion == "1") {
                  return /^\d{6}$/.test(value);
                } else {
                  return /^\d{5}$/.test(value);
                }
              },
            )
            .nullable(),
        }),

        // Additional Details
        profileInformation: Yup.object().shape({
          email: Yup.string()

            .email(
              t("common:warnings.Invalid email format", "Invalid email format"),
            )
            .max(255)
            .nullable(),
          phoneNumber: Yup.string().test(
            "phone-format-validation",
            t("common:warnings.Invalid Phone number"),
            (value) => validatePhoneNumber(value, phoneRef),
          ),
          TWLanguageId: Yup.string().nullable(),
          ethnicity: Yup.string().nullable(),
          TWChildEducationLevelId: Yup.string().nullable(),
          allergy: Yup.string().max(500).nullable(),
          notes: Yup.string().max(1000).nullable(),
        }),

        // Case Management
        caseManagementInformation: Yup.object().shape({
          dateOfEntry: Yup.date()
            .nullable()
            .when("dateOfBirth", (dateOfBirth, schema) => {
              return schema.test({
                name: "is-date-after-dateOfBirth",
                exclusive: true,
                message:
                  "Date child entered agency cannot be before child's date of birth",
                test: function (dateOfEntry) {
                  // If either dateOfBirth or dateOfEntry is null, return true
                  if (
                    !dateOfBirth ||
                    !dayjs(dateOfBirth).isValid() ||
                    !dateOfEntry
                  ) {
                    return true;
                  }

                  // Compare the dates
                  return dateOfEntry >= dateOfBirth;
                },
              });
            })
            .nullable(),
          dateOfCWSEntry: Yup.string()
            .test({
              name: "not-in-future",
              message: "Date cannot be in the future",
              test: function (dateOfCWSEntry) {
                if (!dateOfCWSEntry) return true;

                const [entryMonth, entryYear] = dateOfCWSEntry
                  .split("/")
                  .map(Number);
                const now = dayjs();

                const currentMonth = now.month() + 1; // 0-based
                const currentYear = now.year();

                return (
                  entryYear < currentYear ||
                  (entryYear === currentYear && entryMonth <= currentMonth)
                );
              },
            })

            .when("dateOfEntry", (dateOfEntry, schema) => {
              return schema.test({
                name: "is-date-before-foster-care-start",
                exclusive: true,
                message:
                  "Child Welfare Entry date cannot be after the child entered agency date",
                test: function (dateOfCWSEntry) {
                  // if (isEditing && childData?.hadPrevCM) return true;

                  if (!dateOfEntry || !dateOfCWSEntry) return true;

                  const dateEnteredAgencyMonth = dayjs(dateOfEntry).month() + 1;
                  const dateEnteredAgencyYear = dayjs(dateOfEntry).year();
                  const [entryMonth, entryYear] = dateOfCWSEntry
                    .split("/")
                    .map(Number);

                  return (
                    entryYear < dateEnteredAgencyYear ||
                    (entryYear === dateEnteredAgencyYear &&
                      entryMonth <= dateEnteredAgencyMonth)
                  );
                },
              });
            })
            .when("dateOfBirth", (dateOfBirth, schema) => {
              return schema.test({
                name: "is-date-after-dateOfBirth",
                exclusive: true,
                message:
                  "Child Welfare Entry date cannot be before the child's date of birth",
                test: function (dateOfCWSEntry) {
                  // if (isEditing && childData?.hadPrevCM) return true;
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
          level: Yup.string().max(255).nullable(),
          medicaidNumber: Yup.string().max(100).nullable(),
          placementId: Yup.string().max(100).nullable(),
          TWChildPlacementStatusId: Yup.string().nullable(),
          previousPlacementsCount: Yup.number()
            .typeError(t("common:warnings.Must be a number"))
            .min(0)
            .nullable(),
        }),
      })}
      onSubmit={async (values, { setSubmitting }) => {
        setIsLoading(true);
        try {
          let res;
            if (
              values?.profileInformation?.phoneNumber &&
              "+" + phoneRef.current.dialCode ===
                values?.profileInformation?.phoneNumber
            ) {
              values.profileInformation.phoneNumber = null;
            }
          if (id) {
            console.log("Values being submitted for update:", values, initialValuesRef.current);
            let changedValues = getChangedValues(
              values,
              initialValuesRef.current,
            );
            changedValues.id = id;
            if (changedValues?.TWFamilyId) {
              changedValues.caseWorkerId = values.caseWorkerId;
            }
            res = await APIS.UpdateChild(changedValues);
            if (isFromFamily) {
              const newPayload = {
                ...(changedValues?.firstName && { firstName: values.firstName }),
                ...(changedValues?.lastName && { lastName: values.lastName }),
                id: res.data?.data?.id,
                ...(changedValues?.gender && { gender: values.gender }),
                ...(changedValues?.dateOfBirth && { dateOfBirth: values.dateOfBirth }),
                isExistingChild: true,
                _rowKey: childInfo?._rowKey
              };
              handleResponse(newPayload);
            }
          } else {
            res = await APIS.CreateChild(values);
            const changedValues = {};
           
           
            if (isFromFamily) {
              ["firstName", "lastName", "dateOfBirth", "gender"].forEach((field) => {
                if (values[field] !== childInfo[field]) {
                  changedValues[field] = values[field];
                }
              });
              const newPayload = {
                ...(changedValues?.firstName && { firstName: values.firstName }),
                ...(changedValues?.lastName && { lastName: values.lastName }),
                id: res.data?.data?.id,
                ...(changedValues?.gender && { gender: values.gender }),
                ...(changedValues?.dateOfBirth && { dateOfBirth: values.dateOfBirth }),
                isExistingChild: true,
                _rowKey: childInfo?._rowKey
              };
              handleResponse(newPayload);
            }
          }
          handleChildModalOpen();
          if (res?.status === 200) {
            if (id) {
              toast.success(
                t(
                  "common:child.Child details updated successfully",
                  "Child details updated successfully",
                ),
              );
            } else {
              toast.success(
                t(
                  "common:child.Child created successfully",
                  "Child created successfully",
                ),
              );
            }

            if (refreshTable) refreshTable();
            if (refreshData) refreshData();
          }
        } catch (error) {
          console.error(error);
        } finally {
          setIsLoading(false);
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
        setFieldError,
        validateForm,
        setFieldTouched
      }) => {
        // Sync refs
        initialValuesRef.current = initialValues;
        valuesRef.current = values;
        isFormDirtyRef.current = dirty;

        // Auto-scroll to error
        if (isSubmitting && Object.keys(errors)?.length > 0) {
          const el = document.querySelector(".Mui-error, [data-error]");
          (el?.parentElement ?? el)?.scrollIntoView({ behavior: "smooth" });
        }
        return (
          <>
            <Loader loading={isLoading} />
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
                mb={2}
              >
                <Stack direction="row" justifyContent="flex-start" spacing={1}>
                  <Heading heading={t("common:common.Child", "Child")} />
                  <Heading
                    heading={
                      childDetails && id
                        ? `${t(`common:common.${childDetails?.status}`, childDetails?.status)}${
                            childDetails?.status === "Case Closed"
                              ? ` ${MonthDayYearFormatter(
                                  childDetails?.lastCaseClosedDate,
                                  "short",
                                )}`
                              : ""
                          }`
                        : t("common:common.Active", "Active")
                    }
                    color="#F37123"
                  />
                </Stack>
                <CloseIcon
                  style={{ color: "#000", cursor: "pointer" }}
                  onClick={handleChildModalOpen}
                />
              </Stack>
              <Form id="add-child-form">
                <Box ml={-2}>
                  <Box sx={{ maxHeight: "70vh", overflowY: "auto", px: 2 }}>
                    <Grid container spacing={2}>
                      <DynamicForm
                        values={values}
                        errors={errors}
                        touched={touched}
                        t={t}
                        setFieldTouched={setFieldTouched}
                        handleChange={handleChange}
                        handleBlur={handleBlur}
                        setFieldValue={setFieldValue}
                        config={ChildBasicDetails({
                          childDropdownLists,
                          users,
                          familyList,
                          values,
                          setFieldValue,
                          handleFamilyChange,
                          uniqueCheckHandler,
                          setFieldError,
                          validateForm,
                          t
                        })}
                        isDisabled={
                          isSubmitting || childDetails?.status === "Case Closed"
                        }
                      />
                      <Grid item xs={12}>
                        <SubHeading
                          value={t(
                            "common:family.Contact information",
                            "Contact information",
                          )}
                        />
                        <Grid container spacing={2} sx={{ mt: 0.5 }}>
                          {values?.TWFamilyId && <DynamicForm
                            values={values}
                            errors={errors}
                            touched={touched}
                            t={t}
                            handleChange={handleChange}
                            handleBlur={handleBlur}
                            setFieldValue={setFieldValue}
                            config={ChildAddressConditionalFields({
                              values,
                              handleSameAddressChange,
                              setFieldValue,
                              t
                            })}
                            isDisabled={
                              isSubmitting ||
                              childDetails?.status === "Case Closed"
                            }
                          />}

                          <DynamicForm
                            values={values}
                            errors={errors}
                            touched={touched}
                            t={t}
                            handleChange={handleChange}
                            handleBlur={handleBlur}
                            setFieldValue={setFieldValue}
                            config={ChildContactDetails({
                              StateList,
                              handleFamilyChange,
                              values,
                              setFieldValue,
                              t
                            })}
                            isDisabled={
                              isSubmitting ||
                              childDetails?.status === "Case Closed" ||
                              values?.isSameAsFamilyAddress
                            }
                          />
                        </Grid>
                      </Grid>

                      <Grid item xs={12}>
                        <CommonAccordion
                          title={t(
                            "common:common.Additional profile information (optional)",
                            "Additional profile information (optional)",
                          )}
                        >
                          <Grid container spacing={2}>
                            <DynamicForm
                              values={values}
                              errors={errors}
                              touched={touched}
                              t={t}
                              handleChange={handleChange}
                              handleBlur={handleBlur}
                              setFieldValue={setFieldValue}
                              locationList={locationList}
                              config={ChildAdditionalDetails({
                                childDropdownLists,
                                languagesList: localStorage.getItem("userRegion") == "1" ? htLanguagesList : fsLanguagesList,
                                phoneRef,
                              })}
                              isDisabled={
                                isSubmitting ||
                                childDetails?.status === "Case Closed"
                              }
                            />
                          </Grid>
                        </CommonAccordion>
                      </Grid>

                      <Grid item xs={12}>
                        <CommonAccordion
                          title={t(
                            "common:common.Case management details (optional)",
                            "Case management details (optional)",
                          )}
                        >
                          <Grid container spacing={2}>
                            <DynamicForm
                              values={values}
                              errors={errors}
                              touched={touched}
                              t={t}
                              handleChange={handleChange}
                              handleBlur={handleBlur}
                              setFieldValue={setFieldValue}
                              config={CaseManagementDetails(childDropdownLists)}
                              isDisabled={
                                isSubmitting ||
                                childDetails?.status === "Case Closed"
                              }
                            />
                          </Grid>
                        </CommonAccordion>
                      </Grid>
                    </Grid>
                  </Box>
                </Box>

                <ChildFormFooter
                  hideChildModal={hideChildModal}
                  childId={id}
                  childDetails={childDetails}
                  handleChildModalOpen={handleChildModalOpen}
                  setHideChildModal={setHideChildModal}
                  onCaseChange={onCloseCaseHandler}
                  isSubmitting={isSubmitting}
                  onSubmit={handleSubmit}
                  deleteChildClickHandler={deleteChildClickHandler}
                  reOpenCaseHandler={reOpenCaseHandler}
                />
              </Form>
            </LocalizationProvider>
          </>
        );
      }}
    </Formik>
  );
};

export default ManageChildForm;
