import { useState, useEffect, useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
//import { Helmet } from 'react-helmet-async';
import { Box, Container, Grid, Typography, IconButton } from '@mui/material';
// import { customerApi } from '../../../__fakeApi__/customerApi';
import AddUserForm from '../Components/AddUserForm';
import useMounted from '../../../common/hooks/UseMounted';
import useSettings from '../../../common/hooks/UseSettings';
import ChevronLeftIcon from '../../../assets/icons/ChevronLeft';
import { CommonDataContext } from '../../../common/contexts/CommonDataContext';
//import gtm from '../../lib/gtm';
import { useTranslation } from 'react-i18next';

const AddUser = (props) => {
  const { getUserTokens, getOrganizationList } = useContext(CommonDataContext);
  const navigate = useNavigate();
  const { t } = useTranslation(['common']);
  // const mounted = useMounted();
  const { settings } = useSettings();
  const [customer, setCustomer] = useState(null);
  const { state } = useLocation();
  const comingFromOrg = Boolean(state?.fromOrg);
  const orgNumber = state?.fromOrg;


  useEffect(() => {
    //gtm.push({ event: 'page_view' });
    //getUserTokens();
    // console.log("props.location.state >>",props.location && props.location.state)
    getOrganizationList();
    return () => { }
  }, []);

  //   const getUsers = useCallback(async () => {
  //     try {
  //       const data = await customerApi.getUsers();
  //         console.log("data in edt user >>",data)
  //       if (mounted.current) {
  //         data.forEach((user)=>{
  //           console.log("id >>",user.id)
  //           if(user.id === id){
  //             setUser(user)
  //             console.log("user set in edit user>>",user)
  //           }
  //         })
  //         setLoading(false)
  //       }
  //     } catch (err) {
  //       console.error(err);
  //     }
  //   }, [mounted]);

  //   useEffect(() => {
  //     getUsers();
  //   }, []);


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
                {t('common:user.Add User')}
              </Typography>
            </Grid>
          </Grid>
          <Box mt={3}>
            <AddUserForm
              fromOrg={comingFromOrg}
              orgNumber={orgNumber} />
          </Box>
        </Container>
      </Box>
    </>
  );
};

export default AddUser;
