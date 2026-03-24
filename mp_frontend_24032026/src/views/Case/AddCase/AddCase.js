import { useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
//import { Helmet } from 'react-helmet-async';
import { Box, Container, Grid, Typography, IconButton } from '@mui/material';
// import { customerApi } from '../../../__fakeApi__/customerApi';
import AddCaseForm from '../Components/AddCaseForm';
// import useMounted from '../../../common/hooks/UseMounted';
import useSettings from '../../../common/hooks/UseSettings';
import { CommonDataContext } from '../../../common/contexts/CommonDataContext';
import ChevronLeftIcon from '../../../assets/icons/ChevronLeft';
//import gtm from '../../lib/gtm';
import { useTranslation } from 'react-i18next';

const AddCase = () => {
  const navigate = useNavigate();
  const { t } = useTranslation(['common']);
  const { signedinOrgType, signedinUserRole } = useContext(CommonDataContext);
  // const mounted = useMounted();
  const { settings } = useSettings();

  // useEffect(() => {
  //   //gtm.push({ event: 'page_view' });
  // }, []);

  useEffect(() => {
    if (signedinOrgType !== null && signedinUserRole !== null) {
      if ((signedinOrgType == 3 || signedinOrgType == 4 || signedinOrgType == 5) && (signedinUserRole === 'admin' || signedinUserRole === 'caseworker')) {
        // has access
      } else {
        navigate('/Unauthorized');
      }
    }
    return () => {

    }
  }, [signedinOrgType, signedinUserRole])

  return (
    <>
      {/* <Helmet>
        <title>Dashboard: Customer Edit | Material Kit Pro</title>
      </Helmet> */}
      <Box
        sx={{
          backgroundColor: 'background.default',
          minHeight: '100%',
          mt: 2
          //py: 8
        }}
      >
        <Container maxWidth={settings.compact ? 'xl' : false}>
          <Grid
            container
            justifyContent="space-between"
            spacing={3}
          >
            <Grid item sx={{ display: "flex", flexDirection: "row" }}>
              <IconButton
                color="inherit"
                onClick={() => navigate(-1)}
                sx={{
                  // display: {
                  //   md: 'none'
                  // }
                  mt: - 0.5
                }}
              >
                <ChevronLeftIcon fontSize="small" />
              </IconButton>
              <Typography
                color="textPrimary"
                variant="h5"
              >
                {t('common:case.Add Case')}
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
            <AddCaseForm />
          </Box>
        </Container>
      </Box>
    </>
  );
};

export default AddCase;
