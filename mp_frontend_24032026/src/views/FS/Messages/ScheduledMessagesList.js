import React, { useCallback } from "react";
import toast from "react-hot-toast";
import { Box, Button } from "@mui/material";
import TableComponent from "../../../components/TableComponent/TableComponent";
import APIS from "../../../common/hooks/UseApiCalls";
import { ModalService } from "../../../components/Modal";
import MessageDetailForm from "../Components/MessageDetailForm/MessageDetailForm";
import { dateFormatter, formatText, timeFormatter } from "../../../constants";
import Heading from "../../../components/Heading/Heading";

const ScheduledMessagesList = ({
  scheduledMessagesGridRef,
  sentMessagesGridRef,
}) => {
  const columns = [
    // { field: "id", headerName: "ID", width: 90 },
    {
      field: "title",
      headerName: "Title",
      minWidth: 150,
      flex: 1,
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
      flex: 1,
      minWidth: 150,
      sortable: false,
    },
    {
      field: "sendAt",
      headerName: "Scheduled at",
      minWidth: 110
    },
    {
      field: "time",
      headerName: "Time",
      minWidth: 110,
      sortable: false,
    },
    {
      field: "frequency",
      headerName: "Frequency",
      minWidth: 110,
      flex: 1,
      sortable: false,
    },
    {
      field: "scheduleStatus",
      headerName: "",
      flex: 1,
      minWidth: 120,
      sortable: false,
      align: "center",
      renderCell: ({ row }) =>
        row?.scheduleStatus === "ACTIVE" ? (
          <Box sx={{ outline: "none" }}>
            <Button
              onClick={() => cancelClickHandler(row)}
              variant="contained"
              color="primary"
            >
              Cancel
            </Button>
          </Box>
        ) : row?.scheduleStatus === "CANCELLED" ? (
          "Cancelled"
        ) : (
          "Completed"
        ),
    },
  ];

  const cancelClickHandler = (row) => {
    ModalService.open(() => <></>, {
      modalTitle: "Are you sure",
      width: "30%",
      modalDescription: `Are you sure you want to cancel the notification ${row?.title}`,
      actionButtonText: "Yes",
      cancelButtonText: "No",
      onClick: () => updateMessageStatus(row?.messageParticipantId),
    });
  };

  const updateMessageStatus = useCallback(async (id) => {
    // New Function
    try {
      let finalPayload = {
        id: id,
        isActive: false,
      };
      const data = await APIS.updateMessageStatus(finalPayload);
      if (data && data?.status === 200) {
        toast.success(data.data.message);
        scheduledMessagesGridRef?.current?.getDataLoader();
      } else {
        console.log("something went wrong!");
      }
    } catch (err) {
      console.error(err);
    }
  }, []);

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
        id="create-Message"
        sx={{ borderRadius: "4px", height: "48px" }}
        variant="contained"
        onClick={() => {
          ModalService.open(
            ({ close }) => (
              <MessageDetailForm
                onSuccess={() => {
                  scheduledMessagesGridRef?.current?.getDataLoader();
                  sentMessagesGridRef?.current?.getDataLoader();
                }}
                close={close}
              />
            ),
            {
              modalTitle: "New Message",
              width: "35%",
              hideModalFooter: true,
            }
          );
        }}
      >
        Create
      </Button>
    </Box>
  );

  const getScheduledMessageListData = async ({
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
    const data = await APIS.getScheduledMessageList({
      ...params,
    });
    let tempList = data && data.data;

    if (Array.isArray(tempList?.data)) {
      const { totalCount, pageCount } = tempList;
      return {
        items:
          tempList?.data.map((each) => ({
            id: each.messageParticipantId || each.id,
            title: each.title,
            body: each.body,
            recipientName: each.recipientName,
            sendAt: dateFormatter(each.schedule),
            time: timeFormatter(each.schedule),
            frequency: each.frequency
              ? formatText(each.frequency)
              : "Do not Repeat",
            scheduleStatus: each.scheduleStatus,
            messageParticipantId: each.messageParticipantId,
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
      <Heading
        id="family-table-label"
        heading={"Scheduled messages"}
        p={2}
        pb={0}
      />
      <Box p={2}>
        <TableComponent
          id="scheduled-message-table"
          // rows={rows}
          key="scheduled-message-table"
          showSlno={false}
          columns={columns}
          hideToolbar={false}
          dataLoader={getScheduledMessageListData}
          toolBarExtra={toolBarExtra}
          parentRef={scheduledMessagesGridRef}
          defaultSorting={[
            {
              field: "sendAt",
              sort: "desc",
            },
          ]}
        />
      </Box>
    </Box>
  );
};

export default ScheduledMessagesList;
