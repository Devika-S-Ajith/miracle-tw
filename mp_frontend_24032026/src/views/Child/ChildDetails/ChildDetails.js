import { useCallback, useState, useEffect, useContext } from 'react';
import { Link as RouterLink, useParams,useNavigate, useLocation } from 'react-router-dom';
//import { Helmet } from 'react-helmet-async';
import {
  Box,
  Button,
  Container,
  Divider,
  Grid,
  Tab,
  Tabs,
  Typography,
  IconButton
} from '@material-ui/core';
import { customerApi } from '../../../__fakeApi__/customerApi';
import ChildContactDetails from '../Components/ChildContactDetails';
import ChildFamilyListing from '../Components/ChildFamilyListing';
import ChildHistory from '../Components/ChildHistory';
import Documents from '../Components/Documents';
import ProgressReport from '../Components/ProgressReport'
import CCI from '../Components/CCI';
import useMounted from '../../../common/hooks/UseMounted';
import ChevronLeftIcon from '../../../assets/icons/ChevronLeft';
import PencilAltIcon from '../../../assets/icons/PencilAlt';
//import gtm from '../../lib/gtm';
import useSettings from '../../../common/hooks/UseSettings';
import APIS from '../../../common/hooks/UseApiCalls';
import Assessments from '../Components/Assessments';
import { useTranslation } from 'react-i18next';
import RadarGraph from '../Components/RadarGraph/RadarGraph';
import { CommonDataContext } from '../../../common/contexts/CommonDataContext';

const tabs = [
  { label: 'Details', value: 'details' },
  { label: 'CCI', value: 'CCI' },
  { label: 'Family', value: 'Family' },
  { label: 'Assessments', value: 'Assessments' },
  { label: 'Progress Report', value: 'ProgressReport' },
  { label: 'Thrive scale score trend', value: 'Thrive scale score trend' },
  { label: 'History', value: 'History' },
  { label: 'Documents', value: 'Documents' }
  
];

const ChildDetails = () => {
  const navigate = useNavigate();
  const {state} = useLocation();
  const comingFromChildList = Boolean(state?.tabvalue);
  const currtabvalue = state?.tabvalue;
  const mounted = useMounted();
  const { settings } = useSettings();
  const [customer, setCustomer] = useState(null);
  const [currentTab, setCurrentTab] = useState(comingFromChildList ? currtabvalue:"details");
  let { id } = useParams();
  const {signedinOrgType, signedinUserRole} = useContext(CommonDataContext);
  const { t } = useTranslation(['common']);
  const getCustomer = useCallback(async () => {
    document.title = "Child | Details | Miracle Foundation"
    try {
      const data = await APIS.ChildDetails(id);
      // if (mounted.current) {
        console.log(data)
        setCustomer(data.data.data);
      // }
    } catch (err) { 
      console.error(err);
    }
  }, []);

  useEffect(() => {
    getCustomer();
    return () => {
    }
  }, [getCustomer]);

  const handleTabsChange = (event, value) => {
    setCurrentTab(value);
  };

  if (!customer) {
    return null;
  }
 
  return (
    <>
      {/* <Helmet>
        <title>Dashboard: Customer Details | Material Kit Pro</title>
      </Helmet> */}

      <Box
        sx={{
          backgroundColor: 'background.default',
          minHeight: '100%',
          mt : 2
          //py: 8
        }}
      >
        <Container maxWidth={settings.compact ? 'xl' : false}>
          <Grid
            container
            justifyContent="space-between"
            spacing={3}
          >
            <Grid item sx={{display : "flex",flexDirection : "row"}}>
              <IconButton
              color="inherit"
              onClick={()=>navigate(-1)}
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
                {`${customer.firstName} ${customer.lastName}`}
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
                {((signedinOrgType == 3 || signedinOrgType == 4 || signedinOrgType == 5) && (signedinUserRole === 'admin' || signedinUserRole === 'caseworker'))
                ?((currentTab === 'details' ||currentTab === 'CCI'||currentTab === 'Family') && (<Button
                  color="primary"
                  component={RouterLink}
                  startIcon={<PencilAltIcon fontSize="small" />} 
                  sx={{ m: 1 }}
                  to={`/dashboard/child/${id}/edit`}
                  variant="contained"
                >
                  {t('common:common.Edit')}
                </Button>)):<></>}
              
                {((currentTab == 'Family') && customer.HTFamilyId)
                ?(<Button
                  color="primary"
                  component={RouterLink}
                  sx={{ m: 1 }}
                  to={`/dashboard/family/${customer.HTFamilyId}/view`}
                  variant="contained"
                >
                  {t('common:common.View Family Page')}
                </Button>):<></>}
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
          <Box sx={{ mt: 3 }}>
            {currentTab === 'details' && (
              
                  <ChildContactDetails
                    name={`${customer.firstName} ${customer.lastName}`}
                    country={customer.HTCountryId}
                    gender={customer.gender}
                    birthdate={customer.birthDate}
                    isVerified={customer.isActive}
                    caseManager={customer.userFirstName + ' ' + customer.userLastName}
                    caregiver={customer.familyMemberName}
                    organization = {customer.HTOrganizationId}
                    email = {customer.email}
                    phone = {customer.phoneNumber}
                    language = {customer.HTLanguageId}
                    id={customer.childId}
                    state = {customer.HTStateId}
                    city = {customer.city}
                    district = {customer.HTDistrictId}
                    zip = {customer.zipCode}
                    address1 = {customer.addressLine1}
                    address2 = {customer.addressLine2}
                    education = {customer.HTChildEducationLevelId}
                    status = {customer.HTChildStatusId}
                    placementStatus = {customer.HTChildPlacementStatusId}
                    currentPlacement = {customer.HTChildCurrentPlacementStatusId}
                    addDate = {customer.dateOfEntry}
                    closedDate = {customer.dateOfExit}
                    educationSpecific = {customer.highestEducationLevel}
                    profileImage={customer.fileUrl}
                  />
               
            )}
            {currentTab === 'CCI' && <CCI cciInfo = {customer}/>}
            {currentTab === 'Family' && <ChildFamilyListing id = {customer.HTFamilyId} childId ={customer.childId} />}           
            {currentTab === 'Assessments' && <Assessments childId = {customer.id}/>}
            {currentTab === 'Documents' && <Documents childId = {customer.id}/>}
            {currentTab === 'History' && <ChildHistory id={customer.id} caseId ={customer.HTCaseId}/>}
            {currentTab === 'Thrive scale score trend' && <RadarGraph childId = {customer.id}/>}
            {currentTab === 'ProgressReport' && <ProgressReport id={customer.id} caseId ={customer.HTCaseId}/>}
          </Box>
        </Container>
      </Box>
    </>
  );
};

export default ChildDetails;
