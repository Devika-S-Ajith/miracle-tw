import { React, useState, useEffect, useContext, useCallback } from "react";
import { useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import {
  Box,
  Grid,
  Typography,
  CircularProgress,
  Table,
  Card,
  Button,
  TextField,
} from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import LaunchIcon from "@mui/icons-material/Launch";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import dayjs from "dayjs";
import Scrollbar from "../Components/ScrollBar";
import APIS from "../../../common/hooks/UseApiCalls";
import { CommonDataContext } from "../../../common/contexts/CommonDataContext";
import AutoCompleteDropdownToFilter from "../../../components/UserComponents/AutoCompleteDropdownToFilter";
import {
  getDate,
  getDistrictList,
  getSelectedCountryDetails,
  getStateList,
} from "../../../helpers/helperFunction";
import {
  ADMIN,
  ADMIN_CASEWORKER,
  SUPER_ADMIN,
  VIEW_ONLY,
} from "../../../helpers/constant";
import { DateFormatFromRegion } from "../../../constants";
import ReportHeader from "./Components/ReportHeader";
// import ReportExportButton from "./Components/ReportExportButton";
import ReportClearFilterButton from "./Components/ReportClearFilterButton";
import ReportTableHeader from "./Components/ReportTableHeader";
import ReportTableData from "./Components/ReportTableData";
import ReportTableNoData from "./Components/ReportTableNoData";
import ReportPagination from "./Components/ReportPagination";

function ReportsChildrenOverdue() {
  const location = useLocation();
  const fromDashboard = location.state && location.state.fromDashboard;
  let dashboardFilter = localStorage.getItem("dashboardFilters");
  let initialData = fromDashboard === true ? JSON.parse(dashboardFilter) : null;
  const languageList = JSON.parse(localStorage.getItem("languageList"));
  const currentLanguage = localStorage.getItem("language");
  const [startDate, setStartDate] = useState(
    initialData === null ? null : initialData.startDate
  );
  const [endDate, setEndDate] = useState(
    initialData === null ? null : initialData.endDate
  );
  const [reportData, setReportData] = useState();
  const { locationList, signedinUserRoleHT } = useContext(CommonDataContext);
  const [pageCount, setPageCount] = useState(1);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const { t } = useTranslation(["common"]);
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
  const [modalFlag, setModalFlag] = useState(false);
  const [interventionData, setInterventionData] = useState([]);
  const [payloadData, setPayloadData] = useState({});
  const [isExportDisabled, setIsExportDisabled] = useState(true);
  const [keyVal, setKeyVal] = useState(false);
  const ClearFilters = () => {
    setStartDate(null);
    setEndDate(null);
    setDistrictFilter("");
    setStateFilter("");
    setCountryFilter(localStorage.getItem("userRegion"));
    setKeyVal(!keyVal);
    getChildrenOverdueApi(null);
  };

  const [rowCount, setRowCount] = useState(10);

  const handleRowCountChange = (event) => {
    setRowCount(event.target.value);
    getChildrenOverdueApi({
      pageNumber: page,
      districtFilter: districtFilter,
      rowCount: event.target.value,
      stateFilter: stateFilter,
      startDate: startDate,
      endDate: endDate,
      TWCountryId: countryFilter,
    });
  };

  const handlePageChange = (event, value) => {
    getChildrenOverdueApi({
      pageNumber: value,
      districtFilter: districtFilter,
      rowCount: rowCount,
      stateFilter: stateFilter,
      startDate: startDate,
      endDate: endDate,
      TWCountryId: countryFilter,
    });
    setPage(value);
  };

  const handleStateFilter = (value) => {
    let payload = {
      districtFilter: "",
      pageNumber: "1",
      rowCount: rowCount,
      stateFilter: value,
      startDate: startDate,
      endDate: endDate,
      TWCountryId: countryFilter,
    };
    getChildrenOverdueApi(payload);
    setStateFilter(value);
    setPage(1);
  };

  const handleDistrictFilter = (value) => {
    let payload = {
      districtFilter: value,
      pageNumber: "1",
      rowCount: rowCount,
      stateFilter: stateFilter,
      startDate: startDate,
      endDate: endDate,
      TWCountryId: countryFilter,
    };
    getChildrenOverdueApi(payload);
    setDistrictFilter(value);
    setPage(1);
  };

  const handleCountryChange = (value) => {
    setCountryFilter(value);
    setStateFilter("");
    setDistrictFilter("");
    setKeyVal(!keyVal);
    let payload = {
      districtFilter: "",
      pageNumber: "1",
      rowCount: rowCount,
      stateFilter: "",
      startDate: startDate,
      endDate: endDate,
      TWCountryId: value,
    };
    getChildrenOverdueApi(payload);
    setPage(1);
  };

  const handleDateFilter = () => {
    let startdateformat;
    let enddateformat;
    if (startDate && endDate) {
      startdateformat = getDate(startDate);
      enddateformat = getDate(endDate);
    }
    let payload = {
      rowCount: rowCount,
      pageNumber: "1",
      districtFilter: districtFilter,
      stateFilter: stateFilter,
      startDate: startdateformat,
      endDate: enddateformat,
      TWCountryId: countryFilter,
    };
    getChildrenOverdueApi(payload);
  };

  let tableHead = [
    { name: t("common:common.Type") },
    { name: t("common:common.Name") },
    { name: t("common:common.Case Worker") },
    { name: t("common:common.Address") },
    { name: t("common:common.Date of Visit") },
    { name: t("common:common.Last Thrive Scale Score") },
    { name: t("common:assessment.Intervention Details") },
  ];

  const tableBody = [
    { key: "type", render: (item) => item.type },
    { key: "name", render: (item) => item.name },
    { key: "caseworker", render: (item) => item.caseworker },
    { key: "address", render: (item) => item.address },
    { key: "dateOfVisit", render: (item) => item.dateOfVisit },
    {
      key: "lastThriveScaleScore",
      render: (item) => item.lastThriveScaleScore,
    },
    {
      key: "interventionDetails",
      render: (item) => (
        <LaunchIcon
          fontSize="small"
          onClick={(e) => getInterventionDetails(e, item)}
        />
      ),
    },
  ];

  const defaultPayload = {
    rowCount: rowCount,
    pageNumber: "1",
    stateFilter: "",
    districtFilter: "",
    startDate: "",
    endDate: "",
    TWCountryId: localStorage.getItem("userRegion"),
  };

  let payloadAddon = {
    rowCount: rowCount,
    pageNumber: "1",
    stateFilter: "",
    districtFilter: "",
    startDate: "",
    endDate: "",
    TWCountryId: localStorage.getItem("userRegion"),
  };

  const getLanguageId = () => {
    const langId =
      languageList.length &&
      languageList.find((item) => item.languageCode == currentLanguage)?.id;
    return langId == 1 ? "" : langId;
  };

  const getInterventionDetails = useCallback(async (event, value) => {
    event.preventDefault();
    try {
      setLoading(true);
      let payload = {
        assessment_id: value["assessmentId"],
        language_id:
          localStorage.getItem("language") === "en" ? "" : getLanguageId(),
      };
      //payload.TWCountryId = localStorage.getItem('userRegion')
      await APIS.InterventionDetails(payload).then((resp) => {
        setInterventionData(resp?.data?.message?.data || []);
        setModalFlag(true);
        setLoading(false);
      });
    } catch (err) {
      setLoading(false);
    }
  });

  useEffect(() => {
    document.title = "Reports | Children Overdue | ThriveWell";
    if (initialData === null) {
      if (localStorage.getItem("userRegion")) {
        getChildrenOverdueApi();
      } else {
        return;
      }
    } else if (initialData) {
      if (localStorage.getItem("userRegion")) {
        let payload = {
          rowCount: rowCount,
          pageNumber: "1",
          stateFilter: initialData.stateFilter,
          districtFilter: initialData.districtFilter,
          startDate: initialData.startDate,
          endDate: initialData.endDate,
          TWCountryId: initialData.countryFilter,
        };
        getChildrenOverdueApi(payload);
      } else {
        return;
      }
    }
  }, []);

  useEffect(() => {
    if (initialData === null) {
      if (localStorage.getItem("userRegion")) {
        getChildrenOverdueApi();
      } else {
        return;
      }
    } else if (initialData) {
      if (localStorage.getItem("userRegion")) {
        let payload = {
          rowCount: rowCount,
          pageNumber: "1",
          stateFilter: initialData.stateFilter,
          districtFilter: initialData.districtFilter,
          startDate: initialData.startDate,
          endDate: initialData.endDate,
          TWCountryId: initialData.countryFilter,
        };
        getChildrenOverdueApi(payload);
      } else {
        return;
      }
    }
  }, [localStorage.getItem("userRegion")]);

  useEffect(() => {
    handleDateFilter();
  }, [startDate, endDate]);

  const getChildrenOverdueApi = useCallback(async (payload = null) => {
    // let defaultPayload={
    //         "rowCount": "10",
    //         "pageNumber": "1",
    //         "stateFilter": "",
    //         "districtFilter": "",
    //         "startDate": "2020-02-12",
    //         "endDate": "2022-02-14"
    //     }
    try {
      let finalPayload;
      if (payload === null) {
        finalPayload = defaultPayload;
      } else {
        finalPayload = { ...payloadAddon, ...payload };
        payloadAddon = { ...finalPayload };
      }
      setPayloadData(finalPayload);
      setLoading(true);
      await APIS.ChildOverdueReport(finalPayload).then((resp) => {
        if (
          resp &&
          resp.data &&
          resp.data?.message &&
          resp.data?.message?.data
        ) {
          setReportData(resp.data?.message?.data);
          setLoading(false);
          setPageCount(resp.data && resp.data?.message?.pageCount);
          if (resp.data.message && resp.data?.message?.data.length === 0) {
            setIsExportDisabled(true);
          } else {
            setIsExportDisabled(false);
          }
        } else {
          setLoading(false);
        }
      });
    } catch (err) {
      console.log("error catch");
    }
  });

  const handleExport = useCallback(async () => {
    try {
      let finalPayload;
      let payload = {
        moduleType: "report",
        needFullData: "true",
        subModuleType: "childoverdue",
      };
      finalPayload = { ...payloadData, ...payload };
      finalPayload.TWCountryId = countryFilter;
      const data = await APIS.ExportFile(finalPayload);
      if (data.data.Message === "Data export started.") {
        toast.success(t("common:common.Data export started"));
      } else if (data.data.Message === "Unauthorized") {
        toast.error(t("common:common.Unauthorized"));
      }
    } catch (err) {
      console.error(err);
    }
  });

  return (
    <>
      <Box
        sx={{
          backgroundColor: "background.default",
          minHeight: "100%",
          pt: 2, //new style
          //py: 8
        }}
      >
        <ReportHeader
          reportHeaderText={t("common:reports.All overdue assessments")}
        />
        {/* <ReportExportButton
          handleExport={handleExport}
          isExportDisabled={isExportDisabled}
        /> */}

        <Scrollbar>
          <Grid container width={1}>
            <Grid item xs={12}>
              <Card sx={{ p: 3 }}>
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
                      <DatePicker
                        slotProps={{
                          textField: { error: false },
                        }}
                        label={t("common:common.StartDate")}
                        value={dayjs(startDate)}
                        onChange={(newValue) => {
                          setStartDate(newValue);
                        }}
                        format={DateFormatFromRegion()}
                        maxDate={dayjs(endDate)}
                        sx={{ minWidth: 200 }}
                      />
                      <DatePicker
                        slotProps={{
                          textField: { error: false },
                        }}
                        label={t("common:common.EndDate")}
                        value={dayjs(endDate)}
                        onChange={(newValue) => {
                          setEndDate(newValue);
                        }}
                        format={DateFormatFromRegion()}
                        //maxDate={endDate}
                        minDate={dayjs(startDate)}
                        sx={{
                          minWidth: 200,
                          "& .MuiInputBase-input": {
                            marginRight: 2,
                          },
                        }}
                      />
                      {[SUPER_ADMIN].includes(signedinUserRoleHT) && (
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

                  <Table>
                    <ReportTableHeader tableHead={tableHead} />

                    {reportData &&
                      reportData.map((item, index) => {
                        return (
                          <ReportTableData
                            key={index}
                            item={item}
                            columns={tableBody}
                          />
                        );
                      })}
                  </Table>
                  {reportData && reportData.length === 0 && (
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
        </Scrollbar>
      </Box>

      <Dialog
        aria-labelledby="simple-dialog-title"
        fullWidth
        maxWidth="sm"
        open={modalFlag}
      >
        <DialogTitle id="simple-dialog-title">
          {t("common:assessment.Intervention Details")}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            <Grid container spacing={3}>
              <Box sx={{ p: 1 }}></Box>
              {interventionData?.map((item, index) => {
                return (
                  <Card sx={{ mt: 2, ml: 2, width: 1 }}>
                    <Box sx={{ ml: 2, pt: 2 }}>
                      <Typography display="inline" sx={{ fontWeight: "bold" }}>
                        {t("common:common.Question")}:
                      </Typography>
                      <Typography
                        display="inline"
                        sx={{
                          color: item.isRedFlagIntervention
                            ? "error.main"
                            : "text.primary",
                        }}
                      >
                        {" " + item.interventionQuestion}
                      </Typography>
                    </Box>

                    <Box sx={{ ml: 2 }}>
                      <Typography display="inline" sx={{ fontWeight: "bold" }}>
                        {t("common:common.Response")}:
                      </Typography>
                      <Typography display="inline">
                        {" " + item.interventionResponse}
                      </Typography>
                    </Box>

                    <Box sx={{ ml: 2 }}>
                      <Typography
                        display="inline"
                        sx={{ fontWeight: "bold", mt: 2 }}
                      >
                        {t("common:common.Text Response")}:
                      </Typography>
                      <Typography display="inline">
                        {" " + item.textResponse}
                      </Typography>
                    </Box>

                    <Box sx={{ ml: 2, pb: 2 }}>
                      <Typography
                        display="inline"
                        sx={{ fontWeight: "bold", mt: 2 }}
                      >
                        {t("common:common.Other response")}:
                      </Typography>
                      <Typography display="inline" sx={{ mb: 3 }}>
                        {" " + item.otherResponse}
                      </Typography>
                    </Box>
                  </Card>
                );
              })}

              {interventionData?.length === 0 && (
                <Card sx={{ mt: 2, ml: 2, width: 1 }}>
                  <Box sx={{ ml: 2, pt: 2, pb: 2 }}>
                    <Typography
                      display="inline"
                      sx={{ fontWeight: "bold", mt: 2 }}
                    >
                      {t("common:common.No Details to Show")}
                    </Typography>
                  </Box>
                </Card>
              )}
            </Grid>
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={(e) => setModalFlag(false)}
            color="primary"
            autoFocus
          >
            {t("common:common.Close")}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default ReportsChildrenOverdue;
