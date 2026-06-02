import { Link as RouterLink } from 'react-router-dom';
import PropTypes from 'prop-types';
import { AppBar, Box, IconButton, Toolbar } from '@material-ui/core';
import { experimentalStyled } from '@material-ui/core/styles';
import MenuIcon from '../../../assets/icons/Menu';
import AccountPopover from '../Components/AccountPopover';
import NotificationsPopover from '../Components/NotificationsPopover';
//import ContactsPopover from './ContactsPopover';
//import ContentSearch from './ContentSearch';
import LanguagePopover from '../Components/LanguagePopover';
import Logo from '../../../assets/Logo';
import { CommonDataContext } from '../../../common/contexts/CommonDataContext';

const DashboardNavbarRoot = experimentalStyled(AppBar)(({ theme }) => ({
  ...(theme.palette.mode === 'light' && {
    backgroundColor: theme.palette.primary.main,
    boxShadow: 'none',
    color: theme.palette.primary.contrastText
  }),
  ...(theme.palette.mode === 'dark' && {
    backgroundColor: theme.palette.background.paper,
    borderBottom: `1px solid ${theme.palette.divider}`,
    boxShadow: 'none'
  }),
  zIndex: theme.zIndex.drawer + 100
}));

const DashboardNavbar = (props) => {
  const { onSidebarMobileOpen, ...other } = props;

  return (
    <DashboardNavbarRoot {...other}>
      <Toolbar sx={{ minHeight: 64 }}>
        <IconButton
          color="inherit"
          onClick={onSidebarMobileOpen}
          sx={{
            display: {
              lg: 'none'
            }
          }}
        >
          <MenuIcon fontSize="small" />
        </IconButton>
        <RouterLink to="/dashboard">
          <Logo
            sx={{
              display: {
                lg: 'inline',
                xs: 'none'
              },
              height: 50,
              width: 50
            }}
          />
        </RouterLink>
        <Box
          sx={{
            flexGrow: 1,
            ml: 2
          }}
        />
        <LanguagePopover />
        {/* <Box sx={{ ml: 1 }}>
          <ContentSearch />
        </Box> 
        <Box sx={{ ml: 1 }}>
          <ContactsPopover />
        </Box>*/}
        <Box sx={{ ml: 1 }}>
          <NotificationsPopover />
        </Box>
        <Box sx={{ ml: 2 }}>
          <AccountPopover />
        </Box> 
      </Toolbar>
    </DashboardNavbarRoot>
  );
};

DashboardNavbar.propTypes = {
  onSidebarMobileOpen: PropTypes.func
};

export default DashboardNavbar;
