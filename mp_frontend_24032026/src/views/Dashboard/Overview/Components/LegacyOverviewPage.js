import { useEffect, useContext, useState } from "react";
import { Box, Button, Grid, TextField, Typography } from "@mui/material";
import  ReportsPieChart from "./ReportsPieChart";
import ReportsTrafficSources from  "./ReportsTrafficSources";
import ChevronRightIcon from "../../../../assets/icons/ChevronRight";
import MapComponent from "./MapComponent";
import { CommonDataContext } from "../../../../common/contexts/CommonDataContext";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import dayjs from "dayjs";
import { useTranslation } from "react-i18next";
import _ from "lodash";
import APIS from "../../../../common/hooks/UseApiCalls";
import AutoCompleteDropdownToFilter from "../../../../components/UserComponents/AutoCompleteDropdownToFilter";
import "../../../../theme/fontSize.css";
import {
  getStateList,
  getDistrictList,
  getSelectedCountryDetails,
} from "../../../../helpers/helperFunction";
import {
  SUPER_ADMIN,
  ADMIN,
  ADMIN_CASEWORKER,
  CASEWORKER,
  VIEW_ONLY,
  MIRACLE,
  GOVT_CCI,
  GOVT_ORG,
  NGO_PARTNER,
  PRIVATE_CCI,
} from "../../../../helpers/constant";
import DashboardCountWidgets from "./DashboardCountWidgets";
import { makeStyles } from "@mui/styles";
import useAuthorization from "../../../../components/UserComponents/useAuthorization";
import { DateFormatFromRegion } from "../../../../constants";
import ProgressReportCard from "./ProgressReportCard";

const useStyles = makeStyles((theme) => ({
  extraLargeButton: {
    padding: "16px 32px", // Adjust padding as needed
    fontSize: "1rem", // Adjust font size as needed
  },
}));

