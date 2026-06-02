import { useCallback, useState, useEffect, useContext } from 'react';
import { Link as RouterLink, useParams, useNavigate } from 'react-router-dom';
//import { Helmet } from 'react-helmet-async';
import {
  Box,
  Breadcrumbs,
  Button,
  Container,
  Divider,
  Grid,
  Link,
  Tab,
  Tabs,
  Typography,
  IconButton
} from '@material-ui/core';
import { customerApi } from '../../../__fakeApi__/customerApi';
import Members from '../Components/Members';
import Children from '../Components/Children';
import FamilyBasicDetails from '../Components/FamilyBasicDetails';
//import OrganizationUsers from '../Components/OrganizationUsers';
import useMounted from '../../../common/hooks/UseMounted';
import ChevronLeftIcon from '../../../assets/icons/ChevronLeft';
import PencilAltIcon from '../../../assets/icons/PencilAlt';
//import gtm from '../../lib/gtm';
import useSettings from '../../../common/hooks/UseSettings';
import { CommonDataContext } from '../../../common/contexts/CommonDataContext';
import APIS from '../../../common/hooks/UseApiCalls';
import { useTranslation } from 'react-i18next';

const tabs = [
  { label: 'Details', value: 'details' },
  { label: 'Members', value: 'members' },
  // { label: 'Other Members', value: 'other_members' },
  { label: 'Children', value: 'children' },
//   { label: 'Logs', value: 'logs' }
];

const FamilyDetails = () => {

  const { t } = useTranslation(['common']);
  const navigate = useNavigate();
  const mounted = useMounted();
  const { familyList, signedinUserRole } = useContext(CommonDataContext);
  const { settings } = useSettings();
  const [loading, setLoading] = useState(false);

  const [children, setChildren] = useState([]);
  const [family, setFamily] = useState(null);
  const [primaryCaregiver, setPrimaryCaregiver] = useState(null);

  const [currentTab, setCurrentTab] = useState('details');
  let { id } = useParams();

  const getFamilies = () => {
        setLoading(true)
        familyList && familyList.forEach((family)=>{
          if(family.id === id){
            setFamily(family)
            let members = family.HT_familyMembers;
            let primaryCareGiver = members?.find(member=>member.isPrimaryCareGiver === true);
            setPrimaryCaregiver(primaryCareGiver)
          }
          setLoading(false)
        })
        
  }

  useEffect(() => {
    document.title = "Family | Details | Miracle Foundation"
    getFamilies();
    getFamilyDetails();
    getChildren();
    return () => {
    }
  }, []);

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

  const getFamilyDetails = useCallback(async () => {
    try {
      const data = await APIS.FamilyDetails(id);
      setFamily(data.data.familyDetails)
    } catch (err) {
      console.error(err);
    }
  }, []);

  const getChildren = async () => {
    try {
      const data = await customerApi.getChildrenList(); 
      //if (mounted.current) {
        setChildren(data);
        //setLoading(false)
     // }
    } catch (err) {
      console.error(err);
    }
  }

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
                {family && family.familyName && family.familyName}
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
                  component={RouterLink}
                  startIcon={<PencilAltIcon fontSize="small" />}
                  sx={{ m: 1 }}
                  //sx={{ml: -11.5,mt : 8,position : "absolute",width : 100 }}
                  to={`/dashboard/family/${family && family.id}/edit`}
                  variant="contained"
                >
                  {t('common:common.Edit')}
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
                  {family && <FamilyBasicDetails
                    autoid={family.autogenfamilyid}
                    id={family.id}
                    address1={family.addressLine1}
                    address2={family.addressLine2}
                    child_name={family.child}
                    total_children={family.numberOfChildren}
                    country={family.HTCountryId}
                    state={family.HTStateId}
                    language={family.HTLanguageId}
                    zip_code={family.zipCode}
                    //care_givers = {family.care_givers}
                    city={family.city}
                    district={family.HTDistrictId}
                    status = { family.isActive}
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


                    {currentTab === 'members' && family!==null && 
                    family.HT_familyMembers?.length > 0 && 
                    <Members familyMembers={family.HT_familyMembers}  
                    familyId={family && family.id}
                    total_children={'0'}
                    />}

                    {currentTab === 'children' && 
                      <Children 
                      children={children} 
                      familyMembers={family?.HT_familyMembers}
                      />}
          </Box>
        </Container>
      </Box>
    </>
  );
};

export default FamilyDetails;
