import { useCallback, useContext, useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import * as Yup from "yup";
import { Formik, Form } from "formik";
import { LocalizationProvider } from "@mui/x-date-pickers";
import {
    Box,
    Button,
    Card,
    Grid,
    Typography,
    Skeleton,
} from "@mui/material";
import { CommonDataContext } from "../../../common/contexts/CommonDataContext";
import APIS from "../../../common/hooks/UseApiCalls";
import Loader from "../../../components/UserComponents/Loader";
import { CASEWORKER } from "../../../helpers/constant";
import { ModalService } from "../../../components/Modal";
import CancelButton from "../../../components/UserComponents/CancelButton";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { familyAdditionalDetails, familyAddressDetails, familyBasicDetails } from "./Configs/FamilyFormConfig";
import DynamicForm from "./Components/DynamicForm";
import FormSectionHeading from "./Components/FormSectionHeading";
import InlineMemberCreation from "./Components/InlineMemberCreation";
import AccordionSection from "./Components/AccordionSection";
import dayjs from "dayjs";
import { isEqual } from "lodash";
import CloseCaseModal from "./Components/CaseClose";
import { MonthDayYearFormatter } from "../../../constants";


const ManageFamilyForm = (props) => {

    const location = useLocation();
    const mode = location.state?.mode;
    const { family, careGiver } = props;
    const { t } = useTranslation(["common"]);
    const navigate = useNavigate();
    const { locationList, getFamilyList, relationList, htLanguagesList, situationsAndGoals, signedinUserRoleHT, getTsFamilyListData, familyDropdownLists } =
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
    const [initialChildIds, setInitialChildIds] = useState(false)
    const [initalPrimaryCaregiverId, setInitalPrimaryCaregiverId] = useState(null)
    const initialValuesRef = useRef();
    const valuesRef = useRef();
    const isFormDirtyRef = useRef();
    const defaultMember = useRef({
        TWFamilyRelationId: "",
        isActive: true,
        isMajor: false,
        isChild: false,
        isPrimaryCaregiver: true,
        firstName:null,
        lastName:null,
        dateOfBirth:null,
        _rowKey: crypto.randomUUID(),
    }).current;

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
    }, [])


    const disableButtons = (values, isSubmitting, checked) => {
        const isDisabled =
            isSubmitting ||
            (!checked && family?.id)
        return isDisabled;
    };

    const isFormDirty = (initial, current) => {
        // Compare only relevant fields
        const initialChildSet = new Set(initialChildIds || []);
        const selectedChildSet = new Set(selectedChildId || []);
        const areChildIdsSame =
            initialChildSet.size === selectedChildSet.size &&
            [...initialChildSet].every((id) => selectedChildSet.has(id));
        const initialId = initalPrimaryCaregiverId ?? null;
        const currentId = primaryCaregiver?.id ?? null;
        const isPrimaryCaregiverChanged = initialId !== currentId;
        return (
            Object.keys(initial).some(key => initial[key] !== current[key] || family?.isActive !== checked)
            || !areChildIdsSame || isPrimaryCaregiverChanged
        );
    }

    const normalizeMembers = members =>
        members.map(m => {
            const isMinor =
                "isMinor" in m ? m.isMinor :
                    "isMajor" in m ? !m.isMajor :
                        undefined;

            const { isMajor, ...rest } = m;
            // Keep isChild as is
            return { ...rest, isMinor };
        });

    const diffObject = (current, initial) =>
        Object.keys(current).reduce((acc, key) => {
            if (!isEqual(current[key], initial?.[key])) {
                acc[key] = current[key];
            }
            return acc;
        }, {});

    const diffMembers = (current = [], initial = []) => {
        const initialMap = new Map(initial.map(m => [m.id, m]));

        return current.reduce((acc, member) => {
            const prev = initialMap.get(member.id);

            // New member
            if (!prev) {
                acc.push(member);
                return acc;
            }

            const memberDiff = diffObject(member, prev);

            if (Object.keys(memberDiff).length) {
                acc.push({ id: member.id, isChild: member.isChild, ...memberDiff });
            }

            return acc;
        }, []);
    };

    const getChangedValues = (values, initialValues) => {
        const normalizedValues = {
            ...values,
            members: normalizeMembers(values.members),
        };

        const normalizedInitial = {
            ...initialValues,
            members: normalizeMembers(initialValues.members),
        };

        const diff = diffObject(normalizedValues, normalizedInitial);

        // Handle members separately
        if (diff.members) {
            const membersDiff = diffMembers(
                normalizedValues.members,
                normalizedInitial.members
            );

            if (membersDiff.length) {
                diff.members = membersDiff;
            } else {
                delete diff.members;
            }
        }

        return diff;
    };

    const handleNavigateFamilyForm = (values, initialValues) => {
        let changedValues = getChangedValues(values, initialValues);
        if (Object.keys(changedValues).length === 0) {
            navigate(-1);
            return;
        } else {
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
                modalTitle: t('common:common.Are you sure you want to leave this page?', "Are you sure you want to leave this page?"),
                width: '30%',
                hideModalFooter: true,
                enableClose: true,
            });
        }
    }


    const handleCloseCase = async (familyClosureDate, deactivationReason) => {
        setIsLoading(true);
        const deativationReasonText = familyDropdownLists?.familyDeactivateReason?.find(reason => reason.id === deactivationReason)?.value;
        await APIS.CloseCase({
            TWFamilyId: family.id,
            familyClosureDate,
            reason: deativationReasonText,
        })
            .then((res) => {
                if (res && res.data && res.status === 200) {
                    ModalService.open(({ close }) => (
                        <Box>
                            <Button fullWidth variant="contained" onClick={() => {
                                close();
                                navigate(`/dashboard/families/${family.id}/view`);
                            }}>
                                {t('common:common.Ok', "Ok")}
                            </Button>
                        </Box>
                    ), {
                        modalTitle: t('common:family.This family’s case has been closed', "This family’s case has been closed"),
                        width: '30%',
                        hideModalFooter: true,
                        enableClose: false,
                    });
                }
            })
            .catch(() => {
                toast.error(t("common:common.Something went wrong"));
            })
            .finally(() => {
                setIsLoading(false);
            });
    }

    const handleReopenFamily = async () => {
        setIsLoading(true);
        await APIS.ReOpenCase({
            TWFamilyId: family.id,       
        }).then((res) => {
            if (res && res.data && res.status === 200) {
                ModalService.open(({ close }) => (
                    <Box>
                        <Button fullWidth variant="contained" onClick={() => {
                            close();
                            navigate(`/dashboard/families/${family.id}/view`);
                        }}>
                            {t('common:common.Ok', "Ok")}
                        </Button>
                    </Box>
                ), {
                    modalTitle: t('common:family.This family’s case has been re-opened', "This family’s case has been re-opened"),
                    width: '30%',
                    hideModalFooter: true,
                    enableClose: false,
                });
        }
        }).catch(() => {
            toast.error(t("common:common.Something went wrong"));
        }).finally(() => {
            setIsLoading(false);
        });
    }
    

    return (
        <Formik
            enableReinitialize={true}
            validateOnChange={true}
            validateOnBlur={true}
            initialValues={{
                familyName: family?.familyName || null,
                TWAccountId: localStorage.getItem("orgId"),
                address1: family?.contactInformation?.addressLine1 || null,
                address2: family?.contactInformation?.addressLine2 || null,
                country: family?.contactInformation?.TWCountryId || localStorage.getItem("userRegion"),
                state: family?.contactInformation?.TWStateId || null,
                district: family?.contactInformation?.TWDistrictId || null,
                language: family?.additionalInformation?.TWLanguageId || null,
                family_situation: family?.additionalInformation?.TWFamilySituationId || null,
                family_type: family?.additionalInformation?.TWFamilyTypeId || null,
                goal: family?.additionalInformation?.TWFamilyGoalId || null,
                caseWorker: [CASEWORKER].includes(signedinUserRoleHT) ? localStorage.getItem("username") : family?.caseworkerId || null,
                city: family?.contactInformation?.city || null,
                zip_code: family?.contactInformation?.zipCode
                    ? family?.contactInformation?.zipCode?.length > 6
                        ? family?.contactInformation?.zipCode.slice(0, 5) + "-" + family?.contactInformation?.zipCode.slice(5)
                        : family?.contactInformation?.zipCode
                    : "",
                statusChangeReason: "",
                OtherReason: "",
                licenceNumber: family?.additionalInformation?.licenceNumber || null,
                DateStartedasFP: family?.additionalInformation?.DateStartedasFP || null,
                numberOfChildren: family?.numberOfChildren || null,
                familyClosureDate: family?.familyClosureDate || null,
                members: family?.members?.map(({ isMinor, ...rest }) => ({
                    ...rest,
                    isMajor: !isMinor,
                })) || [defaultMember],
                isActive: family?.isActive ?? true,
                submit: null,
            }}
            validationSchema={Yup.object().shape({
                familyName: Yup.string()
                    .max(255)
                    .nullable()
                    .required(t("common:warnings.Family Name is required", "Family Name is required")),
                address1: Yup.string()
                    .nullable()
                    .max(255),
                //.required(t("common:warnings.Address Line 1 is required", "Address Line 1 is required")),
                address2: Yup.string()
                    .nullable()
                    .max(255),
                country: Yup.string()
                    .nullable()
                    .max(255),
                // .required(t("common:warnings.Country is required", "Country is required")),
                city: Yup.string()
                    .nullable()
                    .max(255),
                //.required(t("common:warnings.City is required", "City is required")),
                zip_code: Yup.string()
                    .nullable()
                    .test({
                        name: "zip-format-validation",
                        message: t("common:warnings.Invalid ZIP code format", "Invalid ZIP code format"),
                        test: function (zip_code) {
                            const country = this.parent.country;
                            if (!zip_code) return true; // Allow empty zip code
                            const countryObj = locationList.find((obj) => obj.id == country);
                            if (countryObj?.isoCode?.toUpperCase() === "IND") {
                                return /^\d{6}$/.test(zip_code);
                            } else {
                                return /^\d{5}$/.test(zip_code);
                            }
                        },
                    }),
                language: Yup.string()
                    .max(255).nullable(),
                goal: Yup.string()
                    .nullable()
                    .max(255),
                //.required(t("common:warnings.Goal is required", "Goal is required")),
                family_situation: Yup.string()
                    .nullable()
                    .max(255),
                //  .required(t("common:warnings.Family situation is required", "Family situation is required")),
                family_type: Yup.string()
                    .nullable()
                    .max(255),
                //.required(t("common:warnings.Family type is required", "Family type is required")),
                caseWorker: Yup.string()
                    .max(255)
                    .nullable()
                    .required(t("common:warnings.Case Worker is required", "Case Worker is required")),
                state: Yup.string()
                    .nullable()
                    .max(255),
                //.required(t("common:warnings.State is required", "State is required")),
                district: Yup.string()
                    .nullable()
                    .max(255),
                licenceNumber: Yup.string()
                    .nullable()
                    .max(25),
                DateStartedasFP: Yup.string()
                    .nullable()
                    .max(dayjs().endOf('day').toDate(), t("common:warnings.Date cannot be in the future", "Date cannot be in the future")),
                
                members: Yup.array().of(
                    Yup.object().shape({
                        TWFamilyRelationId: Yup.string()
                            .nullable()
                            .max(255),
                        firstName: Yup.string()
                            .nullable()
                            .max(255)
                            .when('TWFamilyRelationId', (TWFamilyRelationId, schema) => {
                                return TWFamilyRelationId ? schema.required('First Name is required') : schema;
                            }),
                        lastName: Yup.string()
                            .nullable()
                            .max(255),
                        dateOfBirth: Yup.date()
                            .nullable()
                            .when('TWFamilyRelationId', (TWFamilyRelationId, schema) => {
                                return ["3", "9"].includes(TWFamilyRelationId) ? schema.required('DOB is required') : schema;
                            }),
                        gender: Yup.string()
                            .nullable()
                            .max(255)
                            .when('TWFamilyRelationId', (TWFamilyRelationId, schema) => {
                                return ["3", "9"].includes(TWFamilyRelationId) ? schema.required('Gender is required') : schema;
                            }),
                        isMajor: Yup.boolean(),
                        isChild: Yup.boolean(),
                        isPrimaryCaregiver: Yup.boolean(),
                        isActive:Yup.boolean()
                    })
                )

            })}
            onSubmit={async (
                values,
                { resetForm, setErrors, setTouched, setStatus, setSubmitting }
            ) => {
                setIsLoading(true);
                try {
                    if (mode === 'add') {
                        let payload = {
                            "familyName": values?.familyName?.trim(),
                            "TWUserId": values?.caseWorker,
                            "contactInformation": {
                                ...(values.address1 && { "addressLine1": values.address1.trim() }),
                                ...(values.address2 && { "addressLine2": values.address2?.trim() }),
                                ...(values.zip_code && { "zipCode": values.zip_code?.trim() }),
                                ...(values.city && { "city": values.city?.trim() }),
                                ...(values.country && { "TWCountryId": values.country }),
                                ...(values.state && { "TWStateId": values.state }),
                                ...(values.district && { "TWDistrictId": values.district }),
                            },
                            "additionalInformation": {
                                ...(values.language && { "TWLanguageId": values.language }),
                                ...(values.family_situation && { "TWFamilySituationId": values.family_situation }),
                                ...(values.family_type && { "TWFamilyTypeId": values.family_type }),
                                ...(values.goal && { "TWFamilyGoalId": values.goal }),
                                ...(values.licenceNumber && { "licenceNumber": values.licenceNumber?.trim() }),
                                ...(values.DateStartedasFP && { "DateStartedasFP": values.DateStartedasFP }),
                            },
                            "newFamilyMembers": values.members
                                .filter(member => !member.id && !!member.TWFamilyRelationId && !member.isDeleted)
                                .map(({ isMajor, ...rest }) => ({ ...rest, isMinor: !isMajor })),
                            "existingChildren": values.members
                                .filter(member => member.isExistingChild && !member.isDeleted)
                                .map(({ isChild, isMajor, isActive, isExistingChild, ...rest }) => ({ ...rest, isMinor: !rest.isMajor })),
                        };


                        await APIS.CreateFamily(payload).then((res) => {
                            if (res && res.data && res.status === 200) {
                                resetForm();
                                setStatus({ success: true });
                                //getFamilyList();
                                setSubmitting(false);
                                toast.success(t("common:family.Family Added Successfully"));
                                // getTsFamilyListData();
                                navigate("/dashboard/families");
                            } else {
                                toast.error(t("common:common.Something went wrong"));
                                setIsLoading(false);
                                setStatus({ success: false });
                                setSubmitting(false);
                            }
                        });
                    } else {
                        const changedValues = getChangedValues(values, initialValuesRef.current);
                        console.log("changedValues", changedValues);
                        if (Object.keys(changedValues).length === 0) {
                            setIsLoading(false);
                            return;
                        }

                        const stripMemberMeta = ({ isChild, isActive, isExistingChild,isMajor, ...rest }) => rest;

                        const members = changedValues.members ?? [];
                        const caseWorkerChanged = !!changedValues.caseWorker;

                        const changedChildrenById = Object.fromEntries(
                            members
                                .filter(m => m.id && m.isChild && !m.isDeleted)
                                .map(m => [m.id, m])
                        );

                        const existingChildren = caseWorkerChanged
                            ? (values.members ?? [])
                                .filter(m => m.id && m.isChild && !m.isDeleted)
                                .map(m => {
                                    const changed = changedChildrenById[m.id];
                                    if (!changed) return { id: m.id };
                                    const { isChild, isActive, isExistingChild, ...changedClean } = changed;
                                    return { id: m.id, ...changedClean };
                                })
                            : members
                                .filter(m => m.id && m.isChild && !m.isDeleted)
                                .map(stripMemberMeta);

                        const hasKey = (key) => key in changedValues;

                        const contactInfo = {
                            ...(hasKey('address1') && { addressLine1: changedValues.address1?.trim() || null }),
                            ...(hasKey('address2') && { addressLine2: changedValues.address2?.trim() || null }),
                            ...(hasKey('zip_code') && { zipCode: changedValues.zip_code?.trim() || null }),
                            ...(hasKey('city') && { city: changedValues.city?.trim() || null }),
                            ...(hasKey('country') && { TWCountryId: changedValues.country || null }),
                            ...(hasKey('state') && { TWStateId: changedValues.state || null }),
                            ...(hasKey('district') && { TWDistrictId: changedValues.district || null }),
                        };

                        const additionalInfo = {
                            ...(hasKey('language') && { TWLanguageId: changedValues.language || null }),
                            ...(hasKey('family_situation') && { TWFamilySituationId: changedValues.family_situation || null }),
                            ...(hasKey('family_type') && { TWFamilyTypeId: changedValues.family_type || null }),
                            ...(hasKey('goal') && { TWFamilyGoalId: changedValues.goal || null }),
                            ...(hasKey('licenceNumber') && { licenceNumber: changedValues.licenceNumber?.trim() || null }),
                            ...(hasKey('DateStartedasFP') && { DateStartedasFP: changedValues.DateStartedasFP || null }),
                        };
                        const payload = {
                            id: family?.id,
                            TWUserId: values?.caseWorker,
                            ...(changedValues.familyName && { familyName: changedValues.familyName.trim() }),
                            ...(Object.keys(contactInfo).length && { contactInformation: contactInfo }),
                            ...(Object.keys(additionalInfo).length && { additionalInformation: additionalInfo }),
                            existingMembers: members
                                .filter(m => m.id && !m.isChild && !m.isDeleted)
                                .map(({ isChild,TWFamilyId,isActive,profileInformation, ...rest }) => rest),
                            newFamilyMembers: members
                                .filter(m => !m.id && !!m.TWFamilyRelationId && !m.isDeleted)
                                .map(({ _rowKey, ...rest }) => ({ ...rest })),
                            existingChildren,
                            removedMembers: members
                                .filter(m => m.id && m.isDeleted && !m.isChild)
                                .map(m => m.id),
                            removedChildren: members
                                .filter(m => m.id && m.isDeleted && m.isChild)
                                .map(m => m.id),
                        };
                        await APIS.UpdateFamily(payload).then(async (res) => {
                            if (res && res.data && res.status === 200) {
                                setStatus({ success: true });
                                setSubmitting(false);
                                toast.success(t("common:family.Family Updated Successfully"));
                                //getTsFamilyListData();
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
                }
                return (
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                        <Form
                            onSubmit={handleSubmit}
                            id="add-family-form"
                        >
                            <Loader loading={isLoading} />
                            <Card sx={{ maxWidth: "80vw" }}>
                                <Box sx={{ m: 2, mt: 3 }}>
                                    <fieldset disabled={false} style={{ border: "none", padding: 0 }}>
                                        <Grid container spacing={3}>
                                            <Grid item md={12} xs={12}>
                                                <FormSectionHeading>
                                                    <Box display="flex" alignItems="baseline" sx={{ overflow: 'hidden' }}>
                                                        {t("common:family.Family Details", "Family Details")}
                                                        <Typography
                                                            id="modal-modal-extra-title"
                                                            fontSize="1.25rem"
                                                            fontWeight={700}
                                                            lineHeight="125%"
                                                            sx={{
                                                                pl: 1,
                                                                color: '#F37123',
                                                                overflow: 'hidden',
                                                                textOverflow: 'ellipsis',
                                                                whiteSpace: 'nowrap'
                                                            }}
                                                        >
                                                            {!family?.isActive && family?.id ? `${t("common:family.Deactivated", "Deactivated")} ${MonthDayYearFormatter(family?.deactivationDate,"short")}` : t("common:family.Active", "Active")}
                                                        </Typography>
                                                    </Box>
                                                </FormSectionHeading>
                                            </Grid>
                                            <DynamicForm
                                                t={t}
                                                values={values}
                                                errors={errors}
                                                touched={touched}
                                                handleChange={handleChange}
                                                handleBlur={handleBlur}
                                                situationsAndGoals={situationsAndGoals}
                                                locationList={locationList}
                                                htLanguagesList={htLanguagesList}
                                                caseWorkerList={caseWorkerList}
                                                config={familyBasicDetails}
                                                setFieldValue={setFieldValue}
                                                isDisabled={family?.isActive === false}
                                            />
                                            <AccordionSection
                                                title={t("common:common.Family Members", "Family Members")}
                                                defaultExpanded={true}
                                            >
                                                <Grid container spacing={1}>
                                                    <Grid item md={12} xs={12}>
                                                        {memberListLoading ? (
                                                            <Box sx={{ mt: 2 }}>
                                                                {family?.members?.map((member, index) => (
                                                                    <Skeleton
                                                                        key={index}
                                                                        variant="rectangular"
                                                                        animation="wave"
                                                                        height={50}

                                                                        width="100%"
                                                                        sx={{ mb: 1 }}
                                                                    />
                                                                ))}
                                                            </Box>
                                                        ) : (
                                                            <>
                                                                <InlineMemberCreation
                                                                    selectedMemberCollection={selectedMemberCollection || values.members.filter(member => !member.isChild)}
                                                                    relationList={relationList}
                                                                    familyId={family?.id}
                                                                    familyName={values.familyName}
                                                                    caseWorker={values?.caseWorker}                                                   
                                                                    //isFamilyActive={family?.id ? checked : true}
                                                                    setIsLoading={setIsLoading}
                                                                    familyRelations={familyDropdownLists.familyRelations || []}
                                                                    isFamilyActive={family?.isActive }
                                                                />
                                                            </>
                                                        )}
                                                    </Grid>
                                                </Grid>
                                            </AccordionSection>
                                            <AccordionSection
                                                title={t("common:family.Family contact information", "Family contact information")}
                                            >
                                                <Grid container spacing={1}>
                                                    <DynamicForm
                                                        t={t}
                                                        values={values}
                                                        errors={errors}
                                                        touched={touched}
                                                        handleChange={handleChange}
                                                        handleBlur={handleBlur}
                                                        setFieldValue={setFieldValue}
                                                        locationList={locationList}
                                                        htLanguagesList={htLanguagesList}
                                                        caseWorkerList={caseWorkerList}
                                                        config={familyAddressDetails}
                                                        isDisabled={family?.isActive === false}

                                                    />
                                                </Grid>
                                            </AccordionSection>
                                            <AccordionSection
                                                title={t("common:family.Additional information", "Additional information")}
                                            >
                                                <Grid container spacing={1}>
                                                    <DynamicForm
                                                        t={t}
                                                        values={values}
                                                        errors={errors}
                                                        touched={touched}
                                                        handleChange={handleChange}
                                                        handleBlur={handleBlur}
                                                        setFieldValue={setFieldValue}
                                                        situationsAndGoals={situationsAndGoals}
                                                        locationList={locationList}
                                                        htLanguagesList={htLanguagesList}
                                                        caseWorkerList={caseWorkerList}
                                                        config={familyAdditionalDetails}
                                                        dropdownValues={familyDropdownLists}
                                                        isDisabled={family?.isActive === false}
                                                    />
                                                </Grid>
                                            </AccordionSection>
                                        </Grid>
                                    </fieldset>
                                    <Box
                                        sx={{
                                            mt: 2,
                                            display: "flex",
                                            flexDirection: "row",
                                            justifyContent: "space-between",
                                            gap: 1.5,
                                        }}
                                    >
                                        <Button
                                            variant="outlined"
                                            disabled={isSubmitting}
                                            sx={{ visibility: family?.id && family?.isActive ? "visible" : "hidden" }}
                                            id="close-case-button"
                                            onClick={() => {
                                                ModalService.open(
                                                    ({ close }) => (
                                                        <CloseCaseModal
                                                            onClose={close}
                                                            onSubmit={async ({ familyClosureDate, deactivationReason }) => {
                                                                await handleCloseCase(familyClosureDate, deactivationReason);
                                                                close();
                                                            }}
                                                            deactivationReasons={familyDropdownLists.familyDeactivateReason || []}
                                                        />
                                                    ),
                                                    {
                                                        modalTitle: t("common:family.Close case", "Close case"),
                                                        width: '30%',
                                                        hideModalFooter: true,
                                                        enableClose: true,
                                                    }
                                                );
                                            }}
                                        >
                                            {t("common:common.Close case", "Close case")}
                                        </Button>
                                        {family?.id && !family?.isActive ? (
                                            <Box sx={{ display: "flex", gap: 1.5 }}>
                                                <Button
                                                    color="primary"
                                                    disabled={isSubmitting}
                                                    type="submit"
                                                    variant="outlined"
                                                    onClick={async () => {
                                                      handleReopenFamily();
                                                    }}
                                                >
                                                    {t("common:family.Re Open Case", "Re Open Case")}
                                                </Button> 
                                                <Button
                                                    variant="contained"
                                                    id="close"
                                                    onClick={() => {
                                                      navigate(-1)
                                                    }}
                                                >
                                                    {t("common:family.Close", "Close")}
                                                </Button>
                                            </Box>
                                        ) : (
                                            <Box sx={{ display: "flex", gap: 1.5 }}>
                                                <CancelButton
                                                    isSubmitting={isSubmitting}
                                                    id="cancel"
                                                    onClick={() => {
                                                        handleNavigateFamilyForm(values, initialValuesRef.current);
                                                    }
                                                    }
                                                />
                                                <Button
                                                    color="primary"
                                                    disabled={isSubmitting}
                                                    type="submit"
                                                    variant="contained"
                                                    onClick={async () => {
                                                        await setTouched(
                                                            Object.keys(values).reduce((acc, key) => ({ ...acc, [key]: true }), {})
                                                        );
                                                        const formErrors = await validateForm();
                                                        if (Object.keys(formErrors).length === 0) {
                                                            handleSubmit();
                                                        }
                                                    }}
                                                    id="submit"
                                                >
                                                    {mode === 'add' ? t("common:family.Save Family") : t("common:family.Update Family")}
                                                </Button>
                                            </Box>
                                        )}                                       
                                    </Box>
                                </Box>
                            </Card>
                        </Form>
                    </LocalizationProvider>
                );
            }}
        </Formik>
    );
};

export default ManageFamilyForm;
