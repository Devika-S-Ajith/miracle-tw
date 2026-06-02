import { useCallback, useState, useEffect, useContext } from 'react';
import { Link as RouterLink, useParams, useNavigate } from 'react-router-dom';
//import { Helmet } from 'react-helmet-async';
import {
  Box,
  // Breadcrumbs,
  Button,
  Container,
  Divider,
  Grid,
  // Link,
  Tab,
  Tabs,
  Typography,
  IconButton
} from '@material-ui/core';
// import { customerApi } from '../../../__fakeApi__/customerApi';
import OrganizationContactDetails from '../Components/OrganizationContactDetails';
import LinkedOrganizationList from '../Components/LinkedOrganizationList';
import OrganizationUsers from '../Components/OrganizationUsers';
import useMounted from '../../../common/hooks/UseMounted';
import ChevronLeftIcon from '../../../assets/icons/ChevronLeft';
import PencilAltIcon from '../../../assets/icons/PencilAlt';
//import gtm from '../../lib/gtm';
import useSettings from '../../../common/hooks/UseSettings';
import APIS from '../../../common/hooks/UseApiCalls';
import { useTranslation } from 'react-i18next';
import { CommonDataContext } from '../../../common/contexts/CommonDataContext';

let tabs = [
  { label: 'Details', value: 'details' },
  { label: 'Users', value: 'users' },
  { label: 'Linked Organizations', value: 'linked' }
];

const OrganizationDetails = () => {
  const { t } = useTranslation(['common']);
  const { signedinOrgType, signedinUserRole } = useContext(CommonDataContext)
  const navigate = useNavigate();
  const mounted = useMounted();
  const { settings } = useSettings();
  const [organisation, setOrganisation] = useState(null);
  const [orgList, setOrgList] = useState(null);
  const [linkedOrgList, setLinkedOrgList] = useState(null);
  const [currentTab, setCurrentTab] = useState('details');
  let { id } = useParams();

  const getOrganisation = useCallback(async () => {
    document.title = "Organizations | Details | Miracle Foundation"
    try {
      const data = await APIS.OrganisationDetails(id);
      if (mounted.current) {
        setOrganisation(data.data.organizationDetails);
        setOrgList(data.data.linkingOrganizations);
        setLinkedOrgList(data.data.linkedOrganizations)
      }
    } catch (err) {
      console.error(err);
    }
  }, []);

  useEffect(() => {
    getOrganisation();
    return () => {
    }
  }, [getOrganisation]);

  useEffect(() => {
    if(signedinOrgType !== null && signedinUserRole !== null){
      if((signedinOrgType == 1 && signedinUserRole !== 'viewonly')
      || (signedinOrgType == 5 && ['admin','caseworker'].includes(signedinUserRole))){
        // has access to user
      } else if(signedinOrgType == 3 || signedinOrgType == 4 && signedinUserRole !== 'viewonly') {
        let arrayToBeMoified = tabs;
        arrayToBeMoified.splice(1,1)
        tabs = arrayToBeMoified;
      } else {
        navigate('/Unauthorized');
      }
    }
    return () =>{
    }
  },[signedinOrgType,signedinUserRole])

  const handleTabsChange = (event, value) => {
    setCurrentTab(value);
  };

  if (!organisation) {
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
                {organisation.organizationName}
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
              {(signedinUserRole === 'superadmin') ?(<Box sx={{ m: -1 }}>
                <Button
                  color="primary"
                  component={RouterLink}
                  startIcon={<PencilAltIcon fontSize="small" />} 
                  sx={{ m: 1 }}
                  //sx={{ml: -11.5,mt : 8,position : "absolute",width : 100 }}
                  to={`/dashboard/organizations/${id}/edit`}
                  variant="contained"
                >
                  {t('common:common.Edit')}
                </Button>
              </Box>):<></>}
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
                  <OrganizationContactDetails
                    id={organisation.organizationId}
                    orgId={organisation.id}
                    address1={organisation.addressLine1}
                    address2={organisation.addressLine2}
                    country={organisation.HTCountryId}
                    email={organisation.email}
                    website={organisation.website}
                    isVerified={organisation.isActive}
                    phone={organisation.phoneNumber}
                    state={organisation.HTStateId}
                    organizationType = {organisation.HTOrganizationTypeId}
                    city={organisation.city}
                    district={organisation.HTDistrictId}
                    zipCode={organisation.zipCode}
                    profileImage={organisation.fileUrl}
                    isDCPU={organisation.isDCPUOrg}
                    consentRequired={organisation.consentRequired}
                  />
                </Grid>
              </Grid>
            )}
            {currentTab === 'users' && <OrganizationUsers />}
            {currentTab === 'linked' && <LinkedOrganizationList orgList={orgList} linkedOrgList={linkedOrgList} />}
          </Box>
        </Container>
      </Box>
    </>
  );
};

export default OrganizationDetails;
