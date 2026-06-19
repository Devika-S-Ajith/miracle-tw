import { React, useState, useEffect, useContext, useCallback } from "react";
import { useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import moment from "moment";
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
import APIS from "../../../common/hooks/UseApiCalls";
import { CommonDataContext } from "../../../common/contexts/CommonDataContext";
import AutoCompleteDropdownToFilter from "../../../components/UserComponents/AutoCompleteDropdownToFilter";
import { ConvertToXLSX } from "../../../components/UserComponents/ReportGenerator";
import {
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
import ReportExportButton from "./Components/ReportExportButton";
import ReportClearFilterButton from "./Components/ReportClearFilterButton";
import ReportTableHeader from "./Components/ReportTableHeader";
import ReportTableData from "./Components/ReportTableData";
import ReportTableNoData from "./Components/ReportTableNoData";
import ReportPagination from "./Components/ReportPagination";

export default function ReportsFamilyWithRedFlag() {
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
  const { locationList, childCurrentPlacementList, signedinUserRoleHT } =
    useContext(CommonDataContext);
  const [reportData, setReportData] = useState();
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
    getChildRedFlagApi(null);
  };
  const [rowCount, setRowCount] = useState(10);

  const handleRowCountChange = (event) => {
    setRowCount(event.target.value);
    getChildRedFlagApi({
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
    getChildRedFlagApi({
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
    getChildRedFlagApi(payload);
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
    getChildRedFlagApi(payload);
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
    getChildRedFlagApi(payload);
    setPage(1);
  };

  const handleDateFilter = () => {
    let startdateformat;
    let enddateformat;
    if (startDate && endDate) {
      startdateformat = moment(startDate).format("YYYY-MM-DD");
      enddateformat = moment(endDate).format("YYYY-MM-DD");
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
    getChildRedFlagApi(payload);
  };

  let tableHead = [
    { name: t("common:common.Name") },
    { name: t("common:common.Last Thrive Scale Date") },
    { name: t("common:common.Last Thrive Scale Score") },
    { name: t("common:common.Red Flags Marked") },
    { name: t("common:common.Location") },
    { name: t("common:assessment.Intervention Details") },
  ];

  const tableConfig = [
    { key: "firstName", render: (item) => item.firstName },
    { key: "lastThriveScaleDate", render: (item) => item.lastThriveScaleDate },
    {
      key: "lastThriveScaleScore",
      render: (item) => item.lastThriveScaleScore,
    },
    { key: "redFlagsMarked", render: (item) => item.redFlagsMarked },
    { key: "location", render: (item) => item.location },
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
    return langId;
  };

  const getInterventionDetails = useCallback(async (event, value) => {
    event.preventDefault();
    try {
      setLoading(true);
      let payload = {
        assessment_id: value["HT_cases.HT_assessments.id"],
        languageId: getLanguageId(),
      };
      await APIS.InterventionDetails(payload).then((resp) => {
        setInterventionData(resp.data?.message?.data);
        setModalFlag(true);
        setLoading(false);
      });
    } catch (err) {
      setLoading(false);
    }
  });

  useEffect(() => {
    document.title = "Reports | Children with Red Flags | ThriveWell";
    if (initialData === null) {
      getChildRedFlagApi();
    } else if (initialData) {
      let payload = {
        rowCount: rowCount,
        pageNumber: "1",
        stateFilter: initialData.stateFilter,
        districtFilter: initialData.districtFilter,
        startDate: initialData.startDate,
        endDate: initialData.endDate,
        TWCountryId: initialData.countryFilter,
      };
      getChildRedFlagApi(payload);
    }
  }, []);

  useEffect(() => {
    handleDateFilter();
  }, [startDate, endDate]);

  const getChildRedFlagApi = async (payload = null) => {
    try {
      let finalPayload;
      const currentLanguage = localStorage.getItem("language");
      const currentLanguageList = JSON.parse(
        localStorage.getItem("languageList")
      );
      let langId;
      if (!currentLanguage || !currentLanguageList.length) {
        langId = "1";
      } else {
        langId =
          currentLanguageList.length &&
          currentLanguageList.find(
            (item) => item.languageCode == currentLanguage
          )?.id;
      }
      if (payload === null) {
        finalPayload = defaultPayload;
      } else {
        finalPayload = { ...payloadAddon, ...payload };
        payloadAddon = { ...finalPayload };
      }
      finalPayload.languageId = langId;
      setPayloadData(finalPayload);
      await APIS.ChildRedFlagReport(finalPayload).then((resp) => {
        if (resp && resp.data && resp.data.message && resp.data.message.data) {
          setReportData(resp.data?.message?.data);
          setPageCount(resp.data?.message?.pageCount);
          setLoading(false);
          if (resp.data.data && resp.data.message.data.length === 0) {
            setIsExportDisabled(true);
          } else {
            setIsExportDisabled(false);
          }
        } else {
          setLoading(false);
        }
      });
    } catch (err) {
      setLoading(false);
      console.log("error catch");
    }
  };

  const handleExport = useCallback(async () => {
    setIsExportDisabled(true);
    try {
      let finalPayload;
      let payload = {
        type: "export",
      };
      finalPayload = { ...payloadData, ...payload };
      finalPayload.TWCountryId = countryFilter;
      const data = await APIS.ChildRedFlagReport(finalPayload);
      if (data?.data) {
        ConvertToXLSX(data?.data, "Children with Red Flags");
        setIsExportDisabled(false);
      }
    } catch (err) {
      console.error(err);
      setIsExportDisabled(false);
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
          reportHeaderText={t("common:reports.Families with red flags")}
        />
        <ReportExportButton
          handleExport={handleExport}
          isExportDisabled={isExportDisabled}
        />
          <Grid container width={1}>
            <Grid item xs={12}>
              <Card sx={{ mr: 1, p: 3 }}>
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
                <Box sx={{ minWidth: 700, m: 2 }}>
                  <Table>
                    <ReportTableHeader tableHead={tableHead} />
                    {reportData &&
                      reportData.map((item, index) => {
                        return (
                          <ReportTableData
                            key={index}
                            item={item}
                            columns={tableConfig}
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
