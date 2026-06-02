import { React, useState, useEffect, useContext, useCallback } from "react";
import { useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
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

function ReportsChildServed() {
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
  const [modalFlag, setModalFlag] = useState(false);
  const [interventionData, setInterventionData] = useState([]);
  const [payloadData, setPayloadData] = useState({});
  const [isExportDisabled, setIsExportDisabled] = useState(true);
  const [keyVal, setKeyVal] = useState(false);

  const [districtData, setDistrictData] = useState("");

  const ClearFilters = () => {
    setStartDate(null);
    setEndDate(null);
    setDistrictFilter("");
    setStateFilter("");
    setCountryFilter(localStorage.getItem("userRegion"));
    setKeyVal(!keyVal);
    getChildServeApi(null);
  };

  const handlePageChange = (event, value) => {
    setLoading(true);
    getChildServeApi({
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

  const [rowCount, setRowCount] = useState(10);

  const handleRowCountChange = (event) => {
    setRowCount(event.target.value);
    getChildServeApi({
      pageNumber: page,
      districtFilter: districtFilter,
      rowCount: event.target.value,
      stateFilter: stateFilter,
      startDate: startDate,
      endDate: endDate,
      TWCountryId: countryFilter,
    });
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
    getChildServeApi(payload);
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
    getChildServeApi(payload);
    setPage(1);
  };

  const handleDistrictFilter = (value) => {
    setDistrictData(value);
    let payload = {
      districtFilter: value,
      pageNumber: "1",
      rowCount: rowCount,
      stateFilter: stateFilter,
      startDate: startDate,
      endDate: endDate,
      TWCountryId: countryFilter,
    };
    getChildServeApi(payload);
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
    getChildServeApi(payload);
  };

  let tableHead = [
    { name: t("common:common.FirstName") },
    { name: t("common:common.LastName") },
    { name: t("common:child.Child Placement Status") },
    { name: t("common:common.Current Placement") },
    { name: t("common:common.Address") },
    { name: t("common:common.Date of Next Visit") },
    { name: t("common:common.Last Thrive Scale Score") },
    { name: t("common:assessment.Intervention Details") },
  ];

  const getTableConfig = (role) => {
    if (role !== "superadmin") {
      return [
        { key: "firstName", render: (item) => item.firstName },
        { key: "lastName", render: (item) => item.lastName },
        {
          key: "HTChildPlacementStatusId",
          render: (item) => item["HT_childPlacementStatus.placementStatus"],
        },
        {
          key: "HTChildCurrentPlacementStatusId",
          render: (item) =>
            item["HT_childCurrentPlacementStatus.currentPlacementStatus"],
        },
        { key: "address", render: (item) => item.address },
        { key: "nextVisitDate", render: (item) => item.nextVisitDate },
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
    } else {
      return [{ key: "childId", render: (item) => item.childId }];
    }
  };

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

  useEffect(() => {
    document.title = "Reports | Children Served | ThriveWell";

    if (initialData === null) {
      getChildServeApi();
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
      getChildServeApi(payload);
    }
  }, []);

  useEffect(() => {
    handleDateFilter();
  }, [startDate, endDate]);

  const getChildServeApi = useCallback(async (payload = null) => {
    setLoading(true);
    try {
      let finalPayload;
      if (payload === null) {
        finalPayload = defaultPayload;
      } else {
        finalPayload = { ...payloadAddon, ...payload };
        payloadAddon = { ...finalPayload };
      }
      setPayloadData(finalPayload);
      await APIS.ChildServedReport(finalPayload).then((resp) => {
        if (resp && resp.data) {
          setReportData(resp.data.message.data);
          setIsExportDisabled(false);
          setPageCount(resp.data.message && resp.data.message.pageCount);
        } else {
          setIsExportDisabled(true);
        }
      });
    } catch (err) {
      console.log("error catch");
    }
    setLoading(false);
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
      const data = await APIS.ChildServedReport(finalPayload);
      if (data?.data) {
        ConvertToXLSX(data?.data, "Child Served List");
        setIsExportDisabled(false);
      }
    } catch (err) {
      console.error(err);
      setIsExportDisabled(false);
    }
  });

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
        childId: value["id"],
        languageId: getLanguageId(),
      };
      await APIS.InterventionDetails(payload).then((resp) => {
        setInterventionData(resp.data.message?.data);
        setModalFlag(true);
        setLoading(false);
      });
    } catch (err) {
      setLoading(false);
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
        <ReportHeader reportHeaderText={t("common:common.ChildrenAssessed")} />
        <ReportExportButton
          handleExport={handleExport}
          isExportDisabled={isExportDisabled}
        />

        <Card sx={{ p: 3 }}>
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
            <Box
              item
              sx={{
                display: "flex",
                flexDirection: "row",
                flexWrap: "wrap",
                gap: 3,
              }}
            >
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
                  options={getStateList(locationList, countryFilter) || []}
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
                      value={districtData}
                      key={stateFilter}
                      defaultVal={districtData}
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
            <ReportTableHeader
              tableHead={
                signedinUserRoleHT !== "superadmin"
                  ? tableHead
                  : [{ name: t("common:common.Child ID") }]
              }
            />
            {reportData &&
              reportData.map((item, index) => {
                return (
                  <ReportTableData
                    key={index}
                    item={item}
                    columns={getTableConfig(signedinUserRoleHT)}
                  />
                );
              })}
          </Table>

          {reportData && reportData.length === 0 && <ReportTableNoData />}

          <ReportPagination
            rowCount={rowCount}
            page={page}
            pageCount={pageCount}
            handleRowCountChange={handleRowCountChange}
            handlePageChange={handlePageChange}
          />
        </Card>
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

export default ReportsChildServed;
