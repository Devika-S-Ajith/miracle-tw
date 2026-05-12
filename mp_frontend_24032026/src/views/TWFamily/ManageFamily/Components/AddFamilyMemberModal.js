import { useCallback, useContext, useEffect, useRef, useState } from 'react';
import { Box, Button, Grid, Typography } from '@mui/material';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { useTranslation } from 'react-i18next';
import { CommonDataContext } from '../../../../common/contexts/CommonDataContext';
import APIS from '../../../../common/hooks/UseApiCalls';
import { validatePhoneNumber } from '../../../../helpers/helperFunction';
import Loader from '../../../../components/UserComponents/Loader';
import { ModalService } from '../../../../components/Modal/ModalRoot';
import DynamicForm from './DynamicForm';
import { modalMemberBasicFormConfig, modalMemberPersonalFormConfig, modalMemberUserFormConfig } from '../Configs/MemberFormConfig';
import AccordionSection from './AccordionSection';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import { DateFormatFromRegion } from '../../../../constants';
import RadioGroupList from './RadioGroupList';
import CalendarIcon from '../../../../assets/icons/CalendarIcon';
import SmallText from '../../../../components/SmallText/SmallText';
import { debounce } from 'lodash';



const getChangedValues = (values, initial) =>
    Object.keys(values).reduce((acc, key) => {
        if (values[key] !== initial[key]) acc[key] = values[key];
        return acc;
    }, {});

