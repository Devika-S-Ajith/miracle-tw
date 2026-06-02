import {React,useState,useEffect,useContext,useCallback} from 'react'
import { useNavigate, useLocation } from 'react-router-dom';
import { Box,Container, Grid, Typography,CircularProgress,Table,Card, Button,
    // TextField,
    TableBody,
    TableCell,
    TableHead,
    TableRow, Pagination, IconButton,TextField} from '@material-ui/core';
import Scrollbar from '../../Dashboard/Components/ScrollBar';
import useSettings from '../../../common/hooks/UseSettings';
import { useTranslation } from 'react-i18next';
import APIS from '../../../common/hooks/UseApiCalls';
import { CommonDataContext } from '../../../common/contexts/CommonDataContext';
import LocalizationProvider from '@mui/lab/LocalizationProvider';
import DateAdapter from '@mui/lab/AdapterDateFns';
// import DatePicker from '@mui/lab/DatePicker';
import moment from 'moment';
import ChevronLeftIcon from '../../../assets/icons/ChevronLeft';
import toast from 'react-hot-toast';
import UploadIcon from '../../../assets/icons/Upload';
import AutoCompleteDropdownToFilter from '../../../components/UserComponents/AutoCompleteDropdownToFilter'
// import { common } from '@material-ui/core/colors';
function ReportsAverageChangeInThriveScale() {
    const location = useLocation();
    const fromDashboard = location.state && location.state.fromDashboard
    let dashboardFilter =localStorage.getItem('dashboardFilters');
    let initialData = fromDashboard=== true ? JSON.parse(dashboardFilter): null;
    const navigate = useNavigate();
    const [startDate, setStartDate] = useState(initialData === null ? null :initialData.startDate);
    const [endDate, setEndDate] = useState(initialData === null ? null :initialData.endDate);
    const [reportData, setReportData] = useState();
    const {locationList,signedinUserRole} = useContext(CommonDataContext);
    const [pageCount, setPageCount] = useState(1);
    const { settings } = useSettings();
    const [loading,setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const { t } = useTranslation(['common']);
    const [stateFilter, setStateFilter] = useState(initialData === null ? "" :initialData.stateFilter);
    const [districtFilter, setDistrictFilter] = useState(initialData === null ? "" :initialData.districtFilter);
    const [countryFilter,setCountryFilter]= useState(initialData === null ? localStorage.getItem('userRegion') :initialData.countryFilter)
    const [percentChangeData, setPercentChangeData] = useState("false");
    const [timePeriodData, setTimePeriodData] = useState("1 month");
    const [avChangeData, setAvChangeData] = useState('');
    const [avTimeData, setAvTimeData] = useState('');
    const [totalTSData, setTotalTSData] = useState('');
    const [payloadData, setPayloadData] = useState({});
    const [isExportDisabled, setIsExportDisabled] = useState(true);
    const[keyVal,setKeyVal]=useState(false)
    const changeMorethanList=[
      {
       value:t(`common:common.Yes`),
       id:'true' 
      },
      {
        value:t(`common:common.No`),
        id:'false' 
       },
    ]
    const timePeriodList=[
      {
       value:t(`common:common.> 2 years`),
       id:'> 2 years' 
      },
      {
        value:t(`common:common.> 1 year`),
        id:'> 1 year' 
      },
      {
        value:t(`common:common.1 year`),
        id:'1 year' 
      },
      {
        value:t(`common:common.6 months`),
        id:'6 months' 
      },
      {
        value:t(`common:common.3 months`),
        id:'3 months' 
      },
      {
        value:t(`common:common.1 month`),
        id:'1 month' 
      },
                         
    ]
   
  const ClearFilters = () => {
    //setStartDate(null);
    //setEndDate(null);
    setDistrictFilter('');
    setStateFilter('');
    setCountryFilter(localStorage.getItem('userRegion'))
    setTimePeriodData("1 month");
    setPercentChangeData("false")
    setKeyVal(!keyVal)
    getAveragePercentChangeData(null);
  }
    const handlePageChange = (event, value) => {
        getAveragePercentChangeData({
          "pageNumber": value,
          "HTCountryId":countryFilter,
          "stateFilter" : value,
          "districtFilter":districtFilter,
          "timePeriodFilter" : timePeriodData,
          "scoreChangeFilter" : percentChangeData,
          //  "orgTypeFilter" : typeFilter,
          //   "orgStatus" : statusFilter
        })
        setPage(value);
      }
      const handleStateFilter = (value) => {
          console.log(value);
        let payload = {
          "stateFilter" : value,
          "HTCountryId":countryFilter,
          "districtFilter":'',
          "timePeriodFilter" : timePeriodData,
          "scoreChangeFilter" : percentChangeData,
          "pageNumber" : "1"
        }
        getAveragePercentChangeData(payload)
        setStateFilter(value);
        setPage(1);
      };

      const handleCountryChange = (value) => {
        setCountryFilter(value);
        setStateFilter('')
        setDistrictFilter('')
        setKeyVal(!keyVal)
      let payload = {
        "districtFilter" : '',
        "pageNumber" : "1",
        "rowCount": "10",
        "stateFilter" : '',
        "startDate": startDate,
        "endDate": endDate,
        "HTCountryId":value,
      }
      getAveragePercentChangeData(payload)
      setPage(1);
    };

      const handleDistrictFilter = (value) => {
        console.log(value);
      let payload = {
          "HTCountryId":countryFilter,
          "stateFilter" : stateFilter,
          "districtFilter":value,
          "timePeriodFilter" : timePeriodData,
          "scoreChangeFilter" : percentChangeData,
          "pageNumber" : "1"
      }
      getAveragePercentChangeData(payload)
      setDistrictFilter(value);
      setPage(1);
    };

    const handlePercentFilter = (value) => {
        console.log(value);
      let payload = {
        "HTCountryId":countryFilter,
        "stateFilter" : stateFilter,
        "districtFilter":districtFilter,
        "scoreChangeFilter" : value,
        "timePeriodFilter" : timePeriodData,
        "pageNumber" : "1"
      }
      getAveragePercentChangeData(payload)
      setPercentChangeData(value);
      setPage(1);
    };

    const handleTimePeriodFilter = (value) => {
        console.log(value);
      let payload = {
        "HTCountryId":countryFilter,
        "stateFilter" : stateFilter,
        "districtFilter":districtFilter,
        "timePeriodFilter" : value,
        "scoreChangeFilter" : percentChangeData,
        "pageNumber" : "1"
      }
      getAveragePercentChangeData(payload)
      setTimePeriodData(value);
      setPage(1);
    };

    const handleDateFilter=()=>{
        let startdateformat
        let enddateformat
        console.log({startDate})
        if(startDate && endDate){
            startdateformat = moment(startDate).format('YYYY-MM-DD')
            enddateformat =moment(endDate).format('YYYY-MM-DD')
            console.log(startdateformat,enddateformat)
        }
        let payload = {
            "rowCount": "10",
            "pageNumber": "1",
            "startDate": startdateformat,
            "endDate": enddateformat
          }
          getAveragePercentChangeData(payload)
        
    }
      let tableHead = [
        {name : t('common:common.Child ID')},
        {name : t('common:common.Family ID')},
        {name : t('common:common.Change in Score')},
        {name : t('common:common.Time Period (Days)')},
        {name : t('common:common.Date of ThriveScore')},
        {name : t('common:common.Stage')},
    ]
    const defaultPayload={
        "rowCount": "10",
        "pageNumber": "1",
        "HTCountryId":localStorage.getItem('userRegion'),
        "stateFilter": "",
        "districtFilter": "",
        // "startDate": "",
        // "endDate": "",
        "scoreChangeFilter":"false",
        "timePeriodFilter":"1 month"
    }
    let payloadAddon={
        "rowCount": "10",
        "pageNumber": "1",
        "HTCountryId":localStorage.getItem('userRegion'),
        "stateFilter": "",
        "districtFilter": "",
        // "startDate": "",
        // "endDate": "",
        "scoreChangeFilter":"false",
        "timePeriodFilter":"1 month"
    }

    useEffect(() => {
        document.title = "Reports | Average % change in Thrive Scale | Miracle Foundation"
        if(initialData===null)
        {
            getAveragePercentChangeData();
        }
        else if(initialData) 
        {
            let payload={
                "rowCount": "10",
                 "pageNumber": "1",
                "stateFilter": initialData.stateFilter,
                "districtFilter":initialData.districtFilter,
                "startDate": initialData.startDate,
                "endDate": initialData.endDate,
                "HTCountryId":initialData.countryFilter
            }
            getAveragePercentChangeData(payload);
        }
    }, [])

    useEffect(() => {
        handleDateFilter();
    },[startDate,endDate])

    const getAveragePercentChangeData= useCallback(async(payload=null)=>{
        try{
            setLoading(true)
            let finalPayload
            if(payload === null){
            finalPayload = defaultPayload
            } else {
                finalPayload = { ...payloadAddon, ...payload};
                payloadAddon = { ...finalPayload }
            }
            console.log("final payload >>",finalPayload)
            setPayloadData(finalPayload)
            await APIS.AverageChangeTS(finalPayload).then((resp)=>{
                if(resp && resp.data){
                    setReportData(resp.data.data);
                    setAvChangeData(resp.data.avgChangeInTSscore);
                    setAvTimeData(resp.data.avgTimePeriod);
                    setTotalTSData(resp.data.totalTSCompleted);
                    setLoading(false);
                    setPageCount(resp.data.pageCount)
                    if(resp.data.data && resp.data.data.length === 0){
                      setIsExportDisabled(true)
                     }else{
                      setIsExportDisabled(false)
                     }
                    // console.log("page count ",resp.data.pageCount)
                    // console.log({pageCount})
                }else{
                    console.log("else");
                    setLoading(false);
                }
        })
        }
        catch(err){
            console.log("error catch");
          }
    })
    const handleExport = useCallback(async () =>{
      try {
        let finalPayload;
        let payload ={
          "moduleType": "report",
          "needFullData": "true",
          "subModuleType": "avgPercentChangeTScore",
         }
        finalPayload={...payloadData,...payload}
        finalPayload.HTCountryId = countryFilter
        console.log("final payload in export>>",finalPayload)
        const data = await APIS.ExportFile(finalPayload);
        if(data.data.Message ==="Data export started.")
        {
        toast.success(t('common:common.Data export started'));
        }  
        else if(data.data.Message==="Unauthorized")
        {
          toast.error(t('common:common.Unauthorized'));
        }
      } catch (err) {
        console.error(err);
      }
  
  })
    return (
        <Box
            sx={{
            backgroundColor: 'background.default',
            minHeight: '100%',
            pt : 2 //new style
            //py: 8
            }}
        >
            <Container maxWidth={settings.compact ? 'xl' : false}>
            <Grid
                container
                justifyContent="space-between"
                spacing={3}
            >
              <Grid item>
                <Grid item sx={{display : "flex",flexDirection : "row"}}>
                <IconButton
              color="inherit"
              onClick={()=>navigate(-1)}
              sx={{
                // display: {
                //   md: 'none'
                // }
                mt : - 0.5
              }}
              >
              <ChevronLeftIcon fontSize="small" />
              </IconButton>  
                <Typography
                    color="textPrimary"
                    variant="h5"
                >
                    {t('common:common.Average % change in Thrive Scale')}

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
            <Card sx={{ m:4}}>
         
            
            <Box sx={{ minWidth: 700 , m: 2}}>
            {loading && <CircularProgress 
                            sx={{zIndex : 1000,
                                  position : "absolute",
                                  top : "55%",
                                  left : "45%"}}
                            color="primary" />}
            <Container maxWidth={settings.compact ? 'xl' : false}>
             <Grid 
            container
            spacing={3}
            sx={{pt:3}}
            >
            <LocalizationProvider dateAdapter={DateAdapter}>
            {/* <Grid item
              xl={2}
              md={2}
              xs={12}>
                <DatePicker
                    label={t('common:common.StartDate')}
                    value={startDate}
                    format="dd/MM/yyyy"
                    inputFormat="dd/MM/yyyy"
                    onChange={(newValue) => {
                    setStartDate(newValue);
                    }}
                    // onChange={handleStartFilter}
                    renderInput={(params) => <TextField fullWidth {...params} />}
                />    

              </Grid>
              <Grid item
                xl={2}
                md={2}
                xs={12}>
                    <DatePicker
                    label={t('common:common.EndDate')}
                    minDate={startDate}
                    value={endDate}
                    format="dd/MM/yyyy"
                    inputFormat="dd/MM/yyyy"
                    onChange={(newValue) => {
                    setEndDate(newValue);
                    }}
                    renderInput={(params) => <TextField  fullWidth {...params} />}
                /> 
              </Grid> */}
              {signedinUserRole ==='superadmin' && <Grid
                  item
                  xl={2}
                  md={2}
                  xs={12}
                  sx={{ mt: -2,ml:-1 }}
                >
                <TextField                
                  fullWidth                
                  name="country"
                  accessKey="countryName"
                  getValueFunction={(value)=>{handleCountryChange(value)}}
                  component={AutoCompleteDropdownToFilter}
                  value={countryFilter}
                  key={keyVal}
                  required={true}
                  defaultVal={countryFilter}
                  label="country"
                  options={locationList && locationList.countries }
                  textFieldProps={{
                  fullWidth: true,
                    margin: "normal",
                    variant: "outlined",
                    label:t('common:common.Country')
                 }}
           
                />
                </Grid>}
              <Grid item xl={2}
              md={2}
              xs={12}
              sx={{ mt: -2,mx:-1 }}>
             
                <TextField                
                  fullWidth                
                  name="state"
                  accessKey="stateName"
                  key={keyVal}
                  defaultVal={stateFilter}
                  getValueFunction={(value)=>{handleStateFilter(value)}}
                  component={AutoCompleteDropdownToFilter}
                  required={true}
                  label="state"
                  options={locationList && locationList.states && locationList.states.length &&  locationList.states.filter( (item) =>item.HTCountryId===localStorage.getItem('userRegion'))}
                  textFieldProps={{
                  fullWidth: true,
                    margin: "normal",
                    variant: "outlined",
                    label:t('common:common.State/Region')
                 }}
           
                />
              </Grid>
              <Grid item xl={2}
              md={2}
              xs={5}
              sx={{ mt: -2,mx:-1 }}
              >
               <TextField                
                  fullWidth                
                  name="district"
                  accessKey="districtName"
                  value={districtFilter}
                  key={stateFilter}
                  defaultVal={districtFilter}
                  getValueFunction={(value)=>{handleDistrictFilter(value)}}
                  component={AutoCompleteDropdownToFilter}
                  required={true}
                  label="district"
                  options={locationList && locationList.districts && locationList.districts.length &&  locationList.districts.filter( (item) =>item.HTStateId===stateFilter)}
                  textFieldProps={{
                  fullWidth: true,
                    margin: "normal",
                    variant: "outlined",
                    label:t('common:common.District/County')
                 }}
                 />
              </Grid>
              
              <Grid item xl={2}
              md={2}
              xs={5}
              sx={{ mt: -2,mx:-1 }}
              >
               <TextField                
                  fullWidth                
                  name="demo-simple-select"
                  accessKey="value"
                  value={percentChangeData}
                  key={keyVal}
                  getValueFunction={(value)=>{handlePercentFilter(value)}}
                  component={AutoCompleteDropdownToFilter}
                  label="demo-simple-select"
                  options={changeMorethanList}
                  textFieldProps={{
                  fullWidth: true,
                    margin: "normal",
                    variant: "outlined",
                    label:t('common:common.Changes more than 5%')
                 }}
                 />
              </Grid>
              
              <Grid item xl={2}
              md={2}
              xs={5}
              sx={{ mt: -2,mx:-1 }}
              >
               <TextField                
                  fullWidth                
                  name="demo-simple-select-label"
                  accessKey="value"
                  value={timePeriodData}
                  key={keyVal}
                  getValueFunction={(value)=>{handleTimePeriodFilter(value)}}
                  component={AutoCompleteDropdownToFilter}
                  label="demo-simple-select-label"
                  options={timePeriodList}
                  textFieldProps={{
                  fullWidth: true,
                    margin: "normal",
                    variant: "outlined",
                    label:t('common:common.Time period')
                 }}
                 />
                 </Grid>
              <Grid item  xl={2} /* -------*/ //!
              md={2}
              xs={12}>
               <Button
                color="primary"
                sx={{ ml: 2, p: 2 }}
                variant="contained"
                onClick={ClearFilters}
              >
              {t('common:common.Clear Filters')}
              </Button>
              </Grid>
            </LocalizationProvider>
            </Grid>
            </Container>
            <Table>
                <TableHead>
                    <TableRow>
                    {tableHead.map((item,index) =>{
                           return (
                        <TableCell key={index}>
                        {item.name}
                        </TableCell>
                           )})}
                    </TableRow>
                </TableHead>
                <TableBody >
                {reportData && reportData.map((item)=>{
                    return (
                
                    <TableRow >
                    <TableCell>
                     {item.ChildId}           
                    </TableCell>
                    <TableCell>
                    {item.FamilyId}  
                    </TableCell>
                    <TableCell>
                    {item.ChangeInScore}
                    </TableCell>
                    <TableCell>
                    {item.TimePeriod}
                    </TableCell> 
                    <TableCell>
                    {item.ThriveScoreDate} 
                    </TableCell>
                    <TableCell>
                    {t(`common:common.${item.Stage}`)}
                    </TableCell>
                     
                    </TableRow>      
                
                 )})}
                    {reportData && reportData.length > 0 &&<TableRow>
                        <TableCell>
                            <b>{t('common:common.Thrive Scale Completed')}:&nbsp;{totalTSData}</b>
                        </TableCell>
                        <TableCell>
                            <b></b>
                        </TableCell>
                        <TableCell>
                            <b>{t('common:common.Average Change')}:&nbsp;{avChangeData}</b>
                        </TableCell>
                        <TableCell>
                            <b>{t('common:common.Average Time Spent')}:&nbsp;{avTimeData}</b>
                        </TableCell>
                        <TableCell>
                            <b></b>
                        </TableCell>
                        <TableCell>
                            <b></b>
                        </TableCell>
                    </TableRow>}
                </TableBody>
            </Table>
            { reportData && reportData.length === 0 &&
          <Box sx={{ width : "100%", ml : "40%", mt : 5,mb :1}}>
            <Box>
                <Grid
                  container
                  spacing={3}
                >
                      <Grid
                        item
                        md={3} //6
                        xs={6} //12
                        >
                          <Typography>{t('common:common.No match')}</Typography>
                      </Grid>
                </Grid>
            </Box>
           </Box>
          }
            </Box>
            <Box sx={{display:'flex'}} flexDirection="row-reverse"  p={1} m={1}>
            <Box sx={{alignContent: 'flex-end'}}>
            <Pagination onChange={handlePageChange} page={page} count={pageCount} shape="rounded" />
            </Box> 
            </Box>
            </Card>
            </Scrollbar>
        </Box>
        
    )
}

export default ReportsAverageChangeInThriveScale;
