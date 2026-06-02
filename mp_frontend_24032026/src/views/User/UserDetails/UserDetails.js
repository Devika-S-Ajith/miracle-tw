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
import UserBasicDetails from '../Components/UserBasicDetails';
// import RelatedOrganization from '../Components/RelatedOrganization';
// import Cases from '../Components/Cases';
//import OrganizationUsers from '../Components/OrganizationUsers';
// import useMounted from '../../../common/hooks/UseMounted';
import ChevronLeftIcon from '../../../assets/icons/ChevronLeft';
import PencilAltIcon from '../../../assets/icons/PencilAlt';
//import gtm from '../../lib/gtm';
import useSettings from '../../../common/hooks/UseSettings';
import APIS from '../../../common/hooks/UseApiCalls';
import { CommonDataContext } from '../../../common/contexts/CommonDataContext';
import { useTranslation } from 'react-i18next';
const tabs = [
  { label: 'Details', value: 'details' },
  // { label: 'Cases', value: 'cases' },
//   { label: 'Logs', value: 'logs' }
];

const UserDetails = () => {
  const { getUserTokens, signedinUserRole,signedinOrgType } = useContext(CommonDataContext);
  const navigate = useNavigate(); 
  // const mounted = useMounted();
  const { settings } = useSettings();
  // const [customer, setCustomer] = useState(null);
  // const [loading, setLoading] = useState(false);
  const { t } = useTranslation(['common']);
  // const [users, setUsers] = useState(null);
  const [user, setUser] = useState(null);
  const orgId = localStorage.getItem('orgId')
  const [currentTab, setCurrentTab] = useState('details');
  let { id } = useParams();

  useEffect(() => {
    //gtm.push({ event: 'page_view' });
    getUserTokens();
  },[]);





  const getUsers = useCallback(async () => {
    try {
      const data = await APIS.UserDetails(id);
      // if (mounted.current) {
        console.log(data)
        setUser(data.data.userDetails);
      // }
    } catch (err) { 
      console.error(err);
    }
  }, []);

  useEffect(() => {
    document.title = "Users | Details | Miracle Foundation"
    //getCustomer();
    getUsers();
  }, []);

  const handleTabsChange = (event, value) => {
    setCurrentTab(value);
  };

  // if (!user) {
  //   console.log("returning null")
  //   return null;
  // }

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
                {user && user.firstName + ' ' + user.lastName}
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
                {user?
                 ((signedinUserRole === 'superadmin' && user.HTOrganizationId === orgId) || 
                 (signedinUserRole === 'admin' && signedinOrgType == 1 && user.HTOrganizationId === orgId) ||
                 (signedinUserRole === 'admin' && signedinOrgType == 2 && user.HTOrganizationId === orgId) ||
                 (signedinUserRole === 'admin' && signedinOrgType == 3 && user.HTOrganizationId === orgId) ||
                 (signedinUserRole === 'admin' && signedinOrgType == 4 && user.HTOrganizationId === orgId) ||
                 (signedinUserRole === 'admin' && signedinOrgType == 5 && user.HTOrganizationId === orgId)) &&
                 (!(signedinUserRole === 'admin' && user.HTUserRoleId === "1")) 
                ?(<Button
                  color="primary"
                  component={RouterLink}
                  startIcon={<PencilAltIcon fontSize="small" />}
                  sx={{ m: 1 }}
                  //sx={{ml: -11.5,mt : 8,position : "absolute",width : 100 }}
                  to={`/dashboard/users/${id}/edit`}
                  variant="contained"
                >
                  {t('common:common.Edit')}
                </Button>):<></>: <></>}
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
                  {user && <UserBasicDetails
                    address1={user.addressLine1}
                    id={user.userId}
                    name={user.firstName + ' ' + user.lastName}
                    country={user.HTCountryId}
                    district={user.HTDistrictId}
                    state={user.HTStateId}
                    email={user.email}
                    phone={user.phoneNumber}                   
                    organization = {user.HTOrganizationId}
                    city={user.city}
                    avater={user.avatar}
                    role={user.HTUserRoleId}
                    status = {user.isActive}
                    zip = {user.zipCode}
                    address2={user.addressLine2}
                  />}
                </Grid>
                {/* <Grid
                  item
                  lg={settings.compact ? 6 : 4}
                  md={6}
                  xl={settings.compact ? 6 : 3}
                  xs={12}
                >
                  <CustomerInvoicesSummary />
                </Grid> */}
                {/* <Grid
                  item
                  lg={settings.compact ? 6 : 4}
                  md={6}
                  xl={settings.compact ? 6 : 3}
                  xs={12}
                >
                  <CustomerEmailsSummary />
                </Grid> */}
                {/* <Grid
                  item
                  lg={settings.compact ? 6 : 4}
                  md={6}
                  xl={settings.compact ? 6 : 3}
                  xs={12}
                >
                  <CustomerDataManagement />
                </Grid> */}
              </Grid>
            )}
            {/* {currentTab === 'organization' && user!==null && <RelatedOrganization id={user.organizationId}/>} */}


            {/* {currentTab === 'cases' && <Cases />} */}
          </Box>
        </Container>
      </Box>
    </>
  );
};

export default UserDetails;
