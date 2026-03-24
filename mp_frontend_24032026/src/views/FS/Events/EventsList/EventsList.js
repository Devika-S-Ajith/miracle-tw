import React, { useContext, useEffect, useRef } from "react";
import TableComponent from "../../../../components/TableComponent/TableComponent";
import { Box, Button, Card, Grid, Typography } from "@mui/material";
import { ModalService } from "../../../../components/Modal";
import EventDetailForm from "../../Components/EventDetailForm";
import ChevronRightIcon from "../../../../assets/icons/ChevronRight";
import APIS from "../../../../common/hooks/UseApiCalls";
import PlusIcon from "../../../../assets/icons/Plus";
import {
  dateFormatter,
  timeFormatter,
} from "../../../../constants";
import { useNavigate } from "react-router";
import { ArrowRight } from "@mui/icons-material";
import useAuthorization from "../../../../components/UserComponents/useAuthorization";
import { CommonDataContext } from "../../../../common/contexts/CommonDataContext";

const EventsList = () => {
  useEffect(() => {
    document.title = "Events | ThriveWell";
  }, []);

  const gridRef = useRef(null);
  const navigate = useNavigate();
  const { signedinUserRoleFS } = useContext(CommonDataContext);

  useAuthorization(null, signedinUserRoleFS, null, "Events", false);

  const columns = [
    // { field: "id", headerName: "ID", width: 90 },
    {
      field: "title",
      headerName: "Title",
      minWidth: 200,
      // flex: 1,
    },
    {
      field: "description",
      headerName: "Description",
      minWidth: 350,
      flex: 1,
    },
    {
      field: "invited",
      headerName: "Invited",
      // flex: 1,
      minWidth: 100,
      sortable: false,
      // align: "center"
    },
    {
      field: "rsvp",
      headerName: "RSVP'd",
      // flex: 1,
      minWidth: 100,
      sortable: false,
      // align: "center"
    },
    {
      field: "date",
      headerName: "Date",
      // flex: 1,
      minWidth: 110,
    },
    {
      field: "startsAt",
      headerName: "Time",
      // flex: 1,
      minWidth: 110,
    },
    {
      sortable: false,
      renderCell: (row) => (
        <ArrowRight
          style={{ cursor: "pointer" }}
          fontSize="large"
          id="view-icon"
          onClick={() => navigate(`/fostershare/events/${row.id}`)}
          sx={{ cursor: "pointer" }}
        />
      ),
      width: 60,
      align: "right",
    },
  ];

  const toolBarExtra = (
    <Box
      sx={{
        display: "flex",
        flexDirection: "row",
        justifyContent: "end",
        alignItems: "center",
        gap: 1,
        width: "100%",
      }}
    >
      <Button
        id="create-event"
        startIcon={<PlusIcon fontSize="small" />}
        sx={{ borderRadius: "4px", height: "48px" }}
        variant="contained"
        onClick={() => {
          ModalService.open(
            ({ close }) => (
              <EventDetailForm
                close={close}
                onSuccess={() => gridRef?.current?.getDataLoader()}
              />
            ),
            {
              modalTitle: "Event details",
              width: "40%",
              hideModalFooter: true,
            }
          );
        }}
      >
        Add new event
      </Button>
    </Box>
  );

  const getEventList = async ({
    rowCount,
    pageNumber,
    globalSearchQuery,
    filter,
    orderByField,
  }) => {
    let params = {
      rowCount,
      pageNumber,
      ...filter,
    };
    if (globalSearchQuery?.length) params.globalSearchQuery = globalSearchQuery;
    if (orderByField?.length) params.orderByField = orderByField;
    try {
      const res = await APIS.getEventList({
        ...params,
      });

      const { data } = res;
      const { pageCount, totalCount } = data;

      if (Array.isArray(data?.data))
        return {
          items:
            data?.data.map((each) => ({
              id: each.id,
              title: each.title,
              description: each.description,
              startsAt: timeFormatter(each.startsAtTimestamp),
              invited: each.participantsInvited,
              rsvp: each.participantsResponded,
              date: dateFormatter(each.date),
            })) || [],
          meta: {
            pageCount: pageCount,
            totalCount: totalCount,
          },
        };
    } catch (error) {}
  };
  return (
    <Box p={2}>
      <Grid item sx={{ display: "flex", flexDirection: "row" }} my={3}>
        <Typography
          color="textPrimary"
          variant="h5"
          onClick={() => navigate("/fostershare/dashboard")}
          sx={{ cursor: "pointer" }}
        >
          FosterShare
        </Typography>
        <Box
          sx={{
            m: 0.75,
          }}
          style={{ cursor: "text" }}
        >
          <ChevronRightIcon color="disabled" fontSize="small" />
        </Box>
        <Typography id="child-table-label" color="textPrimary" variant="h5">
          Events
        </Typography>
      </Grid>
      <Card sx={{ borderRadius: 2 / 8 }}>
        <Box p={2}>
          <TableComponent
            showSlno={false}
            id="events-table"
            // rows={rows}
            columns={columns}
            hideToolbar={false}
            toolBarExtra={toolBarExtra}
            dataLoader={getEventList}
            parentRef={gridRef}
            defaultSorting={[
              {
                field: "date",
                sort: "desc",
              },
            ]}
          />
        </Box>
      </Card>
    </Box>
  );
};

export default EventsList;
