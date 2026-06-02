import { useState, useCallback, useEffect, useContext, useRef } from 'react';
import { Link as RouterLink,useParams,useNavigate,useLocation } from 'react-router-dom';
import * as Yup from 'yup';
import { Formik,Field } from 'formik';
import toast from 'react-hot-toast';
//import { Helmet } from 'react-helmet-async';
import { Box, Breadcrumbs,
         Button, Container,
         CircularProgress,
         Grid, Link, 
         Typography,
         TextField,
         Tab, Tabs, 
         Divider,
         IconButton,
         Popover,
         MenuItem,
         Switch,
         useTheme
    } from '@material-ui/core';
import NumberFormat from 'react-number-format';
import { customerApi } from '../../../__fakeApi__/customerApi';
import EditFamilyForm from '../Components/EditFamilyForm';
import Members from '../Components/Members';
import Children from '../Components/Children';
import useMounted from '../../../common/hooks/UseMounted';
import useSettings from '../../../common/hooks/UseSettings';
import ChevronLeftIcon from '../../../assets/icons/ChevronLeft';
import APIS from '../../../common/hooks/UseApiCalls';
import PlusIcon from '../../../assets/icons/Plus';
import CloseIcon from '@material-ui/icons/Close';
import { useTranslation } from 'react-i18next';
import { CommonDataContext } from '../../../common/contexts/CommonDataContext';
//import gtm from '../../lib/gtm';
import AutoCompleteDropdown from '../../../components/UserComponents/AutoCompleteDropdown';
import AutoCompleteDropdownMultiNames from '../../../components/UserComponents/AutoCompleteDropdownMultiNames';
import {formatPhone,placeholderPhone} from '../../../components/UserComponents/ValidatePhoneAndZip';

