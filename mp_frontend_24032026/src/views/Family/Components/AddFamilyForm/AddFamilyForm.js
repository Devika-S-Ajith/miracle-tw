import React,{ useContext } from 'react';
// import PropTypes from 'prop-types';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import * as Yup from 'yup';
import { Formik,Form,Field} from 'formik';
import MenuItem from '@material-ui/core/MenuItem';
import NumberFormat from 'react-number-format';
import { Box, Button, Card, Grid, TextField, Typography,useTheme, Divider, Tooltip } from '@material-ui/core';
// import wait from '../../../../__fakeApi__/Wait';

// import { customerApi } from '../../../../__fakeApi__/customerApi';

import { CommonDataContext } from '../../../../common/contexts/CommonDataContext';
import InformationCircleIcon from '../../../../assets/icons/InformationCircle';
import APIS from '../../../../common/hooks/UseApiCalls'
import AutoCompleteDropdown from '../../../../components/UserComponents/AutoCompleteDropdown';
import {formatPhone,placeholderPhone} from '../../../../components/UserComponents/ValidatePhoneAndZip';

const AddFamilyForm = (props) => {
  const { t } = useTranslation(['common']);
  const navigate = useNavigate();
  const theme = useTheme();
  const { locationList, languageList, getFamilyList, relationList,userRegion } = useContext(CommonDataContext);
  const {childId} = props;
  //const { organization, ...other } = props;

  // const addMember = (e, { value })=>{
  //   console.log("add member called",Formik.value)
  // }

  return (
    <Formik
      initialValues={{
        address1: '',
        family_name : '',
        first_name : '',
        last_name : '',
        occupation:'',
        address2: '',
        country: '',
        phone: '',
        state: '',
        district: '',
        language : '',
        relation : '',
        city:'',
        email : '',
        zip_code:'',
        other_relation : '',
        submit: null,
      }}
      validationSchema={Yup
        .object()
        .shape({
          family_name :  Yup.string().max(255),
          first_name :  Yup.string().max(255).required(t('common:warnings.First Name is required')),
          last_name :  Yup.string().max(255).required(t('common:warnings.Last Name is required')),
          occupation :  Yup.string().max(255).required(t('common:warnings.Occupation is required')),
          address1: Yup.string().max(255).required(t('common:warnings.Address Line 1 is required')),
          address2: Yup.string().max(255),
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
          language: Yup.string().max(255).required(t('common:warnings.Language is required')),
          relation: Yup.string().max(255).required(t('common:warnings.Relation is required')),
          other_relation: Yup.string().max(255),
          phone : Yup.string()
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
          state: Yup.string().max(255).required(t('common:warnings.State is required')),
          district: Yup.string().max(255).required(t('common:warnings.District is required')),
          email: Yup
            .string()
            .email(t('common:warnings.Must be a valid email'))
            .max(255),
        })}
        onSubmit={async (values, { resetForm, setErrors, setStatus, setSubmitting }) => {
        console.log("addingMember >>")
        console.log(values)
        let payload = {
                "familyName": values.family_name, 
                "firstName": values.first_name, 
                "lastName": values.last_name, 
                "occupation": values.occupation, 
                "phoneNumber": values.phone,
                "email": values.email,        
                "isPrimaryCareGiver": "true",
                "addressLine1": values.address1, 
                "addressLine2": values.address2 || '', 
                "zipCode": values.zip_code, 
                "city": values.city, 
                "HTLanguageId": values.language, 
                "HTCountryId": values.country, 
                "HTDistrictId": values.district, 
                "HTStateId": values.state,
                "HTFamilyRelationId": values.relation,
                "otherRelation": values.other_relation,
                "HTChildId":childId?childId:''
      }
      try { 
        await APIS.AddFamily(payload).then((res)=>{
          console.log("res >>",res)
          if(res && res.data && res.status === 200){
            resetForm();
            let familyId = res.data.familyId;
            setStatus({ success: true });
            getFamilyList();
            setSubmitting(false);
            toast.success(t('common:family.Family Added Successfully'));
            console.log("navigating...")
            navigate(`/dashboard/family/${familyId}/edit`, { 
              state: {
                "addMember": true,
                "fetchFamilyDetails": true
              }
            });
            //navigate to add member >> dashboard/family/id/edit && tab == members

          }else{
           toast.error(t('common:common.Something went wrong'));
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
          //{...other}
        >
          <Card>
            <Box 
            sx={{ m: 2,mt:3 }}
            >
  {/* <Divider/> */}

              <Grid
                container
                spacing={3}
              >
                
                <Grid
                  item
                  md={12}
                  xs={12}
                >
                  <Typography
                  color="textSecondary"
                  variant="subtitle2">
                      {/* Member {index + 1} */}
                      {t('common:common.General Information')}
                  </Typography>
                </Grid>

                <Grid
                  item
                  md={6}
                  xs={12}
                  style={{display:'flex', alignItems: 'center'}}
                  >
                  <TextField
                    error={Boolean(touched.family_name && errors.family_name)}
                    fullWidth
                    autoFocus
                    helperText={touched.family_name && errors.family_name}
                    label={t('common:common.Family Name')}
                    name="family_name"
                    onBlur={handleBlur}
                    onChange={handleChange}
                    value={values.family_name}
                    variant="outlined"
                  />
                  <Tooltip title={t('common:common.If not filled Primary Caregiver name will be used as the Family Name')}>
                    <InformationCircleIcon fontSize="small" />
                  </Tooltip>
                </Grid>

                <Divider/>
                    
                <Grid
                            item
                            md={12}
                            xs={12}
                            >
                    <Typography
                    color="textSecondary"
                    variant="subtitle2">
                        {/* Member {index + 1} */}
                        {t('common:common.Household Information')}
                    </Typography>
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
                    onBlur={handleBlur}
                    onChange={handleChange}
                    value={values.address1}
                    variant="outlined"
                    required
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
                    onBlur={handleBlur}
                    onChange={handleChange}
                    value={values.city}
                    variant="outlined"
                    required
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
                    onChange={(e)=>{
                      setFieldValue('zip_code',e.target.value.trim());
                    }}
                    value={values.zip_code}
                    variant="outlined"
                    required
                  /> */}
                  <NumberFormat
                    customInput={TextField}
                    error={Boolean(touched.zip_code && errors.zip_code)}
                    fullWidth
                    helperText={touched.zip_code && errors.zip_code}
                    placeholder={userRegion.toLowerCase() === "india" ? "888888" : "88888"}
                    format={userRegion.toLowerCase() === "india"
                    ? "######"
                    : "#####"}
                    label={t('common:common.Zipcode')}
                    name="zip_code"
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
                  sx={{ mt: -2 }}
                >
             <Field
             error={Boolean(touched.language && errors.language)}
             fullWidth
             helperText={touched.language && errors.language}
            name="language"
            accessKey="language"
            component={AutoCompleteDropdown}
            required={true}
            label="language"
            options={languageList}
            textFieldProps={{
              fullWidth: true,
              margin: "normal",
              variant: "outlined",
              label:t('common:common.Native Language')
            }}
           
          />
                </Grid>

                <Divider/>

                {/* <Box 
                  sx={{ mt:3,mb : 3,ml :4 }}
                  > */}
                    <Grid
                            item
                            md={12}
                            xs={12}
                            >
                    <Typography
                    color="textSecondary"
                    variant="subtitle2">
                        {/* Member {index + 1} */}
                        {t('common:common.Primary Caregiver')}
                    </Typography>
                    </Grid>
                    
                    {/* <Grid
                      container
                      spacing={3}
                      > */}
                        
                            <Grid
                            item
                            md={6}
                            xs={12}
                            >
                            <TextField
                              error={Boolean(touched.first_name && errors.first_name)}
                              //error={Boolean(values.member[index] && touched.values.member[index].first_name && errors.values.member[index].first_name)}
                              fullWidth
                              helperText={touched.first_name && errors.first_name}
                              label={t('common:common.FirstName')}
                              name="first_name"
                              onBlur={handleBlur}
                              onChange={handleChange}
                              required
                              value={values.first_name}
                              // value={values.member[index] && values.member[index].first_name}
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
                              // value={values.member[index] && values.member[index].last_name}
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
                              name="email"
                              onBlur={handleBlur}
                              onChange={(e)=>{
                                setFieldValue('email',e.target.value.trim());
                              }} 
                              value={values.email}
                              // value={values.member[index] && values.member[index].email}
                              variant="outlined"
                            />
                          </Grid>



                          {/* <Grid
                            item
                            md={6}
                            xs={12}
                            >
                            <TextField
                              error={Boolean(touched.relation && errors.relation)}
                              fullWidth
                              helperText={touched.relation && errors.relation}
                              label="Relation"
                              name="relation"
                              onBlur={handleBlur}
                              onChange={handleChange}
                              required
                              select
                              // value={values.member[index] && values.member[index].occupation}
                              variant="outlined"
                            />
                          </Grid> */}



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
                              onBlur={handleBlur}
                              onChange={handleChange}
                              required
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
            accessKey="relation"
            component={AutoCompleteDropdown}            
            label="relation"
            required={true}
            options={relationList}
            textFieldProps={{
              fullWidth: true,
              margin: "normal",
              variant: "outlined",
              label:t('common:common.Relationship to Child')
            }}
           
          />
                </Grid>

                        { values.relation === '7' && <Grid
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
                          onBlur={handleBlur}
                          onChange={handleChange}
                          value={values.other_relation}
                          variant="outlined"
                        />
                      </Grid>}
          

                          {/* </Grid> */}

                        

                    {/* </Box> */}
              
              </Grid>


         
              <Box sx={{ mt: 2,display : "flex",flexDirection : "row" }}>

                <Button
                  color="primary"
                  sx={{width : 200}}
                  //disabled={isSubmitting}
                  type="submit"
                  variant="contained"
                  onClick={handleSubmit}
                >
                  {t('common:family.Save Family')}
                </Button>


                <Button
                  color="primary"
                  sx={{width : 200,ml :21}}
                  
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

export default AddFamilyForm;
