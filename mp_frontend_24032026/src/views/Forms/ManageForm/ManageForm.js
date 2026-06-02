import { useState, useContext, useEffect
  //  useCallback, useEffect 
} from 'react';
import { 
  // useParams,
  useNavigate 
} from 'react-router-dom';
//import { Helmet } from 'react-helmet-async';
import { Box, Container, Grid, Typography, Tab, Tabs, Divider,IconButton, Button} from '@material-ui/core';
// import { customerApi } from '../../../__fakeApi__/customerApi';
// import EditUserForm from '../Components/EditUserForm';
import ManageFormComponent from '../Components/ManageFormComponent';
//import ChildFamilyListing from '../Components/ChildFamilyListing';
// import Cases from '../Components/Cases';
// import useMounted from '../../../common/hooks/UseMounted';
import useSettings from '../../../common/hooks/UseSettings';
import ChevronLeftIcon from '../../../assets/icons/ChevronLeft';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import { useTranslation } from 'react-i18next';
import { CommonDataContext } from '../../../common/contexts/CommonDataContext';

// import APIS from '../../../common/hooks/UseApiCalls';
//import gtm from '../../lib/gtm';

const ManageForm = () => {
  const navigate = useNavigate();
  const { t } = useTranslation(['common']);
  const {signedinUserRole} = useContext(CommonDataContext);
  const [currentTab, setCurrentTab] = useState('manage');
  const [saveAndRedirect, setSaveAndRedirect] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  // const mounted = useMounted();
  const { settings } = useSettings();
  const form = {domain : '1'};
  //const [user, setUser] = useState(null);
  //const [loading, setLoading] = useState(false);
  // let { id } = useParams();
  
const tabs = [
    { label: 'Manage', value: 'manage' },
    // { label: 'Family', value: 'Family' },
    // { label: 'Assessments', value: 'logs' }
  ];

  const handleTabsChange = (event, value) => {
    setCurrentTab(value);
  };

//   const getUsers = useCallback(async () => {
//     try {
//       const data = await customerApi.getChildrenList();
//       if (mounted.current) {
//         data.forEach((user)=>{
//           if(user.id === id){
//             setUser(user)
//           }
//         })
//         setLoading(false)
//       }
//     } catch (err) {
//       console.error(err);
//     }
//   }, [mounted]);

  useEffect(() => {
    if(signedinUserRole !== null){
      if( signedinUserRole === 'superadmin'){
        // has access
      } else {
        navigate('/Unauthorized');
      }
    }
    return () => {
    }
  }, [signedinUserRole]);

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
              onClick={()=>navigate('/dashboard/forms')}
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
                {t('common:form.manageForm')}
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
              <Box>
                <Button
                  // color="#172b4d"
                  // startIcon={<PlusIcon fontSize="small" />}
                  //sx={{m : 1}}
                  sx={{ width : 150 }}
                  variant="contained"
                  onClick={()=>setSaveAndRedirect('preview')}
                >
                  {t('common:form.preview')}
                </Button>
                
                <Button
                  // color="#172b4d"
                  // startIcon={<PlusIcon fontSize="small" />}
                  //sx={{m : 1}}
                  sx={{ ml: 2, width : 150 }}
                  variant="contained"
                  onClick={()=>setIsOpen(true)}
                  disabled={!(signedinUserRole=='superadmin')}
                >
                  {t('common:form.publish')}
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
                  label={t(`common:form.${tab.label}`)}
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
            {currentTab === 'manage' && (
              <Grid
                container
                spacing={3}
              >
                <Grid
                  item
                  lg={12}
                  md={12}
                  xl={12}
                  xs={12}
                >
                <ManageFormComponent 
                  form={form}
                  redirectPage={saveAndRedirect}
                />
                </Grid>
              </Grid>
            )}

          </Box>


        </Container>
      </Box>
      <Dialog aria-labelledby="simple-dialog-title" open={isOpen}>
        <DialogTitle id="simple-dialog-title">{t('common:form.publishForm')}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
          {t('common:form.confirmPublish')}<br></br>
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={()=>setSaveAndRedirect('publish')} color="primary">
          {t('common:common.Yes')}
          </Button>
          <Button onClick={()=>setIsOpen(false)} color="primary"autoFocus>
          {t('common:common.No')}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ManageForm;