const AddFamilyMemberModal = ({ onClose, getMemberDetails,familyId, member, isFamilyActive = true, isMemberActive = true, dropdownValues = {} }) => {
    const { relationList, locationList } = useContext(CommonDataContext);
    const { t } = useTranslation(['common']);
    const phoneRef = useRef({});
    const [loading, setLoading] = useState(false);
    const {id,_rowKey,firstName,lastName,TWFamilyRelationId,isMajor,isChild,isActive, profileInformation } = member || {};
    const { phoneNumber, occupation, notes, appAccessEnabled, email } = profileInformation || {};


    const deactivationReasons = [
        { id: 1572, label: "Chose not to continue particpation" },
        { id: 4829, label: "Graduated from program" },
        { id: 1573, label: "Inactive" },
        { id: 9204, label: "Lost contact" },
        { id: 3618, label: "Services no longer needed" },
        { id: 7452, label: "Other" },
    ];

    const buildInitialValues = useCallback(() => ({
        member_id:id || "",
        firstName: firstName || "",
        lastName: lastName || "",
        TWFamilyRelationId: TWFamilyRelationId || "",
        isMajor: isMajor || false,
        occupation: occupation || "",
        phoneNumber: phoneNumber || "",
        appAccessEnabled: appAccessEnabled ?? false,
        email: email || "",
        note: notes || "",
        isActive: isActive ?? true,
    }), [id, firstName, lastName, TWFamilyRelationId, isMajor, occupation, phoneNumber, appAccessEnabled, email, notes, isActive]);

    const initialValuesRef = useRef(buildInitialValues());
    const valuesRef = useRef(initialValuesRef.current);

    useEffect(() => {
        initialValuesRef.current = buildInitialValues();
    }, [member]);

    const handleResponse = useCallback((payload) => {
        getMemberDetails?.(payload);
        onClose();
    }, [getMemberDetails, onClose]);

    const handleCancelClick = useCallback(() => {
    
       let changedValues = getChangedValues(valuesRef.current, initialValuesRef.current);


        if (changedValues && Object.keys(changedValues).length > 0) {
            onClose();
            return;
        }
        ModalService.open(null, {
            modalDescription: t(
                'common:common.You have unsaved changes. Are you sure you want to leave?',
                'You have unsaved changes. Are you sure you want to leave?'
            ),
            cancelButtonText: t('common:common.Stay', 'Stay'),
            actionButtonText: t('common:common.Discard', 'Discard'),
            hideModalFooter: false,
            hideActionButton: false,
            onAction: onClose,
        });
    }, [onClose, t]);

    const handleDeactivate = useCallback(() => {
        ModalService.open(({ close }) => (
            <LocalizationProvider dateAdapter={AdapterDayjs}>
                <Box sx={{ p: 3 }}>
                    <Typography variant="body1" sx={{ mb: 2 }}>
                        {t(
                            `common:child.Closing a family's case also closes the cases for all family members and children in the family.`,
                            `Closing a family's case also closes the cases for all family members and children in the family.`
                        )}
                    </Typography>
                    <Box sx={{ mb: 2 }}>
                        <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold' }}>
                            {t('common:family.Date of deactivation', 'Date of deactivation')}
                        </Typography>
                        <DatePicker
                            value={valuesRef.current.memberClosureDate ? dayjs(valuesRef.current.memberClosureDate) : null}
                            format={DateFormatFromRegion(true)}
                            onChange={(newValue) => valuesRef.current.memberClosureDate = newValue}
                            maxDate={dayjs().endOf('day')}
                            slots={{ openPickerIcon: CalendarIcon }}
                            slotProps={{
                                textField: {
                                    fullWidth: true,
                                    required: true,
                                    variant: "outlined",
                                    placeholder: "",
                                },
                            }}
                        />
                    </Box>
                    <Box sx={{ p: 2, borderRadius: 1, mb: 3 }}>
                        <SmallText value={t('common:family. Why is this person being deactivated?', 'Why is this person being deactivated?')} />
                        <RadioGroupList
                            name="deactivationReason"
                            options={deactivationReasons}
                            value={valuesRef.current.deactivationReason}
                            onChange={(e) => valuesRef.current.deactivationReason = e.target.value}
                            renderPrimary={(option) => <SmallText value={option.label} />}
                        />
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>  
                        <Button variant="outlined" fullWidth onClick={close}>
                            {t('common:common.No,Cancel', 'No, Cancel')}
                        </Button>
                        <Button
                            variant="contained"
                            fullWidth
                            type="button"
                            onClick={() => {
                                handleToggleMemberStatus({
                                    id: id,
                                    TWFamilyId: familyId,
                                    deactivationDate: valuesRef.current.memberClosureDate,
                                    reason: valuesRef.current.deactivationReason,
                                    isActive: false,
                                    isChild: isChild,
                                });
                                close();
                            }}
                        >
                            {t('common:common.Yes, deactivate', 'Yes, deactivate')}
                        </Button>
                    </Box>
                </Box>
            </LocalizationProvider>
        ), {
            modalTitle: t('common:family.Deactivate this family member?', 'Deactivate this family member?'),
            width: '30%',
            hideModalFooter: true,
            enableClose: true,
        });
    }, [deactivationReasons, t]);

    const handleToggleMemberStatus = useCallback(async (payload) => {
        setLoading(true);
        try {
            await APIS.UpdateFamilyMember(payload).then(() => {
                handleResponse({id: payload.id, isActive: payload.isActive, isChild: payload.isChild});
            });
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    }, []);

    const debouncedCheckEmail = debounce(async (email,resolve) => {
        try {
            const res = await APIS.CheckUserEmailExists(email,id);
            resolve(res?.status === 200 && res?.data?.message === "EMAIL_EXIST");
        } catch {
            resolve(true);
        }
    }, 500);

    return (
        <Formik
            enableReinitialize={true}
            initialValues={buildInitialValues()}
            validationSchema={Yup.object().shape({
                firstName: Yup.string()
                    .max(255)
                    .required(t("common:warnings.First Name is required")),
                lastName: Yup.string()
                    .max(255)
                    .required(t("common:warnings.Last Name is required")),
                email: Yup.string()
                    .test('unique-email', 'Email already in use', function (value) {
                        // Skip API call if email hasn't passed format validation
                        const { path, createError } = this;
                        if (!value || Yup.string().email().isValidSync(value) === false) {
                            return true; // let .email() above handle the error
                        }

                        return new Promise((resolve) => {
                            debouncedCheckEmail(value, (isExists) => {
                                if (!isExists) resolve(true);
                                else resolve(createError({ path, message: 'Email already in use' }));
                            });
                        })
                    })
                    .when("appAccessEnabled", {
                        is: (appAccessEnabled) => appAccessEnabled === true,
                        then: Yup.string()
                            .max(255)
                            .required(t("common:warnings.Email is required")),
                        otherwise: Yup.string()
                            .email(t("common:warnings.Invalid email format"))
                            .max(255),
                    }),
                occupation: Yup.string().max(255),
                TWFamilyRelationId: Yup.string().max(255),
                phoneNumber: Yup.string()
                          .required(t("common:warnings.Phone Number is required"))
                          .test(
                            "phone-format-validation",
                            t("common:warnings.Invalid Phone number"),
                            (value) => validatePhoneNumber(value, phoneRef, {required: true}),
                          ),
                isMinor: Yup.boolean(),
                note: Yup.string().max(500),
                appAccessEnabled: Yup.boolean(),
                isActive: Yup.boolean(),
            })}
            onSubmit={async (values, { setErrors, setStatus, setSubmitting }) => {
                setLoading(true);

                if (!values.isMajor) {
                    setLoading(false);
                    ModalService.open(null, {
                        modalDescription: t(
                            'common:common.Please confirm that this person is over the legal age of consent If this person is under the legal age of consent enter them as a child',
                            'Please confirm that this person is over the legal age of consent. If this person is under the legal age of consent, enter them as a child.'
                        ),
                        cancelButtonText: t('common:common.Close', 'Cancel'),
                        hideModalFooter: false,
                        hideActionButton: true,
                    });
                    return;
                }

                const changed = getChangedValues(values, initialValuesRef.current);

                const payload = {
                    id: id,
                    ...(familyId && { TWFamilyId: familyId }),
                    ...(isChild !== undefined && { isChild: isChild }),
                    ...(changed.firstName !== undefined && { firstName: changed.firstName?.trim() }),
                    ...(changed.lastName !== undefined && { lastName: changed.lastName?.trim() }),
                    ...(changed.TWFamilyRelationId !== undefined && { TWFamilyRelationId: changed.TWFamilyRelationId }),
                    ...(changed.isMajor !== undefined && { isMinor: !changed.isMajor }),
                    ...(changed.isActive !== undefined && { isActive: changed.isActive }),
                    ...(['phoneNumber', 'occupation', 'note', 'appAccessEnabled', 'email'].some(k => changed[k] !== undefined) && {
                        profileInformation: {
                            ...(changed.phoneNumber !== undefined && { phoneNumber: changed.phoneNumber && changed.phoneNumber.length < 5 ? null : changed.phoneNumber }),
                            ...(changed.occupation !== undefined && { occupation: changed.occupation?.trim() }),
                            ...(changed.note !== undefined && { notes: changed.note?.trim() }),
                            ...(!id
                                ? { appAccessEnabled: values.appAccessEnabled }
                                : changed.appAccessEnabled !== undefined && { appAccessEnabled: changed.appAccessEnabled }
                            ), 
                            ...(changed.email !== undefined && { email: changed.email?.trim() }),
                        },
                    }),
                };

                try {
                    if (id) {
                        await APIS.UpdateFamilyMember(payload).then(() => {
                            handleResponse(payload);
                        });
                    } else {
                        const newPayload = {
                            ...payload,
                            _rowKey: _rowKey,
                        }
                        handleResponse(newPayload);
                    }
                    setLoading(false);
                } catch (err) {
                    console.error(err);
                    setStatus({ success: false });
                    setErrors({ submit: err.message });
                    setSubmitting(false);
                    setLoading(false);
                }
            }}
        >
            {({ errors, handleBlur, handleChange, handleSubmit, isSubmitting, touched, values, setFieldValue }) => {

                // Sync valuesRef every render — safe mutation, does NOT trigger re-render
                valuesRef.current = values;
                return (
                    <fieldset disabled={isSubmitting} style={{ border: "none", padding: 0 }}>
                        <form onSubmit={handleSubmit}>
                            <Loader loading={loading} />
                            <Box mx={-2}>
                                <Box sx={{ maxHeight: "50vh", overflowY: "auto", px: 2 }}>
                                    <Grid container spacing={1}>
                                        <DynamicForm
                                            config={modalMemberBasicFormConfig}
                                            values={values}
                                            errors={errors}
                                            touched={touched}
                                            handleBlur={handleBlur}
                                            relationList={relationList}
                                            handleChange={handleChange}
                                            setFieldValue={setFieldValue}
                                            isDisabled={!(isFamilyActive && isMemberActive)}
                                            dropdownValues={dropdownValues}
                                            t={t}
                                        />
                                        <AccordionSection title={t("common:family.Profile information", "Profile information")}>
                                            <Grid container spacing={1}>
                                                <DynamicForm
                                                    config={modalMemberPersonalFormConfig({phoneRef})}
                                                    values={values}
                                                    errors={errors}
                                                    touched={touched}
                                                    handleBlur={handleBlur}
                                                    handleChange={handleChange}
                                                    setFieldValue={setFieldValue}
                                                    isDisabled={!(isFamilyActive && isMemberActive)}
                                                    phoneRef={phoneRef}
                                                    locationList={locationList}
                                                    t={t}
                                                />
                                            </Grid>
                                        </AccordionSection>
                                        <DynamicForm
                                            config={modalMemberUserFormConfig}
                                            values={values}
                                            errors={errors}
                                            touched={touched}
                                            handleBlur={handleBlur}
                                            handleChange={handleChange}
                                            setFieldValue={setFieldValue}
                                            isDisabled={!(isFamilyActive && isMemberActive)}
                                            t={t}
                                        />
                                    </Grid>
                                </Box>
                            </Box>

                            <Box
                                sx={{
                                    mt: 2,
                                    display: "flex",
                                    flexDirection: "row",
                                    justifyContent: "space-between",
                                    gap: 1.5,
                                }}
                            >
                                {/* Deactivate */}
                                <Button
                                    variant="outlined"
                                    disabled={isSubmitting}
                                    id="close-case-button"
                                    sx={{ visibility: !(id && isMemberActive) ? "hidden" : "visible" }}
                                    onClick={() => {
                                        if (isFamilyActive) {
                                            handleDeactivate();
                                        }
                                    }}
                                >
                                    {t("common:common.Deactivate", "Deactivate")}
                                </Button>

                                <Box sx={{ display: "flex", gap: 1.5 }}>
                                    {/* Activate — view mode only */}
                                    {isFamilyActive && !isMemberActive && (
                                        <Button
                                            color="primary"
                                            disabled={isSubmitting}
                                            variant="outlined"
                                            sx={{ display: (isMemberActive) ? "none" : "inline-flex" }}
                                            onClick={async () => { handleToggleMemberStatus({
                                                id: id,
                                                TWFamilyId: familyId,
                                                isActive: true,
                                                isChild: isChild,
                                            }) }}

                                            id="activate"
                                        >
                                            {t('common:common.Activate', "Activate")}
                                        </Button>
                                    )}

                                    {/* Cancel / Close — stable ref, no inline arrow, no re-render loop */}
                                    <Button
                                        disabled={isSubmitting}
                                        id="cancel"
                                        variant={!(isMemberActive) ? "contained" : "outlined"}
                                        onClick={onClose}
                                    >
                                        {!(isMemberActive) ? t('common:common.Close', "Close") : t('common:common.Cancel', "Cancel")}
                                    </Button>

                                    {/* Save */}
                                    <Button
                                        color="primary"
                                        disabled={isSubmitting}
                                        type="submit"
                                        variant="contained"
                                        sx={{ display: !(isFamilyActive && isMemberActive) ? "none" : "inline-flex" }}
                                        id="submit"
                                    >
                                        {t('common:common.Save', "Save")}
                                    </Button>
                                </Box>
                            </Box>
                        </form>
                    </fieldset>
                );
            }}
        </Formik>
    );
};

export default AddFamilyMemberModal;