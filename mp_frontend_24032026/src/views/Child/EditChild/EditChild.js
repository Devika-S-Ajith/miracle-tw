import { useState, useCallback, useEffect, useContext } from 'react';
import { useParams,useNavigate } from 'react-router-dom';
//import { Helmet } from 'react-helmet-async';
import { Box, Container, Grid, Typography, Tab, Tabs, Divider,IconButton} from '@material-ui/core';
// import { customerApi } from '../../../__fakeApi__/customerApi';
// import EditUserForm from '../Components/EditUserForm';
import EditChildForm from '../Components/EditChildForm';
import ChildFamilyListing from '../Components/ChildFamilyListing';
// import Cases from '../Components/Cases';
import useMounted from '../../../common/hooks/UseMounted';
import useSettings from '../../../common/hooks/UseSettings';
import ChevronLeftIcon from '../../../assets/icons/ChevronLeft';
import APIS from '../../../common/hooks/UseApiCalls';
import { CommonDataContext } from '../../../common/contexts/CommonDataContext';
//import gtm from '../../lib/gtm';
import { useTranslation } from 'react-i18next';
const EditChild = () => {
  const { t } = useTranslation(['common']);
  const {signedinOrgType, signedinUserRole} = useContext(CommonDataContext);
  const navigate = useNavigate();
  const [currentTab, setCurrentTab] = useState('edit');
  const mounted = useMounted();
  const { settings } = useSettings();
  const [user, setUser] = useState(null);
  // const [loading, setLoading] = useState(false);
  let { id } = useParams();
  
const tabs = [
    { label: 'Details', value: 'edit' }, 
    // { label: 'Family', value: 'Family' },
    // { label: 'Assessments', value: 'logs' }
  ];

  const handleTabsChange = (event, value) => {
    setCurrentTab(value);
  };

  const getUsers = useCallback(async () => {
    try {
      const data = await APIS.ChildDetails(id);
      // if (mounted.current) {
        // console.log(data)
        setUser(data.data.data);
    } catch (err) {
      console.error(err);
    }
  }, [mounted]);

  useEffect(() => {
    getUsers();
    return () => {
    }
  }, []);

  useEffect(() => {
    if(signedinOrgType !== null && signedinUserRole !== null){
      if((signedinOrgType == 3 || signedinOrgType == 4 || signedinOrgType == 5) && (signedinUserRole === 'admin' || signedinUserRole === 'caseworker')){
        // has access
      } else {
        navigate('/Unauthorized');
      }
    }
    return () =>{

    }
  },[signedinOrgType,signedinUserRole])

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
                {t('common:child.Child Edit')}
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
            {currentTab === 'edit' && (
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
                 { user && <EditChildForm user={user} />}{
                     console.log(user,'l')
                 }
                </Grid>
              </Grid>
            )}
            {currentTab === 'Family' && <ChildFamilyListing />}
          </Box>


        </Container>
      </Box>
    </>
  );
};

export default EditChild;
