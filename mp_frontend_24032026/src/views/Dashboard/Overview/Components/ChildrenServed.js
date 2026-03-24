import { useState, useEffect, useContext } from "react";
import { useNavigate } from 'react-router-dom';
import {
  Box, 
  Button,
  Card,
  Divider,
  CircularProgress,
  Typography
} from '@mui/material';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { useTranslation } from 'react-i18next';
import { CommonDataContext } from "../../../../common/contexts/CommonDataContext";

const ChildrenServed = (props) => {
  const { t } = useTranslation(['common']);
  const { title, number, linkAddress, data, isloading, percentageData, ...other } = props
  const { signedinOrgType, signedinUserRole } = useContext(CommonDataContext);
  const navigate = useNavigate();
  const [currentRoute, setCurrentRoute] = useState('');
  const orgListlevel1 = ['1', '3', '4', '5'];
  const userListlevel1 = ['superadmin', 'admin', 'caseworker'];

  const handleNavigation = (linkData) => {
    if (linkData) {
      navigate(linkData, {
        state: {
          "fromDashboard": true
        }
      });
    }
    else {
      // do nothing 
    }
  }

  // const getChildServed = useCallback(async ( payload ) => {
  //   try {
  //     setLoading(true);
  //     const response = await APIS.ChildServedReport(payload);
  //     if(response && response.status === 200 && response.data.hasOwnProperty('dataCount')){
  //       setNumberToShow(response.data.dataCount)
  //       setLoading(false);
  //     }
  //   } catch (err) {
  //     console.error(err);
  //     setLoading(false);
  //   }
  // }, []);

  // const getRedFlagChildren = useCallback(async ( payload ) => {
  //   try {
  //     setLoading(true);
  //     const response = await APIS.ChildRedFlagReport(payload);
  //     if(response && response.status === 200 && response.data.hasOwnProperty('dataCount')){
  //       setNumberToShow(response.data.dataCount);
  //       if(response.data.hasOwnProperty('dataPercentage')){
  //         let value = parseFloat(response.data.dataPercentage).toFixed(2)
  //         if(value === 'NaN'){
  //           setPercentToShow(response.data.dataPercentage)
  //           setLoading(false);
  //         }else {
  //           setPercentToShow(parseFloat(response.data.dataPercentage).toFixed(2));
  //           setLoading(false);
  //         }
  //       }

  //     }
  //   } catch (err) {
  //     console.error(err);
  //     setLoading(false);
  //   }
  // }, []);

  // const getFollowupDuration = useCallback(async ( payload ) => {
  //   try {
  //     setLoading(true);
  //     const response = await APIS.FollowupDurationReport(payload);
  //     console.log(response)
  //     if(response && response.status === 200 && response.data.hasOwnProperty('dataCount')){
  //       setNumberToShow(parseFloat(response.data.averageNoOfDays))
  //       setLoading(false);
  //     }
  //   } catch (err) {
  //     console.error(err);
  //     setLoading(false);
  //   }
  // }, []);

  // const getChildrenOverdue = useCallback(async ( payload ) => {
  //   try {
  //     setLoading(true);
  //     const response = await APIS.ChildrenOverdueReport(payload);
  //     if(response && response.status === 200 && response.data.hasOwnProperty('dataCount')){
  //       setNumberToShow(parseFloat(response.data.dataCount))
  //       setLoading(false);
  //     }
  //   } catch (err) {
  //     console.error(err);
  //     setLoading(false);
  //   }
  // }, []);

  // const getDisruptionCases = useCallback(async ( payload ) => {
  //   try {
  //     setLoading(true);
  //     const response = await APIS.DisruptionCases(payload);
  //     if(response && response.status === 200 && response.data.hasOwnProperty('dataCount')){
  //       setNumberToShow(parseFloat(response.data.dataCount))
  //       setLoading(false);
  //     }
  //   } catch (err) {
  //     console.error(err);
  //     setLoading(false);
  //   }
  // }, []);

  // const getFamiliesServed = useCallback(async ( payload ) => {
  //   try {
  //     setLoading(true);
  //     const response = await APIS.FamiliesServed(payload);
  //     if(response && response.status === 200 && response.data.hasOwnProperty('dataCount')){
  //       setNumberToShow(parseFloat(response.data.dataCount))
  //       setLoading(false);
  //     }
  //   } catch (err) {
  //     console.error(err);
  //     setLoading(false);
  //   }
  // }, []);

  // const getCaseworkersServed = useCallback(async ( payload ) => {
  //   try {
  //     setLoading(true);
  //     const response = await APIS.CaseworkersServed(payload);
  //     if(response && response.status === 200 && response.data.hasOwnProperty('dataCount')){
  //       setNumberToShow(parseFloat(response.data.dataCount))
  //       setLoading(false);
  //     }
  //   } catch (err) {
  //     console.error(err);
  //     setLoading(false);
  //   }
  // }, []);

  // const getDurationInCCI = useCallback(async ( payload ) => {
  //   try {
  //     setLoading(true);
  //     const response = await APIS.DurationInCCI(payload);
  //     if(response && response.status === 200 && response.data.hasOwnProperty('averageNoOfDays')){
  //       setNumberToShow(parseFloat(response.data.averageNoOfDays))
  //       setLoading(false);
  //     }
  //   } catch (err) {
  //     console.error(err);
  //     setLoading(false);
  //   }
  // }, []);

  // useEffect(()=>{
  //   if(mounted){
  //     if(number === 1){
  //       getChildServed(payload);
  //     }else if (number === 2){
  //       getRedFlagChildren(payload);
  //     }else if (number === 3){
  //       getDisruptionCases(payload);
  //     }else if (number === 4){
  //       getFollowupDuration(payload);
  //     }else if (number === 5){
  //       getChildrenOverdue(payload)
  //     }else if (number === 6){
  //       getCaseworkersServed(payload)
  //     }else if (number === 7){
  //       getFamiliesServed(payload)
  //     }else if (number === 8){
  //       getDurationInCCI(payload)
  //     }
  //   }
  // },[payload])

  useEffect(() => {
    if (signedinOrgType !== null && signedinUserRole !== null) {
      let condition1 = !userListlevel1.includes(signedinUserRole);
      let condition2 = !orgListlevel1.includes(signedinOrgType);
      let condition3 = condition1 && condition2;
      let condition4 = [1, 2, 4, 5].includes(number)
      let condition5 = condition1 || condition2 || condition3
      if (condition4 && condition5) {
        setCurrentRoute('')
      } else {
        setCurrentRoute(linkAddress)
      }
    }
  }, [linkAddress, signedinOrgType, signedinUserRole])

  return (
    <Card {...other}>
      <Box
        sx={{
          // alignItems: 'center',
          display: 'flex',
          justifyContent: 'space-between',
          p: 3
        }}
      >
        <div>
          <Typography
            color="textPrimary"
            variant="subtitle2"
          >
            {title}
          </Typography>
          {!isloading ? <> {number === 2 ? <>
            <Typography
              color="textPrimary"
              sx={{ mt: 1 }}
              variant="h4"
              display="inline"
            >
              {data}
            </Typography>
            <Typography
              color="#bfb5b2"
              sx={{ float: 'right', mt: 1 }}
              variant="h5"
              display="inline"
            >
              {percentageData}%
            </Typography>
          </> : <Typography
            color="textPrimary"
            sx={{ mt: 1 }}
            variant="h4"
            display="inline"
          >
            {data}
          </Typography>}
          </> : <CircularProgress color="primary" sx={{ mt: 1 }} />}
        </div>

      </Box>
      <Divider />
      <Box
        sx={{
          px: 3,
          py: 2
        }}
      >
        <Button
          color="primary"
          endIcon={<ArrowForwardIcon fontSize="small" />}
          variant="text"
          disabled={currentRoute === ''}
          onClick={() => { handleNavigation(linkAddress) }}
        >
          {t('common:common.View Report')}
        </Button>
      </Box>
    </Card>
  )

}

export default ChildrenServed