import { useState, useCallback, useEffect, useContext } from 'react';
import { useParams,useNavigate } from 'react-router-dom';
//import { Helmet } from 'react-helmet-async';
import { Box, Button, Container, Grid, Typography, Tab, Tabs, Divider,IconButton} from '@material-ui/core';
// import { customerApi } from '../../../__fakeApi__/customerApi';
import EditOrganizationForm from '../Components/EditOrganizationForm';
import OrganizationUsers from '../Components/OrganizationUsers';
import OrganizationLink from '../Components/OrganizationLink';
import useMounted from '../../../common/hooks/UseMounted';
import useSettings from '../../../common/hooks/UseSettings';
import ChevronLeftIcon from '../../../assets/icons/ChevronLeft';
import PlusIcon from '../../../assets/icons/Plus';
import APIS from '../../../common/hooks/UseApiCalls';
import { useTranslation } from 'react-i18next';
import { CommonDataContext } from '../../../common/contexts/CommonDataContext';

const EditOrganization = () => {
  const { t } = useTranslation(['common']);
  const navigate = useNavigate();
  const [currentTab, setCurrentTab] = useState('details');
  const {signedinOrgType, signedinUserRole} = useContext(CommonDataContext);
  const mounted = useMounted();
  const { settings } = useSettings();
  const [customer, setCustomer] = useState(null);
  const [orgList, setOrgList] = useState(null);
  const [linkedOrgList, setLinkedOrgList] = useState(null);
  let { id } = useParams();
  
const tabs = [
    { label: 'Details', value: 'details' },
    { label: 'Users', value: 'users' },
    { label: 'Linked Organizations', value: 'linked' }
  ];

  const handleTabsChange = (event, value) => {
    setCurrentTab(value);
    getCustomer();
  };

  const getCustomer = useCallback(async () => {
    try {
      const data = await APIS.OrganisationDetails(id);
      if (mounted.current) {
        setCustomer(data.data.organizationDetails);
        setOrgList(data.data.linkingOrganizations);
        setLinkedOrgList(data.data.linkedOrganizations)
      }
    } catch (err) {
      console.error(err);
    }
  }, []);

  useEffect(() => {
    getCustomer();
    return () => {
    }
  }, [getCustomer]);

  useEffect(() => {
    if(signedinOrgType !== null && signedinUserRole !== null){
      if(signedinOrgType == 1 && signedinUserRole === 'superadmin'){
        // has access
      } else {
        navigate('/Unauthorized');
      }
    }
    return () =>{
    }
  },[signedinOrgType,signedinUserRole])

  if (!customer) {
    return null;
  }

  return (
    <>
      {/* <Helmet>
        <title>Dashboard: Customer Edit | Material Kit Pro</title>
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
                {t('common:organization.Organization Edit')}
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
                <Button
                  color="primary"
                  // component={RouterLink}
                  startIcon={<PlusIcon fontSize="small" />}
                  sx={{ m: 1 }}
                  //sx={{ml: -11.5,mt : 8,position : "absolute",width : 100 }}
                  onClick={()=>navigate('/dashboard/users/add' ,{ state:{fromOrg:id}})}
                  variant="contained"
                >
                  {t('common:common.Add Users')}
                </Button>
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
                  lg={12}
                  //md={6}
                  md={12}
                  //xl={settings.compact ? 6 : 3}
                  xl={12}
                  xs={12}
                >
                  <EditOrganizationForm organization={customer} />
                </Grid>
              </Grid>
            )}
            {currentTab === 'users' && <OrganizationUsers />}
            {currentTab === 'linked' && <OrganizationLink orgList={orgList} linkedOrgList={linkedOrgList} />}
          </Box>


        </Container>
      </Box>
    </>
  );
};

export default EditOrganization;
