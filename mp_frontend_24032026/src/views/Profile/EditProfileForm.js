import React, { useState, useRef, useContext, useCallback } from 'react';
import axios from "axios";
import { useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import toast from 'react-hot-toast';
import * as Yup from 'yup';
import { Formik,Field } from 'formik';
import { Box, Button, Card, CircularProgress, Grid, TextField, useTheme,Divider } from '@material-ui/core';
import MenuItem from '@material-ui/core/MenuItem';
import APIS from '../../common/hooks/UseApiCalls';
import { CommonDataContext } from '../../common/contexts/CommonDataContext';
import NumberFormat from 'react-number-format';
import { useTranslation } from 'react-i18next';
import UserIcon from '../../assets/icons/User';
import AutoCompleteDropdown from '../../components/UserComponents/AutoCompleteDropdown';
import { formatPhone,placeholderPhone } from '../../components/UserComponents/ValidatePhoneAndZip';

const EditProfileForm = (props) => {
  const theme = useTheme();
  const navigate = useNavigate();

  const { user, hidden, ...other } = props;
  const { locationList, roleList, organizationList,setIsProfileDetailsChanged,setIsProfileImageUpdated,setIsProfileImageDeleted,userRegion } = useContext(CommonDataContext);
  const { t } = useTranslation(['common']);

  const [uploadedFileURL, setUploadedFileURL] = useState(null)
  const [uploadedFile, setUploadedFile] = useState(null)
  const [isEditEnabled, setisEditEnabled] = useState(false);
  const [loadingImage,setLoadingImage]=useState(false);
  const [isRemoveImageEnabled,setRemoveImageEnabled]=useState(true);

//   const dummyUser = {
   
//     avatar: '/static/mock-images/avatars/avatar-carson_darrin.png',
   
// }



  const hiddenFileInput = useRef(null);

  const handleClick = event => {

    hiddenFileInput.current.click();
  };
  const handleChangeFile = event => {
    if (event.target.files[0]) {
      setRemoveImageEnabled(false)
      const fileUploaded = URL.createObjectURL(event.target.files[0])
      setUploadedFile(event.target.files[0])
      setUploadedFileURL(fileUploaded)
      setLoadingImage(true)
      if(fileUploaded && user.fileUrl){
        getUpdatedSignedURL(event.target.files[0], user.id)
      }else{
        getSignedURL(event.target.files[0], user.id)
      }  
    }
    event.target.value=''
  };

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
    const res = await axios(config);
   if(res.status==200){
    setIsProfileImageUpdated(true)
    setLoadingImage(false)
    setRemoveImageEnabled(true)
    toast.success(t('common:user.User profile image updated successfully'));
   }
    console.log("uploaded",res);
  })

  const getSignedURL = useCallback(async (value, id) => { //? New Function
    try {
      let finalPayload = {
        moduleType: 'user',
        documentType: 'profile-image',
        fileName: `${value.name}`,
        moduleId: `${id}`,
        fileSize: `${value.size / 1024}`,
        description: 'profile picture'
      }
      console.log('payload', finalPayload)
      const data = await APIS.UploadFile(finalPayload);
      console.log('data', data)
      if (data.status === 200) {
        fileUpload(value, data.data.signedUrl)     
      } else {
        console.log('An Error occurred');
      }

    } catch (err) {
      console.error(err);
    }
  }, []);
  const getUpdatedSignedURL = useCallback(async (value, id) => { //? New Function
    try {
      let finalPayload = {
        moduleType: 'user',
        documentType: 'profile-image',
        moduleId: `${id}`,
        fileName: `${value.name}`,
        fileSize: `${value.size / 1024}`,
        description: 'profile picture',
        documentId:`${user.fileUploadMappingId}`
      }    
      const data = await APIS.UploadUpdatedFile(finalPayload);
      console.log('data', data)
      if (data.status === 200) {
        fileUpload(value, data.data.signedUrl)
      } else {
        console.log('An Error occurred');
      }

    } catch (err) {
      console.error(err);
    }
  }, []);

  const handleCancelEdit = () => {
    setisEditEnabled(false)
    //setUploadedFile(null)
    //setUploadedFileURL(null)
  };
  const closeEditMode=()=>{
    setisEditEnabled(false)
  }

  const handleEdit = () => {
    setisEditEnabled(true)
  };

  const DeleteProfileImage = useCallback(async () => {
    let finalPayload = {
      moduleType: 'user',
      documentType: 'profile-image',
      moduleId: `${user.id}`,
    }
    try {
      await APIS.DeleteProfileImage(finalPayload)
        .then((res) => {
          if (res && res.data && res.status === 200) {
            //resetForm(); 
            setUploadedFileURL(null)
            setUploadedFile(null)        
            toast.success(t('common:user.User profile image deleted successfully'));          
            setIsProfileImageDeleted(true)                
          } else {
            toast.error(t('common:common.Something went wrong'));
           
          }
        })
    } catch (err) {
      console.error(err);
    }
  }, []);

  const onRemoveImage = () => {
    setRemoveImageEnabled(false)
    DeleteProfileImage()
    user.fileUrl=null
   
   
  };
  

  return (
    <Formik
      initialValues={{
        address1: user.addressLine1 || '',
        country: user.HTCountryId || '',
        email: user.email || '',
        //organization_name: user.related_org || '',
        name: user.name,
        firstname: user.firstName,
        lastname: user.lastName,
        organizationName: user.HTOrganizationId || '',
        role: user.HTUserRoleId || '',
        address2: user.addressLine2 || '',
        district: user.HTDistrictId || '',
        zipcode:  user?.zipCode?user?.zipCode?.length > 6?user?.zipCode.slice(0, 5) + "-" + user?.zipCode.slice(5):user?.zipCode:'',
        phone: user.phoneNumber || '',
        state: user.HTStateId || '',
        imagePath: user.fileUrl || '',
        submit: null,
        //organization_type: organization.HTOrganizationTypeId || '',
        city: user.city || '',

      }}
      validationSchema={Yup
        .object()
        .shape({
          address1: Yup.string().max(255).required(t('common:warnings.Address Line 1 is required')),
          country: Yup.string().max(255).required(t('common:warnings.Country is required')),
          city: Yup.string().max(255).required(t('common:warnings.City is required')),
          email: Yup
            .string()
            .email(t('common:warnings.Must be a valid email'))
            .max(255)
            .required(t('common:warnings.Email is required')),
          firstname: Yup.string().max(255).required(t('common:warnings.First Name is required')),
          lastname: Yup.string().max(255).required(t('common:warnings.Last Name is required')),
          organizationName: Yup.string().max(255).required(t('common:warnings.Organization  is required')),
          role: Yup.string().max(255),
          address2: Yup.string().max(255),
          district: Yup.string().max(255).required(t('common:warnings.District is required')),
          zipcode: Yup.string()
          .required(t('common:warnings.Zipcode is required'))
          .test('zip-format-validation', t('common:warnings.Invalid ZIP code format'), (value) => {
            if (userRegion.toLowerCase() === 'india') {
              return /^\d{6}$/.test(value);
            } else {
              return /^\d{5}$/.test(value);
            }
          }),
          phone: Yup.string()
          .required(t('common:warnings.Phone Number is required'))
          .test('phone-format-validation', t('common:warnings.Invalid Phone number'), (value,context) => {
            const { country } = context.parent;
            if (userRegion.toLowerCase() === 'india') {
              return /^\+91\d{10}$/.test(value);
            } else {
              if (country==2) {
                return /^\+256\d{9}$/.test(value);
              } else {
                return /^\+1\d{10}$/.test(value);
              }
            }
            }),
          state: Yup.string().max(255).required(t('common:warnings.State is required'))
        })}
      onSubmit={async (values, { resetForm, setErrors, setStatus, setSubmitting }) => {
        console.log('got called?')
        let payload = {
          "id": user && user.id,
          "firstName": values.firstname,
          "lastName": values.lastname,
          "addressLine1": values.address1,
          "addressLine2": values.address2,
          "zipCode": values.zipcode,
          "phoneNumber": values.phone,
          "email": values.email,
          "HTOrganizationId": values.organizationName,
          "HTUserRoleId": values.role,
          "HTCountryId": values.country,
          "HTDistrictId": values.district,
          "HTStateId": values.state,
          "city": values.city,
          "HTLanguageId": "1"
        }
        try {
          await APIS.EditProfile(payload)
            .then((res) => {
              if (res && res.data && res.status === 200) {
                //resetForm();
                setStatus({ success: true });
                setSubmitting(false);
                toast.success(t('common:user.User Updated Successfully'));
                // if(uploadedFileURL && values.imagePath){
                //   getUpdatedSignedURL(uploadedFile, user.id)
                // }else{
                //   getSignedURL(uploadedFile, user.id)
                // }               
                closeEditMode();
                setIsProfileDetailsChanged(true)
               // localStorage.setItem("dpUpdateInterval", 10000)
                navigate('/dashboard/profile/');

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
          <Card>
            
            <Box
              sx={{ m: 2, mt: 3 }}
            >
              <Box
                sx={{ m: 5, mt: 3 }}
              >
                <Grid
                  item
                  md={12}
                  xs={12}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }} >
                    {uploadedFileURL||user.fileUrl ?
                      <img
                        src={uploadedFileURL ? uploadedFileURL : user.fileUrl}
                        style={{ width: 80, height: 80, borderRadius: '60px' }} />
                      :
                      <UserIcon fontSize="small" style={{ width: 80, height: 80, borderRadius: '60px', border: '2px solid #172b4d' }} />
                    }
                   {loadingImage? <CircularProgress/>:<></>}
                  </div>
                </Grid>
                <Grid
                  item
                  md={12}
                  xs={12}
                  sx={{ mt: 3 }}
                  hidden={!isEditEnabled}
                >
                  <Box style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }} >
                    {/* <Button
                      color="primary"
                      sx={{ ml: -1 }}
                      disabled={isSubmitting}
                      type="button"
                      variant="contained"
                      onClick={handleClick}

                      style={{ backgroundColor: theme.palette.button.primary }}
                    >
                      {uploadedFile ? t('common:common.Change Image') : t('common:common.Select Image')}
                    </Button> */}
                    {values.imagePath?<Button
                      color="primary"
                      sx={{ ml: -1 }}
                      disabled={isSubmitting}
                      type="button"
                      variant="contained"
                      onClick={handleClick}
                      style={{ backgroundColor: theme.palette.button.primary }}
                    >
                      {t('common:common.Change Image')}
                    </Button>:<Button
                      color="primary"
                      sx={{ ml: -1 }}
                      disabled={isSubmitting}
                      type="button"
                      variant="contained"
                      onClick={handleClick}

                      style={{ backgroundColor: theme.palette.button.primary }}
                    >
                      {uploadedFile ? t('common:common.Change Image') : t('common:common.Select Image')}
                    </Button>}
                    <input
                      type="file"
                      id="myfile"
                      name="myfile"
                      accept="image/png, image/gif, image/jpeg"
                      ref={hiddenFileInput}
                      onChange={handleChangeFile}
                      style={{ display: 'none' }}
                    />
                    {(uploadedFile || values.imagePath) && isRemoveImageEnabled?
                      <Button
                        color="primary"
                        sx={{ ml: 2 }}
                        disabled={isSubmitting}

                        type="button"
                        variant="contained"
                        onClick={onRemoveImage}
                        style={{ backgroundColor: theme.palette.button.primary }}
                      >
                        {t('common:common.Remove Image')}
                      </Button> : <></>}
                  </Box>
                </Grid>
              </Box>

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
                    error={Boolean(touched.firstname && errors.firstname)}
                    fullWidth
                    helperText={touched.firstname && errors.firstname}
                    label={t('common:common.FirstName')}
                    name="firstname"
                    onBlur={handleBlur}
                    onChange={handleChange}
                    required={isEditEnabled}
                    value={values.firstname}
                    variant={isEditEnabled ? 'outlined' : "standard"}
                    InputProps={{
                      readOnly: !isEditEnabled, disableUnderline: !isEditEnabled
                    }}
                  // disabled={!isEditEnabled}
                  />
                </Grid>

                <Grid
                  item
                  md={6}
                  xs={12}
                >
                  <TextField
                    error={Boolean(touched.lastname && errors.lastname)}
                    fullWidth
                    helperText={touched.lastname && errors.lastname}
                    label={t('common:common.LastName')}
                    name="lastname"
                    onBlur={handleBlur}
                    onChange={handleChange}
                    required={isEditEnabled}
                    value={values.lastname}
                    variant={isEditEnabled ? 'outlined' : "standard"}
                    InputProps={{
                      readOnly: !isEditEnabled, disableUnderline: !isEditEnabled
                    }}
                  // disabled={!isEditEnabled}
                  />
                </Grid>
                {!isEditEnabled && <Grid
                  item
                  md={12}
                  xs={12}

                >
                  <TextField
                    error={Boolean(touched.organizationName && errors.organizationName)}
                    fullWidth
                    helperText={touched.organizationName && errors.organizationName}
                    label={t('common:organization.Organization Name')}
                    name="organizationName"
                    onBlur={handleBlur}
                    onChange={handleChange}
                    required={isEditEnabled}
                    value={isEditEnabled ? values.organizationName : `${organizationList && organizationList.length && user.HTOrganizationId && organizationList.find(item => item.id === user.HTOrganizationId)?.organizationName}`}

                    select={isEditEnabled}
                    variant={isEditEnabled ? 'outlined' : "standard"}
                    InputProps={{
                      readOnly: true, disableUnderline: !isEditEnabled
                    }}
                  >
                    {organizationList && organizationList.length && organizationList.map((item) => {
                      return (
                        <MenuItem key={item.id} value={item.id}>{item.organizationName}</MenuItem>
                      );
                    }
                    )}
                  </TextField>
                </Grid>}
                {!isEditEnabled && <Grid
                  item
                  md={6}
                  xs={12}

                >
                  <TextField
                    error={Boolean(touched.role && errors.role)}
                    fullWidth
                    helperText={touched.role && errors.role}
                    label={t('common:common.Role')}
                    name="role"
                    onBlur={handleBlur}
                    onChange={handleChange}
                    required={isEditEnabled}
                    value={isEditEnabled ? values.role : roleList && roleList.length && user.HTUserRoleId && `${t(`common:common.${roleList.find(item => item.id === user.HTUserRoleId)?.role}`)}`}

                    select={isEditEnabled}
                    variant={isEditEnabled ? 'outlined' : "standard"}
                    InputProps={{
                      readOnly: true, disableUnderline: !isEditEnabled
                    }}
                  >
                    {roleList && roleList.length && roleList.map((item) => {
                      return (
                        <MenuItem key={item.id} value={item.id}>{`${t(`common:common.${item.role}`)}`}</MenuItem>
                      );
                    }
                    )}
                  </TextField>
                </Grid> &&
                  <Grid
                    item
                    md={12}
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
                        setFieldValue('email', e.target.value.trim());
                      }}
                      required={isEditEnabled}
                      value={values.email}
                      variant={isEditEnabled ? 'outlined' : "standard"}
                      InputProps={{
                        readOnly: true, disableUnderline: !isEditEnabled
                      }}
                    //disabled={true}
                    />
                  </Grid>}
                  <Grid
                    item
                    md={12}
                    xs={12}
                  ><Divider /></Grid>
                 {isEditEnabled ?<Grid
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
                     label:t('common:common.Country')
                    }}
           
                  />
                </Grid>:
                <Grid
                  item
                  md={6}
                  xs={12}
                >
                  <TextField
                    error={Boolean(touched.country && errors.country)}
                    fullWidth
                    helperText={touched.country && errors.country}
                    label={t('common:common.Country')}
                    id="country"
                    name="country"
                    //onBlur={handleBlur}
                    required={isEditEnabled}
                    select={isEditEnabled}
                    onChange={handleChange}
                    value={isEditEnabled ? values.country : locationList && locationList.countries && locationList.countries.length &&
                      locationList.countries.find(item => item.id === user.HTCountryId).countryName}
                    variant={isEditEnabled ? 'outlined' : "standard"}
                    InputProps={{
                      readOnly: !isEditEnabled, disableUnderline: !isEditEnabled
                    }}
                  // disabled={!isEditEnabled}
                  >
                    {locationList && locationList.countries && locationList.countries.length && locationList.countries.map((item) => {
                      return (
                        <MenuItem key={item.id} value={item.id}>{item.countryName}</MenuItem>
                      );
                    }
                    )}
                  </TextField>
                </Grid>}
                {isEditEnabled?<Grid
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
                   options={locationList && locationList.states && locationList.states.length &&  locationList.states.filter( (item) =>item.HTCountryId===values.country)}
                   textFieldProps={{
                     fullWidth: true,
                     margin: "normal",
                     variant: "outlined",
                     label:t('common:common.State/Region')
                   }}
           
                  />
               </Grid>:<Grid
                  item
                  md={6}
                  xs={12}
                >
                  <TextField
                    error={Boolean(touched.state && errors.state)}
                    fullWidth
                    helperText={touched.state && errors.state}
                    label={t('common:common.State/Region')}
                    name="state"
                    select={isEditEnabled}
                    required={isEditEnabled}
                    onBlur={handleBlur}
                    onChange={(e) => { handleChange(e); setFieldValue('district', ''); setFieldError('district', t('common:warnings.District is required')) }}
                    value={isEditEnabled ? values.state : locationList && locationList.states && locationList.states.length &&
                      locationList.states.find(item => item.id === values.state).stateName}
                    variant={isEditEnabled ? 'outlined' : "standard"}
                    InputProps={{
                      readOnly: !isEditEnabled, disableUnderline: !isEditEnabled
                    }}
                  // disabled={!isEditEnabled}
                  >
                    {locationList && locationList.states && locationList.states.length && locationList.states.filter((item) => item.HTCountryId === values.country).map((item) => {
                      return (
                        <MenuItem key={item.id} value={item.id}>{item.stateName}</MenuItem>
                      );
                    }
                    )}

                  </TextField>
                </Grid>}
                {isEditEnabled?<Grid
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
                    options={locationList && locationList.districts && locationList.districts.length &&  locationList.districts.filter( (item) =>item.HTStateId===values.state)}
                    textFieldProps={{
                      fullWidth: true,
                      margin: "normal",
                      variant: "outlined",
                      label:t('common:common.District/County')
                   }}
           
                  />
                </Grid>:<Grid
                  item
                  md={6}
                  xs={12}
                >
                  <TextField
                    error={Boolean(touched.district && errors.district)}
                    fullWidth
                    helperText={touched.district && errors.district}
                    label={t('common:common.District/County')}
                    name="district"
                    onBlur={handleBlur}
                    onChange={handleChange}
                    required={isEditEnabled}
                    value={isEditEnabled ? values.district : locationList && locationList.districts && locationList.districts.length &&
                      locationList.districts.find(item => item.id === values.district)?.districtName}

                    select={isEditEnabled}
                    variant={isEditEnabled ? 'outlined' : "standard"}
                    InputProps={{
                      readOnly: !isEditEnabled, disableUnderline: !isEditEnabled
                    }}
                  // disabled={!isEditEnabled}
                  >
                    {locationList && locationList.districts && locationList.districts.length && locationList.districts.filter((item) => item.HTStateId === values.state).map((item) => {
                      return (
                        <MenuItem key={item.id} value={item.id}>{item.districtName}</MenuItem>
                      );
                    }
                    )}
                  </TextField>
                </Grid>}
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
                    required={isEditEnabled}
                    onBlur={handleBlur}
                    onChange={handleChange}
                    value={values.city}
                    variant={isEditEnabled ? 'outlined' : "standard"}
                    InputProps={{
                      readOnly: !isEditEnabled, disableUnderline: !isEditEnabled
                    }}
                  // disabled={!isEditEnabled}
                  />
                </Grid>
                <Grid
                  item
                  md={6}
                  xs={12}
                >
                  {/* <TextField
                    error={Boolean(touched.zipcode && errors.zipcode)}
                    fullWidth
                    helperText={touched.zipcode && errors.zipcode}
                    label={t('common:common.Zipcode')}
                    name="zipcode"
                    required={isEditEnabled}
                    onBlur={handleBlur}
                    onChange={(e) => {
                      setFieldValue('zipcode', e.target.value.trim());
                    }}
                    value={values.zipcode}
                    variant={isEditEnabled ? 'outlined' : "standard"}
                    InputProps={{
                      readOnly: !isEditEnabled, disableUnderline: !isEditEnabled
                    }}
                  // disabled={!isEditEnabled}
                  /> */}
                  <NumberFormat
                    customInput={TextField}
                    InputProps={{
                      readOnly: !isEditEnabled, disableUnderline: !isEditEnabled
                    }}
                    variant={isEditEnabled ? 'outlined' : "standard"}
                    error={Boolean(touched.zipcode && errors.zipcode)}
                    fullWidth
                    helperText={touched.zipcode && errors.zipcode}
                    //label={t('common:common.Phone Number')}
                    placeholder={userRegion.toLowerCase() === "india" ? "888888" : "88888"}
                    label={t('common:common.Zipcode')}
                    name="zipcode"
                    format={ userRegion.toLowerCase() === "india"
                    ? "######"
                    : "#####"}
                    
                    //prefix={'+'}
                    type="text"
                    required={isEditEnabled}
                    onBlur={handleBlur}
                    onChange={(e)=>{
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
                      setFieldValue('zipcode', zipCode);
                    }}
                    value={values.zipcode}
                  />
                </Grid>

                <Grid
                  item
                  md={12}
                  xs={12}
                >
                  <TextField
                    error={Boolean(touched.address1 && errors.address1)}
                    fullWidth
                    helperText={touched.address1 && errors.address1}
                    label={t('common:common.Address 1')}
                    name="address1"
                    required={isEditEnabled}
                    onBlur={handleBlur}
                    onChange={handleChange}
                    value={values.address1}
                    variant={isEditEnabled ? 'outlined' : "standard"}
                    InputProps={{
                      readOnly: !isEditEnabled, disableUnderline: !isEditEnabled
                    }}
                  // disabled={!isEditEnabled}
                  />
                </Grid>
                {isEditEnabled?<Grid
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
                    variant={isEditEnabled ? 'outlined' : "standard"}
                    InputProps={{
                      readOnly: !isEditEnabled, disableUnderline: !isEditEnabled
                    }}
                  // disabled={!isEditEnabled}
                  />
                </Grid>:values.address2?<Grid
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
                    variant={isEditEnabled ? 'outlined' : "standard"}
                    InputProps={{
                      readOnly: !isEditEnabled, disableUnderline: !isEditEnabled
                    }}
                  // disabled={!isEditEnabled}
                  />
                </Grid>:<></>}

                <Grid
                  item
                  md={6}
                  xs={12}
                >
                  <NumberFormat
                    customInput={TextField}
                    fullWidth
                    error={Boolean(touched.phone && errors.phone)}
                    helperText={touched.phone && errors.phone}
                    placeholder={placeholderPhone(userRegion,values.country)}
                    format={formatPhone(userRegion,values.phone,values.country)}
                    label={values.country?.length === 0 || values.country==null  ? `${t('common:common.Select Country to Enter Phone')}` : `${t('common:common.Phone Number')}`}
                    type="tel"
                    name="phone"
                    //disabled={values.country.length === 0}
                    onBlur={handleBlur}
                    onChange={(e) => { e.target.value = e.target.value.replace(/[/\s()]/g, ''); handleChange(e) }}
                    value={values.phone}
                    required={isEditEnabled}
                    disabled={values.country?.length === 0 || values.country==null}
                    variant={isEditEnabled ? 'outlined' : "standard"}
                    InputProps={{
                      readOnly: !isEditEnabled, disableUnderline: !isEditEnabled
                    }}
                  // disabled={!isEditEnabled}
                  />
                </Grid>
                <Grid />
              </Grid>
              <Grid item
                    md={12}
                    xs={12}
                    sx={{m:2}}
              ><Divider /></Grid>
              <Box sx={{mt:-2}} hidden={isEditEnabled} style={{ float: 'right' }}>
              <Button
                color="primary"
                onClick={handleEdit}
                variant="text"
              >Edit Profile
              </Button>
            </Box>
           
              {isEditEnabled && <Box sx={{ mt: 2, display: "flex", flexDirection: "row" }}>
                <Button
                  color="primary"
                  sx={{ width: 200 }}
                  disabled={isSubmitting}
                  type="submit"
                  variant="contained"
                //onClick={()=>{handler();handleCancelEdit();}}

                >
                  {t('common:user.Update User')}
                </Button>
                <Button type="reset"
                  color="primary"
                  sx={{ width: 200, ml: 2 }}
                  variant="contained"
                  onClick={handleReset}
                >
                  {t('common:common.Reset')}
                </Button>
                <Button type="reset"
                  color="primary"
                  sx={{ width: 200, ml: 2 }}
                  variant="contained"
                  onClick={() => { handleCancelEdit(); handleReset() }}
                >
                  {t('common:common.Cancel')}
                </Button>

              </Box>}
            </Box>
          </Card>
        </form>
      )
      }
    </Formik >
  );
};

EditProfileForm.propTypes = {
  user: PropTypes.object.isRequired,
  //onCancel: PropTypes.func
};

export default EditProfileForm;
