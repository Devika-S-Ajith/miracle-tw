import { React, useState, useEffect, useContext, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Box,
  Container,
  Grid,
  Typography,
  CircularProgress,
  Table,
  Card,
  Button,
  TextField,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Pagination,
  IconButton,
  InputAdornment,
  Tooltip
} from "@material-ui/core";
import * as XLSX from 'xlsx';
import Scrollbar from "../Components/ScrollBar";
import SearchIcon from '../../../assets/icons/Search';
import ClearIcon from '@material-ui/icons/Clear';
import useSettings from "../../../common/hooks/UseSettings";
import { useTranslation } from "react-i18next";
import APIS from "../../../common/hooks/UseApiCalls";
import LocalizationProvider from "@mui/lab/LocalizationProvider";
import DateAdapter from "@mui/lab/AdapterDateFns";
import DatePicker from "@mui/lab/DatePicker";
import moment from "moment";
import ChevronLeftIcon from "../../../assets/icons/ChevronLeft";
import toast from 'react-hot-toast';
import UploadIcon from '../../../assets/icons/Upload';
import CustomDialogModal from "../../Child/Components/CustomDialogModal";
import { ConvertToXLSX } from "../../../components/UserComponents/ReportGenerator";





function ProgressReport() {
  const location = useLocation();
  const fromDashboard = location.state && location.state.fromDashboard;
  let dashboardFilter = localStorage.getItem("dashboardFilters");
  let initialData = fromDashboard === true ? JSON.parse(dashboardFilter) : null;
  const navigate = useNavigate();
  const [startDate, setStartDate] = useState(
    initialData === null ? null : initialData.startDate
  );
  const [endDate, setEndDate] = useState(
    initialData === null ? null : initialData.endDate
  );

  const [pageCount, setPageCount] = useState(1);
  const [progressList, setProgresstList] = useState();
  const [progressReportModal, setProgressReportModal] = useState(false)
  const [progressReportData, setProgressReportData] = useState()
  const [assessmentIdForReport, setassessmentIdForReport] = useState(null)
  const { settings } = useSettings();
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const { t } = useTranslation(["common"]);
  const [isExportDisabled, setIsExportDisabled] = useState(true);
  const [keyVal, setKeyVal] = useState(false)
  const [query, setQuery] = useState('')
  const [isInitialRender, setIsInitialRender] = useState(true);
  let tableHead = [
    { name: t("common:common.Child Name") },
    { name: t("common:common.Case Worker") },
    { name: t('common:common.Assessment Submitted on') },
    { name: t('common:common.Progress Report Submission Date') },
    { name: t("common:common.Actions") },
  ];


  const getProgressList = useCallback(async (payload) => {
    try {
      setLoading(true)
      payload.webStatus = true
      await APIS.ProgressReportListForChild(payload).then((resp) => {
        if (resp && resp.data && resp.data.data) {
          setProgresstList(resp.data?.data?.rows);
          setPageCount(resp.data.data.count)
          setLoading(false);
          if(resp.data.data && resp.data.data.rows.length === 0){
            setIsExportDisabled(true)
           }else{
            setIsExportDisabled(false)
           }
        } else {
          setLoading(false);
        }
      })
      
    } catch (err) {
      console.error(err);
      setLoading(false)
    }
  }, []);

  const handleViewProgressReport = (assessmentId) => {
    setassessmentIdForReport(assessmentId)
    getProgressReportData(assessmentId)
    
  }

  const getProgressReportData = useCallback(async (assessmentId) => {
    try {
        setLoading(true)
        let payload = {
            "HTAssessmentId": assessmentId
        }
        const data = await APIS.viewFollowUpProgress(payload);
        setProgressReportModal(true)
        setProgressReportData(data?.data?.data)
        setLoading(false)
    } catch (err) {
        console.error(err);
        setLoading(false)
    }
}, []);



  const ClearFilters = () => {
    setStartDate(null);
    setEndDate(null);
    setQuery('')
    setKeyVal(!keyVal)
  };

  const ClearSearchQuery = () => {
    setQuery('')
  }

  function utcToLocal(utcDateTime) {
    const localDateTime = moment.utc(utcDateTime).local();
    return localDateTime.format('DD/MM/YYYY');
  }

  const handlePageChange = (event, value) => {
    setPage(value);
    let startdateformat;
    let enddateformat;
    console.log({ startDate });
    if (startDate && endDate) {
      startdateformat = moment(startDate).format("YYYY-MM-DD");
      enddateformat = moment(endDate).format("YYYY-MM-DD");
      console.log(startdateformat, enddateformat);
    }
    let payload = {
      "limit": "10",
      "start": value,
      "childName": query,
      "fromDate": startdateformat,
      "toDate": enddateformat
    };
    getProgressList(payload);
  };


  const handleQueryChange = (event) => {
    setQuery(event.target.value);
  }



  const handleFilter = () => {
    setPage(1)
    let startdateformat;
    let enddateformat;
    console.log({ startDate });
    if (startDate && endDate) {
      startdateformat = moment(startDate).format("YYYY-MM-DD");
      enddateformat = moment(endDate).format("YYYY-MM-DD");
      console.log(startdateformat, enddateformat);
    }
    let payload = {
      "limit": "10",
      "start": 1,
      "childName": query,
      "fromDate": startdateformat,
      "toDate": enddateformat
    };
    getProgressList(payload);
  };


  useEffect(() => {
    document.title = "Reports | Progress Report | Miracle Foundation"
    if (initialData === null) {
      let payload = {
        "limit": 10,
        "start": 1,
        "childName": "",
        "fromDate": '',
        "toDate": ''
      }
      getProgressList(payload);
    } else if (initialData) {

      let payload = {
        "limit": 10,
        "start": 1,
        "childName": "",
        "fromDate": initialData.startDate,
        "toDate": initialData.endDate
      }
      getProgressList(payload);
    }
  }, []);


  useEffect(() => {
    if(!isInitialRender){
      handleFilter();
    }else{
      setIsInitialRender(false)
    }
   
  }, [startDate, endDate, query]);

  const handleExport = useCallback(async () => {
    try {
      let startdateformat;
      let enddateformat;
      console.log({ startDate });
      if (startDate && endDate) {
        startdateformat = moment(startDate).format("YYYY-MM-DD");
        enddateformat = moment(endDate).format("YYYY-MM-DD");
        console.log(startdateformat, enddateformat);
      }
      let finalPayload;
      let payload = {
        "limit":100,
        "start":1,
        "childName":query,
        "fromDate":startdateformat,
        "toDate":enddateformat,
        "type":"list"
      }
      console.log("final payload in export>>", finalPayload)
      const data = await APIS.generarateProgressReportList(payload);
      if (data?.data) {
        ConvertToXLSX(data?.data,'Progress Report Child List')
      }
      else if (data.data.Message === "Unauthorized") {
        toast.error(t('common:common.Unauthorized'));
      }
    } catch (err) {
      console.error(err);
    }

  })
  return (
    <Box
      sx={{
        backgroundColor: "background.default",
        minHeight: "100%",
        pt: 2,
      }}
    >
      <Container maxWidth={settings.compact ? "xl" : false}>
        <Grid container justifyContent="space-between" spacing={3}>
          <Grid item>
            <Grid item sx={{ display: "flex", flexDirection: "row" }}>
              <IconButton
                color="inherit"
                onClick={() => navigate(-1)}
                sx={{
                  mt: -0.5,
                }}
              >
                <ChevronLeftIcon fontSize="small" />
              </IconButton>
              <Typography color="textPrimary" variant="h5">
                {t("common:common.Progress Report")}
              </Typography>
            </Grid>
            <Grid item>
              <Box
                sx={{
                  mb: -1,
                  mx: -1,
                  mt: -1
                }}
              >

                <Button
                  color="primary"
                  startIcon={<UploadIcon fontSize="small" />}
                  sx={{ m: 2 }}
                  onClick={handleExport}
                  disabled={isExportDisabled}
                >
                  {t('common:common.Export')}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Grid>
      </Container>
      <Scrollbar>
        <Card sx={{ m: 4 }}>
          <Box sx={{ minWidth: 700, m: 1 }}>
            {loading && (
              <CircularProgress
                sx={{
                  zIndex: 1000,
                  position: "absolute",
                  top: "55%",
                  left: "45%",
                }}
                color="primary"
              />
            )}
            <Container maxWidth={settings.compact ? "xl" : false}>
              <Grid container spacing={3} sx={{ pt: 3 }}>
                <Grid item xl={4}
                  md={4}
                  xs={12}
                  sx={{ mx: -1 }}>
                  <TextField
                    fullWidth
                    InputProps={{
                      startAdornment:
                        <InputAdornment position="start">
                          <SearchIcon fontSize="small" />
                        </InputAdornment>,
                      endAdornment:
                        query.length > 0 && <IconButton
                          color="inherit"
                          onClick={() => ClearSearchQuery()}>
                          <ClearIcon />
                        </IconButton>
                    }}
                    onChange={handleQueryChange}
                    placeholder={t('common:child.Search By Child Name')}
                    value={query}
                    variant="outlined"
                  />
                </Grid>
                <Box
                  sx={{
                    flexGrow: 1,
                  }}
                />
                <LocalizationProvider dateAdapter={DateAdapter}>
                  <Grid item xl={2.5} md={2.5} xs={12} >

                    <DatePicker
                      label={t("common:common.StartDate")}
                      value={startDate}
                      format="dd/MM/yyyy"
                      inputFormat="dd/MM/yyyy"
                      onChange={(newValue) => {
                        setStartDate(newValue);
                      }}
                      renderInput={(params) => (
                        <TextField fullWidth {...params} />
                      )}
                    />
                  </Grid>
                  <Grid item xl={2.5} md={2.5} xs={12} sx={{ mx: -1 }}>
                    <DatePicker
                      label={t("common:common.EndDate")}
                      minDate={startDate}
                      value={endDate}
                      format="dd/MM/yyyy"
                      inputFormat="dd/MM/yyyy"
                      onChange={(newValue) => {
                        setEndDate(newValue);
                      }}
                      renderInput={(params) => (
                        <TextField fullWidth {...params} />
                      )}
                    />
                  </Grid>



                  <Grid item xl={2} md={2} xs={12}>
                    <Button
                      color="primary"
                      sx={{ p: 2 }}
                      variant="contained"
                      onClick={ClearFilters}
                    >
                      {t("common:common.Clear Filters")}
                    </Button>
                  </Grid>
                </LocalizationProvider>
              </Grid>
            </Container>
            <Table>
              <TableHead>
                <TableRow>
                  {tableHead.map((item, index) => {
                    return <TableCell align="center" sx={{ fontWeight: 'bold' }} key={index}>{item.name}</TableCell>;
                  })}
                </TableRow>
              </TableHead>

              {progressList &&
                progressList.map((ProgressListItem, index) => {
                  return (
                    <TableBody key={index}>
                      <TableRow>
                        <TableCell align="center">{ProgressListItem.childFirstName + ' ' + ProgressListItem.childLastName}</TableCell>
                        <TableCell align="center">{ProgressListItem.caseWorkerfirstName + ' ' + ProgressListItem.caseworkerlastName}</TableCell>
                        <TableCell align="center">{utcToLocal(ProgressListItem.assessmentCompletionDate)}</TableCell>
                        <TableCell align="center">{ProgressListItem.followUpCompletedOn ? utcToLocal(ProgressListItem.followUpCompletedOn) : '--'}</TableCell>
                        <TableCell
                          align="center"
                        >
                          <Tooltip title={t('common:form.ViewProgressReport')}>
                            <Button
                              disabled={ProgressListItem.followUpStatus == 'Completed' ? false : true}
                              style={{ borderRadius: 4 }}
                              variant="contained"
                              size='small'
                              onClick={() => handleViewProgressReport(ProgressListItem.HTAssessmentId)}
                            >
                              View
                            </Button>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  );
                })}
            </Table>
            {progressList && progressList.length === 0 && (
              <Box sx={{ width: "100%", ml: "40%", mt: 5, mb: 1 }}>
                <Box>
                  <Grid container spacing={3}>
                    <Grid
                      item
                      md={3} //6
                      xs={6} //12
                    >
                      <Typography>{t("common:common.No match")}</Typography>
                    </Grid>
                  </Grid>
                </Box>
              </Box>
            )}
          </Box>
          <Box sx={{ display: "flex" }} flexDirection="row-reverse" p={1} m={1}>
            <Box sx={{ alignContent: "flex-end" }}>
              <Pagination
                onChange={handlePageChange}
                page={page}
                count={pageCount}
                shape="rounded"
              />
            </Box>
          </Box>
        </Card>
        <CustomDialogModal progressReportData={progressReportData} assessmentIdForReport={assessmentIdForReport} setProgressReportModal={setProgressReportModal} progressReportModal={progressReportModal} />
      </Scrollbar>
    </Box>
  );
}

export default ProgressReport;
