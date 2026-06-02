import { useState, useCallback, useEffect, useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
//import { Helmet } from 'react-helmet-async';
import { Box, Container, Grid, Typography, IconButton } from '@material-ui/core';
import { customerApi } from '../../../__fakeApi__/customerApi';
// import AddOrganizationForm from '../Components/AddOrganizationForm';
import AddChildForm from '../Components/AddChildForm';
import useMounted from '../../../common/hooks/UseMounted';
import useSettings from '../../../common/hooks/UseSettings';
import { CommonDataContext } from '../../../common/contexts/CommonDataContext';
import ChevronLeftIcon from '../../../assets/icons/ChevronLeft';
//import gtm from '../../lib/gtm';
import { useTranslation } from 'react-i18next';
const AddChild = () => {
  const navigate = useNavigate();
  const mounted = useMounted();
  const { settings } = useSettings();
  const {state} = useLocation();
  const [customer, setCustomer] = useState(null);
  const comingFromFam = Boolean(state?.fromFamily);
  const famNumber = state?.fromFamily; 
  const { t } = useTranslation(['common']);
  const {signedinOrgType, signedinUserRole} = useContext(CommonDataContext);

  const getCustomer = useCallback(async () => {
    try {
      const data = await customerApi.getCustomer();

      if (mounted.current) {
        setCustomer(data);
      }
    } catch (err) {
      console.error(err);
    }
  }, [mounted]);

  useEffect(() => {
    getCustomer();
    return () => {
    }
  }, [getCustomer]);

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
                {t('common:child.Add Child')}
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
            <AddChildForm 
            fromFam = {comingFromFam}
            famNumber = {famNumber}
            //organization={customer} 
            />
          </Box>
        </Container>
      </Box>
    </>
  );
};

export default AddChild;
