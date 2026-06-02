import React, { useCallback, useContext, useEffect, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import {
  Box,
  Grid,
  IconButton,
  InputAdornment,
  Pagination,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import RemoveRedEyeIcon from "@mui/icons-material/RemoveRedEye";
import {
  ClearIcon,
  DatePicker,
  LocalizationProvider,
} from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { ModalService } from "../../../../components/Modal";
import BehaviorLogDetails from "../BehaviorLogDetails";
import APIS from "../../../../common/hooks/UseApiCalls";
import {
  getDate,
  utcToDateFormat,
} from "../../../../helpers/helperFunction";
import { renderAnswerColumnList } from "../helperFunction";
import NoLogImage from "../../../../assets/images/woman-and-pc-screens.svg";
import SearchIcon from "../../../../assets/icons/Search";
import ListPaging from "../../../../components/UserComponents/ListPaging";
import Loader from "../../../../components/UserComponents/Loader";
import { CASEWORKER } from "../../../../helpers/constant";
import { CommonDataContext } from "../../../../common/contexts/CommonDataContext";
import { LoadingButton } from "@mui/lab";
import { PrintAsPDF } from "../../../../components/UserComponents/ReportGenerator";
import toast from "react-hot-toast";
import FileUploadIcon from "@mui/icons-material/FileUpload";
import { DateFormatFromRegion } from "../../../../constants";
import Heading from "../../../../components/Heading";
import SmallText from "../../../../components/SmallText/SmallText";

const LogOverviewList = ({ module, listData }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [behavioralLogList, setBehaviourLogList] = useState([]);
  const [searchParams, setSearchParams] = useSearchParams();
  const [pageCount, setpageCount] = useState(0);
  const [page, setPage] = useState(1);
  const [rowCount, setRowCount] = useState(10);
  const [fromDate, setFromDate] = useState(null);
  const [toDate, setToDate] = useState(null);
  const [loading, setLoading] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);
  const [query, setQuery] = useState("");
  const [timer, setTimer] = useState(null);
  const { signedinUserRoleFS } = useContext(CommonDataContext);

  const behavioralLogId = searchParams && searchParams.get("behavioralLog");

  useEffect(() => {
    getBehaviourLogList(10, 1, "", "", "");
  }, [id]);

  useEffect(() => {
    if (behavioralLogId) {
      openRecLogDetailModal(behavioralLogId);
    }
  }, [behavioralLogId]);

  const handlePageChange = (event, newPage) => {
    setPage(newPage);
    getBehaviourLogList(rowCount, newPage, fromDate, toDate, query);
  };

  const handleRowCountChange = (event) => {
    setRowCount(event.target.value);
    getBehaviourLogList(event.target.value, page, fromDate, toDate, query);
  };

  const handleFromDateChange = (value) => {
    setFromDate(value);
    getBehaviourLogList(rowCount, page, value, toDate, query);
  };

  const handleToDateChange = (value) => {
    setToDate(value);
    getBehaviourLogList(rowCount, page, fromDate, value, query);
  };

  const handleSearchChange = (event) => {
    const text = event.target.value;
    setQuery(text);
    clearTimeout(timer);
    if (text.length > 2) {
      setTimer(
        setTimeout(() => {
          handleQueryChange(event);
        }, 800)
      );
    } else if (text.length === 0) {
      handleQueryChange(event);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      const inputValue = e.target.value.trim();
      if (inputValue.length === 1 || inputValue.length === 2) {
        handleQueryChange(e, true);
      }
    }
  };

  const handleQueryChange = (event, flag = false) => {
    setPage(1);
    if (event.target.value === "" || event.target.value.length > 2 || flag) {
      getBehaviourLogList(rowCount, page, fromDate, toDate, event.target.value);
    } else {
      return;
    }
  };

  const openRecLogDetailModal = (behavioralLogId) => {
    ModalService.open(
      ({ close }) => (
        <BehaviorLogDetails
          moduleName={module}
          moduleId={id}
          behavioralLogId={behavioralLogId}
          close={close}
        />
      ),
      {
        width: "40%",
        hideModalFooter: true,
      }
    );
  };

  const handleExport = useCallback(async () => {
    try {
      setExportLoading(true);
      let payload = {
        formEngineId: module !== "dashboard" ? listData.id : "2",
        formType: module !== "dashboard" ? listData?.formType : "BEHAVIOR_LOG",
        name: "BEHAVIOR LOG",
        TWAccountId: localStorage.getItem("orgId"),
        rowCount: 1000,
        pageNumber: 1,
        startDate: fromDate ? getDate(fromDate) : "",
        endDate: toDate ? getDate(toDate) : "",
        globalSearchQuery: query,
        orderByField: [["date", "DESC"]],
      };
      if (module === "children") {
        payload.childId = id;
      } else if (module === "families") {
        payload.familyId = id;
      } else if (module === "dashboard") {
        if ([CASEWORKER].includes(signedinUserRoleFS)) {
          payload.caseManagerId = localStorage.getItem("username");
        } else {
          payload.accountId = localStorage.getItem("orgId");
        }
      }
      payload.timezone = "UTC";
      const data = await APIS.ExportLogPdf(payload);
      if (data && data?.data) {
        PrintAsPDF(data?.data, "BEHAVIOR LOG");
        setExportLoading(false);
      } else if (data.data.Message === "Unauthorized") {
        toast.error("Unauthorized");
        setExportLoading(false);
      } else {
        console.log("issue fetching data to export");
        toast.error(
          "Error while fetching data to export,Please try again in some time"
        );
        setLoading(false);
      }
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  });

  const getBehaviourLogList = useCallback(
    async (rowCount, page, fromDate, toDate, query, sortValue) => {
      setLoading(true);
      try {
        let payload = {
          formEngineId: module !== "dashboard" ? listData.id : "2",
          rowCount: rowCount,
          pageNumber: page,
          startDate: fromDate ? getDate(fromDate) : "",
          endDate: toDate ? getDate(toDate) : "",
          globalSearchQuery: query,
          orderByField: [["date", "DESC"]],
        };
        if (module === "children") {
          payload.childId = id;
        } else if (module === "families") {
          payload.familyId = id;
        } else if (module === "dashboard") {
          if ([CASEWORKER].includes(signedinUserRoleFS)) {
            payload.caseManagerId = localStorage.getItem("username");
          } else {
            payload.accountId = localStorage.getItem("orgId");
          }
        }
        const data = await APIS.ListRecLog(payload);
        setBehaviourLogList(
          data && data.data && data.data.data && data.data.data?.logs
        );
        setpageCount(data && data.data && data.data.data?.pageCount);
        setLoading(false);
        //}
      } catch (err) {
        console.error(err);
        setLoading(false);
      }
    },
    []
  );

  return (
    <Box>
      <Loader loading={loading} />
      {/* <Typography
        id="log-overview-table-label"
        color="textPrimary"
        fontSize={"1.25rem"}
        fontWeight={700}
      >
        Behavioral logs
      </Typography> */}
      <Heading heading="Behavioral logs" />
      {/* <Typography
        id="sub-log-overview-table-label"
        color="textPrimary"
        fontSize={"0.75rem"}
        fontWeight={700}
      >
        Recently submitted behavior logs
      </Typography> */}
      {/* <SmallText value="Recently submitted behavior logs" fontWeight={600} /> */}
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <Grid container spacing={2} my alignItems="center" flexWrap="nowrap">
          {module !== "children" && (
            <Grid item sx={{ flex: 1, minWidth: 0 }}>
              <TextField
                fullWidth
                InputProps={{
                  sx: {
                    borderRadius: "0px",
                    height: 53,
                  },
                  startAdornment: (
                    <InputAdornment position="start" sx={{ borderRadius: 0 }}>
                      <SearchIcon fontSize="small" />
                    </InputAdornment>
                  ),
                  endAdornment: query.length > 0 && (
                    <IconButton
                      color="inherit"
                      onClick={() => {
                        getBehaviourLogList(rowCount, page, fromDate, toDate, "");
                        setQuery("");
                      }}
                    >
                      <ClearIcon />
                    </IconButton>
                  ),
                }}
                onChange={handleSearchChange}
                onKeyDown={handleKeyPress}
                placeholder="Search by child name"
                value={query}
                variant="outlined"
              />
            </Grid>
          )}

          <Grid item sx={{ ml: "auto", display: "flex", gap: 2, alignItems: "center", flexShrink: 0 }}>
            <DatePicker
              id="fromDateBehavior"
              value={fromDate}
              disableFuture
              slotProps={{
                field: { clearable: true },
                textField: { sx: { width: 160 } },
              }}
              onChange={(newValue) => handleFromDateChange(newValue)}
              format={DateFormatFromRegion()}
              maxDate={toDate}
              label="From"
              sx={{
                "& .MuiOutlinedInput-root": { borderRadius: 2 / 8, height: 48 },
                "& .MuiFormLabel-root": { top: "-4px" },
              }}
            />

            <DatePicker
              id="toDateBehavior"
              label="To"
              disableFuture
              slotProps={{
                field: { clearable: true },
                textField: { sx: { width: 160 } },
              }}
              value={toDate}
              onChange={(newValue) => handleToDateChange(newValue)}
              format={DateFormatFromRegion()}
              minDate={fromDate}
              sx={{
                "& .MuiOutlinedInput-root": { borderRadius: 2 / 8, height: 48 },
                "& .MuiFormLabel-root": { top: "-4px" },
              }}
            />

            <LoadingButton
              size="small"
              onClick={handleExport}
              loading={exportLoading}
              loadingPosition="start"
              startIcon={<FileUploadIcon />}
              color="primary"
              variant="contained"
              sx={{ height: 53, whiteSpace: "nowrap" }}
              disabled={!behavioralLogList?.length}
            >
              Export
            </LoadingButton>
          </Grid>
        </Grid>
      </LocalizationProvider>
      <Box mt={2} sx={{ overflow: "auto " }}>
        {behavioralLogList && behavioralLogList.length > 0 ? (
          <Table sx={{ mb: 2 }}>
            <TableHead>
              <TableRow>
                {(module !== "children") && <TableCell>Child</TableCell>}
                <TableCell>Date</TableCell>
                <TableCell>Day rating</TableCell>
                <TableCell>Parent mood</TableCell>
                <TableCell>Child mood</TableCell>
                <TableCell>Behavioral issues</TableCell>
                <TableCell></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {behavioralLogList.map((behavioralLogListItem) => {
                return (
                  <TableRow hover key={behavioralLogListItem.id}>
                    {(module !== "children") && (
                      <TableCell>{behavioralLogListItem.childName}</TableCell>
                    )}
                    <TableCell>
                      {utcToDateFormat(behavioralLogListItem?.date)}
                    </TableCell>
                    <TableCell>
                      {renderAnswerColumnList(
                        behavioralLogListItem?.formTemplate?.defaultTemplate[0]
                          ?.components[0],
                        behavioralLogListItem?.formAnswer?.formResponse[0]
                          .components[0],
                        false
                      )}
                      {/* {behavioralLogListItem?.formAnswer?.formResponse[0].components[0]?.responseValue} */}
                    </TableCell>
                    <TableCell>
                      {renderAnswerColumnList(
                        behavioralLogListItem?.formTemplate?.defaultTemplate[1]
                          ?.components[0],
                        behavioralLogListItem?.formAnswer?.formResponse[1]
                          .components[0],
                        false
                      )}
                    </TableCell>
                    <TableCell>
                      {renderAnswerColumnList(
                        behavioralLogListItem?.formTemplate?.defaultTemplate[4]
                          ?.components[0],
                        behavioralLogListItem?.formAnswer?.formResponse[4]
                          .components[0],
                        false
                      )}
                    </TableCell>
                    <TableCell>
                      {renderAnswerColumnList(
                        behavioralLogListItem?.formTemplate?.defaultTemplate[2]
                          ?.components[0],
                        behavioralLogListItem?.formAnswer?.formResponse[2]
                          ?.components[0],
                        false
                      )}
                    </TableCell>
                    <TableCell>
                      <RemoveRedEyeIcon
                        id="view-icon"
                        onClick={() => {
                          ["dashboard"].includes(module)
                            ? navigate(
                                `/fosterShare/${module}/?behavioralLog=${behavioralLogListItem.id}`
                              )
                            : navigate(
                                `/fosterShare/${module}/${id}/?behavioralLog=${behavioralLogListItem.id}`
                              );
                        }}
                      />
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        ) : (
          <>
            <img
              src={NoLogImage}
              alt="NoLogFound"
              style={{
                width: "40%",
                height: "40%",
                objectFit: "contain",
                display: "block",
                margin: "auto",
              }}
            />
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
              There are no logs yet
            </Typography>
          </>
        )}
      </Box>
      {pageCount > 0 && (
        <Box sx={{ display: "flex" }} flexDirection="row-reverse" pt={1} mt={1}>
          <Box sx={{ alignContent: "flex-end" }}>
            <Pagination
              onChange={handlePageChange}
              page={page}
              count={pageCount}
              shape="rounded"
            />
          </Box>

          <ListPaging
            rowCount={rowCount}
            handleRowCountChange={handleRowCountChange}
          />
        </Box>
      )}
    </Box>
  );
};

export default LogOverviewList;
