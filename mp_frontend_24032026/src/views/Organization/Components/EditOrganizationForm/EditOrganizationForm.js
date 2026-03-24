import React, { useState, useContext, useRef, useCallback } from 'react';
import axios from "axios";
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import * as Yup from 'yup';
import { Formik, Field } from 'formik';
import { Box, Button, Card, Grid, Switch, TextField, Typography, useTheme } from '@mui/material';
// import wait from '../../../../__fakeApi__/Wait';
import APIS from '../../../../common/hooks/UseApiCalls';
import { CommonDataContext } from '../../../../common/contexts/CommonDataContext';
import UserIcon from '../../../../assets/icons/User';
import { useTranslation } from 'react-i18next';
import NumberFormat from 'react-number-format';
import AutoCompleteDropdown from '../../../../components/UserComponents/AutoCompleteDropdown';
import { placeholderPhone, formatPhone } from '../../../../components/UserComponents/ValidatePhoneAndZip';

const EditOrganizationForm = (props) => {
  const navigate = useNavigate();
  const { t } = useTranslation(['common']);
  const { organization, ...other } = props;
  // const organizationStatus = props.organization.isActive;
  const [checked, setChecked] = useState(props.organization.isActive);
  const [consentChecked, setConsentChecked] = useState(props.organization.consentRequired);
  const [uploadedFile, setUploadedFile] = useState(null)
  const [uploadedFileURL, setUploadedFileURL] = useState(organization.fileUrl || null)
  const [imageChanged, setImageChanged] = useState(false)
  const [loading, setLoading] = useState(false);
  const theme = useTheme();
  const { locationList, typeList, getOrganizationList, userRegion } = useContext(CommonDataContext);
  // const phoneRegExp = /^((\\+[1-9]{1,4}[ \\-]*)|(\\([0-9]{2,3}\\)[ \\-]*)|([0-9]{2,4})[ \\-]*)*?[0-9]{3,4}?[ \\-]*[0-9]{3,4}?$/
  const webRegExp = /((https?):\/\/)?(www.)?[a-z0-9]+(\.[a-z]{2,}){1,3}(#?\/?[a-zA-Z0-9#]+)*\/?(\?[a-zA-Z0-9-_]+=[a-zA-Z0-9-%]+&?)?$/;

  const isDCPUList = [
    {
      id: 'false',
      value: t('common:common.No')
    },
    {
      id: 'true',
      value: t('common:common.Yes')
    }
  ]

  const handleStatusChange = async (value) => {
    try {
      const statusPayload = {
        "id": organization.id,
        "isActive": value,
        "isDeleted": "false"
      }
      await APIS.ChangeOrganizationStatus(statusPayload)
        .then((res) => {
          if (res.data.Message !== "Status Changed Successfully") {
            toast.error(t('common:organization.Inactive Reassign'));
            // setChecked(checked);
          }
          else if (res.data.Message === "Status Changed Successfully") {
            toast.success(t('common:warnings.Organization Status Updated Successfully'));
          }
          else {
            toast.error(t('common:common.Something went wrong'));
            // setStatus({ success: false });
          }
        })

    } catch (err) {
      toast.error(t('common:common.Something went wrong'));
      // setStatus({ success: false });
      // setErr/ors({ submit: err.message });
    }
  }

  const handleConsentStatusChange = async (value) => {
    try {
      const Payload = {
        "organization_id": organization.id,
        "status": `${value}`,
      }
      await APIS.ChangeConsentStatus(Payload)
        .then((res) => {
          if (res.data.Message !== "Consent status updated Successfully") {
            toast.error(t('common:organization.failed to change consent status'));
            // setConsentChecked(consentChecked);
          }
          else if (res.data.Message === "Consent status updated Successfully") {
            toast.success(t('common:warnings.Consent Status Updated Successfully'));
          }
          else {
            toast.error(t('common:common.Something went wrong'));
            // setStatus({ success: false });
          }
        })

    } catch (err) {
      toast.error(t('common:common.Something went wrong'));
      // setStatus({ success: false });
      // setErr/ors({ submit: err.message });
    }
  }

  const hiddenFileInput = useRef(null);

  const handleClick = event => {
    hiddenFileInput.current.click();
  };

  const handleChangePicture = event => {
    if (event.target.files[0]) {
      const fileUploadedURL = URL.createObjectURL(event.target.files[0])
      setUploadedFile(event.target.files[0])
      setUploadedFileURL(fileUploadedURL)
      setImageChanged(true)
    }
  };

  const removePicture = () => {
    setUploadedFile(null)
    setUploadedFileURL(null)
    setImageChanged(true)
  }

  const fileUpload = useCallback(async (selectedFile, signedURL) => {
    let config = {
      transformRequest: [(data, headers) => {
        delete headers.common.Authorization;
        return data
      }]
    };
    config.headers = {
      'Content-Type': 'image/png'
    }
    config.method = "PUT";
    config.url = signedURL;
    config.data = selectedFile;
    const res = await axios(config)
  })

  const getSignedURL = useCallback(async (value, id) => {
    setLoading(true)
    try {
      let finalPayload = {
        moduleType: 'organization',
        documentType: 'profile-image',
        fileName: `${value.name}`,
        moduleId: `${id}`,
        fileSize: `${value.size / 1024}`,
        description: 'profile picture'
      }
      const data = await APIS.UploadFile(finalPayload);
      if (data.status === 200) {
        fileUpload(value, data.data.signedUrl)
      } else {
        console.log('An Error occurred');
      }

    } catch (err) {
      console.error(err);
    }
  }, []);

  const removeUploadedProfileImage = useCallback(async (id) => {
    setLoading(true)
    try {
      let finalPayload = {
        moduleType: 'organization',
        documentType: 'profile-image',
        moduleId: `${id}`,
      }
      const data = await APIS.DeleteProfileImage(finalPayload);
    } catch (err) {
      console.error(err);
    }
  }, []);


  return (
    <Formik
      initialValues={{
        address1: organization.addressLine1 || '',
        address2: organization.addressLine2 || '',
        country: organization.HTCountryId || '',
        email: organization.email || '',
        organization_name: organization.organizationName || '',
        phone: organization.phoneNumber || '',
        state: organization.HTStateId || '',
        submit: null,
        website: organization.website || '',
        organization_type: organization.HTOrganizationTypeId || '',
        city: organization.city || '',
        zip_code: organization?.zipCode ? organization?.zipCode?.length > 6 ? organization?.zipCode.slice(0, 5) + "-" + organization?.zipCode.slice(5) : organization?.zipCode : '',
        district: organization.HTDistrictId || '',
        isDCPU: organization.isDCPUOrg || 'false',

      }}
      validationSchema={Yup
        .object()
        .shape({
          address1: Yup.string()
            .max(255)
            .required(t('common:warnings.Address Line 1 is required')),

          address2: Yup.string()
            .max(255),

          country: Yup.string()
            .max(255)
            .required(t('common:warnings.Country is required')),

          website: Yup.string()
            .matches(webRegExp, t('common:warnings.Enter correct url')),

          city: Yup.string()
            .max(255)
            .required(t('common:warnings.City is required')),

          district: Yup.string()
            .max(255)
            .required(t('common:warnings.District is required')),

          zip_code: Yup.string()
            .required(t('common:warnings.Zipcode is required'))
            .test('zip-format-validation', t('common:warnings.Invalid ZIP code format'), (value) => {
              if (userRegion.toLowerCase() === 'india') {
                return /^\d{6}$/.test(value);
              } else {
                return /^\d{5}$/.test(value);
              }
            }),

          organization_type: Yup.string()
            .max(255)
            .required(t('common:warnings.Organization Type is required')),

          isDCPU: Yup
            .string()
            .max(255),

          email: Yup
            .string()
            .email(t('common:warnings.Must be a valid email'))
            .max(255)
            .required(t('common:warnings.Email is required')),

          organization_name: Yup
            .string()
            .max(255)
            .required(t('common:warnings.Organization Name is required')),

          phone: Yup.string()
            .test('phone-format-validation', t('common:warnings.Invalid Phone number'), (value, context) => {
              if (!value) {
                // If the value is empty, consider it valid
                return true;
              }
              const { country } = context.parent;
              if (userRegion.toLowerCase() === 'india') {
                return /^\+91\d{10}$/.test(value);
              } else {
                if (country == 2) {
                  return /^\+256\d{9}$/.test(value);
                } else {
                  return /^\+1\d{10}$/.test(value);
                }
              }
            }),

          state: Yup.string().max(255).required(t('common:warnings.State is required')),
        })}
      onSubmit={async (values, { resetForm, setErrors, setStatus, setSubmitting }) => {
        let payload = {
          "id": organization && organization.id,
          "organizationName": values.organization_name,
          "addressLine1": values.address1,
          "addressLine2": values.address2,
          "zipCode": values.zip_code,
          "phoneNumber": values.phone,
          "email": values.email,
          "website": values.website,
          "HTOrganizationTypeId": values.organization_type,
          "HTCountryId": values.country,
          "HTDistrictId": values.district,
          "HTStateId": values.state,
          "city": values.city,
          "isDCPUOrg": values.isDCPU
        }
        try {
          await APIS.EditOrganization(payload)
            .then((res) => {
              if (res && res.data && res.status === 200) {
                //resetForm();
                getOrganizationList();
                setStatus({ success: true });
                setSubmitting(false);
                if (uploadedFile) {
                  getSignedURL(uploadedFile, organization.id)
                } else if (organization.fileUrl && !uploadedFileURL) {
                  removeUploadedProfileImage(organization.id)
                }
                toast.success(t('common:warnings.Organization Updated Successfully'));
                navigate('/dashboard/organizations');
              } else {
                toast.error(t('common:common.Something went wrong'));
                setStatus({ success: false });
                setSubmitting(false);
              }
            })
        } catch (err) {
          toast.error(t('common:common.Something went wrong'));
          setStatus({ success: false });
          setErrors({ submit: err.message });
          setSubmitting(false);
        }
      }}
    >
      {({ errors, handleBlur, handleChange, handleReset, handleSubmit, isSubmitting, touched, values, setFieldValue, setFieldError }) => (
        <form
          onSubmit={handleSubmit}
          {...other}
        >
          <Grid
            container
            spacing={3}
          >
            <Grid
              item
              md={8}
              xs={12}
            >
              <Card sx={{ width: "100%" }}>
                <Box
                  sx={{ m: 2, mt: 3 }}
                >
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
                        error={Boolean(touched.organization_name && errors.organization_name)}
                        fullWidth
                        autoFocus
                        helperText={touched.organization_name && errors.organization_name}
                        label={t('common:organization.Organization Name')}
                        name="organization_name"
                        onBlur={handleBlur}
                        onChange={handleChange}
                        required
                        value={values.organization_name}
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
                        error={Boolean(touched.organization_type && errors.organization_type)}
                        fullWidth
                        helperText={touched.organization_type && errors.organization_type}
                        name="organization_type"
                        accessKey="name"
                        component={AutoCompleteDropdown}
                        required={true}
                        label="organization_type"
                        options={typeList}
                        textFieldProps={{
                          fullWidth: true,
                          margin: "normal",
                          variant: "outlined",
                          label: t('common:common.Type')
                        }}

                      />
                    </Grid>
                    {values.organization_type === '2' ? (<Grid
                      item
                      md={6}
                      xs={12}
                      sx={{ mt: -2 }}
                    >
                      <Field
                        error={Boolean(touched.isDCPU && errors.isDCPU)}
                        fullWidth
                        helperText={touched.isDCPU && errors.isDCPU}
                        name="isDCPU"
                        accessKey="value"
                        component={AutoCompleteDropdown}
                        required={false}
                        label="isDCPU"
                        options={isDCPUList}
                        textFieldProps={{
                          fullWidth: true,
                          margin: "normal",
                          variant: "outlined",
                          label: t('common:common.Is this a DCPU')
                        }}

                      />
                    </Grid>) : <></>}
                    <Grid
                      item
                      md={6}
                      xs={12}
                    >
                      <TextField
                        error={Boolean(touched.email && errors.email)}
                        fullWidth
                        helperText={touched.email && errors.email}
                        label={t('common:common.Email Address')}
                        name="email"
                        onBlur={handleBlur}
                        onChange={(e) => {
                          setFieldValue('email', e.target.value.trim())
                        }}
                        required
                        value={values.email}
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
                        error={Boolean(touched.country && errors.country)}
                        fullWidth
                        helperText={touched.country && errors.country}
                        name="country"
                        accessKey="countryName"
                        component={AutoCompleteDropdown}
                        required={true}
                        label="country"
                        options={locationList.countries}
                        textFieldProps={{
                          fullWidth: true,
                          margin: "normal",
                          variant: "outlined",
                          label: t('common:common.Country')
                        }}

                      />
                    </Grid>

                    <Grid
                      item
                      md={6}
                      xs={12}
                      sx={{ mt: -2 }}
                    >
                      <Field
                        error={Boolean(touched.state && errors.state)}
                        fullWidth
                        helperText={touched.state && errors.state}
                        name="state"
                        accessKey="stateName"
                        component={AutoCompleteDropdown}
                        required={true}
                        label="state"
                        options={locationList && locationList.states && locationList.states.length && locationList.states.filter((item) => item.HTCountryId === values.country)}
                        textFieldProps={{
                          fullWidth: true,
                          margin: "normal",
                          variant: "outlined",
                          label: t('common:common.State/Region')
                        }}

                      />
                    </Grid>

                    <Grid
                      item
                      md={6}
                      xs={12}
                      sx={{ mt: -2 }}
                    >
                      <Field
                        error={Boolean(touched.district && errors.district)}
                        fullWidth
                        helperText={touched.district && errors.district}
                        name="district"
                        accessKey="districtName"
                        component={AutoCompleteDropdown}
                        required={true}
                        label="district"
                        options={locationList && locationList.districts && locationList.districts.length && locationList.districts.filter((item) => item.HTStateId === values.state)}
                        textFieldProps={{
                          fullWidth: true,
                          margin: "normal",
                          variant: "outlined",
                          label: t('common:common.District/County')
                        }}

                      />
                    </Grid>
                    <Grid
                      item
                      md={6}
                      xs={12}
                    >
                      <TextField
                        error={Boolean(touched.city && errors.city)}
                        fullWidth
                        helperText={touched.city && errors.city}
                        label={t('common:common.City')}
                        name="city"
                        required
                        onBlur={handleBlur}
                        onChange={handleChange}
                        value={values.city}
                        variant="outlined"
                      />
                    </Grid>
                    <Grid
                      item
                      md={6}
                      xs={12}
                    >
                      {/* <TextField
                    error={Boolean(touched.zip_code && errors.zip_code)}
                    fullWidth
                    helperText={touched.zip_code && errors.zip_code}
                    label={t('common:common.Zipcode')}
                    name="zip_code"
                    onBlur={handleBlur}
                    required
                    onChange={(e)=>{
                      setFieldValue('zip_code',e.target.value.trim());
                    }}
                    value={values.zip_code}
                    variant="outlined"
                  /> */}
                      <NumberFormat
                        customInput={TextField}
                        error={Boolean(touched.zip_code && errors.zip_code)}
                        fullWidth
                        helperText={touched.zip_code && errors.zip_code}
                        //label={t('common:common.Phone Number')}
                        placeholder={userRegion.toLowerCase() === "india" ? "888888" : "88888"}
                        label={t('common:common.Zipcode')}
                        name="zip_code"
                        format={userRegion.toLowerCase() === "india"
                          ? "######"
                          : "#####"}

                        //prefix={'+'}
                        type="text"
                        required
                        onBlur={handleBlur}
                        onChange={(e) => {
                          let zipCode = e.target.value.trim();
                          // if (userRegion === "usa") {
                          //   // Allow only 5 or 9 digits for USA zip code
                          //   zipCode = zipCode.substring(0, 10);
                          //   // Remove the hyphen if the user deletes 4 characters
                          //   if (zipCode.length < 10) {
                          //     zipCode = zipCode.replace(/-/g, "");
                          //   }
                          // } else if (userRegion === "india") {
                          //   // Allow only 6 digits for India zip code
                          //   zipCode = zipCode.substring(0, 6);
                          // }
                          setFieldValue('zip_code', zipCode);
                        }}
                        value={values.zip_code}
                      />
                    </Grid>
                    <Grid
                      item
                      md={6}
                      xs={12}
                    >
                      <TextField
                        error={Boolean(touched.address1 && errors.address1)}
                        fullWidth
                        helperText={touched.address1 && errors.address1}
                        label={t('common:common.Address 1')}
                        name="address1"
                        required
                        onBlur={handleBlur}
                        onChange={handleChange}
                        value={values.address1}
                        variant="outlined"
                      />
                    </Grid>
                    <Grid
                      item
                      md={6}
                      xs={12}
                    >
                      <TextField
                        error={Boolean(touched.address2 && errors.address2)}
                        fullWidth
                        helperText={touched.address2 && errors.address2}
                        label={t('common:common.Address 2')}
                        name="address2"
                        onBlur={handleBlur}
                        onChange={handleChange}
                        value={values.address2}
                        variant="outlined"
                      />
                    </Grid>
                    <Grid
                      item
                      md={6}
                      xs={12}
                    >
                      {/* <TextField
                    error={Boolean(touched.phone && errors.phone)}
                    fullWidth
                    helperText={touched.phone && errors.phone}
                    label={t('common:common.Phone Number')}
                    name="phone"
                    onBlur={handleBlur}
                    onChange={handleChange}
                    value={values.phone}
                    variant="outlined"
                  /> */}

                      <NumberFormat
                        customInput={TextField}
                        fullWidth
                        error={Boolean(touched.phone && errors.phone)}
                        helperText={touched.phone && errors.phone}
                        //label={t('common:common.Phone Number')}
                        placeholder={placeholderPhone(userRegion, values.country)}
                        format={formatPhone(userRegion, values.phone, values.country)}
                        label={values.country?.length === 0 || values.country == null ? `${t('common:common.Select Country to Enter Phone')}` : `${t('common:common.Phone Number')}`}
                        type="tel"
                        name="phone"
                        disabled={values.country?.length === 0 || values.country == null}
                        onBlur={handleBlur}
                        onChange={(e) => { e.target.value = e.target.value.replace(/[/\s()]/g, ''); handleChange(e) }}
                        value={values.phone}
                      />
                    </Grid>
                    <Grid />
                    <Grid
                      item
                      md={6}
                      xs={12}
                    >
                      <TextField
                        error={Boolean(touched.website && errors.website)}
                        fullWidth
                        helperText={touched.website && errors.website}
                        label={t('common:common.Website')}
                        name="website"
                        onBlur={handleBlur}
                        onChange={handleChange}
                        value={values.website}
                        variant="outlined"
                      />
                    </Grid>
                  </Grid>
                  <Grid item>
                    <Grid
                      item
                      md={12}
                      xs={12}
                    >
                      <Box sx={{ mt: 3, display: "flex", flex: 1 }}>
                        <Typography
                          color="textPrimary"
                          gutterBottom
                          variant="subtitle2"
                          inline
                        >
                          {t('common:organization.Organization Status')}
                        </Typography>

                        <Switch size="small" color="orange" checked={checked} onChange={() => { setChecked(!checked); handleStatusChange(!checked) }} />
                        <Typography
                          color={checked ? "#43AA8B" : "#F94144"}
                          variant="subtitle2"
                          sx={{ marginRight: 2 }}
                          inline
                        >
                          {checked ? `${t('common:common.ACTIVE')}` : `${t('common:common.INACTIVE')}`}
                        </Typography>
                        <Typography
                          color="textPrimary"
                          gutterBottom
                          sx={{ ml: 4 }}
                          variant="subtitle2"
                          inline
                        >
                          {t('common:organization.Consent enabled')}
                        </Typography>
                        <Switch size="small" color="orange" checked={consentChecked} onChange={() => { setConsentChecked(!consentChecked); handleConsentStatusChange(!consentChecked) }} />
                        <Box>
                          <Typography
                            color={consentChecked ? "#43AA8B" : "#F94144"}
                            variant="subtitle2"
                            sx={{ marginRight: 2 }}
                            inline
                          >
                            {consentChecked ? `${t('common:common.Enabled')}` : `${t('common:common.Disabled')}`}
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
                    >
                      {t('common:organization.Update Organization')}
                    </Button>
                    <Button type="reset"
                      color="primary"
                      sx={{ width: 200, ml: 21 }}
                      variant="contained"
                      onClick={handleReset}
                    >
                      {t('common:common.Reset')}
                    </Button>
                  </Box>
                </Box>
              </Card>
            </Grid>
            <Grid
              item
              md={4}
              xs={12}
            >
              <Card>
                <Box
                  sx={{ m: 2, mt: 3 }}
                >
                  <Grid
                    item
                    md={12}
                    xs={12}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }} >
                      {uploadedFileURL ?
                        <img
                          // for="photo-upload"
                          src={uploadedFileURL}
                          alt='Profile'
                          // type="image"
                          style={{ width: 120, height: 120, borderRadius: '60px' }} />
                        :
                        <UserIcon fontSize="large" style={{ width: 120, height: 120, borderRadius: '60px', border: '2px solid #172b4d' }} />
                      }
                    </div>
                  </Grid>
                  <Grid
                    item
                    md={12}
                    xs={12}
                    sx={{ mt: 3 }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }} >
                      <Button
                        color="primary"
                        sx={{ width: 150, height: 40, ml: 2 }}
                        disabled={isSubmitting}
                        type="button"
                        variant="contained"
                        onClick={handleClick}
                        style={{ backgroundColor: theme.palette.button.primary }}
                      >
                        {uploadedFileURL ? t('common:common.Change Image') : t('common:common.Select Image')}
                      </Button>
                      <input
                        type="file"
                        id="myfile"
                        name="myfile"
                        accept="image/png, image/gif, image/jpeg"
                        ref={hiddenFileInput}
                        onChange={handleChangePicture}
                        style={{ display: 'none' }}
                      />
                      {uploadedFileURL ?
                        <Button
                          color="primary"
                          sx={{ width: 150, height: 40, ml: 2 }}
                          disabled={isSubmitting}
                          type="button"
                          variant="contained"
                          onClick={() => removePicture()}
                          style={{ backgroundColor: theme.palette.button.primary }}
                        >
                          {t('common:common.Remove Image')}
                        </Button> : <></>}
                    </div>
                  </Grid>
                  <Grid
                    item
                    md={12}
                    xs={12}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', color: '#f44336' }} >
                      {imageChanged && <p>{t('common:common.Please make sure to save before exiting')}</p>}
                    </div>
                  </Grid>
                </Box>
              </Card>
            </Grid>
          </Grid>
        </form>
      )}
    </Formik>
  );
};

EditOrganizationForm.propTypes = {
  organization: PropTypes.object.isRequired
};

export default EditOrganizationForm;
