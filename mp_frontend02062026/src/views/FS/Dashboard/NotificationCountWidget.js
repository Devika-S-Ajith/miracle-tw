import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CircularProgress,
  Typography,
  CardContent,
  Button,
} from "@mui/material";
import { Box } from "@mui/system";
import APIS from "../../../common/hooks/UseApiCalls";
import Heading from "../../../components/Heading";
import SmallText from "../../../components/SmallText/SmallText";
import PrimaryButton from "../../../components/PrimaryButton";

const NotificationCountWidget = (props) => {
  const { title, data, isloading, label, icon, ...other } = props;
  const navigate = useNavigate();
  const [notificationCount, setNotificationCount] = useState();
  useEffect(() => {
    const getNotifications = async () => {
      let params = {
        rowCount: 1,
        pageNumber: 1,
        notificationType: "ALL",
      };
      try {
        const res = await APIS.getNotificationList({
          ...params,
        });

        const { data } = res;
        setNotificationCount(data?.data?.unreadCount);
      } catch (error) {}
    };
    getNotifications();
  }, []);

  return (
    <Card {...other}>
      <CardContent
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Box display="flex" flexDirection="column">
          {/* <Typography color="text.secondary" variant="body1" sx={{ mb: 1 }}>
            Your notifications
          </Typography> */}
          <SmallText value="Your notifications" fontWeight={600} mb={1} />
          {!isloading ? (
            <Heading heading={`${notificationCount || 0} New notifications`} />
          ) : (
            // <Typography
            //   color="textPrimary"
            //   sx={{ mt: 1 }}
            //   variant="h5"
            //   display="inline"
            // >
            //   {notificationCount || 0} New notifications
            // </Typography>
            <CircularProgress color="primary" sx={{ mt: 1 }} />
          )}
          {/* <Typography
                        color="text.secondary"
                        variant="body2"
                    >
                        You have new action to take in order to manage you families
                    </Typography> */}
          <Box sx={{ mt: 2 }}>
            {/* <Button
              sx={{ mt: 2 }}
              onClick={() => navigate("/fostershare/families")}
              variant="contained"
            >
              View families
            </Button> */}
            <PrimaryButton
              onClick={() => navigate("/fostershare/families")}
              label="View families"
            />
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};
export default NotificationCountWidget;
