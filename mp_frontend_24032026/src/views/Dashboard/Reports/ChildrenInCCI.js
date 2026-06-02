import {React,useState,useEffect,useContext,useCallback} from 'react'
import { useNavigate, useLocation } from 'react-router-dom';
import { Box,Container, Grid, Typography,CircularProgress,Table,Card, 
    // MenuItem,
    Button,
    TextField,
    TableBody,
    TableCell,
    TableHead,
    TableRow, Pagination, IconButton } from '@material-ui/core';
import Scrollbar from '../Components/ScrollBar';
import useSettings from '../../../common/hooks/UseSettings';
import { useTranslation } from 'react-i18next';
import APIS from '../../../common/hooks/UseApiCalls';
import { CommonDataContext } from '../../../common/contexts/CommonDataContext';
import LocalizationProvider from '@mui/lab/LocalizationProvider';
import DateAdapter from '@mui/lab/AdapterDateFns';
import DatePicker from '@mui/lab/DatePicker';
import moment from 'moment';
import ChevronLeftIcon from '../../../assets/icons/ChevronLeft';
import toast from 'react-hot-toast';
import UploadIcon from '../../../assets/icons/Upload';
import AutoCompleteDropdownToFilter from '../../../components/UserComponents/AutoCompleteDropdownToFilter'
function ChildrenInCCI() {
    const location = useLocation();
    const fromDashboard = location.state && location.state.fromDashboard
    let dashboardFilter =localStorage.getItem('dashboardFilters');
    let initialData = fromDashboard=== true ? JSON.parse(dashboardFilter): null;
    const navigate = useNavigate();
    const [startDate, setStartDate] = useState(initialData === null ? null :initialData.startDate);
    const [endDate, setEndDate] = useState(initialData === null ? null :initialData.endDate);
    const [reportData, setReportData] = useState();
    const {locationList, childPlacementList} = useContext(CommonDataContext);
    const [pageCount, setPageCount] = useState(1);
    const { settings } = useSettings();
    const [loading,setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const { t } = useTranslation(['common']);
    const [stateFilter, setStateFilter] = useState(initialData === null ? "" :initialData.stateFilter);
    const [districtFilter, setDistrictFilter] = useState(initialData === null ? "" :initialData.districtFilter);
    const [payloadData, setPayloadData] = useState({});
    const [isExportDisabled, setIsExportDisabled] = useState(true);
    const[keyVal,setKeyVal]=useState(false)
  const ClearFilters = () => {
    setDistrictFilter('');
    setStateFilter('')
    setStartDate(null);
    setEndDate(null);
    setKeyVal(!keyVal)
    getNewlyAddedChildrenApi(null);
    
  }
    const handlePageChange = (event, value) => {
        getNewlyAddedChildrenApi({
          "pageNumber": value,
          //  "orgTypeFilter" : typeFilter,
          //   "orgStatus" : statusFilter
        })
        setPage(value);
      }
      const handleStateFilter = (value) => {
          console.log(value);
        let payload = {
          "districtFilter" : districtFilter,
          "pageNumber" : "1",
          "rowCount": "10",
          "stateFilter" : value,
          "startDate": startDate,
          "endDate": endDate
        }
        getNewlyAddedChildrenApi(payload)
        setStateFilter(value);
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
        "endDate": endDate
      }
      getNewlyAddedChildrenApi(payload)
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
          "endDate": enddateformat
          }
          getNewlyAddedChildrenApi(payload)
        
    }
      let tableHead = [
        {name : t('common:common.FirstName')},
        {name : t('common:common.LastName')},
        {name : t('common:common.Age')},
        {name : t('common:common.Gender')},
        {name : t('common:common.Date of Entry')},
        {name : t('common:common.Placement Status')},
        {name : t('common:common.Last Thrive Scale Score')},
        {name : t('common:common.Next Assessment Date')},
    ]
    const defaultPayload={
        "rowCount": "10",
        "pageNumber": "1",
        "stateFilter": "",
        "districtFilter": "",
        "startDate": "",
        "endDate": ""
    }
    let payloadAddon={
        "rowCount": "10",
        "pageNumber": "1",
        "stateFilter": "",
        "districtFilter": "",
        "startDate": "",
        "endDate": ""
    }
  useEffect(() => {
    document.title = "Reports | Children in CCI | Miracle Foundation"
    if (initialData === null) {
      if(localStorage.getItem('userRegion')){
        getNewlyAddedChildrenApi();
      }else{
        return
      }
    }
    else if (initialData) {
      if(localStorage.getItem('userRegion')){
        let payload = {
          "rowCount": "10",
          "pageNumber": "1",
          "stateFilter": initialData.stateFilter,
          "districtFilter": initialData.districtFilter,
          "startDate": initialData.startDate,
          "endDate": initialData.endDate
        }
        getNewlyAddedChildrenApi(payload);
      }else{
        return
      }
     
    }
  }, [])


  useEffect(() => {
    //document.title = "Reports | Children in CCI | Miracle Foundation"
    if (initialData === null) {
      if(localStorage.getItem('userRegion')){
        getNewlyAddedChildrenApi();
      }else{
        return
      }
      
    }
    else if (initialData) {
      if(localStorage.getItem('userRegion')){
        let payload = {
          "rowCount": "10",
          "pageNumber": "1",
          "stateFilter": initialData.stateFilter,
          "districtFilter": initialData.districtFilter,
          "startDate": initialData.startDate,
          "endDate": initialData.endDate
        }
        getNewlyAddedChildrenApi(payload);
      }else{
        return
      }
     
    }
  }, [localStorage.getItem('userRegion')])


    useEffect(() => {
        handleDateFilter();
    }
       , [startDate,endDate])
    const getNewlyAddedChildrenApi= useCallback(async(payload=null)=>{
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
            if(payload === null){
            finalPayload = defaultPayload
            } 
            else {
                finalPayload = { ...payloadAddon, ...payload};
                payloadAddon = { ...finalPayload }
            }
            console.log("final payload >>",finalPayload)
            finalPayload.HTCountryId = localStorage.getItem('userRegion')
            setPayloadData(finalPayload)
            await APIS.ChildrenInCCI(finalPayload).then((resp)=>{
                if(resp && resp.data){
                    setReportData(resp.data.data);
                    setLoading(false);
                   
                    setPageCount(resp.data && resp.data.pageCount)
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
          "subModuleType": "currentCciResident",
         }
        finalPayload={...payloadData,...payload}
        finalPayload.HTCountryId = localStorage.getItem('userRegion')
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
                    {t('common:common.Children in CCI')}

                </Typography>
                </Grid>
                <Grid item >
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
              <Grid item xl={2.2}
              md={2.2}
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
                  label="state"
                  options={locationList && locationList.states && locationList.states.length &&  locationList.states.filter( (item) =>item.HTCountryId===localStorage.getItem('userRegion'))}
                  textFieldProps={{
                  fullWidth: true,
                    margin: "normal",
                    variant: "outlined",
                    label:t('common:common.State/Region')
                 }}
           
                />
              {/* <TextField
                fullWidth
                label={t('common:common.State/Region')}
                name="state"
                select
                onChange={handleStateFilter}
                value={values.state}
                variant="outlined"
                  >
                     {locationList && locationList.states && locationList.states.length &&  locationList.states.filter((item) =>item.HTCountryId==='1')
                      .map((item)=>{
                        return(
                        <MenuItem key={item.id} value={item.id}>{item.stateName}</MenuItem>
                        );}
                    )}
                    </TextField> */}
              </Grid>
              <Grid item xl={2.2}
              md={2.2}
              xs={5}
              sx={{ mt: -2,mx:-1 }}
              >
               <TextField                
                  fullWidth                
                  name="district"
                  accessKey="districtName"
                  key={stateFilter}
                  value={districtFilter}
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
              {/* <TextField
                    fullWidth
                    label={t('common:common.District/County')}
                    name="district"
                    onChange={handleDistrictFilter}
                    value={values.district}
                    variant="outlined"
                    select
                    >
                     {locationList && locationList.districts && locationList.districts.length &&  locationList.districts.filter( (item) =>item.HTStateId===stateFilter)
                      .map((item)=>{
                      return(
                      <MenuItem key={item.id} value={item.id}>{item.districtName}</MenuItem>
                      );
                    }
                    )}
                  </TextField> */}
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
              <Grid item  xl={4}
              md={4}
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
                      {item.age}           
                      </TableCell>
                      <TableCell>
                      {item.gender}           
                      </TableCell>
                      <TableCell>
                      {item.dateOfEntry}           
                      </TableCell>
                      <TableCell>
                      { childPlacementList && childPlacementList.length && 
                      `${childPlacementList.find(item1 => item1.id === item.HTChildPlacementStatusId).placementStatus}`}   
                      </TableCell>
                      <TableCell>
                      {item.lastThriveScaleScore}           
                      </TableCell>
                      <TableCell>
                      {item.nextVisitDate}  
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
        
    )
}

export default ChildrenInCCI;
