// import { useRef,useState } from 'react';
import PropTypes from 'prop-types';
import { Link as RouterLink } from 'react-router-dom';
import { 
    AppBar,
    Box,
    // Button,
    // Chip,
    Divider,
    IconButton,
    // Link,
    Toolbar,
    // Typography,
    // Modal,
    // useTheme
 } from '@material-ui/core';
// import { makeStyles, Theme, createStyles } from '@material-ui/core/styles';
import MenuIcon from '../../../../assets/icons/Menu';
// import ExitToAppIcon from '@material-ui/icons/ExitToApp';
import Logo from '../../../../assets/Logo';
import LanguagePopover from '../../../../views/Dashboard/Components/LanguagePopover';
const MainNavbar = (props) => {
  // const modalRef = useRef(false);
  // const theme = useTheme();
  // const [open, setOpen] = useState(false);
  const { onSidebarMobileOpen } = props;

  // const handleSignOut =()=>{
  //   modalRef.current = !modalRef.current;
  //   setOpen(!open)
  // }

  // const confirmSignOut = ()=>{
  //     console.log("signout confirmed")
  //   //localStorage.removeItem('accessToken')
  //   //localStorage.removeItem('refreshToken')
  //   //navigate('/signin', { replace: true });
  // }


  return (
    <AppBar
      elevation={0}
      sx={{
        //backgroundColor: 'background.paper',
        backgroundColor: 'primary',
        //color: 'primary'
      }}
    >
      <Toolbar sx={{ minHeight: 70 }}>
        <IconButton
          color="inherit"
          onClick={onSidebarMobileOpen}
          sx={{
            display: {
              md: 'none'
            }
          }}
        >
          <MenuIcon fontSize="small" />
        </IconButton>
        {/* <RouterLink to="/dashboard">
          <Logo
            sx={{
              display: {
                md: 'inline',
                xs: 'none'
              },
            }}
            width={40}
            height={40}
          />
        </RouterLink> */}
        <Box sx={{ flexGrow: 1 }} />
        <Box
          sx={{
            alignItems: 'center',
            display: {
              md: 'flex',
              xs: 'none'
            }
          }}
        >
          {/* <LanguagePopover /> */}
          {/* <Link
            color="textSecondary"
            component={RouterLink}
            to="/browse"
            underline="none"
            variant="body1"
          >
            Browse Components
          </Link> */}
          
          
          {/* <Chip
            color="primary"
            label="NEW"
            size="small"
            sx={{
              maxHeight: 20,
              ml: 1,
              mr: 2
            }}
          /> */}



          {/* <Link
            color="textSecondary"
            component={RouterLink}
            to="/docs"
            underline="none"
            variant="body1"
          >
            Documentation
          </Link> */}
          {/* <Divider
            orientation="vertical"
            sx={{
              height: 32,
              mx: 2
            }}
          /> */}
          {/* <Button
            color="primary"
            component="a"
            //href="https://material-ui.com/store/items/devias-kit-pro"
            size="small"
            target="_blank"
            variant="contained"
            onClick={handleSignOut}
          >
            Signout
          </Button> */}
        </Box>
      </Toolbar>
      <Divider />
    </AppBar>
  );
};

MainNavbar.propTypes = {
  onSidebarMobileOpen: PropTypes.func
};

export default MainNavbar;
