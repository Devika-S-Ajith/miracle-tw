import React, { useEffect, useRef, useState, useCallback } from "react";
import TextSnippetIcon from "@mui/icons-material/TextSnippet";
import AnimatedDownloadIcon from "../../../../assets/images/icons8-download.gif";
import TableComponent from "../../../../components/TableComponent/TableComponent";
import {
  Box,
  Card,
  Grid,
  Typography,
  IconButton,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
} from "@mui/material";
import { useNavigate, useParams } from "react-router";
import toast from "react-hot-toast";
import VisibilityIcon from "@mui/icons-material/Visibility";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import FileUploadIcon from "@mui/icons-material/FileUpload";
import { useTranslation } from "react-i18next";
import APIS from "../../../../common/hooks/UseApiCalls";
import dayjs from "dayjs";
import {
  formatDate,
  toUTCStartofDay,
  toUTCEndOfDay,
  monthYearShort,
  utcToDateFormatMonthDayYear,
} from "../../../../helpers/helperFunction";
import BehaviorLogDetails from "../../Components/BehaviorLogDetails";
import { useSearchParams } from "react-router-dom";
import { ModalService } from "../../../../components/Modal";
import RecreationalLogDetails from "../../Components/RecreationalLogDetails/RecreationalLogDetails";
import GenericLogDetails from "../../Components/GenericLogDetails";
import { PrintAsPDF } from "../../../../components/UserComponents/ReportGenerator";
import { LoadingButton } from "@mui/lab";
import { MonthDayYearFormatter } from "../../../../constants";
import MedLogDetailsModal from "../../Components/MedLogDetails/MedLogDetailsModal";

