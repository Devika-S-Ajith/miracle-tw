import React, {useEffect,useState,useContext, useRef, useCallback} from 'react';
import { useNavigate } from 'react-router-dom';
import axios from "axios";
import PropTypes from 'prop-types';
import toast from 'react-hot-toast';
import * as Yup from 'yup';
import { Formik,Field } from 'formik';
import { Box, Button, Card, Divider, Grid, Switch, TextField, Typography, useTheme } from '@material-ui/core';
import MenuItem from '@material-ui/core/MenuItem';
// import wait from '../../../../__fakeApi__/Wait';
import APIS from '../../../../common/hooks/UseApiCalls';
// import { customerApi } from '../../../../__fakeApi__/customerApi';
import { CommonDataContext } from '../../../../common/contexts/CommonDataContext';
import NumberFormat from 'react-number-format';
import { useTranslation } from 'react-i18next';
import DateAdapter from '@mui/lab/AdapterDateFns';
import LocalizationProvider from '@mui/lab/LocalizationProvider';
import DatePicker from '@mui/lab/DatePicker';
import UserIcon from '../../../../assets/icons/User';
import AutoCompleteDropdown from '../../../../components/UserComponents/AutoCompleteDropdown';
import AutoCompleteDropdownMultiNames from '../../../../components/UserComponents/AutoCompleteDropdownMultiNames';
import useMounted from '../../../../common/hooks/UseMounted';
import {formatPhone,placeholderPhone} from '../../../../components/UserComponents/ValidatePhoneAndZip';

