import { useEffect,useContext,useState } from 'react';
import { Box, Button,  Container, Grid, TextField } from '@material-ui/core';
import DoneAllIcon from '@mui/icons-material/DoneAll';
import ClearIcon from '@mui/icons-material/Clear';
import {
  ReportsSocialMediaSources,
  ReportsTrafficSources,
} from './Components';
import useSettings from '../../../common/hooks/UseSettings';
import ChildrenServed from './Components/ChildrenServed';
import ChildStatus from './Components/ChildStatus';
import CurrentPlacement from './Components/CurrentPlacement';
import MapComponent from './Components/MapComponent';
import { CommonDataContext } from '../../../common/contexts/CommonDataContext';
import LocalizationProvider from '@mui/lab/LocalizationProvider';
import DateAdapter from '@mui/lab/AdapterDateFns';
import DatePicker from '@mui/lab/DatePicker';
// import ChildWithRedFlag from './Components/ChildWithRedFlag';
import { useTranslation } from 'react-i18next';
import _ from 'lodash';
import APIS from "../../../common/hooks/UseApiCalls"
import AutoCompleteDropdownToFilter from '../../../components/UserComponents/AutoCompleteDropdownToFilter';
import '../../../theme/fontSize.css';
import ProgressReportCard from './Components/ProgressReportCard';
// import Autocomplete from '@mui/material/Autocomplete';
const Overview = () => {
  const userRoleLevel1 = ['superadmin','admin','caseworker','viewonly'];
  const userRoleLevel2 = ['superadmin','admin','caseworker'];
  const userRoleLevel3 = ['superadmin','admin','viewonly'];
  // const userRoleLevel4 = ['superadmin','caseworker','viewonly'];
  const userRoleLevel5 = ['admin','caseworker','viewonly'];
  const beginningDate = new Date('2020-02-12');
  const endDateConst = new Date();
  const [startDate,setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  const getDate = (dateToFormat = null) => {
    let yourDate;
    if(dateToFormat=== null){
      return null;
    }else if(dateToFormat === '') {
      return dateToFormat
    }else {
      yourDate = new Date(dateToFormat)
    }
    const offset = yourDate.getTimezoneOffset()
    yourDate = new Date(yourDate.getTime() - (offset*60*1000))
    return yourDate.toISOString().split('T')[0]
  }

  const initialCommonPayload = {
    "rowCount": "100",
    "pageNumber": "1",
    "stateFilter": "",
    "districtFilter": "",
    "startDate": '',
    "endDate": ''
  }

  const { settings } = useSettings();
  const {locationList, getUserTokens, signedinUserRole,userRegion, languageChange} = useContext(CommonDataContext);
  const { t } = useTranslation(['common']);
  const [signedInUser, setSignedinUser] = useState(null);
  const [commonPayload, setCommonPayload] = useState(initialCommonPayload)
  const [stateData, setStateData] = useState('');
  const [tileData,setTileData]=useState('')
  const [districtData, setDistrictData] = useState('');
  const [countryData,setCountryData] = useState(localStorage.getItem('userRegion'))
  const[keyVal,setKeyVal]=useState(false)
  const [countryValueForApi,setCountryValueForApi] =useState(localStorage.getItem('userRegion'))
  const [loading,setLoading]=useState(false)
  //const currentLanguage = localStorage.getItem('language');

  const ClearFilters = () => {
    setStartDate(null);
    setEndDate(null);
    setDistrictData('');
    setCountryData(localStorage.getItem('userRegion'))
    setStateData('');
    setKeyVal(!keyVal);
    setCountryValueForApi(localStorage.getItem('userRegion'))
    let tempCommonpayload = _.cloneDeep(commonPayload);
    tempCommonpayload.stateFilter = '';
    tempCommonpayload.districtFilter = '';
    tempCommonpayload.countryFilter = countryData;
    tempCommonpayload.startDate = getDate(null);
    tempCommonpayload.endDate = getDate(null);
    localStorage.removeItem('dashboardFilters');
    if(tempCommonpayload !== commonPayload){
      setCommonPayload(tempCommonpayload);
    }
  }
  const ApplyFilters = () => {
    setCountryValueForApi(countryData)
    let tempCommonpayload = _.cloneDeep(commonPayload);
    tempCommonpayload.stateFilter = stateData;
    tempCommonpayload.districtFilter = districtData;
    tempCommonpayload.startDate = getDate(startDate);
    tempCommonpayload.endDate = getDate(endDate);
    tempCommonpayload.countryFilter = countryData;


    let dashboardFilters = {
      "countryFilter":countryData,
      "stateFilter": stateData,
      "districtFilter": districtData,
      "startDate": getDate(startDate),
      "endDate": getDate(endDate)
  }
  localStorage.setItem('dashboardFilters',JSON.stringify(dashboardFilters));
    if(tempCommonpayload !== commonPayload){
      setCommonPayload(tempCommonpayload);
    }
  }
  const handleStateChange=(value)=>{
    setStateData(value)
    setDistrictData('')
  }

  const handleCountryChange=(value)=>{
    setCountryData(value)
    setStateData('')
    setDistrictData('')
    setKeyVal(!keyVal)
  }

  useEffect(() => {
    return()=>{
      ClearFilters()
    }
  },[]);

  useEffect(() => {
    if(localStorage.getItem('userRegion')){
      setCountryData(localStorage.getItem('userRegion'))
      setKeyVal(!keyVal)
    }
  },[localStorage.getItem('userRegion')]);



  useEffect(() => {
    document.title = "Dashboard | Miracle Foundation"
    getUserTokens(); 
  }, []);
  
  useEffect(()=>{
    if(signedinUserRole !== null){
      setSignedinUser(signedinUserRole);
    }
    let savedDashboardFilter = localStorage.getItem('dashboardFilters')
    if (savedDashboardFilter !== null){
      let jsonbody = JSON.parse(savedDashboardFilter)
      setStartDate(jsonbody.startDate);
      setEndDate(jsonbody.endDate);
      setStateData(jsonbody.stateFilter);
      setDistrictData(jsonbody.districtFilter);
      setCountryData(jsonbody.countryFilter)

      let tempCommonpayload = _.cloneDeep(commonPayload);
      tempCommonpayload.stateFilter = jsonbody.stateFilter;
      setKeyVal(!keyVal)
      tempCommonpayload.districtFilter = jsonbody.districtFilter;
      tempCommonpayload.startDate = jsonbody.startDate;
      tempCommonpayload.endDate = jsonbody.endDate;
      if(tempCommonpayload !== commonPayload){
        setCommonPayload(tempCommonpayload);
      }
    }

  },[signedinUserRole])

  const getLocalPayload =()=>{
    let savedDashboardFilter = localStorage.getItem('dashboardFilters')
    if (savedDashboardFilter !== null){
      let jsonbody = JSON.parse(savedDashboardFilter)
      let tempCommonpayload = _.cloneDeep(commonPayload);
      tempCommonpayload.countryFilter = jsonbody.countryFilter;
      tempCommonpayload.stateFilter = jsonbody.stateFilter;
      setKeyVal(!keyVal)
      tempCommonpayload.districtFilter = jsonbody.districtFilter;
      tempCommonpayload.startDate = jsonbody.startDate;
      tempCommonpayload.endDate = jsonbody.endDate;
      if(tempCommonpayload !== commonPayload){
       return tempCommonpayload
      }

    }

  }


  useEffect(async()=>{
    try {
      if (localStorage.getItem('userRegion')) {
        let payload = localStorage.getItem('dashboardFilters') ? getLocalPayload() : initialCommonPayload
        setLoading(true);
        payload.HTCountryId = countryData
        const response = await APIS.DashboardTileData(payload);
        if (response && response.status === 200) {
          // console.log(response?.data?.data)
          setTileData(response?.data?.data)
          // setNumberToShow(parseFloat(response.data.dataCount))
          setLoading(false);
        }
      }else{
        return
      }
    }
     catch (err) {
      console.error(err);
      setLoading(false);
    }
  },[localStorage.getItem('userRegion')])

  useEffect(async()=>{
    try {
      if (localStorage.getItem('userRegion')) {
        let payload = localStorage.getItem('dashboardFilters') ? getLocalPayload() : initialCommonPayload
        setLoading(true);
        payload.HTCountryId = countryData
        const response = await APIS.DashboardTileData(payload);
        if (response && response.status === 200) {
          // console.log(response?.data?.data)
          setTileData(response?.data?.data)
          // setNumberToShow(parseFloat(response.data.dataCount))
          setLoading(false);
        }
      }else{
        return
      }
    }
     catch (err) {
      console.error(err);
      setLoading(false);
    }
  },[commonPayload])

  // useEffect(async()=>{
  //   try {
  //       let payload = localStorage.getItem('dashboardFilters')?getLocalPayload():initialCommonPayload
  //       setLoading(true);
  //       const response = await APIS.DashboardTileData(payload);
  //       if(response && response.status === 200){
  //        // console.log(response?.data?.data)
  //         setTileData(response?.data?.data)
  //         // setNumberToShow(parseFloat(response.data.dataCount))
  //         setLoading(false);
  //       }
  //     }
  //    catch (err) {
  //     console.error(err);
  //     setLoading(false);
  //   }
  // },[userRegion])


  return (
    <>
      <Box
        sx={{
          backgroundColor: 'background.default',
          minHeight: '100%',
          py: 3
        }}
      >
        <Container maxWidth={settings.compact ? 'xl' : false}>
          <Grid 
            container
            spacing={1}
            sx={{pt:3}}
            >
              
            <LocalizationProvider dateAdapter={DateAdapter}>
              {/* <Grid item xl={2}
              md={2}
              cs={12}>
                <Button
                endIcon={<UploadIcon fontSize="small" />}
                variant="outlined"
              >
                Export
              </Button>

              </Grid> */}
              <Grid item xl={2}
              md={2}
              xs={12}>
                <DatePicker
                    label={t('common:common.StartDate')}
                    value={startDate}
                    minDate={beginningDate}
                    maxDate={endDate}
                    format="dd/MM/yyyy"
                    inputFormat = "dd/MM/yyyy"
                    onChange={(newValue) => {
                    setStartDate(newValue)
                    }}
                    renderInput={(params) => <TextField fullWidth {...params} />}
                    />

              </Grid>
              <Grid item
                xl={2}
                md={2}
                xs={12}>
                  <DatePicker
                   label={t('common:common.EndDate')}
                    // defaultValue={endDate}
                    minDate={startDate}
                    maxDate={endDateConst}
                    value={endDate}
                    format="dd/MM/yyyy"
                    inputFormat = "dd/MM/yyyy"
                    onChange={(newValue) => {
                    setEndDate(newValue);
                    }}
                    renderInput={(params) => <TextField fullWidth {...params} />}
                    />
              </Grid>
              {signedinUserRole ==='superadmin' && <Grid
                  item
                  xl={2}
                  md={2}
                  xs={12}
                  sx={{ mt: -2 }}
                >
                <TextField                
                  fullWidth                
                  name="country"
                  accessKey="countryName"
                  getValueFunction={(value)=>{handleCountryChange(value)}}
                  component={AutoCompleteDropdownToFilter}
                  value={countryData}
                  required={true}
                  key={keyVal}
                  defaultVal={countryData}
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
               <Grid
                  item
                  xl={2}
                  md={2}
                  xs={12}
                  sx={{ mt: -2 }}
                >
                <TextField                
                  fullWidth                
                  name="state"
                  accessKey="stateName"
                  getValueFunction={(value)=>{handleStateChange(value)}}
                  component={AutoCompleteDropdownToFilter}
                  value={stateData}
                  required={true}
                  key={keyVal}
                  defaultVal={stateData}
                  label="state"
                  options={locationList && locationList.states && locationList.states.length &&  locationList.states.filter( (item) =>item.HTCountryId===(signedinUserRole ==='superadmin'?countryData:localStorage.getItem('userRegion')))}
                  textFieldProps={{
                  fullWidth: true,
                    margin: "normal",
                    variant: "outlined",
                    label:t('common:common.State/Region')
                 }}
           
                />
                </Grid>
              
              <Grid
                  item
                  xl={2}
                  md={2}
                  xs={12}
                  sx={{ mt: -2 }}
                >
                <TextField                
                  fullWidth                
                  name="district"
                  accessKey="districtName"
                  value={districtData}
                  key={stateData}
                  defaultVal={districtData}
                  getValueFunction={(value)=>{setDistrictData(value)}}
                  component={AutoCompleteDropdownToFilter}
                  required={true}
                  label="district"
                  options={locationList && locationList.districts && locationList.districts.length &&  locationList.districts.filter( (item) =>item.HTStateId===stateData)}
                  textFieldProps={{
                  fullWidth: true,
                    margin: "normal",
                    variant: "outlined",
                    label:t('common:common.District/County')
                 }}
           
                />
                </Grid> 
                
             <Grid item xl={signedinUserRole ==='superadmin'?2:3}
              md={signedinUserRole ==='superadmin'?2:3}
              xs={12}
              sx={{mt:0.5}}
              >
                <Button
                color="primary"
                sx={{ height: 40,pb: 3,pt:3}}
                variant="contained"
                onClick={ApplyFilters}
              >
                {signedinUserRole==='superadmin' ?<DoneAllIcon />: <label>{t('common:common.Apply Filters')}</label>}
              </Button> 
              <Button
                color="primary"
                //sx={{ ml: 2, p: 2 }}
                sx={{height: 40,ml:1,pb: 3,pt:3}}
                variant="contained"
                onClick={ClearFilters}
              >
                 {signedinUserRole==='superadmin' ?<ClearIcon />: <label>{t('common:common.Clear Filters')}</label>}
                
              </Button>
              </Grid>
            </LocalizationProvider>
          </Grid>
          <Grid
            container
            spacing={3}
            sx={{pt : 3, alignItems:"flex-start"}} 
          >
            <Grid item spacing={3} sx={{pt : 3}} container xl={9} md={9} xs={12} > {/*left side colum */}
            {signedInUser && userRoleLevel1.includes(signedInUser) && (
              <Grid item md={4} sm={12} xs={12} >
                <ChildrenServed 
                title={t('common:common.ChildrenServed')} 
                number={1} 
                data={tileData?.childrenServed}
                isloading={loading}
                linkAddress={'/dashboard/reportsChildServed'} />
              </Grid>
            )}
            {signedInUser && userRoleLevel1.includes(signedInUser) && (
            <Grid item md={4} sm={12} xs={12} >
            <ChildrenServed 
            title={t('common:common.RedFlags')} 
            data={tileData?.redflagCount}
            percentageData={tileData?.redFlagPercent}
            number={2} 
            isloading={loading}
            linkAddress={'/dashboard/reportsChildRedFlag'} />
            </Grid>)}
            {signedInUser && userRoleLevel1.includes(signedInUser) && (
            <Grid item md={4} sm={12} xs={12} >
            <ChildrenServed 
            title={t('common:common.DisruptionCases')} 
            data={tileData?.disruptionCase}
            number={3} 
            isloading={loading}
            linkAddress={'/dashboard/disruptionCases'} />
            </Grid>)}
            {signedInUser && userRoleLevel1.includes(signedInUser) && (<Grid
              item
              xl={12}
              md={12}
              xs={12}
            >
              <ReportsTrafficSources payload={commonPayload} languageValue={languageChange} title={t('common:common.Average Thrive Scores')} chartData1={'chartData'} sx={{ height: '100%' }} />
            </Grid>)}
            {signedInUser && userRoleLevel3.includes(signedInUser) && (<Grid
              item
              xl={12}
              md={12}
              xs={12}
            >
              <ReportsTrafficSources payload={commonPayload} languageValue={languageChange} title={t('common:common.Newly Added Children')} chartData1={'dataTemplate'} sx={{ height: '100%' }} /> 
            </Grid>)}
            {signedInUser && userRoleLevel1.includes(signedInUser) && (<Grid
              item
              xl={12}
              md={12}
              xs={12}
            >
              <ReportsTrafficSources payload={commonPayload} languageValue={languageChange} title={t('common:common.Children in CCI')} chartData1={'data'} sx={{ height: '100%' }} /> 
            </Grid>)}
            {signedInUser && userRoleLevel1.includes(signedInUser) && (<Grid
              item
              xl={12}
              md={12}
              xs={12}
            >
              <ReportsTrafficSources payload={commonPayload} languageValue={languageChange} title={t('common:common.No of Children Reintegrated')} chartData1={'data1'} sx={{ height: '100%' }} /> 
            </Grid>)}
            {signedInUser && userRoleLevel3.includes(signedInUser) && (<Grid
              item
              xl={12}
              lg={12}
              md={12}
              xs={12}
            >
              <MapComponent countryData = {countryValueForApi} mapCategory={'child'}/>
            </Grid>)}
            {signedInUser && userRoleLevel3.includes(signedInUser) && (<Grid
              item
              xl={12}
              lg={12}
              md={12}
              xs={12}
            >
              <MapComponent countryData = {countryValueForApi} mapCategory={'org'}/>
            </Grid>)}

            </Grid>
            <Grid item spacing={3} container xl={3} md={3} xs={12} >   {/*Right side colum */}
            {signedInUser && (signedInUser === 'superadmin' || signedInUser === 'admin') && (
            <><Grid xl={12} item md={12} sm={12} xs={12}>
            <ChildrenServed  
              title={t('common:common.Days of Followup')} 
              data={tileData?.followupDurations?.averageNoOfDays}
              isloading={loading}
              number={4} 
              linkAddress={'/dashboard/reportsDaysofFollowup'} />
            </Grid>
            <Grid xl={12} item md={12} sm={12} xs={12}>
            <ProgressReportCard  
              title={t('common:common.Progress Report Detailed View')} 
            />
            </Grid></>
            )}
            {signedInUser && userRoleLevel2.includes(signedInUser) && (
            <Grid xl={12} item md={12} sm={12} xs={12}>
              <ChildrenServed 
              title={t('common:common.Children Overdue')} 
              data={tileData?.childrenOverdue}
              isloading={loading}
              number={5} 
              linkAddress={'/dashboard/reportsChildrenOverdue'} />
            </Grid>
            )}
            {signedInUser && userRoleLevel3.includes(signedInUser) && (
            <Grid xl={12} item md={12} sm={12} xs={12}>
            <ChildrenServed  
            title={t('common:common.Case workers Served')} 
            data={tileData?.caseWorkerServed}
            isloading={loading}
            number={6} 
            linkAddress={''} />
            </Grid>
            )}
            {signedInUser && userRoleLevel1.includes(signedInUser) && (
            <Grid xl={12} item md={12} sm={12} xs={12}>
            <ChildrenServed 
            title={t('common:common.Families Served')} 
            data={parseInt(tileData?.familyServed)}
            isloading={loading}
            number={7} 
            linkAddress={''} />
            </Grid>
            )}
            {signedInUser && userRoleLevel3.includes(signedInUser) && (
            <Grid xl={12} item md={12} sm={12} xs={12}>
            <ChildrenServed data={tileData?.cciDurations?tileData?.cciDurations[0]?.averageNoOfDays:[]} 
            title={t('common:common.Duration in CCI')} 
            isloading={loading}
            number={8} 
            linkAddress={'/dashboard/durationInCCI'} />
            </Grid>)}
            {signedInUser && userRoleLevel2.includes(signedInUser) && (
            <Grid
              item
              xl={12}
              md={12}
              xs={12}
            >
              <ReportsSocialMediaSources data={1} title={t('common:common.Children in Case Management')} res={tileData?.childInCaseManagement?tileData?.childInCaseManagement[0]:[]} payload={commonPayload}/>
            </Grid>)}
            {signedInUser && userRoleLevel5.includes(signedInUser) && (<Grid
              item
              xl={12}
              md={12}
              xs={12}
            >
              <ChildStatus data={2} title={t('common:common.Child Status')} res={tileData?.childStatus?tileData?.childStatus[0]:[]} payload={commonPayload}/>
            </Grid>)}
            {signedInUser && userRoleLevel1.includes(signedInUser) && (<Grid
              item
              xl={12}
              md={12}
              xs={12}
            >
              <CurrentPlacement data={3} title={t('common:common.Current Placement')} res={tileData?.childPlacement?tileData?.childPlacement[0]:[]} payload={commonPayload}/>
            </Grid>)}
            </Grid>
            
            
            {/* {signedInUser && signedInUser === 'viewonly' && (
              <Grid item
              md={3}
              sm={6}
              xs={12}>
              </Grid>
            )} */}

            
            
            
            
            
            
            
            
            
          </Grid>
        </Container>
      </Box>
    </>
  );
};

export default Overview;
