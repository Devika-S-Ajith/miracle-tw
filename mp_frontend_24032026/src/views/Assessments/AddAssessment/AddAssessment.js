import { useEffect, useContext } from 'react';
import {  useNavigate, useLocation } from 'react-router-dom';
//import { Helmet } from 'react-helmet-async';
import { Box, Container, Grid, Typography, IconButton } from '@material-ui/core';
import { useTranslation } from 'react-i18next';
// import { customerApi } from '../../../__fakeApi__/customerApi';
import AddAssessmentForm from '../Components/AddAssessmentForm';
import useSettings from '../../../common/hooks/UseSettings';
import ChevronLeftIcon from '../../../assets/icons/ChevronLeft';
import { CommonDataContext } from '../../../common/contexts/CommonDataContext';
import '../../../theme/fontSize.css'

//import gtm from '../../lib/gtm';

const AddAssessment = () => {
  const navigate = useNavigate();
  const { t } = useTranslation(['common']);
  const { signedinUserRole, signedinOrgType } = useContext(CommonDataContext)
  const location= useLocation();
  const viewAssessment = location.state && location.state.viewAssessment
  const editAssessment = location.state && location.state.editAssessment
  const { settings } = useSettings();

  useEffect(() => {
    if (viewAssessment){
      document.title = "Assessments | View | Miracle Foundation"
    }
    if(signedinOrgType !== null && signedinUserRole !== null){
      if (viewAssessment){
        if(signedinUserRole === 'viewonly'){
          navigate('/Unauthorized');
        }
      }else {// for edit and add
        if(signedinUserRole !== 'viewonly' && [3,4,5].includes(parseInt(signedinOrgType))){
          // has access (all orgs other than miracle and govt DCPU has add/edit)
        } else {
          navigate('/Unauthorized');
        }
      }
    }
    // if(signedinUserRole !== 'viewonly' && [3,4,5].includes(parseInt(signedinOrgType))){
    //   // has access
    // } else {
    //   navigate('/Unauthorized');
    // }
  }, [signedinOrgType,signedinUserRole]);


  return (
    <>
      {/* <Helmet>
        <title>Dashboard: Customer Edit | Material Kit Pro</title>
      </Helmet> */}
      <Box id="scroller"
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
                <label >{viewAssessment ? t('common:assessment.View Assessment') : 
                  editAssessment ? t('common:assessment.Edit Assessment') : 
                  t('common:assessment.Add Assessment')}</label>
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
          <Box mt={3}>
            <AddAssessmentForm />
          </Box>
        </Container>
      </Box>
    </>
  );
};

export default AddAssessment;
