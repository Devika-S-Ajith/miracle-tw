import React,{ useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
// import PropTypes from 'prop-types';
import toast from 'react-hot-toast';
import * as Yup from 'yup';
import { Formik,Form,Field } from 'formik';
import MenuItem from '@material-ui/core/MenuItem';
import {
  Box,
  Button,
  Card,
  Grid,
  // Switch,
  TextField,
  // Typography,
  useTheme
 } from '@material-ui/core';
// import wait from '../../../../__fakeApi__/Wait';
import { CommonDataContext } from '../../../../common/contexts/CommonDataContext';
// import { customerApi } from '../../../../__fakeApi__/customerApi';
import APIS from '../../../../common/hooks/UseApiCalls'
import { useTranslation } from 'react-i18next';
import NumberFormat from 'react-number-format';
import AutoCompleteDropdown from '../../../../components/UserComponents/AutoCompleteDropdown';
import { set } from 'lodash';
import { placeholderPhone,formatPhone } from '../../../../components/UserComponents/ValidatePhoneAndZip';

const AddUserForm = (props) => {
  const navigate = useNavigate(); 
  const { fromOrg,orgNumber } = props;
  const { t } = useTranslation(['common']);
  const theme = useTheme();
  //const { organization, ...other } = props;
  const { locationList, roleList, organizationList, signedinUserRole, signedinOrgType,userRegion } = useContext(CommonDataContext); 
  const [currentOrganization, setCurrentOrganization] = useState('')
  const [isEmailAlreadyExist,setIsEmailAlreadyExist] = useState(false)
  const value = (organizationList.filter((item)=>item.id==fromOrg?orgNumber:currentOrganization))[0]?.HTOrganizationTypeId
  const [orgTypeId,setOrgTypeId]=useState(value || null)
  
  const signedinOrgId = localStorage.getItem('orgId');
  // const EmailValid = useCallback(async () => {
  //   try {
  //     const data = await APIS.CheckUserEmailExists(id);
  //     // if (mounted.current) {
  //       console.log(data)
  //       setUser(data.data.userDetails);
  //     // }
  //   } catch (err) { 
  //     console.error(err);
  //   }
  // }, []);

  // {"Message":"Email is unique!"}
  // {"Message":"Email id exists!"}
  // console.log(locationList,roleList,organizationList)
  const handleEmailBlur = async (event) => {
    console.log(event)
    console.log(event.target.value);
    if(event.target.value !== ''){
      try {
        const data = await APIS.CheckUserEmailExists(event.target.value);
        console.log("api call",data)
        if(data.status === 400){
          toast.error(t('common:common.Email already in Use!'),{duration:8000});
          setIsEmailAlreadyExist(true)
        } else {
          setIsEmailAlreadyExist(false)
          toast.dismiss()
        }
          // setUsers(data && data.data && data.data.users);
          // setpageCount(data && data.data && data.data.pageCount);
          // setLoading(false);
          // return true;
        //}
      } catch (err) {
        console.error(err);
        // setLoading(false)
        toast.dismiss()
        toast.error('Error Validating Email!');
        // return false;
      }

    }
  }

  const getOrgTypeForRoleList =(id)=>{
    setOrgTypeId(id)
  }

  useEffect(() => {
    if(signedinOrgType !== null && signedinUserRole !== null){
      if(signedinUserRole === 'superadmin' || signedinUserRole === 'admin'){
        // has access
        if(signedinOrgType == 2 || signedinOrgType == 3 || signedinOrgType == 4 
            || (signedinOrgType == 1 && (signedinUserRole === 'admin' || signedinUserRole === 'superadmin'))){
          if(currentOrganization !== signedinOrgId){
            setCurrentOrganization(signedinOrgId)
          }
        }
      } else {
        navigate('/Unauthorized');
      }
    }
    return () =>{

    }
  },[signedinOrgType,signedinUserRole])

  const validateZIP = (region) => (value) => {
    if (region === 'india') {
      if (!/^\d{6}$/.test(value)) {
        return 'Zipcode must be 6 digits for India';
      }
    } else {
      if (!/^\d{5}(-\d{4})?$/.test(value)) {
        return 'Invalid ZIP code for USA';
      }
    }
    return undefined; // No error
  };

  useEffect(() => {
      setOrgTypeId(organizationList.filter((item)=>item.id==(fromOrg?orgNumber:signedinOrgId))[0]?.HTOrganizationTypeId)
  },[organizationList])

  return (
    <Formik
      initialValues={{
        first_name: '',
        last_name: '',
        address1: '',
        address2: '',
        country: '',
        district: '',
        city:'',
        zip_code:'',
        email: '',
        organizationName : fromOrg ? orgNumber : (currentOrganization || ''),
        phone: '',
        state: '',
        role: fromOrg ? '2':'',
        submit: null
      }}
      enableReinitialize={true}
      validationSchema={Yup
        .object()
        .shape({
          first_name : Yup.string().max(255).required(t('common:warnings.First Name is required')),
          last_name : Yup.string().max(255).required(t('common:warnings.Last Name is required')),
          address1: Yup.string().max(255).required(t('common:warnings.Address Line 1 is required')),
          address2: Yup.string().max(255),
          district: Yup.string().max(255).required(t('common:warnings.District is required')),
          country: Yup.string().max(255).required(t('common:warnings.Country is required')),
          city: Yup.string().max(255).required(t('common:warnings.City is required')),
          zip_code: Yup.string()
          .required(t('common:warnings.Zipcode is required'))
          .test('zip-format-validation', t('common:warnings.Invalid ZIP code format'), (value) => {
            if (userRegion.toLowerCase() === 'india') {
              return /^\d{6}$/.test(value);
            } else {
              return /^\d{5}$/.test(value);
            }
          }),
          email: Yup
            .string()
            .email(t('common:warnings.Must be a valid email'))
            .max(255)
            .required(t('common:warnings.Email is required')),
          organizationName: Yup
            .string() 
            .max(255)
            .required(t('common:warnings.Organization  is required')),
          phone: Yup.string()
          .required(t('common:warnings.Phone Number is required'))
          .test('phone-format-validation', t('common:warnings.Invalid Phone number'), (value,context) => {
            const { country } = context.parent;
            if (userRegion.toLowerCase() === 'india') {
              return /^\+91\d{10}$/.test(value);
            } else{
              if (country== 2) {
                return /^\+256\d{9}$/.test(value);
              } else {
                return /^\+1\d{10}$/.test(value);
              }
            } 
            }),
            
            
          state: Yup.string().max(255).required(t('common:warnings.State is required')),
          role: Yup.string().max(255).required(t('common:warnings.Role is required')),
        })}
      onSubmit={async (values, { resetForm, setErrors, setStatus, setSubmitting }) => {

        let payload = {
          "firstName":values.first_name,
          "lastName":values.last_name,
          "addressLine1": values.address1,
          "addressLine2": values.address2,
          "zipCode": values.zip_code,
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
        await APIS.AddUser(payload).then((res)=>{
          if(res && res.data && (res.status === 200 || res.status === 201)){
            resetForm(); 
            // getOrganizationList();
            setStatus({ success: true });
            setSubmitting(false);
            toast.success(t('common:user.User Added Successfully'));
            navigate('/dashboard/users/');
            //redirect to add user with current organization
            // navigate('/dashboard/users/add', {
            //   state: {
            //     organizationName: values.organization_name
            //   }
            // });
          }else{
           if (res.status === 400){
             console.log('e',res)
             if(res.body.hasOwnProperty('Message')){
               toast.error(res.body.Message)
             }
             let errorMessage = res.body.Error.split(":");
             toast.error(errorMessage[errorMessage.length - 1]);
           } else {
             toast.error(t('common:common.Something went wrong'));
           }
           
           setStatus({ success: false });
           setSubmitting(false);
          //  navigate('/dashboard/users/add', {
          //   // state: {
          //   //   organizationName: values.organization_name
          //   // }
          // });
          }
          
        })
      }catch(err){
           console.error(err);
          //  toast.error(t('common:common.Something went wrong'));
           setStatus({ success: false });
           setErrors({ submit: err.message });
           setSubmitting(false);
      }
      }}

    >
      {({ errors, handleBlur, handleChange, handleSubmit, isSubmitting, touched, values, setFieldValue, setFieldError }) => (
        <Form
          onSubmit={handleSubmit}
          //{...other}
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
                    error={Boolean(touched.first_name && errors.first_name)}
                    fullWidth
                    autoFocus
                    helperText={touched.first_name && errors.first_name}
                    label={t('common:common.FirstName')}
                    name="first_name"
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
                    onBlur={handleBlur}
                    onChange={handleChange}
                    required
                    value={values.last_name}
                    variant="outlined"
                  />
                </Grid>
                {/* <Grid
                  item
                  md={6}
                  xs={12}
                >
                  <TextField
                    error={Boolean(touched.organization_type && errors.organization_type)}
                    fullWidth
                    helperText={touched.organization_type && errors.organization_type}
                    label="Organization Type"
                    name="organization_type"
                    onBlur={handleBlur}
                    onChange={handleChange}
                    required
                    select
                    value={values.organization_type}
                    variant="outlined"
                  >
                      <MenuItem value="1">C.C.I</MenuItem>
                    </TextField>
                </Grid> */}
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
                   error={Boolean(touched.organizationName && errors.organizationName)}
                   fullWidth
                   helperText={touched.organizationName && errors.organizationName}
                   name="organizationName"
                   accessKey="organizationName"
                   component={AutoCompleteDropdown}                  
                   required={true}
                   label="organizationName"
                   options={organizationList && organizationList.filter((item)=>item.HTCountryId === values.country)}
                   getOrgTypeForRoleList={getOrgTypeForRoleList}
                   disabled={signedinUserRole === 'superadmin'?false:currentOrganization && true}
                   textFieldProps={{
                     fullWidth: true,
                     margin: "normal",
                     variant: "outlined",
                     label:t('common:organization.Organization Name')
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
                   error={Boolean(touched.role && errors.role)}
                   fullWidth
                   helperText={touched.role && errors.role}
                   name="role"
                   accessKey="role"
                   component={AutoCompleteDropdown}                  
                   required={true}
                   label="role"
                   options={orgTypeId==1?roleList:roleList && roleList.length && roleList.filter((item)=>item.id!='1')}
                   disabled={fromOrg}
                   textFieldProps={{
                     fullWidth: true,
                     margin: "normal",
                     variant: "outlined",
                     label:t('common:common.Role')
                   }}
           
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
                    label={t('common:common.Email Address')}
                    name="email"
                    onBlur={(e)=>{handleEmailBlur(e);handleBlur(e)}}
                    onChange={(e)=>{
                      setFieldValue('email',e.target.value.trim());
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
                    required
                  />
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
                  disabled={isEmailAlreadyExist}
                  //type="submit"
                  variant="contained"
                  onClick={handleSubmit}
                >
                  {t('common:user.Save User')}
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
        </Form>
      )}
    </Formik>
  );
};

// AddOrganizationForm.propTypes = {
//   organization: PropTypes.object.isRequired
// };

export default AddUserForm;