const EditFamily = () => {

  const { t } = useTranslation(['common']);
  const anchorRef = useRef(null);
  const navigate = useNavigate();
  const theme = useTheme();
  const location= useLocation();
  const addMember = location.state && location.state.addMember !== null &&
                    location.state.addMember === true ? 'members' : 'details';
  const fetchFamilyDetails = location?.state?.fetchFamilyDetails ? true : false
  const { familyList, getFamilyList, relationList, memberTypeList, childFamilyList,signedinUserRole, signedinOrgType,userRegion } = useContext(CommonDataContext);
  const [currentTab, setCurrentTab] = useState(addMember);
  const mounted = useMounted();
  const { settings } = useSettings();
  const [family, setFamily] = useState(null);
  const [careGiver, setCareGiver] = useState(null);
  const [familyMembers, setFamilyMembers] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [addMemberPopUp, setAddMemberPopUp] = useState(false);
  const [addChildPopUp, setAddChildPopUp] = useState(false);
  const [checked, setChecked] = useState(false);
  const [child, setChild] = useState(null);
  const [children, setChildren] = useState();
  const [loading, setLoading] = useState(false);
  const [updateChildlist, setUpdateChildlist] = useState(false);
  let { id } = useParams();
  
  const tabs = [
    { label: 'Details', value: 'details' },
    { label: 'Members', value: 'members' },
    { label: 'Children', value: 'children' }
  ];

  const handleTabsChange = (event, value) => {
    setCurrentTab(value);
  };

  useEffect(() => {
    if(signedinUserRole !== null){
      if( signedinUserRole !== 'viewonly'){
        // has access
      } else {
        navigate('/Unauthorized');
      }
      return () =>{

      }
    }
  },[signedinUserRole])

  useEffect(() => {
    if(id){
      getFamily(id);
      getFamilyDetails(id);
    }
    return () => {
    }
  }, [id,updateChildlist]);
  
  const getFamilyDetails = useCallback(async (id) => {
    setLoading(true)
    try {
      const data = await APIS.FamilyDetails(id);
      if(data && data.data && data.data.familyDetails){
        setFamily(data.data.familyDetails);
        if(data.data.familyDetails.HT_familyMembers){
          let totalMembers = data.data.familyDetails.HT_familyMembers;
          setFamilyMembers(totalMembers)
        }
        let care_giver = data.data.familyDetails.HT_familyMembers.find(member => member.isPrimaryCareGiver === true)
        setCareGiver(care_giver)
        setLoading(false)
      }
    } catch (err) {
      console.error(err);
      setLoading(false)
    }
  }, []);


  const getFamily = (id) =>{
    setLoading(true);
      familyList && familyList.forEach((family)=>{
        if(family.id === id){
          setFamily(family);
        }
      })
      
      setLoading(false)
  }

 

  const handlePopUp = (value) => {
    if(value === 'member'){
      setAddChildPopUp(false)
      setAddMemberPopUp(true);
      setIsOpen(!isOpen)
    }else if(value === 'child'){
      setAddMemberPopUp(false)
      setAddChildPopUp(true);
      setIsOpen(!isOpen)
    }else{
      setAddMemberPopUp(false);
      setAddChildPopUp(false);
      setIsOpen(false);
    }
    // setIsOpen(!isOpen)
  }

  // const handleChecked = ()=>{
  //   setChecked(!checked)
  //   setChild(null)
  // }

  const navigateToChildPage = () => {
    navigate('/dashboard/child/add' ,{ state:{fromFamily:id}});
  }

  const stringToDate = (dateString) => {
    const [day, month, year] = dateString.split('/');
    return new Date([month, day, year].join('/'));
  };

  const getDate = (dateString) => {
    let yourDate = new Date(stringToDate(dateString))
    // yourDate.toISOString().split('T')[0];
    const offset = yourDate.getTimezoneOffset()
    yourDate = new Date(yourDate.getTime() - (offset*60*1000))
    return yourDate.toISOString().split('T')[0]
  }

  const saveChildFromDropdown = useCallback(async (id1,childList) => {
    let child = childList.filter(item=> item.id===id1)[0];
    
    setLoading(true)

    let payload = {
      "id": child.id,
      "firstName": child.firstName,
      "lastName": child.lastName,
      "birthDate": getDate(child.birthDate),
      "gender": child.gender,
      "phoneNumber": child.phoneNumber,
      "email": child.email,
      "HTLanguageId": child.HTLanguageId,
      "HTOrganizationId" : child.HTOrganizationId,
      "HTChildPlacementStatusId": child.HTChildPlacementStatusId,
      "HTChildStatusId": child.HTChildStatusId,
      "HTChildCurrentPlacementStatusId": child.HTChildCurrentPlacementStatusId,
      "educationLevel": child.educationLevel,
      "addressLine1": child.addressLine1,
      "addressLine2": child.addressLine2,
      "zipCode": child.zipCode,
      "HTCountryId": child.HTCountryId,
      "HTDistrictId": child.HTDistrictId,
      "HTStateId": child.HTStateId,
      "city": child.city,
      "HTFamilyId": id
  }
    try { 
      await APIS.EditChild(payload)
      .then((res)=>{
      if(res && res.data && res.status === 200){
        
        setLoading(false)
          //resetForm();
          // setStatus({ success: true });
          toast.success(t('common:family.Child Added to family Successfully'));
          // navigate('/dashboard/child/');
          handlePopUp(null);
          setUpdateChildlist(!updateChildlist);
        }else{
         toast.error(t('common:common.Something went wrong'));
         setLoading(false)
        //  setStatus({ success: false });
        //  setSubmitting(false);
        }
      })
    }catch (err) {
      toast.error(t('common:common.Something went wrong'));
      setLoading(false)
      // setStatus({ success: false });
      // setErrors({ submit: err.message });
    }
  }, []);


  return (
    <>
      {/* <Helmet>
        <title>Dashboard: Customer Edit | Material Kit Pro</title>
      </Helmet> */}
      <Box
        
        sx={{
          backgroundColor: 'background.default',
          //backgroundColor : "green",
          minHeight: '100%',
          width : '100%',
          mt : 2
          //py: 8
        }}
      >
        <Container 
        maxWidth={settings.compact ? 'xl' : false}
        >



        <Formik
        initialValues={{
          first_name : '',
          last_name : '',
          phone : '',
          email : '',
          occupation: '',
          relation: '',
          is_primary : false,
          is_caregiver : true,
          other_relation : '',
          child : '',
          submit: null,
          member_type:'',
        }}
          validationSchema={Yup
            .object()
            .shape({
              first_name : Yup.string().max(255).required(t('common:warnings.First Name is required')),
              last_name : Yup.string().max(255).required(t('common:warnings.Last Name is required')),
              email: Yup.string().email(t('common:warnings.Must be a valid email')).max(255),
              occupation: Yup.string().max(255),
              relation: Yup.string().max(255).required(t('common:warnings.Relation is required')),
              is_primary : Yup.boolean().required(t('common:warnings.This field is required')),
              is_caregiver : Yup.boolean().required(t('common:warnings.This field is required')),
              other_relation : Yup.string().max(255),
              child : Yup.string().max(255),
              member_type : Yup.string().max(255).required(t('common:warnings.Member Type is required')),
              phone: Yup.string()
                .required(t('common:warnings.Phone Number is required'))
                .test('phone-format-validation', t('common:warnings.Invalid Phone number'), (value) => {
                  if (userRegion.toLowerCase() === 'india') {
                    return /^\+91\d{10}$/.test(value);
                  } else if (userRegion.toLowerCase() === 'uganda') {
                    return /^\+256\d{9}$/.test(value);
                  } else {
                    return /^\+1\d{10}$/.test(value);
                  }
                }),
            })
          }
          onSubmit={async (values, { resetForm, setErrors, setStatus, setSubmitting }) => {
            let payload = {
              "firstName": values.first_name,
              "lastName": values.last_name, // not mandatory
              "occupation": values.occupation,
              "phoneNumber": values.phone && values.phone.replace(/[/\s()]/g,''),
              "email": values.email,              
              "isPrimaryCareGiver": checked, 
              "HTFamilyId": id,
              "HTFamilyRelationId": values.relation,
              "otherRelation": values.other_relation,  // not mandatory
              "HTFamilyMemberTypeId" : values.member_type
          }

          try { 
            await APIS.AddFamilyMember(payload).then((res)=>{
              if(res && res.data && res.status === 200){
                resetForm();
                //getFamilyList();
                getFamilyDetails(id);
                setIsOpen(false)
                setStatus({ success: true });
                setSubmitting(false);
                getFamily(id)
                toast.success(t('common:common.Member Added Successfully'));
                setUpdateChildlist(!updateChildlist);
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
          {({ errors, handleBlur, handleChange,handleReset, handleSubmit, isSubmitting, touched, values, setFieldValue }) => (
        <form onSubmit={handleSubmit}
          //{...other}
        >

        
          <Box ref={anchorRef}>
          {loading && <CircularProgress 
                            sx={{zIndex : 1000,
                                  position : "absolute",
                                  top : "55%",
                                  left : "45%"}}
                            color="primary" />}
                <Popover
                sx={{mt :18}}
                  anchorEl={anchorRef.current}
                  anchorOrigin={{
                    horizontal: 'center',
                    vertical: 'center'
                  }}
                  transformOrigin={{
                    horizontal : 'center',
                    vertical: 'center'
                  }}
                  keepMounted
                  //elevation={8}
                  //onClose={()=>handlePopUp(null)}
                  open={isOpen}
                  PaperProps={{
                    sx: { width: addChildPopUp ? '40%' : '60%',height : '80%' }
                  }}
                >
                   <Grid item sx={{ m : 1,ml : 2, display : "flex",flexDirection : "row"}}>
                      <Box sx={{flex : 1 }}> 
                      <Typography
                        color="textPrimary"
                        variant="h5"
                        sx={{mt :1}}
                      >
                        {addMemberPopUp === true ? `${t('common:common.Add Member')}`:`${t('common:child.Add Child')}`}
                      </Typography>
                      </Box>
                      

                      <IconButton
                        color="inherit"
                        onClick={()=>handlePopUp(null)}
                        sx={{
                          mt : - 0.5
                        }}
                      >
                      <CloseIcon fontSize="small" />
                      </IconButton>

                    </Grid>
                    

                   { addMemberPopUp && <Box sx={{ m: 2, mt: 1 }}>
                      
                      <Divider sx={{mb : 3}}/>
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
                            placeholder={placeholderPhone(userRegion)}
                            format={formatPhone(userRegion, values.phone)}
                            label={t('common:common.Phone Number')}
                            type="tel"
                            name="phone"
                            onBlur={handleBlur}
                            required
                            onChange={(e) => { e.target.value = e.target.value.replace(/[/\s()]/g, ''); handleChange(e) }}
                            value={values.phone}
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
                        <TextField
                          error={Boolean(touched.occupation && errors.occupation)}
                          fullWidth
                          helperText={touched.occupation && errors.occupation}
                          label={t('common:common.Occupation')}
                          name="occupation"
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
                    error={Boolean(touched.member_type && errors.member_type)}
                    fullWidth
                    helperText={touched.member_type && errors.member_type}
                    name="member_type"
                    accessKey="memberType"
                    component={AutoCompleteDropdown}            
                    label="member_type"
                    required={true}
                    options={memberTypeList}
                    textFieldProps={{
                      fullWidth: true,
                      margin: "normal",
                      variant: "outlined",
                      label:t('common:common.Member Type')
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
                    error={Boolean(touched.relation && errors.relation)}
                    fullWidth
                    helperText={touched.relation && errors.relation}
                    name="relation"
                    accessKey="relation"
                    required={true}
                    component={AutoCompleteDropdown}            
                    label="relation"
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

                      { values.member_type === '1' && 
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
                          {t('common:common.Is Primary Caregiver')}
                        </Typography>
                        <Box sx={{display : "flex",flex :1}}>
                          <Box>
                            <Switch size="small" color="orange" 
                            checked={checked} 
                            onChange={()=>setChecked(!checked)}/>   
                          </Box>
                          <Box>
                            <Typography
                              color={checked ? "#43AA8B" : "#F94144"}
                              variant="h6"
                              sx={{marginRight :2}}
                            >
                              {checked ?`${t('common:common.Yes')}` : `${t('common:common.No')}`}
                            </Typography>
                          </Box>  
                        </Box>
                      </Grid>
                      }

                    </Grid>

                <Grid
                item
                //direction="row"
                md={12}
                xs={12}
                sx={{ mt : 4 }}
                >

                <Button
                  color="primary"
                  sx={{width : 160}}
                  //disabled={isSubmitting}
                  type="submit"
                  variant="contained"
                  onClick={handleSubmit}
                  // disabled
                >
                  {t('common:common.Save')}
                </Button>


                <Button
                  color="primary"
                  sx={{width : 160, ml : 14 }}
                  disabled={isSubmitting}
                  type="reset"
                  variant="contained"
                  onClick={handleReset}
                  style={{backgroundColor : theme.palette.button.primary}}
                >
                  {t('common:common.Reset')}
                </Button>

                </Grid>
                
                  </Box> }

                  { addChildPopUp && <Box sx={{ m: 2, mt: 1 }}>
                      
                      <Divider sx={{mb : 2}}/>
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
                                {t('common:common.Choose From List')}
                            </Typography>
                            </Grid>
                            <Grid
                              item
                              md={12}
                              xs={12}
                              sx={{ mt: -2 }}
                            >
                               <Field
                                  error={Boolean(touched.child && errors.child)}
                                  fullWidth
                                  helperText={touched.child && errors.child}
                                  name="child"
                                  accessKey1="firstName"
                                  accessKey2="lastName"
                                  component={AutoCompleteDropdownMultiNames}
                                  required={true}
                                  label="child"
                                  options={childFamilyList}
                                  textFieldProps={{
                                    fullWidth: true,
                                    margin: "normal",
                                    variant: "outlined",
                                    label:t('common:child.Select Child')
                                 }}
           
                                />
                            </Grid>            
                        

                        </Grid>

                        <Grid
                              container
                              spacing={0}
                              direction="column"
                              alignItems="center"
                              justify="center">

                            <Button
                            // color="#172b4d"
                            sx={{mt : 4,width : 150}}
                            //sx={{ ml: -18,mt : 8.5,position : "absolute",width : 150 }}
                            variant="contained"
                            onClick={()=>saveChildFromDropdown(values.child,childFamilyList)}
                          >
                            {t('common:common.Save')}
                          </Button>
                          
                          </Grid>

                        <Divider sx={{mb : 2, mt : 5}}/>
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
                            //align="center"
                            color="textSecondary"
                            variant="subtitle2">
                            {t('common:child.Or Add New Child')}
                            </Typography>
                            </Grid>
                            </Grid>
                            <Grid
                              container
                              spacing={0}
                              direction="column"
                              alignItems="center"
                              justify="center">

                            <Button
                            // color="#172b4d"
                            startIcon={<PlusIcon fontSize="small" />}
                            sx={{mt : 8,width : 150}}
                            //sx={{ ml: -18,mt : 8.5,position : "absolute",width : 150 }}
                            variant="contained"
                            onClick={()=>navigateToChildPage()}
                          >
                            {t('common:child.Add Child')}
                          </Button>

                          </Grid>
                  
                        
                        </Box> }

          </Popover>
          </Box>
          </form>
          )}
          </Formik>
          


          <Grid
            container
            justifyContent="space-between"
            spacing={3}
          >
            <Grid item sx={{display : "flex",flexDirection : "row"}}>
            <IconButton
              color="inherit"
              onClick={()=>{
                if(location.state && location.state.addMember !== null){
                  navigate(-2)
                }else{
                  navigate(-1)
                }
                }}
              sx={{
                // display: {
                //   md: 'none'
                // }
                mt : - 0.5
              }}
            >
            <ChevronLeftIcon fontSize="small" />
            </IconButton>

              <Typography
                color="textPrimary"
                variant="h5"
              >
                {t('common:family.Edit Family')}
              </Typography>
              {/* <Breadcrumbs
                aria-label="breadcrumb"
                separator={<ChevronRightIcon fontSize="small" />}
                sx={{ mt: 1 }}
              >
                <Link
                  color="textPrimary"
                  component={RouterLink}
                  to="/dashboard"
                  variant="subtitle2"
                >
                  Dashboard
                </Link>
                <Link
                  color="textPrimary"
                  component={RouterLink}
                  to="/dashboard"
                  variant="subtitle2"
                >
                  Management
                </Link>
                <Typography
                  color="textSecondary"
                  variant="subtitle2"
                >
                  Customers
                </Typography>
              </Breadcrumbs> */}
              
            </Grid>
            <Grid item>
              <Box sx={{ m: -1 }}>
               { currentTab !== 'children' && <Button
                  // color="#172b4d"
                  startIcon={<PlusIcon fontSize="small" />}
                  sx={{m : 1}}
                  //sx={{ ml: -18,mt : 8.5,position : "absolute",width : 150 }}
                  variant="contained"
                  onClick={()=>handlePopUp('member')}
                >
                  {t('common:common.Add Member')}
                </Button>}

              {  currentTab !== 'members' && signedinOrgType !== '1' && <Button 
                  // color="#172b4d"
                  startIcon={<PlusIcon fontSize="small" />}
                  sx={{m : 1}}
                  //sx={{ ml: -18,mt : 8.5,position : "absolute",width : 150 }}
                  variant="contained"
                  onClick={()=>handlePopUp('child')}
                >
                  {t('common:common.Add Children')}
                </Button>}
              </Box>
            </Grid>
            
          </Grid>
          <Box sx={{ mt: 3 }}>
            <Tabs
              indicatorColor="primary"
              onChange={handleTabsChange}
              scrollButtons="auto"
              textColor="primary"
              value={currentTab}
              variant="scrollable"
            >
              {tabs.map((tab) => (
                <Tab
                  key={tab.value}
                  label={t(`common:common.${tab.label}`)}
                  value={tab.value}
                />
              ))}
            </Tabs>
          </Box>
          <Divider />

          {/* <Box mt={3}>
            <EditOrganizationForm organization={customer} />
          </Box> */}

          <Box sx={{ mt: 3 }}>
            {currentTab === 'details' && (
              <Grid
                container
                spacing={3}
              >
                <Grid
                  item
                  //lg={settings.compact ? 6 : 4}
                  lg={10}
                  //md={6}
                  md={12}
                  //xl={settings.compact ? 6 : 3}
                  xl={12}
                  xs={12}
                >
                  {family && <EditFamilyForm family={family} careGiver={careGiver} />}
                </Grid>
              </Grid>
            )}
            {currentTab === 'members' && 
                                <Members
                                id={id}
                                familyMembers={familyMembers}
                                familyId={family && family.id}
                                total_children={family && family.children && family.children.length}
                                />}

            {/* {currentTab === 'logs' && <CustomerLogs />} */}
            {currentTab === 'children' && 
                              <Children
                              id={id}
                              //familyMembers={family && family.HT_familyMembers}
                              familyMembers={familyMembers}
                              />}
          </Box>


        </Container>
      </Box>
    </>
  );
};

export default EditFamily;
