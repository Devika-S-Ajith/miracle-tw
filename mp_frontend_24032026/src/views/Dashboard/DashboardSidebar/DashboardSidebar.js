import { useEffect, useState, useContext,useCallback } from 'react';
import { Link as RouterLink, useLocation, useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import { Avatar, Box, 
  // Button, 
  Divider, Drawer, Link, Typography } from '@material-ui/core';
import useMediaQuery from '@material-ui/core/useMediaQuery';
// import ReceiptIcon from '@material-ui/icons/Receipt';
// import useAuth from '../../../common/hooks/UseAuth';
import BriefcaseIcon from '../../../assets/icons/Briefcase';
import CalendarIcon from '../../../assets/icons/Calendar';
import ChartPieIcon from '../../../assets/icons/ChartPie';
import ChartSquareBarIcon from '../../../assets/icons/ChartSquareBar';
import StorageRoundedIcon from '@mui/icons-material/StorageRounded';
// import ChatAltIcon from '../../../assets/icons/ChatAlt';
// import ClipboardListIcon from '../../../assets/icons/ClipboardList';
// import FolderOpenIcon from '../../../assets/icons/FolderOpen';
// import MailIcon from '../../../assets/icons/Mail';
// import ShareIcon from '../../../assets/icons/Share';
// import ShoppingBagIcon from '../../../assets/icons/ShoppingBag';
// import ShoppingCartIcon from '../../../assets/icons/ShoppingCart';
// import UserIcon from '../../../assets/icons/User';
import UsersIcon from '../../../assets/icons/Users';
import Logo from '../../../assets/LogoSideBar';
import NavSection from '../Components/NavSection';
// import Scrollbar from '../Components/ScrollBar';
import _ from 'lodash';
import ChildCareIcon from '@material-ui/icons/ChildCare';
import SupervisedUserCircleIcon from '@material-ui/icons/SupervisedUserCircle';
import FormatListNumberedIcon from '@material-ui/icons/FormatListNumbered';
import FormatAlignJustifyIcon from '@material-ui/icons/FormatAlignJustify';
import { useTranslation } from 'react-i18next';
import { CommonDataContext } from '../../../common/contexts/CommonDataContext';
import APIS from '../../../common/hooks/UseApiCalls';
import toast from 'react-hot-toast';
import { AppConfig } from '../../../common/config';

const sections = [
  {
    title: 'General',
    items: [
      {
        title: 'Overview',
        path: '/dashboard',
        icon: <ChartSquareBarIcon fontSize="small" />
      },
      {
        title: 'Reports',
        path: '/dashboard/reports',
        icon: <ChartPieIcon fontSize="small" />
      },
      {
        title: 'Calendar',
        path: '/dashboard/calendar',
        icon: <CalendarIcon fontSize="small" />
      }
    ]
  },
  {
    title: 'Management',
    items: [
      {
        title: 'Users',
        path: '/dashboard/users',
        icon: <UsersIcon fontSize="small" />,
      },
      {
        title: 'Organizations',
        path: '/dashboard/organizations',
        icon: <BriefcaseIcon fontSize="small" />,
      },
      {
      title: 'Database',
      icon:<StorageRoundedIcon fontSize="small"></StorageRoundedIcon>,
      items: [
        {
          title: 'Child',
          path: '/dashboard/child',
          icon: <ChildCareIcon fontSize="small" />,
        },
        {
          title: 'Families',
          path: '/dashboard/family',
          icon: <SupervisedUserCircleIcon fontSize="large" />,
        }
       ]
      },
      {
        title: 'Forms',
        path: '/dashboard/forms',
        icon: <FormatAlignJustifyIcon fontSize="large" />
      },
      {
        title: 'Questions',
        path: '/dashboard/questions',
        icon: <FormatListNumberedIcon fontSize="large" />,
      },
      // {
      //   title: 'Cases',
      //   path: '/dashboard/cases',
      //   icon: <ChartPieIcon fontSize="large" />,
      // },
      {
        title: 'Assessments',
        path: '/dashboard/assessments',
        icon: <ChartSquareBarIcon fontSize="large" />
      },
      
    ]
  },
  
];

const DashboardSidebar = (props) => {
  const { t } = useTranslation(['common']);
  const navigate = useNavigate();
  const { onMobileClose, openMobile } = props;
  const location = useLocation();
  const {signedinOrgType, signedinUserRole, organizationList, userIdData, signedInOrgName, firstName, lastName,userImage, setShowNewNotifications} = useContext(CommonDataContext);
  const [sidebarOptions , setSidebarOptions] = useState(sections)
  const [websocketData,setWebsocketData] = useState(null);
  const signedinUserId = localStorage.getItem('username');
  
  
  //const { user } = useAuth();
  const user = {
        id: '5e887ac47eed253091be10cb',
        avatar: '/static/mock-images/avatars/avatar-carson_darrin.png',
        isActive: false,
        lastActivity: "Today at 16:00pm",
        name: 'User',
        username: 'carson.darrin'
  }
  useEffect(()=>{
    if (websocketData!==null){ 
      console.log("websocket data",websocketData.statusCode)
      if (websocketData.statusCode===201 && websocketData.statusMessage==="IMPORT_SUCESS")
      {
         toast.success(t('common:common.Import completed successfully'))
      }
      if (websocketData.statusCode===201 && websocketData.statusMessage==="EXPORT_SUCESS")
      {
         toast.success(t('common:common.Export completed successfully'))
         const url = websocketData.data.url
        //  window.open(link, "_blank");
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'file.pdf');
        document.body.appendChild(link);
        link.click();
      }
      if (websocketData.statusCode===400 && websocketData.statusMessage==="BAD_REQUEST")
      {
        toast.error(t('common:common.Bad request'))
      }
      if (websocketData.statusCode===102 && websocketData.statusMessage==="IMPORT_PARTIALLY_COMPLETED")
      {
        toast.error(t('common:common.Import partially completed'))
      }
      if (websocketData.statusCode===101 && websocketData.statusMessage==="INCORRECT_CSV")
      {
        toast.error(t('common:common.Data Error in CSV file'))
      }
      if (websocketData.statusCode===104 && websocketData.statusMessage==="IMPORT_FAILED")
      {
        toast.error(t('common:common.Import Failed'))
      }
    }
    },[websocketData])

  const lgUp = useMediaQuery((theme) => theme.breakpoints.up('lg'));
 useEffect(() => {
   websocketConnection();
 }, [signedinUserRole])
 const websocketConnection = ()=>{
  if (userIdData !== null ){
    //staging 
   //const ws = new WebSocket(`wss://5795h1do54.execute-api.us-east-1.amazonaws.com/miracle-staging-demo?userId=${userIdData}`);
   //dev
   let websocketConfig = AppConfig.webSocketURL
   const idToken = localStorage.getItem("idToken")
   const ws = new WebSocket(`${websocketConfig}=${userIdData}&Authorization=${idToken}`);
 ws.onopen = function(event) {
   console.log("Websocket Connection established",event);
 };
 ws.onmessage = function(event) {  
   console.log("Web socket response for import",event.data);
   const data = JSON.parse(event.data)
   setWebsocketData(data);
   //setShowNewNotifications(true)
 };
 ws.onclose = function(event) {  
  console.log('Websocket disconnected. Reconnect will be attempted in 1 second.')
  setTimeout(function () {
    websocketConnection();
  }, 1000);
 }

 ws.onerror = function(event) {  
  console.log("Web socket error",event);
 }
}
}

  useEffect(() => {
    if (openMobile && onMobileClose) {
      onMobileClose();
    }
  }, [location.pathname]);

// const getUsers = useCallback(async () => {  
//     try {
//       const data = await APIS.UserDetails(signedinUserId);
      
//       localStorage.setItem('dpUpdateInterval',1800000)    
//     } catch (err) {
//       console.error(err);
//     }
//   }, []);

  useEffect(()=>{
    let tempValue = _.cloneDeep(sections);
    console.log('temp',tempValue)
    console.log('type',signedinOrgType)
    console.log('roles',signedinUserRole)
    const orgId = localStorage.getItem('orgId');
    const isDCPUOrg = organizationList?.find(item => item.id === orgId)?.isDCPUOrg;
    console.log('bruh',localStorage.getItem('username'))
    //getUsers()
    if(signedinOrgType !== null && signedinUserRole !== null){
      if(signedinUserRole == 'Super admin' || signedinUserRole == 'admin'){
        if(signedinUserRole == 'admin'){
          let arrayToBeMoified = tempValue[1].items;
          arrayToBeMoified.splice(4,1)
          tempValue[1].items = arrayToBeMoified;
          setSidebarOptions(tempValue)

        }else{
          setSidebarOptions(tempValue)
        }
        // send as is
       
      }else if((signedinOrgType == 1 && signedinUserRole === 'admin') || ([3,4,5].includes(parseInt(signedinOrgType)) && signedinUserRole !== 'viewonly' && signedinUserRole !== 'admin' )){
        
        let arrayToBeMoified = tempValue[1].items;
        arrayToBeMoified.splice(3,2)
        tempValue[1].items = arrayToBeMoified;
        setSidebarOptions(tempValue)

      } else if( signedinOrgType == 2 && signedinUserRole !== 'viewonly' && signedinUserRole !== 'admin'){
        // send with forms,questions,family
        let arrayToBeMoified = tempValue[1].items;
        if(isDCPUOrg){
          arrayToBeMoified.splice(3,2) 
          arrayToBeMoified[2].items.splice(1,1)        
          tempValue[1].items = arrayToBeMoified;
        } else {
          let genArrayToBeMoified = tempValue[0].items;
          genArrayToBeMoified.splice(2,1)
          tempValue[0].items = genArrayToBeMoified;
          arrayToBeMoified.splice(1,7)
          tempValue[1].items = arrayToBeMoified;
        }
        setSidebarOptions(tempValue)
        // console.log('new temp',tempValue)
      } else if (signedinUserRole === 'viewonly'){
        let arrayToBeMoified = tempValue[0].items;
        arrayToBeMoified.splice(2,1)
        tempValue[0].items = arrayToBeMoified;
        setSidebarOptions([tempValue[0]])
        
      } 
    }
    if (localStorage.getItem('username') === null){
      navigate('/')
    }

  },[signedinOrgType,signedinUserRole, organizationList])

  const content = (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%'
      }}
    >
      {/* <Scrollbar options={{ suppressScrollX: false }}> */}
        <Box
          sx={{
            display: {
              lg: 'none',
              xs: 'flex'
            },
            justifyContent: 'center',
            p: 2
          }}
        >
          <RouterLink to="/dashboard">
            <Logo
              sx={{
                height: 40,
                width: 40
              }}
            />
          </RouterLink>
        </Box>
        <Box sx={{ p: 2 }}>
          <Box
            sx={{
              alignItems: 'center',
              backgroundColor: 'background.default',
              borderRadius: 1,
              display: 'flex',
              overflow: 'hidden',
              p: 2
            }}
          >
            <RouterLink to="/dashboard/profile">
              <Avatar
                src={userImage}
                sx={{
                  cursor: 'pointer',
                  height: 48,
                  width: 48
                }}
              />
            </RouterLink>
            <Box sx={{ ml: 2 }}>
              <Typography
                color="textPrimary"
                variant="subtitle2"
              >
                {firstName + ' ' +lastName } 
              </Typography>
              <Typography
                color="textSecondary"
                variant="body2"
                style={{ textTransform: 'capitalize' }}
              >
                {signedinUserRole} | {signedInOrgName}
                <Link
                  color="primary"
                  component={RouterLink}
                  to="/pricing"
                >
                  {user.plan}
                </Link>
              </Typography>
            </Box>
          </Box>
        </Box>
        <Divider />
        <Box sx={{ p: 2 }}>
          {signedinOrgType  && signedinUserRole  && sidebarOptions.map((section) => (
            <NavSection
              key={section.title}
              pathname={location.pathname}
              sx={{
                '& + &': {
                  mt: 3
                }
              }}
              {...section}
            />
          ))}
        </Box>
        <Divider />
        {/* <Box sx={{ p: 2 }}>
          <Typography
            color="textPrimary"
            variant="subtitle2"
          >
            Need Help?
          </Typography>
          <Typography
            color="textSecondary"
            variant="body2"
          >
            Check our docs
          </Typography>
          <Button
            color="primary"
            component={RouterLink}
            fullWidth
            sx={{ mt: 2 }}
            to="/docs"
            variant="contained"
          >
            Documentation
          </Button>
        </Box> */}


      {/* </Scrollbar> */}
    </Box>
  );

  if (lgUp) {
    return (
      <Drawer
        anchor="left"
        open
        PaperProps={{
          sx: {
            backgroundColor: 'background.paper',
            height: 'calc(100% - 64px) !important',
            top: '64px !Important',
            width: 280
          }
        }}
        variant="permanent"
      >
        {content}
      </Drawer>
    );
  }

  return (
    <Drawer
      anchor="left"
      onClose={onMobileClose}
      open={openMobile}
      PaperProps={{
        sx: {
          backgroundColor: 'background.paper',
          width: 280
        }
      }}
      variant="temporary"
    >
      {content}
    </Drawer>
  );
};

DashboardSidebar.propTypes = {
  onMobileClose: PropTypes.func,
  openMobile: PropTypes.bool
};

export default DashboardSidebar;
