import React, { useEffect, useCallback, useState, useRef } from "react";
import {
  Box,
  CircularProgress,
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
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import RemoveRedEyeIcon from "@mui/icons-material/RemoveRedEye";
import TextSnippetIcon from "@mui/icons-material/TextSnippet";
import {
  ClearIcon,
  DatePicker,
  LocalizationProvider,
} from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import RecreationalLogDetails from "../RecreationalLogDetails/RecreationalLogDetails";
import { ModalService } from "../../../../components/Modal";
import {
  getDate,
  monthYear,
  utcToLocalDate,
} from "../../../../helpers/helperFunction";
import APIS from "../../../../common/hooks/UseApiCalls";
import NoLogImage from "../../../../assets/images/woman-and-pc-screens.svg";
import SearchIcon from "../../../../assets/icons/Search";
import ListPaging from "../../../../components/UserComponents/ListPaging";
import Loader from "../../../../components/UserComponents/Loader";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import AnimatedDownloadIcon from "../../../../assets/images/icons8-download.gif";
import { ArrowRight } from "@mui/icons-material";
import { DateFormatFromRegion } from "../../../../constants";

const MonthlyMedLogsList = ({ module }) => {
  const { id } = useParams();
  const [medLog, setMedLog] = useState(null);
  const [pageCount, setpageCount] = useState(0);
  const [page, setPage] = useState(1);
  const [rowCount, setRowCount] = useState(10);
  const [fromDate, setFromDate] = useState(null);
  const [toDate, setToDate] = useState(null);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState("");
  const [timer, setTimer] = useState(null);
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [downloading, setDownloading] = useState(false);
  const [downloadFileUrl, setDownloadFileUrl] = useState(null);
  const [downloadFileName, setDownloadFileName] = useState(null);
  const downloadFileRef = useRef(null);
  const recId = searchParams && searchParams.get("medLogId");

  useEffect(() => {
    getMedLogList(10, 1, "", "", "");
  }, [id]);

  useEffect(() => {
    if (recId) {
      openRecLogDetailModal(recId);
    }
  }, [recId]);

  const handlePageChange = (event, newPage) => {
    setPage(newPage);
    getMedLogList(rowCount, newPage, fromDate, toDate, query);
  };

  const handleRowCountChange = (event) => {
    setRowCount(event.target.value);
    getMedLogList(event.target.value, page, fromDate, toDate, query);
  };

  const handleFromDateChange = (value) => {
    setFromDate(value);
    getMedLogList(rowCount, page, value, toDate, query);
  };

  const handleToDateChange = (value) => {
    setToDate(value);
    getMedLogList(rowCount, page, fromDate, value, query);
  };

  const getMedlogDocument = useCallback(async (id) => {
    setDownloading(true);
    setDownloadFileName(id);
    try {
      let payload = {
        logId: id,
      };
      const data = await APIS.getSignedMedLogDoc(payload);
      if (data?.data?.data?.medLogDocumentUrl) {
        setDownloadFileUrl(data?.data?.data?.medLogDocumentUrl);
        downloadFileRef.current?.click();
      }
      setDownloading(false);
    } catch (err) {
      setDownloading(false);
    }
  }, []);

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
      getMedLogList(rowCount, page, fromDate, toDate, event.target.value);
    } else {
      return;
    }
  };

  const getMedLogList = useCallback(
    async (rowCount, page, fromDate, toDate, query) => {
      setLoading(true);
      try {
        let payload = {
          formEngineId: "3",
          rowCount: rowCount,
          pageNumber: page,
          startDate: fromDate ? getDate(fromDate) : "",
          endDate: toDate ? getDate(toDate) : "",
          globalSearchQuery: query,
          orderByField: [["date", "DESC"]],
        };
        if (module == "children") {
          payload.childId = id;
        } else if (module === "families") {
          payload.familyId = id;
        }
        const data = await APIS.ListRecLog(payload);
        setMedLog(data && data.data && data.data.data && data.data.data?.logs);
        setpageCount(data && data.data && data.data.data?.pageCount);
        setLoading(false);
      } catch (err) {
        console.error(err);
        setLoading(false);
      }
    },
    []
  );

  const openRecLogDetailModal = (recId) => {
    ModalService.open(
      ({ close }) => (
        <RecreationalLogDetails
          moduleName={module}
          moduleId={id}
          recId={recId}
          close={close}
        />
      ),
      {
        width: "40%",
        hideModalFooter: true,
      }
    );
  };

  return (
    <Box>
      <Loader loading={loading}></Loader>

      <Typography
        id="export-overview-table-label"
        color="textPrimary"
        fontSize={"1.25rem"}
        fontWeight={700}
      >
        Monthly med logs
      </Typography>
      <Typography
        id="sub-export-overview-table-label"
        color="textPrimary"
        fontSize={"0.75rem"}
        fontWeight={700}
      >
        List of monthly med logs
      </Typography>
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <Grid container spacing={2} my>
          {!(module === "children") && (
            <Grid item md={3}>
              <TextField
                InputProps={{
                  sx: {
                    borderRadius: "0px",
                    height: 48,
                  },
                  startAdornment: (
                    <InputAdornment
                      position="start"
                      sx={{
                        borderRadius: 0,
                      }}
                    >
                      <SearchIcon fontSize="small" />
                    </InputAdornment>
                  ),
                  endAdornment: query.length > 0 && (
                    <IconButton
                      color="inherit"
                      onClick={() => {
                        getMedLogList(rowCount, page, fromDate, toDate, "");
                        setQuery("");
                      }}
                    >
                      <ClearIcon />
                    </IconButton>
                  ),
                }}
                onChange={handleSearchChange}
                onKeyDown={handleKeyPress}
                placeholder={"Search by child name"}
                value={query}
                variant="outlined"
              />
            </Grid>
          )}
          <Grid item md={3}>
            <DatePicker
              id="fromDateBehavior"
              value={fromDate}
              disableFuture
              slotProps={{ field: { clearable: true } }}
              onChange={(newValue) => {
                handleFromDateChange(newValue);
              }}
              format={DateFormatFromRegion()}
              maxDate={toDate}
              label={"From"}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2 / 8,
                  height: 48, // Adjust the height here
                },
                "& .MuiFormLabel-root": {
                  top: "-4px",
                },
              }}
            />
          </Grid>
          <Grid item md={3}>
            <DatePicker
              id="toDateBehavior"
              label={"To"}
              disableFuture
              slotProps={{ field: { clearable: true } }}
              value={toDate}
              onChange={(newValue) => {
                handleToDateChange(newValue);
              }}
              clearable
              format={DateFormatFromRegion()}
              minDate={fromDate}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2 / 8,
                  height: 48, // Adjust the height here
                },
                "& .MuiFormLabel-root": {
                  top: "-4px",
                },
              }}
            />
          </Grid>
        </Grid>
      </LocalizationProvider>
      <Box mt={2} sx={{ overflow: "auto" }}>
        {medLog && medLog.length > 0 ? (
          <Table>
            <TableHead>
              <TableRow>
                {!(module === "children") && <TableCell>Child</TableCell>}
                <TableCell>Month</TableCell>
                <TableCell>Submitted</TableCell>
                <TableCell>Submitted by</TableCell>
                <TableCell align="center">Document</TableCell>
                <TableCell></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {medLog.map((medLogListItem) => {
                return (
                  <TableRow hover key={medLogListItem.id}>
                    {!(module === "children") && (
                      <TableCell>{medLogListItem.childName}</TableCell>
                    )}
                    <TableCell>{monthYear(medLogListItem?.date)}</TableCell>
                    <TableCell>
                      {["SUBMITTED"].includes(medLogListItem?.formStatus) &&
                        utcToLocalDate(medLogListItem?.submittedDate)}
                    </TableCell>
                    <TableCell>
                      {["SUBMITTED"].includes(medLogListItem?.formStatus) &&
                        medLogListItem?.submittedBy}
                    </TableCell>
                    <TableCell align="center">
                      {["SUBMITTED"].includes(medLogListItem?.formStatus) &&
                        (!downloading ||
                          downloadFileName !== medLogListItem?.id) && (
                          <TextSnippetIcon
                            onClick={() => {
                              getMedlogDocument(medLogListItem?.id);
                            }}
                            fontSize="small"
                          />
                        )}
                      <a
                        href={downloadFileUrl}
                        download={downloadFileName}
                        className="hidden"
                        ref={downloadFileRef}
                      />
                      {downloading &&
                        downloadFileName == medLogListItem?.id && (
                          <img
                            src={AnimatedDownloadIcon}
                            alt="Downloading..."
                            style={{
                              width: "12%",
                              height: "12%",
                              objectFit: "contain",
                            }}
                          />
                        )}
                    </TableCell>
                    <TableCell>
                      <ArrowRight
                        sx={{
                          cursor: "pointer",
                          float: "right",
                        }}
                        fontSize="large"
                        id="view-icon"
                        onClick={() => {
                          navigate(`/fostershare/medlogs/${medLogListItem.id}`, {state: {module: module, id: id}});
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

export default MonthlyMedLogsList;
