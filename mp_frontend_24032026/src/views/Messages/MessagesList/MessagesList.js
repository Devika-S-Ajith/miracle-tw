import {
  Box,
  Button,
  Card,
  CardContent,
  Divider,
  Grid,
  IconButton,
  Menu,
  MenuItem,
  Typography,
} from "@mui/material";
import React, { useContext, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import ChevronRightIcon from "../../../assets/icons/ChevronRight";
import TableComponent from "../../../components/TableComponent/TableComponent";
import { ModalService } from "../../../components/Modal";
import PlusIcon from "../../../assets/icons/Plus";
import "./messages.css";
import APIS from "../../../common/hooks/UseApiCalls";
import { convertUnderscoreToText, stripHtmlTags } from "../../../constants";
import MessageListFilter from "./MessageListFilter";
import toast from "react-hot-toast";
import Loader from "../../../components/UserComponents/Loader";
import MessageIcon from "@mui/icons-material/Message";
import { CommonDataContext } from "../../../common/contexts/CommonDataContext";
import useAuthorization from "../../../components/UserComponents/useAuthorization";

const MessagesList = () => {
  const { t } = useTranslation(["common"]);
  const navigate = useNavigate();
  const gridRef = useRef(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [currentRow, setCurrentRow] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const { signedinOrgType, signedinUserRoleHT,signedinUserRoleFS } = useContext(CommonDataContext);

  useAuthorization(
    signedinUserRoleHT,
    signedinUserRoleFS,
    signedinOrgType,
    "SYSTEM_MESSAGES",
    true
  );

  useEffect(() => {
    document.title = "System messages | ThriveWell";
  }, []);
  
  const open = Boolean(anchorEl);
  const handleClick = (event, row) => {
    setAnchorEl(event.currentTarget);
    setCurrentRow(row); // Set the current row when menu is opened  };
  };
  const handleClose = () => {
    setAnchorEl(null);
    setCurrentRow(null); // Clear the current row when menu is closed
  };

  const getBackgroundColor = (formattedValue) => {
    switch (formattedValue) {
      case "Active":
        return "#3DAA1D";
      case "Canceled":
        return "#DF2121";
      case "Draft":
      case "Scheduled":
        return "#F5A70B";
        case "Sent":
          return "#DF2121";
      default:
        return "#CCC"; // Default color if status doesn't match any case
    }
  };

  const messageType = (value) => {
    if (value === 'Popup dialog ') {
      return t("common:system messages.Popup");
    } else if (value === 'Banner message ') {
      return t("common:system messages.Banner");
    }
    return '';
  };

  const columns = [
    // { field: "id", headerName: "ID", width: 90 },
    {
      field: "status",
      headerName: t("common:system messages.Status"),
      minWidth: 170,
      // flex: 1,
      sortable: false,
      renderCell: ({ formattedValue, row }) => (
        <>
          <Box display="flex" alignItems="center" gap={1}>
            <Box
              sx={{
                backgroundColor: getBackgroundColor(formattedValue),
                borderRadius: 48,
                height: 12,
                width: 12,
              }}
            ></Box>

            <Box>
              <Typography fontWeight={600}>
                {/* {formattedValue} */}
                {t(`common:system messages.status.${formattedValue}`)}
              </Typography>
              <Typography color="#778791" fontSize="0.75rem">
                {/* {convertUnderscoreToText(row?.messageFrequency)} */}
                {t(`common:system messages.frequency.${row?.messageFrequency}`)}
              </Typography>
            </Box>
          </Box>
        </>
      ),
    },
    {
      field: "systemMessageTypeName",
      headerName: t("common:system messages.Message type"),
      minWidth: 170,
      // flex: 1,
      sortable: false,
      renderCell: ({ formattedValue }) => (
        <>
          <Box
            sx={{
              backgroundColor: "#778791",
              borderRadius: 2,
            }}
            px={1}
            py={1 / 2}
            color="#FFFFFF"
          >
            {messageType(convertUnderscoreToText(formattedValue))}
          </Box>
        </>
      ),
    },
    {
      field: "receipientType",
      headerName: t("common:system messages.Recipients"),
      // flex: 1,
      minWidth: 170,
      sortable: false,
      renderCell: ({ formattedValue, row }) => (
        <Box display="flex" flexDirection="column">
          <Typography fontWeight={600}>
            {/* {convertUnderscoreToText(formattedValue) || "-"} */}
            {t(`common:system messages.recipients.${formattedValue}`) || "-"}
          </Typography>

          {/* <Typography color="#778791" fontSize="0.75rem">
            24 of 150 read
          </Typography> */}
        </Box>
      ),
    },
    {
      field: "subject",
      headerName: t("common:system messages.Message"),
      flex: 1,
      minWidth: 150,
      sortable: false,
      renderCell: ({ formattedValue, row }) => (
        <Box display="flex" width={1} gap={1}>
          <Typography fontWeight={600}>{formattedValue}</Typography>

          {/* <Box
            sx={{
              width: 1,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            <div
              dangerouslySetInnerHTML={{ __html: row.content }}
            />
          </Box> */}
          <Typography
            color="#778791"
            fontSize="1rem"
            title={stripHtmlTags(row.content)}
            sx={{
              width: 1,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {stripHtmlTags(row.content)}
          </Typography>
        </Box>
      ),
    },

    {
      minWidth: 50,
      maxWidth: 50,
      sortable: false,
      renderCell: ({ row }) => (
        <>
          <IconButton
            aria-label="more"
            id="long-button"
            aria-controls={open ? "long-menu" : undefined}
            aria-expanded={open ? "true" : undefined}
            aria-haspopup="true"
            onClick={(event) => handleClick(event, row)}
          >
            <MoreVertIcon />
          </IconButton>
          <Menu
            id="long-menu"
            anchorEl={anchorEl}
            open={open}
            onClose={handleClose}
            MenuListProps={{
              "aria-labelledby": "basic-button",
            }}
            sx={{
              '& .MuiPaper-root': {
                elevation: '12px',
                boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.03)',
                backgroundColor: '#fff', // Ensure a white background
                borderRadius: '8px', // Optional: round the corners slightly for a softer look
              },
            }}
          >
            {currentRow &&
              !["Sent", "Canceled"].includes(currentRow?.status) && (
                <MenuItem
                  onClick={() => {
                    navigate(`message-details/${currentRow?.id}`);
                  }}
                  style={{ color: "#F37123" }}
                >
                  <img
                    alt="edit_account"
                    src="/static/icons/editIcon.svg"
                    width={16}
                    height={16}
                    style={{
                      alignSelf: "center",
                      marginRight: "8px",
                    }}
                  />
                  {t("common:common.Edit")}
                </MenuItem>
              )}
            <MenuItem
              onClick={() => {
                handleClose();
                copySystemMessageHandler();
              }}
              style={{ color: "#F37123" }}
            >
              <img
                alt="view_account"
                src="/static/icons/viewIcon.svg"
                width={20}
                height={20}
                style={{
                  alignSelf: "center",
                  marginRight: "8px",
                }}
              />
              {t("common:system messages.Copy")}
            </MenuItem>
            {currentRow &&
              !["Sent", "Canceled"].includes(currentRow?.status) && (
                <MenuItem
                  onClick={() => {
                    cancelClickHandler();
                    handleClose();
                  }}
                  style={{ color: "#F37123" }}
                >
                  <img
                    alt="add_user"
                    src="/static/icons/deactivateIcon.svg"
                    width={20}
                    height={20}
                    style={{
                      alignSelf: "center",
                      marginRight: "8px",
                    }}
                  />
                  {t("common:common.Cancel")}
                </MenuItem>
              )}
            {currentRow && currentRow.MPSystemMessageTypeId === '1' && (currentRow.status === 'Active' || currentRow.status === 'Sent') &&
              <>
                <Divider variant="middle" />
                <MenuItem
                  onClick={() => {
                    handleClose();
                    showMessageActivityHandler(currentRow);
                    // setCurrentRow(null)
                  }}
                  style={{ color: "#F37123", borderTop: 2, borderColor: "#000" }}
                >
                  <MessageIcon sx={{ mr: 1 }} />
                  {/* <img
                alt="edit_account"
                src="/static/icons/viewIcon.svg"
                width={16}
                height={16}
                style={{
                  alignSelf: "center",
                  marginRight: "8px",
                }}
              /> */}
                  {t("common:common.Message activity")}
                </MenuItem>
              </>
            }
          </Menu>
        </>
      ),
    },
  ];

  const showMessageActivityHandler = async (row) => {
    try {
      setIsLoading(true);
      const res = await APIS.getReadCount({
        messageId: row?.id,
        receipientMatchingConditions: row?.receipientMatchingConditions,
      });
      setIsLoading(false);

      if (res?.status === 200) {
        ModalService.open(() => <></>, {
          modalTitle: "Message activity",
          // width: "40%",
          modalDescription: (
            <Box>
              <Typography mb>This message has been seen by:</Typography>
              <Typography
                sx={{
                  textAlign: "center",
                  fontSize: "1.25rem",
                  fontWeight: "700",
                }}
              >
                {res?.data?.data?.viewStat}
              </Typography>
            </Box>
          ),
          hideActionButton: true,
          cancelButtonText:t("common:common.Close"),
          // onClick: async () => {
          //   setIsLoading(true);

          //   setIsLoading(false);
          // },
        });
      }
    } catch (error) {
      setIsLoading(false);
    }
  };
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
        id="create-family"
        startIcon={<PlusIcon fontSize="small" />}
        sx={{ borderRadius: "4px", height: "48px" }}
        variant="contained"
        onClick={() => {
          navigate("/admin/messages/message-details");
        }}
      >
        {t("common:system messages.New message")}
      </Button>
    </Box>
  );

  const cancelClickHandler = () => {
    ModalService.open(() => <></>, {
      modalTitle: t("common:system messages.Are you sure you want to cancel this message?"),
      width: "40%",
      modalDescription:
        t("common:system messages.Cancel message modal description"),
      actionButtonText: t("common:system messages.Cancel message"),
      cancelButtonText: t("common:system messages.Do not cancel message"),
      onClick: async () => {
        setIsLoading(true);
        try {
          const res = await APIS.cancelMessage({ id: currentRow?.id });
          if (res?.status === 200) {
            toast.success(res?.data?.message);
            gridRef?.current?.getDataLoader();
          }
        } catch (error) {
          console.error("Failed to cancel the message:", error);
          toast.error(t("common:system messages.Failed to cancel the message"));
        }
        setIsLoading(false);
      },
    });
  };

  const getRowClassName = ({ row }) => {
    if (row?.status === "Active") {
      return "active-message";
    }
    return "";
  };

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
    // if (orderByField?.length) params.orderByField = orderByField;
    try {
      const res = await APIS.getSystemMessageList({
        ...params,
      });

      const { data } = res;
      const { pageCount, totalActive } = data;

      if (Array.isArray(data?.data)) {
        return {
          items:
            data?.data.map((each) => ({
              id: each.id,
              subject: each.subject,
              content: each.content,
              availableActions: each.availableActions,
              messageFrequency: each.messageFrequency,
              messageFreqAdditionalInfo: each.messageFreqAdditionalInfo,
              startDateTime: each.startDateTime,
              endDateTime: each.endDateTime,
              receipientType: each.receipientType,
              receipientMatchingConditions: each.receipientMatchingConditions,
              MPSystemMessageTypeId: each.MPSystemMessageTypeId,
              systemMessageTypeName: each.systemMessageTypeName,
              systemMessageTypeId: each.systemMessageTypeId,
              status: each.status,
            })) || [],
          meta: {
            pageCount: pageCount,
            totalCount: totalActive,
          },
        };
      }
    } catch (error) {
      console.error("Error fetching message list data:", error);
      return {
        items: [],
        meta: {
          pageCount: 0,
          totalCount: 0,
        },
      };
    }
  };

  const copySystemMessageHandler = async () => {
    setIsLoading(true);
    try {
      const res = await APIS.copySystemMessage({ id: currentRow?.id });
      if (res?.status === 200) {
        toast.success(res?.data?.message);
        gridRef?.current?.getDataLoader();
      }
    } catch (error) { }
    setIsLoading(false);
  };

  return (
    <>
      <Loader loading={isLoading}></Loader>
      <Grid container width={1}>
        <Grid xs={12} item>
          <Box px={2}>
            <Grid item sx={{ display: "flex", flexDirection: "row" }} my={3}>
              <Typography
                color="textPrimary"
                variant="h5"
                sx={{ cursor: "pointer" }}
              //   onClick={() => navigate("/fostershare/dashboard")}
              >
                Admin
              </Typography>
              <Box
                sx={{
                  m: 0.75,
                }}
                style={{ cursor: "text" }}
              >
                <ChevronRightIcon color="disabled" fontSize="small" />
              </Box>
              <Typography
                id="family-table-label"
                color="textPrimary"
                variant="h5"
              >
                {t("common:common.System messages")}
              </Typography>
            </Grid>
            <Card sx={{ borderRadius: 2 / 8 }}>
              <CardContent sx={{ p: 3 }}>
                <Box>
                  <TableComponent
                    showSlno={false}
                    id="family-table"
                    columns={columns}
                    hideToolbar={false}
                    toolBarExtra={toolBarExtra}
                    getRowClassName={getRowClassName}
                    secondaryTable
                    dataLoader={getMessageListData}
                    CustomFilterPanel={MessageListFilter}
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

export default MessagesList;