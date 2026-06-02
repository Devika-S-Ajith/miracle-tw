import { useRef,useState, useContext} from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import {
  Avatar,
  Box,
  Button,
  ButtonBase,
  Divider,
  ListItemIcon,
  ListItemText,
  MenuItem,
  Popover,
  Typography
} from '@material-ui/core';
// import KeyIcon from '@mui/icons-material/Key';
import useAuth from '../../../../common/hooks/UseAuth';
// import CogIcon from '../../../../assets/icons/Cog';
import UserIcon from '../../../../assets/icons/User';
import { CommonDataContext } from '../../../../common/contexts/CommonDataContext';


const AccountPopover = () => {
  const anchorRef = useRef(null);
  const { logout } = useAuth();
  const { i18n } = useTranslation('common');
  const { t } = useTranslation(['common']);
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
 
  const { setSignedinUserRole, setSignedinOrgType, signedinUserRole, signedInOrgName, firstName, lastName,userImage } = useContext(CommonDataContext);
  // const user = {
  //   id: '5e887ac47eed253091be10cb',
  //   avatar: '/static/mock-images/avatars/avatar-carson_darrin.png',
  //   isActive: false,
  //   lastActivity: "Today at 16:00pm",
  //   name: 'User',
  //   username: 'carson.darrin'
  // }
  
  //const signedinUserId = localStorage.getItem('username');

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };
  const handleMenuItemClick = () => {
    setOpen(false);
  };
  
//  let timerID = setTimeout(() => {
//    console.log("called")
//    if( localStorage.getItem('dpUpdateInterval')>0){
//     getUsers()
//    }   
// }, localStorage.getItem('dpUpdateInterval'));

  // const getUsers = useCallback(async () => {  
  //   try {
  //     const data = await APIS.UserDetails(signedinUserId);
  //     setIsProfileDetailsChanged(false)
      
  //     //localStorage.setItem('dpUpdateInterval',-1)
  //     //setIsProfileDetailsChanged(false)
  //     //clearTimeout(timerID); 
  //   } catch (err) {
  //     console.error(err);
  //   }
  // }, []);


  // useEffect(() => {
  //   getUsers()
  // }, []);
  



  const handleLogout = async () => {
    try {
      
      const currentLanguageList = localStorage.getItem('languageList');
      const currentLanguage = localStorage.getItem('language');
      handleClose();
      setSignedinUserRole(null);
      setSignedinOrgType(null);
      i18n.changeLanguage(currentLanguage);
      localStorage.clear();
      localStorage.setItem('language', currentLanguage);
      localStorage.setItem('languageList',currentLanguageList);
      await logout();
      // if (currentLanguage) {
      //   localStorage.setItem('language', currentLanguage)
      // } else {
      //   localStorage.setItem('language', 'en')
      // }
      
      navigate('/');
    } catch (err) {
      console.error(err);
      toast.error('Unable to logout.');
    }
  };

  return (
    <>
      <Box
        component={ButtonBase}
        onClick={handleOpen}
        ref={anchorRef}
        sx={{
          alignItems: 'center',
          display: 'flex'
        }}
      >
        <Avatar
          src={userImage}
          sx={{
            height: 32,
            width: 32
          }}
        />
      </Box>
      <Popover
        anchorEl={anchorRef.current}
        anchorOrigin={{
          horizontal: 'center',
          vertical: 'bottom'
        }}
        keepMounted
        onClose={handleClose}
        open={open}
        PaperProps={{
          sx: { width: 240 }
        }}
      >
        <Box sx={{ p: 2 }}>
          <Typography
            color="textPrimary"
            variant="subtitle2"
          >
            {firstName + ' ' + lastName}
          </Typography>
          <Typography
            color="textSecondary"
            variant="subtitle2"
            style={{ textTransform: 'capitalize' }}
          >
            {signedinUserRole} | {signedInOrgName}
          </Typography>
        </Box>
        <Divider />
        <Box sx={{ mt: 2 }}>
          <MenuItem
            component={RouterLink}
            to="/dashboard/profile"
            onClick={handleMenuItemClick}
          >
            <ListItemIcon>
              <UserIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText
              primary={(
                <Typography
                  color="textPrimary"
                  variant="subtitle2"
                >
                  {t('common:common.Profile')}
                </Typography>
              )}
            />
          </MenuItem>
          {/* <MenuItem
            component={RouterLink}
            to="/dashboard/changePassword"
            onClick={handleMenuItemClick}
          >
            <ListItemIcon>
              <KeyIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText
              primary={(
                <Typography
                  color="textPrimary"
                  variant="subtitle2"
                >
                   {t('common:signin.Change Password')}
                </Typography>
              )}
            />
          </MenuItem> */}
          {/* <MenuItem
            component={RouterLink}
            to="/dashboard/account"
          >
            <ListItemIcon>
              <CogIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText
              primary={(
                <Typography
                  color="textPrimary"
                  variant="subtitle2"
                >
                  {t("common:common.Settings")}
                </Typography>
              )}
            />
          </MenuItem> */}
        </Box>
        <Box sx={{ p: 2 }}>
          <Button
            color="primary"
            fullWidth
            onClick={handleLogout}
            variant="outlined"
          >
            {t('common:common.Logout')}
          </Button>
        </Box>
      </Popover>
    </>
  );
};

export default AccountPopover;
