import React, {useState, useEffect, useContext} from 'react';
import { useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import toast from 'react-hot-toast';
import * as Yup from 'yup';
import { Formik,Field } from 'formik';
import { Box, Button, Card, Grid, Switch, TextField, Typography } from '@material-ui/core';
import MenuItem from '@material-ui/core/MenuItem';
import APIS from '../../../../common/hooks/UseApiCalls';
import { CommonDataContext } from '../../../../common/contexts/CommonDataContext';
import NumberFormat from 'react-number-format';
import { useTranslation } from 'react-i18next';
import AutoCompleteDropdown from '../../../../components/UserComponents/AutoCompleteDropdown';
import { placeholderPhone,formatPhone } from '../../../../components/UserComponents/ValidatePhoneAndZip';

const EditUserForm = (props) => {
  const navigate = useNavigate();
  const [checked,setChecked] = useState(props.user.isActive);
  const { user, ...other } = props;
  const { locationList, roleList, organizationList, signedinUserRole, signedinOrgType,userRegion } = useContext(CommonDataContext);
  const { t } = useTranslation(['common']);
  const [currentOrganization, setCurrentOrganization] = useState('')
  const value = (organizationList.filter((item)=>item.id==user?.HTOrganizationId))[0]?.HTOrganizationTypeId
  const [orgTypeId,setOrgTypeId]=useState(value || null)

  const signedinOrgId = localStorage.getItem('orgId');

  const handleStatusChange =  async () => {
    try {
      const statusPayload = {
        "id": user.id,
        "isActive": `${!checked}`,
        "isDeleted": "false",
        "HTOrganizationId": `${user.HTOrganizationId}`
      }
      console.log(statusPayload)
      await APIS.ChangeUserStatus(statusPayload)
      .then((res) =>{
        console.log("res",res);
        console.log("message",res.data.Message);
        if(res.data.Message!=="Status Changed Successfully"){
          toast.error(t('common:user.Inactive Reassign'));
          setChecked(checked);
        }
        else if(res.data.Message==="Status Changed Successfully"){
          toast.success(t('common:user.User Status Updated Successfully'));
        }else {
          toast.error(t('common:common.Something went wrong'));
          // setStatus({ success: false });
        }
      })

    }catch (err) {
      toast.error(t('common:common.Something went wrong'));
      // setStatus({ success: false });
      // setErr/ors({ submit: err.message });
    }
  }

  const getOrgTypeForRoleList =(id)=>{
    setOrgTypeId(id)
  }

  useEffect(() => {
       setOrgTypeId(organizationList.filter((item)=>item.id==user?.HTOrganizationId)[0]?.HTOrganizationTypeId)
   },[organizationList])

  useEffect(() => {
    if(signedinOrgType !== null && signedinUserRole !== null){
      if(signedinUserRole === 'superadmin' || signedinUserRole === 'admin'){
        // has access
        if(signedinOrgType == 2 || signedinOrgType == 3 || signedinOrgType == 4 || (signedinOrgType == 1 && (signedinUserRole === 'admin' || signedinUserRole === 'superadmin'))){
          if(currentOrganization !==  signedinOrgId){
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


  return (
    <Formik
      initialValues={{
        address1: user.addressLine1 || '',
        country: user.HTCountryId || '',
        email: user.email || '',
        //organization_name: user.related_org || '',
        name : user.name,
        firstname: user.firstName,
        lastname: user.lastName,
        organizationName: user.HTOrganizationId || '',
        role: user.HTUserRoleId || '',
        address2: user.addressLine2 || '',
        district: user.HTDistrictId || '',
        zipcode: user?.zipCode?user?.zipCode?.length > 6?user?.zipCode.slice(0, 5) + "-" + user?.zipCode.slice(5):user?.zipCode:'',
        phone:  user.phoneNumber || '',
        state: user.HTStateId || '',
        submit: null,
        //organization_type: organization.HTOrganizationTypeId || '',
        city:user.city || '',

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
          role: Yup.string().max(255).required(t('common:warnings.Role is required')),
          address2: Yup.string().max(255),
          district: Yup.string().max(255).required(t('common:warnings.District is required')),
          zipcode: Yup.string()
          .required(t('common:warnings.Zipcode is required'))
          .test('zip-format-validation', t('common:warnings.Invalid ZIP code format'), (value) => {
            if (userRegion.toLowerCase() === 'india') {
              return /^\d{6}$/.test(value);
            }else {
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
              if (country == 2) {
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
          "firstName":values.firstname,
          "lastName":values.lastname,
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
        await APIS.EditUser(payload)
        .then((res)=>{
        if(res && res.data && res.status === 200){
            //resetForm();
            setStatus({ success: true });
            setSubmitting(false);
            toast.success(t('common:user.User Updated Successfully'));
            navigate('/dashboard/users/');
          }else{
           toast.error(t('common:common.Something went wrong'));
           setStatus({ success: false });
           setSubmitting(false);
          }
        })
      }catch (err) {
        toast.error(t('common:common.Something went wrong'));
        setStatus({ success: false });
        setErrors({ submit: err.message });
        setSubmitting(false);
      }
        // try {
        //   // NOTE: Make API request
        //   await wait(500);
        //   resetForm();
        //   setStatus({ success: true });
        //   setSubmitting(false);
        //   toast.success('organization updated!');
        // } catch (err) {
        //   console.error(err);
        //   toast.error('Something went wrong!');
        //   setStatus({ success: false });
        //   setErrors({ submit: err.message });
        //   setSubmitting(false);
        // }
      }}
    >
      {({ errors, handleBlur, handleChange,handleReset, handleSubmit, isSubmitting, touched, values, setFieldValue, setFieldError }) => (
        <form
          onSubmit={handleSubmit}
          {...other}
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
                    error={Boolean(touched.firstname && errors.firstname)}
                    fullWidth
                    helperText={touched.firstname && errors.firstname}
                    label={t('common:common.FirstName')}
                    name="firstname"
                    onBlur={handleBlur}
                    onChange={handleChange}
                    required
                    value={values.firstname}
                    variant="outlined"
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
                    required
                    value={values.lastname}
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
                   error={Boolean(touched.organizationName && errors.organizationName)}
                   fullWidth
                   helperText={touched.organizationName && errors.organizationName}
                   name="organizationName"
                   accessKey="organizationName"
                   component={AutoCompleteDropdown}                  
                   required={true}
                   label="organizationName"
                   getOrgTypeForRoleList={getOrgTypeForRoleList}
                   options={organizationList && organizationList.filter((item)=>item.HTCountryId === values.country)}
                   disabled={signedinUserRole === 'superadmin'?true:currentOrganization && true}
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
                    onBlur={handleBlur}
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
                    error={Boolean(touched.country && errors.country)}
                    fullWidth
                    helperText={touched.country && errors.country}
                    name="country"
                    accessKey="countryName"
                    component={AutoCompleteDropdown}
                    required={true}
                    label="country"
                    options={locationList.countries}
                    disabled={true}
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
                   <NumberFormat
                    customInput={TextField}
                    error={Boolean(touched.zipcode && errors.zipcode)}
                    fullWidth
                    helperText={touched.zipcode && errors.zipcode}
                    //label={t('common:common.Phone Number')}
                    placeholder={userRegion.toLowerCase() === "india" ? "888888" : "88888-8888"}
                    label={t('common:common.Zipcode')}
                    name="zipcode"
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
                      setFieldValue('zipcode', zipCode);
                    }}
                    value={values.zipcode}
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
                label={values.country?.length === 0 || values.country==null ?`${t('common:common.Select Country to Enter Phone')}`:`${t('common:common.Phone Number')}`}
                type="tel"
                name="phone"
                disabled={values.country?.length === 0 || values.country==null}
                onBlur={handleBlur}
                onChange={(e)=>{e.target.value=e.target.value.replace(/[/\s()]/g,''); handleChange(e)}}
                value={values.phone}
                required
                />
                </Grid>
                <Grid  />
                </Grid>
                <Grid item>
                <Grid
                  item
                  md={6}
                  xs={12}
                >
                  <Typography
                    color="textPrimary"
                    gutterBottom
                    variant="subtitle2"
                  >
                    {t('common:user.User Status')}
                  </Typography>
                  <Box sx={{display : "flex",flex :1}}>
                    <Box>
                      <Switch size="small" color="orange" checked={checked} disabled={localStorage.getItem('username')===user.id} onChange={()=> {setChecked(!checked); handleStatusChange()}} />        
                    </Box>
                    <Box>
                      <Typography
                        color={checked ? "#43AA8B" : "#F94144"}
                        variant="h6"
                        sx={{marginRight :2}}
                      >
                        {checked ? `${t('common:common.Active')}`:`${t('common:common.Inactive')}`} 
                      </Typography>
                    </Box>  
                  </Box>
                </Grid>
              </Grid>
              <Box sx={{ mt: 2, display : "flex",flexDirection : "row" }}>
                <Button
                  color="primary"
                  sx={{width : 200}}
                  disabled={isSubmitting}
                  type="submit"
                  variant="contained"
                >
                  {t('common:user.Update User')}
                </Button>
                <Button type="reset" 
                  color="primary"
                  sx={{width : 200,ml : 21}}
                  variant="contained"
                  onClick={handleReset}
                >
                 {t('common:common.Reset')}
                </Button>
              </Box>
            </Box>
          </Card>
        </form>
      )}
    </Formik>
  );
};

EditUserForm.propTypes = {
  user: PropTypes.object.isRequired
};

export default EditUserForm;
