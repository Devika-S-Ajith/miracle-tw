import React, { useContext, useRef, useState } from "react";
import {
  Box,
  Button,
  Card,
  Typography,
  Grid,
  CardContent,
} from "@mui/material";
import { fromUtc } from "../../../../constants.js";
import { useNavigate } from "react-router";
import TableComponent from "../../../../components/TableComponent/TableComponent.js";
import APIS from "../../../../common/hooks/UseApiCalls.js";
import ArrowRightIcon from "@mui/icons-material/ArrowRight";
import "./notification.css";
import { makeStyles } from "@mui/styles";

import MarkAll from "../../../../assets/icons/mark_all.svg";
import Loader from "../../../../components/UserComponents/Loader.js";
import { CommonDataContext } from "../../../../common/contexts/CommonDataContext.js";

const useStyles = makeStyles({
  hideHeader: {
    "& .MuiDataGrid-columnHeaders ": {
      display: "none",
    },
  },
});
const NotificationsList = () => {
  const navigate = useNavigate();
  const classes = useStyles();
  const gridRef = useRef(null);
  const {
    fsAvailableChildrenIds,
    tsAvailableChildrenIds,
    tsAvailableFamilyIds,
  } = useContext(CommonDataContext);

  const [isLoading, setIsLoading] = useState();

  const columns = [
    {
      field: "title",
      headerName: "",
      width: 200,
      sortable: false,
      renderCell: ({ formattedValue, row }) => (
        <Box>
          <Typography color="#F37123" fontSize={"1rem"} fontWeight={700}>
            {formattedValue}
          </Typography>

          <Typography color="textPrimary" fontSize={"1rem"} fontWeight={500}>
            {row?.notificationType === "FOSTER_SHARE"
              ? "FosterShare"
              : "Thrive Scale"}
          </Typography>
        </Box>
      ),
    },
    {
      field: "body",
      headerName: "",
      minWidth: 150,
      flex: 1,
      sortable: false,
      renderCell: ({ formattedValue }) => (
        <Box
          sx={{
            overflow: "hidden",
            textOverflow: "ellipsis",
            display: "-webkit-box",
            "-webkit-line-clamp": "3",
            "-webkit-box-orient": "vertical",
          }}
          my
        >
          {formattedValue}
        </Box>
      ),
    },
    {
      field: "date",
      headerName: "",
      width: 150,
      sortable: false,
    },

    {
      renderCell: ({ row }) => (
        <>
          <ArrowRightIcon
            onClick={() => rowClickHandler(row)}
            titleAccess="View"
            sx={{ cursor: "pointer", fontSize: "2rem" }}
          ></ArrowRightIcon>
        </>
      ),
      width: 60,
      sortable: false,
      align: "right",
    },
  ];

  const toolBarExtra = (
    <Box
      sx={{
        display: "flex",
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        gap: 3,
        width: "100%",
      }}
    >
      <Button
        id="mark-all-read"
        startIcon={<img src={MarkAll} alt="Plus Icon" />}
        sx={{ borderRadius: "4px", height: "48px" }}
        variant="contained"
        onClick={() => {
          readNotificationHandler({
            readStatus: true,
            markAll: true,
          });
        }}
      >
        Mark all as read
      </Button>
    </Box>
  );

  const rowClickHandler = async (row) => {
    if (row.unreadMessage) {
      await readNotificationHandler({
        id: row?.id,
        readStatus: true,
        markAll: false,
      });
    }

    row.eventId
      ? navigate(`/fostershare/events/${row.eventId}`)
      : row.childLogId
      ? childNavigationHandler(row)
      : row.HTCaseId
      ? assessmentNavigationHandler(row)
      : gridRef?.current?.getDataLoader();
  };

  const childNavigationHandler = (notification) => {
    if (fsAvailableChildrenIds.includes(notification?.childId)) {
      navigate(
        `/fostershare/children/${notification?.childId}/?behavioralLog=${notification?.childLogId}`
      );
    } else {
      gridRef?.current?.getDataLoader();
    }
  };

  const assessmentNavigationHandler = (notification) => {
    const { HTFamilyId, HTChildId } = notification;
    const navigateTo = (path, state) => navigate(path, { state });

    if (tsAvailableChildrenIds.includes(HTChildId)) {
      navigateTo(`/dashboard/children/${HTChildId}/view`, { tabvalue: "assessmentsProgressReports" });
    } else if (tsAvailableFamilyIds.includes(HTFamilyId)) {
      navigateTo(`/dashboard/families/${HTFamilyId}/view`, { tabvalue: "assessmentsProgressReports" });
    } else {
      gridRef?.current?.getDataLoader();
    }
  };

  const getNotifications = async ({
    rowCount,
    pageNumber,
    globalSearchQuery,
    filter,
  }) => {
    let params = {
      rowCount: rowCount,
      pageNumber,
      ...filter,
      notificationType: "ALL",
    };
    if (globalSearchQuery?.length) params.globalSearchQuery = globalSearchQuery;
    try {
      const res = await APIS.getNotificationList({
        ...params,
      });

      const { data } = res;
      const { pageCount, totalCount } = data;

      if (Array.isArray(data?.data?.rows))
        return {
          items:
            data?.data?.rows?.map((each) => ({
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
            })) || [],
          meta: {
            pageCount: pageCount,
            totalCount: totalCount,
          },
        };
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
        year: "numeric",
      });
    }
  };

  const readNotificationHandler = async (req) => {
    setIsLoading(true);
    try {
      const res = await APIS.updateReadNotificationStatus(req);
      if (req?.markAll && res?.status == 200) {
        gridRef?.current?.getDataLoader();
      }
    } catch (error) {
      setIsLoading(false);
    }
    setIsLoading(false);
  };

  const getRowClassName = ({ row }) => {
    if (row?.unreadMessage) {
      return "unread-message";
    }
    return "";
  };

  return (
    <>
      <Loader loading={isLoading} />
      <Grid container spacing={2} width={1}>
        <Grid xs={12} item>
          <Box px={2}>
            <Typography
              id="notifications-table-label"
              color="textPrimary"
              variant="h5"
              my={2}
            >
              Notifications
            </Typography>
            <Card sx={{ borderRadius: 2 / 8 }}>
              <CardContent sx={{ p: 3 }}>
                <Box>
                  <TableComponent
                    showSlno={false}
                    id="notifications-table"
                    columns={columns}
                    hideToolbar={false}
                    toolBarExtra={toolBarExtra}
                    dataLoader={getNotifications}
                    getRowClassName={getRowClassName}
                    className={classes.hideHeader}
                    getRowHeight={() => "auto"}
                    // CustomFilterPanel={FamilyListFilter}
                    parentRef={gridRef}
                  />
                </Box>
              </CardContent>
            </Card>
          </Box>
        </Grid>
      </Grid>
    </>
  );
};

export default NotificationsList;
