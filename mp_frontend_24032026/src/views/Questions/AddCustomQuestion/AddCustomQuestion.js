import { useEffect,useContext } from 'react';
import {  useNavigate } from 'react-router-dom';
//import { Helmet } from 'react-helmet-async';
import { Box, Container, Grid, Typography, IconButton } from '@material-ui/core';
// import { customerApi } from '../../../__fakeApi__/customerApi';
import AddQuestionForm from '../Components/AddQuestionForm';
// import useMounted from '../../../common/hooks/UseMounted';
import useSettings from '../../../common/hooks/UseSettings';
import ChevronLeftIcon from '../../../assets/icons/ChevronLeft';
//import gtm from '../../lib/gtm';
import { useTranslation } from 'react-i18next';
import { CommonDataContext } from '../../../common/contexts/CommonDataContext';
import AddCustomQuestionForm from '../Components/AddCustomQuestionForm/AddCustomQuestionForm';


const AddCustomQuestion = () => {
  const navigate = useNavigate();
  const { t } = useTranslation(['common']);
  // const mounted = useMounted();
  const { signedinUserRole } = useContext(CommonDataContext);
  const { settings } = useSettings();

  useEffect(() => {
    if(signedinUserRole !== null){
      if( signedinUserRole === 'superadmin' || signedinUserRole === 'admin'){
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
             
            </Grid>
          </Grid>
          <Box mt={3}>
            <AddCustomQuestionForm />
          </Box>
        </Container>
      </Box>
    </>
  );
};

export default AddCustomQuestion;
