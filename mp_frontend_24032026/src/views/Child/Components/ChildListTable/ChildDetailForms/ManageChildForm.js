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
import { Box, Button, Grid, Typography } from "@mui/material";
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
import { dateFormatter } from "../../../../../constants";
import dayjs from "dayjs";
import { useDebouncedCallback } from "use-debounce";
import { ModalService } from "../../../../../components/Modal";
import DeleteChild from "./DeleteChild";

const userRegion = localStorage.getItem("userRegion");

const ManageChildForm = ({ close, id, openForEdit }) => {
  const { t } = useTranslation(["common"]);
  const [isLoading, setIsLoading] = useState(false); // Defined missing state
  const mounted = useMounted();
  // Refs for tracking form state (used in your scroll/dirty logic)
  const initialValuesRef = useRef({});
  const valuesRef = useRef({});
  const isFormDirtyRef = useRef(false);
  const { childDropdownLists, locationList, allLanguagesList } =
    useContext(CommonDataContext);
  const [users, setUsers] = useState([]);
  const [familyList, setFamilyList] = useState([]);
  const [childDetails, setChildDetails] = useState(null);
  const StateList =
    locationList?.find((loc) => loc.id == userRegion)?.states || [];
  const [isEditing, setIsEditing] = useState(false);
  const [isUniqueChild, setIsuniqueChild] = useState(true);

  useEffect(() => {
    if (id) {
      getChildDetails();
    }
  }, [id]);

  useEffect(() => {
    if (openForEdit) {
      setIsEditing(true);
    }
  }, [openForEdit]);

  const getChildDetails = useCallback(async () => {
    try {
      const res = await APIS.GetChildDetails(id);
      setChildDetails(res.data?.data); // Assuming API returns child details in res.data
      // Map API response to form values and set them (not implemented here)
    } catch (err) {
      console.error(err);
    } finally {
      // Any cleanup if needed
    }
  }, [id]);

  const getUserList = useCallback(async () => {
    try {
      const payload = {
        rowCount: "10000",
        pageNumber: "1",
        orderByField: [["firstName", "ASC"]],
        globalSearchQuery: "",
        accountId: [localStorage.getItem("orgId")],
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

  console.log("Users List in ManageChildForm: ", childDropdownLists);

  const getFamilyList = useCallback(async () => {
    try {
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
        const res = await APIS.GetFamilyDetails({
          id: values.family,
          listType: "DETAILED",
        });
        const familyData = res.data?.data?.contactInformation;
        if (familyData) {
          setFieldValue("address1", familyData.addressLine1 || "");
          setFieldValue("address2", familyData.addressLine2 || "");
          setFieldValue("city", familyData.city || "");
          setFieldValue("state", familyData.TWStateId || "");
          setFieldValue("zipCode", familyData.zipCode || "");
        }
      } catch (error) {
        console.error(error);
      } finally {
      }
      // Clear address fields logic here
    } else {
      setFieldValue("address1", null);
      setFieldValue("address2", null);
      setFieldValue("city", null);
      setFieldValue("state", null);
      setFieldValue("zipCode", null);
    }
  };

  useEffect(() => {
    getUserList();
    getFamilyList();
    // getStatusChangeReasons()
  }, []);

  const handleFamilyChange = async ({ data, setFieldValue }) => {
    setFieldValue("caseWorker", data?.caseWorkerId);
  };

  const uniqueCheckHandler = useDebouncedCallback(
    async ({ values, setFieldError, validateForm }) => {
      // Only check if all required fields are present
      if (values?.firstName && values.gender && values.dob) {
        try {
          const res = await APIS.CheckUniqueChild({
            id: id || null,
            firstName: values.firstName,
            lastName: values.lastName,
            birthDate: values.dob,
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

  return (
    <Formik
      enableReinitialize={true}
      validateOnBlur={true}
      validateOnChange={true}
      initialValues={{
        // Basic Details
        firstName: childDetails?.firstName || null,
        lastName: childDetails?.lastName || null,
        gender: childDetails?.gender || null,
        dob: childDetails?.dateOfBirth
          ? dateFormatter(childDetails.dateOfBirth)
          : null,
        family: childDetails?.TWFamilyId || null,
        currentLivingCondition: childDetails?.TWChildPlacementStatusId || null,
        caseWorker: childDetails?.caseWorkerId || null,
        disability: childDetails?.disability || false,

        // Contact Details
        sameAddress: childDetails?.isSameAsFamilyAddress || false,
        address1: childDetails?.contactInformation?.addressLine1 || null,
        address2: childDetails?.contactInformation?.addressLine2 || null,
        city: childDetails?.contactInformation?.city || null,
        state: childDetails?.contactInformation?.TWStateId || null, // From commented dropdown
        zipCode: childDetails?.contactInformation?.zipCode || null,

        // Additional Details
        phoneNumber: childDetails?.profileInformation?.phoneNumber || "", // From commented PhoneNumber
        email: childDetails?.profileInformation?.email || null,
        primaryLanguage: childDetails?.profileInformation?.TWLanguageId || null, // From commented dropdown
        educationLevel:
          childDetails?.profileInformation?.TWChildEducationLevelId || null, // From commented dropdown
        ethnicity: childDetails?.profileInformation?.ethnicity || null,
        allergies: childDetails?.profileInformation?.allergy || null,
        notes: childDetails?.profileInformation?.notes || null,

        // Case Management
        dateEnteredAgency:
          childDetails?.caseManagementInformation?.dateOfEntry || null,
        dateOfCWSEntry:
          childDetails?.caseManagementInformation?.dateOfCWSEntry || null, // From commented Date of CWS entry
        caseManagementStep: childDetails?.TWChildPlacementStatusId || null, // From commented dropdown
        levelOfCare: childDetails?.caseManagementInformation?.level || null,
        medicaidNumber:
          childDetails?.caseManagementInformation?.medicaidNumber || null,
        placementId:
          childDetails?.caseManagementInformation?.placementId || null,
        previousPlacementsCount:
          childDetails?.caseManagementInformation?.previousPlacementsCount ||
          null, // From commented # of previous placements
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
        dob: Yup.object()
          .required(
            t(
              "common:warnings.Date of birth is required",
              "Date of birth is required",
            ),
          )
          .typeError("Date of birth is required")
          .nullable(),
        family: Yup.string().nullable(),
        caseWorker: Yup.string()
          .required(
            t(
              "common:warnings.Case worker is required",
              "Case worker is required",
            ),
          )
          .nullable(),
        disability: Yup.boolean(),

        // Contact Details
        sameAddress: Yup.boolean(),
        address1: Yup.string().max(255).nullable(),
        address2: Yup.string().max(255).nullable(),
        city: Yup.string().max(255).nullable(),
        zipCode: Yup.string()
          .max(20)
          .nullable()
          .test({
            name: "zip-format-validation",
            exclusive: true,
            message: t(
              "common:warnings.Invalid ZIP code format",
              "Invalid ZIP code format",
            ),
            test: function (zip_code) {
              const country = localStorage.getItem("userRegion");
              const countryObj = locationList?.find((obj) => obj.id == country);
              const isoCode = countryObj?.isoCode?.toUpperCase();
              if (!zip_code) return true; // allow empty if nullable
              if (isoCode === "IND") {
                return /^\d{6}$/.test(zip_code);
              } else {
                return /^\d{5}$/.test(zip_code);
              }
            },
          }),
        state: Yup.string().max(255).nullable(),

        // Additional Details
        email: Yup.string()
          .email(
            t("common:warnings.Invalid email format", "Invalid email format"),
          )
          .max(255)
          .nullable(),
        phoneNumber: Yup.string().max(20).nullable(),
        primaryLanguage: Yup.string().nullable(),
        educationLevel: Yup.string().nullable(),
        allergies: Yup.string().max(500).nullable(),
        notes: Yup.string().max(1000).nullable(),

        // Case Management
        dateEnteredAgency: Yup.date()
          .nullable()
          .when("dob", (dob, schema) => {
            return schema.test({
              name: "is-date-after-dob",
              exclusive: true,
              message:
                "Date child entered agency cannot be before child's date of birth",
              test: function (dateEnteredAgency) {
                // If either dob or dateEnteredAgency is null, return true
                if (!dob || !dayjs(dob).isValid() || !dateEnteredAgency) {
                  return true;
                }

                // Compare the dates
                return dateEnteredAgency >= dob;
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

          .when("dateEnteredAgency", (dateEnteredAgency, schema) => {
            return schema.test({
              name: "is-date-before-foster-care-start",
              exclusive: true,
              message:
                "Child Welfare Entry date cannot be after the child entered agency date",
              test: function (dateOfCWSEntry) {
                // if (isEditing && childData?.hadPrevCM) return true;

                if (!dateEnteredAgency || !dateOfCWSEntry) return true;

                const dateEnteredAgencyMonth =
                  dayjs(dateEnteredAgency).month() + 1;
                const dateEnteredAgencyYear = dayjs(dateEnteredAgency).year();
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
          .when("dob", (dob, schema) => {
            return schema.test({
              name: "is-date-after-dob",
              exclusive: true,
              message:
                "Child Welfare Entry date cannot be before the child's date of birth",
              test: function (dateOfCWSEntry) {
                // if (isEditing && childData?.hadPrevCM) return true;
                if (!dob || !dateOfCWSEntry) return true;

                const dobMonth = dayjs(dob).month() + 1;
                const dobYear = dayjs(dob).year();
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
        levelOfCare: Yup.string().max(255).nullable(),
        medicaidNumber: Yup.string().max(100).nullable(),
        placementId: Yup.string().max(100).nullable(),
        caseManagementStep: Yup.string().nullable(),
        previousPlacementsCount: Yup.number()
          .typeError(t("common:warnings.Must be a number"))
          .min(0)
          .nullable(),
      })}
      onSubmit={async (values, { setSubmitting }) => {
        setIsLoading(true);
        try {
          // Map form values to API payload
          const payload = {
            firstName: values.firstName,
            lastName: values.lastName || null,
            gender: values.gender,
            dateOfBirth: values.dob,
            TWFamilyId: values.family || null,
            TWChildCurrentPlacementStatusId: values.currentLivingCondition || null,
            caseWorkerId: values.caseWorker,
            childHasDisability: values.disability || false,
            isSameAsFamilyAddress: values.sameAddress || false,
            contactInformation: {
              TWCountryId: userRegion,
              TWStateId: values.state || null,
              TWDistrictId: null,
              addressLine1: values.address1?.trim().length > 0 ? values.address1 : null,
              addressLine2: values.address2?.trim().length > 0 ? values.address2 : null,
              city: values.city?.trim().length > 0 ? values.city : null,
              zipCode: values.zipCode?.trim().length > 0 ? values.zipCode : null
            },
            profileInformation: {
              phoneNumber:
                values.phoneNumber?.length > 0 ? values.phoneNumber : null,
              email: values.email,
              TWLanguageId: values.primaryLanguage || null,
              ethnicity: values.ethnicity, // Not present in form, set as needed
              highestEducationLevel: values.educationLevel,
              TWChildEducationLevelId: values.educationLevel || null, // Not present in form, set as needed
              allergy: values.allergies,
              notes: values.notes,
            },
            caseManagementInformation: {
              dateOfEntry: values.dateEnteredAgency,
              dateOfCWSEntry: values.dateOfCWSEntry, // Not present in form, set as needed
              TWChildPlacementStatusId:
                values.caseManagementStep || null,
              level: values.levelOfCare || null,
              medicaidNumber: values.medicaidNumber,
              placementId: values.placementId,
              previousPlacementsCount: values.previousPlacementsCount,
            },
          };
          if (id) {
            payload.id = id;
            const res = await APIS.UpdateChild(payload);
            console.log("Update API response: ", res);
          } else {
            const res = await APIS.CreateChild(payload);
          }
          close();
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
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <Form id="add-child-form">
              <Box mx={-2}>
                <Box sx={{ maxHeight: "70vh", overflowY: "auto", px: 2 }}>
                  <Grid container spacing={2}>
                    <DynamicForm
                      values={values}
                      errors={errors}
                      touched={touched}
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
                      })}
                      isDisabled={isSubmitting}
                    />
                    <Grid item xs={12}>
                      <SubHeading
                        value={t(
                          "common:common.Contact information",
                          "Contact information",
                        )}
                      />
                      <Grid container spacing={2} sx={{ mt: 0.5 }}>
                        <DynamicForm
                          values={values}
                          errors={errors}
                          touched={touched}
                          handleChange={handleChange}
                          handleBlur={handleBlur}
                          setFieldValue={setFieldValue}
                          config={ChildAddressConditionalFields({
                            values,
                            handleSameAddressChange,
                            setFieldValue,
                          })}
                          isDisabled={isSubmitting}
                        />
                        {!values?.sameAddress && (
                          <DynamicForm
                            values={values}
                            errors={errors}
                            touched={touched}
                            handleChange={handleChange}
                            handleBlur={handleBlur}
                            setFieldValue={setFieldValue}
                            config={ChildContactDetails({
                              StateList,
                              handleFamilyChange,
                              values,
                              setFieldValue,
                            })}
                            isDisabled={isSubmitting}
                          />
                        )}
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
                            handleChange={handleChange}
                            handleBlur={handleBlur}
                            setFieldValue={setFieldValue}
                            config={ChildAdditionalDetails({
                              childDropdownLists,
                              allLanguagesList,
                            })}
                            isDisabled={isSubmitting}
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
                            handleChange={handleChange}
                            handleBlur={handleBlur}
                            setFieldValue={setFieldValue}
                            config={CaseManagementDetails(childDropdownLists)}
                            isDisabled={isSubmitting}
                          />
                        </Grid>
                      </CommonAccordion>
                    </Grid>
                  </Grid>
                </Box>
              </Box>

              <ChildFormFooter
                childId={id}
                onCaseClose={close}
                isSubmitting={isSubmitting}
                onSubmit={handleSubmit}
                deleteChildClickHandler={deleteChildClickHandler}
              />
            </Form>
          </LocalizationProvider>
        );
      }}
    </Formik>
  );
};

export default ManageChildForm;
