import { useState, useCallback, useEffect, useContext } from 'react';
import { Link as RouterLink,useParams,useNavigate,useLocation } from 'react-router-dom';
// import * as Yup from 'yup';
// import { Formik } from 'formik';
// import toast from 'react-hot-toast';
//import { Helmet } from 'react-helmet-async';
import { Box, 
  // Breadcrumbs,
  Button, 
  Container,
  Grid, 
  // Link, 
  Typography,
  // TextField,
  Tab, 
  Tabs, 
  Divider,
  IconButton,
  // Popover,
  // MenuItem,
  // Switch,
  // useTheme
} from '@material-ui/core';
// import NumberFormat from 'react-number-format';
// import { customerApi } from '../../../__fakeApi__/customerApi'; 
import EditCaseForm from '../Components/EditCaseForm';
import Assessments from '../Components/Assessments';
// import useMounted from '../../../common/hooks/UseMounted';
import useSettings from '../../../common/hooks/UseSettings';
import ChevronLeftIcon from '../../../assets/icons/ChevronLeft';
import APIS from '../../../common/hooks/UseApiCalls';
import PlusIcon from '../../../assets/icons/Plus';
// import CloseIcon from '@material-ui/icons/Close';
// import { CommonDataContext } from '../../../common/contexts/CommonDataContext';
//import gtm from '../../lib/gtm';
import { useTranslation } from 'react-i18next';
import { CommonDataContext } from '../../../common/contexts/CommonDataContext';

const EditCase = () => {
  const { t } = useTranslation(['common']);
  const {signedinOrgType, signedinUserRole} = useContext(CommonDataContext);
  // const anchorRef = useRef(null);
  const { settings } = useSettings();
  const navigate = useNavigate();
  // const theme = useTheme();
  const location= useLocation();
  // const addMember = location.state && location.state.addMember !== null &&
  //                   location.state.addMember === true ? 'members' : 'details';
  const viewAssessments = location.state && location.state.viewAssessments
  // const fetchCaseDetails =  true ;
  // const { caseList } = useContext(CommonDataContext);
  const [currentTab, setCurrentTab] = useState(viewAssessments ? 'assessments' : 'details');
  // const mounted = useMounted();
  // const { settings } = useSettings();
  const [family, setFamily] = useState(null);
  const [cases, setCases] = useState(null);
  // const [isOpen, setIsOpen] = useState(false);
  // const [loading, setLoading] = useState(false);
  let { id } = useParams();
  
  const tabs = [
    { label: 'Details', value: 'details' },
    { label: 'Assessments', value: 'assessments' }
  ];

  // const cases = { caseID: '1001', caseWorker: 'worker1', child: 'child1' }

  const handleTabsChange = (event, value) => {
    setCurrentTab(value);
  };

  useEffect(() => {
    // getCase(id);
    // if(fetchCaseDetails){
      getCaseDetails(id);
    // }
    return () => {
    }
  }, [id]);

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
  
  const getCaseDetails = useCallback(async () => {
    try {
      const data = await APIS.CaseDetails(id);
      setCases(data.data.data)
    } catch (err) {
      console.error(err);
    }
  }, []);


  // const getCase = (id) =>{
  //   setLoading(true);
  //     caseList && caseList.forEach((family)=>{
  //       if(family.id === id){
  //         setFamily(family);
  //         setLoading(false);
  //       }
  //     })
  // }

 

  const handlePopUp = (value) => {
    navigate(`/dashboard/assessments/add`, { 
      state: {
        "fromCaseList": true,
        "caseId" : id
      }
    });
    // if(value === 'member'){
    //   setAddChildPopUp(false)
    //   setAddMemberPopUp(true)
    // }else if(value === 'child'){
    //   setAddMemberPopUp(false)
    //   setAddChildPopUp(true)
    // }
    // setIsOpen(!isOpen)
  }

  // const handleChecked = ()=>{
  //   setChecked(!checked)
  //   setChild(null)
  // }


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
                {t('common:case.Case Edit')}
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
               { currentTab !== 'children' && cases?.caseStatus === 'Open' && <Button
                  // color="#172b4d"
                  startIcon={<PlusIcon fontSize="small" />}
                  sx={{m : 1}}
                  //sx={{ ml: -18,mt : 8.5,position : "absolute",width : 150 }}
                  variant="contained"
                  onClick={()=>handlePopUp('member')}
                >
                  {t('common:assessment.Start Assessment')}
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
                  {cases && <EditCaseForm cases={cases} />} 
                </Grid>
              </Grid>
            )}
            {currentTab === 'assessments' && 
                <Assessments
                caseId={id}
                id={id}
                care_givers={family && family.HT_familyMembers}
                total_children={family && family.children && family.children.length}
            />}
          </Box>


        </Container>
      </Box>
    </>
  );
};

export default EditCase;
