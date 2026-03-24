import { useRef, useState, useEffect, useContext } from "react";
import {
  Badge,
  Box,
  Divider,
  IconButton,
  Popover,
  Tooltip,
  Typography,
} from "@mui/material";
import BellIcon from "../../../../assets/icons/Bell";
import APIS from "../../../../common/hooks/UseApiCalls";
import { CommonDataContext } from "../../../../common/contexts/CommonDataContext";
import { useTranslation } from "react-i18next";
import CloseIcon from "@mui/icons-material/Close";
import { useNavigate } from "react-router";
import { fromUtc } from "../../../../constants";

const NotificationsPopover = () => {
  const anchorRef = useRef(null);
  const navigate = useNavigate();
  const { t } = useTranslation(["common"]);
  const {
    fsAvailableChildrenIds,
    tsAvailableChildrenIds,
    tsAvailableFamilyIds,
  } = useContext(CommonDataContext);
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [page, setPage] = useState(1);

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  useEffect(() => {
    getNotifications();
  }, [open]);

  const notificationClickHandler = async (notification) => {
    if (notification.unreadMessage) {
      readNotificationHandler(notification.id);
    }
    notification.eventId
      ? navigate(`/fostershare/events/${notification.eventId}`)
      : notification.childLogId
      ? childNavigationHandler(notification)
      : notification.HTCaseId
      ? assessmentNavigationHandler(notification)
      : getNotifications();
    handleClose();
  };

  const childNavigationHandler = (notification) => {
    if (fsAvailableChildrenIds.includes(notification?.childId)) {
      navigate(
        `/fostershare/children/${notification?.childId}/?behavioralLog=${notification?.childLogId}`
      );
    } else {
      getNotifications();
    }
  };

  const assessmentNavigationHandler = (notification) => {
    const { HTFamilyId, HTChildId } = notification;
    const navigateTo = (path, state) => navigate(path, { state });

    if (tsAvailableChildrenIds.includes(HTChildId)) {
      navigateTo(`/dashboard/children/${HTChildId}/view`, {
        tabvalue: "assessmentsProgressReports",
      });
    } else if (tsAvailableFamilyIds.includes(HTFamilyId)) {
      navigateTo(`/dashboard/families/${HTFamilyId}/view`, {
        tabvalue: "assessmentsProgressReports",
      });
    } else {
      getNotifications();
    }
  };

  const readNotificationHandler = async (id) => {
    try {
        await APIS.updateReadNotificationStatus({
        id: id,
        readStatus: true,
        markAll: false,
      });
      getNotifications();
    } catch (error) {}
  };

  const [unreadMessageCount, setUnreadMessageCount] = useState(0);
  const getNotifications = async () => {
    let params = {
      rowCount: 10,
      pageNumber: 1,
      notificationType: "ALL",
    };
    try {
      const res = await APIS.getNotificationList({
        ...params,
      });

      const { data } = res;

      if (Array.isArray(data?.data?.rows))
        setNotifications(
          data?.data?.rows?.slice(0, 5).map((each, index) => ({
            id: each?.id,
            title: each?.title,
            body: each?.body,
            date: formatNotificationTime(each?.createdAt),
            unreadMessage: !each?.readStatus,
            eventId: each?.eventId,
            childId: each?.childId,
            HTFamilyId: each?.HTFamilyId,
            HTChildId: each?.HTChildId,
            HTCaseId: each?.HTCaseId,
            childLogId: each?.childLogId,
            notificationType: each?.notificationType,
          })) || []
        );
      setUnreadMessageCount(data?.data?.unreadCount);
    } catch (error) {}
  };

  const formatNotificationTime = (createdAt) => {
    const notificationDate = new Date(fromUtc(createdAt));
    const today = new Date();

    const isToday =
      notificationDate.getDate() === today.getDate() &&
      notificationDate.getMonth() === today.getMonth() &&
      notificationDate.getFullYear() === today.getFullYear();

    if (isToday) {
      return notificationDate.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    } else {
      return notificationDate.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
    }
  };

  return (
    <>
      <Tooltip title={t("common:common.Notifications")}>
        <IconButton color="inherit" ref={anchorRef} onClick={handleOpen}>
          <Badge
            color="error"
            overlap="circular"
            badgeContent={unreadMessageCount}
            anchorOrigin={{
              vertical: "top",
              horizontal: "left",
            }}
          >
            <BellIcon
              sx={{
                color: "#778791",
                fontSize: 28,
              }}
            />
          </Badge>
        </IconButton>
      </Tooltip>
      <Popover
        anchorEl={anchorRef.current}
        anchorOrigin={{
          horizontal: "center",
          vertical: "bottom",
        }}
        onClose={handleClose}
        open={open}
      >
        <Box p={1} minWidth={400} maxWidth={400}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Typography color="textPrimary" variant="h6">
              {t("common:common.Notifications")}
            </Typography>
            <CloseIcon onClick={handleClose} sx={{ cursor: "pointer" }} />
          </Box>
          <Divider />
          <Box maxHeight="50vh" overflow="auto">
            {notifications.map((notification) => (
              <Tooltip title={notification.body} key={notification.id}>
                <Box
                  p={1}
                  my
                  sx={{
                    cursor: "pointer",
                    backgroundColor: notification.unreadMessage
                      ? "#FEF1E9"
                      : "inherit",
                    "&:hover": {
                      // Define hover styles here
                      backgroundColor: "#E0E0E0", // Example hover background color
                    },
                  }}
                  onClick={() => notificationClickHandler(notification)}
                >
                  <Box display="flex" justifyContent="space-between">
                    <Box
                      display="flex"
                      alignItems="center"
                      justifyContent="start"
                      gap={1}
                    >
                      {notification.unreadMessage && (
                        <Box
                          sx={{
                            borderRadius: "50%",
                            backgroundColor: "#F37123",
                            height: 8,
                            width: 8,
                          }}
                        ></Box>
                      )}
                      <Typography
                        id="type-label"
                        color="primary"
                        fontWeight={600}
                      >
                        {notification.notificationType == "FOSTER_SHARE"
                          ? "" + notification.title
                          : "ThriveScale - " + notification.title}
                      </Typography>
                    </Box>
                    <Typography id="time" color="#778791">
                      {notification.date}
                    </Typography>
                  </Box>
                  <Typography
                    id="notification"
                    mt
                    color="#000000"
                    sx={{
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      display: "-webkit-box",
                      "-webkit-line-clamp": "3",
                      "-webkit-box-orient": "vertical",
                    }}
                  >
                    {notification.body}
                  </Typography>
                </Box>
              </Tooltip>
            ))}
            <Divider />
          </Box>

          {notifications?.length ? (
            <Box m={2} display="flex" justifyContent="center">
              <Typography
                id="view-all-notifications"
                color="primary"
                fontWeight={700}
                sx={{ cursor: "pointer" }}
                onClick={() => {
                  setOpen(false);
                  navigate("/fostershare/notifications");
                }}
              >
                {t("common:common.View all notifications")}
              </Typography>
            </Box>
          ) : (
            <Typography
              id="view-all-notifications"
              p={2}
              textAlign="center"
              fontWeight={400}
            >
              {t("common:common.There are no notifications")}
            </Typography>
          )}
        </Box>
      </Popover>
    </>
  );
};

export default NotificationsPopover;
