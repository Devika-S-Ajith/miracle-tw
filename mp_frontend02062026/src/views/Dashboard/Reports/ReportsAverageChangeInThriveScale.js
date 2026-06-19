import { React, useState, useEffect, useContext, useCallback } from "react";
import { useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import moment from "moment";
import toast from "react-hot-toast";
import {
  Box,
  Grid,
  CircularProgress,
  Table,
  Card,
  TableBody,
  TableCell,
  TableRow,
  TextField,
} from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import APIS from "../../../common/hooks/UseApiCalls";
import { CommonDataContext } from "../../../common/contexts/CommonDataContext";
import AutoCompleteDropdownToFilter from "../../../components/UserComponents/AutoCompleteDropdownToFilter";
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
import ReportHeader from "./Components/ReportHeader";
// import ReportExportButton from "./Components/ReportExportButton";
import ReportClearFilterButton from "./Components/ReportClearFilterButton";
import ReportTableHeader from "./Components/ReportTableHeader";
import ReportTableNoData from "./Components/ReportTableNoData";
import ReportPagination from "./Components/ReportPagination";

function ReportsAverageChangeInThriveScale() {
  const location = useLocation();
  const fromDashboard = location.state && location.state.fromDashboard;
  let dashboardFilter = localStorage.getItem("dashboardFilters");
  let initialData = fromDashboard === true ? JSON.parse(dashboardFilter) : null;
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
  const [stateFilter, setStateFilter] = useState(
    initialData === null ? "" : initialData.stateFilter
  );
  const [districtFilter, setDistrictFilter] = useState(
    initialData === null ? "" : initialData.districtFilter
  );
  const [countryFilter, setCountryFilter] = useState(
    initialData === null
      ? localStorage.getItem("userRegion")
      : initialData.countryFilter
  );
  const [percentChangeData, setPercentChangeData] = useState("false");
  const [timePeriodData, setTimePeriodData] = useState("1 month");
  const [avChangeData, setAvChangeData] = useState("");
  const [avTimeData, setAvTimeData] = useState("");
  const [totalTSData, setTotalTSData] = useState("");
  const [payloadData, setPayloadData] = useState({});
  const [isExportDisabled, setIsExportDisabled] = useState(true);
  const [keyVal, setKeyVal] = useState(false);
  const changeMorethanList = [
    {
      value: t(`common:common.Yes`),
      id: "true",
    },
    {
      value: t(`common:common.No`),
      id: "false",
    },
  ];
  const timePeriodList = [
    {
      value: t(`common:common.> 2 years`),
      id: "> 2 years",
    },
    {
      value: t(`common:common.> 1 year`),
      id: "> 1 year",
    },
    {
      value: t(`common:common.1 year`),
      id: "1 year",
    },
    {
      value: t(`common:common.6 months`),
      id: "6 months",
    },
    {
      value: t(`common:common.3 months`),
      id: "3 months",
    },
    {
      value: t(`common:common.1 month`),
      id: "1 month",
    },
  ];

  const ClearFilters = () => {
    //setStartDate(null);
    //setEndDate(null);
    setDistrictFilter("");
    setStateFilter("");
    setCountryFilter(localStorage.getItem("userRegion"));
    setTimePeriodData("1 month");
    setPercentChangeData("false");
    setKeyVal(!keyVal);
    getAveragePercentChangeData(null);
  };

  const [rowCount, setRowCount] = useState(10);

  const handleRowCountChange = (event) => {
    setRowCount(event.target.value);
    getAveragePercentChangeData({
      pageNumber: page,
      TWCountryId: countryFilter,
      stateFilter: stateFilter,
      districtFilter: districtFilter,
      timePeriodFilter: timePeriodData,
      scoreChangeFilter: percentChangeData,
      rowCount: event?.target?.value,
    });
  };

  const handlePageChange = (event, value) => {
    getAveragePercentChangeData({
      pageNumber: value,
      TWCountryId: countryFilter,
      stateFilter: value,
      districtFilter: districtFilter,
      timePeriodFilter: timePeriodData,
      scoreChangeFilter: percentChangeData,
      //  "orgTypeFilter" : typeFilter,
      //   "orgStatus" : statusFilter
    });
    setPage(value);
  };
  const handleStateFilter = (value) => {
    let payload = {
      stateFilter: value,
      TWCountryId: countryFilter,
      districtFilter: "",
      timePeriodFilter: timePeriodData,
      scoreChangeFilter: percentChangeData,
      pageNumber: "1",
      rowCount: rowCount,
    };
    getAveragePercentChangeData(payload);
    setStateFilter(value);
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
    getAveragePercentChangeData(payload);
    setPage(1);
  };

  const handleDistrictFilter = (value) => {
    let payload = {
      TWCountryId: countryFilter,
      stateFilter: stateFilter,
      districtFilter: value,
      timePeriodFilter: timePeriodData,
      scoreChangeFilter: percentChangeData,
      pageNumber: "1",
      rowCount: rowCount,
    };
    getAveragePercentChangeData(payload);
    setDistrictFilter(value);
    setPage(1);
  };

  const handlePercentFilter = (value) => {
    let payload = {
      TWCountryId: countryFilter,
      stateFilter: stateFilter,
      districtFilter: districtFilter,
      scoreChangeFilter: value,
      timePeriodFilter: timePeriodData,
      pageNumber: "1",
      rowCount: rowCount,
    };
    getAveragePercentChangeData(payload);
    setPercentChangeData(value);
    setPage(1);
  };

  const handleTimePeriodFilter = (value) => {
    let payload = {
      TWCountryId: countryFilter,
      stateFilter: stateFilter,
      districtFilter: districtFilter,
      timePeriodFilter: value,
      scoreChangeFilter: percentChangeData,
      pageNumber: "1",
      rowCount: rowCount,
    };
    getAveragePercentChangeData(payload);
    setTimePeriodData(value);
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
      startDate: startdateformat,
      endDate: enddateformat,
    };
    getAveragePercentChangeData(payload);
  };

  let tableHead = [
    { name: t("common:common.Child ID") },
    { name: t("common:common.Family ID") },
    { name: t("common:common.Change in Score") },
    { name: t("common:common.Time Period (Days)") },
    { name: t("common:common.Date of ThriveScore") },
    { name: t("common:common.Stage") },
  ];

  const defaultPayload = {
    rowCount: rowCount,
    pageNumber: "1",
    TWCountryId: localStorage.getItem("userRegion"),
    stateFilter: "",
    districtFilter: "",
    // "startDate": "",
    // "endDate": "",
    scoreChangeFilter: "false",
    timePeriodFilter: "1 month",
  };

  let payloadAddon = {
    rowCount: rowCount,
    pageNumber: "1",
    TWCountryId: localStorage.getItem("userRegion"),
    stateFilter: "",
    districtFilter: "",
    // "startDate": "",
    // "endDate": "",
    scoreChangeFilter: "false",
    timePeriodFilter: "1 month",
  };

  useEffect(() => {
    document.title = "Reports | Average % change in Thrive Scale | ThriveWell";
    if (initialData === null) {
      getAveragePercentChangeData();
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
      getAveragePercentChangeData(payload);
    }
  }, []);

  useEffect(() => {
    handleDateFilter();
  }, [startDate, endDate]);

  const getAveragePercentChangeData = useCallback(async (payload = null) => {
    try {
      setLoading(true);
      let finalPayload;
      if (payload === null) {
        finalPayload = defaultPayload;
      } else {
        finalPayload = { ...payloadAddon, ...payload };
        payloadAddon = { ...finalPayload };
      }
      setPayloadData(finalPayload);
      await APIS.AverageChangeTS(finalPayload).then((resp) => {
        if (resp && resp.data) {
          setReportData(resp.data?.message?.data);
          setAvChangeData(resp.data?.message?.avgChangeInTSscore);
          setAvTimeData(resp.data?.message?.avgTimePeriod);
          setTotalTSData(resp.data?.message?.totalTSCompleted);
          setLoading(false);
          setPageCount(resp.data?.message?.pageCount);
          if (resp.data?.message && resp.data?.message?.data?.length === 0) {
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
        subModuleType: "avgPercentChangeTScore",
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
    <Box
      sx={{
        backgroundColor: "background.default",
        minHeight: "100%",
        pt: 2, //new style
        //py: 8
      }}
    >
      <ReportHeader
        reportHeaderText={t("common:common.Average % change in Thrive Scale")}
      />
      {/* <ReportExportButton
        handleExport={handleExport}
        isExportDisabled={isExportDisabled}
      /> */}

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
                    <TextField
                      name="demo-simple-select"
                      accessKey="value"
                      value={percentChangeData}
                      key={2}
                      getValueFunction={(value) => {
                        handlePercentFilter(value);
                      }}
                      component={AutoCompleteDropdownToFilter}
                      label="demo-simple-select"
                      options={changeMorethanList}
                      textFieldProps={{
                        variant: "outlined",
                        label: t("common:common.Changes more than 5%"),
                      }}
                      sx={{ width: "14rem" }}
                    />

                    <TextField
                      name="demo-simple-select-label"
                      accessKey="value"
                      value={timePeriodData}
                      key={3}
                      getValueFunction={(value) => {
                        handleTimePeriodFilter(value);
                      }}
                      component={AutoCompleteDropdownToFilter}
                      label="demo-simple-select-label"
                      options={timePeriodList}
                      textFieldProps={{
                        variant: "outlined",
                        label: t("common:common.Time period"),
                      }}
                      sx={{ width: "12rem" }}
                    />
                    <ReportClearFilterButton clearFilters={ClearFilters} />
                  </Box>
                </LocalizationProvider>
                <Table>
                  <ReportTableHeader tableHead={tableHead} />
                  <TableBody>
                    {reportData &&
                      reportData.map((item) => {
                        return (
                          <TableRow>
                            <TableCell>{item.ChildId}</TableCell>
                            <TableCell>{item.FamilyId}</TableCell>
                            <TableCell>{item.ChangeInScore}</TableCell>
                            <TableCell>{item.TimePeriod}</TableCell>
                            <TableCell>{item.ThriveScoreDate}</TableCell>
                            <TableCell>
                              {t(`common:common.${item.Stage}`)}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    {reportData && reportData.length > 0 && (
                      <TableRow>
                        <TableCell>
                          <b>
                            {t("common:common.Thrive Scale Completed")}:&nbsp;
                            {totalTSData}
                          </b>
                        </TableCell>
                        <TableCell>
                          <b></b>
                        </TableCell>
                        <TableCell>
                          <b>
                            {t("common:common.Average Change")}:&nbsp;
                            {avChangeData}
                          </b>
                        </TableCell>
                        <TableCell>
                          <b>
                            {t("common:common.Average Time Spent")}:&nbsp;
                            {avTimeData}
                          </b>
                        </TableCell>
                        <TableCell>
                          <b></b>
                        </TableCell>
                        <TableCell>
                          <b></b>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
                {reportData && reportData.length === 0 && <ReportTableNoData />}
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
  );
}

export default ReportsAverageChangeInThriveScale;
