import  { useContext, useState, useEffect } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Box, Button, Container, Typography } from '@mui/material';
import { useMediaQuery, useTheme } from '@mui/material';
import { CommonDataContext } from '../../common/contexts/CommonDataContext';
import { UNASSIGNED } from '../../helpers/constant';

const AuthError = () => {
  const theme = useTheme();
  const { signedinUserRoleHT, signedinUserRoleFS } = useContext(CommonDataContext);
  const mobileDevice = useMediaQuery(theme.breakpoints.down('sm'));
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
          Oops! Unauthorized Access
        </Typography>
        <Typography
          align="center"
          color="textSecondary"
          sx={{ mt: 0.5 }}
          variant="subtitle2"
        >
          Please make sure you're logged in with the correct account, or contact
          your administrator for assistance.
        </Typography>
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
  );
};

export default AuthError;