const EditChildForm = (props) => {
  const { t } = useTranslation(['common']);
  const navigate = useNavigate();
  const [checked,setChecked] = useState(props.user.isActive);
  const [loading,setLoading] = useState(false);
  const [value, setValue] = React.useState(null);
  // const [checked,setChecked] = useState(props.organization.isActive);
  
  // const [ loading, setLoading] = useState(false);
  const theme = useTheme();
  const { user, ...other } = props; 
  const { organizationList,
    familyList, 
    languageList, 
    childStatusList, 
    childPlacementList, 
    locationList, 
    childCurrentPlacementList,
    childEducationList,
    getChildFamilyList,
    signedinOrgType,
    signedinUserRole,roleList,userRegion } = useContext(CommonDataContext);
  let genderArray = ["Male", "Female","Other","Prefer not to disclose"];
  const [uploadedFile, setUploadedFile] = useState(null)
  const [uploadedFileURL, setUploadedFileURL] = useState(user.fileUrl || null)
  const [imageChanged, setImageChanged] = useState(false)
  const [currentOrganization, setCurrentOrganization] = useState('')
  const [caseWorkers,setCaseWorkers] = useState(null)
  const caseWorkerRoleId = roleList?.find(r => r.role == "Case Worker")?.id
  const mounted = useMounted();
  const signedinOrgId = localStorage.getItem('orgId');
  const GenderList = [
    {
      id: 'Female',
      gender: t('common:common.Female')
    },
    {
      id: 'Male',
      gender: t('common:common.Male')
    },
    {
      id: 'Other',
      gender:  t('common:common.Other')
    },
    {
      id: 'Prefer not to disclose',
      gender: t('common:common.Prefer not to disclose')
    }
  ];

  const stringToDate = (dateString) => {
   
    const [day, month, year] = dateString.split('/');
    return new Date([month, day, year].join('/'));
  };

  const stringToDateFromObject = (dateString) => {
    const formatYmd = date => date.toISOString().slice(0, 10);
    const formattedDateString = formatYmd(new Date(dateString));
    const [year, month, day] = formattedDateString.split('-');
    return new Date([month, day, year].join('/'));
  };

  const getDate = (dateToFormat = null) => { 
    let yourDate;
    console.log(value)
    if(dateToFormat=== null){
      yourDate = new Date()
    }else {
      yourDate = new Date(stringToDate(dateToFormat))
    }
    // yourDate.toISOString().split('T')[0];
    const offset = yourDate.getTimezoneOffset()
    yourDate = new Date(yourDate.getTime() - (offset*60*1000))
    console.log(yourDate.toISOString().split('T')[0])
    return yourDate.toISOString().split('T')[0]
  }

  const getDateFromObject = (dateToFormat = null) => { 
    let yourDate;
    console.log(value)
    if(dateToFormat=== null){
      yourDate = new Date()
    }else {
      yourDate = new Date(stringToDateFromObject(dateToFormat))
    }
    // yourDate.toISOString().split('T')[0];
    const offset = yourDate.getTimezoneOffset()
    yourDate = new Date(yourDate.getTime() - (offset*60*1000))
    console.log(yourDate.toISOString().split('T')[0])
    return yourDate.toISOString().split('T')[0]
  }

  const getOrgDetails = useCallback(async (values) =>{
    setLoading(true);
    if(values.organization_name !== ''){
      try {
         let data = await APIS.OrganisationDetails(values.organization_name);
        //  console.log(data.data.organizationDetails);
         let orgData = data.data.organizationDetails;
         values.address1 = orgData.addressLine1;
         values.address2 = orgData.addressLine2;
         values.country = orgData.HTCountryId;
         values.state = orgData.HTStateId;
         values.city = orgData.city;
         values.district = orgData.HTDistrictId;
         values.zip_code = orgData.zipCode;
         setLoading(false);
      } catch (err) {
        console.error(err);
        setLoading(false)
      }
    }
  }, []);

  const hiddenFileInput = useRef(null);
  
  const handleClick = event => {
    hiddenFileInput.current.click();
  };

  const handleChangePicture = event => {
    if(event.target.files[0]){
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
    console.log(res);
  })

  const getSignedURL = useCallback(async (value, id) => {
    setLoading(true)
    try {
        let finalPayload = {
            moduleType: 'child',
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

  const removeUploadedProfileImage = useCallback(async (id) => {
    setLoading(true)
    try {
        let finalPayload = {
            moduleType: 'child',
            documentType: 'profile-image',
            moduleId: `${id}`,
        }
        console.log('payload', finalPayload)
        const data = await APIS.DeleteProfileImage(finalPayload);
        console.log('data', data)

    } catch (err) {
        console.error(err);
    }
  }, []);

  const handleStatusChange =  async () => {
    try {
      const statusPayload = {
        "id": user.id,
        "isActive": !checked,
        "isDeleted": false,
        "HTOrganizationId": `${user.HTOrganizationId}`

      }
      // console.log(statusPayload)
      await APIS.ChangeChildStatus(statusPayload)
      .then((res) =>{
        if(res){
          toast.success(t('common:child.Child Status Updated Successfully'));
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

  // useEffect(() => {

  // }, [])

  useEffect(() => {
    getUserList()
    if(signedinOrgType !== null && signedinUserRole !== null){
    if((signedinOrgType == 3 || signedinOrgType == 4) && (signedinUserRole === 'admin' || signedinUserRole === 'caseworker')){
      // has access
      if(currentOrganization !== signedinOrgId){
        setCurrentOrganization(signedinOrgId)
      }
    } else {
      navigate('/Unauthorized');
    }}
    return () =>{

    }
  },[])

  const getUserList =  useCallback(async () => {
    let caseWorkerRoleId = null
    try {
      const roleLists = await APIS.UserRoleList();
      if (roleLists && roleLists.data && roleLists.data.userRoles) {
        caseWorkerRoleId = roleLists.data.userRoles?.find(r => r.role == "Case Worker")?.id
      }
      const payload = {
        "rowCount": "",
        "pageNumber": "1",
        "orderByField": [
              ["firstName", "ASC"]
            ],
        "globalSearchQuery": "",
        "HTOrganizationId": "",
        "HTLanguageId": "",
        "HTChildPlacementStatusId": "",
        "HTChildStatusId": "",
        "needFullData": "true",
        "HTUserRoleId": caseWorkerRoleId 
      }
      console.log("final payload >>",payload)
      const data = await APIS.ListUsers(payload);
      console.log("api call",data) 
      setCaseWorkers(data && data.data && data.data.users);
    } catch (err) {
      console.error(err);
    }
  }, [mounted]);

  const editCase = useCallback(async (childID,caseId,caseWorkerId) => {
    let payload = {
      "id" : caseId,
      "HTUserId": caseWorkerId,
      "HTChildId":childID,
   }

   try { 
    await APIS.EditCase(payload)
    .then((res)=>{
    if(res && res.data && res.status === 200){
        console.log("success")
      }else{
       toast.error(t('common:common.Something went wrong'));
      }
    })
  }catch (err) {
    toast.error(t('common:common.Something went wrong'));
    
  }
   })


  return (
    <Formik
      initialValues={{
        firstname: user.firstName,
        lastname: user.lastName || '',
        birthdate: getDate(user.birthDate),
        addedDate: user.dateOfEntry !== ''  && user.dateOfEntry !== null ? getDate(user?.dateOfEntry) : null,
        closedDate: user.dateOfExit !== ''  && user.dateOfExit !== null ? getDate(user?.dateOfExit) : null,
        genderOption: genderArray.includes(user.gender) && user.gender || 'Other',
        gender: user.gender,
        phone:  user.phoneNumber || '',
        email: user.email || '',
        language:user.HTLanguageId || '',
        family: user.HTFamilyId || '',
        organization_name : user.HTOrganizationId || '',
        childPlacement:user.HTChildPlacementStatusId || '',
        childStatus:user.HTChildStatusId || '',
        childEducation:  user.HTChildEducationLevelId || '',
        childEducationSpecify:user.highestEducationLevel || '',
        childCurrentPlacement: user.HTChildCurrentPlacementStatusId || '',
        address1: user.addressLine1 || '',
        address2: user.addressLine2 || '',
        country:user.HTCountryId || '',
        state: user.HTStateId || '',
        city:user.city || '',
        district: user.HTDistrictId|| '',
        zip_code: user?.zipCode?user?.zipCode?.length > 6?user?.zipCode.slice(0, 5) + "-" + user?.zipCode.slice(5):user?.zipCode:'',
        caseWorker:user.HTUserId || '',
      }}
      //enableReinitialize={true}
      validationSchema={Yup
        .object()
        .shape({
            firstname: Yup.string().max(255).required(t('common:warnings.First Name is required')),
            lastname: Yup.string().max(255),
            birthdate: Yup.string().max(255).required(t('common:warnings.Date of Birth is required')),
            //addedDate: Yup.string().max(255).required('Added Date is required'),
            genderOption: Yup.string().max(255).required(t('common:warnings.Gender is required')),
            gender: Yup.string().max(255),
            language: Yup.string().max(255),
            family: Yup.string().max(255),
            childPlacement: Yup.string().max(255),
            childStatus: Yup.string().max(255),
            childEducation: Yup.string().max(255),
            childEducationSpecify: Yup.string().max(255),
            childCurrentPlacement: Yup.string().max(255),
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
            state: Yup.string().max(255).required(t('common:warnings.State is required')),
            email: Yup
              .string()
              .email(t('common:warnings.Must be a valid email'))
              .max(255),
            organization_name: Yup
              .string()
              .max(255)
              .required(t('common:warnings.Organization Name is required')),
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
              caseWorker: Yup.string().max(255).required(t('common:warnings.Case Worker is required')),
        })}
      onSubmit={async (values, { resetForm, setErrors, setStatus, setSubmitting }) => {
        let payload = {
          "id": user && user.id,
          "firstName": values.firstname,
          "lastName": values.lastname,
          "birthDate": getDateFromObject(values.birthdate),
          "dateOfEntry": values.addedDate !== ''  && values.addedDate !== null ? getDateFromObject(values.addedDate) : null, 
          "dateOfExit" : values.closedDate !== ''  && values.closedDate !== null ? getDateFromObject(values.closedDate) : null,
          "gender": values.genderOption=== 'Other'? values.gender: values.genderOption,
          "phoneNumber": values.phone,
          "email": values.email,
          "HTLanguageId": values.language || '',
          "HTOrganizationId" : values.organization_name,
          "HTChildPlacementStatusId": values.childPlacement || '',
          "HTChildStatusId":values.childStatus ? values.childStatus : null,
          "HTChildCurrentPlacementStatusId": values.childCurrentPlacement ? values.childCurrentPlacement :null,
          "HTChildEducationLevelId":values.childEducation ? values.childEducation : null,
          "highestEducationLevel": values.childEducationSpecify,
          "addressLine1": values.address1,
          "addressLine2": values.address2,
          "zipCode": values.zip_code,
          "HTCountryId": values.country,
          "HTDistrictId": values.district,
          "HTStateId": values.state,
          "city": values.city,
          "HTFamilyId": values.family ? values.family : null
      }
      // console.log(values)
      // console.log('payload',payload)

      try { 
        await APIS.EditChild(payload)
        .then((res)=>{
        if(res && res.data && res.status === 200){
            resetForm();
            setStatus({ success: true });
            setSubmitting(false);
            editCase(user.id,user.HTCaseId,values.caseWorker)
            if(uploadedFile){
              getSignedURL(uploadedFile, user.id)
            } else if(user.fileUrl && !uploadedFile){
              removeUploadedProfileImage(user.id)
            }
            toast.success(t('common:child.Child Updated Successfully'));
            getChildFamilyList();          
            navigate('/dashboard/child/');
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
      }}
    >
      {({ errors, handleBlur, handleChange,handleReset,handleSubmit, isSubmitting, touched, values, setFieldValue, setFieldError }) => (
        <form
          onSubmit={handleSubmit}
          {...other}
        >
          <LocalizationProvider dateAdapter={DateAdapter}>
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
                    value={values.lastname}
                    variant="outlined"
                  >
                    </TextField>
                </Grid>
                <Grid
                  item
                  md={6}
                  xs={12}
                  sx={{ mt: -2 }}
                >
             <Field
             error={Boolean(touched.genderOption && errors.genderOption)}
             fullWidth
             helperText={touched.genderOption && errors.genderOption}
            name="genderOption"
            accessKey="gender"
            component={AutoCompleteDropdown}
            required={true}
            label="genderOption"
            options={GenderList}
            textFieldProps={{
              fullWidth: true,
              margin: "normal",
              variant: "outlined",
              label:t('common:common.Gender')
            }}
           
          />
                </Grid>
                <Grid
                  item
                  md={6}
                  xs={12}
                >
                  {values.genderOption === 'Other' ? (<TextField
                    error={Boolean(touched.gender && errors.gender)}
                    fullWidth
                    helperText={touched.gender && errors.gender}
                    label={t('common:child.Specify Gender ')}
                    name="gender"
                    onBlur={handleBlur}
                    onChange={handleChange}
                    required
                    value={values.gender}
                    variant="outlined"
                  >
                    </TextField>) : <></>}
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
                          disabled={Boolean(values.childCurrentPlacement === '1')}
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
                >
                  {/* <TextField
                    error={Boolean(touched.birthdate && errors.birthdate)}
                    fullWidth
                    helperText={touched.birthdate && errors.birthdate}
                    label={t('common:common.Date of Birth')}
                    name="birthdate"
                    onBlur={handleBlur}
                    onChange={handleChange}
                    required
                    type="date"
                    value={values.birthdate}
                    variant="outlined"
                  /> */}
                  <DatePicker
                    label={t('common:common.Date of Birth')}
                    value={values.birthdate}
                    format="dd/MM/yyyy"
                    inputFormat = "dd/MM/yyyy"
                    onChange={(newValue) => {
                    setValue(newValue);
                    values.birthdate = newValue
                    }}
                    renderInput={(params) => <TextField fullWidth {...params} required helperText={touched.birthdate && errors.birthdate} error={Boolean(touched.birthdate && errors.birthdate)}/>}
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
            required={false}
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
                    label={t('common:common.Phone Number')}
                    type="tel"
                    name="phone"
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
                    variant="outlined"
                  />
                </Grid>
                <Grid
                  item
                  md={6}
                  xs={12}
                >
                  <DatePicker
                    label={t('common:common.Added Date')} 
                    value={values.addedDate}
                    format="dd/MM/yyyy"
                    inputFormat = "dd/MM/yyyy"
                    onChange={(newValue) => {
                    setValue(newValue);
                    values.addedDate = newValue
                    }}
                    renderInput={(params) => <TextField fullWidth {...params} />}
                    />
                </Grid>
                <Grid
                  item
                  md={6}
                  xs={12}
                >
                  <DatePicker
                    label={t('common:common.Closed Date')}
                    defaultValue={null}
                    value={values.closedDate}
                    format="dd/MM/yyyy"
                    inputFormat = "dd/MM/yyyy"
                    onChange={(newValue) => {
                    setValue(newValue);
                    values.closedDate = newValue
                    }}
                    renderInput={(params) => <TextField fullWidth {...params} />}
                    />
                </Grid>
                <Grid
                  item
                  md={6}
                  xs={12}
                  sx={{ mt: -2 }}
                >
             <Field
             error={Boolean(touched.family && errors.family)}
             fullWidth
             helperText={touched.family && errors.family}
            name="family"
            accessKey="familyName"
            component={AutoCompleteDropdown}
            //required={true}
            label="family"
            options={familyList}
            textFieldProps={{
              fullWidth: true,
              margin: "normal",
              variant: "outlined",
              label:t('common:common.Choose Family')
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
             error={Boolean(touched.organization_name && errors.organization_name)}
             fullWidth
             helperText={touched.organization_name && errors.organization_name}
            name="organization_name"
            accessKey="organizationName"
            component={AutoCompleteDropdown}
            getOrgDetails={()=> getOrgDetails(values)}
            required={true}
            label="organization_name"
            options={organizationList}
            disabled={currentOrganization && true}
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
             error={Boolean(touched.childStatus && errors.childStatus)}
             fullWidth
             helperText={touched.childStatus && errors.childStatus}
            name="childStatus"
            accessKey="status"
            component={AutoCompleteDropdown}
            label="childStatus"
            options={childStatusList}
            textFieldProps={{
              fullWidth: true,
              margin: "normal",
              variant: "outlined",
              label:t('common:child.Child Status')
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
             error={Boolean(touched.childPlacement && errors.childPlacement)}
             fullWidth
             helperText={touched.childPlacement && errors.childPlacement}
            name="childPlacement"
            accessKey="placementStatus"
            component={AutoCompleteDropdown}
            label="childPlacement"
            options={childPlacementList}
            textFieldProps={{
              fullWidth: true,
              margin: "normal",
              variant: "outlined",
              label:t('common:child.Child Placement Status')
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
             error={Boolean(touched.childCurrentPlacement && errors.childCurrentPlacement)}
             fullWidth
             helperText={touched.childCurrentPlacement && errors.childCurrentPlacement}
            name="childCurrentPlacement"
            accessKey="currentPlacementStatus"
            getOrgDetails={()=> getOrgDetails(values)}
            component={AutoCompleteDropdown}
            required={false}
            label="childCurrentPlacement"
            options={childCurrentPlacementList}
            textFieldProps={{
              fullWidth: true,
              margin: "normal",
              variant: "outlined",
              label:t('common:common.Current Placement')
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
              error={Boolean(touched.caseWorker && errors.caseWorker)}
              fullWidth
              helperText={touched.caseWorker && errors.caseWorker}
              name="caseWorker"
              accessKey1="firstName"
              accessKey2="lastName"
              component={AutoCompleteDropdownMultiNames}
              required={true}
              label="caseWorker"
              options={caseWorkers || []}
              textFieldProps={{
                fullWidth: true,
                margin: "normal",
                variant: "outlined",
                label:t('common:common.Case Worker')
             
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
             error={Boolean(touched.childEducation && errors.childEducation)}
             fullWidth
             helperText={touched.childEducation && errors.childEducation}
            name="childEducation"
            accessKey="educationLevel"
            component={AutoCompleteDropdown}
            label="childEducation"
            options={childEducationList}
            textFieldProps={{
              fullWidth: true,
              margin: "normal",
              variant: "outlined",
              label:t('common:child.Child Education')
            }}
           
          />
                </Grid>
                <Grid
                  item
                  md={6}
                  xs={12}
                >
                  {values.childEducation === '20' ? (<TextField
                    error={Boolean(touched.childEducationSpecify && errors.childEducationSpecify)}
                    fullWidth
                    helperText={touched.childEducationSpecify && errors.childEducationSpecify}
                    label={t('common:child.Child Education')}
                    name="childEducationSpecify"
                    onBlur={handleBlur}
                    onChange={handleChange}
                    required
                    value={values.childEducationSpecify}
                    variant="outlined"
                  >
                    </TextField>) : <></>}
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
                        {t('common:common.Address')}
                    </Typography>
                    </Grid>
                
                {/* <>{values.organization_name? Trial(values): null}</> */}
                
                   
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
            disabled = {Boolean(values.childCurrentPlacement==='1')}
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
            disabled = {Boolean(values.childCurrentPlacement==='1')}
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
                    disabled = {Boolean(values.childCurrentPlacement==='1')}
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
                    disabled = {Boolean(values.childCurrentPlacement==='1')}
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
                    disabled = {Boolean(values.childCurrentPlacement==='1')}
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
                    disabled = {Boolean(values.childCurrentPlacement==='1')}
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
                    // required
                    disabled = {Boolean(values.childCurrentPlacement==='1')}
                    onBlur={handleBlur}
                    onChange={handleChange}
                    value={values.address2}
                    variant="outlined"
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
                    {t('common:child.Child Status')}
                  </Typography>
                  <Box sx={{display : "flex",flex :1}}>
                    <Box>
                      <Switch size="small" color="orange" checked={checked} onChange={()=> {setChecked(!checked);handleStatusChange()}} />        
                    </Box>
                    <Box>
                      <Typography
                        color={checked ? "#43AA8B" : "#F94144"}
                        variant="h6"
                        sx={{marginRight :2}}
                      >
                        {checked ? `${t('common:common.ACTIVE')}`:`${t('common:common.INACTIVE')}`}
                      </Typography>
                    </Box>  
                  </Box>
                </Grid>
              </Grid>
              <Box sx={{ mt: 2 }}>
                <Button
                  color="primary"
                  sx={{width : 200}}
                  disabled={isSubmitting}
                  type="submit"
                  variant="contained"
                >
                  {t('common:child.Update Child')}
                </Button>
                <Button type="reset" 
                  color="primary"
                  sx={{width : 200,ml : 21}}
                  variant="contained"
                  onClick={()=>{handleReset();
                    values.birthdate=getDate(user.birthDate);
                    values.addedDate=user.dateOfEntry?getDate(user.dateOfEntry):null;
                    values.closedDate=user.dateOfExit?getDate(user.dateOfExit):null}}
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
                  {uploadedFileURL ? t('common:common.Change Image') : t('common:common.Select Image')}
                </Button>
                <input 
                  type="file" 
                  id="myfile" 
                  name="myfile"
                  ref={hiddenFileInput}
                  onChange={handleChangePicture}
                  style={{display: 'none'}}
                />
                {uploadedFileURL ?
                <Button
                  color="primary"
                  sx={{width : 150, height: 40, ml : 2}}
                  disabled={isSubmitting}
                  type="button"
                  variant="contained"
                  onClick={()=>removePicture()}
                  style={{backgroundColor : theme.palette.button.primary}}
                >
                  {t('common:common.Remove Image')}
                </Button> : <></> }
              </div>
            </Grid>
            <Grid
              item
              md={12}
              xs={12}
            >
              <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', color: '#f44336' }} >
                {imageChanged && <p>{t('common:common.Please make sure to save before exiting')}</p> }
              </div>
            </Grid>
          </Box>
          </Card>
          </Grid>
          </Grid>
          </LocalizationProvider>
        </form>
      )}
    </Formik>
  );
};

EditChildForm.propTypes = {
  user: PropTypes.object.isRequired
};

export default EditChildForm;
