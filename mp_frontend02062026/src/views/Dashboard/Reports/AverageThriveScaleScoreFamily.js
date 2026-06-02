import { React, useState, useEffect, useContext, useCallback } from "react";
import { useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import moment from "moment";
import {
  Box,
  Grid,
  CircularProgress,
  Table,
  Card,
  TextField,
} from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import Scrollbar from "../../Dashboard/Components/ScrollBar";
import APIS from "../../../common/hooks/UseApiCalls";
import { CommonDataContext } from "../../../common/contexts/CommonDataContext";
import AutoCompleteDropdownToFilter from "../../../components/UserComponents/AutoCompleteDropdownToFilter";
import { ConvertToXLSX } from "../../../components/UserComponents/ReportGenerator";
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
import ReportExportButton from "./Components/ReportExportButton";
import ReportClearFilterButton from "./Components/ReportClearFilterButton";
import ReportTableHeader from "./Components/ReportTableHeader";
import ReportTableData from "./Components/ReportTableData";
import ReportTableNoData from "./Components/ReportTableNoData";
import ReportPagination from "./Components/ReportPagination";
import dayjs from "dayjs";

const tableBody = [
  { key: "LivingConditionsScore" },
  { key: "HouseholdEconomyScore" },
  { key: "EducationScore" },
  { key: "HealthAndMentalHealthScore" },
  { key: "FamilyandSocialRelationshipsScore" },
  { key: "lastDate" },
  { key: "OverallScore" },
];

function AverageThriveScaleScoreFamily() {
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
    getAverageThriveScale(null);
  };

  const [rowCount, setRowCount] = useState(10);

  const handleRowCountChange = (event) => {
    setRowCount(event.target.value);
    getAverageThriveScale({
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
    getAverageThriveScale({
      pageNumber: value,
      districtFilter: districtFilter,
      rowCount: rowCount,
      stateFilter: stateFilter,
      startDate: startDate,
      endDate: endDate,
      TWCountryId: countryFilter,
      //  "orgTypeFilter" : typeFilter,
      //   "orgStatus" : statusFilter
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
    getAverageThriveScale(payload);
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
    getAverageThriveScale(payload);
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
    getAverageThriveScale(payload);
    setDistrictFilter(value);
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
    getAverageThriveScale(payload);
  };

 let tableHead = [
    { name: t("common:common.Living Conditions") },
    { name: t("common:common.Household Economy") },
    { name: t("common:common.Education") },
    { name: t("common:common.Health & Mental Health") },
    { name: t("common:common.Family & Social Relationships") },
    { name: t("common:common.Last Assesment Date") },
    { name: t("common:common.Overall") },
  ];

  const defaultPayload = {
    rowCount: rowCount,
    pageNumber: "1",
    stateFilter: "",
    districtFilter: "",
    startDate: "",
    endDate: "",
    assessmentType:"FAMILY",
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

  useEffect(() => {
    document.title = "Reports | Average Thrive Scale Scores | ThriveWell";
    if (initialData === null) {
      getAverageThriveScale();
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
      getAverageThriveScale(payload);
    }
  }, []);

  useEffect(() => {
    handleDateFilter();
  }, [startDate, endDate]);

  const getAverageThriveScale = useCallback(async (payload = null) => {
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
      finalPayload.assessmentType = "FAMILY"
      await APIS.AverageThrivescaleReport(finalPayload).then((resp) => {
        if (
          resp &&
          resp?.data &&
          resp?.data?.message &&
          resp.data?.message?.data
        ) {
          setReportData(resp.data?.message?.data);
          setLoading(false);
          setPageCount(resp.data.message?.pageCount);
          if (resp?.data?.message && resp?.data?.message?.data.length === 0) {
            setIsExportDisabled(true);
          } else {
            setIsExportDisabled(false);
          }
        } else {
        }
      });
    } catch (err) {
      console.log("error catch");
    }
  });

  const handleExport = useCallback(async () => {
    setIsExportDisabled(true);
    try {
      let finalPayload;
      let payload = {
        type: "export",
      };
      finalPayload = { ...payloadData, ...payload };
      finalPayload.TWCountryId = countryFilter;
      const data = await APIS.AverageThrivescaleReport(finalPayload);
      if (data?.data) {
        ConvertToXLSX(data?.data, "Average Thrive Scale Score");
        setIsExportDisabled(false);
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
        reportHeaderText={t(
          "common:common.Average Thrive Scale Scores (families)"
        )}
      />
      <ReportExportButton
        handleExport={handleExport}
        isExportDisabled={isExportDisabled}
      />

      <Scrollbar>
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
                      minDate={dayjs(startDate)}
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
      </Scrollbar>
    </Box>
  );
}

export default AverageThriveScaleScoreFamily;
