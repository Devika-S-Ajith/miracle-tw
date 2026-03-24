import React, { useEffect, useState } from "react";
import {
  Box,
  Card,
  Button,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import APIS from "../../../../common/hooks/UseApiCalls";
import { useParams, useNavigate } from "react-router";
import { utcToLocalDate } from "../../../../helpers/helperFunction";

const RecentNotifications = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [notificationList, setNotificationList] = useState([]);

  useEffect(() => {
    getMessageListData();
  }, []);

  const getMessageListData = async () => {
    const payload = {
      rowCount: 5,
      pageNumber: 1,
      familyId: id,
      orderByField: [
        ["title", "DESC"],
        ["body", "ASC"],
      ],
    };
    try {
      const res = await APIS.getMessageList(payload);
      if (res?.data?.data) {
        setNotificationList(res?.data?.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <Card sx={{ borderRadius: 2 / 8 }}>
      <CardContent>
        <Typography color="textPrimary" fontWeight={700} fontSize="1.25rem">
          Recent notifications
        </Typography>
        <Typography
          color="textPrimary"
          // variant="subtitle2"
          fontWeight={700}
          fontSize="0.75rem"
          mb
        >
          Most recent push notifications sent to the family
        </Typography>
        <Box mt={2} mx={-2}>
          {notificationList.length > 0 ? (
            <>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>
                      <Typography variant="body2" fontWeight="bold">
                        Title
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight="bold">
                        Description
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight="bold">
                        {" "}
                        Sent By
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight="bold">
                        {" "}
                        Sent At
                      </Typography>
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {notificationList.map((notification) => {
                    return (
                      <TableRow hover>
                        <TableCell>{notification?.title}</TableCell>
                        <TableCell>{notification?.body}</TableCell>
                        <TableCell>{notification?.createdBy}</TableCell>
                        <TableCell>
                          {utcToLocalDate(notification?.createdAt)}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
              <Button
                sx={{ mt: 1, mb: -2, mx: 1 }}
                color="primary"
                onClick={() => navigate("/fostershare/messages")}
              >
                SEE ALL
              </Button>
            </>
          ) : (
            !loading && (
              <>
                <Typography
                  fontWeight="bold"
                  sx={{
                    color: "text.secondary",
                    display: "block",
                    margin: "auto",
                    textAlign: "center",
                    pt: 2,
                  }}
                >
                  There are no new notification
                </Typography>
              </>
            )
          )}
        </Box>
      </CardContent>
    </Card>
  );
};

export default RecentNotifications;