const LegacyOverviewPage = () => {
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [filterdCards, setFilteredCards] = useState([]);
  const classes = useStyles();
  const { locationList, signedinUserRoleHT, signedinOrgType, languageChange } =
    useContext(CommonDataContext);
  const { t } = useTranslation(["common"]);
  const [commonPayload, setCommonPayload] = useState({});
  const [districtData, setDistrictData] = useState("");
  const [stateData, setStateData] = useState("");
  const [countryData, setCountryData] = useState();
  const [tileData, setTileData] = useState("");
  const [caseManagementData, setCaseManagementData] = useState(null);
  const [keyVal, setKeyVal] = useState(false);
  const [loading, setLoading] = useState(true);

  const initialCommonPayload = {
    rowCount: "100",
    pageNumber: "1",
    countryFilter: "",
    HTCountryId: "",
    stateFilter: "",
    districtFilter: "",
    startDate: "",
    endDate: "",
  };

  const items = [
    {
      title: "ChildrenAssessed",
      key: "childrenAssessed",
      sequence: 1,
      Allowed_Roles: [
        SUPER_ADMIN,
        ADMIN,
        CASEWORKER,
        ADMIN_CASEWORKER,
        VIEW_ONLY,
      ],
      Report_Allowed_Roles: [
        SUPER_ADMIN,
        ADMIN,
        CASEWORKER,
        ADMIN_CASEWORKER,
        VIEW_ONLY,
      ],
      Allowed_Acc_Type: [MIRACLE, GOVT_CCI, GOVT_ORG, NGO_PARTNER, PRIVATE_CCI],
      Report_Allowed_Acc_Type: [
        MIRACLE,
        GOVT_CCI,
        GOVT_ORG,
        NGO_PARTNER,
        PRIVATE_CCI,
      ],
      reportLink: "/dashboard/reportsChildServed",
    },
    {
      title: "RedFlags",
      key: "redflagCount",
      sequence: 2,
      Allowed_Roles: [
        SUPER_ADMIN,
        ADMIN,
        CASEWORKER,
        ADMIN_CASEWORKER,
        VIEW_ONLY,
      ],
      Report_Allowed_Roles: [
        SUPER_ADMIN,
        ADMIN,
        CASEWORKER,
        ADMIN_CASEWORKER,
        VIEW_ONLY,
      ],
      Allowed_Acc_Type: [MIRACLE, GOVT_CCI, GOVT_ORG, NGO_PARTNER, PRIVATE_CCI],
      Report_Allowed_Acc_Type: [
        MIRACLE,
        GOVT_CCI,
        GOVT_ORG,
        NGO_PARTNER,
        PRIVATE_CCI,
      ],
      reportLink: "/dashboard/reportsChildRedFlag",
    },
    {
      title: "DisruptionCases",
      key: "disruptionCase",
      sequence: 3,
      Allowed_Roles: [
        SUPER_ADMIN,
        ADMIN,
        CASEWORKER,
        ADMIN_CASEWORKER,
        VIEW_ONLY,
      ],
      Report_Allowed_Roles: [
        SUPER_ADMIN,
        ADMIN,
        CASEWORKER,
        ADMIN_CASEWORKER,
        VIEW_ONLY,
      ],
      Allowed_Acc_Type: [MIRACLE, GOVT_CCI, GOVT_ORG, NGO_PARTNER, PRIVATE_CCI],
      Report_Allowed_Acc_Type: [
        MIRACLE,
        GOVT_CCI,
        GOVT_ORG,
        NGO_PARTNER,
        PRIVATE_CCI,
      ],
      reportLink: "/dashboard/disruptionCases",
    },
    {
      title: "Days of Followup",
      key: `followupDurations.averageNoOfDays`,
      sequence: 4,
      Allowed_Roles: [
        SUPER_ADMIN,
        ADMIN,
        CASEWORKER,
        ADMIN_CASEWORKER,
        VIEW_ONLY,
      ],
      Report_Allowed_Roles: [
        SUPER_ADMIN,
        ADMIN,
        CASEWORKER,
        ADMIN_CASEWORKER,
        VIEW_ONLY,
      ],
      Allowed_Acc_Type: [MIRACLE, GOVT_CCI, GOVT_ORG, NGO_PARTNER, PRIVATE_CCI],
      Report_Allowed_Acc_Type: [
        MIRACLE,
        GOVT_CCI,
        GOVT_ORG,
        NGO_PARTNER,
        PRIVATE_CCI,
      ],
      reportLink: "/dashboard/reportsDaysofFollowup",
    },
    {
      title: "All overdue assessments",
      key: "overallOverdue",
      sequence: 5,
      Allowed_Roles: [
        SUPER_ADMIN,
        ADMIN,
        CASEWORKER,
        ADMIN_CASEWORKER,
        VIEW_ONLY,
      ],
      Report_Allowed_Roles: [
        SUPER_ADMIN,
        ADMIN,
        CASEWORKER,
        ADMIN_CASEWORKER,
        VIEW_ONLY,
      ],
      Allowed_Acc_Type: [MIRACLE, GOVT_CCI, GOVT_ORG, NGO_PARTNER, PRIVATE_CCI],
      Report_Allowed_Acc_Type: [
        MIRACLE,
        GOVT_CCI,
        GOVT_ORG,
        NGO_PARTNER,
        PRIVATE_CCI,
      ],
      reportLink: "/dashboard/reportsChildrenOverdue",
    },
    {
      title: "Case workers Served",
      key: "caseWorkerServed",
      sequence: 6,
      Allowed_Roles: [SUPER_ADMIN, ADMIN, ADMIN_CASEWORKER, VIEW_ONLY],
      Report_Allowed_Roles: [],
      Allowed_Acc_Type: [MIRACLE, GOVT_CCI, GOVT_ORG, NGO_PARTNER, PRIVATE_CCI],
      Report_Allowed_Acc_Type: [],
      reportLink: "",
    },
    {
      title: "FamiliesAssessed",
      key: "familyServed",
      sequence: 7,
      Allowed_Roles: [
        SUPER_ADMIN,
        ADMIN,
        CASEWORKER,
        ADMIN_CASEWORKER,
        VIEW_ONLY,
      ],
      Report_Allowed_Roles: [],
      Allowed_Acc_Type: [MIRACLE, GOVT_CCI, GOVT_ORG, NGO_PARTNER, PRIVATE_CCI],
      Report_Allowed_Acc_Type: [],
      reportLink: "",
    },
    {
      title: "Duration in CCI",
      key: `cciDurations.0.averageNoOfDays`,
      sequence: 8,
      Allowed_Roles: [
        SUPER_ADMIN,
        ADMIN,
        CASEWORKER,
        ADMIN_CASEWORKER,
        VIEW_ONLY,
      ],
      Report_Allowed_Roles: [
        SUPER_ADMIN,
        ADMIN,
        CASEWORKER,
        ADMIN_CASEWORKER,
        VIEW_ONLY,
      ],
      Allowed_Acc_Type: [MIRACLE, GOVT_CCI, GOVT_ORG, NGO_PARTNER, PRIVATE_CCI],
      Report_Allowed_Acc_Type: [
        MIRACLE,
        GOVT_CCI,
        GOVT_ORG,
        NGO_PARTNER,
        PRIVATE_CCI,
      ],
      reportLink: "/dashboard/durationInCCI",
    },
  ];

  useAuthorization(
    signedinUserRoleHT,
    null,
    signedinOrgType,
    "HTDashboard",
    true
  );

  useEffect(() => {
    const filteredItems = items.filter(
      (item) =>
        item.Allowed_Roles?.includes(signedinUserRoleHT) &&
        item.Allowed_Acc_Type?.includes(signedinOrgType)
    );
    setFilteredCards(filteredItems);
  }, [signedinUserRoleHT, signedinOrgType]);

  const getDate = (dateToFormat = null) => {
    let yourDate;
    if (dateToFormat === null) {
      return null;
    } else if (dateToFormat === "") {
      return dateToFormat;
    } else {
      yourDate = new Date(dateToFormat);
    }
    const offset = yourDate.getTimezoneOffset();
    yourDate = new Date(yourDate.getTime() - offset * 60 * 1000);
    return yourDate.toISOString().split("T")[0];
  };

  const ClearFilters = () => {
    setStartDate(null);
    setEndDate(null);
    setDistrictData("");
    setCountryData(localStorage.getItem("userRegion"));
    setStateData("");
    setKeyVal(!keyVal);
    let tempCommonpayload = _.cloneDeep(commonPayload);
    tempCommonpayload.stateFilter = "";
    tempCommonpayload.districtFilter = "";
    tempCommonpayload.countryFilter = countryData;
    tempCommonpayload.HTCountryId = countryData;
    tempCommonpayload.startDate = getDate(null);
    tempCommonpayload.endDate = getDate(null);
    localStorage.removeItem("dashboardFilters");
    if (tempCommonpayload !== commonPayload) {
      setCommonPayload(tempCommonpayload);
    }
  };

  const ApplyFilters = () => {
    let tempCommonpayload = _.cloneDeep(commonPayload);
    tempCommonpayload.stateFilter = stateData;
    tempCommonpayload.districtFilter = districtData;
    tempCommonpayload.startDate = getDate(startDate);
    tempCommonpayload.endDate = getDate(endDate);
    tempCommonpayload.countryFilter = countryData;
    tempCommonpayload.HTCountryId = countryData;

    let dashboardFilters = {
      HTCountryId: countryData,
      countryFilter: countryData,
      stateFilter: stateData,
      districtFilter: districtData,
      startDate: getDate(startDate),
      endDate: getDate(endDate),
    };
    localStorage.setItem("dashboardFilters", JSON.stringify(dashboardFilters));
    if (tempCommonpayload !== commonPayload) {
      setCommonPayload(tempCommonpayload);
    }
  };
  const handleStateChange = (value) => {
    setStateData(value);
    setDistrictData("");
  };

  const handleCountryChange = (value) => {
    setCountryData(value);
    setStateData("");
    setDistrictData("");
    setKeyVal(!keyVal);
  };

  useEffect(() => {
    console.log("dashboardFilterApplied-signedinUserRoleHT", countryData);
    document.title = "Dashboard | ThriveWell";
    //getUserTokens();
  }, []);

  useEffect(() => {
    setCountryData(localStorage.getItem("userRegion"));
    setKeyVal(!keyVal);
    initialCommonPayload.countryFilter = localStorage.getItem("userRegion");
    initialCommonPayload.HTCountryId = localStorage.getItem("userRegion");
    setCommonPayload(initialCommonPayload);
  }, [localStorage.getItem("userRegion")]);

  useEffect(() => {
    console.log("dashboardFilterApplied-signedinUserRoleHT", countryData);
    let savedDashboardFilter = localStorage.getItem("dashboardFilters");
    if (savedDashboardFilter !== null) {
      let jsonbody = JSON.parse(savedDashboardFilter);
      setStartDate(jsonbody.startDate);
      setEndDate(jsonbody.endDate);
      setStateData(jsonbody.stateFilter);
      setDistrictData(jsonbody.districtFilter);
      setCountryData(jsonbody.countryFilter);
      let tempCommonpayload = _.cloneDeep(commonPayload);
      tempCommonpayload.stateFilter = jsonbody.stateFilter;
      setKeyVal(!keyVal);
      tempCommonpayload.HTCountryId = jsonbody.countryFilter;
      tempCommonpayload.districtFilter = jsonbody.districtFilter;
      tempCommonpayload.startDate = jsonbody.startDate;
      tempCommonpayload.endDate = jsonbody.endDate;
      if (tempCommonpayload !== commonPayload) {
        setCommonPayload(tempCommonpayload);
      }
    }
  }, [signedinUserRoleHT]);

  useEffect(() => {
    const fetchCaseManagementReport = async () => {
      try {
        const payload = {
          ...commonPayload,
          languageId: "1",
          HTCountryId: localStorage.getItem("userRegion"),
        };
        const response = await APIS.CaseManagementReport(payload);
        if (response && response.status === 200) {
          const dashboardData = response.data.message.dashboardData;
          // Transform array to object: { placementStatus: noOfChildren, ... }
          const formattedData = dashboardData.reduce((acc, curr) => {
            acc[curr.placementStatus] = curr.noOfChildren;
            return acc;
          }, {});
          console.log("Case Management Report Data:", formattedData);
          setCaseManagementData(formattedData);
        }
      } catch (error) {
        console.error("Failed to fetch case management report:", error);
      }
    };

    fetchCaseManagementReport();
  }, []);

  const getLocalPayload = () => {
    let savedDashboardFilter = localStorage.getItem("dashboardFilters");
    if (savedDashboardFilter !== null) {
      let jsonbody = JSON.parse(savedDashboardFilter);
      let tempCommonpayload = _.cloneDeep(commonPayload);
      tempCommonpayload.countryFilter = jsonbody.countryFilter;
      tempCommonpayload.HTCountryId = jsonbody.countryFilter;
      tempCommonpayload.stateFilter = jsonbody.stateFilter;
      setKeyVal(!keyVal);
      tempCommonpayload.districtFilter = jsonbody.districtFilter;
      tempCommonpayload.startDate = jsonbody.startDate;
      tempCommonpayload.endDate = jsonbody.endDate;
      if (tempCommonpayload !== commonPayload) {
        return tempCommonpayload;
      }
    }
  };

  useEffect(async () => {
    console.log("dashboardFilterApplied-commonpayloadchange", countryData);
    try {
      if (countryData) {
        let payload = localStorage.getItem("dashboardFilters")
          ? getLocalPayload()
          : initialCommonPayload;
        setLoading(true);
        payload.HTCountryId = countryData;
        const response = await APIS.DashboardTileData(payload);
        const redflagResponse = await APIS.ChildRedFlagReport(payload);
        if (response && response.status === 200) {
          const { data } = response.data.message;
          let redflagCount = 0;
          let redFlagPercent = 0;

          if (redflagResponse && redflagResponse.status === 200) {
            redflagCount = redflagResponse.data.message.dataCount;
            redFlagPercent = redflagResponse.data.message.dataPercentage;
          }

          setTileData({
            ...data,
            redflagCount,
            redFlagPercent,
          });
          setLoading(false);
        }
      } else {
        return;
      }
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  }, [commonPayload]);

  return (
    <>
      <Box
        sx={{
          backgroundColor: "background.default",
          minHeight: "100%",
          py: 3,
        }}
      >
        <Grid
          item
          sx={{ display: "flex", flexDirection: "row", flexWrap: "wrap" }}
          mx={2}
        >
          <Typography color="textPrimary" variant="h5">
            {t("common:common.ThriveScale")}
          </Typography>
          <Box
            sx={{
              m: 0.75,
            }}
            style={{ cursor: "text" }}
          >
            <ChevronRightIcon color="disabled" fontSize="small" />
          </Box>
          <Typography color="textPrimary" variant="h5">
            {t("common:common.Dashboard")}
          </Typography>
        </Grid>

        <Grid container width={1}>
          <Grid item xs={12} sm={12}>
            <Grid
              container
              rowSpacing={1}
              columnSpacing={{ xs: 2, sm: 2, md: 2 }}
              sx={{ p: 2 }}
            >
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <Grid item>
                  {/* <Grid item xl={2} lg={2} md={6} xs={12} sm={12}> */}
                  <DatePicker
                    id="startDate"
                    slotProps={{ textField: { fullWidth: true, error: false } }}
                    label={t("common:common.StartDate")}
                    value={dayjs(startDate)}
                    onChange={(newValue) => {
                      setStartDate(newValue);
                    }}
                    format={DateFormatFromRegion()}
                    maxDate={dayjs(endDate)}
                  />
                </Grid>
                <Grid item>
                  {/* <Grid item xl={2} lg={2} md={6} xs={12} sm={12}> */}
                  <DatePicker
                    id="endDate"
                    slotProps={{
                      textField: { fullWidth: true, error: false },
                    }}
                    sx={{
                      "& .MuiInputBase-input": {
                        marginRight: 2,
                      },
                    }}
                    label={t("common:common.EndDate")}
                    value={dayjs(endDate)}
                    onChange={(newValue) => {
                      setEndDate(newValue);
                    }}
                    format={DateFormatFromRegion()}
                    //maxDate={endDate}
                    minDate={dayjs(startDate)}
                  />
                </Grid>
                
                {[SUPER_ADMIN].includes(signedinUserRoleHT) && (
                  <>
                    <Grid
                      item
                      xl={1.5}
                      lg={1.5}
                      md={6}
                      xs={12}
                      sm={12}
                      sx={{ mt: -2 }}
                    >
                      <TextField
                        fullWidth
                        id="country"
                        name="country"
                        accessKey="countryName"
                        getValueFunction={(value) => {
                          handleCountryChange(value);
                        }}
                        component={AutoCompleteDropdownToFilter}
                        value={countryData}
                        required={true}
                        key={keyVal}
                        defaultVal={countryData}
                        label="country"
                        options={locationList.filter((locItem) =>
                          localStorage.getItem("userRegion") === "1"
                            ? locItem.id === "1"  // If userRegion is "1", show only item with id "1"
                            : locItem.id !== "1"  // Otherwise, show items with id "2" and "3" (exclude "1")
                        )}
                        textFieldProps={{
                          fullWidth: true,
                          margin: "normal",
                          variant: "outlined",
                          label: t("common:common.Country"),
                        }}
                      />
                    </Grid>
                  </>
                )}
                {[SUPER_ADMIN, ADMIN, ADMIN_CASEWORKER, VIEW_ONLY].includes(signedinUserRoleHT) && (
                  <>
                    <Grid
                      item
                      xl={1.5}
                      lg={1.5}
                      md={6}
                      xs={12}
                      sm={12}
                      sx={{ mt: -2 }}
                    >
                      <TextField
                        fullWidth
                        name="state"
                        id="state"
                        accessKey="stateName"
                        getValueFunction={(value) => {
                          handleStateChange(value);
                        }}
                        component={AutoCompleteDropdownToFilter}
                        value={stateData}
                        required={true}
                        key={keyVal}
                        defaultVal={stateData}
                        label="state"
                        options={getStateList(locationList, countryData) || []}
                        textFieldProps={{
                          fullWidth: true,
                          margin: "normal",
                          variant: "outlined",
                          label: t("common:common.State"),
                        }}
                      />
                    </Grid>
                    {getSelectedCountryDetails(
                      locationList,
                      countryData,
                      stateData
                    )?.districtRequired && (
                      <Grid
                        item
                        xl={1.5}
                        lg={1.5}
                        md={12}
                        xs={12}
                        sm={12}
                        sx={{ mt: -2 }}
                      >
                        <TextField
                          fullWidth
                          id="district"
                          name="district"
                          accessKey="districtName"
                          value={districtData}
                          key={stateData}
                          defaultVal={districtData}
                          getValueFunction={(value) => {
                            setDistrictData(value);
                          }}
                          component={AutoCompleteDropdownToFilter}
                          required={false}
                          label="district"
                          options={
                            getDistrictList(
                              locationList,
                              countryData,
                              stateData
                            ) || []
                          }
                          textFieldProps={{
                            fullWidth: true,
                            margin: "normal",
                            variant: "outlined",
                            label: t("common:common.Region"),
                          }}
                        />
                      </Grid>
                    )}
                  </>
                )}

                <Grid
                  item
                  // xl={1}
                  // lg={1}
                  // md={undefined} // Change this to 6 to take up 6 columns on screens md or above
                  // xs={12}
                  // sm={12}
                >
                  <Button
                    className={classes.extraLargeButton}
                    color="primary"
                    sx={{ width: "100%", height: 56 }} // Add width: '100%' to make the button take up full width
                    variant="contained"
                    onClick={ApplyFilters}
                  >
                    {t("common:common.Apply")}
                    {/* <DoneIcon /> */}
                  </Button>
                </Grid>

                <Grid
                  item
                  // xl={1}
                  // lg={1}
                  // md={6} // Change this to 6 to take up 6 columns on screens md or above
                  // xs={12}
                  // sm={12}
                >
                  <Button
                    className={classes.extraLargeButton}
                    color="primary"
                    sx={{ width: "100%", height: 56 }} // Add width: '100%' to make the button take up full width
                    variant="contained"
                    onClick={ClearFilters}
                  >
                    {t("common:common.Clear")}

                    {/* <ClearIcon /> */}
                  </Button>
                </Grid>
              </LocalizationProvider>
            </Grid>
            <Grid container spacing={1} sx={{ p: 2, alignItems: "flex-start" }}>
              {/* Filtered Cards in the top row with 4 columns */}
              <Grid item xl={12} md={12} xs={12} sm={12} container spacing={1}>
                {filterdCards.slice(0, 6).map((item, index) => (
                  <Grid item key={index} xl={2} lg={4} md={4} sm={12} xs={12}>
                    <DashboardCountWidgets
                      title={t(`common:common.${item.title}`)}
                      sequence={item.sequence}
                      percentageData={
                        item.sequence === 2 && tileData.redFlagPercent
                      }
                      canViewReport={
                        !(
                          item.Report_Allowed_Roles.includes(
                            signedinUserRoleHT
                          ) &&
                          item.Report_Allowed_Acc_Type.includes(signedinOrgType)
                        )
                      }
                      data={_.get(tileData, item.key)}
                      isloading={loading}
                      linkAddress={item.reportLink}
                    />
                  </Grid>
                ))}
              </Grid>
              <Grid
                item
                xl={4}
                lg={4}
                md={4}
                xs={12}
                sm={12}
                container
                spacing={1}
              >
                {[SUPER_ADMIN].includes(signedinUserRoleHT) && (
                  <Grid item xl={12} md={12} xs={12} sm={12}>
                    <ProgressReportCard
                      title={t(
                        "common:common.Progress Report Detail View (children)"
                      )}
                      countryData={countryData}
                    />
                  </Grid>
                )}
                {filterdCards.slice(6).map((item, index) => (
                  <Grid
                    item
                    key={index}
                    xl={12}
                    lg={12}
                    md={12}
                    sm={12}
                    xs={12}
                  >
                    <DashboardCountWidgets
                      title={t(`common:common.${item.title}`)}
                      sequence={1}
                      canViewReport={
                        !(
                          item.Report_Allowed_Roles.includes(
                            signedinUserRoleHT
                          ) &&
                          item.Report_Allowed_Acc_Type.includes(signedinOrgType)
                        )
                      }
                      data={_.get(tileData, item.key)}
                      isloading={loading}
                      linkAddress={item.reportLink}
                    />
                  </Grid>
                ))}
                <Grid item xl={12} md={12} xs={12} sm={12}>
                  <ReportsPieChart
                    data={1}
                    loading={loading}
                    canViewReport={
                      [
                        MIRACLE,
                        GOVT_CCI,
                        GOVT_ORG,
                        PRIVATE_CCI,
                        NGO_PARTNER,
                      ].includes(signedinOrgType) &&
                      [SUPER_ADMIN, ADMIN, ADMIN_CASEWORKER].includes(
                        signedinUserRoleHT
                      )
                    }
                    title={t("common:common.Children in Case Management")}
                    reportLink={"/dashboard/reportsCaseManagement"}
                    tileData={tileData}
                    res={
                      caseManagementData
                        ? (({ "Follow up/Evaluate": _, ...rest }) => rest)(
                            caseManagementData
                          )
                        : []
                    }
                    labels={["Intake", "Assessment", "Planning", "Case Closed"]}
                  />
                  <ReportsPieChart
                    data={2}
                    loading={loading}
                    canViewReport={
                      [
                        MIRACLE,
                        GOVT_CCI,
                        GOVT_ORG,
                        PRIVATE_CCI,
                        NGO_PARTNER,
                      ].includes(signedinOrgType) &&
                      [SUPER_ADMIN, ADMIN, ADMIN_CASEWORKER].includes(
                        signedinUserRoleHT
                      )
                    }
                    reportLink={"/dashboard/reportsChildStatus"}
                    title={t("common:common.Child Status")}
                    res={tileData?.childStatus ? tileData?.childStatus[0] : []}
                    labels={["Orphan", "Semi-Orphan", "Economic Orphan"]}
                  />
                  <ReportsPieChart
                    data={3}
                    loading={loading}
                    canViewReport={
                      [
                        MIRACLE,
                        GOVT_CCI,
                        GOVT_ORG,
                        PRIVATE_CCI,
                        NGO_PARTNER,
                      ].includes(signedinOrgType) &&
                      [SUPER_ADMIN, ADMIN, ADMIN_CASEWORKER].includes(
                        signedinUserRoleHT
                      )
                    }
                    reportLink={"/dashboard/reportsCurrentPlacement"}
                    title={t("common:common.Current Placement")}
                    res={
                      tileData?.childPlacement
                        ? tileData?.childPlacement[0]
                        : []
                    }
                    labels={[
                      "Foster care",
                      "Semi- independent living",
                      "Parents/step parents",
                      "Other",
                      "Independent living",
                      "Kinship",
                      "CCI",
                      "After care",
                      "Group living",
                    ]}
                  />
                </Grid>
              </Grid>
              <Grid item xl={8} md={8} lg={8} xs={12} sm={12}>
                <ReportsTrafficSources
                  payload={commonPayload}
                  languageValue={languageChange}
                  title={t(
                    "common:common.Average Thrive Scale Scores (children)"
                  )}
                  chartData1={"chartData"}
                  sx={{ height: "100%" }}
                />
                <ReportsTrafficSources
                  payload={commonPayload}
                  languageValue={languageChange}
                  isFamily={true}
                  title={t(
                    "common:common.Average Thrive Scale Scores (families)"
                  )}
                  chartData1={"chartData"}
                  sx={{ height: "100%", mt: 1 }}
                />
                <ReportsTrafficSources
                  payload={commonPayload}
                  languageValue={languageChange}
                  title={t("common:common.Newly Added Children")}
                  chartData1={"dataTemplate"}
                  showCheckbox={false}
                  showLabels={false}
                  sx={{ height: "100%", mt: 1 }}
                />
                <ReportsTrafficSources
                  payload={commonPayload}
                  languageValue={languageChange}
                  title={t("common:common.Children in CCI")}
                  chartData1={"data"}
                  showCheckbox={false}
                  showLabels={false}
                  sx={{ height: "100%", mt: 1 }}
                />
              </Grid>
              <Grid item xl={12} md={12} lg={12} xs={12} sm={12}>
                <ReportsTrafficSources
                  payload={commonPayload}
                  languageValue={languageChange}
                  title={t("common:common.No of Children Reintegrated")}
                  chartData1={"data1"}
                  showCheckbox={false}
                  showLabels={false}
                  sx={{ height: "100%" }}
                />
              </Grid>
              {[SUPER_ADMIN].includes(signedinUserRoleHT) && (
                <Grid
                  item
                  container
                  spacing={1}
                  xl={12}
                  md={12}
                  lg={12}
                  xs={12}
                  sm={12}
                >
                  <Grid item xl={6} md={6} lg={6} xs={12} sm={12}>
                    <MapComponent
                      countryData={countryData}
                      mapCategory={"org"}
                      sx={{ height: "100%" }}
                    />
                  </Grid>
                  <Grid item xl={6} md={6} lg={6} xs={12} sm={12}>
                    <MapComponent
                      countryData={countryData}
                      mapCategory={"child"}
                      sx={{ height: "100%" }}
                    />
                  </Grid>
                </Grid>
              )}
            </Grid>
          </Grid>
        </Grid>
      </Box>
    </>
  );
};

export default LegacyOverviewPage;
