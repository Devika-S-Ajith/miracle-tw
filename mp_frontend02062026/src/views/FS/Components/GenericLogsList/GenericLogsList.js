import React, { useEffect, useCallback, useState } from "react";
import toast from "react-hot-toast";
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
import { useTranslation } from "react-i18next";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import RemoveRedEyeIcon from "@mui/icons-material/RemoveRedEye";
import {
  ClearIcon,
  DatePicker,
  LocalizationProvider,
} from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LoadingButton } from "@mui/lab";
import FileUploadIcon from "@mui/icons-material/FileUpload";
import { ModalService } from "../../../../components/Modal";
import {
  getTimeZone,
  utcToDateFormat,
  getDayStartISOString,
  getDayEndISOString,
} from "../../../../helpers/helperFunction";
import APIS from "../../../../common/hooks/UseApiCalls";
import NoLogImage from "../../../../assets/images/woman-and-pc-screens.svg";
import SearchIcon from "../../../../assets/icons/Search";
import ListPaging from "../../../../components/UserComponents/ListPaging";
import Loader from "../../../../components/UserComponents/Loader";
import { PrintAsPDF } from "../../../../components/UserComponents/ReportGenerator";
import { DateFormatFromRegion } from "../../../../constants";
import GenericLogDetails from "../GenericLogDetails";

const GenericLogsList = ({ module, listData }) => {
  const { t } = useTranslation(["common"]);
  const { id } = useParams();
  const [genericLog, setGenericLog] = useState(null);
  const [pageCount, setpageCount] = useState(0);
  const [page, setPage] = useState(1);
  const [rowCount, setRowCount] = useState(10);
  const [fromDate, setFromDate] = useState(null);
  const [toDate, setToDate] = useState(null);
  const [loading, setLoading] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);
  const [query, setQuery] = useState("");
  const [timer, setTimer] = useState(null);
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const recId = searchParams && searchParams.get("genericLog");
  const formEngineId = searchParams && searchParams.get("formEngineId");

  useEffect(() => {
    getRecLogList(10, 1, "", "", "");
  }, [id]);

  useEffect(() => {
    if (recId && formEngineId == listData.id) {
      openRecLogDetailModal(recId);
    }
  }, [recId]);

  const handlePageChange = (event, newPage) => {
    setPage(newPage);
    getRecLogList(rowCount, newPage, fromDate, toDate, query);
  };

  const handleRowCountChange = (event) => {
    setRowCount(event.target.value);
    getRecLogList(event.target.value, page, fromDate, toDate, query);
  };

  const handleFromDateChange = (value) => {
    setFromDate(value);
    getRecLogList(rowCount, page, value, toDate, query);
  };

  const handleToDateChange = (value) => {
    setToDate(value);
    getRecLogList(rowCount, page, fromDate, value, query);
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
      getRecLogList(rowCount, page, fromDate, toDate, event.target.value);
    } else {
      return;
    }
  };

  const getRecLogList = useCallback(
    async (rowCount, page, fromDate, toDate, query) => {
      setLoading(true);
      try {
        let payload = {
          formEngineId: listData?.id,
          rowCount: rowCount,
          pageNumber: page,
          startDate: fromDate ? getDayStartISOString(fromDate) : "",
          endDate: toDate ? getDayEndISOString(toDate) : "",
          globalSearchQuery: query,
          orderByField: [["date", "DESC"]],
        };
        if (module == "children") {
          payload.childId = id;
        } else if (module === "families") {
          payload.familyId = id;
        }
        const data = await APIS.ListRecLog(payload);
        setGenericLog(
          data && data.data && data.data.data && data.data.data?.logs
        );
        setpageCount(data && data.data && data.data?.data.pageCount);
        setLoading(false);
      } catch (err) {
        console.error(err);
        setLoading(false);
      }
    },
    []
  );

  const handleExport = useCallback(async () => {
    try {
      setExportLoading(true);
      let payload = {
        formEngineId: listData.id,
        formType: listData?.formType,
        name: listData?.formName,
        TWAccountId: localStorage.getItem("orgId"),
        rowCount: 1000,
        pageNumber: 1,
        startDate: fromDate ? getDayStartISOString(fromDate) : "",
          endDate: toDate ? getDayEndISOString(toDate) : "",
        globalSearchQuery: query,
        orderByField: [["date", "DESC"]],
      };
      if (module === "children") {
        payload.childId = id;
      } else if (module === "families") {
        payload.familyId = id;
      }
      const localTimeZone = getTimeZone();
      payload.timezone = "UTC";
      const data = await APIS.ExportLogPdf(payload);
      if (data && data?.data) {
        PrintAsPDF(data?.data, listData?.formName);
        setExportLoading(false);
      } else if (data.data.Message === "Unauthorized") {
        toast.error(t("common:common.Unauthorized"));
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

  const openRecLogDetailModal = (recId) => {
    ModalService.open(
      ({ close }) => (
        <GenericLogDetails
          moduleName={module}
          moduleId={id}
          behavioralLogId={recId}
          close={close}
          logName={listData?.formName}
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
        {listData?.formName}
      </Typography>
      {/* <Typography
        id="sub-export-overview-table-label"
        color="textPrimary"
        fontSize={"0.75rem"}
        fontWeight={700}
      >
        {t("Recently submitted recreation logs")}
      </Typography> */}
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
                        getRecLogList(rowCount, page, fromDate, toDate, "");
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
              label={t("common:From")}
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
              label={t("common:To")}
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
          <Grid item md={3}>
            <LoadingButton
              size="small"
              onClick={handleExport}
              loading={exportLoading}
              loadingPosition="start"
              startIcon={<FileUploadIcon />}
              color="primary"
              variant="contained"
              sx={{ height: 48 }}
              disabled={!genericLog?.length}
            >
              {t("common:common.Export")}
            </LoadingButton>
          </Grid>
        </Grid>
      </LocalizationProvider>
      <Box mt={2} sx={{ overflow: "auto" }}>
        {genericLog && genericLog.length > 0 ? (
          <Table>
            <TableHead>
              <TableRow>
                {!(module === "children") && <TableCell>Child</TableCell>}
                <TableCell>Date</TableCell>
                <TableCell>Submitted by</TableCell>
                {/* <TableCell>Activity comment</TableCell> */}
                <TableCell></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {genericLog.map((RecLogListItem) => {
                return (
                  <TableRow hover key={RecLogListItem.id}>
                    {!(module === "children") && (
                      <TableCell>{RecLogListItem.childName}</TableCell>
                    )}
                    <TableCell>
                      {utcToDateFormat(RecLogListItem?.date)}
                    </TableCell>
                    <TableCell>{RecLogListItem?.submittedBy}</TableCell>

                    <TableCell>
                      <RemoveRedEyeIcon
                        id="view-icon"
                        onClick={() => {
                          navigate(
                            `/fosterShare/${module}/${id}/?genericLog=${RecLogListItem.id}&formEngineId=${listData.id}`
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

export default GenericLogsList;
