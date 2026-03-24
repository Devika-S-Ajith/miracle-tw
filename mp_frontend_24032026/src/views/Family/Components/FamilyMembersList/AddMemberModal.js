import React, { useContext, useRef, useState } from 'react';
import { Box, Button, Divider, Grid, TextField, useTheme, Checkbox, FormControlLabel } from '@mui/material';
import { Formik, Field } from 'formik';
import * as Yup from 'yup';
import { useTranslation } from 'react-i18next';
import AutoCompleteDropdown from '../../../../components/UserComponents/AutoCompleteDropdown';
import { CommonDataContext } from '../../../../common/contexts/CommonDataContext';
import APIS from '../../../../common/hooks/UseApiCalls';
import { PhoneTextInput } from '../../../../components/PhoneTextInput/PhoneTextInput';
import { PhoneNumberUtil } from 'google-libphonenumber';
import { validatePhoneNumber } from '../../../../helpers/helperFunction';
import Loader from '../../../../components/UserComponents/Loader';
import { ModalService } from '../../../../components/Modal/ModalRoot';
const phoneUtil = PhoneNumberUtil.getInstance();

const AddMemberModal = ({ onClose, getMemberDetails, id, member,isDisabled = false }) => {
    const { relationList, locationList } = useContext(CommonDataContext);
    const theme = useTheme();
    const { t } = useTranslation(['common']);
    const phoneRef = useRef({});
    const [loading, setLoading] = useState(false)
    const handleResponse = (res, payload) => {
        if (res && res.status === 200) {
            getMemberDetails?.([{
                firstName: payload?.firstName,
                lastName: payload?.lastName,
                HTFamilyRelationId: payload?.HTFamilyRelationId,
                phoneNumber: payload?.phoneNumber,
                id: res.data?.memberId,
                relation: relationList.find((relation) => relation.id === payload?.HTFamilyRelationId)?.relation,
                occupation: payload?.occupation,
                otherRelation: payload?.otherRelation,
                isChild: false,
                isPrimaryCareGiver: false,
                isMinor: payload?.isMinor
            }]);
            onClose();
        }
    };

    return (
        <Formik
            enableReinitialize={true}
            initialValues={{
                member_id: (member && member.id) || "",
                first_name: (member && member.firstName) || "",
                last_name: (member && member.lastName) || "",
                phone: (member && member.phoneNumber) || "",
                email: (member && member.email) || "",
                occupation: (member && member.occupation) || "",
                member_type: (member && member.HTFamilyMemberTypeId) || "",
                relation: (member && member.HTFamilyRelationId) || "",
                is_primary: (member && member.isPrimaryCareGiver) || false,
                other_relation: (member && member.otherRelation) || "",
                isMinor: (member && member.isMinor !== null) ? !member.isMinor : false,
                submit: null,

            }}
            validationSchema={Yup.object().shape({
                first_name: Yup.string()
                    .max(255)
                    .required(t("common:warnings.First Name is required")),
                last_name: Yup.string().max(255)
                .required(t("common:warnings.Last Name is required")),
                email: Yup.string()
                    .email(t("common:warnings.Must be a valid email"))
                    .max(255),
                occupation: Yup.string().max(255),
                relation: Yup.string()
                    .max(255)
                    .required(t("common:warnings.Relation is required")),
                phone: Yup.string()
                    .required(t("common:warnings.Phone Number is required"))
                    .test(
                        "phone-format-validation",
                        t("common:warnings.Invalid Phone number"),
                        (value) => validatePhoneNumber(value, phoneRef)
                    ),
                other_relation: Yup.string().when("relation", {
                    is: (relation) => relation && relation == "7",
                    then: Yup.string().required(
                        t("common:warnings.Other relation is required")
                    ),
                    otherwise: Yup.string(),
                }),
                isMinor: Yup.boolean(),
            })}
            onSubmit={async (values, { resetForm, setErrors, setStatus, setSubmitting }) => {
                setLoading(true);
                // Check if isMinor is false, show modal and return early
                if (!values.isMinor) {
                    setLoading(false);
                    ModalService.open(
                        null,
                        {
                            modalDescription: t('common:common.Please confirm that this person is over the legal age of consent If this person is under the legal age of consent enter them as a child', "Please confirm that this person is over the legal age of consent. If this person is under the legal age of consent, enter them as a child."),
                            cancelButtonText: t('common:common.Close', "Cancel"),
                            hideModalFooter: false,
                            hideActionButton: true,
                        }
                    );
                    return;
                }
                let payload = {
                    "id": member && member.id,
                    "firstName": values.first_name,
                    "lastName": values.last_name, // not mandatory
                    "occupation": values.occupation,
                    "phoneNumber":  values.phone.length > 5 ? values.phone : null,
                    "email": values.email,
                    //"isPrimaryCareGiver": member && member.isPrimaryCareGiver || false,
                    "HTFamilyId": id || null,
                    "HTFamilyRelationId": values.relation,
                    "otherRelation": values.other_relation,  // not mandatory
                    "HTFamilyMemberTypeId": "1",
                    "isMinor": !values.isMinor
                }
                try {
                    if (member?.id) {
                        await APIS.EditFamilyMember(payload).then((res) => {
                            handleResponse(res, payload);
                        });
                    } else {
                        await APIS.AddFamilyMember(payload).then((res) => {
                            handleResponse(res, payload);
                        });
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
            {({ errors, handleBlur, handleChange, handleReset, handleSubmit, isSubmitting, touched, values, setFieldValue }) => (
                <fieldset disabled={isDisabled || isSubmitting} style={{ border: "none", padding: 0 }}>
                    <form onSubmit={handleSubmit}
                    >
                    <Loader loading={loading} />
                    <Box sx={{ mt: 1 }}>
                        <Divider sx={{ mb: 3 }} />
                        <Grid
                            container
                            spacing={3}
                        >
                            <Grid
                                item
                                md={6}
                                xs={12}
                            >
                                <TextField
                                    error={Boolean(touched.first_name && errors.first_name)}
                                    fullWidth
                                    autoFocus
                                    helperText={touched.first_name && errors.first_name}
                                    label={t('common:common.FirstName')}
                                    name="first_name"
                                    id="first_name"
                                    onBlur={handleBlur}
                                    onChange={handleChange}
                                    required
                                    value={values.first_name}
                                    variant="outlined"
                                />
                            </Grid>
                            <Grid
                                item
                                md={6}
                                xs={12}
                            >
                                <TextField
                                    error={Boolean(touched.last_name && errors.last_name)}
                                    fullWidth
                                    helperText={touched.last_name && errors.last_name}
                                    label={t('common:common.LastName')}
                                    name="last_name"
                                    id="last_name"
                                    onBlur={handleBlur}
                                    onChange={handleChange}
                                    required
                                    value={values.last_name}
                                    variant="outlined"
                                />
                            </Grid>
                            <Grid
                                item
                                md={6}
                                xs={12}
                            >
                                <PhoneTextInput
                                    name={`phone`}
                                    id="phone"
                                    phoneRef={phoneRef}
                                    onBlur={handleBlur}
                                    error={Boolean(touched?.phone && errors?.phone)}
                                    helperText={touched?.phone && errors?.phone}
                                    value={values.phone}
                                    onChange={(phone) => setFieldValue("phone", phone)}
                                    defaultCountry={
                                        locationList?.find(
                                            (obj) =>
                                                obj.id ==
                                                localStorage.getItem("userRegion")
                                        )?.iso2Code
                                    }
                                />
                            </Grid>
                            <Grid
                                item
                                md={6}
                                xs={12}
                            >
                                <TextField
                                    error={Boolean(touched.email && errors.email)}
                                    fullWidth
                                    helperText={touched.email && errors.email}
                                    label={t('common:common.Email')}
                                    id="email"
                                    name="email"
                                    onBlur={handleBlur}
                                    onChange={(e) => {
                                        setFieldValue('email', e.target.value.trim());
                                    }}
                                    value={values.email}
                                    variant="outlined"
                                />
                            </Grid>
                            <Grid
                                item
                                md={6}
                                xs={12}
                            >
                                <TextField
                                    error={Boolean(touched.occupation && errors.occupation)}
                                    fullWidth
                                    helperText={touched.occupation && errors.occupation}
                                    label={t('common:common.Occupation')}
                                    name="occupation"
                                    id="occupation"
                                    onBlur={handleBlur}
                                    onChange={handleChange}
                                    value={values.occupation}
                                    variant="outlined"
                                />
                            </Grid>
                            <Grid
                                item
                                md={6}
                                xs={12}
                                sx={{ mt: -2 }}
                            >
                                <Field
                                    error={Boolean(touched.relation && errors.relation)}
                                    fullWidth
                                    helperText={touched.relation && errors.relation}
                                    name="relation"
                                    id="relation"
                                    accessKey="relation"
                                    required={true}
                                    component={AutoCompleteDropdown}
                                    label="relation"
                                    options={relationList}
                                    textFieldProps={{
                                        fullWidth: true,
                                        margin: "normal",
                                        variant: "outlined",
                                        label: t('common:common.Relationship to Child'),
                                        id: "relation"
                                    }}
                                />
                            </Grid>
                            {values.relation === '7' && <Grid
                                item
                                md={6}
                                xs={12}
                            >
                                <TextField
                                    error={Boolean(touched.other_relation && errors.other_relation)}
                                    fullWidth
                                    helperText={touched.other_relation && errors.other_relation}
                                    label={t('common:common.Other Relation')}
                                    name="other_relation"
                                    id="other_relation"
                                    onBlur={handleBlur}
                                    onChange={handleChange}
                                    value={values.other_relation}
                                    variant="outlined"
                                />
                            </Grid>}
                        </Grid>
                        <Grid
                            item
                            md={12}
                            xs={12}
                        >
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        id="isMinor"
                                        name="isMinor"
                                        checked={values.isMinor}
                                        onChange={e => setFieldValue('isMinor', e.target.checked)}
                                        disabled={isDisabled}
                                        color="primary"
                                    />
                                }
                                label={<span onClick={(e)=> e.preventDefault()} style={{cursor: "default"}}>
                                    {t('common:common.This person is over the legal age of consent')}
                                </span>}
                            />
                        </Grid>
                        {!isDisabled && <Grid
                            item
                            md={12}
                            xs={12}
                            sx={{ mt: 2 }}
                        >
                            <Button
                                color="primary"
                                disabled={isSubmitting}
                                type="cancel"
                                variant="outlined"
                                onClick={()=>onClose()}
                                id="cancel-member-btn"
                            >
                                {t('common:common.Cancel')}
                            </Button>
                            <Button
                                color="primary"
                                disabled={isSubmitting}
                                type="submit"
                                sx={{ marginLeft: 2 }}
                                variant="contained"
                                onClick={handleSubmit}
                                id="save-member-btn"
                            >
                                {t('common:common.Save')}
                            </Button>
                        </Grid>}
                    </Box>
                </form>
                </fieldset>)}
        </Formik>
    );
};

export default AddMemberModal;








