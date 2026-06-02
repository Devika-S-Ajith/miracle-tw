import { useRef, useState, useEffect, useContext, useCallback } from 'react';
import _debounce from "lodash/debounce";
import {
  Badge,
  Box,
  // Button,
  IconButton,
  Popover,
  Tooltip,
  Typography,
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Switch,
  CircularProgress
} from '@material-ui/core';
import toast from 'react-hot-toast';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import BellIcon from '../../../../assets/icons/Bell';
// import ChatAltIcon from '../../../../assets/icons/ChatAlt';
// import CreditCardIcon from '../../../../assets/icons/CreditCard';
// import ShoppingCartIcon from '../../../../assets/icons/ShoppingCart';
import TrashIcon from '../../../../assets/icons/Trash';
import APIS from '../../../../common/hooks/UseApiCalls';
import { CommonDataContext } from '../../../../common/contexts/CommonDataContext';
import { useTranslation } from 'react-i18next';

// const iconsMap = {
//   item_shipped: ShoppingCartIcon,
//   new_message: ChatAltIcon,
//   order_placed: CreditCardIcon
// };

const NotificationsPopover = () => {
  const anchorRef = useRef(null);
  const listInnerRef = useRef(); // Check this
  const { t } = useTranslation(['common']);
  const {showNewNotifications, setShowNewNotifications} = useContext(CommonDataContext);
  const [open, setOpen] = useState(false);
  const [checked, setChecked] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const [expandedPanel, setExpandedPanel] = useState(false);

  const handleOpen = () => {
    setOpen(true);
    let getNotificationsListpayload = {
      "rowCount": "10",
      "pageNumber": "1",
      "readStatusFilter": ""
    }
    getNotificationsList(getNotificationsListpayload)
  };

  const handleClose = () => {
    setOpen(false);
    setChecked(false)
    setPage(1)
  };

  const changeNotificationFilter = () => {
    setHasMore(true)
    setLoading(true)
    listInnerRef?.current?.scrollTo(0, 0)
    setPage(1)
    if(!checked){
      let getNotificationsListpayload = {
        "rowCount": "10",
        "pageNumber": "1",
        "readStatusFilter" : "false"
      }
      getNotificationsList(getNotificationsListpayload)
    } else {
      let getNotificationsListpayload = {
        "rowCount": "10",
        "pageNumber": "1",
      }
      getNotificationsList(getNotificationsListpayload)
    }
    setChecked(!checked)
  }

  // Check this function
  const getNotificationsList = async (payload) => {
    try {
      const data = await APIS.ListNotifications(payload);
      if (data && data.data) {
        if (payload.pageNumber == 1){
          setNotifications(data.data.data)
        } else {
          setNotifications([...notifications, ...data.data.data])
        }
        if (data.data.data.length){
          setHasMore(true)
        } else {
          setHasMore(false)
        }
        if(data.data.allRead){
          setShowNewNotifications(false)
        } else {
          setShowNewNotifications(true)
        }
        setExpandedPanel(null)
        setLoading(false)
      }
    } catch (err) {
      setLoading(false)
      console.error(err);
    }
  }
  
  useEffect(() => {
    let getNotificationsListpayload = {
      "rowCount": "10",
      "pageNumber": "1",
      "readStatusFilter": ""
    }
    getNotificationsList(getNotificationsListpayload)
  },[])
  
  const updateNotification = async (payload, showMessage) => {
    try {
      APIS.UpdateNotification(payload).then((res)=>{
        console.log("res >>",res)
        if(res && res.data && res.status === 200){
          // let getNotificationsListpayload = {
          //   "rowCount": "10",
          //   "pageNumber": "1",
          //   "readStatusFilter" : checked ? "false" : ""
          // }
          if(showMessage){
            // getNotificationsList(getNotificationsListpayload)
            const updatedNotifications = notifications.filter(item => item.id != payload.id)
            setExpandedPanel(false);
            setNotifications(updatedNotifications)
            toast.success('Deleted Notification');
          } else {
            const updatedNotifications = notifications.map(item => {
              if(payload.id == item.id) {
                item.readStatus = true
              }
              return item
            })
            setNotifications(updatedNotifications)
          }
        }else{
          toast.error('Something went wrong!');
        }
        
      })
    } catch (err) {
      console.error(err);
    }
  }

  const handleDeleteNotification = (id => {
    let payload = {
      "id": id,
      "pageNumber": "1",
      "isDeleted" : "true"
    }
    updateNotification(payload, true)
  });

  const handleAccordionChange = (panel, id, readStatus) => (event, isExpanded) => {
    console.log({ event, isExpanded, readStatus, panel });
    setExpandedPanel(isExpanded ? panel : false);
    if(isExpanded && !readStatus) {
      let payload = {
        "id": id,
        "readStatus" : "true"
      }
      updateNotification(payload)
    }
  };

  const debouncedOnScroll = useCallback(
    _debounce(() => {
      if (listInnerRef.current && !loading) {
        const { scrollTop, scrollHeight, clientHeight } = listInnerRef.current;
        if (scrollTop + clientHeight === scrollHeight && hasMore) {
          setLoading(true)
          console.log("reached bottom");
          let getNotificationsListpayload = {
            "rowCount": "10",
            "pageNumber": page + 1,
            "readStatusFilter" : checked ? "false" : ""
          }
          setPage(page + 1)
          getNotificationsList(getNotificationsListpayload)
          listInnerRef.current.scrollTo(0, scrollTop)
        }
      }
    }, 500), [loading, page, notifications, hasMore]);

  return (
    <>
      <Tooltip title={t('common:common.Notifications')}>
        <IconButton
          color="inherit"
          ref={anchorRef}
          onClick={handleOpen}
        >
          <Badge
            color="error"
            // badgeContent={notifications.length}
            className={showNewNotifications ? "notification" : ''}
          >
            <BellIcon/>
          </Badge>
        </IconButton>
      </Tooltip>
      <Popover
        anchorEl={anchorRef.current}
        anchorOrigin={{
          horizontal: 'center',
          vertical: 'bottom'
        }}
        onClose={handleClose}
        open={open}
        PaperProps={{
          sx: { width: 450 }
        }}
      >
        <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography
            color="textPrimary"
            variant="h6"
          >
            {t('common:common.Notifications')}
          </Typography>
          <div style={{display: 'flex', alignItems: 'center'}}>
            <Typography
              color="textSecondary"
              // variant="h6"
              sx={{ fontSize: 12 }}
            >
              {t('common:common.Only show unread')}
            </Typography>
            <Switch size="small" color="orange" checked={checked} onChange={() => changeNotificationFilter()} />
          </div>
        </Box>
        {notifications.length === 0
          ? (
            <Box sx={{ p: 2 }}>
              <Typography
                color="textPrimary"
                variant="subtitle2"
              >
                {t('common:common.There are no notifications')}
              </Typography>
            </Box>
          )
          : (
            // Check this
            <div 
              onScroll={debouncedOnScroll} 
              ref={listInnerRef} 
              style={{ height: "450px", overflowY: "auto" }} 
              className="notificationListDiv">
                {notifications.map((notification, index) => {
                  // const Icon = iconsMap[notification.type];

                  return (
                    // Check this
                      <Accordion 
                        key={index}
                        expanded={expandedPanel === index} 
                        onChange={handleAccordionChange(index, notification.id, notification.readStatus)}
                        style={{ 
                          margin: '5px 0', 
                          borderLeft: !notification.readStatus ? '3px solid #f37123' : '', 
                          borderTopLeftRadius: 0,
                          borderTopRightRadius: 0
                        }}
                      > 
                      {/* till this */}
                        <AccordionSummary
                          expandIcon={<ExpandMoreIcon />}
                          aria-controls="panel1bh-content"
                          id="panel1bh-header"
                        >
                          {/* <Avatar
                            sx={{
                              backgroundColor: 'primary.main',
                              color: 'primary.contrastText'
                            }}
                          >
                            <Icon fontSize="small" />
                          </Avatar> */}
                          <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <Typography sx={{ color: 'text.primary' }}>{notification.title}</Typography>
                            <Typography sx={{ color: 'text.secondary', fontSize: 12 }}>{notification.createdAt}</Typography>
                          </div>
                        </AccordionSummary>
                        <AccordionDetails style={{ display: 'flex', alignItems: "center", justifyContent: 'space-between' }}>
                          <Typography sx={{ color: 'text.secondary' }}>{notification.body}</Typography>
                          <Tooltip title={t('common:common.Delete Notification')}> 
                            <IconButton
                              onClick={()=>handleDeleteNotification(notification.id)}
                              // disabled={true}
                            >
                              <TrashIcon fontSize="small"/>
                            </IconButton>
                          </Tooltip>
                        </AccordionDetails>
                      </Accordion>
                  );
                })}
                {loading && 
                  <div style={{display: 'flex', justifyContent: 'center'}}>
                    <CircularProgress color="primary"/>
                  </div>
                }
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'center',
                  p: 1
                }}
              >
                {/* // Check this */}
                {/* <Button
                  color="primary"
                  size="small"
                  variant="text"
                >
                  Mark all as read
                </Button> */}
                {/* till this */}
              </Box>
            </div>
          )}
      </Popover>
    </>
  );
};

export default NotificationsPopover;
