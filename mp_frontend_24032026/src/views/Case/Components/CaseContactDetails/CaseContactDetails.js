import { useState, useEffect,useContext } from 'react';
import PropTypes from 'prop-types';
import {
  Box,
  Card,
  CardHeader,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableRow,
  Typography
} from '@material-ui/core';
import Label from '../../../../components/Label';
// import LockIcon from '../../../../assets/icons/Lock';
// import UserIcon from '../../../../assets/icons/User';
import { customerApi } from '../../../../__fakeApi__/customerApi'; 
import { CommonDataContext } from '../../../../common/contexts/CommonDataContext';
import { useTranslation } from 'react-i18next';

const CaseContactDetails = (props) => {
  const { id, 
    caseid,
    caseManager,
    child,
    status, 
     ...other } = props;
  const { t } = useTranslation(['common']);  
  const [typesData, setTypesData] = useState([]);
  const { userList } = useContext(CommonDataContext); 

  useEffect(() => {
    // getLocationsFromAPI();
    getTypesFromAPI();
    return () => {
    }
  },[]);

  // const getDate = (dateString) => {
  //   let yourDate = new Date(dateString)
  //   // yourDate.toISOString().split('T')[0];
  //   const offset = yourDate.getTimezoneOffset()
  //   yourDate = new Date(yourDate.getTime() - (offset*60*1000))
  //   return yourDate.toISOString().split('T')[0]
  // }

  // const getAge = (datestring) => {
  //   let startDate = new Date(datestring);
  //   let endDate = new Date();
  //   let diffYear =(startDate.getTime() - endDate.getTime()) / 1000;
  //      diffYear /= (60 * 60 * 24);
  //     return Math.abs(Math.round(diffYear/365.25));

  // }

  // const getLocationsFromAPI = async () => {
  //   try {
  //     const data = await customerApi.getLocations();
  //     setStateData([...data.states]);
  //     setCountryData([...data.countries]);
  //     setDistrictData([...data.districts]);
  //   } catch (err) {
  //     console.error(err);
  //   }
  // }
  const getTypesFromAPI = async () => {
    try {
      const data = await customerApi.getOrganizationType(); 
      setTypesData([...data.organisationTypes]);
    } catch (err) {
      console.error(err);
    }
  }
   if(typesData.length ) {

    return (
      < Card {...other}>
        <CardHeader title={t('common:common.Details')}/>
        <Divider />
        <Table>
          <TableBody>
          <TableRow>
              <TableCell>
                <Typography
                  color="textPrimary"
                  variant="subtitle2"
                >
                  {t('common:child.Case ID')}
                </Typography>
              </TableCell>
              <TableCell>
                <Typography
                  color="textSecondary"
                  variant="body2"
                >
                  {/* {caseid} */}
                  {`CASE-${id}`}
                </Typography>
              </TableCell>
            </TableRow>
          <TableRow>
              <TableCell>
                <Typography
                  color="textPrimary"
                  variant="subtitle2"
                >
                  {t('common:common.Case Worker')}
                </Typography>
              </TableCell>
              <TableCell>
                <Typography
                  color="textSecondary"
                  variant="body2"
                >
                  {(caseManager && userList) && userList.length && 
                    (userList.find(item => item.id === caseManager) ?
                    `${userList.find(item => item.id === caseManager)?.firstName} ${userList.find(item => item.id === caseManager)?.lastName}` : '-') }
                </Typography>
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell sx={{width : 450}}>
                <Typography
                  color="textPrimary"
                  variant="subtitle2"
                >
                  {t('common:common.Child')}
                </Typography>
              </TableCell>
              <TableCell>
                <Box sx={{display : "flex",flexDirection : "row"}}>
                <Typography
                  color="textSecondary"
                  variant="body2"
                > 
                {child}
                </Typography>
                </Box>
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell sx={{width : 450}}>
                <Typography
                  color="textPrimary"
                  variant="subtitle2"
                >
                  {t('common:common.Status')}
                </Typography>
              </TableCell>
              <TableCell>
                <Box sx={{display : "flex",flexDirection : "row"}}> 
                <Label color={status === 'Open' ? 'success' : 'error'} >
                  {t(`common:common.${status}`)}
                </Label>
                </Box>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
  
      </Card>
    );
   }
  
  else {
    return(
      <div>
        
      </div>
    );
  }
};

CaseContactDetails.propTypes = {
  id: PropTypes.string,
  caseManager: PropTypes.string,
  child: PropTypes.string,
};

export default CaseContactDetails;
