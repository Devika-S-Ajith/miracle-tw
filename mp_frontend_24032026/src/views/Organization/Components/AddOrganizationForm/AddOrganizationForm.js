import React, { useState, useContext, useRef, useCallback } from 'react';
import axios from "axios";
import PropTypes from 'prop-types';
import toast from 'react-hot-toast';
import * as Yup from 'yup';
import { Formik,Form,Field} from 'formik';
import MenuItem from '@material-ui/core/MenuItem';
import { Box, Button, Card, Grid, TextField, useTheme,
 Switch, Typography,
} from '@material-ui/core';
// import wait from '../../../../__fakeApi__/Wait';

// import { customerApi } from '../../../../__fakeApi__/customerApi';
import APIS from '../../../../common/hooks/UseApiCalls';
import { CommonDataContext } from '../../../../common/contexts/CommonDataContext';
import UserIcon from '../../../../assets/icons/User';

import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import NumberFormat from 'react-number-format';
import AutoCompleteDropdown from '../../../../components/UserComponents/AutoCompleteDropdown';
import { placeholderPhone,formatPhone } from '../../../../components/UserComponents/ValidatePhoneAndZip';

const AddOrganizationForm = (props) => {
  const { t } = useTranslation(['common']);
  const theme = useTheme();
  const navigate = useNavigate(); 
  const { organization, ...other } = props;
  const [uploadedFile, setUploadedFile] = useState(null)
  const [uploadedFileURL, setUploadedFileURL] = useState(null)
  const [ loading, setLoading] = useState(false);
  const [consentChecked,setConsentChecked] = useState(false); 
  let savedOrgid;
  const { getOrganizationList,locationList,typeList,userRegion } = useContext(CommonDataContext);
  // const phoneRegExp = /^((\\+[1-9]{1,4}[ \\-]*)|(\\([0-9]{2,3}\\)[ \\-]*)|([0-9]{2,4})[ \\-]*)*?[0-9]{3,4}?[ \\-]*[0-9]{3,4}?$/
  const webRegExp = /((https?):\/\/)?(www.)?[a-z0-9]+(\.[a-z]{2,}){1,3}(#?\/?[a-zA-Z0-9#]+)*\/?(\?[a-zA-Z0-9-_]+=[a-zA-Z0-9-%]+&?)?$/
console.log("typeList >>",typeList)

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

  const hiddenFileInput = useRef(null);
  
  const handleClick = event => {
    hiddenFileInput.current.click();
  };

  const handleChangeFile = event => {
    if(event.target.files[0]){
      const fileUploaded = URL.createObjectURL(event.target.files[0])
      setUploadedFile(event.target.files[0])
      setUploadedFileURL(fileUploaded)
    }
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
    const res = await axios(config)
    console.log(res);
  })

  const getSignedURL = useCallback(async (value, id) => { //? New Function
    setLoading(true)
    try {
        let finalPayload = {
            moduleType: 'organization',
            documentType: 'profile-image',
            fileName: `${value.name}`,
            moduleId: `${id}`,
            fileSize: `${value.size/1024}`,
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

  return (
    <Formik
      initialValues={{
        address1: '',
        address2: '',
        country: '',
        email: '',
        organization_name: '',
        phone: '',
        state: '',
        organization_type:'',
        isDCPU:'false',
        city:'',
        district: '',
        zip_code:'',
        website:'',
        submit: null
      }}
      
      validationSchema={Yup
        .object()
        .shape({
          address1: Yup
            .string()
            .max(255)
            .required(t('common:warnings.Address Line 1 is required')),

          address2: Yup
            .string()
            .max(255),
            //.required('Address Line 2 is required'),

          country: Yup
            .string()
            .max(255)
            .required(t('common:warnings.Country is required')),

          isDCPU: Yup
            .string()
            .max(255),

          city: Yup
            .string()
            .max(255)
            .required(t('common:warnings.City is required')),

          zip_code: Yup.string()
            .required(t('common:warnings.Zipcode is required'))
            .test('zip-format-validation', t('common:warnings.Invalid ZIP code format'), (value) => {
              if (userRegion.toLowerCase() === 'india') {
                return /^\d{6}$/.test(value);
              } else {
                return /^\d{5}$/.test(value);
              }
            }),

          district: Yup
            .string()
            .max(255)
            .required(t('common:warnings.District is required')),

          organization_type: Yup
            .string()
            .max(255)
            .required(t('common:warnings.Organization Type is required')),

          email: Yup
            .string()
            .email(t('common:warnings.Must be a valid email'))
            .max(255)
            .required(t('common:warnings.Email is required')),

          organization_name: Yup
            .string()
            .max(255)
            .required(t('common:warnings.Organization Name is required')),

          phone : Yup.string()
          
          .test('phone-format-validation', t('common:warnings.Invalid Phone number'), (value,context) => {
            if (!value) {
              // If the value is empty, consider it valid
              return true;
            }
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
          
          website : Yup.string()
          .matches(webRegExp,t('common:warnings.Enter correct url')),
            //.required('Website is required'),

          state: Yup.string().max(255).required(t('common:warnings.State is required')),

        })}
      onSubmit={async (values, { resetForm, setErrors, setStatus, setSubmitting }) => {

        let payload = {
          "organizationName": values.organization_name,
          "addressLine1": values.address1,
          "addressLine2": values.address2,
          "zipCode":  values.zip_code,
          "phoneNumber": values.phone,
          "email": values.email,
          "website" : values.website,
          "HTOrganizationTypeId": values.organization_type,
          "HTCountryId": values.country,
          "HTDistrictId": values.district,
          "HTStateId": values.state,
          "city": values.city,
          "isDCPUOrg": values.isDCPU,
          "status": `${consentChecked}`,
      }
      try {  
        await APIS.AddOrganization(payload).then((res)=>{
          if(res && res.data && res.status === 200){
            console.log('data',res.data)
            resetForm();
            getOrganizationList();
            setStatus({ success: true });
            setSubmitting(false);
            toast.success(t('common:warnings.Organization Added Successfully'));
            savedOrgid = res.data.organizationId;
            getSignedURL(uploadedFile, savedOrgid)
            navigate('/dashboard/users/add' ,{ state:{fromOrg:savedOrgid}});
            //redirect to add user with current organization
            // navigate('/dashboard/users/add', {
            //   state: {
            //     organizationName: values.organization_name
            //   }
            // });
          }else{
           if (res.status === 400){
             let errorMessage = res.body.Error.split(":");
             toast.error(errorMessage[errorMessage.length - 1]);
           } else {
             toast.error(t('common:common.Something went wrong'));
           }
           setStatus({ success: false });
           setSubmitting(false);
          }
          
        })
      }catch(err){
           console.error(err);
           toast.error(t('common:common.Something went wrong'));
           setStatus({ success: false });
           setErrors({ submit: err.message });
           setSubmitting(false);
      }
      }}

    >
      {({ errors, handleBlur, handleChange, handleSubmit, isSubmitting, touched, values, setFieldValue, setFieldError }) => (
        <Form
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
          <Card>
            <Box 
            sx={{ m: 2,mt:3 }}
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
                    // autoFocus
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
                      label:t('common:common.Type')
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
                     label:t('common:common.Is this a DCPU')
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
                    onChange={(e)=>{
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
                     label:t('common:common.Country')
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
                   options={locationList && locationList.states && locationList.states.length &&  locationList.states.filter( (item) =>item.HTCountryId===values.country)}
                   textFieldProps={{
                     fullWidth: true,
                     margin: "normal",
                     variant: "outlined",
                     label:t('common:common.State/Region')
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
                    options={locationList && locationList.districts && locationList.districts.length &&  locationList.districts.filter( (item) =>item.HTStateId===values.state)}
                    textFieldProps={{
                      fullWidth: true,
                      margin: "normal",
                      variant: "outlined",
                      label:t('common:common.District/County')
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
                    required
                    onBlur={handleBlur}
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
                    label={t('common:common.Address Line 1')}
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
                    label={t('common:common.Address Line 2')}
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
                placeholder={placeholderPhone(userRegion,values.country)}
                format={formatPhone(userRegion,values.phone,values.country)}
                label={values.country?.length === 0 || values.country==null ? `${t('common:common.Select Country to Enter Phone')}`:`${t('common:common.Phone Number')}`}
                type="tel"
                name="phone"
                disabled={values.country?.length === 0 || values.country==null}
                onBlur={handleBlur}
                onChange={(e)=>{e.target.value=e.target.value.replace(/[/\s()]/g,''); handleChange(e)}}
                value={values.phone}
                />

                </Grid>
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
                    <Grid
                      item
                      md={6}
                      xs={12}
                    >
                      <Box sx={{ mt: 1, display: "flex", flex: 1 }}>
                        <Typography
                          color="textPrimary"
                          gutterBottom
                          variant="subtitle2"                         
                        >
                          {t('common:organization.Consent enabled')}
                        </Typography>
                        <Switch size="small" color="orange" checked={consentChecked} onChange={() => { setConsentChecked(!consentChecked);  }} />
                        <Typography
                          color={consentChecked ? "#43AA8B" : "#F94144"}
                          variant="subtitle2"
                          sx={{ marginRight: 2 }}
                        >
                          {consentChecked ? `${t('common:common.Enabled')}` : `${t('common:common.Disabled')}`}
                        </Typography>
                      </Box>
                    </Grid>
                {/* <Grid
                  item
                  md={6}
                  xs={12}
                >
                  <Typography
                    color="textPrimary"
                    gutterBottom
                    variant="subtitle2"
                  >
                    Discounted Prices
                  </Typography>
                  <Typography
                    color="textSecondary"
                    variant="body2"
                  >
                    This will give the user discounted prices for
                    all products
                  </Typography>
                   <Switch
                    checked={values.hasDiscountedPrices}
                    color="primary"
                    edge="start"
                    name="hasDiscountedPrices"
                    onChange={handleChange}
                    value={values.hasDiscountedPrices}
                  /> 
                </Grid> */}
              </Grid>
              <Box sx={{ mt: 2,display : "flex",flexDirection : "row" }}>
                <Button
                  color="primary"
                  sx={{width : 200}}
                  //disabled={isSubmitting}
                  //type="submit"
                  variant="contained"
                  onClick={handleSubmit}
                >
                  {t('common:organization.Save Organization')}
                </Button>

                <Button
                  color="primary"
                  sx={{width : 200,ml : 21}}
                  disabled={isSubmitting}
                  type="reset"
                  variant="contained"
                  //onClick={handleSubmit}
                  style={{backgroundColor : theme.palette.button.primary}}
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
            sx={{ m: 2,mt:3 }}
            >
            <Grid
              item
              md={12}
              xs={12}
            >
              <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center'}} >
                {uploadedFileURL ?
                  <img 
                  // for="photo-upload"
                  src={uploadedFileURL} 
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
              sx={{ mt:3 }}
            >
              <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center'}} >
                <Button
                  color="primary"
                  sx={{width : 150, height: 40, ml : 2}}
                  disabled={isSubmitting}
                  type="button"
                  variant="contained"
                  onClick={handleClick}
                  style={{backgroundColor : theme.palette.button.primary}}
                >
                  {uploadedFile ? t('common:common.Change Image') : t('common:common.Select Image')}
                </Button>
                <input 
                  type="file" 
                  id="myfile" 
                  name="myfile"
                  accept="image/png, image/gif, image/jpeg"
                  ref={hiddenFileInput}
                  onChange={handleChangeFile}
                  style={{display: 'none'}}
                />
                {uploadedFile ?
                <Button
                  color="primary"
                  sx={{width : 150, height: 40, ml : 2}}
                  disabled={isSubmitting}
                  type="button"
                  variant="contained"
                  onClick={()=>setUploadedFileURL(null)}
                  style={{backgroundColor : theme.palette.button.primary}}
                >
                  {t('common:common.Remove Image')}
                </Button> : <></> }
              </div>
            </Grid>
          </Box>
          </Card>
          </Grid>
          </Grid>
        </Form>
      )}
    </Formik>
  );
};

AddOrganizationForm.propTypes = {
  organization: PropTypes.object.isRequired
};

export default AddOrganizationForm;
