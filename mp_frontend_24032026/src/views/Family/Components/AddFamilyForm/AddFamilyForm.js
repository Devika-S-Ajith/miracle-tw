import React, { useCallback, useContext, useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import * as Yup from "yup";
import { Formik, Form, Field } from "formik";
import NumberFormat from 'react-number-format';
import {
  Box,
  Button,
  Card,
  Grid,
  TextField,
  Typography,
  Divider,
  Tooltip,
  Skeleton
} from "@mui/material";

import { CommonDataContext } from "../../../../common/contexts/CommonDataContext";
import InformationCircleIcon from "../../../../assets/icons/InformationCircle";
import InfoIcon from "../../../../assets/icons/InfoIcon";
import APIS from "../../../../common/hooks/UseApiCalls";
import AutoCompleteDropdown from "../../../../components/UserComponents/AutoCompleteDropdown";
import {
  getDistrictList,
  getSelectedCountryDetails,
  getStateList,
} from "../../../../helpers/helperFunction";
import "react-international-phone/style.css";
import "../../../Child/Components/AddChildForm/AddChildForm.css";
import Loader from "../../../../components/UserComponents/Loader";
import SaveIcon from "../../../../assets/icons/SaveIcon";
import AutoCompleteDropdownMultiNames from "../../../../components/UserComponents/AutoCompleteDropdownMultiNames";
import { ModalService } from "../../../../components/Modal";
import FamilyMembersList from "../FamilyMembersList";
import AddChildModal from "../FamilyMembersList/AddChildModal";
import AddMemberModal from "../FamilyMembersList/AddMemberModal";
import { CASEWORKER } from "../../../../helpers/constant";
import CancelButton from "../../../../components/UserComponents/CancelButton";
import CustomSwitch from "../../../../components/UserComponents/CustomSwitch";

const AddFamilyForm = (props) => {

  const location = useLocation();
  const mode = location.state?.mode;
  const { childId, family, careGiver, ...other } = props;
  const { t } = useTranslation(["common"]);
  const navigate = useNavigate();
  const { locationList, getFamilyList, relationList, htLanguagesList, situationsAndGoals, signedinUserRoleHT, getTsFamilyListData } =
    useContext(CommonDataContext);
  const [isLoading, setIsLoading] = useState(false);
  const [caseWorkerList, setCaseWorkerList] = useState([]);
  const [selectedChildId, setSelectedChildId] = useState([]);
  const [activeSelectedChildId, setActiveSelectedChildId] = useState([]);
  const [selectedMemberCollection, setSelectedMemberCollection] = useState([]);
  const [checked, setChecked] = useState(family && family.isActive);
  const [primaryCaregiver, setPrimaryCaregiver] = useState(careGiver);
  const [newlyAddedMembers, setNewlyAddedMembers] = useState([]);
  const [memberListLoading, setMemberListLoading] = useState(false);
  const [deactivationReasons,setDeactivationReasons] = useState([])
  const [initialChildIds,setInitialChildIds] = useState(false)
  const [initalPrimaryCaregiverId, setInitalPrimaryCaregiverId] = useState(null)
  const initialValuesRef = useRef();
  const valuesRef = useRef();
  const isFormDirtyRef = useRef();

  // Set up beforeunload handler for browser refresh
  useEffect(() => {
    // Handler for beforeunload
    const handleBeforeUnload = (e) => {
      if (
        isFormDirtyRef.current &&
        isFormDirtyRef.current(initialValuesRef.current, valuesRef.current)
      ) {
        e.preventDefault();
        e.returnValue = ""; // Required for Chrome to show the dialog
        return "";
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, []);

  const getCaseWorkerList = useCallback(async () => {
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
      setCaseWorkerList(data && data.data && data.data.data);
    } catch (err) {
      console.error(err);
    }
  }, []);

  useEffect(() => {
    getCaseWorkerList()
    getDeleteDeactivateReason("FAMILY_DEACTIVATION")
  }, [])

  const getDeleteDeactivateReason = async (value) => {
    try {
      await APIS.GetDeleteDeactivateReason(value).then((res) => {
       setDeactivationReasons(res?.data?.reasons)
      });
    } catch (err) {
     console.log(err)
    }
  };



  const getAddedChild = (child) => {

    if (selectedMemberCollection?.length === 0 && child) {
      child.isPrimaryCareGiver = true;
      child.isChild = true;
      setPrimaryCaregiver(child)
    }

    setSelectedChildId((prevSelectedChildId) => [
      ...prevSelectedChildId,
      child.id,
    ]);

    if (child?.isActive) {
      setActiveSelectedChildId((prevActiveSelectedChildId) => [...prevActiveSelectedChildId, child.id])
    }
   

    setSelectedMemberCollection((prevSelectedMemberCollection) => [
      ...prevSelectedMemberCollection,
      { ...child, isChild: true },
    ]);

  }

  const getPrimaryCareGiverDetail = (member) => {
    setPrimaryCaregiver(member);
  }

  const getNewlyAddedChild = (child) => {
    if (!child || child.length === 0) return;

    const newChild = { ...child[0] };

    // Set the primary caregiver if the collection is empty
    if (selectedMemberCollection?.length === 0) {
      newChild.isPrimaryCareGiver = true;
      setPrimaryCaregiver(newChild);
    }

    // Update selected child IDs
    setSelectedChildId((prevSelectedChildId) => {
      const newChildId = newChild.id;
      return newChildId && !prevSelectedChildId.includes(newChildId)
        ? [...prevSelectedChildId, newChildId]
        : prevSelectedChildId;
    });

    if(newChild?.isActive) {
      setActiveSelectedChildId((prevSelectedChildId) => {
        const newChildId = newChild.id;
        return newChildId && !prevSelectedChildId.includes(newChildId)
          ? [...prevSelectedChildId, newChildId]
          : prevSelectedChildId;
      });
    }else{
      setActiveSelectedChildId((prevSelectedChildId) => prevSelectedChildId.filter(child => child !== newChild.id))
    }
    

    // Update the selected member collection
    setSelectedMemberCollection((prevCollection) => {
      const existingIndex = prevCollection.findIndex(
        (item) => item.id === newChild.id && item.isChild === newChild.isChild
      );

      if (existingIndex !== -1) {
        // Create a new array with the updated member
        const updatedCollection = [...prevCollection];
        updatedCollection[existingIndex] = { ...updatedCollection[existingIndex], ...newChild };
        newChild.isPrimaryCareGiver === true && setPrimaryCaregiver(newChild);
        return updatedCollection;
      }

      // Add new member to the collection
      return [...prevCollection, newChild];
    });
  };

  const removeChildFromFamily = (deletedChild) => {
    setSelectedChildId(selectedChildId.filter(child => child !== deletedChild?.id));
    setActiveSelectedChildId(activeSelectedChildId.filter(child => child !== deletedChild?.id))
    setSelectedMemberCollection(selectedMemberCollection.filter(child => child.id !== deletedChild?.id));
    if (deletedChild?.HTFamilyMemberId && newlyAddedMembers.includes(deletedChild?.HTFamilyMemberId)) {
      setNewlyAddedMembers(newlyAddedMembers.filter(member => member !== deletedChild?.HTFamilyMemberId));
    }
  }

  const handleStatusChange = async (payload) => {
    try {
      let statusPayload = {
        id: family?.id,
        isActive: checked,
        isDeleted:false,
        TWAccountId: localStorage.getItem('orgId'),
        type: checked ? null : "FAMILY_DEACTIVATION",
        ...(checked ? {} : { reason: payload.statusChangeReason, otherReason: payload.OtherReason })
    };
      
      await APIS.ChangeFamilyStatus(statusPayload).then((res) => {
        if (res.data.Message !== "Status Changed Successfully") {
          toast.error(t("common:family.Inactive Reassign"));
          setChecked(true);
        } else if (res.data.Message === "Status Changed Successfully") {
          toast.success(t("common:family.Family Status Updated Successfully"));
        } else {
          toast.error(t("common:common.Something went wrong"));
        }
      });
    } catch (err) {
      toast.error(t("common:common.Something went wrong"));
    }
  };

  useEffect(() => {
    family?.id && getChildrenUnderFamily(family?.id);
    return () => { };
  }, [family?.id]);

  const getChildrenUnderFamily = useCallback(
    async (id) => {
      setMemberListLoading(true);
      try {
        const data = await APIS.familyMembers(id);
        const members = data?.data?.familyDetails?.members || [];
        setInitialChildIds( members
            ?.filter((member) => member.memberType === "Child") // Filter members with memberType "Child"
            ?.map((member) => member.id)) // Extract their IDs))
        const updatedChildrenDetails = members?.map((child) => ({
          ...child,
          isChild: child?.memberType === "Child",
          isExistingChild:child?.memberType === "Child"
        }));
        setInitalPrimaryCaregiverId(updatedChildrenDetails.find((member) => member.isPrimaryCareGiver)?.id)
        setPrimaryCaregiver(updatedChildrenDetails.find((member) => member.isPrimaryCareGiver));
        setMemberListLoading(false);
        setSelectedMemberCollection(updatedChildrenDetails);
        setSelectedChildId(
          members
            ?.filter((member) => member.memberType === "Child") // Filter members with memberType "Child"
            ?.map((member) => member.id) // Extract their IDs
        );

        setActiveSelectedChildId(members
          ?.filter((member) => member.memberType === "Child" && member.isActive) // Filter members with memberType "Child"
          ?.map((member) => member.id))

        setNewlyAddedMembers(
          members
            ?.filter(
              (member) =>
                member.memberType !== "Child" || member.HTFamilyMemberId // Either condition
            )
            ?.map((member) =>
              member.memberType !== "Child" ? member.id : member.HTFamilyMemberId // Conditional mapping
            )
        );
      } catch (err) {
        setMemberListLoading(false);
        console.error(err);
      }
    });

  const getMemberDetails = (member) => {
    if (!member || member.length === 0) return;

    const newMember = { ...member[0] };

    // Set primary caregiver if the collection is empty
    if (selectedMemberCollection?.length === 0) {
      newMember.isPrimaryCareGiver = true;
      setPrimaryCaregiver(newMember);
    }

    // Update the selected member collection
    setSelectedMemberCollection((prevCollection) => {
      const existingIndex = prevCollection.findIndex(
        (item) => item.id === newMember.id && item.isChild === newMember.isChild
      );

      if (existingIndex !== -1) {
        // Update existing member
        const updatedCollection = [...prevCollection];
        setPrimaryCaregiver((prev) => {
          if (!prev) return newMember;
          if (prev.id === newMember.id && prev.isChild === newMember.isChild) {
            return newMember;
          }
          return prev;
        });
        updatedCollection[existingIndex] = { ...updatedCollection[existingIndex], ...newMember };
        return updatedCollection;
      }

      // Add new member to the collection
      return [...prevCollection, newMember];
    });

    // Update newly added members
    setNewlyAddedMembers((prevAddedMember) => {
      if (!newMember.id || prevAddedMember.includes(newMember.id)) {
        return prevAddedMember;
      }
      return [...prevAddedMember, newMember.id];
    });
  };

  const disableButtons = (values,isSubmitting,checked) => {
    const isDisabled =
      !values.address1 || 
      !values.country ||
      !values.state || 
      !values.city || 
      !values.zip_code ||
      !values.goal ||
      !values.family_situation || 
      !values.caseWorker ||
      isSubmitting ||
      (!checked &&  family?.id)
    return isDisabled;
  };

 const isFormDirty = (initial, current) => {
  // Compare only relevant fields
  const initialChildSet = new Set(initialChildIds || []);
  const selectedChildSet = new Set(selectedChildId || []);
  const areChildIdsSame =
    initialChildSet.size === selectedChildSet.size &&
    [...initialChildSet].every((id) => selectedChildSet.has(id));
    const isPrimaryCaregiverChanged = initalPrimaryCaregiverId !== primaryCaregiver?.id;

  return (
    Object.keys(initial).some(key => initial[key] !== current[key] || family?.isActive !== checked)
    || !areChildIdsSame || isPrimaryCaregiverChanged 
  );
}


  return (
    <Formik
      enableReinitialize={true}
      validateOnChange={true}
      validateOnBlur={true}
      initialValues={{
        family_name: family?.familyName || "",
        TWAccountId: localStorage.getItem("orgId"),
        address1: family?.addressLine1 || "",
        address2: family?.addressLine2 || "",
        country: family?.HTCountryId || localStorage.getItem("userRegion"),
        state: family?.HTStateId || "",
        district: family?.HTDistrictId || "",
        language: family?.HTLanguageId || null,
        family_situation: family?.HTFamilySituationId || "",
        goal: family?.HTFamilyGoalId || "",
        caseWorker: [CASEWORKER].includes(signedinUserRoleHT) ? localStorage.getItem("username") : family?.caseManagerId || "",
        city: family?.city || "",
        zip_code: family?.zipCode
          ? family?.zipCode?.length > 6
            ? family?.zipCode.slice(0, 5) + "-" + family?.zipCode.slice(5)
            : family?.zipCode
          : "",
        statusChangeReason: "",
        OtherReason: "",
        numberOfChildren: family?.numberOfChildren || null,
        submit: null,
      }}
      validationSchema={Yup.object().shape({
        family_name: Yup.string().max(255),
        address1: Yup.string()
          .max(255)
          .required(t("common:warnings.Address Line 1 is required")),
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
          .max(255).nullable(),
        goal: Yup.string()
          .max(255)
          .required(t("common:warnings.Goal is required")),
        family_situation: Yup.string()
          .max(255)
          .required(t("common:warnings.Family type is required")),
        caseWorker: Yup.string()
          .max(255)
          .required(t("common:warnings.Case Worker is required")),
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
        statusChangeReason: Yup.string().when("checked", {
          is: () => family?.isActive && !checked,
          then: Yup.string().required(t("common:warnings.Status change reason is required"))
            .nullable(),
        }),
          OtherReason: Yup.string().when("statusChangeReason", {
            is: (val) => parseInt(val, 10) === 24,
            then: Yup.string().required(t("common:warnings.Status change reason is required")),
            otherwise: Yup.string().nullable(),
          }),
      })}
      onSubmit={async (
        values,
        { resetForm, setErrors,setTouched, setStatus, setSubmitting }
      ) => {
        setIsLoading(true);
        let payload = {
          id: family && family?.id,
          familyName: values?.family_name?.trim(),
          firstName: primaryCaregiver?.firstName,
          lastName: primaryCaregiver?.lastName,
          occupation: primaryCaregiver?.occupation || "",
          phoneNumber: primaryCaregiver?.phoneNumber,
          email: primaryCaregiver?.email,
          isMinor: primaryCaregiver?.isMinor || false,
          isPrimaryCareGiver: "true",
          addressLine1: values.address1,
          addressLine2: values.address2 || "",
          zipCode: values.zip_code,
          city: values.city,
          HTLanguageId: values.language || null,
          HTCountryId: values.country,
          HTDistrictId: values.district || null,
          HTStateId: values.state,
          HTFamilyRelationId: primaryCaregiver?.isChild ? "7" : primaryCaregiver?.HTFamilyRelationId,
          otherRelation: primaryCaregiver?.isChild ? "Child" : values.other_relation,
          HTChildId: childId ? childId : "",
          children: selectedChildId || [],
          members: newlyAddedMembers || [],
          TWUserId: values.caseWorker,
          HTFamilyGoalId: values.goal,
          caseType: "UPDATE",
          HTFamilySituationId: values.family_situation,
          HTFamilyMemberId: primaryCaregiver?.isChild ? null : primaryCaregiver?.id,
          HTFamilyMemberTypeId: family?.HT_familyMembers?.length
            ? family?.HT_familyMembers?.find((f) => f?.isPrimaryCareGiver)
              ?.HTFamilyMemberTypeId
            : null,
          HTParentChildId: primaryCaregiver?.isChild ? primaryCaregiver?.id : null,//id of the child created as primary parent
          isChild: primaryCaregiver?.isChild,
          TWAccountId: localStorage.getItem("orgId"),
        };
        try {
          if (mode === 'add') {
            await APIS.AddFamily(payload).then((res) => {
              if (res && res.data && res.status === 200) {
                resetForm();
                setStatus({ success: true });
                getFamilyList();
                setSubmitting(false);
                toast.success(t("common:family.Family Added Successfully"));
                getTsFamilyListData();
                navigate("/dashboard/families");
              } else {
                toast.error(t("common:common.Something went wrong"));
                setIsLoading(false);
                setStatus({ success: false });
                setSubmitting(false);
              }
            });
          } else {
            await APIS.EditFamily(payload).then(async (res) => {
              if (res && res.data && res.status === 200) {
                if(checked != family?.isActive){
                  await handleStatusChange(values)
                }
                getFamilyList();
                setStatus({ success: true });
                setSubmitting(false);
                toast.success(t("common:family.Family Updated Successfully"));
                getTsFamilyListData();
                navigate("/dashboard/families");
              } else {
                setIsLoading(false);
                toast.error(t("common:common.Something went wrong"));
                setStatus({ success: false });
                setSubmitting(false);
              }
            });
          }
        } catch (err) {
          setIsLoading(false);
          toast.error(t("common:common.Something went wrong"));
          setStatus({ success: false });
          setErrors({ submit: err.message });
          setSubmitting(false);
        }
        setIsLoading(false);
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
        setTouched,
        validateForm,
      }) => {

         initialValuesRef.current = initialValues;
        valuesRef.current = values;
        isFormDirtyRef.current = isFormDirty;

        if (isSubmitting) {
          const el = document.querySelector(".Mui-error, [data-error]");
          (el?.parentElement ?? el)?.scrollIntoView();
          // (el?.parentElement ?? el)?.focus();
        }
        return (
          <Form
            onSubmit={handleSubmit}
            id="add-family-form"
          >
            <Loader loading={isLoading} />

            <Card>
              <Box sx={{ m: 2, mt: 3 }}>
              <fieldset disabled={ (!checked &&  family?.id)} style={{ border: "none", padding: 0 }}>
                <Grid container spacing={3}>
                  <Grid item md={12} xs={12}>
                    <Typography variant="h6">
                      {/* Member {index + 1} */}
                      {t("common:family.Family Details", "Family Details")}
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
                      id="family_name"
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
                      <InformationCircleIcon
                        sx={{ marginLeft: 0.5 }}
                        fontSize="small"
                      />
                    </Tooltip>
                  </Grid>

                  <Divider />

                  <Grid item md={12} xs={12}>
                    <Typography color="textSecondary" variant="subtitle2">
                      {/* Member {index + 1} */}
                      {t("common:family.Contact information", "Contact information")}
                    </Typography>
                  </Grid>

                  <Grid item md={6} xs={12}>
                    <TextField
                      error={Boolean(touched.address1 && errors.address1)}
                      fullWidth
                      helperText={touched.address1 && errors.address1}
                      label={t("common:common.Address 1")}
                      name="address1"
                      id="address1"
                      onBlur={handleBlur}
                      onChange={handleChange}
                      value={values.address1}
                      variant="outlined"
                      required
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
                    />
                  </Grid>

                  <Grid item md={6} xs={12} sx={{ mt: -2 }}>
                    <Field
                      error={Boolean(touched.country && errors.country)}
                      fullWidth
                      helperText={touched.country && errors.country}
                      name="country"
                      id="country"
                      disabled
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
                        id: "country"
                      }}
                    />
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
                        label: t("common:common.State/Region"),
                        id: "state"
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
                          id="district"
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
                            label: t("common:common.District/County"),
                            id: "district"
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
                      onBlur={handleBlur}
                      onChange={handleChange}
                      value={values.city}
                      variant="outlined"
                      required
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
                      format={
                        locationList
                          .find((obj) => obj.id == values.country)
                          ?.isoCode?.toUpperCase() === "IND"
                          ? "######"
                          : "#####"
                      }
                      // label={t('common:common.Zipcode')}
                      label={t("common:common.ZIP/postal Code")}
                      name="zip_code"
                      id="zip_code"
                      type="text"
                      required
                      onBlur={handleBlur}
                      onChange={(e) => {
                        let zipCode = e.target.value.trim();
                        setFieldValue("zip_code", zipCode);
                      }}
                      value={values.zip_code}
                      disabled={!values.country}
                    />
                  </Grid>

                  <Grid item md={6} xs={12} sx={{ mt: -2 }}>
                    <Field
                      error={Boolean(touched.language && errors.language)}
                      fullWidth
                      helperText={touched.language && errors.language}
                      name="language"
                      id="language"
                      accessKey="language"
                      component={AutoCompleteDropdown}
                      label="language"
                      options={htLanguagesList || []}
                      textFieldProps={{
                        fullWidth: true,
                        margin: "normal",
                        variant: "outlined",
                        label: t("common:common.Native Language"),
                        id: "language"
                      }}
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
                      id="caseWorker"
                      accessKey1="firstName"
                      accessKey2="lastName"
                      component={AutoCompleteDropdownMultiNames}
                      disabled={[CASEWORKER].includes(signedinUserRoleHT)}
                      required={true}
                      label="caseWorker"
                      options={caseWorkerList || []}
                      textFieldProps={{
                        fullWidth: true,
                        margin: "normal",
                        variant: "outlined",
                        label: t("common:common.Caseworker assigned to this family"),
                        id: "caseWorker"
                      }}
                    />
                  </Grid>
                  <Grid item md={6} xs={12} sx={{ mt: -2 }}>
                    <Field
                      error={Boolean(
                        touched.family_situation && errors.family_situation
                      )}
                      fullWidth
                      helperText={touched.family_situation && errors.family_situation}
                      name="family_situation"
                      id="family_situation"
                      accessKey="situation"
                      required={true}
                      component={AutoCompleteDropdown}
                      label="family_situation"
                      options={situationsAndGoals}
                      textFieldProps={{
                        fullWidth: true,
                        margin: "normal",
                        variant: "outlined",
                        label: t("common:family.Family Situation"),
                        id: "family_situation"
                      }}
                    />
                  </Grid>
                  <Grid item md={6} xs={12} sx={{ mt: -2 }}>
                    <Field
                      error={Boolean(
                        touched.goal && errors.goal
                      )}
                      fullWidth
                      helperText={touched.goal && errors.goal}
                      name="goal"
                      id="goal"
                      accessKey="goal"
                      required={true}
                      component={AutoCompleteDropdown}
                      label="goal"
                      options={situationsAndGoals
                        ?.find((item) => item.id === values.family_situation)
                        ?.goals || []}
                      textFieldProps={{
                        fullWidth: true,
                        margin: "normal",
                        variant: "outlined",
                        label: t("common:family.Goal"),
                        id: "goal"
                      }}
                    />
                  </Grid>

                  <Divider />
                  <Grid item md={9} xs={9}>
                    <Typography variant="h6">
                      {t("common:common.Family Members")}
                    </Typography>
                  </Grid>
                  {selectedMemberCollection?.length > 0 &&
                    <Grid item md={3} xs={3}
                      sx={{ display: "flex", justifyContent: "flex-end" }}>
                      <Typography variant="h6">
                        {t("common:common.Primary contact")+"?"}
                      </Typography>
                    </Grid>}
                </Grid>
               
                <>
                  <Typography value="Family Members" />
                  {memberListLoading ? (
                    <Box sx={{ mt: 3 }}>
                      <Skeleton variant="rectangular" animation="wave" height={50} width="100%" sx={{ mb: 2 }} />
                      <Skeleton variant="rectangular" animation="wave" height={50} width="100%" sx={{ mb: 2 }} />
                      <Skeleton variant="rectangular" animation="wave" height={50} width="100%" sx={{ mb: 2 }} />
                    </Box>
                  ) : (
                    selectedMemberCollection?.length > 0 ? (
                      <FamilyMembersList
                        selectedChildCollection={selectedMemberCollection}
                        removeChildFromFamily={removeChildFromFamily}
                        getMemberDetails={getMemberDetails}
                        relationList={relationList}
                        familyId={family?.id}
                        familyName={values.family_name}
                        caseWorker={values?.caseWorker}
                        getPrimaryCareGiverDetail={getPrimaryCareGiverDetail}
                        getNewlyAddedChild={getNewlyAddedChild}
                        isFamilyActive={family?.id ? checked : true}
                        setIsLoading={setIsLoading}
                        address1={values.address1}
                        address2={values.address2}
                        city={values.city}
                        zip_code={values.zip_code}
                        state={values.state}
                        district={values.district}
                        country={values.country}
                      />
                    ) : (
                      <Box
                        gap={1}
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          backgroundColor: "rgba(113, 197, 212, 0.20)",
                          border: "1px solid #71C5D4",
                          padding: 2,
                          borderRadius: 1,
                          my: 2,
                        }}
                      >
                        <InfoIcon fontSize="small" />
                        <Typography variant="body1" color="#000000" id="family-member-required-msg">
                        {t("common:common.At least one child or family member must be added to this family")}
                        </Typography>
                      </Box>
                    )
                  )}
                </>
                </fieldset>
                <Box sx={{ display: "flex", flexDirection: "row", gap: 1 }}>
                  <Button
                    variant="outlined"
                    disabled={disableButtons(values,isSubmitting,checked)}
                    onClick={() => {
                      ModalService.open(({ close }) => <AddChildModal
                        onCloseChildModal={close}
                        selectedChildId={selectedChildId}
                        getAddedChild={(child) => getAddedChild(child)}
                        familyName={values.family_name}
                        familyId={family && family.id}
                        caseWorker={values?.caseWorker}
                        caseworkerName = {caseWorkerList.find((item) => item.id === values?.caseWorker)?.firstName + " " + caseWorkerList.find((item) => item.id === values?.caseWorker)?.lastName}
                        getNewlyAddedChild={getNewlyAddedChild}
                        address1={values.address1}
                        address2={values.address2}
                        city={values.city}
                        zip_code={values.zip_code}
                        state={values.state}
                        district={values.district}
                        country={values.country}
                      />, {
                        modalTitle: t("common:child.Add Child"),
                        width: "50%",
                        hideModalFooter: true,
                        enableClose: true,
                      });
                    }}
                  >{t("common:child.Add Child")}</Button>
                  <Button
                    disabled={disableButtons(values,isSubmitting,checked)}
                    onClick={() => {
                      ModalService.open(({ close }) => <AddMemberModal
                        onClose={close}
                        getMemberDetails={getMemberDetails}
                        id={family && family.id} />, {
                        modalTitle: t("common:family.Add family member"),
                        width: "50%",
                        hideModalFooter: true,
                        enableClose: true,
                      });
                    }}
                    variant="outlined">{t("common:family.Add family member")}</Button>
                </Box>


                {!(mode == 'add') && <Grid item>
                  <Grid item md={6} xs={12}>
                    <Typography
                      color="textPrimary"
                      gutterBottom
                      variant="subtitle2"
                      sx={{ mt: 2 }}
                    >
                      {t("common:family.Family Status")}
                    </Typography>
                    <Box sx={{ display: "flex", alignItems: "center", flex: 1 }}>
                      <CustomSwitch
                        size="small"
                        disabled={(activeSelectedChildId?.length > 0 && checked) || isLoading || memberListLoading}
                        checked={checked}
                        onChange={() => {
                          setChecked(!checked);
                          setFieldValue("statusChangeReason", "");
                          setFieldValue("OtherReason", "");
                        }}
                      />

                      <Typography
                        color={checked ? "#43AA8B" : "#F94144"}
                        variant="h6"
                        sx={{ marginLeft: 1, display: "flex", alignItems: "center" }}
                      >
                        {checked ? t("common:common.ACTIVE") : t("common:common.INACTIVE")}
                      </Typography>
                      {activeSelectedChildId.length > 0 && (
                        <Tooltip title={t("common:family.Inactive Reassign")}>
                          <InformationCircleIcon sx={{ marginLeft: 0.5 }} fontSize="small" />
                        </Tooltip>
                      )}
                    </Box>
                  </Grid>
                </Grid>}
                { (family?.isActive && !checked) && 
                  <Grid container spacing={1}>
                    <Grid item md={12} xs={12}>
                      <Field
                        error={Boolean(touched.statusChangeReason && errors.statusChangeReason)}
                        fullWidth
                        helperText={touched.statusChangeReason && errors.statusChangeReason}
                        name="statusChangeReason"
                        id="statusChangeReason"
                        accessKey="reason"
                        component={AutoCompleteDropdown}
                        required={true}
                        label="statusChangeReason"
                        options={deactivationReasons || []}
                        textFieldProps={{
                          fullWidth: true,
                          margin: "normal",
                          variant: "outlined",
                          label: t("common:common.Status change reason"),
                          id: "statusChangeReason"
                        }}
                      />
                    </Grid>
                    {deactivationReasons?.find((reason)=>reason.id == values?.statusChangeReason)?.needAdditionalInfo && 
                    <Grid item md={12} xs={12}>
                      <TextField
                        error={Boolean(touched.OtherReason && errors.OtherReason)}
                        fullWidth
                        helperText={touched.OtherReason && errors.OtherReason}
                        label={t("common:common.Status change reason")}
                        name="OtherReason"
                        id="OtherReason"
                        onBlur={handleBlur}
                        onChange={handleChange}
                        value={values.OtherReason}
                        variant="outlined"
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
                    disabled={isSubmitting || selectedMemberCollection?.length === 0}
                    type="submit"
                    variant="contained"
                    onClick={async () => {
                      // Mark all fields as touched
                      await setTouched(
                        Object.keys(values).reduce((acc, key) => ({ ...acc, [key]: true }), {})
                      );
                      // Validate the form
                      const formErrors = await validateForm();
                      // If no errors, submit
                      if (Object.keys(formErrors).length === 0) {
                        handleSubmit();
                      }
                    }}
                    startIcon={<SaveIcon size="small" />}
                    id="submit"
                  >
                    {mode === 'add' ? t("common:family.Save Family") : t("common:family.Update Family")}
                  </Button>
                  <CancelButton
                    isSubmitting={isSubmitting}
                    id="cancel"
                    onClick={() => {
                      if (isFormDirty(initialValues, values)) {
                        ModalService.open(({ close }) => (
                          <Box
                            sx={{
                              mt: 1,
                              display: 'flex',
                              flexDirection: 'column',
                              gap: 2.5,
                              minWidth: 320,
                              maxWidth: 600,
                            }}
                          >
                            <Box sx={{ textAlign: 'left' }}>
                              <Typography
                                variant="body1"
                                sx={{
                                  mb: 1,
                                  color: 'text.primary'
                                }}
                              >
                                {t('common:common.You have unsaved changes,which will be lost if you leave the page?', 'You have unsaved changes, which will be lost if you leave the page')}
                              </Typography>

                              <Typography
                                variant="body1"
                                sx={{
                                  color: 'text.primary',
                                  lineHeight: 1.5
                                }}
                              >
                                {t('common:common.Are you sure you want to leave this page?', "Are you sure you want to leave this page?")}
                              </Typography>
                            </Box>

                            <Box
                              sx={{
                                display: 'flex',
                                gap: 2,
                                mt: 1
                              }}
                            >
                              <Button
                                variant="outlined"
                                onClick={close}
                               
                                sx={{
                                  flex: 1,
                                  py: 1.5,
                                  fontWeight: 500,
                                  textTransform: 'none',
                                  borderColor: '#000',
                                  color: '#000',
                                }}
                              >
                                {t('common:common.No,stay', "No, stay")}
                              </Button>

                              <Button
                                variant="contained"
                                color="primary"
                                onClick={() => {
                                  navigate(-1);
                                  close();
                                }}
                                sx={{
                                  flex: 1,
                                  py: 1.5,
                                  fontWeight: 500,
                                  textTransform: 'none'
                                }}
                              >
                                {t('common:common.Yes,leave page', "Yes, leave page")}
                              </Button>
                            </Box>
                          </Box>
                        ), {
                          modalTitle: t('common:common.Are you sure you want to leave this page?',"Are you sure you want to leave this page?"),
                          width: '35%',
                          hideModalFooter: true,
                          enableClose: true,
                        });
                      } else {
                        navigate(-1);
                      }
                    }} />
                </Box>
              </Box>
            </Card>
          </Form>
        );
      }}
    </Formik>
  );
};

export default AddFamilyForm;
