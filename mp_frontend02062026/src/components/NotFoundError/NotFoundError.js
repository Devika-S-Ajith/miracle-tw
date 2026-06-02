import { Link as RouterLink } from 'react-router-dom';
import { Box, Button, Container, Typography } from '@mui/material';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import { useContext, useEffect, useState } from 'react';
import { CommonDataContext } from '../../common/contexts/CommonDataContext';
import { UNASSIGNED } from '../../helpers/constant';


const NotFoundError = () => {
    const theme = useTheme();
    const mobileDevice = useMediaQuery(theme.breakpoints.down('sm'));
    const { signedinUserRoleHT, signedinUserRoleFS } = useContext(CommonDataContext);
    const [redirectDashboardLink, setRedirectDashboardLink] = useState('/');
    const [authenticated, setAuthenticated] = useState(false);
  
    useEffect(() => {
      const determineRedirectAndAuth = () => {
        // Early return if roles are not loaded
        if (signedinUserRoleHT === null || signedinUserRoleFS === null) {
          return { link: '/', auth: false };
        }
  
        const orgType = localStorage.getItem("signedinOrgType");
        const isHTUnassigned = signedinUserRoleHT === UNASSIGNED;
        const isFSUnassigned = signedinUserRoleFS === UNASSIGNED;
  
        // Government organization
        if (orgType === "6") {
          return { link: '/governmentDashboardOverview', auth: true };
        }
  
        // Both roles unassigned
        if (isHTUnassigned && isFSUnassigned) {
          return { link: '/', auth: false };
        }
  
        // HT role assigned
        if (!isHTUnassigned) {
          return { link: '/dashboard', auth: true };
        }
  
        // FS role assigned (HT unassigned)
        return { link: '/dashboard/team', auth: true };
      };
  
      const { link, auth } = determineRedirectAndAuth();
      setRedirectDashboardLink(link);
      setAuthenticated(auth);
    }, [signedinUserRoleHT, signedinUserRoleFS]);

  return (
    <>
      <Box
        sx={{
          alignItems: 'center',
          backgroundColor: 'background.paper',
          display: 'flex',
          minHeight: '100vh',
          px: 3,
          py: '80px'
        }}
      >
        <Container maxWidth="lg">
          <Typography
            align="center"
            color="textPrimary"
            variant={mobileDevice ? 'h4' : 'h1'}
          >
             Oops! The page you are looking for isn’t here
          </Typography>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              mt: 6
            }}
          >
          </Box>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              mt: 6
            }}
          >
            <Button
              color="primary"
              component={RouterLink}
              to={redirectDashboardLink}
              variant="outlined"
            >
             {authenticated ? 'Back to Dashboard' : 'Back to Login'}
            </Button>
          </Box>
        </Container>
      </Box>
    </>
  );
};

export default NotFoundError;
