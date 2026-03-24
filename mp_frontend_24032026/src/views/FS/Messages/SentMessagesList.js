import React from "react";
import { Box } from "@mui/material";
import TableComponent from "../../../components/TableComponent/TableComponent";
import APIS from "../../../common/hooks/UseApiCalls";
import { dateFormatter } from "../../../constants";
import Heading from "../../../components/Heading/Heading";

const SentMessagesList = ({ sentMessagesGridRef }) => {
  const columns = [
    // { field: "id", headerName: "ID", width: 90 },
    {
      field: "title",
      headerName: "Title",
      minWidth: 150,
      // flex: 1,
    },
    {
      field: "body",
      headerName: "Description",
      minWidth: 350,
      flex: 1,
    },
    {
      field: "recipientName",
      headerName: "Recipient",
      // flex: 1,

      minWidth: 200,
      sortable: false,
    },
    {
      field: "createdAt",
      headerName: "Sent at",
      minWidth: 120,
      // sortable: false,

      // flex: 1,
    },
    {
      field: "status",
      headerName: "Status",
      // flex: 1,
      minWidth: 120,
      sortable: false,
    },
  ];

  const getMessageListData = async ({
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
    const res = await APIS.getMessageList({
      ...params,
    });
    const { data } = res;
    const { pageCount, totalCount } = data;
    if (Array.isArray(data?.data)) {
      return {
        items:
          data?.data.map((each) => ({
            id: each?.messageParticipantId,
            title: each.title,
            body: each.body,
            recipientName: each.recipientName,
            createdAt: dateFormatter(each.createdAt),
            status: each.messageStatus,
          })) || [],
        meta: {
          pageCount: pageCount,
          totalCount: totalCount,
        },
      };
    }
  };

  return (
    <Box>
      <Heading id="family-table-label" heading={"Sent messages"} p={2} pb={0} />
      <Box p={2}>
        <TableComponent
          key="message-table"
          id="message-table"
          // rows={rows}
          showSlno={false}
          columns={columns}
          hideToolbar={false}
          dataLoader={getMessageListData}
          parentRef={sentMessagesGridRef}
          defaultSorting={[
            {
              field: "createdAt",
              sort: "desc",
            },
          ]}
        />
      </Box>
    </Box>
  );
};

export default SentMessagesList;
