import { useState, useCallback, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Grid, Typography } from '@mui/material';
import AccountForm from '../Components/AccountForm';
import useMounted from '../../../common/hooks/UseMounted';
import ChevronRightIcon from '../../../assets/icons/ChevronRight';
import APIS from '../../../common/hooks/UseApiCalls';
import { useTranslation } from 'react-i18next';
import useAuthorization from '../../../components/UserComponents/useAuthorization';
import { CommonDataContext } from '../../../common/contexts/CommonDataContext';
import {ADMIN, ADMIN_CASEWORKER, SUPER_ADMIN} from '../../../helpers/constant'
import PageLoader from '../../../components/UserComponents/PageLoader';

const EditOrganization = () => {
  const { t } = useTranslation(['common']);
  const navigate = useNavigate();
  const mounted = useMounted();
  const [organization, setorganization] = useState(null);
  const [loading, setLoading] = useState(false);
  let { id } = useParams();
  const { authStatus, checkAuth } = useAuthorization("EditAccount");
  
  useEffect(() => {
      document.title = "Accounts | Thrivewell";;
      checkAuth();
    }, []);
  
   
  const getOrganization = useCallback(async () => {
    setLoading(true);
    try {
      const data = await APIS.OrganisationDetails(id);
      if (mounted.current) {
        setorganization(data.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);  
    }
  }, []);

  useEffect(() => {
    if(authStatus === 'authorized') {
      getOrganization();
    }   
  }, [getOrganization, authStatus]);

  if (authStatus === 'loading' || authStatus === 'idle') {
    return <PageLoader />;
  }

  if (authStatus === 'unauthorized') {
    return null; // Or a custom message
  }

  return (
    <>
      <Box
        sx={{
          backgroundColor: 'background.default',
          minHeight: '100%',
          mt: 2
        }}
      >
        <Grid
          container
          justifyContent="space-between"
          spacing={3}
        >
          <Grid item sx={{ display: "flex", flexDirection: "row" }}>
            <Typography
              color="textPrimary"
              variant="h5"
            >
              Admin
            </Typography>
            <Box
              sx={{
                m: 0.75,
              }}
              style={{ cursor: 'text' }}
            >
              <ChevronRightIcon color='disabled' fontSize="small" />
            </Box>
            <Typography
              color="textPrimary"
              variant="h5"
              style={{ cursor: 'pointer' }}
              onClick={() => navigate(-1)}
            >
              {t('common:common.Organizations')}
            </Typography>
            <Box
              sx={{ m: 0.75 }}
              style={{ cursor: 'text' }}
            >
              <ChevronRightIcon color='disabled' fontSize="small" />
            </Box>
            <Typography
              color="textPrimary"
              variant="h5"
            >
              {t('common:organization.Edit Organization')}
            </Typography>

          </Grid>
        </Grid>
        {/* New UI */}
        <Box mt={3}>
          <AccountForm organization={organization} loading={loading} />
        </Box>
      </Box>
    </>
  );
};

export default EditOrganization;
