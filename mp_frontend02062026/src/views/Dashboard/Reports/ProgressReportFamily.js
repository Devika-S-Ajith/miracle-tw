import { React, useState, useEffect, useContext, useCallback } from "react";
import { useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import moment from "moment";
import toast from "react-hot-toast";
// import * as XLSX from 'xlsx';
import {
  Box,
  Grid,
  CircularProgress,
  Card,
  TextField,
  IconButton,
  InputAdornment,
  Table,
  Button,
} from "@mui/material";
import ClearIcon from "@mui/icons-material/Clear";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import SearchIcon from "../../../assets/icons/Search";
import APIS from "../../../common/hooks/UseApiCalls";
import CustomDialogModal from "../../Child/Components/CustomDialogModal";
import { ConvertToXLSX } from "../../../components/UserComponents/ReportGenerator";
import { DateFormatFromRegion } from "../../../constants";
import {
  ADMIN,
  ADMIN_CASEWORKER,
  SUPER_ADMIN,
  VIEW_ONLY,
} from "../../../helpers/constant";
import { CommonDataContext } from "../../../common/contexts/CommonDataContext";
import AutoCompleteDropdownToFilter from "../../../components/UserComponents/AutoCompleteDropdownToFilter";
import {
  getDate,
  getDistrictList,
  getSelectedCountryDetails,
  getStateList,
} from "../../../helpers/helperFunction";
import ReportHeader from "./Components/ReportHeader";
import ReportExportButton from "./Components/ReportExportButton";
import ReportClearFilterButton from "./Components/ReportClearFilterButton";
import ReportTableHeader from "./Components/ReportTableHeader";
import ReportTableData from "./Components/ReportTableData";
import ReportTableNoData from "./Components/ReportTableNoData";
import ReportPagination from "./Components/ReportPagination";

function ProgressReportFamily() {
  const location = useLocation();
  const { locationList, signedinUserRoleHT } = useContext(CommonDataContext);
  const fromDashboard = location.state && location.state.fromDashboard;
  let dashboardFilter = localStorage.getItem("dashboardFilters");
  let initialData = fromDashboard === true ? JSON.parse(dashboardFilter) : null;
  const [startDate, setStartDate] = useState(
    initialData === null ? null : initialData.startDate
  );
  const [endDate, setEndDate] = useState(
    initialData === null ? null : initialData.endDate
  );

  useEffect(() => { 
    if (location?.state?.assessmentId) {
      handleViewProgressReport(location.state.assessmentId);
    }
  }, [location?.state?.assessmentId]);

  const [pageCount, setPageCount] = useState(1);
  const [progressList, setProgresstList] = useState();
  const [progressReportModal, setProgressReportModal] = useState(false);
  const [progressReportData, setProgressReportData] = useState();
  const [assessmentIdForReport, setassessmentIdForReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const { t } = useTranslation(["common"]);
  const [isExportDisabled, setIsExportDisabled] = useState(true);
  const [keyVal, setKeyVal] = useState(false);
  const [query, setQuery] = useState("");
  const [isInitialRender, setIsInitialRender] = useState(true);
  let tableHead = [
    { name: t("common:common.Name") },
    { name: t("common:common.Case Worker") },
    { name: t("common:common.Assessment Submitted on") },
    { name: t("common:common.Progress Report Submission Date") },
    { name: t("common:common.Actions") },
  ];

  const tableBody = [
    {
      key: "familyName",
      render: (item) => `${item.familyName}`,
    },
    {
      key: "caseWorkerName",
      render: (item) =>
        `${item.caseWorkerfirstName} ${item.caseworkerlastName}`,
    },
    {
      key: "assessmentCompletionDate",
      render: (item) =>
        item.assessmentCompletionDate
          ? utcToLocal(item.assessmentCompletionDate)
          : "--",
    },
    {
      key: "followUpCompletedOn",
      render: (item) =>
        item.followUpCompletedOn ? utcToLocal(item.followUpCompletedOn) : "--",
    },
    {
      key: "actions",
      render: (item) => (
        <Button
          disabled={item.followUpStatus === "Completed" ? false : true}
          style={{ borderRadius: 4 }}
          variant="contained"
          size="small"
          onClick={() => handleViewProgressReport(item.TWAssessmentId)}
        >
          View
        </Button>
      ),
    },
  ];

  const [countryFilter, setCountryFilter] = useState(
    initialData === null
      ? localStorage.getItem("userRegion")
      : initialData.countryFilter
  );
  const [stateFilter, setStateFilter] = useState(
    initialData === null ? "" : initialData.stateFilter
  );
  const [districtFilter, setDistrictFilter] = useState(
    initialData === null ? "" : initialData.districtFilter
  );
  const [rowCount, setRowCount] = useState(10);

  const getProgressList = useCallback(async (payload) => {
  try {
    setLoading(true);
    // Add default values to payload
    const requestPayload = {
      ...payload,
      webStatus: true,
      type: "FAMILY"
    };
    
    const resp = await APIS.ProgressReportListForChild(requestPayload);
    if (resp?.data?.data) {
      setProgresstList(resp.data.data.rows || []);
      setPageCount(resp.data.data.count || 0);
      setIsExportDisabled(!(resp.data.data.rows?.length > 0));
    }
  } catch (err) {
    console.error("Error fetching progress list:", err);
  } finally {
    setLoading(false);
  }
}, []);

const getProgressReportData = useCallback(async (assessmentId) => {
  try {
    setLoading(true);
    const payload = { TWAssessmentId: assessmentId };
    const data = await APIS.viewFollowUpProgress(payload);
    
    if (data?.data?.data) {
      setProgressReportData(data.data.data);
      setProgressReportModal(true);
    }
  } catch (err) {
    console.error("Error fetching progress report data:", err);
  } finally {
    setLoading(false);
  }
}, []);

const handleViewProgressReport = (assessmentId) => {
  setassessmentIdForReport(assessmentId);
  getProgressReportData(assessmentId);
};

const formatDateRange = () => {
  if (!startDate || !endDate) return { startdateformat: undefined, enddateformat: undefined };
  
  return {
      startdateformat : getDate(startDate),
      enddateformat : getDate(endDate)
  };
};

const buildPayload = (pageNum = page, limitCount = rowCount) => {
  const { startdateformat, enddateformat } = formatDateRange();
  
  return {
    limit: limitCount,
    start: pageNum,
    familyName: query || "",
    fromDate: startdateformat || (initialData?.startDate || ""),
    toDate: enddateformat || (initialData?.endDate || ""),
    TWCountryId: countryFilter || "",
    stateFilter: stateFilter || "",
    districtFilter: districtFilter || "",
    type:"FAMILY",
  };
};

const ClearFilters = () => {
  setStartDate(null);
  setEndDate(null);
  setQuery("");
  setKeyVal(prev => !prev);
  setCountryFilter(localStorage.getItem("userRegion") || "");
  setDistrictFilter("");
  setStateFilter("");
  
  const payload = {
    limit: 10,
    start: 1,
    familyName: "",
    fromDate: initialData?.startDate || "",
    toDate: initialData?.endDate || "",
    TWCountryId: localStorage.getItem("userRegion") || "",
    stateFilter: "",
    districtFilter: "",
    type:"FAMILY",
  };
  
  getProgressList(payload);
  setPage(1);
  setRowCount(10);
};

const ClearSearchQuery = () => {
  setQuery("");
};

const handleRowCountChange = (event) => {
  const newRowCount = parseInt(event.target.value, 10);
  setRowCount(newRowCount);
  getProgressList(buildPayload(1, newRowCount));
  setPage(1);
};

const handlePageChange = (event, value) => {
  setPage(value);
  getProgressList(buildPayload(value));
};

const handleQueryChange = (event) => {
  setQuery(event.target.value);
};

const handleCountryChange = (value) => {
  setCountryFilter(value);
  setStateFilter("");
  setDistrictFilter("");
  setKeyVal(prev => !prev);
  setPage(1);
  
  getProgressList(buildPayload(1));
};

const handleStateFilter = (value) => {
  setStateFilter(value);
  setPage(1);
  getProgressList(buildPayload(1));
};

const handleDistrictFilter = (value) => {
  setDistrictFilter(value);
  setPage(1);
  getProgressList(buildPayload(1));
};

const handleFilter = () => {
  setPage(1);
  getProgressList(buildPayload(1));
};

const utcToLocal = (utcDateTime) => {
  return moment.utc(utcDateTime).local().format("DD/MM/YYYY");
};

useEffect(() => {
  document.title = "Reports | Progress Report Family | ThriveWell";
  
  const payload = buildPayload(1, 10);
  getProgressList(payload);
}, []);

// Debounced filter for date and query changes
useEffect(() => {
  if (!isInitialRender) {
    const timeoutId = setTimeout(() => {
      handleFilter();
    }, 500); // 500ms debounce
    
    return () => clearTimeout(timeoutId);
  } else {
    setIsInitialRender(false);
  }
}, [startDate, endDate, query]);

  const handleExport = useCallback(async () => {
    try {
      let startdateformat;
      let enddateformat;
      if (startDate && endDate) {
        startdateformat = getDate(startDate);
        enddateformat = getDate(endDate);
      }
      let payload = {
        limit: 500,
        start: 0,
        familyName: query,
        fromDate: startdateformat,
        toDate: enddateformat,
        type: "list",
        listType:"FAMILY",
        TWCountryId: countryFilter || "",
        stateFilter: stateFilter || "",
        districtFilter: districtFilter || "",
      };
      const data = await APIS.generarateProgressReportList(payload);
      if (data?.data) {
        ConvertToXLSX(data?.data, "Progress Report Family List");
      } else if (data.data.Message === "Unauthorized") {
        toast.error(t("common:common.Unauthorized"));
      }
    } catch (err) {
      console.error(err);
    }
  });

  return (
    <Box
      sx={{
        backgroundColor: "background.default",
        minHeight: "100%",
        pt: 2,
      }}
    >
      <ReportHeader
        reportHeaderText={t("common:reports.Progress reports (families)")}
      />
      <ReportExportButton
        handleExport={handleExport}
        isExportDisabled={isExportDisabled}
      />
        <Grid container width={1}>
          <Grid item xs={12}>
            <Card sx={{ mr: 1, p: 3 }}>
              <Box sx={{ minWidth: 700 }}>
                {loading && (
                  <CircularProgress
                    sx={{
                      zIndex: 1000,
                      position: "fixed",
                      top: "50%", // Adjusted to 50% to center vertically
                      left: "50%", // Adjusted to 50% to center horizontally
                      transform: "translate(-50%, -50%)", // Centering trick
                    }}
                    color="primary"
                  />
                )}
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <Box display="flex" flexWrap="wrap" gap={3}>
                    <TextField
                      // fullWidth
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <SearchIcon fontSize="small" />
                          </InputAdornment>
                        ),
                        endAdornment: query.length > 0 && (
                          <IconButton
                            color="inherit"
                            onClick={() => ClearSearchQuery()}
                          >
                            <ClearIcon />
                          </IconButton>
                        ),
                      }}
                      onChange={handleQueryChange}
                      placeholder={t("common:family.Search By Family Name")}
                      value={query}
                      variant="outlined"
                    />

                    <DatePicker
                      label={t("common:common.StartDate")}
                      value={startDate}
                      onChange={(newValue) => {
                        setStartDate(newValue);
                      }}
                      format={DateFormatFromRegion()}
                      maxDate={endDate}
                      sx={{ minWidth: 200 }}
                    />

                    <DatePicker
                      label={t("common:common.EndDate")}
                      value={endDate}
                      onChange={(newValue) => {
                        setEndDate(newValue);
                      }}
                      format={DateFormatFromRegion()}
                      //maxDate={endDate}
                      minDate={startDate}
                      sx={{ minWidth: 200 }}
                    />

                    {[SUPER_ADMIN].includes(
                      signedinUserRoleHT
                    ) && (
                      <Box mt={-2}>
                        <TextField
                          // fullWidth
                          id="country"
                          name="country"
                          accessKey="countryName"
                          getValueFunction={(value) => {
                            handleCountryChange(value);
                          }}
                          component={AutoCompleteDropdownToFilter}
                          value={countryFilter}
                          key={keyVal}
                          defaultVal={countryFilter}
                          label="country"
                          options={locationList.filter((locItem) =>
                            localStorage.getItem("userRegion") === "1"
                              ? locItem.id === "1"  // If userRegion is "1", show only item with id "1"
                              : locItem.id !== "1"  // Otherwise, show items with id "2" and "3" (exclude "1")
                          )}
                          textFieldProps={{
                            // fullWidth: true,

                            margin: "normal",
                            variant: "outlined",
                            label: t("common:common.Country"),
                          }}
                          sx={{ minWidth: 200 }}
                        />
                      </Box>
                    )}

                    <Box mt={-2}>
                      <TextField
                        fullWidth
                        name="state"
                        id="state"
                        accessKey="stateName"
                        getValueFunction={(value) => {
                          handleStateFilter(value);
                        }}
                        component={AutoCompleteDropdownToFilter}
                        value={stateFilter}
                        required={true}
                        key={keyVal}
                        defaultVal={stateFilter}
                        label="state"
                        options={
                          getStateList(locationList, countryFilter) || []
                        }
                        textFieldProps={{
                          fullWidth: true,
                          margin: "normal",
                          variant: "outlined",
                          label: t("common:common.State"),
                        }}
                        sx={{ minWidth: 200 }}
                      />
                    </Box>

                    {countryFilter &&
                      getSelectedCountryDetails(
                        locationList,
                        countryFilter
                      )?.districtRequired && (
                        <Box mt={-2}>
                          <TextField
                            fullWidth
                            id="district"
                            name="district"
                            accessKey="districtName"
                            value={districtFilter}
                            key={stateFilter}
                            defaultVal={districtFilter}
                            getValueFunction={(value) => {
                              handleDistrictFilter(value);
                            }}
                            component={AutoCompleteDropdownToFilter}
                            required={false}
                            label="district"
                            options={
                              getDistrictList(
                                locationList,
                                countryFilter,
                                stateFilter
                              ) || []
                            }
                            textFieldProps={{
                              fullWidth: true,
                              margin: "normal",
                              variant: "outlined",
                              label: t("common:common.Region"),
                            }}
                            sx={{ minWidth: 200 }}
                          />
                        </Box>
                      )}
                    <ReportClearFilterButton clearFilters={ClearFilters} />
                  </Box>
                </LocalizationProvider>
                {/* </Grid> */}
                <Table>
                  <ReportTableHeader tableHead={tableHead} />
                  {progressList &&
                    progressList.map((ProgressListItem, index) => {
                      return (
                        <ReportTableData
                          key={index}
                          item={ProgressListItem}
                          columns={tableBody}
                        />
                      );
                    })}
                </Table>
                {progressList && progressList.length === 0 && (
                  <ReportTableNoData />
                )}
              </Box>
              <ReportPagination
                rowCount={rowCount}
                page={page}
                pageCount={pageCount}
                handleRowCountChange={handleRowCountChange}
                handlePageChange={handlePageChange}
              />
            </Card>
          </Grid>
        </Grid>
        <CustomDialogModal
          progressReportData={progressReportData}
          assessmentIdForReport={assessmentIdForReport}
          setProgressReportModal={setProgressReportModal}
          progressReportModal={progressReportModal}
        />
    </Box>
  );
}

export default ProgressReportFamily;
