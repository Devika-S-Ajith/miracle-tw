import {React,useState,useEffect,useContext,useCallback} from 'react'
import { useNavigate, useLocation } from 'react-router-dom';
import { Box,Container, Grid, Typography,CircularProgress,Table,Card, MenuItem,Button,
    TextField,
    TableBody,
    TableCell,
    TableHead,
    TableRow, Pagination,FormControl,InputLabel, IconButton,Select } from '@material-ui/core';
import Scrollbar from '../../Dashboard/Components/ScrollBar';
import useSettings from '../../../common/hooks/UseSettings';
import { useTranslation } from 'react-i18next';
import APIS from '../../../common/hooks/UseApiCalls';
import { CommonDataContext } from '../../../common/contexts/CommonDataContext';
import LocalizationProvider from '@mui/lab/LocalizationProvider';
import DateAdapter from '@mui/lab/AdapterDateFns';
import DatePicker from '@mui/lab/DatePicker';
import moment from 'moment';
import ChevronLeftIcon from '../../../assets/icons/ChevronLeft';
import LaunchIcon from '@mui/icons-material/Launch';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import toast from 'react-hot-toast';
import UploadIcon from '../../../assets/icons/Upload';
import AutoCompleteDropdownToFilter from '../../../components/UserComponents/AutoCompleteDropdownToFilter'
function DisruptionCases() {
    const location = useLocation();
    const fromDashboard = location.state && location.state.fromDashboard
    let dashboardFilter =localStorage.getItem('dashboardFilters');
    let initialData = fromDashboard=== true ? JSON.parse(dashboardFilter): null;
    const languageList = JSON.parse(localStorage.getItem('languageList'));
    const currentLanguage = localStorage.getItem('language');
    const navigate = useNavigate();
    const [startDate, setStartDate] = useState(initialData === null ? null :initialData.startDate);
    const [endDate, setEndDate] = useState(initialData === null ? null :initialData.endDate);
    const [reportData, setReportData] = useState();
    const {locationList, childCurrentPlacementList,signedinUserRole} = useContext(CommonDataContext);
    const [pageCount, setPageCount] = useState(1);
    const { settings } = useSettings();
    const [loading,setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const { t } = useTranslation(['common']);
    const [countryFilter,setCountryFilter]= useState(initialData === null ? localStorage.getItem('userRegion') :initialData.countryFilter)
    const [stateFilter, setStateFilter] = useState(initialData === null ? "" :initialData.stateFilter);
    const [districtFilter, setDistrictFilter] = useState(initialData === null ? "" :initialData.districtFilter);
    const [modalFlag, setModalFlag] = useState(false);
    const [interventionData, setInterventionData] = useState([]);
    const [payloadData, setPayloadData] = useState({});
    const [isExportDisabled, setIsExportDisabled] = useState(true);
    const[keyVal,setKeyVal]=useState(false)
   
  const ClearFilters = () => {
    setStartDate(null);
    setEndDate(null);
    setCountryFilter(localStorage.getItem('userRegion'))
    setDistrictFilter('');
    setStateFilter('');
    setKeyVal(!keyVal)
    getDisruptionCases(null);
  }
    const handlePageChange = (event, value) => {
        getDisruptionCases({
          "pageNumber": value,
          "districtFilter" : districtFilter,
          "rowCount": "10",
          "stateFilter" : stateFilter,
          "startDate": startDate,
          "endDate": endDate,
          "HTCountryId":countryFilter,
          //  "orgTypeFilter" : typeFilter,
          //   "orgStatus" : statusFilter
        })
        setPage(value);
      }
      const handleStateFilter = (value) => {
          console.log(value);
        let payload = {
          "districtFilter" : '',
          "pageNumber" : "1",
          "rowCount": "10",
          "stateFilter" : value,
          "startDate": startDate,
          "endDate": endDate,
          "HTCountryId":countryFilter,
        }
        getDisruptionCases(payload)
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
      getDisruptionCases(payload)
      setPage(1);
    };


      const handleDistrictFilter = (value) => {
        console.log(value);
      let payload = {
        "districtFilter" : value,
        "pageNumber" : "1",
        "rowCount": "10",
        "stateFilter" : stateFilter,
        "startDate": startDate,
        "endDate": endDate,
        "HTCountryId":countryFilter,
      }
      getDisruptionCases(payload)
      setDistrictFilter(value);
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
          "districtFilter" : districtFilter,
          "stateFilter" : stateFilter,
          "startDate": startdateformat,
          "endDate": enddateformat,
          "HTCountryId":countryFilter,
          }
          getDisruptionCases(payload)
        
    }
      let tableHead = [
        {name : t('common:common.FirstName')},
        {name : t('common:common.LastName')},
        {name : t('common:common.Current Placement')},
        {name : t('common:common.Location')},
        {name : t('common:common.Date of Last Follow-up')},
        {name : t('common:assessment.Intervention Details')}   
    ]
    const defaultPayload={
        "rowCount": "10",
        "pageNumber": "1",
        "stateFilter": "",
        "districtFilter": "",
        "startDate": "",
        "endDate": "",
        "HTCountryId":localStorage.getItem('userRegion')
    }
    let payloadAddon={
        "rowCount": "10",
        "pageNumber": "1",
        "stateFilter": "",
        "districtFilter": "",
        "startDate": "",
        "endDate": "",
        "HTCountryId":localStorage.getItem('userRegion')
    }

    const getLanguageId = () => {
      const langId = languageList.length && languageList.find(item => item.languageCode == currentLanguage)?.id
      return langId == 1 ? "" : langId;
    }
    
    const getInterventionDetails = useCallback(async(event,value)=>{
      event.preventDefault();
      try{
        setLoading(true)
        let payload = {
          "assessment_id":value['HT_cases.HT_assessments.id'],
          "language_id": localStorage.getItem('language') === 'en' ? "" : getLanguageId()
        }
        await APIS.InterventionDetails(payload).then((resp)=>{
          console.log('response:',resp.data.data)
          setInterventionData(resp.data.data)
          setModalFlag(true);
          setLoading(false)
        })

      } catch(err){
        setLoading(false)

      }
    })

    useEffect(() => {
        document.title = "Reports | Disruption Cases | Miracle Foundation"
        if(initialData===null)
        {
            getDisruptionCases();
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
            getDisruptionCases(payload);
        }
    }, [])
    useEffect(() => {
        handleDateFilter();
    }
       , [startDate,endDate])
    const getDisruptionCases= useCallback(async(payload=null)=>{
        // let defaultPayload={
        //         "rowCount": "10",
        //         "pageNumber": "1",
        //         "stateFilter": "",
        //         "districtFilter": "",
        //         "startDate": "2020-02-12",
        //         "endDate": "2022-02-14"
        //     }
        try{
            let finalPayload
            const currentLanguage = localStorage.getItem('language');
            const currentLanguageList = JSON.parse(localStorage.getItem('languageList'));
            let langId;
            if(!currentLanguage || !currentLanguageList.length){
              langId =""
            } else {
              langId = currentLanguage === 'en' ? "" : currentLanguageList.length && currentLanguageList.find(item => item.languageCode == currentLanguage)?.id
            }
            if(payload === null){
            finalPayload = defaultPayload
            } 
            else {
                finalPayload = { ...payloadAddon, ...payload};
                payloadAddon = { ...finalPayload }
            }
            finalPayload.languageId = langId;
            finalPayload.HTCountryId = localStorage.getItem('userRegion')
            console.log("final payload >>",finalPayload)
            setPayloadData(finalPayload)
            await APIS.DisruptionCases(finalPayload).then((resp)=>{
                if(resp && resp.data){
                    setReportData(resp.data.data);
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
          "subModuleType": "disruptionCase",
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
    return (<>
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
                    {t('common:common.DisruptionCases')}

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
            <Grid item
              xl={2}
              md={2}
              xs={12}
              sx={{ mx:-1 }}>
                {/* <DatePicker
                    label="Start Date"
                    // name="startDate"
                    // value={null}
                    // format="dd/MM/yyyy"
                    // inputFormat = "dd/MM/yyyy"
                    // onChange={(newValue) => {
                    // setValue(newValue);
                    // values.birthdate = newValue
                    // }}
                    value={startDate}
                    format="dd/MM/yyyy"
                    inputFormat = "dd/MM/yyyy"
                    onChange={(newValue) => {
                    setValues(newValue);
                    startDate = newValue
                    }}
                    renderInput={(params) => <TextField fullWidth {...params} />}
                    /> */}
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
                xs={12}
                sx={{ mx:-1 }}>
                  {/* <DatePicker
                    label="End Date"
                    defaultValue={values.birthdate}
                    value={values.closedDate}
                    format="dd/MM/yyyy"
                    inputFormat = "dd/MM/yyyy"
                    onChange={(newValue) => {
                    setValue(newValue);
                    values.closedDate = newValue
                    }}
                    renderInput={(params) => <TextField fullWidth {...params} />}
                    /> */}
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
              </Grid>
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
              sx={{ mt: -2}}>
             
                <TextField                
                  fullWidth                
                  name="state"
                  key={keyVal}
                  accessKey="stateName"
                  defaultVal={stateFilter}
                  getValueFunction={(value)=>{handleStateFilter(value)}}
                  component={AutoCompleteDropdownToFilter}
                  label="state"
                  options={locationList && locationList.states && locationList.states.length &&  locationList.states.filter( (item) =>item.HTCountryId===countryFilter)}
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
              sx={{ mt: -2,mr:-1 }}
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
              {/* <Grid item xl={2}
              md={2}
              xs={12}>
                <Button
                color="primary"
                // endIcon={<ChevronDownIcon fontSize="small" />}
                sx={{ ml: 2, p: 2 }}
                variant="contained"
              >
                Apply Filters
              </Button>
              </Grid>  */}
              <Grid item  xl={2}
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
                
                {reportData && reportData.map((item,index)=>{
                    return (
                <TableBody key={index}>
                    <TableRow >
                    <TableCell>
                     {item.firstName}           
                    </TableCell>
                    <TableCell>
                    {item.lastName}  
                    </TableCell>
                    <TableCell>
                    {(item.HTChildCurrentPlacementStatusId && childCurrentPlacementList) && childCurrentPlacementList.length && 
                      `${childCurrentPlacementList.find(item1 => item1.id === item.HTChildCurrentPlacementStatusId).currentPlacementStatus}`}
                    </TableCell>
                    <TableCell>
                    {item.location} 
                    </TableCell>
                    <TableCell>
                    {item.lastFollowUpDate}
                    </TableCell>
                    <TableCell>
                    <LaunchIcon fontSize="small"  onClick={(e)=>getInterventionDetails(e,item)}/>
                    </TableCell>  
                    </TableRow>      
                </TableBody>
                 )})}
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

        <Dialog aria-labelledby="simple-dialog-title" fullWidth maxWidth="sm" open={modalFlag}>
        <DialogTitle id="simple-dialog-title">{t('common:assessment.Intervention Details')}</DialogTitle>
        <DialogContent>
            <DialogContentText id="alert-dialog-description">
        
            <Grid
            container
            spacing={3}
            >
            <Box sx={{p:1}}>
        
            </Box>
            {interventionData.map((item,index)=>{
              return(
                <Card sx={{ mt: 2, ml: 2, width:1 }}>
                  <Box sx={{ ml: 2, pt:2}}>
                    <Typography display='inline' sx={{ fontWeight: 'bold'}} >
                    {t('common:common.Question')}:
                    </Typography>
                    <Typography display='inline' sx={{color: item.isRedFlagIntervention ? 'error.main' : 'text.primary'}}>
                    {' '+item.interventionQuestion}
                    </Typography>
                  </Box>
        
                  <Box sx={{ ml: 2}}>
                    <Typography display='inline' sx={{ fontWeight: 'bold'}} >
                    {t('common:common.Response')}:
                    </Typography>
                    <Typography display='inline'>
                    {' '+item.interventionResponse}
                    </Typography>
                  </Box>
        
                  <Box sx={{ ml: 2}}>
                    <Typography display='inline' sx={{ fontWeight: 'bold', mt: 2}} >
                    {t('common:common.Text Response')}:
                    </Typography>
                    <Typography display='inline'>
                    {' '+item.textResponse}
                    </Typography>
                  </Box>
        
                  <Box sx={{ ml: 2, pb:2}}>
                    <Typography display='inline' sx={{ fontWeight: 'bold', mt: 2}} >
                    {t('common:common.Other response')}:
                    </Typography>
                    <Typography display='inline' sx={{mb:3}}>
                    {' '+item.otherResponse}
                    </Typography>
                  </Box>
                </Card>
              )
            })}
        
            {interventionData.length === 0 &&
            <Card sx={{ mt: 2, ml: 2, width:1 }}>
              <Box sx={{ ml: 2, pt:2, pb:2}}>
                <Typography display='inline' sx={{ fontWeight: 'bold', mt: 2}} >
                  {t('common:common.No Details to Show')}
                </Typography>
              </Box>
            </Card>
            }
              
        
              
                  
            </Grid>
                        
        
                        
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={(e)=>setModalFlag(false)} color="primary" autoFocus>
              {t('common:common.Close')}
            </Button>
          </DialogActions>
        
        </Dialog>

        </>
        
    )
}

export default DisruptionCases;
