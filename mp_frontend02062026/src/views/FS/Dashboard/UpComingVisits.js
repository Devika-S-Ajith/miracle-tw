import React from "react";
import TableComponent from "../../../components/TableComponent/TableComponent";
import { Box, Card } from "@mui/material";
import { dateFormatter } from "../../../constants";
import APIS from "../../../common/hooks/UseApiCalls";
import Heading from "../../../components/Heading";
import SmallText from "../../../components/SmallText/SmallText";

const UpComingVisits = () => {
  const columns = [
    // { field: "id", headerName: "ID", width: 90 },
    {
      field: "casemanager",
      headerName: "Case Manager",
      minWidth: 150,
      flex: 1,
      sortable: false,
    },
    {
      field: "title",
      headerName: "Title",
      minWidth: 150,
      flex: 1,
      sortable: false,
    },
    {
      field: "date",
      headerName: "Date",
      flex: 1,
      minWidth: 110,
      sortable: false,
    },
    {
      field: "rsvp",
      headerName: "RSVP",
      flex: 1,
      minWidth: 150,
      sortable: false,
    },
  ];

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
    // if (globalSearchQuery?.length) params.globalSearchQuery = globalSearchQuery;
    // if (orderByField?.length) params.orderByField = orderByField;
    try {
      const res = await APIS.getEventList({
        futureEvents: true,
        orderByField: [["createdAt", "DESC"]],
        eventType: "AGENTVISIT",

        ...params,
      });

      const { data } = res;
      const { pageCount, totalCount } = data;

      if (Array.isArray(data?.data))
        return {
          items:
            data.data?.map((each) => ({
              id: each.id,
              casemanager:
                (each["TW_user.firstName"] || "") + " " + (each["TW_user.lastName"] || ""),
              title: each.title,
              description: each.description,
              startsAt: each.startsAt,
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
    <Card sx={{ borderRadius: 4 / 8, p: 1 }}>
      <Box>
        {/* <Typography
          id="events-table-label"
          color="textPrimary"
          variant="h6"
          ml={1}
          mt={1}
        >
          Upcoming visits
        </Typography> */}
        <Box ml={1} mt={1}>
          <Heading heading="Upcoming visits" />
        </Box>
        {/* <Typography
          id="sub-log-overview-table-label"
          color="text.secondary"
          fontSize={"0.75rem"}
          fontWeight={700}
          ml={1}
        >
          List of upcoming Case Manager visits.
        </Typography> */}
        <SmallText
          value="List of upcoming Case Manager visits"
          fontWeight={600}
          ml={1}
        />
        <Box p={1} pt={0} mt={-1}>
          <TableComponent
            showSlno={false}
            id="events-table"
            columns={columns}
            hideToolbar={true}
            dataLoader={getEventList}
            hideFooter
          />
        </Box>
      </Box>
    </Card>
  );
};

export default UpComingVisits;
