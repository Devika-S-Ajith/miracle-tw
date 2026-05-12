import React, { useCallback, useEffect, useRef, useState } from "react";
import ReusableTrendTable from "../../../Dashboard/GovtDashboardOverview/Components/ReusableTrendTable";
import {
  Box,
  Stack,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import { useTranslation } from "react-i18next";
import {
  monthYearShort,
  toUTCEndOfDay,
  toUTCStartofDay,
  utcToDateFormatMonthDayYear,
} from "../../../../helpers/helperFunction";
import TextSnippetIcon from "@mui/icons-material/TextSnippet";
import AnimatedDownloadIcon from "../../../../assets/images/icons8-download.gif";
import { useNavigate, useParams } from "react-router";
import { ModalService } from "../../../../components/Modal";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { LoadingButton } from "@mui/lab";
import { PrintAsPDF } from "../../../../components/UserComponents/ReportGenerator";
import toast from "react-hot-toast";
import APIS from "../../../../common/hooks/UseApiCalls";
import FileUploadIcon from "@mui/icons-material/FileUpload";
import { useSearchParams } from "react-router-dom";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import BehaviorLogDetails from "./BehaviorLogDetails/BehaviorLogDetails";
import MedLogDetailsModal from "./MedLogDetails/MedLogDetailsModal";
import RecreationalLogDetails from "./RecreationalLogDetails/RecreationalLogDetails";

const ConsolidatedLogsList = ({ payloadId, showForChild = false, module }) => {
  const [tableData, setTableData] = useState({});
  const [downloadingId, setDownloadingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState(null);
  const [filterValues, setFilterValues] = useState({});
  const [appliedFiltersChipArray, setAppliedFiltersChipArray] = useState([]);

  const [exportLoading, setExportLoading] = useState(false);
  const [logs, setLogs] = useState([]);

  const [logTypes, setLogTypes] = useState([{ value: "", label: "All logs" }]);
  const [logType, setLogType] = useState("all");
  const { id } = useParams();

  const { t } = useTranslation(["common"]);
  const downloadFileRef = useRef({});
  const navigate = useNavigate();
  const [fromDate, setFromDate] = useState(null);
  const [toDate, setToDate] = useState(null);

  const getTableData = async (params = {}) => {
    setLoading(true);
    setApiError(null);
    const {
      sort = "childName",
      order = "desc",
      page = 1,
      rowCount = 10,
      search = "",
      filter = filterValues,
    } = params || {};
    const payload = {
      startDate: fromDate ? toUTCStartofDay(fromDate) : undefined,
      endDate: toDate ? toUTCEndOfDay(toDate) : undefined,
      pageNumber: page,
      rowCount: rowCount,
      globalSearchQuery: search,
    };

    if (showForChild) {
      payload.TWFamilyId = id;
    } else {
      payload.TWChildId = id;
    }

    if (logType && logType !== "all") {
      const matchedLogType = logTypes.find((type) => type.value == logType);
      payload.formEngineId = matchedLogType.id;
      if (
        matchedLogType?.formBehaviorType == "RECURSIVE" ||
        matchedLogType?.formBehaviorType == "RECURSIVE_ITEM"
      ) {
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
      setTableData({
        data: rows,
        pageCount: res?.data?.data?.pageCount,
        totalCount: res?.data?.data?.totalCount,
      });
      setApiError(null);
    } catch (error) {
      setApiError("Failed to fetch milestones data");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    getTableData();
  }, [fromDate, toDate, logType, payloadId, showForChild, id]);

  const [searchParams] = useSearchParams();

  const behavioralLogId = searchParams.get("behavioralLog");
  const recreationLogId = searchParams.get("recreationlog");
  const genericLogId = searchParams.get("genericLog");

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

  const columnDefinition = [
    {
      id: "formName",
      label: "Type",
      render: (row) => (
        <Box>
          <Box>{row.formName || "-"}</Box>
          {row.recursiveItemResponse?.medicationName && (
            <Box sx={{ fontSize: "0.85em", mt: 0.5 }}>
              {row.recursiveItemResponse.medicationName}
              {row.recursiveItemResponse?.strength ? `, ${row.recursiveItemResponse.strength}` : ""}
            </Box>
          )}
        </Box>
      ),
    },
    ...(showForChild
      ? [
          {
            id: "forChild",
            label: "For child",
            render: (row) => (
              <Box sx={{ wordBreak: "break-word", whiteSpace: "pre-line" }}>
                {(
                  (row.logDetails?.childDetail?.firstName || "") +
                  " " +
                  (row.logDetails?.childDetail?.lastName || "")
                ).trim() || "-"}
              </Box>
            ),
          },
        ]
      : []),
    {
      id: "formInputdate",
      label: "Occurrence date",
      render: (row) => {
        if (row.formBehaviorType === "RECURSIVE" && row.Type === "RECURSIVE") {
          return monthYearShort(row?.date);
        } else {
          return utcToDateFormatMonthDayYear(row?.formInputdate) || "-";
        }
      },
    },
    {
      id: "occurrenceTime",
      label: "Occurrence time",
      render: (row) => {
        if (row.formBehaviorType === "RECURSIVE" && row.Type === "RECURSIVE") {
          return "-";
        } else {
          return (
            (row?.formInputdate
              ? row.formInputdate
                  .split("T")[1]
                  ?.split(":")
                  .slice(0, 2)
                  .join(":")
              : "-") || "-"
          );
        }
      },
    },
    {
      id: "SubmittedUser",
      label: "Submitted by",
      render: (row) =>
        (row?.SubmittedUser?.firstName || "") +
          (row?.SubmittedUser?.lastName
            ? " " + row.SubmittedUser.lastName
            : "") || "-",
    },
    {
      id: "document",
      label: "Document",
      render: (row) => (
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
      align: "right",
      label: "",
      render: (row) => (
        <IconButton
          onClick={() => {
            if (row?.formBehaviorType === "RECURSIVE") {
              if (row?.Type === "RECURSIVE") {
                navigate(`/fostershare/medlogs/${row?.formResponseId}`, {
                  state: { module: module, id: row?.id },
                });
              } else {
                openMedLogDetailModal(row?.formResponseId, row?.recursiveItemId);
              }
            } else if (row?.logDetails?.formType === "BEHAVIOR_LOG") {
              openBehaviorLogDetailModal(row?.logDetails?.id);
            } else if (row?.logDetails?.formType === "RECREATION_LOG") {
              openRecLogDetailModal(row?.logDetails?.id);
            } else if (row?.logDetails?.formType === "GENERIC_CUSTOM_LOG") {
              openGenericLogDetailModal(row?.logDetails?.id, row?.formName);
            }
          }}
          aria-label={
            row?.formBehaviorType === "RECURSIVE" && row?.Type === "RECURSIVE"
              ? "Go to Med Logs"
              : "View"
          }
        >
          {row?.formBehaviorType === "RECURSIVE" ? (
            row?.Type === "RECURSIVE" ? (
              <ChevronRightIcon />
            ) : row?.recursiveItemResponse ? (
              <VisibilityIcon />
            ) : (
              <></>
            )
          ) : (
            <VisibilityIcon />
          )}
        </IconButton>
      ),
    },
  ];

  const openBehaviorLogDetailModal = (behavioralLogId) => {
    ModalService.open(
      ({ close }) => (
        <BehaviorLogDetails
          moduleName={module === "family" ? "families" : "children"}
          moduleId={id}
          behavioralLogId={behavioralLogId}
          close={close}
        />
      ),
      {
        height: "95%",
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
        height: "95%",
        width: "40%",
        hideModalFooter: true,
      },
    );
  };

  const openRecLogDetailModal = (recreationLogId) => {
    ModalService.open(
      ({ close }) => (
          <RecreationalLogDetails
            moduleName={module === "family" ? "families" : "children"}
            moduleId={id}
            recId={recreationLogId}
            close={close}
          />
      ),
      {
        width: "40%",
        height: "95%",
        hideModalFooter: true,
      },
    );
  };
  const openGenericLogDetailModal = (genericLogId, formName) => {
    ModalService.open(
      ({ close }) => (
        // <GenericLogDetails
        //   moduleName={module}
        //   moduleId={id}
        //   behavioralLogId={genericLogId}
        //   close={close}
        //   logName={formName}
        // />
        <></>
      ),
      {
        width: "40%",
        hideModalFooter: true,
      },
    );
  };

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
        // startDate: fromDate ? getDayStartISOString(fromDate) : "",
        // endDate: toDate ? getDayEndISOString(toDate) : "",
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

  const tableExtraButtons = (
    <>
      <Stack
        direction="row"
        spacing={1}
        justifyContent="flex-end"
        width={1}
        mr={2}
      >
        <FormControl size="small" sx={{ minWidth: 140 }}>
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
        <LoadingButton
          onClick={handleExport}
          loading={exportLoading}
          loadingPosition="start"
          startIcon={<FileUploadIcon />}
          color="primary"
          variant="outlined"
          disabled={isExportDisabled()}
        >
          Export
        </LoadingButton>
      </Stack>
    </>
  );
  return (
    <ReusableTrendTable
      columns={columnDefinition}
      tableData={tableData.data}
      loading={loading}
      skeltonRowcount={6}
      apiError={apiError}
      onReload={getTableData}
      tableExtraButtons={tableExtraButtons}
      t={t}
      enablePagination
      totalPageCount={tableData.pageCount}
      totalItems={tableData.totalCount || 0}
      cardSx={{ textTransform: "capitalize" }}
      defaultSortField={"childName"}
      defaultSortFieldOrder={"asc"}
      boldHeaders={false}
      rowCountOptions={[10, 20, 30, 50, 100]}
    />
  );
};

export default ConsolidatedLogsList;