const ChildCombinedLogsList = ({ payloadId, showForChild = false, module }) => {
  const { t } = useTranslation(["common"]);
  const gridRef = useRef(null);
  const navigate = useNavigate();
  const { id } = useParams();

  const [searchParams] = useSearchParams();

  // Filters and state
  const [logType, setLogType] = useState("all");
  const [logTypes, setLogTypes] = useState([{ value: "", label: "All logs" }]);
  const [fromDate, setFromDate] = useState(null);
  const [toDate, setToDate] = useState(null);
  const [logs, setLogs] = useState([]);
  // const [pageCount, setPageCount] = useState(1);
  // const [totalCount, setTotalCount] = useState(0);
  const [downloadingId, setDownloadingId] = useState(null);
  const [exportLoading, setExportLoading] = useState(false);
  const [loading, setLoading] = useState(false);

  const behavioralLogId = searchParams.get("behavioralLog");
  const recreationLogId = searchParams.get("recreationlog");
  const genericLogId = searchParams.get("genericLog");

  const downloadFileRef = useRef({});

  // Fetch log types from API on mount
  useEffect(() => {
    const fetchLogTypes = async () => {
      try {
        const res = await APIS.ListLogTypes();
        const apiTypes = Array.isArray(res?.data?.data.forms)
          ? res.data.data.forms.map((type, index) => ({
              ...type,
              value: index + 1 || "",
              label: type.formName || "",
            }))
          : [];
        setLogTypes([{ value: "all", label: "All logs" }, ...apiTypes]);
      } catch (err) {
        console.error("Failed to fetch log types:", err);
        setLogTypes([{ value: "all", label: "All logs" }]);
      }
    };
    fetchLogTypes();
  }, []);

  // Deep-link support: open modals if query param is present
  useEffect(() => {
    if (behavioralLogId) {
      openBehaviorLogDetailModal(behavioralLogId);
    }
  }, [behavioralLogId]);

  useEffect(() => {
    if (recreationLogId) {
      openRecLogDetailModal(recreationLogId);
    }
  }, [recreationLogId]);

  useEffect(() => {
    if (genericLogId) {
      const log = logs.find((l) => String(l.id) === String(genericLogId));
      const formName = log ? log.formName : "";
      openGenericLogDetailModal(genericLogId, formName);
    }
  }, [genericLogId, logs]);

  // Table columns
  const columns = [
    {
      field: "formName",
      headerName: "Type",
      minWidth: 250,
      flex: 1,
      sortable: false,
    },
    ...(showForChild
      ? [
          {
            field: "forChild",
            headerName: "For child",
            minWidth: 250,
            flex: 1,
            renderCell: ({ row }) => (
              <Box sx={{ wordBreak: 'break-word', whiteSpace: 'pre-line' }}>
                {(
                  (row.logDetails?.childDetail?.firstName || "") +
                  " " +
                  (row.logDetails?.childDetail?.lastName || "")
                ).trim() || "-"}
              </Box>
            ),
            sortable: false,
          },
        ]
      : []),
    {
      field: "formInputdate",
      headerName: "Occurrence date",
      minWidth: 150,
      sortable: false,
      renderCell: ({ row }) => {
        if (row.formBehaviorType == "RECURSIVE" && row.Type === "RECURSIVE") {
          return monthYearShort(row?.date);
        } else {
          return utcToDateFormatMonthDayYear(row?.formInputdate) || "-";
        }
      },
    },
    {
      field: "occurrenceTime",
      headerName: "Occurrence time",
      minWidth: 150,
      sortable: false,
      renderCell: ({ row }) => {
        if (row.formBehaviorType == "RECURSIVE" && row.Type === "RECURSIVE") {
          return "-";
        } else {
          return formatDate(row?.formInputdate)?.split(",")[0] || "-";
        }
      }
    },
    {
      field: "SubmittedUser",
      headerName: "Submitted by",
      minWidth: 250,
      flex: 1,
      sortable: false,
    },
    {
      field: "document",
      headerName: "Document",
      minWidth: 100,
      flex: 1,
      sortable: false,
      renderCell: ({ row }) => (
        <>
          {row.documentLink &&
            row.formBehaviorType === "RECURSIVE" &&
            row.Type === "RECURSIVE" &&
            downloadingId !== row.id && (
              <TextSnippetIcon
                sx={{ cursor: "pointer" }}
                fontSize="small"
                onClick={() => {
                  setDownloadingId(row.id);
                  setTimeout(() => {
                    downloadFileRef.current[row.id]?.click();
                    setDownloadingId(null);
                  }, 100);
                }}
              />
            )}
          {row.documentLink &&
            row.formBehaviorType === "RECURSIVE" &&
            row.Type === "RECURSIVE" && (
              <a
                href={row.documentLink}
                download
                className="hidden"
                ref={(el) => (downloadFileRef.current[row.id] = el)}
                tabIndex={-1}
                aria-hidden="true"
              />
            )}
          {downloadingId === row.id &&
            row.formBehaviorType === "RECURSIVE" &&
            row.Type === "RECURSIVE" && (
              <img
                src={AnimatedDownloadIcon}
                alt="Downloading..."
                style={{
                  width: "18px",
                  height: "18px",
                  objectFit: "contain",
                  verticalAlign: "middle",
                }}
              />
            )}
        </>
      ),
    },
    {
      sortable: false,
      headerAlign: "right",
      align: "right",
      flex: 0,
      renderCell: ({ row }) => (
        <IconButton
          onClick={() => {
            if (row.formBehaviorType === "RECURSIVE") {
              if (row.Type === "RECURSIVE") {
                navigate(`/fostershare/medlogs/${row.formResponseId}`, {
                  state: { module: module, id: id },
                });
              } else {
                openMedLogDetailModal(row.formResponseId, row.recursiveItemId);
              }
            } else if (row.logDetails.formType === "BEHAVIOR_LOG") {
              openBehaviorLogDetailModal(row.logDetails.id);
            } else if (row.logDetails.formType === "RECREATION_LOG") {
              openRecLogDetailModal(row.logDetails.id);
            } else if (row.logDetails.formType === "GENERIC_CUSTOM_LOG") {
              openGenericLogDetailModal(row.logDetails.id, row.formName);
            }
          }}
          aria-label={
            row.formBehaviorType === "RECURSIVE" && row.Type === "RECURSIVE"
              ? "Go to Med Logs"
              : "View"
          }
        >
          {row.formBehaviorType === "RECURSIVE" ? (
            row.Type === "RECURSIVE" ? (
              <ChevronRightIcon />
            ) : (
              row?.recursiveItemResponse ? <VisibilityIcon /> : <></>
            )
          ) : (
            <VisibilityIcon />
          )}
        </IconButton>
      ),
      width: 60,
    },
  ];

  const handleExport = useCallback(async () => {
    try {
      setExportLoading(true);
      const matchedLogType = logTypes.find((type) => type.value == logType);
      let payload = {
        formEngineId: matchedLogType?.id,
        formType: matchedLogType?.formType,
        name: matchedLogType?.formName,
        TWAccountId: localStorage.getItem("orgId"),
        rowCount: 1000,
        pageNumber: 1,
        startDate: fromDate ? toUTCStartofDay(fromDate) : "",
        endDate: toDate ? toUTCEndOfDay(toDate) : "",
        orderByField: [["date", "DESC"]],
      };
      if (module === "children") {
        payload.childId = id;
      } else if (module === "families") {
        payload.familyId = id;
      }
      payload.timezone = "UTC";
      const data = await APIS.ExportLogPdf(payload);
      if (data && data?.data) {
        PrintAsPDF(data?.data, matchedLogType?.formName);
        setExportLoading(false);
      } else if (data.data.Message === "Unauthorized") {
        toast.error(t("common:common.Unauthorized"));
        setExportLoading(false);
      } else {
        console.log("issue fetching data to export");
        toast.error(
          "Error while fetching data to export,Please try again in some time",
        );
      }
    } catch (err) {
      console.error(err);
      setExportLoading(false);
    }
  });

  // Modal openers
  const openBehaviorLogDetailModal = (behavioralLogId) => {
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
      },
    );
  };

  const openRecLogDetailModal = (recreationLogId) => {
    ModalService.open(
      ({ close }) => (
        <RecreationalLogDetails
          moduleName={module}
          moduleId={id}
          recId={recreationLogId}
          close={close}
        />
      ),
      {
        width: "40%",
        hideModalFooter: true,
      },
    );
  };

  const openGenericLogDetailModal = (genericLogId, formName) => {
    ModalService.open(
      ({ close }) => (
        <GenericLogDetails
          moduleName={module}
          moduleId={id}
          behavioralLogId={genericLogId}
          close={close}
          logName={formName}
        />
      ),
      {
        width: "40%",
        hideModalFooter: true,
      },
    );
  };

  const openMedLogDetailModal = (formResponseId, recursiveItemId) => {
    ModalService.open(
      ({ close }) => (
        <MedLogDetailsModal
          close={close}
          formResponseId={formResponseId}
          recursiveItemId={recursiveItemId}
          refetchData={true}
        />
      ),
      {
        width: "40%",
        hideModalFooter: true,
      },
    );
  };

  // Data loader for TableComponent
  const getLogsList = useCallback(
    async ({
      rowCount = 10,
      pageNumber = 1,
      globalSearchQuery = "",
      filter = {},
      orderByField = "",
    }) => {
      setLoading(true);
      const payload = {
        startDate: fromDate
          ? toUTCStartofDay(fromDate)
          : undefined,
        endDate: toDate ? toUTCEndOfDay(toDate) : undefined,
        pageNumber: String(pageNumber),
        rowCount: rowCount,
        globalSearchQuery: globalSearchQuery,
      };
      if (showForChild) {
        payload.TWFamilyId = id;
      } else {
        payload.TWChildId = id;
      }
      if (logType && logType !== "all") {
        const matchedLogType = logTypes.find((type) => type.value == logType);
        payload.formEngineId = matchedLogType.id;
        if(matchedLogType?.formBehaviorType == 'RECURSIVE' || matchedLogType?.formBehaviorType == 'RECURSIVE_ITEM') {
          payload.formBehaviorType = matchedLogType?.formBehaviorType;
        }
      }
      try {
        const res = await APIS.ListAllLogs(payload);
        const forms = res?.data?.data?.logs || [];
        const rows = forms.map((form) => ({
          ...form,
          id: form.id || form.formId || Math.random().toString(36).substr(2, 9),
        }));
        setLogs(rows);
        // setPageCount(res?.data?.data?.pageCount || 1);
        // setTotalCount(res?.data?.data?.totalCount || rows.length);
        setLoading(false);
        return {
          items: rows,
          meta: {
            pageCount: res?.data?.data?.pageCount || 1,
            totalCount: res?.data?.data?.totalCount || rows.length,
          },
        };
      } catch (err) {
        console.error("Error fetching logs:", err);
        setLoading(false);
        setLogs([]);
        return {
          items: [],
          meta: { pageCount: 1, totalCount: 0 },
        };
      }
    },
    [fromDate, toDate, logType, payloadId, showForChild, id],
  );

  // Utility to check if export should be disabled
  const isExportDisabled = () => {
    const selectedType = logTypes.find((type) => type.value === logType);
    return (
      logType === "all" ||
      logs.length === 0 ||
      loading ||
      selectedType?.formType === "MED_LOG"
    );
  };

  // Custom toolbar
  const Toolbar = (
    <Grid container alignItems="center" spacing={2} sx={{ mb: -2 }}>
      <Grid item xs={12} md={2}>
        <Typography variant="h6" fontWeight={600}>
          Logs
        </Typography>
      </Grid>
      <Grid item xs={12} md={10}>
        <Box
          display="flex"
          justifyContent="flex-end"
          alignItems="center"
          gap={2}
        >
          <Grid
            container
            spacing={2}
            justifyContent="flex-end"
            alignItems="center"
          >
            <Grid item xs={12} sm={6} md={3} lg={2.5}>
              <FormControl size="small" sx={{ minWidth: 140, width: "100%" }}>
                <InputLabel id="log-type-label">Log Type</InputLabel>
                <Select
                  labelId="log-type-label"
                  value={logType}
                  label="Log Type"
                  onChange={(e) => setLogType(e.target.value)}
                >
                  {logTypes.map((type) => (
                    <MenuItem key={type.value} value={type.value}>
                      {type.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={3} lg={2.5}>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DatePicker
                  label="From"
                  value={fromDate}
                  onChange={(newValue) => setFromDate(newValue)}
                  maxDate={toDate}
                  slotProps={{
                    textField: {
                      size: "small",
                      InputLabelProps: { sx: { top: 0 } },
                      sx: {
                        minWidth: 140,
                        width: "100%",
                        "& .MuiOutlinedInput-root": {
                          borderRadius: "4px",
                          height: 40,
                        },
                      },
                    },
                    field: { clearable: true },
                  }}
                />
              </LocalizationProvider>
            </Grid>
            <Grid item xs={12} sm={6} md={3} lg={2.5}>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DatePicker
                  label="To"
                  value={toDate}
                  onChange={(newValue) => setToDate(newValue)}
                  minDate={fromDate}
                  slotProps={{
                    textField: {
                      size: "small",
                      InputLabelProps: { sx: { top: 0 } },
                      sx: {
                        minWidth: 140,
                        width: "100%",
                        "& .MuiOutlinedInput-root": {
                          borderRadius: "4px",
                          height: 40,
                        },
                      },
                    },
                    field: { clearable: true },
                  }}
                />
              </LocalizationProvider>
            </Grid>
            <Grid
              item
              xs={12}
              sm={6}
              md={3}
              lg={1.5}
              display="flex"
              alignItems="center"
              justifyContent="flex-end"
              sx={{ pl: { xs: 0, sm: 0, md: 0, lg: 0 } }}
            >
              <LoadingButton
                onClick={handleExport}
                loading={exportLoading}
                loadingPosition="start"
                startIcon={<FileUploadIcon />}
                color="primary"
                variant="outlined"
                disabled={isExportDisabled()}
                sx={{ minWidth: 100, width: "100%" }}
              >
                Export
              </LoadingButton>
            </Grid>
          </Grid>
        </Box>
      </Grid>
    </Grid>
  );

  return (
    <Box>
      <Card sx={{ borderRadius: 2 / 8 }}>
        <Box p={2}>
          {Toolbar}
          <TableComponent
            showSlno={false}
            id="combined-logs-table"
            columns={columns}
            hideToolbar={true}
            dataLoader={getLogsList}
            parentRef={gridRef}
            defaultSorting={[
              {
                field: "occurrenceDate",
                sort: "desc",
              },
            ]}
            key={`${logType}-${fromDate && dayjs(fromDate).isValid() ? dayjs(fromDate).toISOString() : ""}-${toDate && dayjs(toDate).isValid() ? dayjs(toDate).toISOString() : ""}`}
          />
        </Box>
      </Card>
    </Box>
  );
};

export default ChildCombinedLogsList;
