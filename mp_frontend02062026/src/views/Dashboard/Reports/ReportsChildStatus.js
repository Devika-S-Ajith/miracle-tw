import { React, useState, useEffect, useContext, useCallback } from "react";
import { useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
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
// import DatePicker from '@mui/lab/DatePicker';
// import moment from 'moment';
import Scrollbar from "../Components/ScrollBar";
import APIS from "../../../common/hooks/UseApiCalls";
import { CommonDataContext } from "../../../common/contexts/CommonDataContext";
import AutoCompleteDropdownToFilter from "../../../components/UserComponents/AutoCompleteDropdownToFilter";
import {
  getDistrictList,
  getSelectedCountryDetails,
  getStateList,
} from "../../../helpers/helperFunction";
import ReportHeader from "./Components/ReportHeader";
// import ReportExportButton from "./Components/ReportExportButton";
import ReportClearFilterButton from "./Components/ReportClearFilterButton";
import ReportTableHeader from "./Components/ReportTableHeader";
import ReportTableData from "./Components/ReportTableData";
import ReportTableNoData from "./Components/ReportTableNoData";
import ReportPagination from "./Components/ReportPagination";

function ReportsChildStatus() {
  const location = useLocation();
  const fromDashboard = location.state && location.state.fromDashboard;
  let dashboardFilter = localStorage.getItem("dashboardFilters");
  let initialData = fromDashboard === true ? JSON.parse(dashboardFilter) : null;
  // const [startDate, setStartDate] = useState(initialData === null ? null :initialData.startDate);
  // const [endDate, setEndDate] = useState(initialData === null ? null :initialData.endDate);
  const [reportData, setReportData] = useState();
  const { locationList } = useContext(CommonDataContext);
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
  const [payloadData, setPayloadData] = useState({});
  const [isExportDisabled, setIsExportDisabled] = useState(true);
  const [keyVal, setKeyVal] = useState(false);
  const ClearFilters = () => {
    setDistrictFilter("");
    setStateFilter("");
    // setStartDate(null);
    //setEndDate(null);
    setKeyVal(!keyVal);
    getChildStatus({
      isCurrentPlacementStatus: false,
    });
  };

  const [rowCount, setRowCount] = useState(10);

  const handleRowCountChange = (event) => {
    setLoading(true);
    setPage(1);
    setRowCount(event.target.value);
    getChildStatus({
      pageNumber: 1,
      isCurrentPlacementStatus: false,
      districtFilter: districtFilter,
      rowCount: event?.target?.value,
      stateFilter: stateFilter,
    });
  };

  const handlePageChange = (event, value) => {
    setLoading(true);
    getChildStatus({
      pageNumber: value,
      isCurrentPlacementStatus: false,
      districtFilter: districtFilter,
      rowCount: rowCount,
      stateFilter: stateFilter,
    });
    setPage(value);
  };

  const handleStateFilter = (value) => {
    let payload = {
      districtFilter: districtFilter,
      pageNumber: "1",
      rowCount: rowCount,
      stateFilter: value,
      isCurrentPlacementStatus: false,
    };
    getChildStatus(payload);
    setStateFilter(value);
    setPage(1);
  };

  const handleDistrictFilter = (value) => {
    let payload = {
      districtFilter: value,
      stateFilter: stateFilter,
      pageNumber: "1",
      isCurrentPlacementStatus: false,
      rowCount: rowCount,
    };
    getChildStatus(payload);
    setDistrictFilter(value);
    setPage(1);
  };

  // const handleDateFilter=()=>{
  //     let startdateformat
  //     let enddateformat
  //     console.log({startDate})
  //     if(startDate && endDate){
  //         startdateformat = moment(startDate).format('YYYY-MM-DD')
  //         enddateformat =moment(endDate).format('YYYY-MM-DD')
  //         console.log(startdateformat,enddateformat)
  //     }
  //     let payload = {
  //         "rowCount": "10",
  //         "pageNumber": "1",
  //         // "startDate": startdateformat,
  //         // "endDate": enddateformat,
  //         "isCurrentPlacementStatus":false
  //       }
  //       getChildStatus(payload)

  // }

  let tableHead = [
    { name: t("common:common.Child ID") },
    { name: t("common:common.Child Status") },
    { name: t("common:common.Current Placement") },
  ];

  const tableConfig = [
    { key: "childId", render: (item) => item.childId },
    {
      key: "status",
      render: (item) => t(`common:common.${item.status}`),
    },
    {
      key: "currentPlacementStatus",
      render: (item) => item.currentPlacementStatus,
    },
  ];

  const defaultPayload = {
    rowCount: rowCount,
    pageNumber: "1",
    stateFilter: "",
    districtFilter: "",
    // "startDate": "",
    // "endDate": "",
    isCurrentPlacementStatus: false,
  };

  let payloadAddon = {
    rowCount: rowCount,
    pageNumber: "1",
    stateFilter: "",
    districtFilter: "",
    // "startDate": "",
    // "endDate": "",
    isCurrentPlacementStatus: false,
  };

  useEffect(() => {
    document.title = "Reports | Child Status | ThriveWell";
    if (initialData === null) {
      getChildStatus();
    } else if (initialData) {
      let payload = {
        rowCount: rowCount,
        pageNumber: "1",
        stateFilter: initialData.stateFilter,
        districtFilter: initialData.districtFilter,
        // "startDate": initialData.startDateFilter,
        // "endDate": initialData.endDateFilter,
        isCurrentPlacementStatus: false,
      };
      getChildStatus(payload);
    }
  }, []);

  const getChildStatus = useCallback(async (payload = null) => {
    try {
      let finalPayload;
      const currentLanguage = localStorage.getItem("language");
      const currentLanguageList = JSON.parse(
        localStorage.getItem("languageList")
      );
      let langId;
      if (!currentLanguage || !currentLanguageList?.length) {
        langId = "1";
      } else {
        langId =
          currentLanguageList?.length &&
          currentLanguageList?.find(
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
      finalPayload.TWCountryId = localStorage.getItem("userRegion");
      setPayloadData(finalPayload);
      await APIS.CurrentPlacement(finalPayload).then((resp) => {
        if (resp && resp.data) {
          setReportData(resp.data.message?.data);
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
        subModuleType: "currentPlacement",
      };
      finalPayload = { ...payloadData, ...payload };
      finalPayload.TWCountryId = localStorage.getItem("userRegion");
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
      <ReportHeader reportHeaderText={t("common:common.Child Status")} />
      {/* <ReportExportButton
        handleExport={handleExport}
        isExportDisabled={isExportDisabled}
      /> */}
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
                          getStateList(
                            locationList,
                            localStorage.getItem("userRegion")
                          ) || []
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
                    {localStorage.getItem("userRegion") &&
                      getSelectedCountryDetails(
                        locationList,
                        localStorage.getItem("userRegion")
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
                                localStorage.getItem("userRegion"),
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
                          columns={tableConfig}
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

export default ReportsChildStatus;
